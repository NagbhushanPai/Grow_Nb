import { shareAsync } from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function exportData() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const data = await AsyncStorage.multiGet(keys);
    const json = JSON.stringify(data, null, 2);

    const fileUri = FileSystem.documentDirectory + 'data.json';
    await FileSystem.writeAsStringAsync(fileUri, json);

    await shareAsync(fileUri, { mimeType: 'application/json', dialogTitle: 'Export Data' });
  } catch (error) {
    console.error('Error exporting data:', error);
    alert('Error exporting data.');
  }
}
