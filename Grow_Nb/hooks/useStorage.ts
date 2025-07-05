import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';

export function useStorage<T>(key: string, defaultValue: T) {
  const [data, setData] = useState(defaultValue);

  useEffect(() => {
    async function fetchData() {
      try {
        const storedValue = await AsyncStorage.getItem(key);
        if (storedValue !== null) {
          setData(JSON.parse(storedValue));
        }
      } catch (error) {
        console.error('Error fetching data from storage:', error);
      }
    }
    fetchData();
  }, [key]);

  async function saveData(newData: T) {
    try {
      const stringifiedValue = JSON.stringify(newData);
      await AsyncStorage.setItem(key, stringifiedValue);
      setData(newData);
    } catch (error) {
      console.error('Error saving data to storage:', error);
    }
  }

  return [data, saveData] as const;
}
