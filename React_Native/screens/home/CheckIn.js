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
  Animated,
} from "react-native";
import axios from "axios";
import RecordingAccessoryBar from "../../tools/RecordingBar.js";
import MediaAccessoryBar from "../../tools/MediaBar.js";
import ImageViewer from "../../tools/ImageViewer.js";
import VideoViewer from "../../tools/VideoViewer.js";
import RecordingViewer from "../../tools/RecordingViewer.js";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";
import * as FileSystem from "expo-file-system";
import { Buffer } from "buffer";
import RNPickerSelect from "react-native-picker-select";

// import { Video, ResizeMode, Audio } from "expo-av";
import makeThemeStyle from "../../tools/Theme.js";
import * as Storage from "../../AsyncStorage.js";
import IP_ADDRESS from "../../ip.js";
const API_URL = "http://" + IP_ADDRESS + ":8000";

export default function JournalEntry({ handleCancel, handleSubmitClose }) {
  const [username, setUsername] = useState("");
  const [momentType, setMomentType] = useState(3);
  const [mediaUri, setMediaUri] = useState(null);
  const [mediaBox, setMediaBox] = useState(false);
  const [mediaType, setMediaType] = useState("text");
  const [base64Data, setBase64Data] = useState("");
  const [journalText, setJournalText] = useState("");
  const [showMediaBar, setShowMediaBar] = useState(true);
  const [mediaChanged, setMediaChanged] = useState(false);
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
  // const [sound, setSound] = useState();
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
    // configureAudioMode();
  }, []);

  // async function configureAudioMode() {
  //   try {
  //     await Audio.setAudioModeAsync({
  //       allowsRecordingIOS: false,
  //       interruptionModeIOS: 1,
  //       playsInSilentModeIOS: true,
  //       interruptionModeAndroid: 1,
  //       shouldDuckAndroid: true,
  //       staysActiveInBackground: true,
  //       playThroughEarpieceAndroid: false,
  //     });
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  // async function playSound() {
  //   console.log("Loading Sound");
  //   const { sound } = await Audio.Sound.createAsync({ uri: mediaUri });
  //   setSound(sound);

  //   console.log("Playing Sound");
  //   await sound.playAsync();
  // }

  // useEffect(() => {
  //   return sound
  //     ? () => {
  //         console.log("Unloading Sound");
  //         sound.unloadAsync();
  //       }
  //     : undefined;
  // }, [sound]);

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
          content: base64Data,
          content_type: mediaType,
          text_entry: journalText,
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
    // setDisableSubmit(true);
    const base64String = await readFileAsBase64(uri);
    setBase64Data(base64String);
    setJournalText("");
    setMediaBox(true);
    setMediaChanged(!mediaChanged);
    setDisableSubmit(false);
  };

  const handleMediaComplete = async (mediaProp) => {
    console.log("received data from mediabar", mediaProp);
    setJournalText("");
    setMediaUri(mediaProp.assets[0].uri);
    setMediaType(mediaProp.assets[0].type);
    //sometimes mediaUri state doesn't update before next line
    //pass mediaProp.assets[0].uri directly to fix this
    setDisableSubmit(true);
    const base64String = await readFileAsBase64(mediaProp.assets[0].uri);
    setBase64Data(base64String);
    setMediaBox(true);
    setMediaChanged(!mediaChanged);
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

  const mediaBoxAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loadMediaContainer = () => {
      Animated.timing(mediaBoxAnim, {
        toValue: count, //final value
        duration: 1500, //update value in 500 milliseconds
        useNativeDriver: true,
      }).start();
    };
    loadMediaContainer;
  }, [showMediaBar]);

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
          testID="submitButton"
        >
          <Text
            style={
              disableSubmit ? styles.submitTextDisabled : styles.submitText
            }
          >
            Submit
          </Text>
        </TouchableOpacity>
        {/* <View
          style={[
            styles.separator,
            { borderBottomColor: theme["color"]["color"] },
          ]}
        /> */}
      </View>
      <View style={styles.horizontalBar} />
      {/* end of cancel/submit section */}

      {/* Main Container Section */}
      <ScrollView style={styles.contentContainer}>
        <Text style={styles.header}>Whacha checking in for?</Text>
        <Text style={[styles.datetime, theme["color"]]}>{formattedDateTime} </Text>

        {/* Media Box Below */}
        {mediaBox ? (
          <View style={styles.mediaContainer}>
            {mediaType === "image" ? (
              <ImageViewer
                source={mediaUri}
                onDelete={deleteMedia}
                dimensions={{ height: 60, width: 60 }}
              />
            ) : mediaType === "video" ? (
              <VideoViewer
                mediaUri={mediaUri}
                onDelete={deleteMedia}
                dimensions={{ height: 60, width: 60 }}
              />
            ) : (
              // <View style={styles.container}>
              //   <Button title="Play Sound" onPress={playSound} />
              // </View>
              <RecordingViewer
                uri={mediaUri}
                onDelete={deleteMedia}
                dimensions={{ height: 60, width: 60 }}
              />
            )}
            <ProgressBar onMediaChange={mediaChanged} />
          </View>
        ) : null}

        <View style={styles.boxContainer}>
          <Text style={[styles.boxDescriptor]}>Add a Title</Text>
          <TextInput
            style={[styles.title, theme["color"]]}
            placeholder="Write something..."
            placeholderTextColor="grey"
            testID="headerInput"
          ></TextInput>
        </View>
        
        <View style={styles.boxContainer}>
          <Text style={[styles.boxDescriptor]}>Check-in Type</Text>
          <View style={styles.dropdownContainer}>
            <RNPickerSelect
              style={pickerSelectStyles}
              value={selectedOption}
              placeholder={{ label: "Select Type Here..." }}
              placeholderTextColor="black"
              onValueChange={handleOptionChange}
              items={[
                { label: "Modeh Ani", value: "Modeh Ani" },
                { label: "Ashrei", value: "Ashrei" },
                { label: "Shema", value: "Shema" },
              ]}
            />
            {/* <Ionicons name="chevron-down" size={25} color={"#4A90E2"} style={{ paddingTop: 5 }}/> */}
          </View>
        </View>
        
        <View style={styles.boxContainer}>
          <Text style={[styles.boxDescriptor]}>Description</Text>
          <ScrollView style={[styles.dropdownContainer, {height: 350}]}>
              <TextInput
                style={styles.journalInput}
                inputAccessoryViewID={mediaAccessoryViewID}
                placeholder={"Enter reflection here…"}
                placeholderTextColor={"grey"}
                maxLength={10000}
                value={journalText}
                onChangeText={handleTextComplete}
                multiline
                numberOfLines={4}
                testID="journalInput"
              />
          </ScrollView> 
        </View>  
      </ScrollView>

      {/* <ScrollView keyboardDismissMode="interactive"> */} 

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

