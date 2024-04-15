import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Keyboard,
  Button,
  Dimensions,
  KeyboardAvoidingView,
  TextInput,
  Text,
  InputAccessoryView,
  ScrollView,
  Image,
  SafeAreaView,
  Platform,
  Animated,
  Modal,
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

export default function EditCheckIn({ editModalVisible, setEditModalVisible, selectedEntry, modalVisible, closeModal }) {
  const [checkin_id, setCheckin_id] = useState("");
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
  const [disableUpdate, setDisableUpdate] = useState(true);
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

  useEffect(() => {
    setCheckin_id(selectedEntry.checkin_id);

    //sets media uri 
    if(selectedEntry?.content_type === "image")
    {
      setMediaUri(`data:image/jpeg;base64,${selectedEntry?.content}`);
      console.log("set mediaUri to passed in image");
    }
    if(selectedEntry?.content_type === "video")
    {
      setMediaUri(`data:video/mp4;base64,${selectedEntry?.content}`);
      console.log("set mediaUri to passed in video");
    }
    if(selectedEntry?.content_type === "recording")
    {
      setMediaUri(`data:audio/mp3;base64,${selectedEntry?.content}`);
      console.log("set mediaUri to passed in audio");
    }
  }, []);

  useEffect(() => {
    if (selectedEntry.content_type && selectedEntry.content_type !== "text") {
        setMediaBox(true);
    }
    }, [selectedEntry.content_type]);

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

  const updateJournal = async () => {
    console.log("updating journal entry");
    let base64JournalText = "";
    if (mediaType === "text") {
      base64JournalText = textToBase64(journalText);
      setBase64Data(base64JournalText);
    }
    console.log("check in type: ", mediaType);
    try {
      const csrfToken = await getCsrfToken();
      const response = await axios.post(
        `${API_URL}/update_checkin_info/`,
        {
          username: username,
          checkin_id: checkin_id,
          content: base64Data,
          header: headerText,
          content_type: mediaType,
          text_entry: journalText,
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
      // Check for successful update and close modal
      setEditModalVisible(false);
    } catch (error) {
      console.log(error);
      console.error("Journal Error:", error.response.data);
    }
  };  

  const deleteMedia = () => {
    setMediaUri(null);
    setMediaBox(false);
    setMediaType("text");
    setDisableUpdate(journalText.trim().length === 0);
  };

  const handleRecordingComplete = async (uri) => {
    console.log("Received saved from recording bar:", uri);
    setShowMediaBar(true);
    setMediaUri(uri);
    setMediaType("recording");
    // setDisableUpdate(true);
    const base64String = await readFileAsBase64(uri);
    setBase64Data(base64String);
    setJournalText("");
    setMediaBox(true);
    setMediaChanged(!mediaChanged);
    setDisableUpdate(false);
  };

  const handleMediaComplete = async (mediaProp) => {
    console.log("received data from mediabar", mediaProp);
    setMediaUri(mediaProp.assets[0].uri);
    setMediaType(mediaProp.assets[0].type);
    //sometimes mediaUri state doesn't update before next line
    //pass mediaProp.assets[0].uri directly to fix this
    setDisableUpdate(true);
    const base64String = await readFileAsBase64(mediaProp.assets[0].uri);
    setBase64Data(base64String);
    setMediaBox(true);
    setMediaChanged(!mediaChanged);
    setDisableUpdate(false);
  };

  const handleTextComplete = (text) => {
    setJournalText(text);
    console.log(text);
    setDisableUpdate(text.trim().length === 0);
  };

  const handleToggle = (toggle) => {
    console.log("journal side:", toggle);
    setShowMediaBar(!toggle);
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

  const getMomentText = (momentNumber) => {
    switch (momentNumber) {
      case 1:
        return "Modeh Ani";
      case 2:
        return "Ashrei";
      case 3:
        return "Shema";
      default:
        return "Unknown Check-in Type";
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={editModalVisible}
      onRequestClose={() => setEditModalVisible(false)}
    >      
        <SafeAreaView style={[styles.container]}>
            {/* View for cancel and update buttons */}
            <View style={styles.topBar}>
                <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                    <View style={styles.buttonContent}>
                    <Ionicons name="caret-back" size={25} color="#4A90E2" />
                    <Text style={styles.cancelText}>Cancel</Text>
                    </View>
                </TouchableOpacity>
                </View>

                <TouchableOpacity
                disabled={disableUpdate}
                style={styles.updateButton}
                onPress={updateJournal}
                testID="updateButton"
                >
                <Text
                    style={
                    disableUpdate ? styles.updateTextDisabled : styles.updateText
                    }
                >
                    Update
                </Text>
                </TouchableOpacity>
            </View>
            <View style={styles.horizontalBar} />
            {/* end of cancel/update section */}

            {/* Main Container Section */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={[styles.container]}
            >
              <ScrollView style={styles.contentContainer}>
                <Text style={styles.header}>Update CheckIn Moment!</Text>
                <Text style={[styles.datetime, theme["color"]]}>
                {formattedDateTime}{" "}
                </Text>

                {/* Media Box Below */}
                {mediaBox ? (
                <View style={styles.mediaContainer}>
                    {mediaType === "image" ? (
                      <ImageViewer
                          source={mediaUri}
                          onDelete={deleteMedia}
                          dimensions={{ height: 60, width: 60 }}
                          onMediaChange={mediaChanged}
                      />
                    ) : mediaType === "video" ? (
                      <VideoViewer
                        mediaUri={mediaUri}
                        onDelete={deleteMedia}
                        dimensions={{ height: 60, width: 60 }}
                      />
                    ) : mediaType === "recording" ? (
                      <RecordingViewer
                        uri={mediaUri}
                        onDelete={deleteMedia}
                        dimensions={{ height: 60, width: 60 }}
                      />
                    ) : selectedEntry?.content_type === "image" ? (
                      <ImageViewer
                        source={mediaUri}
                        style={[styles.JournalEntryModalImage,]}
                        onDelete={deleteMedia}
                        // dimensions={{ height: 60, width: 60 }}
                        onMediaChange={mediaChanged}
                      />
                    ) : selectedEntry?.content_type === "video" ? (
                      <VideoViewer
                        source={mediaUri}
                        onDelete={deleteMedia}
                        dimensions={{ height: 60, width: 60 }}
                      />
                    ) : (
                      <RecordingViewer
                        source={mediaUri}
                        onDelete={deleteMedia}
                        style={{ height: 60, width: 60, borderRadius: 5 }}
                      />
                    ) }
                    <ProgressBar onMediaChange={mediaChanged} />
                </View>
                ) : null}

                {/* Checkin type */}
                <View style={styles.boxContainer}>
                    <Text style={[styles.boxDescriptor]}>Check-in Type *not subject to change</Text>
                    <View style={styles.dropdownContainer}>
                        <Text>
                            {getMomentText(selectedEntry?.moment_number)}
                        </Text> 
                    </View>
                </View>
                
                {/* Description */}
                <View style={styles.boxContainer}>
                    <Text style={[styles.boxDescriptor]}>Description</Text>
                    <ScrollView style={[styles.dropdownContainer, { height: 350 }]}>
                        <TextInput
                        style={styles.journalInput}
                        inputAccessoryViewID={mediaAccessoryViewID}
                        maxLength={10000}
                        onChangeText={handleTextComplete}
                        multiline
                        numberOfLines={4}
                        testID="journalInput"
                        >
                            {selectedEntry.text_entry}
                        </TextInput>
                    </ScrollView>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>

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
    </Modal>
    
  );
}

const ProgressBar = ({ onMediaChange }) => {
  const [progress, setProgress] = useState(() => new Animated.Value(0));
  const [parentWidth, setParentWidth] = useState(0);

  useEffect(() => {
    progress.setValue(0); // Reset progress to 0 without needing to re-create the Animated.Value
    console.log("parentWidth: ", parentWidth);
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
    backgroundColor: "white",
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
  updateButton: {},
  updateText: {
    color: "#4A90E2",
    fontSize: 19,
  },
  updateTextDisabled: {
    color: "grey",
    fontSize: 19,
  },
  horizontalBar: {
    height: 1,
    backgroundColor: "#ccc",
    marginTop: 15,
  },
  JournalEntryModalImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 5,
  },
});
