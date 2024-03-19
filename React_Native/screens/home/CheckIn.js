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
import RecordingAccessoryBar from "./RecordingBar";
import MediaAccessoryBar from "./MediaBar";
// import VideoThumbnail from "./VideoThumbnail";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";
import RNThumbnail from "react-native-thumbnail";
import * as FileSystem from "expo-file-system";
import base64 from "react-native-base64";
import * as VideoThumbnails from "expo-video-thumbnails";
import makeThemeStyle from '../../Theme.js';
import * as Storage from "../../AsyncStorage.js";
import IP_ADDRESS from "../../ip.js";
const API_URL = "http://" + IP_ADDRESS + ":8000";

export default function JournalEntry() {
  const [username, setUsername] = useState("");
  const [momentType, setMomentType] = useState(1);
  const [mediaUri, setMediaUri] = useState(null);
  const [mediaBox, setMediaBox] = useState(false);
  const [mediaType, setMediaType] = useState("text");
  const [base64Data, setBase64Data] = useState("");
  const [journalText, setJournalText] = useState("");
  const [showMediaBar, setShowMediaBar] = useState(true);
  const [videoThumbnail, setVideoThumbnail] = useState();
  const mediaAccessoryViewID = "MediaBar";
  const theme = makeThemeStyle();
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  const formattedDateTime = new Intl.DateTimeFormat('en-US', options).format(now);

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
    },[]);

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
  };

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
    if (mediaType === "text") {
      console.log("media is text");
      // const text64 = base64.encode(journalText);
      setBase64Data(journalText);
    }
    console.log('got past', base64Data);
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
      console.log("Signup response:", response.data);
    } catch (error) {
      console.log(error);
      console.error("Journal Error:", error.response.data);
    }
  };

  const generateThumbnail = async () => {
    try {
      const { thumbnailUri } = await VideoThumbnails.getThumbnailAsync(
        mediaUri,
        {
          time: 15000,
        }
      );
      // setImage(thumbnailUri);
      setVideoThumbnail(thumbnailUri);
      console.log('thumbnailUri', thumbnailUri);
    } catch (error) {
      console.warn(error);
    }
  };

  const deleteMedia = () => {
    setMediaUri(null);
    setMediaBox(false);
    setMediaType("");
  };

  const handleRecordingComplete = (uri) => {
    console.log("Received saved from recording bar:", uri);
    // setShowMediaBar(true);
    setMediaBox(true);
    setMediaUri(uri);
  };

  const handleMediaComplete = async (uri) => {
    console.log("received data from mediabar", uri);
    setMediaUri(uri);
    setMediaType("image");
    const base64String = await readFileAsBase64(uri);
    setBase64Data(base64String);
    setMediaBox(true);
    console.log(base64String);
  };


  const handleToggle = (toggle) => {
    console.log("journal side:", toggle);
    setShowMediaBar(!toggle);
  };

  return (
    <SafeAreaView style={[styles.container, theme['background']]}>
      <TextInput style={[styles.title, theme['color']]} placeholder="Header..." placeholderTextColor='grey'></TextInput>
      <View style={[styles.separator, { borderBottomColor: theme['color']['color'] }]} />
      <Text style={[styles.datetime, theme['color']]}> {formattedDateTime} </Text>
      {/* <ScrollView keyboardDismissMode="interactive"> */}
      {/* Media Box Below */}
      {mediaBox ? (
        <View style={styles.mediaContainer}>
          {/* {mediaType === "video" ? (
            <Image source={{ uri: videoThumbnail }} style={styles.image} />
          ) : ( */}
          <Image source={{ uri: mediaUri }} style={styles.image} />
          {/* )} */}
          {/* <Image source={{ uri: media }} style={styles.image} /> */}
          <TouchableOpacity style={styles.deleteMedia} onPress={deleteMedia}>
            <Ionicons name="close-circle" size={25} color={theme['color']['color']} />
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
            value={journalText}
            onChange={(text) => setJournalText(text)}
            multiline
            numberOfLines={4}
            testID="journalInput"
          />
          <Button onPress={submitJournal} title="Submit">
          </Button>
        </View>
      </ScrollView>

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
    textAlign: 'left',
  },
});
