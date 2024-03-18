import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, Button, Alert, Appearance, TouchableOpacity, Pressable } from 'react-native';
import axios from "axios";
import IP_ADDRESS from "../../ip.js";
import * as WebBrowser from 'expo-web-browser';
import RNPickerSelect from 'react-native-picker-select';
import * as Storage from "../../AsyncStorage.js";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import makeThemeStyle from '../../Theme.js';
import Times from "./Times.js";
import TermsofUse from './TermsofUse';

const API_URL = "http://" + IP_ADDRESS + ":8000";

const Stack = createNativeStackNavigator();

const SettingsStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TermsofUse" component={TermsofUse} />
    </Stack.Navigator>
  );
};

const SettingsScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [isHapticFeedbackEnabled, setIsHapticFeedbackEnabled] = useState(false);
  const [theme, setTheme] = useState(false);
  const [storage_theme, setStorageTheme] = useState('system');
  themeStyle = makeThemeStyle();

  const loadUsername = async () => {
    const storedUsername = await Storage.getItem("@username");
    setUsername(storedUsername || "No username");
  };
  loadUsername();

  const getHapticFeedback = async () => {
    try {
      const hapticFeedbackEnabled = await Storage.getItem('@hapticFeedbackEnabled');
      if (hapticFeedbackEnabled === 'true') {
        setIsHapticFeedbackEnabled(true);
      } else {
        setIsHapticFeedbackEnabled(false);
      }
    } catch (e) {
      console.log(e);
    }
  };
  getHapticFeedback();


  const getTheme = async () => {
    try {
      const temp_storage_theme = await Storage.getItem('@theme');
      setStorageTheme(temp_storage_theme);
      if (storage_theme === 'dark') {
        setTheme(true)
      } else if (storage_theme === 'light') {
        setTheme(false)
      } else {
        if (Appearance.getColorScheme() === 'dark') {
          setTheme(true)
        } else {
          setTheme(false)
        }
      }
    }
    catch (e) {
      await Storage.setItem('@theme', 'system');
      console.log(e);
    }
  };
  getTheme()

  const setHapticFeedback = async (hapticFeedbackEnabled) => {
    try {
      await Storage.setItem('@hapticFeedbackEnabled', hapticFeedbackEnabled.toString());
      setIsHapticFeedbackEnabled(hapticFeedbackEnabled);
    } catch (e) {
      console.log(e);
    }
  };

  const sendAccountDeletionRequest = async () => {
    const getCsrfToken = async () => {
      try {
        const response = await axios.get(`${API_URL}/csrf-token/`);
        return response.data.csrfToken;
      } catch (error) {
        console.error("Error retrieving CSRF token:", error);
        throw new Error("CSRF token retrieval failed");
      }
    };
    try {
      const csrfToken = await getCsrfToken();
      const response = await axios.post(`${API_URL}/deleteUser/`,
        {
          username: username
        },
        {
          headers: {
            "X-CSRFToken": csrfToken,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      console.log("Delete response:", response.data);
    } catch (error) {
      console.error("error:", error.response.data);
    }
  };

  const saveTheme = async (theme) => {
    try {
      await Storage.setItem('@theme', theme);
      setStorageTheme(theme);
      getTheme();
    } catch (e) {
      console.log(e)
    }
  };

  const handleReportEmail = async (message) => {
    const getCsrfToken = async () => {
      try {
        const response = await axios.get(`${API_URL}/csrf-token/`);
        return response.data.csrfToken;
      } catch (error) {
        console.error("Error retrieving CSRF token:", error);
        throw new Error("CSRF token retrieval failed");
      }
    };
    try {
      const csrfToken = await getCsrfToken();
      const response = await axios.post(`${API_URL}/send_report_email/`,
        {
          username: username,
          message: message,
        },
        {
          headers: {
            "X-CSRFToken": csrfToken,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      console.log("Report sent");
    } catch (error) {
      console.log('report email failed')
      console.error(response.data);
    }
  };


  const url = "https://drive.google.com/file/d/15TGCUb7dvpNorO9IcGfiyDL60WatPa07/edit";
  const toggleHapticFeedback = () => setHapticFeedback(!isHapticFeedbackEnabled);
  const handleReport = () => Alert.prompt('Report', 'Report something broken?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Report', onPress: (inputValue) => handleReportEmail(inputValue) }]);
  const handleTermsofUse = () => Alert.alert('Terms of Use', 'Read the terms of use?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Read', onPress: () => navigation.navigate('TermsofUse') }]);
  const handlePrivacyPolicy = () => Alert.alert('Privacy Policy', 'Read the privacy policy?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Read', onPress: () => WebBrowser.openBrowserAsync(url) }]);
  const handleDeleteAccount = () => Alert.alert('Delete Account', 'Are you sure you want to delete your account?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => sendAccountDeletionRequest() }]);

  return (
    <View style={[themeStyle['background'], styles.container]}>
      <View style={styles.setting}>
        <Text style={[themeStyle['color'], styles.settingText]}>Theme</Text>
        <RNPickerSelect
          onValueChange={(value) => saveTheme(value)}
          items={[
            { label: 'Dark', value: 'dark' },
            { label: 'Light', value: 'light' },
            { label: 'System', value: 'system' },
          ]}
          value={storage_theme}
          Icon={() => (
            <Ionicons style={{ top: 8 }} name="chevron-down-outline" size={24} color={theme === true ? "white" : "black"} />
          )}
          style={{
            inputIOS: {
              fontSize: 16,
              color: theme === true ? "white" : "black",
              paddingVertical: 12,
              paddingHorizontal: 10,
              paddingRight: 30,
            },
            inputAndroid: {
              fontSize: 16,
              color: theme === true ? "white" : "black",
              paddingHorizontal: 10,
              paddingVertical: 8,
              paddingRight: 30,
            },
          }}
        />
      </View>

      <View style={styles.setting}>
        <Text style={[themeStyle['color'], styles.settingText]}>Haptic Feedback</Text>
        <Switch
          onValueChange={toggleHapticFeedback}
          value={isHapticFeedbackEnabled}
        />
      </View>
      <Text style={[themeStyle['color'], styles.timesText]}>Check-Ins</Text>

      <View style={styles.setting}>
        <Times />
      </View>

      {/* <View style={styles.contentContainer}>
        <Button title="Report" onPress={
          () => { handleReport(); isHapticFeedbackEnabled ? Haptics.selectionAsync() : null; }
        } />
        <Button title="Terms of Use" onPress={
          () => { handleTermsofUse(); isHapticFeedbackEnabled ? Haptics.selectionAsync() : null; }
        } />
        <Button title="Privacy Policy" onPress={
          () => { handlePrivacyPolicy(); isHapticFeedbackEnabled ? Haptics.selectionAsync() : null; }
        } />
        <Button title="Delete Account" color="red" onPress={
          () => { handleDeleteAccount(); isHapticFeedbackEnabled ? Haptics.selectionAsync() : null; }
        } />
      </View> */}

      <View style={styles.contentContainer}>
        <TouchableOpacity style={styles.button} onPress={() => { handleReport(); isHapticFeedbackEnabled ? Haptics.selectionAsync() : null; }}>
          <Text style={styles.normalText}>
            Report
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => { handleTermsofUse(); isHapticFeedbackEnabled ? Haptics.selectionAsync() : null; }}>
          <Text style={styles.normalText}>
            Terms of Use
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => { handlePrivacyPolicy(); isHapticFeedbackEnabled ? Haptics.selectionAsync() : null; }}>
          <Text style={styles.normalText}>
            Privacy Policy
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => { handleDeleteAccount(); isHapticFeedbackEnabled ? Haptics.selectionAsync() : null; }}>
          <Text style={styles.redText}>
            Delete Account
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={[themeStyle['color'], styles.version]}>Version: 1.0.0</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 35,
  },
  contentContainer: {
    marginTop: 10,
    flex: 1 
  },
  footer: {
    height: 80
  },
  version: {
    textAlign: 'center',
    margin: 10,
  },
  settingText: {
    fontSize: 20,
  },
  timesText: {
    fontSize: 20,
    bottom: 10,
    textAlign: 'center',
  },
  button: {
    flex: 0,
    opacity: 100,
    paddingVertical: 5,
    marginTop: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  redText: {
    color: "red",
    fontSize: 20,
  },
  normalText: {
    color: "#007AFF",
    fontSize: 20,
  },
});

export default SettingsStackNavigator;
