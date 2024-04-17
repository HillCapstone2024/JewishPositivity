import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { SearchBar } from "react-native-elements";
import BottomTab from "../../navigations/BottomTabNavigator";
import makeThemeStyle from "../../tools/Theme.js";
import * as Storage from "../../AsyncStorage.js";
import IP_ADDRESS from "../../ip.js";
import axios from "axios";
import ImageViewer from "../../tools/ImageViewer.js";
const layout = Dimensions.get("window");

//import AddFriends from '../screens/home/AddFriends.js';

const API_URL = "http://" + IP_ADDRESS + ":8000";

const FriendRequest = ({ navigation, onSwitch }) => {
  theme = makeThemeStyle();
  const [username, setUsername] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [requests, setRequests] = useState([]);
  const [numRequests, setNumRequests] = useState(0);
  const [profilePics, setProfilePics] = useState([]);
  const [profilePicMap, setProfilePicMap] = useState({});


  useEffect(() => {
    console.log("friends list initialize data");
    initializeData();
  }, []);

  const initializeData = async () => {
    //setting dummy data before functionality implemented
    setNumRequests(5);
    setRequests({"molly": "profile pic string"})
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


  const renderItem = ({ item, profilepicProp }) => {
    // Check if the user is already a friend

    return (
      <TouchableOpacity>
        <View style={styles.row}>
          <View style={styles.pic}>
            {/* <SvgUri style={styles.pic} uri={item.profile_pic} /> */}
            <Image
              source={{ uri: `data:Image/jpeg;base64,${item.profile_picture}` }}
              style={styles.avatar}
            />
          </View>
          <View style={styles.textContainer}>
            <View style={styles.nameContainer}>
              <Text
                style={styles.nameTxt}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                First Last
              </Text>
            </View>
            <View style={styles.msgContainer}>
              <Text style={styles.msgTxt}>@{item.username}</Text>
            </View>
          </View>
          <View>
            <TouchableOpacity
              style={styles.deleteFriendButton}
              onPress={() => {
                console.log("accept friend request button pressed.");
                //add functionality here
              }}
            >
              <Text style={styles.deleteFriendButtonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteFriendButton}
              onPress={() => {
                console.log("reject friend request button pressed.");
                //add functionality here
              }}
            >
              <Text style={styles.deleteFriendButtonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Pending Requests ({numRequests})</Text>
        <View style={styles.horizontalLine} />
      </View>
      <View style={styles.container}>
        <View style={[styles.body, { height: layout.height }]}>
          <FlatList
            enableEmptySections={true}
            data={requests}
            keyExtractor={(item) => item.username}
            renderItem={(item) => renderItem(item, item.profilepic)}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    paddingVertical: 12,
    fontSize: 12,
    fontWeight: "600",
    color: "#9e9e9e",
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  sectionContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  horizontalLine: {
    flex: 1,
    height: 1.25,
    backgroundColor: "#9e9e9e",
    marginLeft: 8, // Adjust spacing between title and line
  },
  body: {
    // backgroundColor: "white",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#DCDCDC",
    // backgroundColor: "#fff",
    // borderBottomWidth: 1,
    padding: 5,
    // justifyContent: "space-between",
  },
  pic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    // flexDirection: "row",
    // justifyContent: "space-between",
  },
  nameContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
    // backgroundColor: "yellow",
  },
  nameTxt: {
    marginLeft: 15,
    fontWeight: "600",
    color: "#0066cc",
    fontSize: 14,
    width: 170,
  },
  msgContainer: {
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor: "red",
  },
  msgTxt: {
    fontWeight: "400",
    color: "#0066cc",
    fontSize: 12,
    marginLeft: 15,
  },
  followContainer: {
    marginLeft: 40,
  },
  deleteFriendButton: {
    backgroundColor: "#0066cc",
    padding: 5,
    borderRadius: 5,
    color: "#0066cc",
    flexDirection: "row",
    justifyContent: "center",
  },
  deleteFriendButtonText: {
    // backgroundColor: "blue",
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    // paddingRight: 16,
  },
  unfollowButton: {
    backgroundColor: "#0066cc",
    padding: 5,
    borderRadius: 7,
    flexDirection: "row",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#0066cc",
  },
  unfollowButtonText: {
    // backgroundColor: "blue",
    color: "white",
    fontSize: 12,
    marginHorizontal: 5,
    fontWeight: "bold",
    paddingTop: 2,
  },
  container: {
    flex: 1,
    margin: 10,

    //justifyContent: "center",
    //alignItems: "center",
  },
  // container: {
  //     // paddingTop: 60,
  //     paddingBottom: 100,
  //     height: "100%",
  //     // backgroundColor: "red",
  //   },
  input: {
    width: "80%",
    height: 40,
    borderStyle: "solid",
    borderBottomColor: "#e8bd25",
    borderBottomWidth: 2,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  addButton: {
    backgroundColor: "lightgray",
    width: 100,
    paddingVertical: 10,
    marginTop: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.16,
  },
  addText: {
    textAlign: "center",
    color: "#000000",
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
  errorMessageBoxInvisible: {
    paddingVertical: 10,
    paddingHorizontal: 50,
    marginTop: 5,
    marginBottom: 10,
    marginHorizontal: 5,
    width: "80%",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.06,
  },
  errorMessageTextInvisible: {
    color: "white",
  },
  errorMessageBoxSucceed: {
    textAlign: "center",
    borderRadius: 6,
    backgroundColor: "#c3ffc3",
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
  errorMessageTextSucceed: {
    color: "#006400",
  },

  userButtonContainer: {
    flexDirection: "column",
    marginBottom: 10,
  },

  userContainer: {
    marginBottom: 30,
    width: 200,
  },

  itemText: {
    fontSize: 18,
    marginRight: 10,
  },

  button: {
    backgroundColor: "#4A90E2",
    paddingVertical: 30,
    paddingHorizontal: 50,
    marginTop: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.16,
  },

  friendText: {
    color: "white",
    fontSize: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});

export default FriendRequest;