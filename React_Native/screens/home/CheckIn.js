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
import RecordingAccessoryBar from "./RecordingBar";
import MediaAccessoryBar from "./MediaBar";
// import VideoThumbnail from "./VideoThumbnail";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";
import RNThumbnail from "react-native-thumbnail";
import * as VideoThumbnails from "expo-video-thumbnails";
import makeThemeStyle from '../../Theme.js';

export default function JournalEntry() {
  const [media, setMedia] = useState(null);
  const [mediaBox, setMediaBox] = useState(false);
  const [mediaType, setMediaType] = useState();
  const [journalText, setJournalText] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [savedRecordingUri, setSavedRecordingUri] = useState("");
  const [showMediaBar, setShowMediaBar] = useState(true);
  const [videoThumbnail, setVideoThumbnail] = useState();
  const mediaAccessoryViewID = "MediaBar";
  const theme = makeThemeStyle();
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  const formattedDateTime = new Intl.DateTimeFormat('en-US', options).format(now);

  const submitJournal = async () => {
    Alert.alert(
      "Submit Journal",
      "Are you sure you want to share your journal?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Share",
          style: "destructive",
        },
      ]
    );
    const getCsrfToken = async () => {
      try {
        const response = await axios.get(`${API_URL}/csrf-token/`);
        return response.data.csrfToken;
      } catch (error) {
        console.error("Error retrieving CSRF token:", error);
        throw new Error("CSRF token retrieval failed");
      }
    };

    try {
      const csrfToken = await getCsrfToken();
      const response = await axios.post(
        `${API_URL}/post_journal/`, //hook will change
        {
          username: username,
          journalText: journalInput, //this will also change
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
        media,
        {
          time: 15000,
        }
      );
      // setImage(thumbnailUri);
      setVideoThumbnail(thumbnailUri);
      console.log('thumbnailUri', thumbnailUri);
    } catch (e) {
      console.warn(e);
    }
  };

  const deleteMedia = () => {
    setMedia(null);
    setMediaBox(false);
  };

  const handleRecordingComplete = (uri) => {
    console.log("Received saved from recording bar:", uri);
    setSavedRecordingUri(uri);
    setShowMediaBar(true);
    setMediaBox(true);
    setMedia(uri);
  };

  const handleMediaComplete = (uri) => {
    console.log("received data from mediabar", uri);
    setMedia(uri);
    setMediaBox(true);
    setMediaType("video");
    generateThumbnail;
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
          <Image source={{ uri: media }} style={styles.image} />
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
          {/* <Text>{toString(showMediaBar)}</Text> */}
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
