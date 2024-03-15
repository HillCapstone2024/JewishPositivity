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
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Audio } from "expo-av";

export default function JournalEntry() {
  const [media, setMedia] = useState(null);
  const [mediaBox, setMediaBox] = useState(false);
  const [mediaType, setMediaType] = useState();
  const [journalText, setJournalText] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [savedRecordingUri, setSavedRecordingUri] = useState("");
  const [showMediaBar, setShowMediaBar] = useState(false);

  const mediaAccessoryViewID = "MediaBar";

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
    console.log('received data from mediabar', uri);
    setMedia(uri);
    setMediaBox(true);
  }

  const handleToggle = (toggle) => {
    console.log('journal side:', toggle);
    setShowMediaBar(!toggle);
  }

  return (
    <SafeAreaView style={styles.overallcontainter}>
      {/* <ScrollView keyboardDismissMode="interactive"> */}
      {/* Media Box Below */}
      {mediaBox ? (
        <View style={styles.mediaContainer}>
          <Image source={{ uri: media }} style={styles.image} />
          <TouchableOpacity style={styles.deleteMedia} onPress={deleteMedia}>
            <Ionicons name="close-circle" size={25} color="white" />
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
            value={journalText}
            onChange={(text) => setJournalText(text)}
            multiline
            numberOfLines={4}
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
  overallcontainter: {
    // justifyContent: "flex-end", // Pushes the TextInput to the bottom
    // paddingBottom: 20,
    backgroundColor: "#4F8EF7",
  },
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
  hiddenInput: {
    position: "absolute",
    top: -1000, // Position it off-screen
    left: 0,
    width: 1,
    height: 1,
  },
});
