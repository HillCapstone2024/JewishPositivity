import { Text, Modal, View, TouchableOpacity, TextInput, StyleSheet, Alert, Dimensions, Keyboard, FlatList, KeyboardAvoidingView, TouchableWithoutFeedback, Image, RefreshControl, Platform, ScrollView } from 'react-native'
import React, { useState, useEffect } from 'react'
import * as FileSystem from "expo-file-system";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import IP_ADDRESS from "../../ip.js";
import * as Storage from "../../AsyncStorage.js";

const API_URL = "http://" + IP_ADDRESS + ":8000";

const Community = (CommunityData) => {
    const [username, setUsername] = useState("");
    const [CSRF, setCSRF] = useState("");

    useEffect(() => {
        const loadUsernameToken = async () => {
            const storedUsername = await Storage.getItem("@username");
            const storedCSRFToken = await Storage.getItem("@CSRF");
            setUsername(storedUsername || "No username");
            setCSRF(storedCSRFToken || "No CSRF");
        };
        loadUsernameToken();
    }, []);

    return (
        <View style={styles.container}>
            <Text>
                {CommunityData.name}
            </Text>
        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
});

export default Community;