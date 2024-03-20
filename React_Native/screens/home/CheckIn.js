import * as ImagePicker from "expo-image-picker";
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Keyboard,
  Button,
  Dimensions,
  TextInput,
  Text,
  InputAccessoryView,
  ScrollView,
  Image,
  SafeAreaView,
} from "react-native";
import axios from "axios";
import RecordingAccessoryBar from "./RecordingBar.js";
import MediaAccessoryBar from "./MediaBar.js";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";
import * as FileSystem from "expo-file-system";
import base64 from "react-native-base64";
import { Buffer } from "buffer";

import { Video, ResizeMode, Audio } from "expo-av";
import makeThemeStyle from "../../Theme.js";
import * as Storage from "../../AsyncStorage.js";
import IP_ADDRESS from "../../ip.js";
const API_URL = "http://" + IP_ADDRESS + ":8000";

export default function JournalEntry() {
  const [username, setUsername] = useState("");
  const [momentType, setMomentType] = useState(3);
  const [mediaUri, setMediaUri] = useState(null);
  const [mediaBox, setMediaBox] = useState(false);
  const [mediaType, setMediaType] = useState("text");
  const [base64Data, setBase64Data] = useState("");
  const [journalText, setJournalText] = useState("empty");
  const [showMediaBar, setShowMediaBar] = useState(true);
  const mediaAccessoryViewID = "MediaBar";
  const theme = makeThemeStyle();
  const now = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  const formattedDateTime = new Intl.DateTimeFormat("en-US", options).format(
    now
  );
  const [sound, setSound] = useState();
  const videoRef = useRef(null);
  const [status, setStatus] = useState({});

  useEffect(() => {
    const loadUsername = async () => {
      const storedUsername = await Storage.getItem("@username");
      if (storedUsername) {
        setUsername(storedUsername);
      } else {
        setUsername("username not found");
      }
    };
    loadUsername();
    configureAudioMode();
  }, []);

  async function configureAudioMode() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        interruptionModeIOS: 1,
        playsInSilentModeIOS: true,
        interruptionModeAndroid: 1,
        shouldDuckAndroid: true,
        staysActiveInBackground: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.log(error);
    }
  }

  async function playSound() {
    console.log("Loading Sound");
    const { sound } = await Audio.Sound.createAsync({ uri: mediaUri });
    setSound(sound);

    console.log("Playing Sound");
    await sound.playAsync();
  }

  useEffect(() => {
    return sound
      ? () => {
          console.log("Unloading Sound");
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  async function readFileAsBase64(uri) {
    try {
      const base64Content = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      console.log("Base64 content:", base64Content);
      return base64Content;
    } catch (error) {
      console.error("Failed to read file as base64", error);
      return null;
    }
  }

    const textToBase64 = (text) => {
      return Buffer.from(text, "utf8").toString("base64");
    };

  const getCsrfToken = async () => {
    try {
      const response = await axios.get(`${API_URL}/csrf-token/`);
      return response.data.csrfToken;
    } catch (error) {
      console.error("Error retrieving CSRF token:", error);
      throw new Error("CSRF token retrieval failed");
      return "csrfToken retrieval failure";
    }
  };

  const submitJournal = async () => {
    if (mediaType === "text") {
      const base64JournalText = textToBase64(journalText);
      setBase64Data(base64JournalText);
      console.log("media is text", base64JournalText);
    }
    console.log("got past", mediaType);
    try {
      const csrfToken = await getCsrfToken();
      const response = await axios.post(
        `${API_URL}/check-in/`,
        {
          username: username,
          moment_number: momentType,
          content: base64Data,
          content_type: mediaType,
          date: formattedDateTime,
        },
        {
          headers: {
            "X-CSRFToken": csrfToken,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      console.log("check in response:", response.data);
    } catch (error) {
      console.log(error);
      console.error("Journal Error:", error.response.data);
    }
  };

  const deleteMedia = () => {
    setMediaUri(null);
    setMediaBox(false);
    setMediaType("");
  };

  const handleRecordingComplete = async (uri) => {
    console.log("Received saved from recording bar:", uri);
    setShowMediaBar(true);
    setMediaBox(true);
    setMediaUri(uri);
    setMediaType("recording");
    const base64String = await readFileAsBase64(uri);
    setBase64Data(base64String);
  };

  const handleMediaComplete = async (mediaProp) => {
    console.log("received data from mediabar", mediaProp);
    setMediaUri(mediaProp.assets[0].uri);
    setMediaType(mediaProp.assets[0].type);
    //sometimes mediaUri state doesn't update before next line
    //pass mediaProp.assets[0].uri directly to fix this
    const base64String = await readFileAsBase64(mediaProp.assets[0].uri);
    setBase64Data(base64String);
    setMediaBox(true);
  };

  const handleToggle = (toggle) => {
    console.log("journal side:", toggle);
    setShowMediaBar(!toggle);
  };

  return (
    <SafeAreaView style={[styles.container, theme["background"]]}>
      <TextInput
        style={[styles.title, theme["color"]]}
        placeholder="Header..."
        placeholderTextColor="grey"
      ></TextInput>
      <View
        style={[
          styles.separator,
          { borderBottomColor: theme["color"]["color"] },
        ]}
      />
      <Text style={[styles.datetime, theme["color"]]}>
        {" "}
        {formattedDateTime}{" "}
      </Text>
      {/* <ScrollView keyboardDismissMode="interactive"> */}
      {/* Media Box Below */}
      {mediaBox ? (
        <View style={styles.mediaContainer}>
          {mediaType === "image" ? (
            <Image source={{ uri: mediaUri }} style={styles.image} />
          ) : mediaType === "video" ? (
            <View>
              <Video
                source={{ uri: mediaUri }} // Can be a URL or a local file.
                playsInSilentModeIOS={true}
                useNativeControls
                ref={videoRef}
                style={styles.video}
                controls={true} // Show the default video controls.
                resizeMode={ResizeMode.CONTAIN} // The video's aspect ratio is preserved and fits within the bounds of the container.
                onError={(e) => console.log("video error", e)} // Callback when video cannot be loaded
                onTouchEnd={() => {
                  videoRef.current?.presentFullscreenPlayer();
                }}
                onFullscreenUpdate={({ fullscreenUpdate }) => {
                  switch (fullscreenUpdate) {
                    case Video.FULLSCREEN_UPDATE_PLAYER_WILL_PRESENT:
                      console.log("The fullscreen player is about to present.");
                      break;
                    case Video.FULLSCREEN_UPDATE_PLAYER_DID_PRESENT:
                      console.log("The fullscreen player just presented.");
                      break;
                    case Video.FULLSCREEN_UPDATE_PLAYER_WILL_DISMISS:
                      console.log("The fullscreen player is about to dismiss.");
                      break;
                    case Video.FULLSCREEN_UPDATE_PLAYER_DID_DISMISS:
                      console.log("The fullscreen player just dismissed.");
                  }
                }}
              />
              {/* <Button
                title={status.isPlaying ? "Pause" : "Play"}
                onPress={() =>
                  status.isPlaying
                    ? videoRef.current.pauseAsync()
                    : videoRef.current.playAsync()
                }
              /> */}
              <Text>Video</Text>
            </View>
          ) : (
            <View style={styles.container}>
              <Button title="Play Sound" onPress={playSound} />
            </View>
          )}
          {/* )} */}
          {/* <Image source={{ uri: media }} style={styles.image} /> */}
          <TouchableOpacity style={styles.deleteMedia} onPress={deleteMedia}>
            <Ionicons
              name="close-circle"
              size={25}
              color={theme["color"]["color"]}
            />
          </TouchableOpacity>
        </View>
      ) : null}

      <ScrollView style={styles.scrollingInput}>
        {/* Journal Text box View */}
        <View>
          <TextInput
            style={styles.journalInput}
            inputAccessoryViewID={mediaAccessoryViewID}
            placeholder={"Please type here…"}
            placeholderTextColor={"grey"}
            // value={journalText}
            onChange={(text) => setJournalText(text)}
            multiline
            numberOfLines={4}
            testID="journalInput"
          />
          <Button onPress={submitJournal} title="Submit"></Button>
        </View>
      </ScrollView>

      {/* Keyboard bar view below */}
      {showMediaBar ? (
        <InputAccessoryView nativeID={mediaAccessoryViewID}>
          <MediaAccessoryBar
            mediaProp={handleMediaComplete}
            toggleRecording={handleToggle}
          />
        </InputAccessoryView>
      ) : (
        <InputAccessoryView nativeID={mediaAccessoryViewID}>
          <RecordingAccessoryBar
            onRecordingComplete={handleRecordingComplete}
            toggleRecording={handleToggle}
          />
        </InputAccessoryView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  journalInput: {
    marginTop: 20,
    borderRadius: 5,
    padding: 10,
    color: "white",
    height: "100%",
    marginHorizontal: 5,
  },
  scrollingInput: {
    flexGrow: 1,
  },
  submitButton: {
    color: "black",
    fontSize: "14",
    backgroundColor: "white",
    margin: 10,
    padding: 15,
  },
  mediaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "lightgrey",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  image: {
    width: 45,
    height: 45,
    marginTop: 20,
    backgroundColor: "black",
  },
  video: {
    alignSelf: "center",
    width: "100%",
    height: 80,
  },
  deleteMedia: {
    justifyContent: "center",
    marginTop: 10,
  },
  datetime: {
    fontSize: 15,
    paddingLeft: 10,
    textAlign: "left",
  },
  separator: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginVertical: 10,
  },
  title: {
    paddingRight: 10,
    paddingLeft: 10,
    paddingTop: 10,
    fontSize: 40,
    fontWeight: "bold",
    textAlign: "left",
  },
});
