import React, { useEffect, useState } from "react";
import { View, Text, Alert, ActivityIndicator, StyleSheet, Button, Image } from 'react-native';
import makeThemeStyle from '../../Theme.js';
import * as Storage from "../../AsyncStorage.js";
import IP_ADDRESS from "../../ip.js";
const API_URL = "http://" + IP_ADDRESS + ":8000";
import axios from 'axios';
import { Video, Audio } from "expo-av";
import { Buffer } from "buffer";


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

    const decodeBase64ToText = (base64String) => {
      // Decode the Base64 string to a Buffer
      const buffer = Buffer.from(base64String, "base64");
      // Convert the Buffer to a UTF-8 string
      const text = buffer.toString("utf8");
      return text;
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
            console.log('RESPONSE:',response.data[3].content_type);
            console.log('number of entries: ',response.data.length)
            setEntries(response.data);
            return response.data;
        } catch (error) {
            console.error("Error retrieving check in entries:", error);
            throw new Error("Check in entries failed");
        }
    };

    const renderContent = (data) => {
        switch (data.content_type) {
            case "image":
            return (
              <View>
                <Image
                  style={{ width: 200, height: 200 }}
                  source={{ uri: `data:image/jpeg;base64,${data.content}` }}
                />
                <Text>moment number: {data.moment_number}</Text>
              </View>
            );
            case "video":
            return (
              <View>
                <Video
                  style={{ width: 300, height: 300 }}
                  source={{ uri: `data:video/mp4;base64,${data.content}` }}
                  useNativeControls
                  resizeMode="contain"
                />
                <Text>Video</Text>
              </View>
            );
            case "text":
            return <Text>{decodeBase64ToText(data.content)}</Text>; // Decode Base64 text
            case "recording":
            // For audio, setup is more complex and requires loading the sound
            // This is a placeholder - see expo-av documentation for playing audio
            return <Text>Recording</Text>;
            default:
            return <Text>Unsupported content type</Text>;
        }
    };

    useEffect(() => {
        if (entries.length == 0) {
            setMessage(<Text style={[styles.title, theme['color']]}>No entries yet!</Text>);
        }
    }, []);

    return (
      <View
        style={[
          { flex: 1, alignItems: "center", justifyContent: "center" },
          theme["background"],
        ]}
      >
        {/* {message} */}
        {entries.map((item, index) => (
          <View key={index} style={{ margin: 10 }}>
            {renderContent(item)}
          </View>
        ))}
        <Button title="GET ENTRIES" onPress={handleGetEntries}>
          Get entries
        </Button>
      </View>
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
