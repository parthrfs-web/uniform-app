import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import * as XLSX from 'xlsx';

export async function exportToExcel(data: any[], fileName: string) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  
  if (Platform.OS === 'web') {
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  } else {
    const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
    const uri = (FileSystem as any).cacheDirectory + `${fileName}.xlsx`;
    await FileSystem.writeAsStringAsync(uri, wbout, { encoding: (FileSystem as any).EncodingType?.Base64 ?? 'base64' });
    // expo-sharing not installed in this workspace; file is written to cache. Consumer may share as needed.
    // Log the file URI so developers can locate it during testing.
    // In future, add expo-sharing to dependencies and call shareAsync here.
    // console.log('Excel file written to', uri);
    return uri;
  }
}
