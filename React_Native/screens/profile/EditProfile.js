import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Image,
  ImageViewer,
  Modal,
  Pressable,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  SafeAreaView,
  Animated,
  Dimensions,
} from "react-native";
import * as Storage from "../../AsyncStorage.js";
import axios from "axios";
import { SvgXml } from "react-native-svg";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";
import IP_ADDRESS from "../../ip.js";
import * as FileSystem from "expo-file-system";
import { Icon } from "react-native-elements";

const API_URL = "http://" + IP_ADDRESS + ":8000";

const EditProfile = ({ navigation, onSwitch }) => {
  const [userInfo, setUserInfo] = useState({
    fname: "",
    lname: "",
    username: "",
    password: "",
    email: "",
    originalUsername: "",
    //dateJoined: "January 1, 2021",
    //journalEntries: 120,
    profilePicture: "",
  });
  const layout = Dimensions.get("window");
  const translateX = useRef(new Animated.Value(layout.width)).current;

  const [errorMessage, setErrorMessage] = useState(null);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const navigateProfileView = () => {
    if (onSwitch) {
      onSwitch();
    }
  };

  const saveUserInfo = async () => {
    await Storage.setItem("@username", userInfo.username);
    await Storage.setItem("@email", userInfo.email);
    await Storage.setItem("@first_name", userInfo.fname);
    await Storage.setItem("@last_name", userInfo.lname);
    await Storage.setItem("@profilePicture", userInfo.profilePicture);
    await Storage.setItem("@password", userInfo.password);
    console.log("successfully saved user info: ", userInfo.username);
  };

  const getUser = async () => {
    const storedUsername = await Storage.getItem("@username");
    const storedEmail = await Storage.getItem("@email");
    const storedFirstName = await Storage.getItem("@first_name");
    const storedLastName = await Storage.getItem("@last_name");
    const storedProfilePicture = await Storage.getItem("@profilePicture");
    const storedPassword = await Storage.getItem("@password");

    setUserInfo((prevState) => ({
      ...prevState,
      username: storedUsername || "",
      originalUsername: storedUsername || "", //dont update this value after retrieval
      password: storedPassword || "",
      fname: storedFirstName || "",
      lname: storedLastName || "",
      profilePicture: storedProfilePicture || "",
      email: storedEmail || "",
    }));
    console.log("successfully retrieved user");
  };

  const [updateProfilePicture, setUpdateProfilePicture] = useState(false);

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

  const [newPassword, setNewPassword] = useState("");

  const handleChangePassword = () => {
    // Implement password change logic here
    console.log("Password changed to:", newPassword);
    // Reset password field
    setNewPassword("");
  };

  const handleEditProfilePicture = () => {
    Alert.alert("Media Type", "", [
      { text: "Camera Roll", onPress: () => pickMedia() },
      { text: "Take Photo", onPress: () => takeMedia() },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleUpdateUser = async () => {
    setLoadingSubmit(true);
    setErrorMessage(<ActivityIndicator />);
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
      const requestData = {
        username: userInfo.originalUsername,
        newusername: userInfo.username,
        firstname: userInfo.fname,
        lastname: userInfo.lname,
        email: userInfo.email,
      };
      // Conditionally include profile picture if it exists
      if (updateProfilePicture) {
        requestData.profilepicture = userInfo.profilePicture
          ? userInfo.profilePicture
          : undefined;
      }
      const response = await axios.post(
        `${API_URL}/update_user_information/`,
        requestData,
        {
          headers: {
            "X-CSRFToken": csrfToken,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      console.log("update profile response:", response.data);
      setLoadingSubmit(false);
      saveUserInfo();
      navigateProfileView();
    } catch (error) {
      console.log(error);
      setErrorMessage(
        <View style={styles.errorMessageBox}>
          <Text style={styles.errorMessageText}>{error.response.data}</Text>
        </View>
      );
      Alert.alert("Error Updating Profile!", error.response.data, [{ text: "OK" }]);
      setLoadingSubmit(false);
      console.error("Update Profile error:", error.response.data);
    }
  };

  const pickMedia = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setUpdateProfilePicture(true);
      const base64String = await readFileAsBase64(result.assets[0].uri);
      setUserInfo((prevUserInfo) => ({
        ...prevUserInfo,
        profilePicture: base64String,
      }));
      await Storage.setItem("@profilePicture", base64String);
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
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // This will still default to capturing images
      allowsEditing: true, // Only applies to images
      aspect: [4, 3],
      quality: 1,
    });

    if (result && !result.cancelled) {
      setUpdateProfilePicture(true);
      const base64String = await readFileAsBase64(result.assets[0].uri);
      setUserInfo((prevUserInfo) => ({
        ...prevUserInfo,
        profilePicture: base64String,
      }));
      await Storage.setItem("@profilePicture", base64String);
    }
  };

  useEffect(() => {
    getUser();
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{ ...styles.overallContainer, transform: [{ translateX }] }}
    >
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={navigateProfileView}
        >
          <View style={styles.buttonContent}>
            <Ionicons name="caret-back" size={25} color="white" />
            <Text style={styles.submitText} testID="cancelButton">Cancel</Text>
          </View>
        </TouchableOpacity>
        {loadingSubmit ? (
          <View style={styles.ActivityIndicator}>
            <ActivityIndicator color={"white"} />
          </View>
        ) : (
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleUpdateUser}
          >
            <Text style={styles.submitText} testID="submitButton">Submit</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.profilePicContainer}>
        <TouchableOpacity onPress={handleEditProfilePicture}>
          <Image
            style={styles.profilePic}
            source={{
              uri: `data:image/jpeg;base64,${userInfo?.profilePicture}`,
            }}
          />
          <View style={styles.cameraIcon}>
            <Ionicons name="camera" size={28} color="white" />
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.userInfoContainer}>
        <Text style={styles.info} testID="nameInput">
          @{userInfo.username}
        </Text>
        <View style={styles.userInfoContainerLower}>
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}> Edit Account</Text>
            <View style={styles.horizontalLine} />
          </View>
          <View
            style={{
              flexDirection: "row",
              width: "100%",
              paddingHorizontal: 5,
            }}
          >
            <Ionicons name="create" size={25} color="#4A90E2" />
            <View style={styles.textInput}>
              <Text style={styles.inputLabel}>First Name:</Text>
              <TextInput
                style={styles.input}
                testID="fnameInput"
                placeholder="Type Here..."
                onChangeText={(text) =>
                  setUserInfo((prevUserInfo) => ({
                    ...prevUserInfo,
                    fname: text,
                  }))
                }
              >
                {userInfo.fname}
              </TextInput>
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              width: "100%",
              paddingHorizontal: 5,
            }}
          >
            <Ionicons name="create" size={25} color="#4A90E2" />
            <View style={styles.textInput}>
              <Text style={styles.inputLabel}>Last Name:</Text>
              <TextInput
                style={styles.input}
                testID="fnameInput"
                placeholder="Type Here..."
                onChangeText={(text) =>
                  setUserInfo((prevUserInfo) => ({
                    ...prevUserInfo,
                    lname: text,
                  }))
                }
              >
                {userInfo.lname}
              </TextInput>
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              width: "100%",
              paddingHorizontal: 5,
            }}
          >
            <Ionicons name="create" size={25} color="#4A90E2" />
            <View style={styles.textInput}>
              <Text style={styles.inputLabel}>Email:</Text>
              <TextInput
                style={styles.input}
                testID="emailInput"
                placeholder="Type Here..."
                onChangeText={(text) =>
                  setUserInfo((prevUserInfo) => ({
                    ...prevUserInfo,
                    email: text,
                  }))
                }
              >
                {userInfo.email}
              </TextInput>
            </View>
          </View>
          {/* <Badges /> */}
        </View>
      </View>
    </Animated.View>
  );
};


