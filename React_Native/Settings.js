import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet, Button, Alert } from 'react-native';
import axios from "axios";
import IP_ADDRESS from "./ip.js";
import * as WebBrowser from 'expo-web-browser';

const API_URL = "http://" + IP_ADDRESS + ":8000";

const SettingsScreen = ({ navigation }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [isHapticFeedbackEnabled, setIsHapticFeedbackEnabled] = useState(false);

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
      const response = await axios.post(`${API_URL}/delete/`,
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
      navigateTemp();
    } catch (error) {
      console.log(error);
      setErrorMessage(
        <View style={styles.errorMessageBox}>
          <Text style={styles.errorMessageText}>{error.response.data}</Text>
        </View>
      );
      console.error("Login error:", error.response.data);
    }
  };
  const url = "https://drive.google.com/file/d/15TGCUb7dvpNorO9IcGfiyDL60WatPa07/edit";
  const toggleTheme = () => setIsDarkTheme(previousState => !previousState);
  const toggleHapticFeedback = () => setIsHapticFeedbackEnabled(previousState => !previousState);
  const handleReport = () => Alert.prompt('Report', 'Report something broken?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Report' }]);
  const handleTermsofUse = () => Alert.alert('Terms of Use', 'Read the terms of use?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Read', onPress: () => navigation.navigate('TermsofUse') }]);
  const handlePrivacyPolicy = () => Alert.alert('Privacy Policy', 'Read the privacy policy?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Read', onPress: () => WebBrowser.openBrowserAsync(url) }]);
  const handleDeleteAccount = () => Alert.alert('Delete Account', 'Are you sure you want to delete your account?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => sendAccountDeletionRequest() }]);

  return (
    <View style={styles.container}>

      <View style={styles.setting}>
        <Text style={styles.settingText}>Theme</Text>
        <Switch
          onValueChange={toggleTheme}
          value={isDarkTheme}
        />
      </View>

      <View style={styles.setting}>
        <Text style={styles.settingText}>Haptic Feedback</Text>
        <Switch
          onValueChange={toggleHapticFeedback}
          value={isHapticFeedbackEnabled}
        />
      </View>

      <Button title="Report" onPress={handleReport} />
      <Button title="Terms of Use" onPress={handleTermsofUse} />
      <Button title="Privacy Policy" onPress={handlePrivacyPolicy} />
      <Text style={styles.version}>Version: 1.0.0</Text>
      <Button title="Delete Account" onPress={handleDeleteAccount} />
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
  version: {
    textAlign: 'center',
    margin: 15,
  },
  settingText: {
    fontSize: 20,
  },
});

export default SettingsScreen;
