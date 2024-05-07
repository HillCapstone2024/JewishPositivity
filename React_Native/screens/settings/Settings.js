import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, Button, Alert, ScrollView, Appearance, TouchableOpacity, Pressable } from 'react-native';
import axios from "axios";
import IP_ADDRESS from "../../ip.js";
import * as WebBrowser from 'expo-web-browser';
import RNPickerSelect from 'react-native-picker-select';
import * as Storage from "../../AsyncStorage.js";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';

import makeThemeStyle from '../../tools/Theme.js';
import Times from "./Times.js";

const API_URL = "http://" + IP_ADDRESS + ":8000";


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
    // const getCsrfToken = async () => {
    //   try {
    //     const response = await axios.get(`${API_URL}/csrf-token/`);
    //     return response.data.csrfToken;
    //   } catch (error) {
    //     console.error("Error retrieving CSRF token:", error);
    //     throw new Error("CSRF token retrieval failed");
    //   }
    // };
    try {
      // const csrfToken = await getCsrfToken();
      const csrfToken = await Storage.getItem("@CSRF");
      const response = await axios.post(
        `${API_URL}/delete_user/`,
        {
          username: username,
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
      await Storage.removeItem("@username");
      navigation.reset({
        index: 0,
        routes: [{ name: "Landing" }],
      });
      navigation.navigate("Landing");
    } catch (error) {
      if (error.response.data) {
        console.error("error deleting account:", error.response.data);
      }
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
    // const getCsrfToken = async () => {
    //   try {
    //     const response = await axios.get(`${API_URL}/csrf-token/`);
    //     return response.data.csrfToken;
    //   } catch (error) {
    //     console.error("Error retrieving CSRF token:", error);
    //     throw new Error("CSRF token retrieval failed");
    //   }
    // };
    try {
      // const csrfToken = await getCsrfToken();
      const csrfToken = await Storage.getItem("@CSRF");
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
      return Alert.alert('Thank you for your feedback!')
    } catch (error) {
      console.log('report email failed')
      console.error(response.data);
    }
  };

  const url = "https://drive.google.com/file/d/15TGCUb7dvpNorO9IcGfiyDL60WatPa07/edit";
  const toggleHapticFeedback = () => setHapticFeedback(!isHapticFeedbackEnabled);
  const handleReport = () => Alert.prompt('Report', 'Report something broken?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Report', onPress: (inputValue) => handleReportEmail(inputValue) }]);
  const handleTermsofUse = () => Alert.alert('Terms of Use', 'Read the terms of use?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Read', onPress: () => navigation.navigate('Terms of Use') }]);
  const handlePrivacyPolicy = () => Alert.alert('Privacy Policy', 'Read the privacy policy?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Read', onPress: () => WebBrowser.openBrowserAsync(url) }]);
  const handleDeleteAccount = () => Alert.alert('Delete Account', 'Are you sure you want to delete your account?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => sendAccountDeletionRequest() }]);

  return (
    <ScrollView style={[themeStyle['background'], styles.container]}>
        {/* preferences section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}> Preferences</Text>
          <View style={styles.horizontalLine} />
        </View>
          <View style={styles.Prefsetting}>
            <Text style={[styles.settingText]}>Theme</Text>
            <RNPickerSelect
              onValueChange={(value) => saveTheme(value)}
              items={[
                { label: 'Dark', value: 'dark' },
                { label: 'Light', value: 'light' },
                { label: 'System', value: 'system' },
              ]}
              value={storage_theme}
              Icon={() => (
                <Ionicons style={{ top: 12 }} name="chevron-down-outline" size={24} color={"black"} />
              )}
              style={{
                inputIOS: {
                  fontSize: 16,
                  color: "black",
                  paddingVertical: 16,
                  paddingHorizontal: 10,
                  paddingRight: 30,
                },
                inputAndroid: {
                  fontSize: 16,
                  color: "black",
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                  paddingRight: 30,
                },
              }}
            />
          </View>

          <View style={styles.Prefsetting}>
            <Text style={styles.settingText}>Haptic Feedback</Text>
            <Switch
              trackColor={{ false: '#f2f2f2', true: '#4A90E2' }} // Update the background color
              thumbColor={'#f2f2f2'} // Update the thumb color
              onValueChange={toggleHapticFeedback}
              value={isHapticFeedbackEnabled}
            />
          </View>

        {/* Check-in Notifications section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}> Check-in notifications</Text>
          <View style={styles.horizontalLine} />
        </View>
          <View>
            <Times />
          </View>

        {/* Resources section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}> Resources</Text>
          <View style={styles.horizontalLine} />
        </View>
          <View style={styles.contentContainer}>

            <Pressable style={styles.setting} onPress={ () => { handleTermsofUse(); isHapticFeedbackEnabled ? Haptics.selectionAsync() : null;  }}>
              <Ionicons name="document-text" style={styles.icon}/>
              <Text style={styles.normalText}> Terms of Use </Text>
            </Pressable>

            <Pressable style={styles.setting} onPress={ () => { handlePrivacyPolicy(); isHapticFeedbackEnabled ? Haptics.selectionAsync() : null; }}>
              <Ionicons name="shield-checkmark" style={styles.icon}/>
              <Text style={styles.normalText}> Privacy Policy </Text>
            </Pressable>

            <Pressable style={styles.setting} onPress={ () => { handleReport(); isHapticFeedbackEnabled ? Haptics.selectionAsync() : null; }}>
              <Ionicons name="alert" style={styles.icon}/>
              <Text style={styles.normalText}> Report </Text>
            </Pressable>

            <Pressable style={styles.setting} onPress={ () => { handleDeleteAccount(); isHapticFeedbackEnabled ? Haptics.selectionAsync() : null; }}>
              <Text style={styles.redText}> Delete Account </Text>
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Text style={[themeStyle['color'], styles.version]}>Version: 1.0.0</Text>
          </View>
    </ScrollView> 
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  sectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  horizontalLine: {
    flex: 1,
    height: 1.25,
    backgroundColor: '#9e9e9e',
    marginLeft: 8, // Adjust spacing between title and line
  },
  setting: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    marginBottom: 12,
    paddingLeft: 12,
    paddingRight: 12,
    shadowColor: '#4A90E2', // Updated shadow color
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  Prefsetting: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    marginBottom: 12,
    paddingLeft: 12,
    paddingRight: 12,
    shadowColor: '#4A90E2', // Updated shadow color
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    paddingVertical: 12,
    fontSize: 12,
    fontWeight: '600',
    color: '#9e9e9e',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  contentContainer: {
    marginTop: 10,
    flex: 1,
  },
  footer: {
    height: 80,
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
    color: 'red',
    fontSize: 20,
  },
  normalText: {
    fontSize: 20,
    paddingLeft: 5,
  },
  icon: {
    color: '#007AFF',
    marginRight: 5,
    fontSize: 20,
  },
});

export default SettingsScreen;
