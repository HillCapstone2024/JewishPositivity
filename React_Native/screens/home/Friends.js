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
    ActivityIndicator
} from 'react-native';
import makeThemeStyle from '../../tools/Theme.js';
import * as Storage from "../../AsyncStorage.js";
import IP_ADDRESS from "../../ip.js";
import axios from 'axios';

//import AddFriends from '../screens/home/AddFriends.js';

const API_URL = "http://" + IP_ADDRESS + ":8000";

const Friends = ({navigation}) => {
    theme = makeThemeStyle();
    const [username, setUsername] = useState("");
    const [usernameSearch, setUsernameSearch] = useState("");
    const [errorMessage, setErrorMessage] = useState(null);
    const [friends, setFriends] = useState([]);
    const [profilePics, setProfilePics] = useState([]);

    useEffect(() => {
        const loadUsername = async() => {
            const storedUsername = await Storage.getItem("@username");
            setUsername(storedUsername || "No username");
        };
        loadUsername();
    }, []);

    useEffect(() => {

        handleGetProfilePic();
      }, [friends]);

    // const loadUsername = async () => {
    //     const storedUsername = await Storage.getItem("@username");
    //     setUsername(storedUsername || "No username");
    //   };
    
    //   useEffect(() => {
    //     loadUsername();
    //   }, []);

    useEffect(() => {
        getFriends();
      }, [username]);

      const getCsrfToken = async () => {
        try {
          const response = await axios.get(`${API_URL}/csrf-token/`);
          return response.data.csrfToken;
        } catch (error) {
          console.error("Error retrieving CSRF token:", error);
          throw new Error("CSRF token retrieval failed");
        }
      };

    const getFriends = async () => {

        try {
          const csrfToken = await getCsrfToken();
          const response = await axios.get(`${API_URL}/get_friend_info/`, {
            params: {
              username: username,
            },
          });
          console.log("response of friends:", response);
          const friendsList = response.data
            .filter((item) => item.status === true)
            .map((item) => item.username);
          console.log("friends list: ", friendsList);
          setFriends(friendsList);
        } catch (error) {
          console.log("error fetching friends:", error);
        }
      };

      const handleGetProfilePic = async () => {
        console.log("getting profile pics for ", friends);
        try {
          const csrfToken = await getCsrfToken();
          const response = await axios.get(`${API_URL}/profile_pictures_view/`, {
            params: {
              username_list: friends,
            },
          });
          setProfilePics(response.data);
          console.log("got profile pic success!", response.data);
          return response.data;
        } catch (error) {
          console.log("Error retrieving profile pics:", error);
          throw new Error("profile pic retreival failed");
        }
      };

    const navigateAddFriends = () => {
        navigation.navigate("AddFriends")
    }

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
            setErrorMessage(
                <View style={styles.errorMessageBoxSucceed}>
                  <Text style={styles.errorMessageTextSucceed}>  </Text>
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

    const UserListItem = ({ user }) => (
        <View style={styles.userItem}>
          {/* <Image
            source={require("../../assets/images/notebookPen.png")}
            style={styles.avatar}
          /> */}
          <Text
            style={styles.statusUserName}
            ellipsizeMode="tail"
            numberOfLines={1}
          >
            {user}
          </Text>
        </View>
      );

    return(
    //   <View style={styles.container}>
    //     <View style={styles.userList}>
    //       <ScrollView vertical>
    //         <View style={styles.userContainer}>
    //           {friends.map((user) => (
    //             <UserListItem key={user.id} user={user} />
    //           ))}
    //         </View>
    //       </ScrollView>
    //   </View>
    // </View>
    <View style={styles.container}>
      <View style={styles.userButtonContainer}>
        {friends.map((user, index) => (
          <View key={index}  style={styles.userContainer}>
            <TouchableOpacity style={styles.button}>
              {/* <Text style={styles.buttonText}>Press me</Text> */}
              <Text style={styles.friendText}>{user}</Text>
            </TouchableOpacity>
          </View>
        
        ))}
      </View>
    </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        margin: 10,
        //justifyContent: "center",
        // alignItems: "center",
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
    button: {
        alignItems: "left"
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

      userButtonContainer:{

        flexDirection: 'column',
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
        color: 'white',
        fontSize: 16,
        
      },
});

export default Friends;


/*


onPress={navigateAddFriends}
*/