import React, { useEffect, useState } from "react";
import { View, Text, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import makeThemeStyle from '../../Theme.js';
import IP_ADDRESS from "../../ip.js";
const API_URL = "http://" + IP_ADDRESS + ":8000";
import axios from 'axios';

export default function Archive({ navigaton }) {
    const [username, setUsername] = useState("");
    const [entries, setEntries] = useState([]);
    const [message, setMessage] = useState(<ActivityIndicator />);
    theme = makeThemeStyle();
    const index = 0;

    handleGetEntries = async () => {
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
            const response = await axios.post(
                `${API_URL}/get_entries/`,
                {
                    username: username,
                    index: index,
                },
                {
                    headers: {
                        "X-CSRFToken": csrfToken,
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                }
            );
            console.log("Axios response:", response.data);
        } catch (error) {
            console.log(error);
            console.error("Entry Retrieval Error:", error.response.data);
        }
    };
    handleGetEntries();

    useEffect(() => {
        if (entries.length == 0) {
            setMessage(<Text style={[styles.title, theme['color']]}>No entries yet!</Text>);
        }
    }, []);

    return (
        <View style={[{ flex: 1, alignItems: 'center', justifyContent: 'center' }, theme['background']]}>
            {message}
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
