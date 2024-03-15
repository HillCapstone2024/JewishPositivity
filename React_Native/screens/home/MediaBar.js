import React, { useState, useEffect, useRef } from "react";
import * as ImagePicker from "expo-image-picker";
import {
  View,
  Text,
  Button,
  StyleSheet,
  TextInput,
  Keyboard,
  InputAccessoryView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";


export default function MediaAccessoryBar({ onMediaComplete, toggleRecording }) {
  const [media, setMedia] = useState(null);
  const [mediaType, setMediaType] = useState();
  const [imageUri, setImageUri] = useState(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [recordingState, setRecordingState] = useState(false);

    useEffect(() => {
      const keyboardDidShowListener = Keyboard.addListener(
        "keyboardDidShow",
        (e) => {
          console.log("keyboard activated");
          setKeyboardHeight(e.endCoordinates.height);
          console.log(e.endCoordinates.height);
        }
      );
      const keyboardDidHideListener = Keyboard.addListener(
        "keyboardDidHide",
        () => {
          console.log("keyboard hidden");
          setKeyboardHeight(0);
          console.log(keyboardHeight);
        }
      );

      return () => {
        keyboardDidShowListener.remove();
        keyboardDidHideListener.remove();
      };
    }, []);

    const hideKeyboard = () => {
      Keyboard.dismiss();
    };


    useEffect(() => {
        if (media) {
        sendMedia();
        }
    }, [media]);

    useEffect(() => {
        if (recordingState) {
            sendRecordingState();
        }
    }, [recordingState]);

  const pickMedia = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All, // Allows both videos and images
      allowsEditing: true, // Only applies to images
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setMedia(result.assets[0].uri);
      console.log("result: ", media);
    //   sendMedia();
    }
  };

    const takeMedia = async () => {
        // Request camera and microphone permissions if not already granted
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
        if (!cameraPermission.granted) {
        alert("Permissions to access camera and microphone are required!");
        return;
        }

        let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All, // This will still default to capturing images
        allowsEditing: true, // Only applies to images
        aspect: [4, 3],
        quality: 1,
        });

        if (result && !result.cancelled) {
            setMedia(result.assets[0].uri);
            console.log("result: ", result);
            // sendMedia();
        }
  };



  function sendMedia() {
    console.log('sending media');
    if (onMediaComplete) {
        onMediaComplete(media);
    }
  };

    function sendRecordingState() {
      console.log("sending recording state");
      if (toggleRecording) {
        toggleRecording(!recordingState);
      }
    };

  return (
    <View style={styles.barContainer}>
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          style={styles.barButton}
          onPress={() => {    
            if (onMediaComplete) {
                console.log('toggled recording');
                toggleRecording(true);
          }
          }}
        >
          <Ionicons name="mic" size={25} color="white" />
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1 }}>
        <TouchableOpacity style={styles.barButton} onPress={takeMedia}>
          <Ionicons name="camera" size={25} color="white" />
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1 }}>
        <TouchableOpacity style={styles.barButton} onPress={pickMedia}>
          <Ionicons name="images" size={25} color="white" />
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1 }}>
        <TouchableOpacity style={styles.barButton} onPress={hideKeyboard}>
          <Ionicons name="checkmark-circle" size={25} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  barContainer: {
    flexDirection: "row",
    // justifyContent: "space-around",
    // position: "absolute",
    alignItems: "center",
    // left: 0,
    // right: 0,
    backgroundColor: "yellow",
    flex: 1,
  },
  barButton: {
    // flex: 1,
    // width: '100%',
    backgroundColor: "#4F8EF7",
    // borderWidth: 1,
    // borderColor: "black",
    alignItems: "center",
    padding: 5,
    // marginHorizontal: 10,
    // flex: 1,
    alignSelf: "stretch",
    flexDirection: "row",
  },
});
