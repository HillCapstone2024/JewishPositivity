import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Image,
  ImageViewer,
  Modal,
  Pressable,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  SafeAreaView,
  Animated,
  Dimensions,
} from "react-native";
import * as Storage from "../../AsyncStorage.js";
import axios from "axios";
import { SvgXml } from "react-native-svg";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";
import IP_ADDRESS from "../../ip.js";
import * as FileSystem from "expo-file-system";
import { Icon } from "react-native-elements";

const API_URL = "http://" + IP_ADDRESS + ":8000";

const EditProfile = ({ navigation, onSwitch }) => {
  const [userInfo, setUserInfo] = useState({
    fname: "",
    lname: "",
    username: "",
    password: "",
    email: "",
    originalUsername: "",
    //dateJoined: "January 1, 2021",
    //journalEntries: 120,
    profilePicture: "",
  });
  const layout = Dimensions.get("window");
  const translateX = useRef(new Animated.Value(layout.width)).current;

  const [errorMessage, setErrorMessage] = useState(null);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const navigateProfileView = () => {
    if (onSwitch) {
      onSwitch();
    }
  };

  const saveUserInfo = async () => {
    await Storage.setItem("@username", userInfo.username);
    await Storage.setItem("@email", userInfo.email);
    await Storage.setItem("@first_name", userInfo.fname);
    await Storage.setItem("@last_name", userInfo.lname);
    await Storage.setItem("@profilePicture", userInfo.profilePicture);
    await Storage.setItem("@password", userInfo.password);
    console.log("successfully saved user info: ", userInfo.username);
  };

  const getUser = async () => {
    const storedUsername = await Storage.getItem("@username");
    const storedEmail = await Storage.getItem("@email");
    const storedFirstName = await Storage.getItem("@first_name");
    const storedLastName = await Storage.getItem("@last_name");
    const storedProfilePicture = await Storage.getItem("@profilePicture");
    const storedPassword = await Storage.getItem("@password");

    setUserInfo((prevState) => ({
      ...prevState,
      username: storedUsername || "",
      originalUsername: storedUsername || "", //dont update this value after retrieval
      password: storedPassword || "",
      fname: storedFirstName || "",
      lname: storedLastName || "",
      profilePicture: storedProfilePicture || "",
      email: storedEmail || "",
    }));
    console.log("successfully retrieved user");
  };

  const [updateProfilePicture, setUpdateProfilePicture] = useState(false);

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

  const [newPassword, setNewPassword] = useState("");

  const handleChangePassword = () => {
    // Implement password change logic here
    console.log("Password changed to:", newPassword);
    // Reset password field
    setNewPassword("");
  };

  const handleEditProfilePicture = () => {
    Alert.alert("Media Type", "", [
      { text: "Camera Roll", onPress: () => pickMedia() },
      { text: "Take Photo", onPress: () => takeMedia() },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleUpdateUser = async () => {
    setLoadingSubmit(true);
    setErrorMessage(<ActivityIndicator />);
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
      const requestData = {
        username: userInfo.originalUsername,
        newusername: userInfo.username,
        firstname: userInfo.fname,
        lastname: userInfo.lname,
        email: userInfo.email,
      };
      // Conditionally include profile picture if it exists
      if (updateProfilePicture) {
        requestData.profilepicture = userInfo.profilePicture
          ? userInfo.profilePicture
          : undefined;
      }
      const response = await axios.post(
        `${API_URL}/update_user_information/`,
        requestData,
        {
          headers: {
            "X-CSRFToken": csrfToken,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      console.log("update profile response:", response.data);
      setLoadingSubmit(false);
      saveUserInfo();
      navigateProfileView();
    } catch (error) {
      console.log(error);
      setErrorMessage(
        <View style={styles.errorMessageBox}>
          <Text style={styles.errorMessageText}>{error.response.data}</Text>
        </View>
      );
      console.error("Update Profile error:", error.response.data);
    }
  };

  const pickMedia = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setUpdateProfilePicture(true);
      const base64String = await readFileAsBase64(result.assets[0].uri);
      setUserInfo((prevUserInfo) => ({
        ...prevUserInfo,
        profilePicture: base64String,
      }));
      await Storage.setItem("@profilePicture", base64String);
    }
  };

  const takeMedia = async () => {
    // Request camera and microphone permissions if not already granted
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (!cameraPermission.granted) {
      alert("Permissions to access camera and microphone are required!");
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // This will still default to capturing images
      allowsEditing: true, // Only applies to images
      aspect: [4, 3],
      quality: 1,
    });

    if (result && !result.cancelled) {
      setUpdateProfilePicture(true);
      const base64String = await readFileAsBase64(result.assets[0].uri);
      setUserInfo((prevUserInfo) => ({
        ...prevUserInfo,
        profilePicture: base64String,
      }));
      await Storage.setItem("@profilePicture", base64String);
    }
  };

  useEffect(() => {
    getUser();
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    // <SafeAreaView style={{ flex: 1 }}>
    //   <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    //     <KeyboardAvoidingView
    //       behavior={Platform.OS === "ios" ? "padding" : "height"}
    //       keyboardVerticalOffset={100}
    //       style={[styles.container, theme["background"]]}>
    //       <ScrollView
    //         horizontal={false}
    //         contentContainerStyle={styles.scrollViewContent}>
    //         <View style={styles.container}>
    //           <View style={styles.topBar}>
    //             <View style={{ flexDirection: "row", width: "80%" }}>
    //               <TouchableOpacity
    //                 onPress={navigateProfileView}>
    //                 <View style={styles.buttonContent}>
    //                   <Ionicons name="caret-back" size={25} color="#4A90E2" />
    //                   <Text style={styles.cancelText}>Cancel</Text>
    //                 </View>
    //               </TouchableOpacity>
    //             </View>

    //             {loadingSubmit ? (
    //               <View style={styles.ActivityIndicator}>
    //                 <ActivityIndicator />
    //               </View>
    //             ) : (
    //               <TouchableOpacity
    //                 style={styles.submitButton}
    //                 onPress={handleUpdateUser}
    //               >
    //                 <Text
    //                   style={styles.submitText}
    //                 >
    //                   Submit
    //                 </Text>
    //               </TouchableOpacity>
    //             )}
    //           </View>
    //           <TouchableOpacity onPress={handleEditProfilePicture} >
    //             <View style={styles.profilePicContainer}>
    //               <Image //source={{ uri: userInfo.profilePicture }} />
    //                 style={styles.profilePic}
    //                 source={{ uri: `data:image/jpeg;base64,${userInfo?.profilePicture}`, }} />
    //               <View style={styles.cameraIcon}>
    //                 <Ionicons name="camera" size={24} color="black" />
    //               </View>
    //             </View>
    //           </TouchableOpacity>
    //           {<Text style={styles.attribute} >First Name:</Text>}
    //           <TextInput
    //             style={styles.info}
    //             placeholder="First Name"
    //             onChangeText={(text) => setUserInfo(prevUserInfo => ({
    //               ...prevUserInfo,
    //               fname: (text),
    //             }))}

    //           >{userInfo.fname}</TextInput>
    //           {<Text style={styles.attribute} >Last Name:</Text>}
    //           <TextInput
    //             style={styles.info}
    //             placeholder="Last Name"
    //             onChangeText={(text) => setUserInfo(prevUserInfo => ({
    //               ...prevUserInfo,
    //               lname: (text),
    //             }))}

    //           >{userInfo.lname}</TextInput>
    //           {<Text style={styles.attribute} >Username:</Text>}
    //           <TextInput
    //             style={styles.info}
    //             placeholder="Username"
    //             onChangeText={(text) => setUserInfo(prevUserInfo => ({
    //               ...prevUserInfo,
    //               username: (text),
    //             }))}

    //           >{userInfo.username}</TextInput>
    //           {<Text style={styles.attribute} >Email:</Text>}
    //           <TextInput
    //             style={styles.info}
    //             placeholder="Email"
    //             onChangeText={(text) => setUserInfo(prevUserInfo => ({
    //               ...prevUserInfo,
    //               email: (text),
    //             }))}

    //           >{userInfo.email}</TextInput>
    //         </View>
    //       </ScrollView>
    //     </KeyboardAvoidingView>
    //   </TouchableWithoutFeedback>
    // </SafeAreaView>
    // <View style={styles.overallContainer}>
    <Animated.View
      style={{ ...styles.overallContainer, transform: [{ translateX }] }}
    >
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={navigateProfileView}
        >
          <View style={styles.buttonContent}>
            <Ionicons name="caret-back" size={25} color="white" />
            <Text style={styles.submitText}>Cancel</Text>
          </View>
        </TouchableOpacity>
        {loadingSubmit ? (
          <View style={styles.ActivityIndicator}>
            <ActivityIndicator />
          </View>
        ) : (
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleUpdateUser}
          >
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.profilePicContainer}>
        <TouchableOpacity onPress={handleEditProfilePicture}>
          <Image
            style={styles.profilePic}
            source={{
              uri: `data:image/jpeg;base64,${userInfo?.profilePicture}`,
            }}
          />
          <View style={styles.cameraIcon}>
            <Ionicons name="camera" size={28} color="white" />
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.userInfoContainer}>
        <Text style={styles.info} testID="nameInput">
          {userInfo.fname} {userInfo.lname}
        </Text>
        <View style={styles.userInfoContainerLower}>
          <View style={styles.textInput}>
            <Ionicons name="create" size={25} color="#4A90E2" />
            <TextInput
              style={styles.info}
              testID="usernameInput"
              placeholder="First Name"
              onChangeText={(text) =>
                setUserInfo((prevUserInfo) => ({
                  ...prevUserInfo,
                  fname: text,
                }))
              }
            >
              @{userInfo.username}
            </TextInput>
          </View>
          <Text style={styles.info}>Email: {userInfo.email}</Text>
          <Text style={styles.info}>Since: example date</Text>
          {/* <Badges /> */}
        </View>
      </View>
    </Animated.View>
  );
};

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     //justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//   },
//   profilePic: {
//     width: 150,
//     height: 150,
//     borderRadius: 75,
//     marginBottom: 20,
//     borderWidth: 2,
//     borderColor: "#4A90E2",
//   },
//   title: {
//     fontSize: 20,
//     //fontWeight: "bold",
//   },
//   cameraIcon: {
//     position: "absolute",
//     bottom: 10,
//     right: 5,
//     backgroundColor: "rgba(255, 255, 255, 0.7)",
//     padding: 4,
//   },
//   scrollViewContent: {
//     flexGrow: 1,
//     marginHorizontal: 1,
//   },
//   button: {
//     backgroundColor: '#4A90E2',
//     paddingVertical: 10,
//     paddingHorizontal: 50,
//     marginTop: 10,
//     marginHorizontal: 5,
//     borderRadius: 5,
//     shadowColor: "black",
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 6,
//     shadowOpacity: 0.16,
//     alignItems: "center",
//   },
//   buttonText: {
//     color: "white",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   info: {
//     fontSize: 16,
//     //marginBottom: 10,
//     //shadowColor: 'rbga(3, 138, 255, 1)',
//     borderColor: '#4A90E2',
//     borderWidth: 2,
//     borderRadius: 15,
//     padding: 16,
//     fontSize: 16,
//     width: '80%',
//     // backgroundColor: '#f9f9f9',
//     // padding: 20,
//     margin: 10,
//     // shadowOpacity: 0.1,
//     // shadowRadius: 10,
//     // elevation: 5,
//     //borderColor: 'rbg(3, 138, 255)',
//   },
//   centeredView: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 22,
//   },
//   modalView: {
//     margin: 20,
//     backgroundColor: 'white',
//     borderRadius: 20,
//     padding: 35,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//     elevation: 5,
//   },
//   attribute: {
//     fontSize: 16,
//     width: '80%',
//   },
//   content: {
//     flex: 1,
//     backgroundColor: "#4A90E2",
//   },
//   topBar: {
//     flexDirection: "row",
//     marginTop: 5,
//     marginRight: 15,
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   buttonContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   buttonContent: {
//     flexDirection: "row",
//     alignItems: "center",
//     fontSize: 19,
//   },
//   cancelText: {
//     fontSize: 19,
//     color: "#4A90E2",
//   },
//   submitButton: {},
//   ActivityIndicator: {
//     marginRight: 20
//   },
//   submitText: {
//     color: "#4A90E2",
//     fontSize: 19,
//   },
//   errorMessageBox: {
//     textAlign: "center",
//     borderRadius: 6,
//     backgroundColor: "#ffc3c3",
//     paddingVertical: 10,
//     paddingHorizontal: 50,
//     marginTop: 5,
//     marginBottom: 10,
//     marginHorizontal: 5,
//     shadowColor: "black",
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 6,
//     shadowOpacity: 0.06,
//     width: "80%",
//   },
//   errorMessageText: {
//     textAlign: "center",
//     color: "#ff0000",
//   },
//   horizontalBar: {
//     height: 1,
//     backgroundColor: "#ccc",
//     marginTop: 15,
//   },
// });

const styles = StyleSheet.create({
  overallContainer: {
    flex: 1,
    //justifyContent: "center",
    alignItems: "center",
    paddingTop: 20,
    backgroundColor: "#4A90E2",
    // position: "absolute",
  },
  userInfoContainer: {
    marginTop: -80,
    paddingTop: 90,
    paddingHorizontal: 20,
    backgroundColor: "#ececf6",
    width: "100%",
    // height: "100%",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    alignItems: "center",
    zIndex: -2,
  },
  userInfoContainerLower: {
    marginTop: 20,
    // backgroundColor: "white",
    width: "100%",
    height: "100%",
  },
  profilePic: {
    width: 150,
    height: 150,
    borderRadius: 75,
    // marginBottom: 20,
    zIndex: 3,
    zIndex: -1,
    elevation: 1,
    // borderWidth: 2,
    // borderColor: "#4A90E2",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 10,
    right: -12,
    backgroundColor: "#4A90E2",
    borderRadius: 25,
    padding: 8,
  },
  info: {
    fontSize: 18,
  },

  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    backgroundColor: "#4A90E2",
  },
  topBar: {
    // alignItems: "",
    justifyContent: "space-between",
    width: "100%",
    flexDirection: "row",
    // backgroundColor: "red",
    paddingHorizontal: 20,
  },
  submitButton: {
    // marginRight: 20,
    justifyContent: "flex-end",
  },
  ActivityIndicator: {
    marginRight: 20,
  },
  submitText: {
    color: "white",
    fontSize: 19,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    fontSize: 19,
  },
  textInput: {
    flexDirection: "row",
  },
});

export default EditProfile;