const ProgressBar = ({ onMediaChange }) => {
  const [progress, setProgress] = useState(() => new Animated.Value(0));
  const [parentWidth, setParentWidth] = useState(0);

  useEffect(() => {
    progress.setValue(0); // Reset progress to 0 without needing to re-create the Animated.Value
    console.log(parentWidth);
    if (parentWidth > 0) {
      Animated.timing(progress, {
        toValue: parentWidth,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }
  }, [parentWidth, onMediaChange]);

  const progressBarWidth = progress.interpolate({
    inputRange: [0, parentWidth],
    outputRange: ["0%", "100%"],
  });

  return (
    <View
      style={[stylesProgressBar.container, theme["background"]]}
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        setParentWidth(width);
      }}
    >
      <Animated.View
        style={[stylesProgressBar.progressBar, { width: progressBarWidth }]}
      />
    </View>
  );
};

const stylesProgressBar = StyleSheet.create({
  container: {
    height: 5,
    backgroundColor: "white",
    width: "100%",
    borderRadius: 5,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#4A90E2",
    borderBottomEndRadius: 5,
    borderBottomStartRadius: 5,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    // paddingVertical: 12,
    // padding: 16,
    // paddingHorizontal: 10,
    // fontWeight: "bold",
    // borderWidth: 1,
    // borderColor: 'grey',
    // borderRadius: 8,
    color: "grey",
    // fontSize: 30,
    // paddingRight: 30,
    // backgroundColor: "white",
    // width: "1000",
    // paddingTop: 20, // Adjust padding to move the text down
  },
  inputAndroid: {
    fontSize: 16,
    // paddingHorizontal: 10,
    // paddingVertical: 8,
    // borderWidth: 0.5,
    borderColor: "grey",
    // borderRadius: 8,
    // color: "black",
    // paddingRight: 30,
    // backgroundColor: "white",
    // paddingTop: 20, // Adjust padding to move the text down
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  contentContainer: {
    marginHorizontal: 15,
  },
  dropdownContainer: {
    borderColor: '#4A90E2',
    borderWidth: 2,
    borderRadius: 10,
    padding: 16,
    fontSize: 16,
    color: 'grey',
    // flexDirection: "row",
    // alignItems: "center",
    // backgroundColor: "green",
    // justifyContent: "space-around",
  },
  dropdownLabel: {
    marginRight: 10,
    fontSize: 15,
    paddingLeft: 14,
    // paddingTop: 10,
    textAlign: "left",
  },
  boxContainer: {
    paddingBottom: 20,
  },
  header: {
    marginTop: 15,
    fontSize: 28,
    fontWeight: 'bold',
  },
  datetime: {
    marginBottom: 15,
    fontSize: 16,
  },
  boxDescriptor: {
    fontSize: 16,
    fontWeight: 500,
    marginBottom: 10,

  },
  title: {
    borderColor: '#4A90E2',
    borderWidth: 2,
    borderRadius: 10,
    padding: 16,
    fontSize: 16,
    // fontWeight: "bold",
  },
  journalInput: {
    fontSize: 16,
  },
  scrollingInput: {
    flexGrow: 1,
  },
  mediaContainer: {
    // backgroundColor: "pink",
    // alignItems: "center",
    // paddingHorizontal: 10,
    // paddingTop: 5,
    marginBottom: 10,
    // borderRadius: 5,
    // marginHorizontal: Dimensions.get("window").width / 2.55,
    width: 60,
    height: 60,
  },
  mediaContainerUpper: {
    // flexDirection: "row",
    // justifyContent: "space-between",
    // alignItems: "center",
    // backgroundColor: "red",
    // marginBottom: 5,
    // paddingHorizontal: 10,
  },
  image: {
    width: 50,
    height: 50,
    marginTop: 20,
    backgroundColor: "black",
    // flex: 1,
  },
  video: {
    alignSelf: "center",
    width: "100%",
    height: 60,
    borderTopRightRadius: 5,
    borderTopLeftRadius: 5,
  },
  deleteMedia: {
    justifyContent: "center",
    marginTop: 10,
    // flex: 1,
  },
  separator: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginVertical: 10,
  },
  topBar: {
    flexDirection: "row",
    marginTop: 5,
    marginRight: 15,
    justifyContent: "space-between",
    alignItems: "center",
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
