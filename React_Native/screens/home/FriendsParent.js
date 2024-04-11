import React, { useState } from "react";
import { View, Text, Image, StyleSheet, TextInput, Button } from "react-native";
import Friends from "./Friends.js";
import AddFriends from "./AddFriends.js";
import IP_ADDRESS from "../../ip.js";

const API_URL = "http://" + IP_ADDRESS + ":8000";

const FriendsParent = () => {
    const [addMode, setAddMode] = useState(true);

    const switchAddMode = () => {
        console.log('switching to add mode.');
        setAddMode(!addMode);
    };

    return (
        <View style={styles.container}>
        {addMode ?
            <Friends onSwitch={switchAddMode} /> : 
            <AddFriends onSwitch={switchAddMode}/>
        }
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default FriendsParent;
