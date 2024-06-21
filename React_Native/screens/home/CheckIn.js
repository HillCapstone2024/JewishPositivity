import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Keyboard,
  Button,
  Dimensions,
  KeyboardAvoidingView,
  TextInput,
  Text,
  InputAccessoryView,
  ScrollView,
  Image,
  SafeAreaView,
  Platform,
  Animated,
  ActivityIndicator,
  Alert,
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
import * as Haptics from "expo-haptics";

// import { Video, ResizeMode, Audio } from "expo-av";
import makeThemeStyle from "../../tools/Theme.js";
import * as Storage from "../../AsyncStorage.js";
import IP_ADDRESS from "../../ip.js";
const API_URL = "http://" + IP_ADDRESS + ":8000";

export default function CheckIn({ navigation, route }) {
  const [username, setUsername] = useState("");
  const [momentType, setMomentType] = useState(1);
  const [mediaUri, setMediaUri] = useState(null);
  const [mediaBox, setMediaBox] = useState(false);
  const [mediaType, setMediaType] = useState("text");
  const [base64Data, setBase64Data] = useState("");
  const [CheckInText, setCheckInText] = useState("");
  const [showMediaBar, setShowMediaBar] = useState(true);
  const [mediaChanged, setMediaChanged] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [disableSubmit, setDisableSubmit] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHapticFeedbackEnabled, setIsHapticFeedbackEnabled] = useState(false);
  const [timezone, setTimezone] = useState("");
  
  const { checkInType } = route.params;
  const mediaAccessoryViewID = "MediaBar";
  const theme = makeThemeStyle();

  const now = new Date();
  const options = {
    timeZone: "America/Chicago",
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

  console.log("TimeZone is:", timezone);
    
  
  // useEffect(() => {
  //   const getStoredTimezone = async () => {
  //     try {
  //       const storedTimezone = await AsyncStorage.getItem("@timezone");
  //       return storedTimezone;
  //     } catch (error) {
  //       console.error("Error retrieving timezone from storage:", error);
  //       return null;
  //     }
  //   };

  //   const fetchAndFormatDateTime = async () => {
  //     try {
  //       const timezone = await getStoredTimezone();
  //       if (!timezone) {
  //         throw new Error("Timezone not found in AsyncStorage");
  //       }

  //       const options = {
  //         timeZone: timezone,
  //         weekday: "long",
  //         year: "numeric",
  //         month: "long",
  //         day: "numeric",
  //         hour: "2-digit",
  //         minute: "2-digit",
  //       };

  //       const now = new Date();
  //       const newFormattedDateTime = new Intl.DateTimeFormat("en-US", options).format(now);
  //       setFormattedDateTime(newFormattedDateTime);
  //     } catch (error) {
  //       console.error("Error formatting date:", error);
  //       // Handle error appropriately in your application
  //     }
  //   };

  //   fetchAndFormatDateTime();
  // })};

function parseAndFormatDate(dateStr) {
  //reg expression to match normal and military phone settings
  const regex =
    /^(\w+),\s+(\w+)\s+(\d+),\s+(\d+)\s+at\s+(\d+):(\d+)(?:\s*(AM|PM)?)$/;
  const match = dateStr.match(regex);

  if (!match) {
    return "Invalid date format";
  }
  const [, , month, day, year, hour, minute, period] = match;
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthNumber = monthNames.indexOf(month) + 1;

  let hourNumber = parseInt(hour, 10);
  if (period === "PM" && hourNumber !== 12) {
    hourNumber += 12;
  } else if (period === "AM" && hourNumber === 12) {
    hourNumber = 0;
  }
  const pad = (num) => (num < 10 ? "0" + num : num);
  const formattedDate = `${year}-${pad(monthNumber)}-${pad(day)} ${pad(
    hourNumber
  )}:${pad(minute)}:00`;

  return formattedDate;
}

  useEffect(() => {
    console.log("CheckIn Recieved:",checkInType)
    handleOptionChange(checkInType)
  }, [checkInType])

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
    // configureAudioMode();

    const loadTimezone = async () => {
      const storedTimezone = await Storage.getItem("@timezone");
      console.log("StoredTimeZone:",storedTimezone);
      if (storedTimezone) {
        setTimezone(storedTimezone);
      } else {
        setTimezone("timezone not found");
      }
    };
    loadTimezone();

  }, []);

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

  const getTimezone = async () => {

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

  const getHapticFeedback = async () => {
    try {
      const hapticFeedbackEnabled = await Storage.getItem('@hapticFeedbackEnabled');
      if (hapticFeedbackEnabled === 'true') {
        setIsHapticFeedbackEnabled(true);
      } else {
        setIsHapticFeedbackEnabled(false);
      }
    } catch (e) {
      console.log(e);
    }
  };
  getHapticFeedback();

  const submitCheckIn = async () => {
    console.log('formatted date: ',formattedDateTime);
    console.log("new date:", parseAndFormatDate(formattedDateTime));
    const parsedDate = parseAndFormatDate(formattedDateTime);
    setLoadingSubmit(true);
    let base64CheckInText = "";
    if (mediaType === "text") {
      base64CheckInText = textToBase64(CheckInText);
      setBase64Data(base64CheckInText);
    }
    console.log("check in type: ", mediaType);
    try {
      // const csrfToken = await getCsrfToken();
      const csrfToken = await Storage.getItem("@CSRF");
      const response = await axios.post(
        `${API_URL}/check-in/`,
        {
          username: username,
          moment_number: momentType,
          content: base64Data,
          content_type: mediaType,
          text_entry: CheckInText,
          date: parsedDate,
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
      //on successful submit close the page
      navigation.goBack();
    } catch (error) {
      console.log(error);
      console.log("CheckIn Error:", error.response.data);
      if (error.response.data === "Error: Duplicate Moment Today") {
        Alert.alert(
          "Duplicate Check-in Type Recieved",
          "You have already submitted a check-in of this type for today. Please select a different check-in type or try again tomorrow.",
          [{ text: "OK", onPress: () => console.log("Alert Closed") }]
        );
      }
    }
    setLoadingSubmit(false);
  };

  const deleteMedia = () => {
    setMediaUri(null);
    setMediaBox(false);
    setMediaType("text");
    setDisableSubmit(CheckInText.trim().length === 0);
  };

  const handleRecordingComplete = async (uri) => {
    console.log("Received saved from recording bar:", uri);
    setShowMediaBar(true);
    setMediaUri(uri);
    setMediaType("recording");
    // setDisableSubmit(true);
    const base64String = await readFileAsBase64(uri);
    setBase64Data(base64String);
    // setCheckInText("");
    setMediaBox(true);
    setMediaChanged(!mediaChanged);
    setDisableSubmit(false);
  };

  const handleMediaComplete = async (mediaProp) => {
    console.log("received data from mediabar", mediaProp);
    setMediaUri(mediaProp.assets[0].uri);
    setMediaType(mediaProp.assets[0].type);
    //sometimes mediaUri state doesn't update before next line
    //pass mediaProp.assets[0].uri directly to fix this
    setDisableSubmit(true);
    const base64String = await readFileAsBase64(mediaProp.assets[0].uri);
    setBase64Data(base64String);
    setMediaBox(true);
    setMediaChanged(!mediaChanged);
    setDisableSubmit(false);
  };

  const handleTextComplete = (text) => {
    setCheckInText(text);
    // console.log(text);
    if (mediaUri === null) {
      setDisableSubmit(text.trim().length === 0);
    }
  };

  const handleToggle = (toggle) => {
    console.log("CheckIn side:", toggle);
    setShowMediaBar(!toggle);
  };

  const handleOptionChange = (itemValue) => {
    setSelectedOption(itemValue);
    if (itemValue === "Modeh Ani") {
      setMomentType(1);
    } else if (itemValue === "Ashrei") {
      setMomentType(2);
    } else if (itemValue === "Shema") {
      setMomentType(3);
    }
  };

  const getMomentText = (momentNumber) => {
    switch (momentNumber) {
      case "ModehAni":
        return "Modeh Ani - Gratitude";
      case "Ashrei":
        return "Ashrei - Happiness";
      case "Shema":
        return "Shema - Reflection";
      default:
        return "Unknown Check-in Type";
    }
  };

  renderTextBasedOnType = () => {
    switch (checkInType) {
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
    switch (checkInType) {
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

  const modehAniPrompts = [
    "What are you grateful for today?",
    "Think of someone who has helped you recently. How can you express gratitude to them?",
    "Reflect on a challenge you overcame and what you learned from it.",
    "What is one thing that brought you joy today?",
    "What is a simple pleasure you experienced today?",
    "Think of a skill or talent you have and how you can use it to help others."
  ];
  
  const ashreiPrompts = [
    "What made you smile today?",
    "Recall a happy memory from your childhood.",
    "Think of a person who inspires you and why.",
    "What is something you're looking forward to?",
    "Reflect on a recent accomplishment that made you feel proud.",
    "What is a hobby or activity that brings you happiness?"
  ];
  
  const shemaPrompts = [
    "What was the most meaningful part of your day?",
    "Reflect on a lesson you learned today.",
    "Think of a way you showed kindness to someone today.",
    "What is something you're grateful for in your life right now?",
    "Recall a moment when you felt at peace today.",
    "What is a goal or aspiration you want to work towards?"
  ];

  const PromptDropdown = ({ checkInType }) => {
    const [selectedPrompt, setSelectedPrompt] = useState("");
    const [isOpen, setIsOpen] = useState(false);
  
    let prompts = [];
    switch (checkInType) {
      case "ModehAni":
        prompts = modehAniPrompts;
        break;
      case "Ashrei":
        prompts = ashreiPrompts;
        break;
      case "Shema":
        prompts = shemaPrompts;
        break;
      default:
        break;
    }

    const toggleDropdown = () => {
      setIsOpen(!isOpen);
    };
  
    const selectPrompt = (prompt) => {
      setSelectedPrompt(prompt);
      setIsOpen(false);
    };

    return (
      <View style={styles.promptDropdownContainer}>
        <TouchableOpacity style={styles.promptDropdownHeader} onPress={toggleDropdown}>
          <Text style={styles.promptDropdownLabel}>
            {selectedPrompt || "Select a prompt"}
          </Text>
          <Ionicons
            name={isOpen ? "chevron-up" : "chevron-down"}
            size={24}
            color="#4A90E2"
          />
        </TouchableOpacity>
        {isOpen && (
          <ScrollView style={styles.promptDropdownList}>
            {prompts.map((prompt, index) => (
              <TouchableOpacity
                key={index}
                style={styles.promptDropdownItem}
                onPress={() => selectPrompt(prompt)}
              >
                <Text style={styles.promptDropdownItemText}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    );
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

  return (
    <SafeAreaView style={[styles.container]}>   
      {/* <View style={styles.horizontalBar} /> */}

      {/* Main Container Section */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.container]}
      >
        <ScrollView style={styles.contentContainer}>
          <Text style={styles.header}>{getMomentText(checkInType)}</Text>
          <Text style={[styles.datetime, theme["color"]]}>
            {formattedDateTime}{" "}
          </Text>

          <TouchableOpacity onPress={handleAccordianToggle}>
            <View style={styles.headerContainer}>
              <Text>Learn more about {checkInType}</Text>
              <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={24} color="black" />
            </View>
          </TouchableOpacity>

          {isExpanded && (
            <ScrollView style={styles.contentContainer}>
              {/* Your existing content here */}
              {renderTextBasedOnType()}
            </ScrollView>
          )}

          {/* Media Box Below */}
          {mediaBox ? (
            <View style={styles.mediaContainer}>
              {mediaType === "image" ? (
                <ImageViewer
                  source={mediaUri}
                  onDelete={deleteMedia}
                  style={{
                    height: 60,
                    width: 60,
                    borderTopLeftRadius: 5,
                    borderTopRightRadius: 5,
                  }}
                />
              ) : mediaType === "video" ? (
                <VideoViewer
                  source={mediaUri}
                  onDelete={deleteMedia}
                  style={{ height: 60, width: 60 }}
                />
              ) : (
                <RecordingViewer
                  source={mediaUri}
                  onDelete={deleteMedia}
                  style={{ height: 60, width: 60 }}
                />
              )}
              <ProgressBar onMediaChange={mediaChanged} />
            </View>
          ) : null}

          <View style={styles.boxContainer}>
            {/* <Text style={[styles.boxDescriptor]}>Description</Text> */}
            <ScrollView style={[styles.dropdownContainer, { height: 350 }]}>
              <PromptDropdown checkInType={checkInType} />
              <TextInput
                style={styles.CheckInInput}
                inputAccessoryViewID={mediaAccessoryViewID}
                placeholder={"Enter reflection here…"}
                placeholderTextColor={"grey"}
                maxLength={10000}
                value={CheckInText}
                onChangeText={handleTextComplete}
                multiline
                numberOfLines={4}
                testID="CheckInInput"
              />
            </ScrollView>
          </View>

          {renderDescriptiveText()}
        </ScrollView>

        {/* View for cancel and submit buttons */}
        <View style={styles.topBar}>
          {loadingSubmit ? (
            <View style={styles.ActivityIndicator}>
              <Text style={{padding: 10}}>Saving Check-in, this may take a moment!</Text>
              <ActivityIndicator />
            </View>
          ) : (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                disabled={disableSubmit}
                style={styles.submitButton}
                onPress={ () => { submitCheckIn(); isHapticFeedbackEnabled ? Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium) : null; }}
                testID="submitButton"
              >
                <Text
                  style={
                    disableSubmit ? styles.submitTextDisabled : styles.submitText
                  }
                >
                  Submit
                </Text>
              </TouchableOpacity>
            </View>
        

          )}
        </View>
        {/* end of cancel/submit section */}
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
  );
}

const ProgressBar = ({ onMediaChange }) => {
  const [progress, setProgress] = useState(() => new Animated.Value(0));
  const [parentWidth, setParentWidth] = useState(0);

  useEffect(() => {
    progress.setValue(0); // Reset progress to 0 without needing to re-create the Animated.Value
    console.log("create ceckin parentwidth:",parentWidth);
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
    flex: 1,
    // padding: 10,
    backgroundColor: "white",
  },
  contentContainer: {
    marginHorizontal: 15,
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
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  header: {
    marginTop: 15,
    fontSize: 28,
    fontWeight: 'bold',
  },
  textContainer: {
    marginBottom: 15,
    marginHorizontal: 10,
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
  CheckInInput: {
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
  topBar: {
    flexDirection: "row",
    marginTop: 5,
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
  cancelText: {
    fontSize: 19,
    color: "#4A90E2",
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    // backgroundColor: "#4A90E2",
    height: 60,
    width: 150,
    padding: 10,
    marginVertical: 5,
    alignItems: "center",
    borderRadius: 5,
    // borderWidth: 2,
    // borderColor: "black",
    flexDirection: "row",
    justifyContent: "center",

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
  ActivityIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitText: {
    color: "#4A90E2",
    fontSize: 19,
  },
  submitTextDisabled: {
    color: "white",
    fontSize: 19,
  },
  horizontalBar: {
    height: 2,
    backgroundColor: "#ccc",
    // marginTop: 15,
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
  },
  promptDropdownContainer: {
    borderWidth: 2,
    borderColor: "#4A90E2",
    borderRadius: 10,
    // marginBottom: 10,
    padding: 15,
    fontSize: 8,
    // overflow: 'hidden',
    color: 'grey',
  },
  promptDropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 12,
    // borderColor: 'gray',
    borderBottomWidth: 0,
  },
  promptDropdownLabel: {
    fontSize: 15,
    // color: "#333",
    marginRight: 5,
    paddingLeft: 5,
    textAlign: "left",
  },
  promptDropdownList: {
    borderTopWidth: 1,
    borderBlockColor: "#ccc",
    maxHeight: 200,
    position: 'relative',
  },
  promptDropdownItem: {
    paddingHorizontal: 10,
    paddingVertical: 12,
    height: 50,
  },
  promptDropdownItemText: {
    fontSize: 16,
    color: "#333",
  },
  promptDropdownArrow: {
    position: 'absolute',
    right: 10,
    top: '50%',
  },
});
