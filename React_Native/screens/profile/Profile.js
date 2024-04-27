import React, { useState, useEffect } from "react";
import { View, Text, Platform, StyleSheet, Image} from "react-native";
import BottomTab from "../../navigations/BottomTabNavigator.js";
import * as Storage from "../../AsyncStorage.js";
import axios from "axios";
import { SvgXml } from "react-native-svg";
import * as ImagePicker from "expo-image-picker"; 
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";
import IP_ADDRESS from "../../ip.js";
import makeThemeStyle from '../../tools/Theme.js';

 
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
  const theme = makeThemeStyle();

  const navigateEdit = () => {
    // navigation.navigate("EditProfile");
    if (onSwitch) {
      onSwitch();
    }
  };

  // const avatar = createAvatar(micah, {
  //   seed: userInfo.username,
  //   radius: 50,
  //   mouth: ["smile", "smirk", "laughing"],
  // }).toString();


  const getUser = async () => {
    const storedUsername = await Storage.getItem("@username");
    const storedEmail = await Storage.getItem("@email");
    const storedFirstName = await Storage.getItem("@first_name");
    const storedLastName = await Storage.getItem("@last_name");
    const storedProfilePicture = await Storage.getItem("@profilePicture");
    const storedPassword = await Storage.getItem("@password");

    setUserInfo(prevState => ({
      ...prevState,
      username: storedUsername || "",
      originalUsername: storedUsername || "", //dont update this value after retrieval 
      password: storedPassword || "",
      fname: storedFirstName || "",
      lname: storedLastName || "",
      profilePicture: storedProfilePicture || "",
      email: storedEmail || "",
    }));
    console.log("successfully retrieved user")
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <View
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, theme["background"]]}
    >
     <View style={styles.topBar}>
        <View style={styles.buttonContainer}>
        <TouchableOpacity
            style={styles.submitButton}
            onPress={navigateEdit}
        >
          <Text style={styles.submitText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
  </View> 
    <View style={styles.profilePicContainer}>
      <Image 
        style={styles.profilePic}
        source={{uri: `data:image/jpeg;base64,${userInfo?.profilePicture}`,}}
        />

      </View>
        {<Text style={styles.attribute} >First Name:</Text>}
        {<Text style={[styles.info, theme["color"]]} testID="firstnameInput">{userInfo.fname} </Text>}
        {<Text style={styles.attribute} >Last Name:</Text>}
        {<Text style={[styles.info, theme["color"]]} testID="lastnameInput">{userInfo.lname} </Text>}
        {<Text style={styles.attribute} >Username:</Text>}
        {<Text style={[styles.info, theme["color"]]} testID="usernameInput">{userInfo.username}</Text>}
        {<Text style={styles.attribute} >Email:</Text>}
        {<Text style={[styles.info, theme["color"]]} testID="emailInput">{userInfo.email} </Text>}
        {/* <TouchableOpacity style={styles.button} onPress={navigateEdit}>
              <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity> */}
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
  topBar: {
    flexDirection: "row",
    marginTop: 5,
    //marginRight: 15,
    justifyContent: "space-between",
    alignItems: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: 'flex-end',
    flex: 1,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    fontSize: 19,
  },
  submitButton: {
    marginRight: 20,
    justifyContent: 'flex-end',
  },
  submitText: {
    color: "#4A90E2",
    fontSize: 19,
  },
});

export default UserProfile;

