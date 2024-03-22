import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Animated, StatusBar, Button, Dimensions } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { PanGestureHandler, State } from 'react-native-gesture-handler';

import CheckIn from "./CheckIn";

const JournalModal = ({ onClose, onSubmit, visible, onRequestClose }) => {
  const onGestureEvent = (event) => {
    if (event.nativeEvent.translationY > 100) {
      onRequestClose();
    }
  };

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      onRequestClose();
    }
  };

  const handleSaveJournal = () => {
    console.log("Saving Journal Entry");
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onRequestClose}
    >
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
      >
        <View style={styles.checkInView}>
          <CheckIn handleCancel={onClose} handleSubmitClose={onSubmit} />
        </View>
      </PanGestureHandler>
    </Modal>
  );
};


const styles = StyleSheet.create({
  checkInView: {
    // alignItems: "center",
    marginTop: 99,
    flex: 1,
    backgroundColor: 'white',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    // padding: 35,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default JournalModal;
