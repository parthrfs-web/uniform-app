import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { File as ExpoFile } from 'expo-file-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette } from '@/constants/palette';
import { useAppData } from '@/contexts/app-data';
import { calculateNewExcessCases } from '@/services/entitlement';
import { parseWorkbookAuto, readWorkbook } from '@/services/excel-import';
import { DistributionRecord, Employee, ExcessCase, ImportIssue } from '@/types/domain';

export default function ImportScreen() {
  const { importEmployees, importDistributions, employees, policies, distributionRecords, isDuplicateFile } = useAppData();
  const [fileName, setFileName] = useState('');
  const [fingerprint, setFingerprint] = useState('');
  const [employeeRows, setEmployeeRows] = useState<Employee[]>([]);
  const [distributionRows, setDistributionRows] = useState<DistributionRecord[]>([]);
  const [issues, setIssues] = useState<ImportIssue[]>([]);
  const [sheetSummaries, setSheetSummaries] = useState<string[]>([]);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  const rowCount = employeeRows.length + distributionRows.length;

  function reset() {
    setFileName('');
    setFingerprint('');
    setEmployeeRows([]);
    setDistributionRows([]);
    setIssues([]);
    setSheetSummaries([]);
    setStatus('');
  }

  async function chooseFile() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
          'text/csv',
        ],
        copyToCacheDirectory: true,
        base64: false,
      });
      if (result.canceled) return;

      setBusy(true);
      const asset = result.assets[0];
      setFileName(asset.name);
      setStatus('Reading workbook...');

      const fileFingerprint = `${asset.name}-${asset.size || 0}`;

      await waitForUi();
      const buffer = asset.file ? await asset.file.arrayBuffer() : await new ExpoFile(asset.uri).arrayBuffer();
      setStatus('Scanning sheets and detecting columns...');
      await waitForUi();
      const workbook = readWorkbook(buffer);
      setFingerprint(fileFingerprint);

      const parsed = parseWorkbookAuto(workbook, asset.name);
      setSheetSummaries(parsed.sheetSummaries);

      // Validate distributions against policies and existing records
      setStatus('Checking yearly limits...');
      await waitForUi();
      const newIds = new Set(parsed.distributions.map((r) => r.id));
      const combined = [...distributionRecords, ...parsed.distributions];
      const validation = calculateNewExcessCases(combined, newIds, employees, policies);
      const distributionIssues = [
        ...validation.issues.map((msg) => ({ row: -1, message: msg })),
      ];

      // If the file looks like a distribution file and has already been imported, warn now and keep distributionRows empty.
      if (parsed.distributions.length > 0 && (await isDuplicateFile(fileFingerprint))) {
        Alert.alert('Duplicate file', 'This distribution file has already been imported. Distribution rows will be skipped.');
        setDistributionRows([]);
      } else {
        setDistributionRows(parsed.distributions);
      }

      setEmployeeRows(parsed.employees);
      setIssues([...parsed.issues, ...distributionIssues]);
      setStatus('');
    } catch (error) {
      Alert.alert('Could not read file', error instanceof Error ? error.message : 'Please select a valid Excel file.');
      reset();
    } finally {
      setBusy(false);
    }
  }

  async function confirmImport() {
    setBusy(true);
    try {
      let imported = 0;
      let duplicates = 0;
      let newCases: ExcessCase[] = [];
      let calculationIssues: string[] = [];

      if (employeeRows.length > 0) {
        const out = await importEmployees(employeeRows);
        imported += out.imported;
        duplicates += out.duplicates;
        newCases = newCases.concat(out.newCases);
        calculationIssues = calculationIssues.concat(out.calculationIssues);
      }

      if (distributionRows.length > 0) {
        // Double-check duplicate import for distributions
        if (await isDuplicateFile(fingerprint)) {
          Alert.alert('Duplicate file', 'This distribution file has already been imported. Skipping distribution rows.');
        } else {
          const out = await importDistributions(distributionRows, { fileName, fingerprint });
          imported += out.imported;
          duplicates += out.duplicates;
          newCases = newCases.concat(out.newCases);
          calculationIssues = calculationIssues.concat(out.calculationIssues);
        }
      }

      const excessMessage = newCases.length
        ? `\n\n${newCases.length} new excess case(s) were detected in the month the limit was crossed.`
        : '';
      const policyMessage = calculationIssues.length
        ? `\n\n${calculationIssues.length} row group(s) need a matching employee or unit policy.`
        : '';

      Alert.alert(
        'Import complete',
        `${imported} rows imported. ${duplicates} duplicate rows skipped.${excessMessage}${policyMessage}`,
        [{ text: 'Done', onPress: () => router.back() }],
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={21} color={palette.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Import Excel data</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Choose any Excel workbook</Text>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={22} color={palette.blue} />
          <View style={styles.infoCopy}>
            <Text style={styles.infoTitle}>Auto-detect import</Text>
            <Text style={styles.infoText}>The app scans all sheets and finds employee rows or uniform issue rows automatically.</Text>
            <Text style={styles.ruleText}>
              It can read normal rows or month-wise sheets with item columns like Shirt, Pant, Shoes. For monthly sheets without a Date column, put the month in the sheet name, for example August 2026.
            </Text>
          </View>
        </View>

        <Pressable style={styles.upload} onPress={chooseFile} disabled={busy}>
          {busy ? (
            <>
              <ActivityIndicator color={palette.blue} />
              <Text style={styles.uploadTitle}>{status || 'Processing workbook...'}</Text>
              <Text style={styles.uploadText}>Please keep this screen open.</Text>
            </>
          ) : (
            <>
              <View style={styles.uploadIcon}><Ionicons name="cloud-upload-outline" size={30} color={palette.blue} /></View>
              <Text style={styles.uploadTitle}>{fileName || 'Choose Excel sheet'}</Text>
              <Text style={styles.uploadText}>Supports .xlsx, .xls and .csv files</Text>
              <View style={styles.browseButton}><Text style={styles.browseText}>{fileName ? 'Choose another' : 'Browse files'}</Text></View>
            </>
          )}
        </Pressable>

        {!!fileName && (
          <>
            <View style={styles.summaryRow}>
              <Summary value={rowCount} label="Valid rows" color={palette.green} />
              <Summary value={issues.length} label="Rows with errors" color={issues.length ? palette.red : palette.muted} />
            </View>

            {!!sheetSummaries.length && (
              <>
                <Text style={styles.sectionTitle}>Detected sheets</Text>
                <View style={styles.previewCard}>
                  {sheetSummaries.slice(0, 5).map((summary) => (
                    <View key={summary} style={styles.summaryLine}>
                      <Ionicons name="grid-outline" size={16} color={palette.blue} />
                      <Text style={styles.summaryText}>{summary}</Text>
                    </View>
                  ))}
                  {sheetSummaries.length > 5 && <Text style={styles.moreRows}>+ {sheetSummaries.length - 5} more sheets</Text>}
                </View>
              </>
            )}

            <Text style={styles.sectionTitle}>Preview</Text>
            <View style={styles.previewCard}>
              {([...distributionRows, ...employeeRows]).slice(0, 5).map((row) => {
                if ('employeeCode' in row) {
                  return (
                    <View key={row.id} style={styles.previewRow}>
                      <View style={styles.rowIcon}><Ionicons name="shirt-outline" size={18} color={palette.blue} /></View>
                      <View style={styles.previewCopy}>
                        <Text style={styles.previewTitle}>{row.employeeCode} · {row.itemName}</Text>
                        <Text style={styles.previewMeta}>{row.issuedAt} · Quantity {row.quantity}</Text>
                      </View>
                    </View>
                  );
                }
                return (
                  <View key={row.id} style={styles.previewRow}>
                    <View style={styles.rowIcon}><Ionicons name="person-outline" size={18} color={palette.blue} /></View>
                    <View style={styles.previewCopy}>
                      <Text style={styles.previewTitle}>{row.code} · {row.name}</Text>
                      <Text style={styles.previewMeta}>{row.unitName} · {row.status}</Text>
                    </View>
                  </View>
                );
              })}
              {rowCount > 5 && <Text style={styles.moreRows}>+ {rowCount - 5} more valid rows</Text>}
            </View>

            {!!issues.length && (
              <>
                <Text style={styles.sectionTitle}>Rows to fix</Text>
                <View style={styles.issueCard}>
                  {issues.slice(0, 5).map((issue) => (
                    <View key={`${issue.row}-${issue.message}`} style={styles.issueRow}>
                      <Text style={styles.issueNumber}>{issue.row > 0 ? `Row ${issue.row}` : 'Error'}</Text>
                      <Text style={styles.issueText}>{issue.message}</Text>
                    </View>
                  ))}
                  {issues.length > 5 && <Text style={styles.moreIssues}>+ {issues.length - 5} more errors</Text>}
                </View>
              </>
            )}

            <Pressable
              style={[styles.importButton, (!rowCount || busy) && styles.disabledButton]}
              onPress={confirmImport}
              disabled={!rowCount || busy}>
              {busy ? <ActivityIndicator color={palette.white} /> : <Text style={styles.importText}>Import {rowCount} valid rows</Text>}
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Summary({ value, label, color }: { value: number; label: string; color: string }) {
  return <View style={styles.summary}><Text style={[styles.summaryValue, { color }]}>{value}</Text><Text style={styles.summaryLabel}>{label}</Text></View>;
}

function waitForUi() {
  return new Promise((resolve) => setTimeout(resolve, 40));
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: palette.background },
  header: { height: 62, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { width: 38, height: 38, borderRadius: 12, backgroundColor: palette.white, borderWidth: 1, borderColor: palette.border, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: palette.ink, fontSize: 17, fontWeight: '800' },
  headerSpacer: { width: 38 },
  content: { padding: 20, paddingTop: 8, paddingBottom: 40 },
  label: { color: palette.ink, fontSize: 14, fontWeight: '700', marginBottom: 10 },
  segment: { flexDirection: 'row', backgroundColor: '#E9EDF3', borderRadius: 14, padding: 4, marginBottom: 18 },
  typeButton: { flex: 1, height: 42, borderRadius: 11, flexDirection: 'row', gap: 7, alignItems: 'center', justifyContent: 'center' },
  activeType: { backgroundColor: palette.navy },
  typeText: { color: palette.muted, fontSize: 13, fontWeight: '700' },
  activeTypeText: { color: palette.white },
  infoCard: { flexDirection: 'row', backgroundColor: '#EAF2FF', borderRadius: 16, padding: 14, marginBottom: 18 },
  infoCopy: { flex: 1, marginLeft: 10 },
  infoTitle: { color: palette.ink, fontSize: 13, fontWeight: '800' },
  infoText: { color: palette.blue, fontSize: 12, fontWeight: '700', marginTop: 4 },
  ruleText: { color: palette.muted, fontSize: 11, lineHeight: 17, marginTop: 7 },
  upload: { minHeight: 218, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#AFC4E7', backgroundColor: palette.white, borderRadius: 20, alignItems: 'center', justifyContent: 'center', padding: 20 },
  uploadIcon: { width: 58, height: 58, borderRadius: 18, backgroundColor: '#EEF4FF', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  uploadTitle: { color: palette.ink, fontSize: 15, fontWeight: '800', textAlign: 'center' },
  uploadText: { color: palette.muted, fontSize: 11, marginTop: 5 },
  browseButton: { marginTop: 15, borderRadius: 10, backgroundColor: '#EEF4FF', paddingHorizontal: 15, paddingVertical: 9 },
  browseText: { color: palette.blue, fontSize: 12, fontWeight: '800' },
  summaryRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  summary: { flex: 1, backgroundColor: palette.white, borderWidth: 1, borderColor: palette.border, borderRadius: 15, padding: 13 },
  summaryValue: { fontSize: 22, fontWeight: '800' },
  summaryLabel: { color: palette.muted, fontSize: 11, marginTop: 2 },
  sectionTitle: { color: palette.ink, fontSize: 15, fontWeight: '800', marginTop: 22, marginBottom: 9 },
  previewCard: { backgroundColor: palette.white, borderWidth: 1, borderColor: palette.border, borderRadius: 17, paddingHorizontal: 13 },
  previewRow: { minHeight: 59, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.border },
  rowIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#EEF4FF', alignItems: 'center', justifyContent: 'center' },
  previewCopy: { flex: 1, marginLeft: 10 },
  previewTitle: { color: palette.ink, fontSize: 13, fontWeight: '700' },
  previewMeta: { color: palette.muted, fontSize: 11, marginTop: 3 },
  moreRows: { color: palette.blue, fontSize: 12, fontWeight: '700', textAlign: 'center', paddingVertical: 12 },
  summaryLine: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.border },
  summaryText: { flex: 1, color: palette.ink, fontSize: 12, lineHeight: 17 },
  issueCard: { backgroundColor: '#FFF5F4', borderRadius: 17, padding: 13 },
  issueRow: { flexDirection: 'row', marginBottom: 8 },
  issueNumber: { color: palette.red, fontSize: 11, fontWeight: '800', width: 55 },
  issueText: { flex: 1, color: '#7F4440', fontSize: 11, lineHeight: 16 },
  moreIssues: { color: palette.red, fontSize: 11, fontWeight: '700' },
  importButton: { height: 52, borderRadius: 15, backgroundColor: palette.blue, alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  disabledButton: { opacity: 0.45 },
  importText: { color: palette.white, fontSize: 14, fontWeight: '800' },
});
