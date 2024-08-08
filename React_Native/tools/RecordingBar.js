import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  TextInput,
  Keyboard,
  InputAccessoryView,
  Animated,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";

export default function RecordingAccessoryBar({
  onRecordingComplete,
  toggleRecording,
}) {
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

  //Animation logic below

  const playButtonAnim = useRef(new Animated.Value(-100)).current;
  const [iconAnim] = useState(new Animated.Value(0));

  const startThrobAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false,
        }),
        Animated.timing(iconAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: false,
        }),
      ])
    ).start();
  };

  const iconColor = iconAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["white", "red"], // Change 'red' to your desired color
  });
  const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);

  useEffect(() => {
    if (isPlaying) {
      startThrobAnimation();
    } else {
      iconAnim.setValue(0); // Reset the animation value
      // Stop all animations
      Animated.loop(Animated.timing(iconAnim)).stop();
    }
  }, [isPlaying]);

  useEffect(() => {
    console.log("stopped recording state change.");
    playButtonAnim.setValue(-100);
    Animated.timing(playButtonAnim, {
      toValue: 0,
      duration: 80,
      useNativeDriver: true,
    }).start();
  }, [stoppedRecording]);

  //toggle which bar to show
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
    //use effect for incrementing timer
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setDuration((prevDuration) => prevDuration + 1);
      }, 1000);
    } else if (!timerRunning && timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [timerRunning]);

  useEffect(() => {
    //formatting the time
    setFormattedDuration(formatSeconds(duration));
  }, [duration]);

  function formatSeconds(secondsString) {
    const totalSeconds = parseInt(secondsString, 10);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const formattedMinutes = minutes.toString().padStart(2, "0");
    const formattedSeconds = seconds.toString().padStart(2, "0");

    return `${formattedMinutes}:${formattedSeconds}`;
  }

  // useEffect(() => {
  //   return () => {
  //     recording && cleanupRecording();
  //   };
  // }, [recording]);

  //Recording functionality below

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
    console.log('requesting permission');
    const response = await Audio.requestPermissionsAsync();
    setAudioPermission(response.status === "granted");
  }

  const saveRecording = () => {
    //To send the uri back to parent page
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
    await requestAudioPermissions();
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
      console.log('this point should never be reached');
    }
  }

  async function playRecording() {
    if (recordingUri) {
      setIsPlaying(true);
      console.log("playing recording...");
      const sound = new Audio.Sound();
      try {
        await sound.loadAsync({ uri: recordingUri });
        await sound.playAsync();
        setIsPlaying(false);
      } catch (error) {
        console.error("Failed to play the recording", error);
        setIsPlaying(false);
      }
    }
  }

  function sendRecordingState() {
    console.log("sending recording state");
    if (toggleRecording) {
      toggleRecording(!recordingState);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      {!stoppedRecording ? (
        <View style={styles.barContainer}>
          <TouchableOpacity
            style={[
              styles.returnButton,
              { transform: [{ translateX: playButtonAnim }] },
            ]}
            // disabled="true"
            onPress={() => {
              if (toggleRecording) {
                console.log("toggled recording");
                toggleRecording(false);
              }
            }}
          >
            <Ionicons name={"return-up-back"} size={25} color="white" />
          </TouchableOpacity>
          <Animated.View
            style={[
              styles.durationTextContainer,
              { transform: [{ translateX: playButtonAnim }] },
            ]}
            v={formattedDuration}
          >
            <Text style={styles.durationText}>{formattedDuration}</Text>
          </Animated.View>
          <Animated.View
            style={[
              styles.playButton,
              { transform: [{ translateX: playButtonAnim }] },
            ]}
          >
            <TouchableOpacity
              onPress={startedRecording ? stopRecording : startRecording}
            >
              <Ionicons
                name={!startedRecording ? "play" : "pause"}
                size={25}
                color="white"
              />
            </TouchableOpacity>
          </Animated.View>
        </View>
      ) : (
        <View style={styles.barContainer}>
          {/* <Animated.View
            style={[
              styles.returnButton,
              { transform: [{ translateX: playButtonAnim }] },
            ]}
          > */}
          <TouchableOpacity
            style={[
              styles.returnButton,
              { transform: [{ translateX: playButtonAnim }] },
            ]}
            // disabled="true"
            onPress={() => {
              stopRecording();
              if (toggleRecording) {
                console.log("toggled recording");
                toggleRecording(false);
              }
            }}
          >
            <Ionicons name={"return-up-back"} size={25} color="white" />
          </TouchableOpacity>
          {/* </Animated.View> */}
          <Animated.View
            style={[
              styles.deleteButton,
              { transform: [{ translateX: playButtonAnim }] },
            ]}
          >
            <TouchableOpacity onPress={deleteRecording}>
              <Ionicons name={"close"} size={25} color="white" />
            </TouchableOpacity>
          </Animated.View>
          <Animated.View
            style={[
              styles.listenButton,
              { transform: [{ translateX: playButtonAnim }] },
            ]}
          >
            <TouchableOpacity onPress={playRecording}>
              <Ionicons name={"headset"} size={25} color="white" />
            </TouchableOpacity>
          </Animated.View>
          <Animated.View
            style={[
              styles.sendButton,
              { transform: [{ translateX: playButtonAnim }] },
            ]}
          >
            <TouchableOpacity onPress={saveRecording}>
              <Ionicons name={"send"} size={25} color="white" />
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  barContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d0d3d9",
    flex: 1,
    borderColor: "grey",
    borderTopWidth: 1,
    borderColor: "#bbbec3",
  },
  barButton: {
    backgroundColor: "#d0d3d9",
    alignSelf: "stretch",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    backgroundColor: "#d0d3d9",
    padding: 7,
    alignSelf: "stretch",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  returnButton: {
    padding: 7,
    alignSelf: "stretch",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#d0d3d9",
    flex: 1,
  },
  durationTextContainer: {
    padding: 7,
    alignSelf: "stretch",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#d0d3d9",
    flex: 1,
    color: "white",
  },
  durationText: {
    color: "white",
  },
  sendButton: {
    backgroundColor: "#d0d3d9",
    alignItems: "center",
    padding: 7,
    alignSelf: "stretch",
    flexDirection: "row",
    marginLeft: "0%",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  listenButton: {
    backgroundColor: "#d0d3d9",
    alignItems: "center",
    padding: 7,
    justifyContent: "center",
    alignSelf: "stretch",
    flexDirection: "row",
    // marginLeft: "30%",
    marginHorizontal: 10,
  },
  deleteButton: {
    backgroundColor: "#d0d3d9",
    alignItems: "center",
    padding: 7,
    justifyContent: "center",
    alignSelf: "stretch",
    flexDirection: "row",
    // marginHorizontal: 10,
    marginLeft: 220,
  },
});
