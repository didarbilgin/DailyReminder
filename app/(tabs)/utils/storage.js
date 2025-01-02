import AsyncStorage from '@react-native-async-storage/async-storage';

// Veri kaydetme
export const storeData = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, value);
    console.log(`Data stored: ${key} -> ${value}`);
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

// Veri okuma
export const getData = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      console.log(`Data retrieved: ${key} -> ${value}`);
      return value;
    }
    return null;
  } catch (error) {
    console.error('Error reading data:', error);
  }
};

// Veri silme
export const removeData = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    console.log(`Data removed: ${key}`);
  } catch (error) {
    console.error('Error removing data:', error);
  }
};

// JSON veri saklama
export const storeJSON = async (key, jsonValue) => {
  try {
    const value = JSON.stringify(jsonValue);
    await AsyncStorage.setItem(key, value);
    console.log(`JSON stored: ${key} -> ${value}`);
  } catch (error) {
    console.error('Error saving JSON data:', error);
  }
};

// JSON veri okuma
export const getJSON = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      console.log(`JSON retrieved: ${key} -> ${value}`);
      return JSON.parse(value);
    }
    return null;
  } catch (error) {
    console.error('Error reading JSON data:', error);
  }
};

// Tüm verileri alma
export const getAllKeys = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const result = await AsyncStorage.multiGet(keys);
    const data = result.map(([key, value]) => ({ key, value }));
    console.log('All data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching all keys:', error);
  }
};

// Tüm verileri silme
export const clearAllData = async () => {
  try {
    await AsyncStorage.clear();
    console.log('All data cleared');
  } catch (error) {
    console.error('Error clearing all data:', error);
  }
};

// Anahtarın varlığını kontrol etme
export const hasKey = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    const exists = value !== null;
    console.log(`Key exists: ${key} -> ${exists}`);
    return exists;
  } catch (error) {
    console.error('Error checking key existence:', error);
  }
};