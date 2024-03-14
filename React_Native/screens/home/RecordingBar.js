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

export default function RecordingAccessoryBar({ onRecordingComplete }) {
    const [startedRecording, setStartedRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [isRecordingPaused, setIsRecordingPaused] = useState(false);
  const [audioPermission, setAudioPermission] = useState();

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


  async function requestAudioPermissions() {
    const response = await Audio.requestPermissionsAsync();
    setAudioPermission(response.status === "granted");
  }
  async function startRecording() {
    console.log("recording media");
    if (!audioPermission) {
      await requestAudioPermissions();
    }
    console.log(audioPermission);
    if (audioPermission) {
      console.log("attempting to record, granted perms");
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          interruptionModeIOS: 1,
          interruptionModeAndroid: 1,
        });

        const { recording } = await Audio.Recording.createAsync(
          Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        );
            setStartedRecording(true);
        setRecording(recording);
        console.log("recording is :", recording);
        setDuration(0);
        setTimerRunning(true);
      } catch (err) {
        console.error("Failed to start recording", err);
      }
    } else {
      alert("Audio recording permissions are required to use this feature.");
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecordingUri(uri);
    setRecording(null);
    setTimerRunning(false);
  };

  const pauseRecording = async () => {
    if (!recording) return;

    await recording.pauseAsync();
    setIsRecordingPaused(true);
    setTimerRunning(false);
    const uri = recording.getURI();
    setRecordingUri(uri);
    console.log('recording paused');
  };

  const resumeRecording = async () => {
    if (!recording) return;

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

  async function playRecording() {
    if (!recordingUri) return;

    console.log("Loading Sound");
    const { sound } = await Audio.Sound.createAsync(
      { uri: recordingUri },
      { shouldPlay: true }
    );

    setSound(sound);

    console.log("Playing Sound");
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
  }

  return (
    <View style={{ flex: 1 }}>
      <TextInput
        style={{ height: 40, borderColor: "gray", borderWidth: 1 }}
        placeholder="Tap here to show the keyboard"
        inputAccessoryViewID={accessoryViewID}
      />
      <InputAccessoryView nativeID={accessoryViewID}>
        <View style={styles.barContainer}>
          <Text>Recording: {duration} seconds</Text>
          {/* {recording && !isRecordingPaused ? (
            <Button title="Pause" onPress={pauseRecording} />
          ) : (
            <Button
              title="Resume"
              onPress={resumeRecording}
              disabled={!recording}
              styles={styles.barButton}
            />
          )} */}
          <TouchableOpacity
            style={styles.barButton}
            onPress={
              !isRecordingPaused && startedRecording
                ? pauseRecording
                : startedRecording
                ? resumeRecording
                : startRecording()
            }
          >
            <Ionicons
              name={isRecordingPaused || !startedRecording ? "play" : "pause"}
              size={25}
              color="white"
            />
          </TouchableOpacity>
          {/* <Button
            title={recording ? "Stop" : "Start"}
            onPress={recording ? stopRecording : startRecording}
          /> */}
          {/* <TouchableOpacity
            style={styles.barButton}
            onPress={recording ? stopRecording : startRecording}
          >
            <Ionicons
              name={recording ? "pause" : "play"}
              size={25}
              color="white"
            />
          </TouchableOpacity> */}
          {/* <Button
            title="Save"
            onPress={saveRecording}
            disabled={!recordingUri}
          /> */}

          {/* <Button
            title="Play Recording"
            onPress={playRecording}
            disabled={!recordingUri || isPlaying}
          /> */}
          <TouchableOpacity
            style={styles.barButton}
            onPress={playRecording}
            disabled={!recordingUri || isPlaying}
          >
            <Ionicons name="headset" size={25} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.barButton} onPress={saveRecording}>
            <Ionicons name="send" size={25} color="white" />
          </TouchableOpacity>
        </View>
      </InputAccessoryView>
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
