import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  TextInput,
  Keyboard,
  InputAccessoryView,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";

export default function RecordingAccessoryBar({ onRecordingComplete, toggleRecording }) {
  const [startedRecording, setStartedRecording] = useState(false);
  const [stoppedRecording, setStoppedRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [audioPermission, setAudioPermission] = useState(true);

  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef();
  const [duration, setDuration] = useState(0);
  const [formattedDuration, setFormattedDuration] = useState("0:01");

  const durationRef = useRef(duration);
  durationRef.current = duration;

  const [recordingUri, setRecordingUri] = useState(null);
  const [recordingState, setRecordingState] = useState(false);

  useEffect(() => {
    if (recordingState) {
        sendRecordingState();
    }
}, [recordingState]);


  useEffect(() => {
    return sound
      ? () => {
          console.log("Unloading Sound");
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  useEffect(() => {
    if (timerRunning) {
      // Start the timer
      timerRef.current = setInterval(() => {
        setDuration((prevDuration) => prevDuration + 1);
      }, 1000);
    } else if (!timerRunning && timerRef.current) {
      // Clear the timer if it's running
      clearInterval(timerRef.current);
    }

    // Cleanup on component unmount
    return () => clearInterval(timerRef.current);
  }, [timerRunning]);

  useEffect(() => {
    setFormattedDuration(formatSeconds(duration));
  }, [duration]);

  function formatSeconds(secondsString) {
    const totalSeconds = parseInt(secondsString, 10);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const formattedMinutes = minutes.toString().padStart(2, "0");
    const formattedSeconds = seconds.toString().padStart(2, "0");

    return `${formattedMinutes}:${formattedSeconds}`;
  };

  // useEffect(() => {
  //   return () => {
  //     recording && cleanupRecording();
  //   };
  // }, [recording]);

  const cleanupRecording = async () => {
    try {
      await recording.stopAndUnloadAsync();
    } catch (error) {
      console.error("Failed to unload the recording", error);
    }
    setRecording(null);
    setStartedRecording(false);
  };

  async function requestAudioPermissions() {
    const response = await Audio.requestPermissionsAsync();
    setAudioPermission(response.status === "granted");
  }


  const saveRecording = () => {
    // Logic to save the recordingUri somewhere permanent
    console.log("Recording saved at:", recordingUri);
    if (onRecordingComplete) {
      onRecordingComplete(recordingUri);
    }
  };

  const deleteRecording = async () => {
    try {
      await FileSystem.deleteAsync(recordingUri);
      console.log("Recording deleted successfully");
      // Additional logic after successful deletion (e.g., update state)
      setRecordingUri(null);
      setStoppedRecording(false);
      setDuration(0);
    } catch (error) {
      console.error("Error deleting recording:", error);
    }
  };


  async function startRecording() {
    if (!audioPermission) {
      await requestAudioPermissions();
    }
    if (audioPermission) {
      try {
        console.log("beginning recording...");
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          interruptionModeIOS: 1,
          interruptionModeAndroid: 1,
        });
        const newRecording = new Audio.Recording();
        await newRecording.prepareToRecordAsync(
          Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        );
        await newRecording.startAsync();
        setRecording(newRecording);
        setStartedRecording(true);
        setDuration(0);
        setTimerRunning(true);
        console.log("recording now");
      } catch (err) {
        console.error("Failed to start recording", err);
      }
    } else {
      alert("Audio recording permissions are required to use this feature.");
    }
  }

  async function stopRecording() {
    if (recording) {
      console.log("stopping recording...");
      setRecording(null);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordingUri(uri);
      console.log("Recording stopped and stored at", uri);
      setStoppedRecording(true);
      setStartedRecording(false);
      setTimerRunning(false);
    } else {
    }
  }

  async function playRecording() {
    if (recordingUri) {
      console.log("playing recording...");
      const sound = new Audio.Sound();
      try {
        await sound.loadAsync({ uri: recordingUri });
        await sound.playAsync();
      } catch (error) {
        console.error("Failed to play the recording", error);
      }
    }
  }

      function sendRecordingState() {
        console.log("sending recording state");
        if (toggleRecording) {
            toggleRecording(!recordingState);
        }
    };

  return (
    <View style={{ flex: 1 }}>
      {/* <TextInput
        style={{ height: 40, borderColor: "gray", borderWidth: 1 }}
        placeholder="Tap here to show the keyboard"
        inputAccessoryViewID={accessoryViewID}
      /> */}

      {!stoppedRecording ? (
        <View style={styles.barContainer}>
          <TouchableOpacity
            style={styles.micButton}
            // disabled="true"
            onPress={() => {
              if (toggleRecording) {
                console.log("toggled recording");
                toggleRecording(false);
              }
            }}
          >
            <Ionicons name={"mic"} size={25} color="grey" />
          </TouchableOpacity>
          <Text>{formattedDuration}</Text>
          <TouchableOpacity
            style={styles.barButton}
            onPress={startedRecording ? stopRecording : startRecording}
          >
            <Ionicons
              name={!startedRecording ? "play" : "pause"}
              size={25}
              color="white"
            />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.barContainer}>
          <TouchableOpacity
            style={styles.micButton}
            // disabled="true"
            onPress={() => {
              if (toggleRecording) {
                console.log("toggled recording");
                toggleRecording(false);
              }
            }}
          >
            <Ionicons name={"mic"} size={25} color="grey" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.barButton} onPress={deleteRecording}>
            <Ionicons name={"close"} size={25} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.barButton} onPress={playRecording}>
            <Ionicons name={"headset"} size={25} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.sendButton} 
          onPress={saveRecording}>
            <Ionicons name={"send"} size={25} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

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
    borderBottomWidth: 1,
    borderColor: "grey",
  },
  barButton: {
    backgroundColor: "lightgrey",
    padding: 7,
    alignSelf: "stretch",
    flexDirection: "row",
    justifyContent: "center", // Centers child components (the icon) vertically
    alignItems: "center",
  },
  micButton: {
    // backgroundColor: "black",
    padding: 7,
    alignSelf: "stretch",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "lightgrey",
    padding: 7,
    alignSelf: "stretch",
    flexDirection: "row",
  },
  sendButton: {
    backgroundColor: "lightgrey",
    alignItems: "center",
    padding: 7,
    alignSelf: "stretch",
    flexDirection: "row",
    marginLeft: "70%",
    justifyContent: "center", // Centers child components (the icon) vertically
    alignItems: "center",
    // marginRight: "5"
  },
});
