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
import { Buffer } from "buffer";
import RNPickerSelect from 'react-native-picker-select';


import { Video, ResizeMode, Audio } from "expo-av";
import makeThemeStyle from "../../Theme.js";
import * as Storage from "../../AsyncStorage.js";
import IP_ADDRESS from "../../ip.js";
const API_URL = "http://" + IP_ADDRESS + ":8000";

export default function JournalEntry({handleCancel, handleSubmitClose}) {
  const [username, setUsername] = useState("");
  const [momentType, setMomentType] = useState(3);
  const [mediaUri, setMediaUri] = useState(null);
  const [mediaBox, setMediaBox] = useState(false);
  const [mediaType, setMediaType] = useState("text");
  const [base64Data, setBase64Data] = useState("");
  const [journalText, setJournalText] = useState("");
  const [showMediaBar, setShowMediaBar] = useState(true);
  const [selectedOption, setSelectedOption] = useState("");
  const [disableSubmit, setDisableSubmit] = useState(true);
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
    }
  };

  const submitJournal = async () => {
    let base64JournalText = "";
    if (mediaType === "text") {
      base64JournalText = textToBase64(journalText);
      setBase64Data(base64JournalText);
    }
    console.log("check in type: ", mediaType);
    try {
      const csrfToken = await getCsrfToken();
      const response = await axios.post(
        `${API_URL}/check-in/`,
        {
          username: username,
          moment_number: momentType,
          content: mediaType === "text" ? base64JournalText : base64Data,
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
      //on successful submit close the page
      if (handleSubmitClose) {
        handleSubmitClose(true);
      }
    } catch (error) {
      console.log(error);
      console.error("Journal Error:", error.response.data);
    }
  };

  const deleteMedia = () => {
    setMediaUri(null);
    setMediaBox(false);
    setMediaType("text");
    setDisableSubmit(journalText.trim().length === 0);
  };

  const handleRecordingComplete = async (uri) => {
    console.log("Received saved from recording bar:", uri);
    setShowMediaBar(true);
    setMediaUri(uri);
    setMediaType("recording");
    setDisableSubmit(true);
    const base64String = await readFileAsBase64(uri);
    setBase64Data(base64String);
    setMediaBox(true);
    setDisableSubmit(false);
  };

  const handleMediaComplete = async (mediaProp) => {
    console.log("received data from mediabar", mediaProp);
    setMediaUri(mediaProp.assets[0].uri);
    setMediaType(mediaProp.assets[0].type);
    //sometimes mediaUri state doesn't update before next line
    //pass mediaProp.assets[0].uri directly to fix this
    setDisableSubmit(true);
    const base64String = await readFileAsBase64(mediaProp.assets[0].uri);
    setBase64Data(base64String);
    setMediaBox(true);
    setDisableSubmit(false);
  };

  const handleTextComplete = (text) => {
    setJournalText(text);
    console.log(text);
    setDisableSubmit(text.trim().length === 0);
  };

  const handleToggle = (toggle) => {
    console.log("journal side:", toggle);
    setShowMediaBar(!toggle);
  };

  const handleOptionChange = (itemValue) => {
    setSelectedOption(itemValue);
    if (itemValue === "Modeh Ani") {
      setMomentType(1);
    } else if (itemValue === "Ashrei") {
      setMomentType(2);
    } else if (itemValue === "Shema") {
      setMomentType(3);
    }
  };


  return (
    <SafeAreaView style={[styles.container, theme["background"]]}>
      {/* View for cancel and submit buttons */}
      <View style={styles.topBar}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleCancel}>
            <View style={styles.buttonContent}>
              <Ionicons name="caret-back" size={25} color="#4A90E2" />
              <Text style={styles.cancelText}>Cancel</Text>
            </View>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          disabled={disableSubmit}
          style={styles.submitButton}
          onPress={submitJournal}
        >
          <Text style={disableSubmit ? styles.submitTextDisabled : styles.submitText}>
            Submit
          </Text>
        </TouchableOpacity>
      </View>
      {/* <View style={styles.horizontalBar} /> */}
      {/* end of cancel/submit section */}
      {/* <TextInput
        style={[styles.title, theme["color"]]}
        placeholder="Header..."
        placeholderTextColor="grey"
        testID="headerInput"
      ></TextInput> */}
      <View
        style={[
          styles.separator,
          { borderBottomColor: theme["color"]["color"] },
        ]}
      />
      <View style={styles.dropdownContainer}>
        {/* <Text style={styles.dropdownLabel}>Select a prayer:</Text> */}
        <RNPickerSelect
          style={pickerSelectStyles}
          value={selectedOption}
          placeholder={{ label: "Modeh Ani", value: "Modeh Ani" }}
          onValueChange={handleOptionChange}
          items={[
            // { label: "Modeh Ani", value: "Modeh Ani" },
            { label: "Ashrei", value: "Ashrei" },
            { label: "Shema", value: "Shema" },
          ]}
        />
      </View>
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
              <Text>Video</Text>
            </View>
          ) : (
            <View style={styles.container}>
              <Button title="Play Sound" onPress={playSound} />
            </View>
          )}

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
            onChangeText={handleTextComplete}
            multiline
            numberOfLines={4}
            testID="journalInput"
          />
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

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 15,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    // borderColor: 'grey',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30,
    backgroundColor: 'white',
    width: "1000"
    // paddingTop: 20, // Adjust padding to move the text down
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'grey',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30,
    backgroundColor: 'white',
    paddingTop: 20, // Adjust padding to move the text down
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  dropdownContainer: {
    flexDirection: "row",
    alignItems: "center",
    // marginBottom: 10,
    marginTop: 5,
    // backgroundColor: "green",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  dropdownLabel: {
    marginRight: 10,
    fontSize: 15,
    paddingLeft: 14,
    // paddingTop: 10,
    textAlign: "left",
  },
  RPNpicker: {
    paddingTop: 10,
  },
  journalInput: {
    marginTop: 10,
    borderRadius: 5,
    padding: 10,
    color: "white",
    height: "100%",
    marginHorizontal: 5,
  },
  scrollingInput: {
    flexGrow: 1,
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

  topBar: {
    flexDirection: "row",
    margin: 10,
    justifyContent: "space-between",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    fontSize: 19,
  },
  cancelText: {
    fontSize: 19,
    color: "#4A90E2",
  },
  submitButton: {},
  submitText: {
    color: "#4A90E2",
    fontSize: 19,
  },
  submitTextDisabled: {
    color: "grey",
    fontSize: 19,
  },
  horizontalBar: {
    height: 1,
    backgroundColor: "#ccc",
    marginTop: 15,
  },
});
