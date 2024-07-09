import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Button,
  Image,
  Dimensions,
  Modal,
  Pressable,
  TouchableWithoutFeedback,
  RefreshControl,
} from "react-native";
import axios from "axios";
const API_URL = "http://" + IP_ADDRESS + ":8000";
import IP_ADDRESS from "../../ip.js";
import { Video, Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";
import * as FileSystem from "expo-file-system";

export default function ViewCheckIn({ checkin, modalVisible, onClose }) {
  const [video, setVideo] = useState(null);


  const saveBase64Video = async (base64String) => {
    console.log("reached file function");
    const filename = FileSystem.documentDirectory + "downloadedVideo.mp4";
    await FileSystem.writeAsStringAsync(filename, base64String, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return filename; // This is a URI that can be used in the app
  };

  const getMomentText = (momentNumber) => {
    switch (momentNumber) {
      case 1:
        return "Modeh Ani";
      case 2:
        return "Ashrei";
      case 3:
        return "Shema";
      default:
        return "Unknown Check-in Type";
    }
  };

    // const getCsrfToken = async () => {
    //   try {
    //     const response = await axios.get(`${API_URL}/csrf-token/`);
    //     return response.data.csrfToken;
    //   } catch (error) {
    //     console.error("Error retrieving CSRF token:", error);
    //     throw new Error("CSRF token retrieval failed");
    //   }
    // };

    const handleGetVideo = async (checkin_id) => {
      console.log("getting video for check num:", checkin_id);
      try {
        // const csrfToken = await getCsrfToken();
        const csrfToken = await Storage.getItem("@CSRF");
        const response = await axios.get(`${API_URL}/get_video_info/`, {
          params: {
            checkin_id: checkin_id,
          },
        });
        // console.log(response.data);
        const videoUri = await saveBase64Video(response.data);
        console.log("got video success:", videoUri);
        setVideo(videoUri);
        return response.data;
      } catch (error) {
        console.log("Error retrieving video:", error);
        throw new Error("video retreival failed");
      }
    };

    const getPrivacyState = (privacy) => {
      if (privacy === false) {
        return "Public";
      } else if (privacy === true) {
        return "Private";
      } else {
        return "Unknown Private State";
      }
    };

  return (
    <View style={styles.modalContainer}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          {/* modal to show EditDeleteModal */}
          {/* <EditCheckIn 
                      editModalVisible={editModalVisible} 
                      setEditModalVisible={setEditModalVisible} 
                      selectedEntry={selectedEntry}
                    /> */}

          <View style={styles.JournalEntryModalContent}>
            <View style={styles.buttonRow}>
              <Ionicons
                name="close-outline"
                style={styles.JournalEntryModalIcons}
                onPress={() => {
                  onClose();
                }}
              />
              {/* <Ionicons
                name="ellipsis-horizontal-outline"
                style={styles.JournalEntryModalIcons}
                onPress={() => {
                  // setEditDeleteModalVisible(true);
                }}
              /> */}
            </View>
            <ScrollView padding={10}>
              <Text style={[styles.headerText]}>
                {checkin?.header !== null
                  ? checkin?.header
                  : "Header Would Go Here"}
              </Text>
              <Text style={[styles.detailText]}>
                {moment(checkin?.date, "YYYY-MM-DD").format(
                  "dddd, D MMMM YYYY"
                )}{" "} - {getPrivacyState(checkin?.privacy)}
              </Text>
              <Text style={[styles.detailText, { marginBottom: 20 }]}>
                {getMomentText(checkin?.moment_number)}
              </Text>
              <Text>
                Hello{checkin?.privacy}
              </Text>
              
              {checkin?.content_type === "image" && (
                <Image
                  style={[styles.JournalEntryModalImage, { marginBottom: 20 }]}
                  source={{ uri: `data:image/jpeg;base64,${checkin?.content}` }}
                />
              )}
              {checkin?.content_type === "video" && (
                <TouchableOpacity>
                  <Image
                    style={[
                      styles.JournalEntryModalImage,
                      { marginBottom: 20 },
                    ]}
                    source={{
                      uri: `data:image/jpeg;base64,${checkin?.content}`,
                    }}
                  />
                </TouchableOpacity>
              )}
              {checkin?.content_type === "recording" && (
                <Text style={styles.text}>Recording</Text>
              )}
              <Text style={[styles.detailText, { marginBottom: 20 }]}>
                {checkin?.text_entry !== null
                  ? checkin?.text_entry
                  : "  This is some long content text that will be truncated if it takes up too much space in the container."}
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    // height: 500,
  },
  contentContainer: {
    minHeight: 100,
    maxHeight: 100,
    marginTop: 10,
    padding: 5,
    alignItems: "center",
    // width: ,
    alignSelf: "center",
    borderRadius: 5,
    backgroundColor: "#f2f2f2",
    shadowColor: "#4A90E2",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  datetimeContainer: {
    flex: 1,
    height: 90, //height = maxheight(100) - padding(5)
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    width: 2,
    backgroundColor: "grey",
  },
  contentSection: {
    flex: 2,
    paddingLeft: 10,
  },
  image: {
    height: "100%",
    aspectRatio: 1,
    borderRadius: 5,
  },
  video: {
    height: "100%",
    aspectRatio: 1,
    borderRadius: 5,
  },
  text: {
    fontSize: 16,
  },
  dayOfWeekText: {
    fontSize: 18,
    textTransform: "uppercase",
    letterSpacing: 1.25,
  },
  dayNumberText: {
    fontSize: 24,
    fontWeight: 500,
    paddingBottom: 5,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
    color: "white",
  },
  middleContent: {
    flex: 1,
    paddingBottom: 10,
  },
  middleContentHeader: {
    fontSize: 20,
    fontWeight: "bold",
  },
  middleContentMoment_Number: {
    fontSize: 10,
    fontStyle: "italic",
    marginBottom: 5,
  },
  middleContentText: {
    fontSize: 13,
  },
  yearMonthContainer: {
    marginBottom: 20,
  },
  yearMonthHeader: {
    fontSize: 14,
    textTransform: "uppercase",
    fontWeight: "bold",
    backgroundColor: "#4A90E2",
    paddingVertical: 5,
    paddingHorizontal: 5,
    // width: getWidth() + 25,
  },

  // SearchBar + Filter Button + Refresh Button

  filterButton: {
    position: "absolute",
    top: -57,
    right: 62.5,
    zIndex: 1,
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 4,
  },
  filterOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#cccccc",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  searchBarContainer: {
    backgroundColor: "transparent",
    borderBottomColor: "transparent",
    borderTopColor: "transparent",
    width: "85%",
  },
  refreshButton: {
    position: "absolute",
    top: -57,
    right: 8,
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 4,
  },
  refreshIcon: {
    color: "#4A90E2",
  },

  // JournalEntryModal
  JournalEntryModalContent: {
    backgroundColor: "white",
    width: Dimensions.get("window").width,
    height: "100%",
    borderRadius: 10,
    elevation: 5,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 50,
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
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 5,
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
