import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, StatusBar, Button, Dimensions } from 'react-native';
import { Ionicons } from "@expo/vector-icons";

import CheckIn from "./CheckIn";

const window = Dimensions.get('window');
const windowHeight = window.height;
const headerHeight = 99; // Adjust according to your header height


const JournalModal = ({ onClose, onSubmit, translateY }) => {
  const modalHeight = windowHeight - headerHeight;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }] }, { height: modalHeight }]}>
      {/* <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <View style={styles.buttonContent}>
            <Ionicons name="caret-back" size={25} color="#4A90E2" />
            <Text style={styles.cancelText}>Cancel</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>
      </View> */}

      {/* Horizontal bar */}
      {/* <View style={styles.horizontalBar} /> */}

      {/* journal entry */}
      <View style={styles.checkInView}>
        <CheckIn handleCancel={onClose} handleSubmitClose={onSubmit}/>
      </View>

    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  buttonContainer: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
  },
  cancelButton: {},
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelText: {
    marginLeft: 5,
    // color: '#4A90E2',
    fontSize: 19,
  },
  submitButton: {},
  submitText: {
    color: '#4A90E2',
    fontSize: 19,
  },
  horizontalBar: {
    height: 1,
    backgroundColor: '#ccc',
    marginTop: 15,
  },
  checkInView: {
    flex: 1,
    marginTop: 10, 
  },
});

export default JournalModal;
