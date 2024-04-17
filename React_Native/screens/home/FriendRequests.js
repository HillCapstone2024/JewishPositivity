import React, { useState, useEffect } from 'react';
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
import makeThemeStyle from '../../tools/Theme.js';
import * as Storage from "../../AsyncStorage.js";
import IP_ADDRESS from "../../ip.js";
import axios from 'axios';
import { Ionicons } from "@expo/vector-icons";
const layout = Dimensions.get("window");

//import AddFriends from '../screens/home/AddFriends.js';

const API_URL = "http://" + IP_ADDRESS + ":8000";

const FriendRequests = ({navigation, onSwitch}) => {
  theme = makeThemeStyle();
  const [username, setUsername] = useState("");
  const [usernameSearch, setUsernameSearch] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [friends, setFriends] = useState([]);
  const [filteredFriends, setFilteredFriends] = useState([]);
  const [search, setSearch] = useState("");
  const [sentRequests, setSentRequests] = useState([]);
  const [numSentRequests, setNumSentRequests] = useState(0);
  const [recievedRequests, setRecievedRequests] = useState([]);
  const [numRecievedRequests, setNumRecievedRequests] = useState(0);

  useEffect(() => {
    console.log('friends list initialize data');
      initializeData();
    }, []);

  const initializeData = async () => {
    const storedUsername = await Storage.getItem("@username");
    const retrievedFriends = await getFriends(storedUsername);
    const retrievedProfilepics = await fetchProfilePics(retrievedFriends);

    setFriends(retrievedFriends);
    setFilteredFriends(retrievedProfilepics);
    //we want to set them all at the same time so theres not a bunch of rerenders
    setUsername(storedUsername || "No username");
    // setProfilePics(retrievedFriends);
    setProfilePicMap(map);


    // console.log("profile pics:", retrievedFriends);
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
      console.log("friends list: ", friendsList);
      return friendsList;
    } catch (error) {
      console.log("error fetching friends:", error);
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
      console.log("map reachec", typeof(response.data));
      return response.data;
    } catch (error) {
      console.log("Error retrieving profile pics:", error);
      throw new Error("profile pic retreival failed");
    }
  };

  const deleteFriends = async () => {
    console.log("Deleting Friend...");
    try{
      const csrfToken = await getCsrfToken();
      const response = await axios.get(`${API_URL}/delete_friend/`, {
        params: {
          username: username,
          unfriendusername: usernameSearch,
        },
      });
      console.log("delete Response: ", response);
    }
    catch(error){
      console.log("error deleting friend:", error);
    }
  };
  
  const handleFriends = async () => {
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
      console.log("user1: " + username);
      console.log("user2: " + usernameSearch);
      const response = await axios.post(
        `${API_URL}/add_friend/`,
        {
          user1: username,
          user2: usernameSearch,
        },
        {
          headers: {
            "X-CSRFToken": csrfToken,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      console.log("Friend response:", response.data);
      setErrorMessage(
        <View style={styles.errorMessageBoxSucceed}>
          <Text style={styles.errorMessageTextSucceed}> </Text>
        </View>
      );
    } catch (error) {
      console.log(error);
      setErrorMessage(
        <View style={styles.errorMessageBox}>
          <Text style={styles.errorMessageText}>{error.response.data}</Text>
        </View>
      );
    }
  };

  useEffect(() => {
    setFilteredFriends(
      search.trim() === ""
        ? friends
        : friends.filter((friend) =>
            friend.toLowerCase().includes(search.toLowerCase())
          )
    );
  }, [search]);

  const updateSearch = (search) => {
    setSearch(search);
    // fetchUserIDs(search);
  };

  const renderItem = ({ item, isRecieved }) => {
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
              <Text>{isRecieved}</Text>
            </View>
          </View>
          {isRecieved === 1 ? (
            <View>
              <View style={styles.acceptRequestButton}>
                <TouchableOpacity>
                  {/* <Ionicons name={"close"} size={20} color="#0066cc" /> */}
                  <Text style={styles.acceptButtonText}>ADD</Text>
                </TouchableOpacity>
              </View>
              <View>
                <TouchableOpacity>
                  <Ionicons name={"close"} size={20} color="#0066cc" />
                  {/* <Text>Reject</Text> */}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.acceptRequestButton}>
              <TouchableOpacity>
                {/* <Ionicons name={"close"} size={20} color="#0066cc" /> */}
                <Text style={styles.acceptButtonText}>CANCEL</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>
            Pending Requests ({numSentRequests})
          </Text>
          <View style={styles.horizontalLine} />
        </View>
        <View style={[styles.body, { height: layout.height }]}>
          <FlatList
            enableEmptySections={true}
            data={filteredFriends}
            keyExtractor={(item) => item.username}
            renderItem={(item) => renderItem(item, 1)}
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
            data={filteredFriends}
            keyExtractor={(item) => item.username}
            renderItem={(item) => renderItem(item, 0)}
          />
        </View>
      </View>
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
    color: "#0066cc",
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
    color: "#0066cc",
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
    borderColor: "#0066cc",
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
    backgroundColor: "#0066cc",
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
});

export default FriendRequests;
