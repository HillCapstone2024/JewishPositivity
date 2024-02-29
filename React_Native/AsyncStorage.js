import AsyncStorage from "@react-native-async-storage/async-storage";

//store a variable to local storage
export const setItem = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, value);
    console.log(`${key} saved`);
  } catch (error) {
    console.log(`Error saving ${key}:`, error);
  }
};

//retreive an item to local storage
export const getItem = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      console.log(`${key} retrieved:`, value);
      return value;
    }
  } catch (error) {
    console.log(`Error retrieving ${key}:`, error);
  }
};

//remove item from storage
export const removeItem = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    console.log(`${key} removed`);
  } catch (error) {
    console.log(`Error removing ${key}:`, error);
  }
};

