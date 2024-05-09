import React, { useState, useEffect, useRef } from "react";
import { View, Text, Platform, StyleSheet, Image, Dimensions, Animated} from "react-native";
import BottomTab from "../../navigations/BottomTabNavigator.js";
import * as Storage from "../../AsyncStorage.js";
import axios from "axios";
import { SvgXml } from "react-native-svg";
import * as ImagePicker from "expo-image-picker"; 
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";
import IP_ADDRESS from "../../ip.js";
import makeThemeStyle from '../../tools/Theme.js';
import Badges from "../home/Badges.js";

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

  const layout = Dimensions.get("window");
  const translateX = useRef(new Animated.Value(-layout.width)).current;


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
        <TouchableOpacity style={styles.submitButton} onPress={navigateEdit}>
          <Text style={styles.submitText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.profilePicContainer}>
        <Image
          style={styles.profilePic}
          source={{ uri: `data:image/jpeg;base64,${userInfo?.profilePicture}` }}
        />
      </View>
      <View style={styles.userInfoContainer}>
        <Text style={styles.username} testID="nameInput">
          @{userInfo.username}
        </Text>
        <View style={styles.userInfoContainerLower}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.infoLabel}> NAME: </Text>
            <Text style={styles.info} testID="usernameInput">
              {userInfo.fname} {userInfo.lname}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.infoLabel}> EMAIL: </Text>
            <Text style={styles.info} testID="usernameInput">
              {userInfo.email}
            </Text>
          </View>
          <Badges />
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
    zIndex: -1,
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
    elevation: 1,
    // borderWidth: 2,
    // borderColor: "#4A90E2",
  },
  username: {
    fontSize: 16,
    color: "#4A90E2",
  },
  info: {
    fontSize: 16,
    color: "#4A90E2",
    // fontWeight: "bold",
  },
  infoLabel: {
    fontSize: 14,
    color: "#9e9e9e",
    fontWeight: "bold",
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
    alignItems: "flex-end",
    width: "100%",
  },
  submitButton: {
    marginRight: 20,
    justifyContent: "flex-end",
  },
  submitText: {
    color: "white",
    fontSize: 19,
  },
  sectionContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    // paddingVertical: 12,
    fontSize: 14,
    fontWeight: "600",
    color: "#4A90E2",
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

export default UserProfile;

