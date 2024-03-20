import React, { useEffect, useState } from "react";
import { View, Text, Alert, ActivityIndicator, StyleSheet, Button } from 'react-native';
import makeThemeStyle from '../../Theme.js';
import * as Storage from "../../AsyncStorage.js";
import IP_ADDRESS from "../../ip.js";
const API_URL = "http://" + IP_ADDRESS + ":8000";
import axios from 'axios';

export default function Archive({ navigaton }) {
    const [username, setUsername] = useState("");
    const [entries, setEntries] = useState([]);
    const [message, setMessage] = useState(<ActivityIndicator />);
    theme = makeThemeStyle();
    const index = 0;

    useEffect(() => {
    const loadUsername = async () => {
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

    handleGetEntries = async () => {
        try {
            const csrfToken = await getCsrfToken();
            const response = await axios.get(`${API_URL}/get_checkin_info/`,
            {
                params: {
                    username: username
                }
            });
            console.log('RESPONSE:',typeof(response.data));
            return response.data;
        } catch (error) {
            console.error("Error retrieving check in entries:", error);
            throw new Error("Check in entries failed");
        }
    };

    useEffect(() => {
        if (entries.length == 0) {
            setMessage(<Text style={[styles.title, theme['color']]}>No entries yet!</Text>);
        }
    }, []);

    return (
        <View style={[{ flex: 1, alignItems: 'center', justifyContent: 'center' }, theme['background']]}>
            {message}
            <Button title='GET ENTRIES' onPress={handleGetEntries}>Get entries</Button>
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 30,
        fontWeight: "bold",
        marginBottom: 20,
        color: "white",
    },
});
