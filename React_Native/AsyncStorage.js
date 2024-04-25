import AsyncStorage from "@react-native-async-storage/async-storage";

//store a variable to local storage
export const setItem = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.log(`Error saving ${key}:`, error);
  }
};

//retreive an item to local storage
export const getItem = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value;  
  } catch (error) {
    console.log(`Error retrieving ${key}:`, error);
  }
};

//remove item from storage
export const removeItem = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.log(`Error removing ${key}:`, error);
  }
};

// Remove all items from storage
export const clearAll = async () => {
  try {
    await AsyncStorage.clear();
    console.log('cleared all info from async storage');
  } catch (error) {
    console.log('Error clearing the storage:', error);
  }
};
