import React, { useState, useEffect } from "react";
import { View, Text, Platform, StyleSheet, Image} from "react-native";
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


const UserProfile = ({ navigation, onSwitch }) => {
  const [userInfo, setUserInfo] = useState({
    fname: "",
    lname: "",
    username: "",
    password: "",
    email: "",
    //dateJoined: "January 1, 2021",
    //journalEntries: 120,
    profilePicture: "",
  });

  const [errorMessage, setErrorMessage] = useState(null);

  const navigateEdit = () => {
    // navigation.navigate("EditProfile");
    if (onSwitch) {
      onSwitch();
    }
  };

  const avatar = createAvatar(micah, {
    seed: userInfo.username,
    radius: 50,
    mouth: ["smile", "smirk", "laughing"],
  }).toString();

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
    <View
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, theme["background"]]}
    >
    <View style={styles.profilePicContainer}>
    {userInfo.profilePicture && userInfo.profilePicture.trim != "" ? (
      <Image source={{ uri: userInfo.profilePicture }} style={styles.profilePic} />
    ) : (
      <SvgXml xml={avatar} style={styles.profilePic} /> 
    )}
      </View>
        {<Text style={styles.attribute} >First Name:</Text>}
        {<Text style={[styles.info, theme["color"]]} >{userInfo.fname} </Text>}
        {<Text style={styles.attribute} >Last Name:</Text>}
        {<Text style={[styles.info, theme["color"]]}>{userInfo.lname} </Text>}
        {<Text style={styles.attribute} >Username:</Text>}
        {<Text style={[styles.info, theme["color"]]}>{userInfo.username}</Text>}
        {<Text style={styles.attribute} >Email:</Text>}
        {<Text style={[styles.info, theme["color"]]}>{userInfo.email} </Text>}
        <TouchableOpacity style={styles.button} onPress={navigateEdit}>
              <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>
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
    borderColor: "#4A90E2", 
  },
  attribute: {
    fontSize: 16,
    width: '80%',
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
  content: {
    flex: 1,
    backgroundColor: "#4A90E2", 
  },
});

export default UserProfile;
