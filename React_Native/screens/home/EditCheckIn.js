import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Switch,
  Keyboard,
  Button,
  Dimensions,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  TextInput,
  Text,
  InputAccessoryView,
  ScrollView,
  Image,
  SafeAreaView,
  Platform,
  Animated,
  Modal,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import RecordingAccessoryBar from "../../tools/RecordingBar.js";
import MediaAccessoryBar from "../../tools/MediaBar.js";
import ImageViewer from "../../tools/ImageViewer.js";
import VideoViewer from "../../tools/VideoViewer.js";
import RecordingViewer from "../../tools/RecordingViewer.js";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";
import * as FileSystem from "expo-file-system";
import { Buffer } from "buffer";
import RNPickerSelect from "react-native-picker-select";

// import { Video, ResizeMode, Audio } from "expo-av";
import makeThemeStyle from "../../tools/Theme.js";
import * as Storage from "../../AsyncStorage.js";
import IP_ADDRESS from "../../ip.js";
const API_URL = "http://" + IP_ADDRESS + ":8000";

export default function EditCheckIn({ editModalVisible, setEditModalVisible, selectedEntry, navigation }) {
  const [checkin_id, setCheckin_id] = useState("");
  const [username, setUsername] = useState("");
  const [momentType, setMomentType] = useState(3);
  const [mediaUri, setMediaUri] = useState(null);
  const [mediaBox, setMediaBox] = useState(false);
  const [mediaType, setMediaType] = useState("text");
  const [base64Data, setBase64Data] = useState("");
  const [checkInText, setCheckInText] = useState(selectedEntry?.text_entry);
  const [showMediaBar, setShowMediaBar] = useState(true);
  const [mediaChanged, setMediaChanged] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [disableUpdate, setDisableUpdate] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPrivate, setIsPrivate] = useState(selectedEntry?.privacy);
  const [updating, setUpdating] = useState(false);
  const [video, setVideo] = useState({});
  const videoRefs = useRef({});
  const mediaAccessoryViewID = "MediaBar";
  const theme = makeThemeStyle();
  const now = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  const formattedDateTime = new Intl.DateTimeFormat("en-US", options).format(
    now
  );
  // const [sound, setSound] = useState();
  const videoRef = useRef(null);

  useEffect(() => {
    const loadUsername = async () => {
      const storedUsername = await Storage.getItem("@username");
      if (storedUsername) {
        setUsername(storedUsername);
      } else {
        setUsername("username not found");
      }
    };
    loadUsername();
    console.log("Initial privacy setting:",isPrivate);
    // configureAudioMode();
  }, []);

  useEffect(() => {
    setCheckin_id(selectedEntry.checkin_id);

    //sets media uri 
    if(selectedEntry?.content_type === "image")
    {
      setMediaUri(`data:image/jpeg;base64,${selectedEntry?.content}`);
      setMediaType("image");
      console.log("set mediaUri to passed in image");
    }
    if(selectedEntry?.content_type === "video")
    {
      setMediaUri(`data:video/mp4;base64,${selectedEntry?.content}`);
      setMediaType("video");
      console.log("set mediaUri to passed in video");
    }
    if(selectedEntry?.content_type === "recording")
    {
      setMediaUri(`data:audio/mp3;base64,${selectedEntry?.content}`);
      setMediaType("recording");
      console.log("set mediaUri to passed in audio");
    }
  }, []);

  useEffect(() => {
    if (selectedEntry.content_type && selectedEntry.content_type !== "text") {
        setMediaBox(true);
    }
    }, [selectedEntry.content_type]);

  async function readFileAsBase64(uri) {
    try {
      const base64Content = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64Content;
    } catch (error) {
      console.error("Failed to read file as base64", error);
      return null;
    }
  }


  const textToBase64 = (text) => {
    return Buffer.from(text, "utf8").toString("base64");
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

  const saveBase64Video = async (base64String, checkin_id ) => {
    console.log("reached file function");
    const filename = FileSystem.documentDirectory + checkin_id + "downloadedVideo.mp4";
    await FileSystem.writeAsStringAsync(filename, base64String, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return filename; // This is a URI that can be used in the app
  };


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

  const updateCheckIn = async () => {
    console.log("updating checkIn entry");
    setUpdating(true);
    let base64CheckInText = "";
    if (mediaType === "text") {
      base64CheckInText = textToBase64(checkInText);
      setBase64Data(base64CheckInText);
    }
    console.log("Check-in type: ", mediaType);
    try {
      // const csrfToken = await getCsrfToken();
      console.log("Text entry in update:", checkInText);
      const csrfToken = await Storage.getItem("@CSRF");
      const response = await axios.post(
        `${API_URL}/update_checkin_info/`,
        {
          username: username,
          checkin_id: checkin_id,
          content: base64Data,
          content_type: mediaType,
          text_entry: checkInText,
          privacy: isPrivate,
        },
        {
          headers: {
            "X-CSRFToken": csrfToken,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      console.log("check in response:", response.data);
      // Check for successful update and close modal
      // setEditModalVisible(false);
      navigation.goBack();
    } catch (error) {
      console.log(error);
      console.error("CheckIn Error:", error.response.data);
    }
  };

  const privacyNumbers = (privacyState) => {
    if (privacyState) {
      return 1;
    }
    else {
      return 0;
    }
  };

  const deleteMedia = () => {
    console.log("Deleting Check-in Media")
    setMediaUri(null);
    setMediaBox(false);
    setMediaType("text");
    setDisableUpdate(checkInText.trim().length === 1);
  };

  const handleRecordingComplete = async (uri) => {
    console.log("Received saved from recording bar:", uri);
    setShowMediaBar(true);
    setMediaUri(uri);
    setMediaType("recording");
    // setDisableUpdate(true);
    const base64String = await readFileAsBase64(uri);
    setBase64Data(base64String);
    setCheckInText("");
    setMediaBox(true);
    setMediaChanged(!mediaChanged);
    setDisableUpdate(false);
  };

  const handleMediaComplete = async (mediaProp) => {
    console.log("received data from mediabar", mediaProp);
    setMediaUri(mediaProp.assets[0].uri);
    setMediaType(mediaProp.assets[0].type);
    //sometimes mediaUri state doesn't update before next line
    //pass mediaProp.assets[0].uri directly to fix this
    setDisableUpdate(true);
    const base64String = await readFileAsBase64(mediaProp.assets[0].uri);
    setBase64Data(base64String);
    setMediaBox(true);
    setMediaChanged(!mediaChanged);
    setDisableUpdate(false);
  };

  const handleTextComplete = (text) => {
    setCheckInText(text);
    // console.log(text);
    setDisableUpdate(text.trim().length === 0);
  };

  const handleToggle = (toggle) => {
    console.log("checkIn side:", toggle);
    setShowMediaBar(!toggle);
  };

  const mediaBoxAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loadMediaContainer = () => {
      Animated.timing(mediaBoxAnim, {
        toValue: count, //final value
        duration: 1500, //update value in 500 milliseconds
        useNativeDriver: true,
      }).start();
    };
    loadMediaContainer;
  }, [showMediaBar]);

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

  const getMomentTextShortHand = (momentNumber) => {
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

  renderTextBasedOnType = () => {
    switch (selectedEntry?.checkInType) {
      case 'ModehAni':
        return (
          <View style={styles.textContainer}>
            <Text style={{marginBottom: 10, textAlign: 'right'}}>
              מוֹדֶה אֲנִי לְפָנֶיךָ, מֶלֶךְ חַי וְקַיָּם, שֶׁהֶחֱזַרְתָּ בִּי נִשְׁמָתִי בְּחֶמְלָה ,רַבָּה אֱמוּנָתֶךָ!
            </Text>
            <Text style={{marginBottom: 10, fontStyle:"italic"}}>
              Modeh ani l’fanecha, Melech chai v’kaya, she-hechezarta bi nishmati b’chemlah, rabbah emunatecha.
            </Text>
            <Text style={{marginBottom: 20}}>
              I give thanks to You, the Ever-Living Sovereign, that with compassion You have returned my soul to me, how great is Your faith!
            </Text>
          </View>
        );
      case 'Ashrei':
        return (
          <View style={styles.textContainer}>
            <Text style={{marginBottom: 10, textAlign: 'right'}}>
              אַשְׁרֵי יוֹשְׁבֵי בֵיתֶךָ עוֹד יְהַלְלוּךָ סֶּלָה.{"\n"}
              אַשְׁרֵי הָעָם שֶׁכָּכָה לּוֹ אַשְׁרֵי הָעָם שֶׁיֲהֹוָה אֱלֹהָיו.
            </Text>
            <Text style={{marginBottom: 10, fontStyle:"italic"}}>
              Ashrei yoshvei veitecha, od y’hal’lucha selah. {"\n"}
              Ashrei haam shekachah lo, ashrei haam she-Adonai Elohav
            </Text>
            <Text style={{marginBottom: 20}}>
              Happy are those who dwell in Your house, they shall praise you forever. {"\n"}
              Happy are those for whom it is so, happy the people from whom Adonai is God.
            </Text>
          </View>
        );
      default:
        return (
          <View style={styles.textContainer}>
            <Text style={{marginBottom: 10, textAlign: 'right'}}>
              שְׁמַע יִשרָאֵל יֲהֹוָה אֱלהֵינוּ יֲהֹוָה אֶחָד: {"\n"}
              בָּרוּךְ שֵׁם כְּבוד מַלְכוּתו לְעולָם וָעֶד:
            </Text>
            <Text style={{marginBottom: 10, fontStyle:"italic"}}>
              Sh’ma Yisrael, Adonai Eloheinu, Adonai Echad! {"\n"}
              Baruch Shem k’vod malchuto l’olam va-ed.
            </Text>
            <Text style={{marginBottom: 20}}>
              Hear O Israel, Adonai is our God, Adonai is one. {"\n"}
              Blessed be the Name whose glorious sovereignty is forever and ever.
            </Text>
          </View>
        );
    }
  };

  renderDescriptiveText = () => {
    switch (selectedEntry?.checkInType) {
      case 'ModehAni':
        return (
          <View>
            <Text style={styles.descriptionTitle}>
              A Modeh Ani Moment: Time for Gratitude
            </Text>
            <Text style={styles.descriptionText}>
              We begin our day by thanking God for the gift of our souls. As today begins, what are the things that you are grateful for this morning?
            </Text>
          </View>
        );
      case 'Ashrei':
        return (
          <View>
            <Text style={styles.descriptionTitle}>
              Ashrei in the Afternoon: Time for Happiness
            </Text>
            <Text style={styles.descriptionText}>
              The afternoon prayer of Ashrei is all about being happy. Take a few minutes now to do something that will make you happy or to reflect on something that is making you happy.
            </Text>
          </View>
        );
      default:
        return (
          <View>
            <Text style={styles.descriptionTitle}>
              Time for a Shema Reflection
            </Text>
            <Text style={styles.descriptionText}>
              The Shema is a prayer traditionally recited at bedtime. The prayer begins with the instruction to “Hear,” so at the end of the day, we consider what we heard or experienced that brought us joy or meaning. Think about what you want to hold onto from today into tomorrow.
            </Text>
          </View>
        );
    }
  }; 

  const handleAccordianToggle = () => {
    setIsExpanded(!isExpanded); // Toggle the state variable
  };

  const togglePrivacy = () => {
    setIsPrivate(!isPrivate);
    setDisableUpdate(false);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={editModalVisible}
      onRequestClose={() => setEditModalVisible(false)}
    >      
        <SafeAreaView style={[styles.container]}>
            {/* View for cancel and update buttons */}
            <View style={styles.topBar}>
                <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                    <View style={styles.buttonContent}>
                    <Ionicons name="chevron-back-outline" size={25} color="white" />
                    
                    </View>
                </TouchableOpacity>
                </View>

                <Text style={styles.centerText}>Edit</Text>

                <TouchableOpacity
                disabled={disableUpdate}
                style={styles.updateButton}
                onPress={updateCheckIn}
                testID="updateButton"
                >
                  {updating ? ( // Render activity indicator when updating
                    <ActivityIndicator color="white" />
                  ) : (
                    <Ionicons name="checkmark-outline" 
                      style={
                        disableUpdate ? styles.updateTextDisabled : styles.updateText
                      }
                    />
                  )}
                </TouchableOpacity>
            </View>
            <View style={styles.horizontalBar} />
            {/* end of cancel/update section */}

            {/* Main Container Section */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={[styles.container]}
            >
              <ScrollView style={styles.contentContainer}>
                <Text style={styles.header}>{getMomentText(selectedEntry?.moment_number)}</Text>
                <Text style={[styles.datetime, theme["color"]]}>
                  {formattedDateTime}{" "}
                </Text>

                  <View style={styles.Prefsetting}>
                    <Text style={styles.settingText}>Private</Text>
                    <Switch
                      trackColor={{ false: '#f2f2f2', true: '#4A90E2' }} // Update the background color
                      thumbColor={'#f2f2f2'} // Update the thumb color
                      onValueChange={togglePrivacy}
                      value={isPrivate}
                    />
                  </View>

                {/* Media Box Below */}
                {mediaBox ? (
                <View style={styles.mediaContainer}>
                    {mediaType === "image" ? (
                      console.log("Viewing new image"),
                      <ImageViewer
                          source={mediaUri}
                          onDelete={deleteMedia}
                          style={{ height: 60, width: 60 }}
                          onMediaChange={mediaChanged}
                      />
                    ) : mediaType === "video" ? (
                      console.log("Viewing new video"),
                      <VideoViewer
                        source={mediaUri}
                        onDelete={deleteMedia}
                        style={{ height: 60, width: 60 }}
                      />
                    ) : mediaType === "recording" ? (
                      console.log("Viewing new recording"),
                      <RecordingViewer
                        source={mediaUri}
                        onDelete={deleteMedia}
                        style={{ height: 60, width: 60 }}
                      />
                    ) : selectedEntry?.content_type === "image" ? (
                      console.log("Viewing passed in image"),
                      <ImageViewer
                        source={mediaUri}
                        style={[styles.CheckInEntryModalImage,]}
                        onDelete={deleteMedia}
                        onMediaChange={mediaChanged}
                      />
                    ) : selectedEntry?.content_type === "video" ? (
                      console.log("Viewing passed in video"),
                      <View style={styles.CheckInEntryModalImage}>
                        {video[selectedEntry.checkin_id] ? (
                          <VideoViewer
                            source={video[selectedEntry.checkin_id]}
                            onDelete={deleteMedia}
                            style={styles.CheckInEntryModalImage}
                          />
                        ) : (
                          <TouchableOpacity
                            onPress={() => {
                            handleGetVideo(selectedEntry.checkin_id);
                          }}
                          >
                            <Image
                              source={{ uri: `data:Image/mp4;base64,${selectedEntry?.content}` }}
                              style={styles.CheckInEntryModalImage}
                            />
                          </TouchableOpacity>
                        )}
                      </View>
                    ) : selectedEntry?.content_type === "recording" ? (
                      console.log("Viewing passed in recording"),
                      <RecordingViewer
                        source={mediaUri}
                        onDelete={deleteMedia}
                        style={{ height: 60, width: 60}}
                      />
                    ) : (
                      // Render default media component or null if no media type
                      null
                    )}
                    <ProgressBar onMediaChange={mediaChanged} />
                </View>
                ) : null}
                
                {/* Description */}
                <View style={styles.boxContainer}>
                    {/* <Text style={[styles.boxDescriptor]}>Description</Text> */}
                    <ScrollView style={[styles.dropdownContainer, { height: 350 }]}>
                        <TextInput
                        style={styles.checkInInput}
                        inputAccessoryViewID={mediaAccessoryViewID}
                        maxLength={10000}
                        onChangeText={handleTextComplete}
                        multiline
                        numberOfLines={4}
                        testID="checkInInput"
                        >
                            {selectedEntry.text_entry}
                        </TextInput>
                    </ScrollView>
                </View>

                {renderDescriptiveText()}

                <TouchableOpacity onPress={handleAccordianToggle}>
                  <View style={styles.headerContainer}>
                    <Text>Learn more about {getMomentTextShortHand(selectedEntry?.moment_number)}</Text>
                    <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={24} color="black" />
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <ScrollView style={styles.contentContainer}>
                    {/* Your existing content here */}
                    {renderTextBasedOnType()}
                  </ScrollView>
                )}

              </ScrollView>
            </KeyboardAvoidingView>

        {/* Keyboard bar view below */}
        {showMediaBar ? (
            <InputAccessoryView nativeID={mediaAccessoryViewID}>
            <MediaAccessoryBar
                mediaProp={handleMediaComplete}
                toggleRecording={handleToggle}
            />
            </InputAccessoryView>
        ) : (
            <InputAccessoryView nativeID={mediaAccessoryViewID}>
            <RecordingAccessoryBar
                onRecordingComplete={handleRecordingComplete}
                toggleRecording={handleToggle}
            />
            </InputAccessoryView>
        )}
        </SafeAreaView>
    </Modal>
    
  );
}

const ProgressBar = ({ onMediaChange }) => {
  const [progress, setProgress] = useState(() => new Animated.Value(0));
  const [parentWidth, setParentWidth] = useState(0);

  useEffect(() => {
    progress.setValue(0); // Reset progress to 0 without needing to re-create the Animated.Value
    // console.log("parentWidth: ", parentWidth);
    if (parentWidth > 0) {
      Animated.timing(progress, {
        toValue: parentWidth,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }
  }, [parentWidth, onMediaChange]);

  const progressBarWidth = progress.interpolate({
    inputRange: [0, parentWidth],
    outputRange: ["0%", "100%"],
  });

  return (
    <View
      style={[stylesProgressBar.container, theme["background"]]}
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        setParentWidth(width);
      }}
    >
      <Animated.View
        style={[stylesProgressBar.progressBar, { width: progressBarWidth }]}
      />
    </View>
  );
};

const stylesProgressBar = StyleSheet.create({
  container: {
    height: 5,
    backgroundColor: "white",
    width: "100%",
    borderRadius: 5,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#4A90E2",
    borderBottomEndRadius: 5,
    borderBottomStartRadius: 5,
  },
});


const styles = StyleSheet.create({
  container: {
    backgroundColor: "#4A90E2",
    flex: 1,
    // padding: 10,
    // backgroundColor: "white",
  },
  contentContainer: {
    backgroundColor: "white",
    paddingHorizontal: 15,
  },
  dropdownContainer: {
    borderColor: '#4A90E2',
    borderWidth: 2,
    borderRadius: 10,
    padding: 16,
    fontSize: 16,
    color: 'grey',
    // flexDirection: "row",
    // alignItems: "center",
    // backgroundColor: "green",
    // justifyContent: "space-around",
  },
  dropdownLabel: {
    marginRight: 10,
    fontSize: 15,
    paddingLeft: 14,
    // paddingTop: 10,
    textAlign: "left",
  },
  boxContainer: {
    paddingBottom: 20,
  },
  header: {
    marginTop: 15,
    fontSize: 28,
    fontWeight: 'bold',
  },
  datetime: {
    marginBottom: 15,
    fontSize: 16,
  },
  boxDescriptor: {
    fontSize: 16,
    fontWeight: 500,
    marginBottom: 10,

  },
  title: {
    borderColor: '#4A90E2',
    borderWidth: 2,
    borderRadius: 10,
    padding: 16,
    fontSize: 16,
    // fontWeight: "bold",
  },
  checkInInput: {
    fontSize: 16,
  },
  scrollingInput: {
    flexGrow: 1,
  },
  mediaContainer: {
    // backgroundColor: "pink",
    // alignItems: "center",
    // paddingHorizontal: 10,
    // paddingTop: 5,
    marginBottom: 10,
    // borderRadius: 5,
    // marginHorizontal: Dimensions.get("window").width / 2.55,
    width: 60,
    height: 60,
  },
  mediaContainerUpper: {
    // flexDirection: "row",
    // justifyContent: "space-between",
    // alignItems: "center",
    // backgroundColor: "red",
    // marginBottom: 5,
    // paddingHorizontal: 10,
  },
  image: {
    width: 50,
    height: 50,
    marginTop: 20,
    backgroundColor: "black",
    // flex: 1,
  },
  video: {
    alignSelf: "center",
    width: "100%",
    height: 60,
    borderTopRightRadius: 5,
    borderTopLeftRadius: 5,
  },
  deleteMedia: {
    justifyContent: "center",
    marginTop: 10,
    // flex: 1,
  },
  separator: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginVertical: 10,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  topBar: {
    flexDirection: "row",
    // marginTop: 5,
    marginRight: 15,
    justifyContent: "space-between",
    alignItems: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    fontSize: 19,
  },
  centerText: {
    paddingLeft: 15,
    fontSize: 19,
    color: "white",
    fontWeight: "500"
  },
  updateButton: {},
  updateText: {
    color: "white",
    fontSize: 25,
  },
  updateTextDisabled: {
    color: "#4A90E2",
    fontSize: 25,
  },
  horizontalBar: {
    height: 1,
    backgroundColor: "#ccc",
    marginTop: 15,
  },
  CheckInEntryModalImage: {
    width: "100%",
    aspectRatio: 1,
    // borderRadius: 5,
  },
  textContainer: {
    marginBottom: 15,
    marginHorizontal: 10,
  },

  // Check-in reminder text section
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: "center",
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    paddingBottom: 20,
  },
  Prefsetting: {
    flexDirection: 'row', // Arrange children in a row
    alignItems: 'center', // Align items vertically in the center
    justifyContent: 'space-between', // Optional: Add space between items
    padding: 10, // Optional: Add padding for better layout
    // borderWidth: 2,
    // borderColor: "#4A90E2",
    // borderRadius: 10,
  },
  settingText: {
    fontSize: 16, // Example font size, adjust as needed
    marginRight: 10, // Optional: Add margin to separate text from switch
  },
});
