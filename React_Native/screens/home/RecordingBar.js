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


export default function RecordingAccessoryBar({ onRecordingComplete }) {
    const [startedRecording, setStartedRecording] = useState(false);
    const [stoppedRecording, setStoppedRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [isRecordingPaused, setIsRecordingPaused] = useState(false);
  const [audioPermission, setAudioPermission] = useState(true);

  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef();
  const [duration, setDuration] = useState(0); // Duration of the recording in seconds

  const durationRef = useRef(duration);
  durationRef.current = duration;

  const [recordingUri, setRecordingUri] = useState(null);
  const accessoryViewID = "recordingview";

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
      return () => {
        recording && cleanupRecording();
      };
    }, [recording]);

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

  // const startRecording = async () => {
  //   // Ensure we clean up the previous recording if it exists
  //   if (recording) {
  //     await cleanupRecording();
  //   }

  //   const newRecording = new Audio.Recording();

  //   try {
  //     const permission = await Audio.requestPermissionsAsync();
  //     if (permission.status !== "granted") {
  //       throw new Error("Permission to access microphone is required.");
  //     }

  //     await Audio.setAudioModeAsync({
  //       allowsRecordingIOS: true,
  //       playsInSilentModeIOS: true,
  //       shouldDuckAndroid: true,
  //       interruptionModeIOS: 1,
  //       interruptionModeAndroid: 1,
  //     });

  //     await newRecording.prepareToRecordAsync(
  //       Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
  //     );
  //     await newRecording.startAsync();
  //     console.log('started recording');
  //     setStartedRecording(true);
  //     setRecording(newRecording);
  //     setDuration(0);
  //     setTimerRunning(true);
  //   } catch (err) {
  //     console.error("Failed to start recording:", err);
  //     // Cleanup the failed recording attempt
  //     await newRecording.stopAndUnloadAsync();
  //     setRecording(null);
  //     setStartedRecording(false);
  //     throw err; // Handle or log the error as needed
  //   }
  // };

  async function startRecording() {
    try {
      // if (permissionResponse.status !== "granted") {
      //   console.log("Requesting permission..");
      //   await requestPermission();
      // }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log("Starting recording..");
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      console.log("Recording started");
      setStartedRecording(true);
      setDuration(0);
      setTimerRunning(true);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async function stopRecording() {
    console.log("Stopping recording..");
    setTimerRunning(false);
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    const uri = recording.getURI();
    setRecordingUri(uri);
        setRecording(null);
    console.log("Recording stopped and stored at", uri);
  }

  const pauseRecording = async () => {
    if (!recording) return;

    await recording.pauseAsync();
    setIsRecordingPaused(true);
    setTimerRunning(false);
    const uri = recording.getURI();
    setRecordingUri(uri);
    console.log('recording paused', recordingUri);
  };

  const resumeRecording = async () => {
    if (!recording) return;
    console.log("recording resumed");
    await recording.startAsync();
    setIsRecordingPaused(false);
    setTimerRunning(true);
  };

  const saveRecording = () => {
    // Logic to save the recordingUri somewhere permanent
    console.log("Recording saved at:", recordingUri);
    if (onRecordingComplete) {
      onRecordingComplete(recordingUri);
    }
  };

  const deleteRecording = async (recordingUri) => {
    try {
      await FileSystem.deleteAsync(recordingUri);
      console.log("Recording deleted successfully");
      // Additional logic after successful deletion (e.g., update state)
    } catch (error) {
      console.error("Error deleting recording:", error);
    }
  };

  async function playRecording() {
    if (!recordingUri) return;

    console.log("Loading Sound", recordingUri);
    // Set the audio mode to play through the speakers
    // await Audio.setAudioModeAsync({
    //   allowsRecordingIOS: false,
    //   interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
    //   playsInSilentModeIOS: true,
    //   interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
    //   shouldDuckAndroid: true,
    //   staysActiveInBackground: false,
    //   playThroughEarpieceAndroid: false, // Ensure sound plays through the speaker
    // });
    console.log("got past audio settings");
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: recordingUri },
        { shouldPlay: true }
      );
      setSound(sound);
    } catch (error) {
      console.error("Failed to load the sound", error);
    }
    console.log("got past sound await");
    setSound(sound);

    console.log("Playing Sound", sound);
    await sound.playAsync();
    setIsPlaying(true);

    // Stop and unload sound when playback is done
    sound.setOnPlaybackStatusUpdate(async (playbackStatus) => {
      if (!playbackStatus.isLoaded || playbackStatus.didJustFinish) {
        setIsPlaying(false);
        await sound.unloadAsync();
        setSound(null);
      }
    });
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
              style={styles.barButton}
              disabled="true"
            >
              <Ionicons
                name={"mic"}
                size={25}
                color="lightgrey"
              />
            </TouchableOpacity>
            <Text>Recording: {duration} seconds</Text>
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
              style={styles.barButton}
              onPress={deleteRecording}
            >
              <Ionicons name={"close"} size={25} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.barButton} onPress={playRecording}>
              <Ionicons name={"headset"} size={25} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.barButton} onPress={saveRecording}>
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
