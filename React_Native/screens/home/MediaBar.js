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
    Animated
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";


export default function MediaAccessoryBar({ onMediaComplete, toggleRecording }) {
    const [media, setMedia] = useState(null);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [recordingState, setRecordingState] = useState(false);

    //animation logic below

    const mediaButtonAnim = useRef(new Animated.Value(-100)).current; // Initial position off-screen
    useEffect(() => {
        Animated.timing(mediaButtonAnim, {
          toValue: 0,
          duration: 80,
          useNativeDriver: true,
        }).start();
    }, []);


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

    //sending media and recording toggle back to parent component
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

    //media logic (camera and gallery) below

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
        <Animated.View
          style={[
            { flex: 1 },
            { transform: [{ translateX: mediaButtonAnim }] },
          ]}
        >
          <TouchableOpacity
            style={styles.barButton}
            onPress={() => {
              if (onMediaComplete) {
                console.log("toggled recording");
                toggleRecording(true);
              }
            }}
          >
            <Ionicons name="mic" size={25} color="white" />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={[
            { flex: 1 },
            { transform: [{ translateX: mediaButtonAnim }] },
          ]}
        >
          <TouchableOpacity style={styles.barButton} onPress={takeMedia}>
            <Ionicons name="camera" size={25} color="white" />
          </TouchableOpacity>
        </Animated.View>
        <Animated.View
          style={[
            { flex: 1 },
            { transform: [{ translateX: mediaButtonAnim }] },
          ]}
        >
          <TouchableOpacity style={styles.barButton} onPress={pickMedia}>
            <Ionicons name="images" size={25} color="white" />
          </TouchableOpacity>
        </Animated.View>
        <Animated.View
          style={[
            { flex: 1 },
            { transform: [{ translateX: mediaButtonAnim }] },
          ]}
        >
          <TouchableOpacity style={styles.barButton} onPress={hideKeyboard}>
            <Ionicons name="checkmark" size={25} color="white" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
};

const styles = StyleSheet.create({
  barContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d0d3d9",
    flex: 1,
    // borderBottomWidth: 1,
    borderTopWidth:1,
    borderColor: "#bbbec3",
  },
  barButton: {
    backgroundColor: "#d0d3d9",
    justifyContent: "center",
    alignItems: "center",
    padding: 7,
    alignSelf: "stretch",
    flexDirection: "row",
  },
});
