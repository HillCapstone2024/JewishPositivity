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


const About = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [isHapticFeedbackEnabled, setIsHapticFeedbackEnabled] = useState(false);
  const [theme, setTheme] = useState(false);
  const [storage_theme, setStorageTheme] = useState('system');
  themeStyle = makeThemeStyle();












  return (
    <ScrollView style={[themeStyle['background'], styles.container]}>

    <Text> Hello </Text>



    </ScrollView> 
  );
};

const styles = StyleSheet.create({

});

export default About;
