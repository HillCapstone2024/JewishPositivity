import { Text, Modal, View, TouchableOpacity, TextInput, StyleSheet, Alert, Dimensions, Keyboard, FlatList, KeyboardAvoidingView, TouchableWithoutFeedback, Image, RefreshControl, Platform, ScrollView } from 'react-native'
import React, { useState, useEffect } from 'react'
import * as FileSystem from "expo-file-system";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import IP_ADDRESS from "../../ip.js";
import * as Storage from "../../AsyncStorage.js";

const API_URL = "http://" + IP_ADDRESS + ":8000";

const EditCommunity = (CommunityData) => {
    const [communityName, setCommunityName] = useState("");
    const [description, setDescription] = useState("");
    const [privacy, setPrivacy] = useState("");
    //below fields dont update
    const [dateCreated, setDateCreated] = useState("");
    const [communityId, setCommunityId] = useState("");
    const [ownerId, setOwnerId] = useState("");


useEffect(() => {
    const loadUsernameToken = async () => {
        const storedUsername = await Storage.getItem("@username");
        const storedCSRFToken = await Storage.getItem("@CSRF");
        setUsername(storedUsername || "No username");
        setCSRF(storedCSRFToken || "No CSRF");
    };
    loadUsernameToken();
    //Load Community Data
    //view 'get_specific_community_info/' (community name)
        //returns: community_id, community_name, community_description, 
        //owner_id(dont need current user), privacy, date_created
    
}, []);

const deleteCommunity = async () => {
    //pass in community Id
    //view 'delete_community/'
};

const deleteUserFromCommunity = async () => {
    //pass in username, and community name
    //view ''delete_user_from_community/'
};
return (
     <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Delete Community</Text>
     </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    button: {
        backgroundColor: "red",
        paddingVertical: 10,
        paddingHorizontal: 50,
        marginTop: 10,
        marginHorizontal: 5,
        borderRadius: 5,
        shadowColor: "black",
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        shadowOpacity: 0.16,
      },
      buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
      },
});


export default EditCommunity;