const styles = StyleSheet.create({
  overallContainer: {
    flex: 1,
    //justifyContent: "center",
    alignItems: "center",
    paddingTop: 20,
    backgroundColor: "#4A90E2",
    // position: "absolute",
  },
  userInfoContainer: {
    marginTop: -80,
    paddingTop: 90,
    paddingHorizontal: 20,
    backgroundColor: "#ececf6",
    width: "100%",
    // height: "100%",
    borderTopLeftRadius: 65,
    borderTopRightRadius: 65,
    alignItems: "center",
    zIndex: -2,
  },
  userInfoContainerLower: {
    marginTop: 20,
    // backgroundColor: "white",
    width: "100%",
    height: "100%",
  },
  profilePic: {
    width: 150,
    height: 150,
    borderRadius: 75,
    // marginBottom: 20,
    zIndex: 3,
    zIndex: -1,
    elevation: 1,
    // borderWidth: 2,
    // borderColor: "#4A90E2",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 10,
    right: -12,
    backgroundColor: "#4A90E2",
    borderRadius: 25,
    padding: 8,
  },
  info: {
    fontSize: 16,
    color:"#4A90E2",
  },

  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    backgroundColor: "#4A90E2",
  },
  topBar: {
    // alignItems: "",
    justifyContent: "space-between",
    width: "100%",
    flexDirection: "row",
    // backgroundColor: "red",
    paddingHorizontal: 20,
  },
  submitButton: {
    // marginRight: 20,
    justifyContent: "flex-end",
  },
  ActivityIndicator: {
    marginRight: 20,
  },
  submitText: {
    color: "white",
    fontSize: 19,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    fontSize: 19,
  },
  textInput: {
    flexDirection: "row",
    // marginTop: 5,
    borderStyle: "solid",
    borderBottomColor: "#e8bd25",
    borderBottomWidth: 2,
    marginBottom: 20,
    width: "90%",
  },
  inputLabel: {
    // width: "30%",
    // backgroundColor: "blue",
    color: "#9e9e9e",
    fontSize: 18,
    // fontWeight: "bold",
  },
  input: {
    width: "100%",
    // backgroundColor: "red",
    fontSize: 18,
    color:"#4A90E2",
  },
  sectionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    // paddingVertical: 12,
    fontSize: 14,
    fontWeight: "600",
    color: "#9e9e9e",
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  horizontalLine: {
    flex: 1,
    height: 1.25,
    backgroundColor: "#9e9e9e",
    marginLeft: 8, // Adjust spacing between title and line
  },
});

export default EditProfile;
