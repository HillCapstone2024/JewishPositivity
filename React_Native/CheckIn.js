import * as ImagePicker from "expo-image-picker";
import React, { useState, useEffect } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";
import * as Storage from "./AsyncStorage.js";

export default function JournalEntry() {
  const [username, setUsername] = useState("");
  const [media, setMedia] = useState(null);
  const [mediaBox, setMediaBox] = useState(false);
  const [mediaType, setMediaType] = useState();
  const [journalText, setJournalText] = useState();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [imageUri, setImageUri] = useState(null);
  const [checkInType, setCheckInType] = useState("");
  const inputAccessoryViewID = "cameraBar";

  const hideKeyboard = () => {
    Keyboard.dismiss();
  };

  useEffect(() => {
    const loadUsername = async () => {
      const storedUsername = await Storage.getItem("@username");
      setUsername(storedUsername || "No username");
    };

    loadUsername();
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      (e) => {
        console.log("keyboard activated");
        setKeyboardHeight(e.endCoordinates.height);
        console.log(e.endCoordinates.height);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        console.log("keyboard hidden");
        setKeyboardHeight(0);
        console.log(keyboardHeight);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

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
    setMediaType(null);
  };

  const recordMedia = async () => {
    console.log("recording media");
  };

  const pickMedia = async () => {
    const galleryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!galleryPermission.granted) {
      alert("Permissions to access camera and microphone are required!");
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All, // Allows both videos and images
      allowsEditing: true, // Only applies to images
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setMedia(result.assets[0].uri);
      console.log("result: ", result);
      setMediaBox(true);
      setMediaType(result.asset[0].type)
    }
  };

  const takeMedia = async () => {
    // Request camera and microphone permissions if not already granted
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (!cameraPermission.granted) {
      alert("Permissions to access camera and microphone are required!");
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All, // This will still default to capturing images
      allowsEditing: true, // Only applies to images
      aspect: [4, 3],
      quality: 1,
    });

    if (result && !result.cancelled) {
      setMedia(result.assets[0].uri);
      console.log('result: ',result);
      setMediaBox(true);
      setMediaType(result.asset[0].type);
    }
  };

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
        <TextInput
          style={styles.journalInput}
          inputAccessoryViewID={inputAccessoryViewID}
          placeholder={"Please type here…"}
          value={journalText}
          onChange={(text) => setJournalText(text)}
          multiline
          numberOfLines={4}
        />
      </ScrollView>

      {/* Keyboard bar view below */}
      <InputAccessoryView nativeID={inputAccessoryViewID}>
        <View style={styles.barContainer}>
          <View style={{ flex: 1 }}>
            <TouchableOpacity style={styles.barButton} onPress={recordMedia}>
              <Ionicons name="mic" size={25} color="white" />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }}>
            <TouchableOpacity style={styles.barButton} onPress={takeMedia}>
              <Ionicons name="camera" size={25} color="white" />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }}>
            <TouchableOpacity style={styles.barButton} onPress={pickMedia}>
              <Ionicons name="images" size={25} color="white" />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }}>
            <TouchableOpacity style={styles.barButton} onPress={hideKeyboard}>
              <Ionicons name="checkmark-circle" size={25} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </InputAccessoryView>
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
    alignSelf: 'stretch',
    flexDirection: 'row',
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
    flexGrow: 1
  },
  submitButton: {
    color: 'black',
    fontSize: '14',
    backgroundColor: 'white',
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
