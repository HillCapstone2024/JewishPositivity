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
    ActivityIndicator
} from 'react-native';
import makeThemeStyle from '../../tools/Theme.js';
import * as Storage from "../../AsyncStorage.js";
import IP_ADDRESS from "../../ip.js";
import axios from 'axios';
import { SearchBar } from '@rneui/themed';

const API_URL = "http://" + IP_ADDRESS + ":8000";

const AddFriends = ({navigation, onSwitch}) => {
    theme = makeThemeStyle();
    const [username, setUsername] = useState("");
    const [usernameSearch, setUsernameSearch] = useState("");
    const [errorMessage, setErrorMessage] = useState(null);

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
                  <Text style={styles.errorMessageTextSucceed}> Friend Request Sent </Text>
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

    return(
        <View style={styles.container}>
            <TextInput 
                style = {[styles.input]}
                placeholder='Find User...'
                onChangeText={(text) => updateUsernameSearch(text)}
                value={usernameSearch}
            />
            <TouchableOpacity style={styles.button} onPress={handleFriends}>
                <Text style={styles.buttonText}>Search</Text>
            </TouchableOpacity>
            {errorMessage}
            <TouchableOpacity style = {styles.backButton} onPress={navigateFriendList}>
              <Text style={styles.backText}> Back </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        margin: 10,
        //justifyContent: "center",
        alignItems: "center",
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
        color: "#000000"
    },
});

export default AddFriends;


/*
<Text
    onPress={() => alert('This is the "Friends" screen ')}
    style={[styles.tempText]}>Friends
</Text>
*/

/*

Add friend
- get_user to see if user exists
- add_friend_view (?)

Extras(?)
1. Delete friends
2. Friend requests inbox
3. Actually do a search
*/