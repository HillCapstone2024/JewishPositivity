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
      return "Error decoding content"; // Provide a default value or handle the error gracefully
    }
  };

  const toggleFilterModal = () => {
    setIsFilterModalVisible(!isFilterModalVisible);
  };

  const applyFilter = (filterOption) => {
    console.log("Selected filter option:", filterOption);
    setIsFilterModalVisible(false);
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
              <View style={styles.divider} />
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
              <View style={styles.divider} />
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
              <View style={styles.divider} />
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
              <View style={styles.divider} />
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
              <View style={styles.divider} />
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
    <View style={[{ flex: 1 }, theme["background"], styles.container]}>
      <View style={styles.searchBarContainer}>
        <SearchBar
          placeholder="Search..."
          inputStyle={{ backgroundColor: '#ffffff', color: 'black' }}
          inputContainerStyle={{ backgroundColor: '#ffffff' }}
          containerStyle={styles.searchBarContainer}
        />
      </View>
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
            <Pressable onPress={() => applyFilter("Default")} style={styles.filterOption}>
              <Text>Sort by Newest to Oldest</Text>
            </Pressable>
            <Pressable onPress={() => applyFilter("Option 2")} style={styles.filterOption}>
              <Text>Sort by Oldest to Newest</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <TouchableOpacity onPress={toggleFilterModal} style={styles.filterButton}>
        <Ionicons name="filter" size={24} color="grey" />
      </TouchableOpacity>
      <TouchableOpacity onPress={handleGetEntries} style={styles.refreshButton}>
        <Ionicons name="refresh" size={24} color={theme['color'].backgroundColor} style={styles.refreshIcon} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={[{ alignItems: "center", justifyContent: "center" }, theme["background"]]}>
          {Object.keys(groupedEntries).map(yearMonth => (
            <View key={yearMonth} style={styles.yearMonthContainer}>
              <Text style={styles.yearMonthHeader}>{moment(yearMonth, 'YYYY-MM').format('MMMM YYYY')}</Text>
              {groupedEntries[yearMonth].map((item, index) => (
                <View key={index}>
                  {renderContent(item)}
                </View>
              ))}
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
    width: getWidth(), // Adjust the width as desired
    alignSelf: 'center', // Center the content horizontally
    borderWidth: .17,
    borderColor: 'black',
    borderRadius: 5, 
    backgroundColor: '#f2f2f2',
    shadowColor: '#4A90E2', // Updated shadow color
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
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBarContainer: {
    backgroundColor: 'transparent',
    borderBottomColor: 'transparent',
    borderTopColor: 'transparent',
    width: "85%",
  },
  refreshButton: {
    position: 'absolute',
    top: 9,
    right: 2,
    zIndex: 1,
    // backgroundColor: 'blue',
    padding: 12,
    // borderRadius: 20,
  },
  refreshIcon: {
    color: '#4A90E2',
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
  filterButton: {
    position: 'absolute',
    top: 9,
    right: 50,
    zIndex: 1,
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 2,
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
  filterOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
  },
});