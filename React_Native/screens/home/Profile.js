import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, TextInput, Button } from "react-native";
import BottomTab from "../../navigations/BottomTabNavigator";
import * as Storage from "../../AsyncStorage.js";
import { createAvatar } from "@dicebear/core";
import axios from "axios";
import { micah } from "@dicebear/collection";
import { SvgXml } from "react-native-svg";
import * as ImagePicker from "expo-image-picker"; 
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";
import IP_ADDRESS from "../../ip.js";
 
const API_URL = "http://" + IP_ADDRESS + ":8000";


const UserProfile = () => {
  const [userInfo, setUserInfo] = useState({
    fname: "",
    lname: "",
    username: "",
    password: "",
    email: "",
    //dateJoined: "January 1, 2021",
    //journalEntries: 120,
    profilePicture: "../../assets/logo.png",
  });


  const avatar = createAvatar(micah, {
    seed: userInfo.username,
    radius: 50,
    mouth: ["smile", "smirk", "laughing"],
  }).toString();


  const [newPassword, setNewPassword] = useState("");
  const [newProfilePic, setNewProfilepPic] = useState("");

  const handleChangePassword = () => {
    // Implement password change logic here
    console.log("Password changed to:", newPassword);
    // Reset password field
    setNewPassword("");
  };

  const handleEditProfilePicture = () => {
    // Implement password change logic here
    console.log("Profile pic changed to:", newProfilePic);
    // Reset password field
    setNewProfilepPic("");
  };

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const storedUsername = await Storage.getItem("@username");
        setUserInfo(prevState => ({
          ...prevState,
          username: storedUsername || ""
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
    <View style={styles.container}>
      <TouchableOpacity onPress={handleEditProfilePicture} >
          <View style={styles.profilePicContainer}>
            <SvgXml xml={avatar} style={styles.profilePic} />
            <View style={styles.cameraIcon}>
              <Ionicons name="camera" size={24} color="black" />
            </View>
          </View>
        </TouchableOpacity>
      {/* <SvgXml xml={avatar} style={styles.profilePic} /> */}
        {/* { <Button>Change Avatar</Button> } */}
        {<Text style={styles.info}>First Name: {userInfo.fname} </Text>}
        {<Text style={styles.info}>Last Name: {userInfo.lname} </Text>}
        <Text style={styles.info}>Username: {userInfo.username}</Text>
        {<Text style={styles.info}>Email: {userInfo.email} </Text>}
        {<Button title="Edit Profile Temp"></Button>}
    </View>
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
    borderColor: "#ffffff", 
  },
  cameraIcon: {
    position: "absolute",
    bottom: 10, 
    right: 5, 
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: 4,
  },
  info: {
    //fontSize: 16,
    //marginBottom: 10,
    //shadowColor: 'rbga(3, 138, 255, 1)',
    width: '80%',
    backgroundColor: '#f9f9f9',
    padding: 20,
    margin: 10,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    //borderWidth: 2,
    //borderColor: 'rbg(3, 138, 255)', 
  },
  content: {
    flex: 1,
    backgroundColor: "#4A90E2", 
  },
});

export default UserProfile;
