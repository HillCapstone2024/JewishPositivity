import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, Button, Image } from "react-native";
import * as Storage from "../../AsyncStorage.js";
import { createAvatar } from "@dicebear/core";
import axios from "axios";
import { micah } from "@dicebear/collection";
import { SvgXml } from "react-native-svg";
import * as ImagePicker from "expo-image-picker"; 
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";
import IP_ADDRESS from "../../ip.js";
import { Alert } from "react-native";
import { KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform } from "react-native";
import { ActivityIndicator } from "react-native";
import { xml } from "@dicebear/core/lib/utils/license.js";
 
const API_URL = "http://" + IP_ADDRESS + ":8000";

const EditProfile = ({navigation, onSwitch}) => {
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

  const [errorMessage, setErrorMessage] = useState(null);

  const navigateProfileView = () => {
    if (onSwitch) {
      onSwitch();
    }
  }

  const saveUsername = async () => {
    await Storage.setItem("@username", userInfo.username);
    console.log("successfully saved username: ", userInfo.username);
  };

  const avatar = createAvatar(micah, {
    seed: userInfo.originalUsername,
    radius: 50,
    mouth: ["smile", "smirk", "laughing"],
  }).toString();


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
      const response = await axios.post(
        `${API_URL}/update_user_information/`,
        {
          username: userInfo.originalUsername,
          newusername: userInfo.username,
          //password: ,
          //reentered_password: reentered_password,
          firstname: userInfo.fname,
          lastname: userInfo.lname,
          email: userInfo.email,
          profilePicture: userInfo.profilePicture ? userInfo.profilePicture : undefined,
        },
        {
          headers: {
            "X-CSRFToken": csrfToken,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      console.log("update profile response:", response.data);
      saveUsername();
      //navigateProfileView();
    } catch (error) {
      console.log(error)
      setErrorMessage(
        <View style={styles.errorMessageBox}>
          <Text style={styles.errorMessageText}>{error.response.data}</Text>
        </View>
      );
      console.error("Update Profile error:", error.response.data);
    }
  };

  const pickMedia = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.All, // Allows both videos and images
    allowsEditing: true, // Only applies to images
    aspect: [4, 3],
    quality: 1,
    });

    if (!result.cancelled) {
    console.log(result.assets[0].uri);
    setUserInfo(prevUserInfo => ({
      ...prevUserInfo,
      profilePicture: result.assets[0].uri,
    }));
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
        setUserInfo(prevUserInfo => ({
          ...prevUserInfo,
          profilePicture: result.assets[0].uri,
        }));
    }
};

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const storedUsername = await Storage.getItem("@username");
        setUserInfo(prevState => ({
          ...prevState,
          username: storedUsername || "",
          originalUsername: storedUsername || "", //dont update this value after retrieval 
        }));
        const csrfToken = await getCsrfToken();

        const response = await axios.get(`${API_URL}/get_user_info/`, {
          params: {
            username: storedUsername,
          },
          headers: {
            "X-CSRFToken": csrfToken,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });
  
        //console.log("Response fname:", response.data);
        setUserInfo(prevUserInfo => ({
          ...prevUserInfo,
          fname: response.data.first_name, 
          lname: response.data.last_name,
          email:  response.data.email,
          password: response.data.password,
          //profilePicture: response.data.profilePicture,
        }));
      } catch (error) {
        handleUserInfoError(error);
      }
    };
  
    const handleUserInfoError = (error) => {
      console.log(error);
      setErrorMessage(
        <View style={styles.errorMessageBox}>
          <Text style={styles.errorMessageText}>{error.response.data}</Text>
        </View>
      );
      console.error("Error Loading User:", error.response.data);
    };
  
    const getCsrfToken = async () => {
      try {
        const response = await axios.get(`${API_URL}/csrf-token/`);
        return response.data.csrfToken;
      } catch (error) {
        handleCsrfTokenError(error);
      }
    };
  
    const handleCsrfTokenError = (error) => {
      console.error("Error retrieving CSRF token:", error);
      setErrorMessage(
        <View style={styles.errorMessageBox}>
          <Text style={styles.errorMessageText}>
            CSRF token retrieval failed
          </Text>
        </View>
      );
      throw new Error("CSRF token retrieval failed");
    };
  
    loadUserInfo();
  
  }, []);
  

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, theme["background"]]}
    >
      <TouchableOpacity onPress={handleEditProfilePicture} >
        <View style={styles.profilePicContainer}>
        {userInfo.profilePicture && userInfo.profilePicture.trim != "" ? (
          <Image source={{ uri: userInfo.profilePicture }} style={styles.profilePic} />
        ) : (
          <SvgXml xml={avatar} style={styles.profilePic} /> 
        )}
        <View style={styles.cameraIcon}>
         <Ionicons name="camera" size={24} color="black" />
        </View>
      </View>

        </TouchableOpacity>
        {<Text style={styles.attribute} >First Name:</Text>}
        <TextInput
          style={styles.info}
          placeholder="First Name"
          onChangeText = {(text) =>   setUserInfo(prevUserInfo => ({
                                      ...prevUserInfo,
                                      fname: (text), 
                                    }))}

        >{userInfo.fname}</TextInput>
        {<Text style={styles.attribute} >Last Name:</Text>}
        <TextInput
          style={styles.info}
          placeholder="Last Name"
          onChangeText = {(text) =>   setUserInfo(prevUserInfo => ({
                                      ...prevUserInfo,
                                      lname: (text), 
                                    }))}

        >{userInfo.lname}</TextInput>
        {<Text style={styles.attribute} >Username:</Text>}
        <TextInput
          style={styles.info}
          placeholder="Username"
          onChangeText = {(text) =>   setUserInfo(prevUserInfo => ({
                                      ...prevUserInfo,
                                      username: (text), 
                                    }))}

        >{userInfo.username}</TextInput>
        {<Text style={styles.attribute} >Email:</Text>}
        <TextInput
          style={styles.info}
          placeholder="Email"
          onChangeText = {(text) =>   setUserInfo(prevUserInfo => ({
                                      ...prevUserInfo,
                                      email: (text), 
                                    }))}

        >{userInfo.email}</TextInput>
        <View style={{ flexDirection: "column", width:"80%" }}>
        <TouchableOpacity style={styles.button} onPress={handleUpdateUser}>
              <Text style={styles.buttonText}>Update Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={navigateProfileView}>
              <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        </View>
    </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  profilePic: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#4A90E2", 
  },
  cameraIcon: {
    position: "absolute",
    bottom: 10, 
    right: 5, 
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: 4,
  },
  button: {
    backgroundColor: '#4A90E2',
    paddingVertical: 10,
    paddingHorizontal: 50,
    marginTop: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.16,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  info: {
    fontSize: 16,
    //marginBottom: 10,
    //shadowColor: 'rbga(3, 138, 255, 1)',
    borderColor: '#4A90E2',
    borderWidth: 2,
    borderRadius: 15,
    padding: 16,
    fontSize: 16,
    width: '80%',
    // backgroundColor: '#f9f9f9',
    // padding: 20,
    margin: 10,
    // shadowOpacity: 0.1,
    // shadowRadius: 10,
    // elevation: 5,
    //borderColor: 'rbg(3, 138, 255)', 
  },
  attribute: {
    fontSize: 16,
    width: '80%',
  },
  content: {
    flex: 1,
    backgroundColor: "#4A90E2", 
  },
  errorMessageBox: {
    textAlign: "center",
    borderRadius: 6,
    backgroundColor: "#ffc3c3",
    paddingVertical: 10,
    paddingHorizontal: 50,
    marginTop: 5,
    marginBottom: 10,
    marginHorizontal: 5,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.06,
    width: "80%",
  },
  errorMessageText: {
    textAlign: "center",
    color: "#ff0000",
  },
});

export default EditProfile;
