import React, { useState, useEffect, useRef } from 'react';
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
import { SearchBar } from "react-native-elements";
import BottomTab from "../../navigations/BottomTabNavigator";
import makeThemeStyle from '../../tools/Theme.js';
import * as Storage from "../../AsyncStorage.js";
import IP_ADDRESS from "../../ip.js";
import axios from 'axios';
import { Ionicons } from "@expo/vector-icons";
const layout = Dimensions.get("window");
import SpinningPen from "../greet/Pen.js";

//import AddFriends from '../screens/home/AddFriends.js';

const API_URL = "http://" + IP_ADDRESS + ":8000";


const FriendRequests = ({navigation, onSwitch}) => {
  theme = makeThemeStyle();
  const [username, setUsername] = useState("");
  const [usernameSearch, setUsernameSearch] = useState("");
  const [friends, setFriends] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [numSentRequests, setNumSentRequests] = useState(0);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [numReceivedRequests, setNumReceivedRequests] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const translateY = useRef(new Animated.Value(-layout.height)).current;

  useEffect(() => {
    if (isLoading === false) {
      console.log("friends requests initialize data");
      initializeData();
    }
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    const storedUsername = await Storage.getItem("@username");
    const retrievedFriends = await getFriends(storedUsername);
    const retrievedProfilepics = await fetchProfilePics(retrievedFriends);
    const retrievedSent = await getSentRequests(storedUsername);
    const retrievedSentProPics = await fetchProfilePics(retrievedSent);
    const retrievedReceive = await getReceivedRequests(storedUsername);
    const retrievedReceiveProPics = await fetchProfilePics(retrievedReceive);

    setFriends(retrievedProfilepics);
    setSentRequests(retrievedSentProPics);
    setReceivedRequests(retrievedReceiveProPics);
    setUsername(storedUsername || "No username");
    setRefreshing(false);
    console.log("finished refreshing data.");
  };

  const onReload = async () => {
    const storedUsername = await Storage.getItem("@username");
    const retrievedFriends = await getFriends(storedUsername);
    const retrievedProfilepics = await fetchProfilePics(retrievedFriends);
    const retrievedSent = await getSentRequests(storedUsername);
    const retrievedSentProPics = await fetchProfilePics(retrievedSent);
    const retrievedReceive = await getReceivedRequests(storedUsername);
    const retrievedReceiveProPics = await fetchProfilePics(retrievedReceive);

    setFriends(retrievedProfilepics);
    setSentRequests(retrievedSentProPics);
    setReceivedRequests(retrievedReceiveProPics);
    setUsername(storedUsername || "No username");
  }

  const initializeData = async () => {
    setIsLoading(true);
    const storedUsername = await Storage.getItem("@username");
    const retrievedFriends = await getFriends(storedUsername);
    const retrievedProfilepics = await fetchProfilePics(retrievedFriends);
    const retrievedSent = await getSentRequests(storedUsername);
    const retrievedSentProPics = await fetchProfilePics(retrievedSent);
    const retrievedReceive = await getReceivedRequests(storedUsername);
    const retrievedReceiveProPics = await fetchProfilePics(retrievedReceive);

    setFriends(retrievedProfilepics);
    setUsername(storedUsername || "No username");
    setSentRequests(retrievedSentProPics);
    setReceivedRequests(retrievedReceiveProPics);
    setIsLoading(false);
    console.log("finished initializing data.");
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
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
        .filter((item) => item.status === false)
        .map((item) => item.username);
      //console.log("friends list: ", friendsList);
      return friendsList;
    } catch (error) {
      console.log("error fetching friends:", error);
      return [];
    }
  };

  const getSentRequests = async (usernameProp) => {
    try{
      const response = await axios.get(`${API_URL}/get_pending_requests_sent_friends`, {
        params: {
          username: usernameProp,
        }
      });
      const sentList = response.data
        .map((item) => item.username);
      console.log("Sent list: ", sentList);
      setNumSentRequests(sentList.length);
      return sentList;
    } catch(error) {
      console.log("error fetching sent:", error);
      return [];
    }
  };

  const getReceivedRequests = async (usernameProp) => {
    try{
      const response = await axios.get(`${API_URL}/get_pending_requests_received_friends`, {
        params: {
          username: usernameProp,
        }
      });
      const recievedList = response.data
        .map((item) => item.username);
      console.log("Recieved list: ", recievedList);
      setNumReceivedRequests(recievedList.length);
      return recievedList;
    } catch(error) {
      console.log("error fetching received:", error);
      return [];
    }
  };

  const fetchProfilePics = async (friends) => {
    if (friends.length < 1) {
      return {};
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
      console.log("got profile pic success!");
      const map = {};
      response.data.forEach((pic) => {
        map[pic.username] = pic.profile_picture;
      });
      console.log("map reached", typeof response.data);
      return response.data;
    } catch (error) {
      console.log("Error retrieving profile pics:", error);
      throw new Error("profile pic retreival failed");
    }
  };

  const handleDeclineRequest = async (friendUsername) => {
    Alert.alert(
      `Are you sure you want to delete your friend request to ${friendUsername}`,
      `${friendUsername} will no longer see your friend request and will not be notified.`,
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: styles.alertCancelText,
        },
        {
          text: "Delete",
          onPress: () => declineRequest(),
          style: "destructive",
        },
      ]
    );
    const declineRequest = async () => {
      console.log("Declining:", friendUsername);
      console.log("From:", username);
      try {
        const csrfToken = await getCsrfToken();
        //need a new view that handles declining requests
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
      } catch (error) {
        console.log("error deleting friend:", error);
      }
    };
  };

  const handleAcceptRequest = async (friendUsername) => {
    console.log("Adding: ", friendUsername);
    try {
      const csrfToken = await getCsrfToken();
      const response = await axios.post(`${API_URL}/add_friend/`, {
        user1: username,
        user2: friendUsername,
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
    console.log("Add Response: ", response);
    onReload();
    } catch(error) {
      console.log("error adding friend:", error);
    }
  };

  const renderItem = ({ item, isRecieved }) => {
    // Check if the user is already a friend
    //console.log("rendered item", item.item.username);
    item = item.item
    return (
      <View>
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
                {item.username}
              </Text>
            </View>
            <View style={styles.msgContainer}>
              <Text style={styles.msgTxt}>@{item.username}</Text>
            </View>
          </View>
          {isRecieved ? (
            <View style={{ flexDirection: "row" }}>
              <View style={styles.acceptRequestButton}>
                <TouchableOpacity
                  onPress={() => handleAcceptRequest(item.username)}
                >
                  <Text style={styles.acceptButtonText}>ADD</Text>
                </TouchableOpacity>
              </View>
              <View>
                <TouchableOpacity
                  onPress={() => handleDeclineRequest(item.username)}
                >
                  <Ionicons name={"close"} size={20} color="#4A90E2" />
                  {/* <Text>Reject</Text> */}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
              <View style={styles.acceptRequestButton}>
                <TouchableOpacity
                  onPress={() => handleDeclineRequest(item.username)}
                >
                  <Text style={styles.acceptButtonText}>CANCEL</Text>
                </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <View testID="loading-screen">
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Pending Requests (0)</Text>
            <View style={styles.horizontalLine} />
          </View>
          <View style={styles.loadingStyle}>
            <SpinningPen loadingText='Loading Requests'/>
          </View>
        </View>
      ) : (
        <Animated.View
          style={{ ...styles.container, transform: [{ translateY }] }}
        >
          <View style={styles.container}>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>
                Received Requests ({numReceivedRequests})
              </Text>
              <View style={styles.horizontalLine} />
            </View>
            <View style={[styles.body, { height: layout.height }]}>
              <FlatList
                enableEmptySections={true}
                data={receivedRequests}
                keyExtractor={(item) => item.username}
                renderItem={(item) => renderItem({ item, isRecieved: true })}
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
          <View style={styles.container}>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>
                Sent Requests ({numSentRequests})
              </Text>
              <View style={styles.horizontalLine} />
            </View>

            <View style={[styles.body, { height: layout.height }]}>
              <FlatList
                enableEmptySections={true}
                data={sentRequests}
                keyExtractor={(item) => item.username}
                renderItem={(item) => renderItem({ item, isRecieved: false })}
              />
            </View>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
    color: "#4A90E2",
    fontSize: 14,
    width: 170,
  },
  mblTxt: {
    fontWeight: "200",
    color: "#777",
    fontSize: 13,
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
  followContainer: {
    marginLeft: 40,
  },
  followButton: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    color: "white",
    flexDirection: "row",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#4A90E2",
    marginLeft: 20,
  },
  acceptButtonText: {
    // backgroundColor: "blue",
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    // paddingRight: 16,
    marginHorizontal: 4,
  },
  container: {
    flex: 1,
    margin: 10,

    //justifyContent: "center",
    //alignItems: "center",
  },
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
  acceptRequestButton: {
    padding: 5,
    borderRadius: 15,
    backgroundColor: "#4A90E2",
    marginRight: 15,
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
    margin: 10,
  },
  horizontalLine: {
    flex: 1,
    height: 1.25,
    backgroundColor: "#9e9e9e",
    marginLeft: 8, // Adjust spacing between title and line
  },
  loadingStyle: {
    marginTop: "30%",
  },
});

export default FriendRequests;
