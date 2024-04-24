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
    ActivityIndicator,
    FlatList,
    Button,
    Animated,
    Dimensions,
    KeyboardAvoidingView
} from 'react-native';

import { Ionicons } from "@expo/vector-icons";
import makeThemeStyle from '../../tools/Theme.js';
import * as Storage from "../../AsyncStorage.js";
import IP_ADDRESS from "../../ip.js";
import axios from 'axios';
import SpinningPen from '../greet/Pen.js';
import ExpandingSearchBar from '../../tools/ExpandingSearchBar.js';
const layout = Dimensions.get("window");
const API_URL = "http://" + IP_ADDRESS + ":8000";

const AddFriends = ({navigation, onSwitch}) => {
    theme = makeThemeStyle();
    const [username, setUsername] = useState("");
    const [errorMessage, setErrorMessage] = useState(null);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] =  useState(false);
    const [profilePics, setProfilePics] = useState();

    const translateY = useRef(new Animated.Value(-layout.height)).current;

    useEffect(() => {
        const loadUsername = async() => {
            const storedUsername = await Storage.getItem("@username");
            setUsername(storedUsername || "No username");
        };
        loadUsername();
    }, []);

    const getCsrfToken = async () => {
      try {
        const response = await axios.get(`${API_URL}/csrf-token/`);
        return response.data.csrfToken;
      } catch (error) {
        console.error("Error retrieving CSRF token:", error);
        throw new Error("CSRF token retrieval failed");
      }
    };

    const searchUsers = async (searchText) => {
      console.log('searchig for ...', searchText)
      try {
        const response = await axios.get(`${API_URL}/search-users/`, {
          params: {
            search: searchText.toLowerCase(),
          },
        });
        return response.data;
      } catch (error) {
        console.error("Failed to fetch users:", error);
        return [];
      }
    };

    const handleAddFriend = async (friendUsername) => {
      //add friend logic below
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

      } catch(error) {
        console.log("error adding friend:", error);
      }
    };

    const fetchProfilePics = async (users) => {
      if (users.length < 1) {
        return {};
      }
      //This just works now and I don't know why
      try {
        const response = await axios.get(`${API_URL}/profile_pictures_view/`, {
          params: {
            username_list: users,
          },
        });
        console.log("got profile pic success! in Add Friends");
        const map = {};
        response.data.forEach((pic) => {
          map[pic.username] = pic.profile_picture;
        });
        console.log("map reached", typeof response.data);
        setProfilePics(response.data);
        return response.data;
      } catch (error) {
        console.log("Error retrieving profile pics:", error);
        throw new Error("profile pic retreival failed");
      }
    };

    const handleSearch = async (searchText) => {
      setIsLoading(true);
      const foundUsers = await searchUsers(searchText);
      translateY.setValue(1000);
      fetchProfilePics(foundUsers);
      setUsers(foundUsers);
      setIsLoading(false);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    };


    const renderItem = ({ item }) => {
      // Check if the user is already a friend

      return (
        <TouchableOpacity>
          <View style={styles.row}>
            <View style={styles.pic}>
              {/* <SvgUri style={styles.pic} uri={item.profile_pic} /> */}
              <Image
                source={{uri: `data:Image/jpeg;base64,${item.profile_picture}` }}
                style={styles.avatar}
              />
              {/* <Text>{item.profile_picture}</Text> */}
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
            <View style={styles.acceptRequestButton}>
              <TouchableOpacity onPress={() => handleAddFriend(item.username)}>
                <Text style={styles.acceptButtonText}>ADD</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      );
    };

    return (
      <KeyboardAvoidingView style={styles.container}>
        <ExpandingSearchBar onSearch={handleSearch} />
        {isLoading ? (
          <View style={styles.loadingStyle}>
            <SpinningPen loadingText='Loading Users'/>
          </View>
        ) : (
          <Animated.View
            style={{ ...styles.container, transform: [{ translateY }] }}
          >
            {users.length === 0 ? (
              <View style={styles.noUsers}>
                <Text style={styles.noUsersText}>No matching users found!</Text>
              </View>
            ) : (
              <FlatList
                enableEmptySections={true}
                data={users}
                keyExtractor={(item) => item.username}
                renderItem={(item) => renderItem(item)}
              />
            )}
          </Animated.View>
        )}
      </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 10,
    justifyContent: "sapce-between",
    // alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  input: {
    width: "100%",
    // height: 40,
  },
  button: {
    alignItems: "left",
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
    width: "90%",
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
    width: "90%",
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
    width: "90%",
  },
  errorMessageTextSucceed: {
    color: "#006400",
  },
  backButton: {
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
  backText: {
    textAlign: "center",
    color: "#000000",
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
  acceptRequestButton: {
    padding: 5,
    borderRadius: 15,
    backgroundColor: "#4A90E2",
    // marginRight: 15,
  },
  acceptButtonText: {
    // backgroundColor: "blue",
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    // paddingRight: 16,
    marginHorizontal: 4,
  },
  loadingStyle: {
    marginTop: 150,
    // backgroundColor: "red",
  },
  noUsers: {
    justifyContent: "center",
    margin: 30,
    // backgroundColor: "yellow",
    alignItems: "center",
    

  },
  noUsersText: {
    fontSize: 16,
  },
});

export default AddFriends;
