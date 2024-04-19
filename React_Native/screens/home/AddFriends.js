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
    ActivityIndicator,
    FlatList
} from 'react-native';
import makeThemeStyle from '../../tools/Theme.js';
import * as Storage from "../../AsyncStorage.js";
import IP_ADDRESS from "../../ip.js";
import axios from 'axios';
import { SearchBar } from '@rneui/themed';
import ExpandingSearchBar from '../../tools/ExpandingSearchBar.js';

const API_URL = "http://" + IP_ADDRESS + ":8000";

const AddFriends = ({navigation, onSwitch}) => {
    theme = makeThemeStyle();
    const [username, setUsername] = useState("");
    const [usernameSearch, setUsernameSearch] = useState("");
    const [search, setSearch] = useState("");
    const [errorMessage, setErrorMessage] = useState(null);
    const [users, setUsers] = useState([]);

    const navigateFriendList = () => {
        console.log(onSwitch);
        if (onSwitch) {
          onSwitch();
        }
    };
    
    useEffect(() => {
        const loadUsername = async() => {
            const storedUsername = await Storage.getItem("@username");
            setUsername(storedUsername || "No username");
        };
        loadUsername();
    }, []);

    const updateUsernameSearch = (usernameSearch) => {
        setUsernameSearch(usernameSearch);
    };
    const updateSearch = (search) => {
        setSearch(search);
    };

    const handleFriends = async() => {
        setErrorMessage(<ActivityIndicator />);
        const getCsrfToken = async() => {
            try{
                const response = await axios.get(`${API_URL}/csrf-token/`)
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
                    headers: 
                    {
                        "X-CSRFToken": csrfToken,
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                }
            );
            console.log("Friend response:", response.data);
            let message = response.data.message
            setErrorMessage(
                <View style={styles.errorMessageBoxSucceed}>
                  <Text style={styles.errorMessageTextSucceed}> {message} </Text>
                </View>
              );
        } catch(error) {
            console.log(error)
            setErrorMessage(
                <View style={styles.errorMessageBox}>
                  <Text style={styles.errorMessageText}>{error.response.data}</Text>
                </View>
            );
        }
    };

    const renderItem = ({ item }) => {
      // Check if the user is already a friend

      return (
        <TouchableOpacity>
          <View style={styles.row}>
            <View style={styles.pic}>
              {/* <SvgUri style={styles.pic} uri={item.profile_pic} /> */}
              <Image
                source={{
                  uri: `data:Image/jpeg;base64,${item.profile_picture}`,
                }}
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
            <View style={styles.deleteFriendButton}>
              <TouchableOpacity
                onPress={() => handleDeleteFriend(item.username)}
              >
                <Ionicons name={"close"} size={20} color="#4A90E2" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      );
    };

    return (
      <View style={styles.container}>
        <ExpandingSearchBar/>
        <FlatList
          enableEmptySections={true}
          data={users}
          keyExtractor={(item) => item.username}
          renderItem={(item) => renderItem(item)}
        />
        {/* <TouchableOpacity style={styles.button} onPress={handleFriends}>
          <Text style={styles.buttonText}>Send Friend Request</Text>
        </TouchableOpacity> */}
        {errorMessage}
      </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
    // justifyContent: "center",
    // alignItems: "center",
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
});

export default AddFriends;
