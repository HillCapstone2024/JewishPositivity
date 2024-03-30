import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet, ScrollView, Button, Image, Dimensions, Modal, Pressable } from 'react-native';
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

export default function Archive({ navigaton }) {
  const [username, setUsername] = useState("");
  const [entries, setEntries] = useState([]);
  const [message, setMessage] = useState(<ActivityIndicator />);
  const [groupedEntries, setGroupedEntries] = useState({});
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [sortByTime, setSortByTime] = useState(true); // Default to sort by time
  const [momentTypeSortOrder, setMomentTypeSortOrder] = useState("Most Recent"); // Default to sort by most recent moment type

  theme = makeThemeStyle();

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
    try {
      // Decode the Base64 string to a Buffer
      const buffer = Buffer.from(base64String, "base64");
      // Convert the Buffer to a UTF-8 string
      const text = buffer.toString("utf8");
      return text;
    } catch (error) {
      console.error("Error decoding base64 string:", error);
      return "Error decoding content"; 
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
    setIsFilterModalVisible(false);
  };

  const sortByUploadTime = (a, b) => {
    if (sortByTime) {
      return moment(b.date).valueOf() - moment(a.date).valueOf(); // Most recent to oldest
    } else {
      return moment(a.date).valueOf() - moment(b.date).valueOf(); // Oldest to most recent
    }
  };
  
  const sortByMomentType = (a, b) => {
    if (momentTypeSortOrder === "Most Recent") {
      return b.moment_number - a.moment_number; // Most recent moment type first
    } else {
      return a.moment_number - b.moment_number; // Least recent moment type first
    }
  };

  const handleEntryPress = (entry) => {
    setSelectedEntry(entry);
    setModalVisible(true);
  };

  const closeModal = () => {
    setSelectedEntry(null);
    setModalVisible(false);
  };

  const onEdit = () => {

  }

  const getDividerColor = (moment_number) => {
    switch (moment_number) {
      case 1: //Modeh Ani
        return '#F9E79F'; // Gentle Sunbeam Yellow: #F9E79F | Soft Morning Blue: #AED6F1 | Fresh Meadow Green: #ABEBC6
      case 2: //Ashrei
        return '#4169E1'; // Royal Psalm Blue: #4169E1 | Golden Hallelujah: #FFD700 | Sacred Scroll Brown: #8B4513
      case 3: //Shema
        return '#DC143C'; // Pure White: #FFFFFF | Deep Crimson: #DC143C | Heavenly Violet: #6A5ACD
      default: //Default
        return 'grey';
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

      if (response.data && response.data.length > 3 && response.data[3].content_type) {
        console.log('RESPONSE:', response.data[3].content_type);
      } else {
        console.error("Unexpected response format:", response.data);
      }
      console.log('number of entries: ',response.data.length)
      
      // Group entries by year/month
      const groupedEntries = {};
      response.data.forEach(entry => {
        const yearMonth = moment(entry.date).format('YYYY-MM');
        if (!groupedEntries[yearMonth]) {
          groupedEntries[yearMonth] = [];
        }
        groupedEntries[yearMonth].push(entry);
      });

      // Set grouped entries state
      setGroupedEntries(groupedEntries);
      // setEntries(response.data);

      return response.data;
    } catch (error) {
      console.error("Error retrieving check in entries:", error);
      throw new Error("Check in entries failed");
    }
  };

  const renderContent = (data) => {
    let checkInText = "";
    switch (data.moment_number) {
      case 1:
        checkInText = "Modeh Ani";
        break;
      case 2:
        checkInText = "Ashrei";
        break;
      case 3:
        checkInText = "Shema";
        break;
      default:
        checkInText = "Unknown Check-in";
        break;
    }

    const dividerColor = getDividerColor(data.moment_number); // Get divider color based on moment_number
    
    switch (data.content_type) {
      case "image":
        return (
          <View style={styles.contentContainer}>
            <View style={{flexDirection: 'row'}}>
              {/* Datetime section */}
              <View style={styles.datetimeContainer}>
                <Text style={[styles.text, styles.dayOfWeekText]}>
                  {moment(data.date, 'YYYY-MM-DD').format('ddd')}
                  </Text>
                <Text style={[styles.text, styles.dayNumberText]}>
                  {moment(data.date, 'YYYY-MM-DD').format('D')}
                  </Text>
                <Text style={styles.text}>
                  {moment(data.date, 'YYYY-MM-DD').format('h:mm A')}
                  </Text>
              </View>
              <View style={[styles.divider, { backgroundColor: dividerColor }]} />
              {/* Content section */}
              <View style={styles.contentSection}>
                <View style={styles.middleContent}>
                <Text style={styles.middleContentHeader} numberOfLines={1} ellipsizeMode="tail">Header would go here {/* data.header */}</Text>
                  <Text style={styles.middleContentMoment_Number}>{checkInText}</Text>
                  <Text style={styles.middleContentText} numberOfLines={3} ellipsizeMode="tail">{/* data.content */}This is some long content text that will be truncated if it takes up too much space in the container.</Text>
                </View>
              </View>
              {/* Image content */}
              <View style={styles.imageContainer}>
                <Image
                  style={styles.image}
                  source={{ uri: `data:image/jpeg;base64,${data.content}` }}
                />
              </View>
            </View>
          </View>
        );
  
      case "video":
        return (
          <View style={styles.contentContainer}>
            <View style={{flexDirection: 'row'}}>
              {/* Datetime section */}
              <View style={styles.datetimeContainer}>
                <Text style={[styles.text, styles.dayOfWeekText]}>
                  {moment(data.date, 'YYYY-MM-DD').format('ddd')}
                  </Text>
                <Text style={[styles.text, styles.dayNumberText]}>
                  {moment(data.date, 'YYYY-MM-DD').format('D')}
                  </Text>
                <Text style={styles.text}>
                  {moment(data.date, 'YYYY-MM-DD').format('h:mm A')}
                  </Text>
              </View>
              <View style={[styles.divider, { backgroundColor: dividerColor }]} />
              {/* Content section */}
              <View style={[styles.contentSection, { flex: 3.05 }]}>
                <View style={styles.middleContent}>
                <Text style={styles.middleContentHeader} numberOfLines={1} ellipsizeMode="tail">Header would go here {/* data.header */}</Text>
                  <Text style={styles.middleContentMoment_Number}>{checkInText}</Text>
                  <Text style={styles.middleContentText} numberOfLines={3} ellipsizeMode="tail">{decodeBase64ToText(data.content)}</Text>
                </View>
              </View>
              {/* Video Section */}
              <View style={styles.videoContainer}>
                <Video
                  style={styles.video}
                  source={{ uri: `data:video/mp4;base64,${data.content}` }}
                  useNativeControls
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>
        );
  
      case "text":
        return (
          <View style={styles.contentContainer}>
            <View style={{flexDirection: 'row'}}>
              {/* Datetime section */}
              {/* Datetime section */}
              <View style={styles.datetimeContainer}>
                <Text style={[styles.text, styles.dayOfWeekText]}>
                  {moment(data.date, 'YYYY-MM-DD').format('ddd')}
                  </Text>
                <Text style={[styles.text, styles.dayNumberText]}>
                  {moment(data.date, 'YYYY-MM-DD').format('D')}
                  </Text>
                <Text style={styles.text}>
                  {moment(data.date, 'YYYY-MM-DD').format('h:mm A')}
                  </Text>
              </View>
              <View style={[styles.divider, { backgroundColor: dividerColor }]} />
              {/* Content section */}
              <View style={[styles.contentSection, { flex: 3.05 }]}>
                <View style={styles.middleContent}>
                <Text style={styles.middleContentHeader} numberOfLines={1} ellipsizeMode="tail">Header would go here {/* data.header */}</Text>
                  <Text style={styles.middleContentMoment_Number}>{checkInText}</Text>
                  <Text style={styles.middleContentText} numberOfLines={3} ellipsizeMode="tail">{decodeBase64ToText(data.content)}</Text>
                </View>
              </View>
            </View>
          </View>
        );
  
      case "recording":
        // For audio, setup is more complex and requires loading the sound
        // This is a placeholder - see expo-av documentation for playing audio
        return (
          <View style={styles.contentContainer}>
            <View style={{flexDirection: 'row'}}>
              {/* Datetime section */}
              {/* Datetime section */}
              <View style={styles.datetimeContainer}>
                <Text style={[styles.text, styles.dayOfWeekText]}>
                  {moment(data.date, 'YYYY-MM-DD').format('ddd')}
                  </Text>
                <Text style={[styles.text, styles.dayNumberText]}>
                  {moment(data.date, 'YYYY-MM-DD').format('D')}
                  </Text>
                <Text style={styles.text}>
                  {moment(data.date, 'YYYY-MM-DD').format('h:mm A')}
                  </Text>
              </View>
              <View style={[styles.divider, { backgroundColor: dividerColor }]} />
              {/* Content section */}
              <View style={[styles.contentSection, { flex: 3.05 }]}>
                <View style={styles.middleContent}>
                <Text style={styles.middleContentHeader} numberOfLines={1} ellipsizeMode="tail">Header would go here {/* data.header */}</Text>
                  <Text style={styles.middleContentMoment_Number}>{checkInText}</Text>
                  <Text style={styles.middleContentText} numberOfLines={3} ellipsizeMode="tail">{decodeBase64ToText(data.content)}</Text>
                </View>
              </View>
              {/* Audio Section */}
              <View style={styles.contentSection}>
                <View style={styles.recordingContainer}>
                  <Text style={styles.text}>Recording</Text>
                </View>
              </View>
            </View>
          </View>
        );
  
      default:
        return (
          <View style={styles.contentContainer}>
            <View style={{flexDirection: 'row'}}>
              {/* Datetime section */}
              <View style={styles.datetimeContainer}>
                <Text style={[styles.text, styles.dayOfWeekText]}>
                  {moment(data.date, 'YYYY-MM-DD').format('ddd')}
                  </Text>
                <Text style={[styles.text, styles.dayNumberText]}>
                  {moment(data.date, 'YYYY-MM-DD').format('D')}
                  </Text>
                <Text style={styles.text}>
                  {moment(data.date, 'YYYY-MM-DD').format('h:mm A')}
                  </Text>
              </View>
              <View style={[styles.divider, { backgroundColor: dividerColor }]} />
              <View style={styles.contentSection}>
                <View style={styles.unsupportedContainer}>
                  <Text style={styles.text}>Unsupported content type</Text>
                </View>
              </View>
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
    <View style={[{ flex: 1 }, theme["background"]]}>
      
      <View style={styles.searchBarContainer}>
        <SearchBar
          placeholder="Search..."
          inputStyle={{ backgroundColor: '#ffffff', color: 'black' }}
          inputContainerStyle={{ backgroundColor: '#ffffff' }}
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
              <Pressable onPress={() => applyFilter("Sort by Newest to Oldest")} style={styles.filterOption}>
                <Text>Sort by Newest to Oldest</Text>
              </Pressable>
              <Pressable onPress={() => applyFilter("Sort by Oldest to Newest")} style={styles.filterOption}>
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
        <TouchableOpacity onPress={toggleFilterModal} style={styles.filterButton}>
          <Ionicons name="filter" size={24} color="#4A90E2" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleGetEntries} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color={theme['color'].backgroundColor} style={styles.refreshIcon} />
        </TouchableOpacity>
      </View>
  
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={[{ alignItems: "center", justifyContent: "center" }, theme["background"]]}>
        {Object.keys(groupedEntries).map(yearMonth => (
          <View key={yearMonth} style={styles.yearMonthContainer}>
            <Text style={styles.yearMonthHeader}>{moment(yearMonth, 'YYYY-MM').format('MMMM YYYY')}</Text>
            {groupedEntries[yearMonth]
              .sort(sortByUploadTime) // Apply sorting by upload time
              // .sort(sortByMomentType) // Apply sorting by moment type
              .map((item, index) => (
                <TouchableOpacity key={index} onPress={() => handleEntryPress(item)}>
                  {renderContent(item)}
                </TouchableOpacity>
              ))}
              {/* Modal to display journal entry details */}
              <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
              >
                <View style={styles.modalContainer}>
                  <View style={styles.JournalEntryModalContent}>
                  <View style={styles.buttonRow}>
                    <Ionicons name="close-circle" style={styles.JournalEntryModalIcons} onPress={closeModal} />
                    <Ionicons name="create" style={styles.JournalEntryModalIcons} onPress={onEdit} />
                  </View>
                    <Text>Header: Header Would Go Here </Text>
                    <Text>Date: {selectedEntry?.date}</Text>
                    <Text>Moment: {selectedEntry?.moment_number}</Text>
                    {/* <Text>Content: {selectedEntry?.content}</Text> */}
                    {/* Add more details as needed */}
                    <Image
                      style={styles.JournalEntryModalImage}
                      source={{ uri: `data:image/jpeg;base64,${selectedEntry?.content}` }}
                    />
                  </View>
                </View>
              </Modal>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );  
}
  
function getWidth() {
let width = Dimensions.get("window").width;

return width = width - 25;
}
  
const styles = StyleSheet.create({
  scrollViewContent: {
  flexGrow: 1,
  },
  contentContainer: {
    minHeight: 100,
    maxHeight: 100,
    marginTop: 10,
    padding: 5,
    alignItems: 'center',
    width: getWidth(),
    alignSelf: 'center',
    borderRadius: 5, 
    backgroundColor: '#f2f2f2',
    shadowColor: '#4A90E2',
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
    justifyContent: 'center', 
    alignItems: 'center', 
  },
  divider: {
    width: 2,
    backgroundColor: 'grey', 
  },
  contentSection: {
    flex: 2,
    paddingLeft: 10,
  },
  image: {
    height: '100%', 
    aspectRatio: 1, 
    borderRadius: 5,
  },
  video: {
    height: '100%',
    aspectRatio: 1,
    borderRadius: 5,
  },
  text: {
    fontSize: 16,
  },
  dayOfWeekText: {
    fontSize: 18,
    textTransform: 'uppercase',
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
    fontWeight: 'bold',
  },
  middleContentMoment_Number: {
    fontSize: 10,
    fontStyle: 'italic',
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
    textTransform: 'uppercase',
    fontWeight: 'bold',
    backgroundColor: '#4A90E2',
    paddingVertical: 5,
    paddingHorizontal: 5,
    width: getWidth() + 25,
  },

  // SearchBar + Filter Button + Refresh Button
  
  filterButton: {
    position: 'absolute',
    top: -57,
    right: 62.5,
    zIndex: 1,
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 4,
  },
  filterOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  searchBarContainer: {
    backgroundColor: 'transparent',
    borderBottomColor: 'transparent',
    borderTopColor: 'transparent',
    width: "85%",
  },
  refreshButton: {
    position: 'absolute',
    top: -57,
    right: 8,
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 4,
  },
  refreshIcon: {
    color: '#4A90E2',
  },

  // JournalEntryModal
  JournalEntryModalContent: {
    backgroundColor: 'white',
    width: Dimensions.get('window').width ,
    height: '80%',
    borderRadius: 10,
    elevation: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // marginTop: 10,
    padding: 5,
    borderBottomColor: 'grey',
    borderBottomWidth: 2,
  },
  JournalEntryModalIcons: {
    fontSize: 40, 
    color: "#4A90E2",
  },
  JournalEntryModalImage: {
    width: '100%', 
    aspectRatio: 1, 
    borderRadius: 5,
  }
});