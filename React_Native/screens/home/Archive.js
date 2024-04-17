import React, { useEffect, useState, useRef } from "react";
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
  Animated,
} from "react-native";
import makeThemeStyle from '../../tools/Theme.js';
import * as Storage from "../../AsyncStorage.js";
import IP_ADDRESS from "../../ip.js";
const API_URL = "http://" + IP_ADDRESS + ":8000";
import axios from 'axios';
import { Video, Audio } from "expo-av";
import { Buffer } from "buffer";
import { SearchBar } from 'react-native-elements';
import { Ionicons } from "@expo/vector-icons";
import moment from 'moment';
import * as FileSystem from "expo-file-system";
import LoadingScreen from "../greet/Loading.js";
import VideoViewer from "../../tools/VideoViewer.js";
import RecordingViewer from "../../tools/RecordingViewer.js";

export default function Archive({ navigation }) {
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [username, setUsername] = useState("");
  const [checkin_id, setCheckin_id] = useState("");
  const [entries, setEntries] = useState([]);
  const [message, setMessage] = useState(<ActivityIndicator />);
  const [groupedEntries, setGroupedEntries] = useState({});
  const [video, setVideo] = useState({});
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [sortByTime, setSortByTime] = useState(true); // Default to sort by time
  const [momentTypeSortOrder, setMomentTypeSortOrder] = useState("Most Recent"); // Default to sort by most recent moment type
  const [sortBy, setSortBy] = useState("Sort by Newest to Oldest");
  const videoRefs = useRef({});

  theme = makeThemeStyle();

  useEffect(() => {
    initializeData();
  }, []);

  async function initializeData() {
    setIsLoading(true);
    console.log("initializing data");
    const storedUsername = await Storage.getItem("@username");
    const groupedEntries = await handleGetEntries(storedUsername);

    setUsername(storedUsername || "No username");
    setGroupedEntries(groupedEntries);
    console.log("finished initialzing data.");
    setIsLoading(false);
  }

  const onRefresh = React.useCallback(() => {
    const refresh = async () => {
      setRefreshing(true);
      try {
        console.log("refreshing...");
        const groupedEntries = await handleGetEntries(username);
        setGroupedEntries(groupedEntries);
      } catch (error) {
        console.error("Failed to refresh:", error);
      } finally {
        setRefreshing(false);
      }
    };

    if (!refreshing) {
      refresh(); // Correctly invoke the async function
    }
  }, [refreshing]); // Ensure dependencies are correctly listed

  const getCsrfToken = async () => {
    try {
      const response = await axios.get(`${API_URL}/csrf-token/`);
      return response.data.csrfToken;
    } catch (error) {
      console.error("Error retrieving CSRF token:", error);
      throw new Error("CSRF token retrieval failed");
    }
  };

  const saveBase64Video = async (base64String, checkin_id) => {
    console.log("reached file function");
    const filename =
      FileSystem.documentDirectory + checkin_id + "downloadedVideo.mp4";
    await FileSystem.writeAsStringAsync(filename, base64String, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return filename; // This is a URI that can be used in the app
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

  const toggleFilterModal = () => {
    setIsFilterModalVisible(!isFilterModalVisible);
  };

  const applyFilter = (filterOption) => {
    if (filterOption === "Sort by Newest to Oldest") {
      setSortByTime(true);
    } else if (filterOption === "Sort by Oldest to Newest") {
      setSortByTime(false);
    } else if (filterOption === "Sort by Most Recent Moment Type") {
      setMomentTypeSortOrder("Most Recent");
    } else if (filterOption === "Sort by Least Recent Moment Type") {
      setMomentTypeSortOrder("Least Recent");
    }
    setSortBy(filterOption);
    setIsFilterModalVisible(false);
  };

  const sortByUploadTime = (a, b) => {
    const momentA = moment(`${a.date} ${a.time}`, "YYYY-MM-DD HH:mm");
    const momentB = moment(`${b.date} ${b.time}`, "YYYY-MM-DD HH:mm");

    if (sortByTime) {
      return momentB.valueOf() - momentA.valueOf(); // Most recent to oldest
    } else {
      return momentA.valueOf() - momentB.valueOf(); // Oldest to most recent
    }
  };

  const sortByMomentType = (a, b) => {
    if (momentTypeSortOrder === "Most Recent") {
      return b.moment_number - a.moment_number; // Most recent moment type first
    } else {
      return a.moment_number - b.moment_number; // Least recent moment type first
    }
  };

  const getDividerColor = (moment_number) => {
    switch (moment_number) {
      case 1: //Modeh Ani
        return "#F9E79F"; // Gentle Sunbeam Yellow: #F9E79F | Soft Morning Blue: #AED6F1 | Fresh Meadow Green: #ABEBC6
      case 2: //Ashrei
        return "#4169E1"; // Royal Psalm Blue: #4169E1 | Golden Hallelujah: #FFD700 | Sacred Scroll Brown: #8B4513
      case 3: //Shema
        return "#DC143C"; // Pure White: #FFFFFF | Deep Crimson: #DC143C | Heavenly Violet: #6A5ACD
      default: //Default
        return "grey";
    }
  };

  const handleGetEntries = async (usernameProp) => {
    console.log("Fetching Check-in Moments");
    try {
      const csrfToken = await getCsrfToken();
      const response = await axios.get(`${API_URL}/get_checkin_info/`, {
        params: {
          username: usernameProp,
        },
      });

      if (
        response.data &&
        response.data.length > 3 &&
        response.data[3].content_type
      ) {
        console.log("RESPONSE:", response.data[3].content_type);
      } else {
        console.error("Unexpected response format:", response.data);
      }
      console.log("number of entries: ", response.data.length);

      // Group entries by year/month
      console.log("Grouping the entries by year");
      const groupedEntries = {};
      response.data.forEach((entry) => {
        const yearMonth = moment(entry.date).format("YYYY-MM");
        if (!groupedEntries[yearMonth]) {
          groupedEntries[yearMonth] = [];
        }
        groupedEntries[yearMonth].push(entry);
      });

      // Set grouped entries state along with their corresponding videos
      // setGroupedEntries(groupedEntries);

      console.log("Returning Journal Entry Data");
      return groupedEntries;
    } catch (error) {
      console.error("Error retrieving check in entries:", error);
      throw new Error("Check in entries failed");
    }
  };

  const renderDateTimeSection = (date, time) => (
    <View style={styles.datetimeContainer}>
      <Text style={[styles.text, styles.dayOfWeekText]}>
        {moment(date, "YYYY-MM-DD").format("ddd")}
      </Text>
      <Text style={[styles.text, styles.dayNumberText]}>
        {moment(date, "YYYY-MM-DD").format("D")}
      </Text>
      <Text style={styles.text}>{moment(time, "HH-mm").format("h:mm A")}</Text>
    </View>
  );

  const getMomentText = (momentNumber) => {
    switch (momentNumber) {
      case 1:
        return "Modeh Ani - Gratitude";
      case 2:
        return "Ashrei - Happiness";
      case 3:
        return "Shema - Reflection";
      default:
        return "Unknown Check-in Type";
    }
  };

  const renderContent = (data) => {
    const dividerColor = getDividerColor(data.moment_number);

    return (
      <View style={styles.contentContainer}>
        <View style={{ flexDirection: "row" }}>
          {renderDateTimeSection(data.date, data.time)}
          <View style={[styles.divider, { backgroundColor: dividerColor }]} />
          <View
            style={[
              styles.contentSection,
              data.content_type === "text" && { flex: 3.05 },
            ]}
          >
            <View style={styles.middleContent}>
              <Text style={styles.middleContentMoment_Number} numberOfLines={1}>
                {getMomentText(data.moment_number)}
              </Text>
              <Text
                style={styles.middleContentText}
                numberOfLines={3}
                ellipsizeMode="tail"
              >
                {data.text_entry !== null
                  ? data.text_entry
                  : "This is some long content text that will be truncated if it takes up too much space in the container."}
              </Text>
            </View>
          </View>
          {data.content_type === "image" && (
            <View style={styles.imageContainer}>
              <Image
                style={styles.image}
                source={{ uri: `data:image/jpeg;base64,${data.content}` }}
              />
            </View>
          )}
          {data.content_type === "video" && (
            <View style={styles.video}>
              <View style={styles.videoContainer}>
                {video[data.checkin_id] ? (
                  <VideoViewer
                    source={video[data.checkin_id]}
                    style={{ height: "100%", aspectRatio: 1, borderRadius: 5 }}
                  />
                ) : (
                  <TouchableOpacity
                    onPress={() => {
                      handleGetVideo(data.checkin_id);
                    }}
                  >
                    <Image
                      source={{ uri: `data:Image/mp4;base64,${data?.content}` }}
                      style={styles.JournalEntryModalImage}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
          {data.content_type === "recording" && (
            <View style={styles.audioContainer}>
              <RecordingViewer
                style={styles.audio}
                source={`data:audio/mp3;base64,${data.content}`}
              />
            </View>
          )}
        </View>
      </View>
    );
  };

  useEffect(() => {
    if (entries.length == 0) {
      setMessage(
        <Text style={[styles.title, theme["color"]]}>No entries yet!</Text>
      );
    }
  }, []);

  return (
    <View style={[{ flex: 1, paddingBottom: 100 }, theme["background"]]}>
      {isLoading ? (
        // <ActivityIndicator style={{ height: 100, width: 100 }} />
        <View testID="loading-screen" style={styles.loadingStyle}>
          <LoadingScreen />
        </View>
      ) : (
        <View>
          <View style={styles.searchBarContainer}>
            <SearchBar
              placeholder="Search..."
              inputStyle={{ backgroundColor: "#ffffff", color: "black" }}
              inputContainerStyle={{ backgroundColor: "#ffffff" }}
              containerStyle={styles.searchBarContainer}
            />
          </View>
          <View style={styles.buttonContainer}>
            <Modal
              animationType="slide"
              transparent={true}
              visible={isFilterModalVisible}
              onRequestClose={() => {
                setIsFilterModalVisible(!isFilterModalVisible);
              }}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Pressable
                    onPress={() => applyFilter("Sort by Newest to Oldest")}
                    style={styles.filterOption}
                  >
                    <Text>Sort by Newest to Oldest</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => applyFilter("Sort by Oldest to Newest")}
                    style={styles.filterOption}
                  >
                    <Text>Sort by Oldest to Newest</Text>
                  </Pressable>
                  {/* <Pressable onPress={() => applyFilter("Sort by Most Recent Moment Type")} style={styles.filterOption}>
                <Text>Sort by Most Recent Moment Type</Text>
              </Pressable>
              <Pressable onPress={() => applyFilter("Sort by Least Recent Moment Type")} style={styles.filterOption}>
                <Text>Sort by Least Recent Moment Type</Text>
              </Pressable> */}
                </View>
              </View>
            </Modal>
            <TouchableOpacity
              onPress={toggleFilterModal}
              style={styles.filterButton}
            >
              <Ionicons name="filter" size={24} color="#4A90E2" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onRefresh}
              style={styles.refreshButton}
            >
              <Ionicons
                name="refresh"
                size={24}
                color={theme["color"].backgroundColor}
                style={styles.refreshIcon}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollViewContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                testID="refresh-control"
              />
            }
          >
            <View
              style={[
                { alignItems: "center", justifyContent: "center" },
                theme["background"],
              ]}
            >
              {Object.keys(groupedEntries)
                .sort((a, b) => {
                  if (sortBy === "Sort by Newest to Oldest") {
                    return (
                      moment(b, "YYYY-MM").valueOf() -
                      moment(a, "YYYY-MM").valueOf()
                    );
                  } else if (sortBy === "Sort by Oldest to Newest") {
                    return (
                      moment(a, "YYYY-MM").valueOf() -
                      moment(b, "YYYY-MM").valueOf()
                    );
                  }
                })
                .map((yearMonth) => (
                  <View key={yearMonth} style={styles.yearMonthContainer}>
                    <Text style={styles.yearMonthHeader}>
                      {moment(yearMonth, "YYYY-MM").format("MMMM YYYY")}
                    </Text>
                    {groupedEntries[yearMonth]
                      .sort(sortByUploadTime) // Apply sorting by upload time
                      // .sort(sortByMomentType) // Apply sorting by moment type
                      .map((item, index) => (
                        <TouchableOpacity
                          key={index}
                          // onPress={() => handleEntryPress(item)}
                          onPress={() =>
                            navigation.navigate("JournalEntryDetails", {
                              selectedEntry: item,
                            })
                          }
                        >
                          {renderContent(item)}
                        </TouchableOpacity>
                      ))}
                    {/* Modal to display journal entry details */}
                  </View>
                ))}
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
}
  
function getWidth() {
let width = Dimensions.get("window").width;

return width - 25;
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
    width: getWidth(),
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
  audio: {
    height: 90,
    width: 90,
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
  middleContentMoment_Number: {
    // fontStyle: "italic",
    marginBottom: 5,
    fontSize: 20,
    fontWeight: "bold",
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
    width: getWidth() + 25,
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
  JournalEntryModalVideo: {
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
  loadingStyle: {
    // width: 20,
    // height: 20,
    // alignContent: "center",
    marginTop: 200,
    backgroundColor: "red",
  },
});