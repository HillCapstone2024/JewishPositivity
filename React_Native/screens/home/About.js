import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, Button, Alert, ScrollView, Appearance, TouchableOpacity, Pressable } from 'react-native';
import axios from "axios";
import IP_ADDRESS from "../../ip.js";
import * as WebBrowser from 'expo-web-browser';
import RNPickerSelect from 'react-native-picker-select';
import * as Storage from "../../AsyncStorage.js";
import * as Haptics from 'expo-haptics';
import { Ionicons } from "@expo/vector-icons";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPen } from '@fortawesome/free-solid-svg-icons/faPen';
import { faBoxArchive } from '@fortawesome/free-solid-svg-icons/faBoxArchive';
import { faUsersLine } from '@fortawesome/free-solid-svg-icons/faUsersLine';

import makeThemeStyle from '../../tools/Theme.js';
import Times from "./Times.js";

const API_URL = "http://" + IP_ADDRESS + ":8000";


const About = ({ navigation }) => {
  themeStyle = makeThemeStyle();


  return (
    <ScrollView style={[themeStyle['background'], styles.container]}>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}> About our App</Text>
        <View style={styles.horizontalLine} />
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}> About Check-ins</Text>
        <View style={styles.horizontalLine} />
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}> Functionality</Text>
        <View style={styles.horizontalLine} />
      </View>

      <FontAwesomeIcon icon={faBoxArchive} 
        size={28}
        color={"#4A90E2"}
      />

      <TouchableOpacity
        activeOpacity={100}
        style={[styles.activeBtn]}                
      >
        <FontAwesomeIcon icon={faPen} 
          size={15}
          color={"white"}
        />
        {/* <Ionicons
        name="add"
        size={50}
        color={"white"}
      /> */}
      </TouchableOpacity>

      <Ionicons
        name="people"
        size={28}
        color={"#4A90E2"}
      />

      <FontAwesomeIcon icon={faUsersLine}
        size = {28}
        color={"black"}
      />

    </ScrollView> 
  );
};

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20,
  },
  activeBtn: {
    width: 30,
    height: 30,
    borderRadius: 50 / 2,
    backgroundColor: "#4A90E2",
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    paddingVertical: 12,
    fontSize: 12,
    fontWeight: '600',
    color: '#9e9e9e',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
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
});

export default About;
