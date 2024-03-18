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
// import VideoThumbnail from "./VideoThumbnail";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";
import RNThumbnail from "react-native-thumbnail";
import * as VideoThumbnails from "expo-video-thumbnails";
import * as Storage from "../../AsyncStorage.js";
import Theme from "../../Theme.js";
import IP_ADDRESS from "../../ip.js";
const API_URL = "http://" + IP_ADDRESS + ":8000";
import * as FileSystem from "expo-file-system";
// import RNFS from "react-native-fs";

export default function JournalEntry({ navigation }) {
  const [username, setUsername] = useState("");
  const [media, setMedia] = useState(null);
  const [mediaBox, setMediaBox] = useState(false);
  const [mediaType, setMediaType] = useState();
  const [journalText, setJournalText] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [savedRecordingUri, setSavedRecordingUri] = useState("");
  const [showMediaBar, setShowMediaBar] = useState(true);
  const [momentType, setMomentType] = useState(1);
  const [base64Media, setBase64Media] = useState("");
  const [videoThumbnail, setVideoThumbnail] = useState();

  const mediaAccessoryViewID = "MediaBar";

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
  }, []);

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

  const getCsrfToken = async () => {
    try {
      const response = await axios.get(`${API_URL}/csrf-token/`);
      return response.data.csrfToken;
    } catch (error) {
      console.error("Error retrieving CSRF token:", error);
      throw new Error("CSRF token retrieval failed");
    }
  };

  const submitJournal = async () => {
    console.log("attemping to submit journal");
    const currentDate = new Date();
    const dateString = currentDate.toISOString();
    if (mediaType === "text" ) {
      setBase64Media(journalText);
    } else {
      const base64String = await readFileAsBase64(media);
      setBase64Media(base64String);
    }
    console.log("date to send: ", base64Media);

    try {
      const csrfToken = await getCsrfToken();
      const response = await axios.post(
        `${API_URL}/check-in/`,
        {
          username: username,
          moment_number: momentType,
          content: base64Media,
          content_type: mediaType,
          date: dateString,
        },
        {
          headers: {
            "X-CSRFToken": csrfToken,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      console.log("Signup response:", response.data);
    } catch (error) {
      console.log(error);
      console.error("Journal Error:", error.response.data);
    }
  };

  const generateThumbnail = async () => {
    try {
      const { thumbnailUri } = await VideoThumbnails.getThumbnailAsync(media, {
        time: 15000,
      });
      // setImage(thumbnailUri);
      setVideoThumbnail(thumbnailUri);
      console.log("thumbnailUri", thumbnailUri);
    } catch (e) {
      console.warn(e);
    }
  };

  const deleteMedia = () => {
    setMedia(null);
    setMediaBox(false);
  };

  const handleRecordingComplete = async (uri) => {
    console.log("Received data from recording bar:", uri);
    setSavedRecordingUri(uri);
    setShowMediaBar(true);
    setMediaBox(true);
    setMedia(uri);
    setMediaType("recording");
  };

  const handleMediaComplete = async (uri) => {
    console.log("received data from mediabar", uri);
    setMedia(uri);
    setMediaBox(true);
    setMediaType("image");
  };

  const handleToggle = (toggle) => {
    console.log("journal side:", toggle);
    setShowMediaBar(!toggle);
  };

  return (
    <SafeAreaView style={styles.overallcontainter}>
      {/* <ScrollView keyboardDismissMode="interactive"> */}
      {/* Media Box Below */}
      {mediaBox ? (
        <View style={styles.mediaContainer}>
          {/* {mediaType === "video" ? (
            <Image source={{ uri: videoThumbnail }} style={styles.image} />
          ) : ( */}
          <Image source={{ uri: media }} style={styles.image} />
          {/* )} */}
          {/* <Image source={{ uri: media }} style={styles.image} /> */}
          <TouchableOpacity style={styles.deleteMedia} onPress={deleteMedia}>
            <Ionicons name="close-circle" size={25} color="white" />
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.scrollingInput}>
        {/* Journal Text box View */}
        <View>
          <Button onPress={submitJournal} title="submit">
            Submit
          </Button>
          <TextInput
            style={styles.journalInput}
            inputAccessoryViewID={mediaAccessoryViewID}
            placeholder={"Please type here…"}
            onChange={(text) => {
              setJournalText(text);
              setMediaType("text");
            }}
            multiline
            numberOfLines={4}
          />
          {/* <Text>{toString(showMediaBar)}</Text> */}
        </View>
      </View>

      {/* Keyboard bar view below */}
      {showMediaBar ? (
        <InputAccessoryView nativeID={mediaAccessoryViewID}>
          <MediaAccessoryBar
            onMediaComplete={handleMediaComplete}
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
  overallcontainter: {
    backgroundColor: "#4F8EF7",
  },
  journalInput: {
    backgroundColor: "lightgrey",
    marginTop: 20,
    borderRadius: 5,
    padding: 10,
    color: "white",
    height: "100%",
    flexGrow: 1,
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
  deleteMedia: {
    justifyContent: "center",
    marginTop: 10,
  },
});
