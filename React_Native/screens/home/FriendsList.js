import React, { useState, useEffect, useRef } from "react";
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
  RefreshControl,
  Animated
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Icon, SearchBar } from "react-native-elements";
import LoadingScreen from "../greet/Loading.js";
import SpinningPen from "../greet/Pen.js";
import makeThemeStyle from "../../tools/Theme.js";
import * as Storage from "../../AsyncStorage.js";
import IP_ADDRESS from "../../ip.js";
import axios from "axios";
import ViewPager from 'react-native-pager-view';

const layout = Dimensions.get("window");

//import AddFriends from '../screens/home/AddFriends.js';

const API_URL = "http://" + IP_ADDRESS + ":8000";

const FriendsList = ({ navigation, onSwitch }) => {
  theme = makeThemeStyle();
  const [username, setUsername] = useState("");
  const [usernameSearch, setUsernameSearch] = useState("");
  const [friends, setFriends] = useState([]);
  const [numFriends, setNumFriends] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const translateY = useRef(new Animated.Value(-layout.height)).current;

  useEffect(() => {
    if (isLoading === false) {
      console.log("friends list initialize data");
      initializeData();
      // Animation to slide in the content
    }
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    const storedUsername = await Storage.getItem("@username");
    const retrievedFriends = await getFriends(storedUsername);
    const retrievedProfilepics = await fetchProfilePics(retrievedFriends);
    setFriends(retrievedProfilepics);
    setNumFriends(retrievedFriends.length);
    //we want to set them all at the same time so theres not a bunch of rerenders
    setUsername(storedUsername || "No username");
    setRefreshing(false);
    console.log("finished refreshing data.");
  };

  const onReload = async () => {
    const storedUsername = await Storage.getItem("@username");
    const retrievedFriends = await getFriends(storedUsername);
    const retrievedProfilepics = await fetchProfilePics(retrievedFriends);
    
    setFriends(retrievedProfilepics);
    setNumFriends(retrievedFriends.length);
    setUsername(storedUsername || "No username");
  }

  const initializeData = async () => {
    setIsLoading(true);
    const storedUsername = await Storage.getItem("@username");
    const retrievedFriends = await getFriends(storedUsername);
    const retrievedProfilepics = await fetchProfilePics(retrievedFriends);
    console.log("you have friends");
    setFriends(retrievedProfilepics);
    setNumFriends(retrievedFriends.length);
    //we want to set them all at the same time so theres not a bunch of rerenders
    setUsername(storedUsername || "No username");
    setIsLoading(false);
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
    console.log("finished initializing data.");
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

  const getFriends = async (usernameProp) => {
    try {
      const csrfToken = await getCsrfToken();
      const response = await axios.get(`${API_URL}/get_friend_info/`, {
        params: {
          username: usernameProp,
        },
      });
      // console.log("response of friends:", response);
      const friendsList = response.data
        .filter((item) => item.status === true)
        .map((item) => item.username);
      return friendsList;
    } catch (error) {
      console.log("error fetching friends:", error);
      return [];
    }
  };

  const fetchProfilePics = async (friends) => {
    if (friends.length < 1) {
      return [];
    }
    // console.log("getting profile pics for ", friends);
    try {
      const csrfToken = await getCsrfToken();
      const response = await axios.get(`${API_URL}/profile_pictures_view/`, {
        params: {
          username_list: friends,
        },
      });
      // setProfilePics(response.data);
      // console.log("got profile pic success!");
      // const map = {};
      // response.data.forEach((pic) => {
      //   map[pic.username] = pic.profile_picture;
      // });
      console.log("got profile pic success!");
      return response.data;
    } catch (error) {
      console.log("Error retrieving profile pics:", error);
      throw new Error("profile pic retreival failed");
    }
  };

  const handleDeleteFriend = async (friendUsername) => {
    Alert.alert(
      `Are you sure you want to delete ${friendUsername} from your friends?`,
      `You wont be able to see ${friendUsername}'s Reflections anymore and yours will no longer be visible`,
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: styles.alertCancelText,
        },
        {
          text: "Delete",
          onPress: () => deleteFriends(),
          style: "destructive",
        },
      ]
    );

    const deleteFriends = async () => {
      console.log("Deleting: ", friendUsername);
      try {
        const csrfToken = await getCsrfToken();
        const response = await axios.post(`${API_URL}/delete_friend/`, {
            username: username,
            unfriendusername: friendUsername,
          },
          {
            headers: 
            {
                "X-CSRFToken": csrfToken,
                "Content-Type": "application/json",
            },
            withCredentials: true,
        }
        );
        console.log("delete Response: ", response);
        onReload();
        //get rid of friend from friends. when they reload the page next time, it wont be included
        //in the initialize data. this way the user doesn't have to wait for page to reload
      } catch (error) {
        console.log("error deleting friend:", error);
      }
    };
  };

  const renderItem = ({ item }) => {
    // Check if the user is already a friend

    return (
      <TouchableOpacity>
        <View style={styles.row}>
          <View style={styles.pic}>
            {/* <SvgUri style={styles.pic} uri={item.profile_pic} /> */}
            <Image
              source={{ uri: `data:Image/jpeg;base64,${item.profile_picture}` }}
              style={styles.pic}
            />
          </View>
          <View style={styles.textContainer}>
            <View style={styles.nameContainer}>
              <Text
                style={styles.nameTxt}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.username}
              </Text>
            </View>
            <View style={styles.msgContainer}>
              <Text style={styles.msgTxt}>@{item.username}</Text>
            </View>
          </View>
          <View style={styles.deleteFriendButton}>
            <TouchableOpacity onPress={() => handleDeleteFriend(item.username)}>
              <Ionicons name={"close"} size={20} color="#4A90E2" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <View testID="loading-screen">
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>My Friends (0)</Text>
            <View style={styles.horizontalLine} />
          </View>
          <View style={styles.loadingStyle}>
            <SpinningPen />
          </View>
        </View>
      ) : (
        <Animated.View
          style={{ ...styles.container, transform: [{ translateY }] }}
        >
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>My Friends ({numFriends})</Text>
            <View style={styles.horizontalLine} />
          </View>
          <View>
            <View style={[styles.body, { height: layout.height }]}>
              <FlatList
                enableEmptySections={true}
                data={friends}
                keyExtractor={(item) => item.username}
                renderItem={(item) => renderItem(item)}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    testID="refresh-control"
                  />
                }
              />
            </View>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingStyle: {
    marginTop: 150,
    backgroundColor: "red",
  },
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
    justifyContent: "space-between",
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
    color: "#4A90E2",
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
    color: "#4A90E2",
    fontSize: 12,
    marginLeft: 15,
  },
  deleteFriendButton: {
    flexDirection: "row",
    justifyContent: "center",
    textAlign: "right",
    marginLeft: 60,
  },
  deleteFriendButtonText: {
    // backgroundColor: "blue",
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    // paddingRight: 16,
    textAlign: "right",
  },
  container: {
    flex: 1,
    margin: 10,

    //justifyContent: "center",
    //alignItems: "center",
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
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  alertCancelText: {
    color: "#4A90E2",
  },
  alertDeleteText: {
    color: "red",
  },
});

export default FriendsList;
