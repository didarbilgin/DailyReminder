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
