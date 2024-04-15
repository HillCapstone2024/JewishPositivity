import React, { useEffect, useState, useRef } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet, ScrollView, Button, Image, Dimensions, Modal, Pressable, TouchableWithoutFeedback } from 'react-native';
import makeThemeStyle from '../../tools/Theme.js';
import * as Storage from "../../AsyncStorage.js";
import IP_ADDRESS from "../../ip.js";
const API_URL = "http://" + IP_ADDRESS + ":8000";
import axios from 'axios';
import { Ionicons } from "@expo/vector-icons";
import moment from 'moment';
import * as FileSystem from "expo-file-system";
import { useNavigation } from '@react-navigation/native';

import EditCheckIn from "./EditCheckIn.js";
import VideoViewer from "../../tools/VideoViewer.js";
import ImageViewer from "../../tools/ImageViewer.js";
import RecordingViewer from "../../tools/RecordingViewer.js";

const JournalEntryDetailsScreen = ({ route, navigation }) => {
  const [username, setUsername] = useState("");
  const [checkin_id, setCheckin_id] = useState("");
  const [groupedEntries, setGroupedEntries] = useState({});
  const [video, setVideo] = useState({});
  const [deleteModalVisible, setEditDeleteModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const videoRefs = useRef({});
  const { selectedEntry } = route.params;
 
  theme = makeThemeStyle(); 

  const saveBase64Video = async (base64String, checkin_id, handleEllipsisPress ) => {
    console.log("reached file function");
    const filename = FileSystem.documentDirectory + checkin_id + "downloadedVideo.mp4";
    await FileSystem.writeAsStringAsync(filename, base64String, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return filename; // This is a URI that can be used in the app
  };

  const getCsrfToken = async () => {
    try {
    const response = await axios.get(`${API_URL}/csrf-token/`);
    return response.data.csrfToken;
    } catch (error) {
    console.error("Error retrieving CSRF token:", error);
    throw new Error("CSRF token retrieval failed");
    }
  };

  const handleGetVideo = async (checkin_id) => {
    console.log("getting video for check num:", checkin_id);
    try {
      const csrfToken = await getCsrfToken();
      const response = await axios.get(`${API_URL}/get_video_info/`, {
        params: {
          checkin_id: checkin_id,
        },
      });
      // console.log(response.data);
      const videoUri = await saveBase64Video(response.data, checkin_id);
      console.log("got video success:", videoUri);

      setVideo((prevVideos) => ({
        ...prevVideos,
        [checkin_id]: videoUri,
      }));
      // setVideo(videoUri);
      // videoUriRef.current = videoUri;
      videoRefs.current[checkin_id] = videoUri;
      console.log(videoRefs.current);
      return response.data;
    } catch (error) {
      console.log("Error retrieving video:", error);
      throw new Error("video retreival failed");
    }
  };

  const onEditPress = () => {
    console.log("Pressed Edit Button");
    setEditDeleteModalVisible(false);
    setEditModalVisible(true);
  }

  const onDelete = async() => {
    console.log("Deleting Journal Entry:", checkin_id);
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
        `${API_URL}/delete_checkin/`,
        {
          username: username,
          checkin_id: checkin_id,
        },
        {
          headers: {
            "X-CSRFToken": csrfToken,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      console.log("Delete response:", response.data);
      // await Storage.removeItem("@username");
      navigation.reset({
        index: 0,
        routes: [{ name: "Archive" }],
      });
      navigation.navigate("Archive");
    } catch (error) {
      if (error.response.data) {
        console.error("Error Deleting Journal Entry:", error.response.data);
      }
    }
  }

  handleGetEntries = async () => {
    console.log("Fetching Journal Entries");
    try {
      const csrfToken = await getCsrfToken();
      const response = await axios.get(`${API_URL}/get_checkin_info/`, {
        params: {
          username: username
        }
      });
  
      if (response.data && response.data.length > 3 && response.data[3].content_type) {
        console.log('RESPONSE:', response.data[3].content_type);
      } else {
        console.error("Unexpected response format:", response.data);
      }
      console.log('number of entries: ', response.data.length)
  
      // Group entries by year/month
      console.log("Grouping the entries by year")
      const groupedEntries = {};
      response.data.forEach(entry => {
        const yearMonth = moment(entry.date).format('YYYY-MM');
        if (!groupedEntries[yearMonth]) {
          groupedEntries[yearMonth] = [];
        }
        groupedEntries[yearMonth].push(entry);
      });
  
      // Set grouped entries state along with their corresponding videos
      setGroupedEntries(groupedEntries);
  
      console.log("Returning Journal Entry Data")
      return response.data;
    } catch (error) {
      console.error("Error retrieving check in entries:", error);
      throw new Error("Check in entries failed");
    }
  };  

  const getMomentText = (momentNumber) => {
    switch (momentNumber) {
      case 1:
        return "A Modeh Ani Moment ";
      case 2:
        return "Ashrei in the Afternoon";
      case 3:
        return "A Shema Reflection";
      default:
        return "Unknown Check-in Type";
    }
  };

  return (
    <View style={styles.modalContainer}>
    {/* modal to show EditDeleteModal */}
    <Modal
        animationType="slide"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setEditDeleteModalVisible(false)}
    >
        <TouchableWithoutFeedback
        onPress={() => setEditDeleteModalVisible(false)}
        >
        <View style={styles.centeredView}>
            {/* Prevents the modal content from closing when pressing on it */}
            <TouchableWithoutFeedback>
            <View style={styles.modalView}>
                <View style={styles.editDeleteContainer}>
                {/* Edit button */}
                <TouchableOpacity onPress={onEditPress}>
                    <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
                <View style={styles.horizontalBar} />
                {/* Delete button */}
                <TouchableOpacity onPress={() => {
                    setCheckin_id(selectedEntry?.checkin_id);
                    console.log(checkin_id);
                    onDelete();
                    // setEditDeleteModalVisible(false);
                }}>
                    <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
                </View>
                {/* Cancel button */}
                <View style={styles.cancelContainer}>
                <TouchableOpacity onPress={() => 
                    setEditDeleteModalVisible(false)}>
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                </View>
            </View>
            </TouchableWithoutFeedback>
        </View>
        </TouchableWithoutFeedback>
    </Modal>
    <EditCheckIn 
        editModalVisible={editModalVisible} 
        setEditModalVisible={setEditModalVisible} 
        selectedEntry={selectedEntry}
    />

    <View style={styles.JournalEntryModalContent}>
        <View style={styles.buttonRow}>
        {/* <Ionicons
            name="close-outline"
            style={styles.JournalEntryModalIcons}
        //   onPress={closeModal}
        /> */}
        <Ionicons
            name="ellipsis-horizontal-outline"
            style={styles.JournalEntryModalIcons}
            onPress={() => {
            setCheckin_id(selectedEntry?.checkin_id);
            setEditDeleteModalVisible(true);
            }}
        />
        </View>
        <ScrollView padding={10}>
        <Text style={[styles.headerText]}>
            {getMomentText(selectedEntry?.moment_number)}
        </Text>
        <Text style={[styles.detailText, { marginBottom: 20 }]}>
            {moment(selectedEntry?.date, "YYYY-MM-DD").format("dddd, D MMMM YYYY")}{" "}
        </Text>      

        {selectedEntry?.content_type === "image" && (
            <Image
            style={[styles.JournalEntryModalImage,{ marginBottom: 20 },]}
            source={{uri: `data:image/jpeg;base64,${selectedEntry?.content}`,}}
            />
        )}
        {selectedEntry?.content_type === "video" && (
            <View style={styles.JournalEntryModalVideo}>
            {video[selectedEntry.checkin_id] ? (
                <VideoViewer
                  source={video[selectedEntry.checkin_id]}
                  style={styles.JournalEntryModalVideo}
                />
            ) : (
                <TouchableOpacity
                onPress={() => {
                    handleGetVideo(selectedEntry.checkin_id);
                }}
                >
                <Image
                    source={{ uri: `data:Image/mp4;base64,${selectedEntry?.content}` }}
                    style={styles.JournalEntryModalImage}
                />
                </TouchableOpacity>
            )}
            </View>
        )}
        {selectedEntry?.content_type === "recording" && (
            <RecordingViewer
            source={`data:audio/mp3;base64,${selectedEntry?.content}`}
            style={{ height: 60, width: 60, borderRadius: 5 }}
            />
        )}
        <Text style={[styles.detailText, { marginBottom: 20 }]}>
            {selectedEntry?.text_entry !== null ? selectedEntry?.text_entry: "  This is some long content text that will be truncated if it takes up too much space in the container."}
        </Text>

        </ScrollView>
    </View>
    </View>
  );
};

export default JournalEntryDetailsScreen;

const styles = StyleSheet.create({
    // JournalEntryModal
    JournalEntryModalContent: {
      backgroundColor: "white",
      height: "100%",
    },
    buttonRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    //   marginTop: 50,
      padding: 5,
      borderBottomColor: "grey",
      borderBottomWidth: 2,
    },
    JournalEntryModalIcons: {
      fontSize: 40,
      color: "#4A90E2",
    },
    JournalEntryModalImage: {
      width: "100%",
      aspectRatio: 1,
      borderRadius: 5,
    },
    JournalEntryModalVideo: {
      width: "100%",
      aspectRatio: 1,
      borderRadius: 5,
    },
    headerText: {
      fontSize: 22,
      fontWeight: "bold",
    },
    detailText: {
      fontSize: 14,
      color: "grey",
      fontWeight: 500,
      lineHeight: 20,
    }, 
  
    // Edit/Delete Modal
    centeredView: {
      flex: 1,
      justifyContent: "flex-end",
      // alignItems: "center",
      marginBottom: 20,
    },
    horizontalBar: {
      height: 1,
      width: "100%",
      backgroundColor: "#ccc",
      margin: 15,
    },
    editDeleteContainer: {
      marginBottom: 20,
      marginHorizontal: 20,
      backgroundColor: "white",
      borderRadius: 10,
      padding: 15,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    cancelContainer: {
      marginBottom: 20,
      marginHorizontal: 20,
      backgroundColor: "white",
      borderRadius: 10,
      padding: 15,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    cancelText: {
      textAlign: "center",
      fontSize: 20,
      fontWeight: "500",
      color: "#4A90E2",
    },
    deleteText: {
      color: "red",
      fontSize: 18,
    },
    editText: {
      fontSize: 18,
      color: "#4A90E2",
    },
  });