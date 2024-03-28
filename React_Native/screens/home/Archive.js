import React, { useEffect, useState } from "react";
import { View, Text, Alert, ActivityIndicator, StyleSheet, ScrollView, Button, Image, Dimensions } from 'react-native';
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
      if (response.data && response.data.length > 3 && response.data[3].content_type) {
        console.log('RESPONSE:', response.data[3].content_type);
      } else {
        console.error("Unexpected response format:", response.data);
      }
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
        <View style={styles.contentContainer}>
          <View style={styles.imageContainer}>
            <Image
              style={styles.image}
              source={{ uri: `data:image/jpeg;base64,${data.content}` }}
            />
          </View>
          <Text style={styles.text}>Moment number: {data.moment_number}</Text>
        </View>
      );

    case "video":
      return (
        <View style={styles.contentContainer}>
          <View style={styles.videoContainer}>
            <Video
              style={styles.video}
              source={{ uri: `data:video/mp4;base64,${data.content}` }}
              useNativeControls
              resizeMode="contain"
            />
          </View>
          <Text style={styles.text}>Video</Text>
        </View>
      );

    case "text":
      return (
        <View style={styles.contentContainer}>
          <View style={styles.textContainer}>
            <Text style={styles.text}>{decodeBase64ToText(data.content)}</Text>
          </View>
        </View>
      );

    case "recording":
    // For audio, setup is more complex and requires loading the sound
    // This is a placeholder - see expo-av documentation for playing audio
      return (
          <View style={styles.contentContainer}>
              <View style={styles.recordingContainer}>
                  <Text style={styles.text}>Recording</Text>
              </View>
          </View>
      );

    default:
      return (
        <View style={styles.contentContainer}>
          <View style={styles.unsupportedContainer}>
            <Text style={styles.text}>Unsupported content type</Text>
          </View>
        </View>
      );
  }
};

  useEffect(() => {
    if (entries.length == 0) {
      setMessage(<Text style={[styles.title, theme['color']]}>No entries yet!</Text>);
    }
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={[{ alignItems: "center", justifyContent: "center" }, theme["background"]]}>
          {entries.map((item, index) => (
            <View key={index} style={{ margin: 10 }}>
              {renderContent(item)}
            </View>
          ))}
          <Button title="GET ENTRIES" onPress={handleGetEntries}>
            Get entries
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

function getWidth() {
  let width = Dimensions.get("window").width;

  return width = width - 50;;
}

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
  },
  contentContainer: {
    marginBottom: 20,
    alignItems: 'center',
    width: getWidth(), // Adjust the width as desired
    alignSelf: 'center', // Center the content horizontally
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 10,
    padding: 10,
    minHeight: 150, // Adjust the height as desired
  },
  image: {
    width: '100%', // Take up the entire width of the container
    aspectRatio: 1, // Maintain aspect ratio
  },
  video: {
    width: '100%', // Take up the entire width of the container
    aspectRatio: 1, // Maintain aspect ratio
  },
  text: {
    fontSize: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
    color: "white",
  },
});
