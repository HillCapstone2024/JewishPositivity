import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, Button, Image,ImageViewer, Modal, Pressable } from "react-native";
import * as Storage from "../../AsyncStorage.js";
import { createAvatar } from "@dicebear/core";
import axios from "axios";
import { micah } from "@dicebear/collection";
import { SvgXml } from "react-native-svg";
import * as ImagePicker from "expo-image-picker"; 
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";
import IP_ADDRESS from "../../ip.js";
import { Alert } from "react-native";
import { KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform } from "react-native";
import { ActivityIndicator } from "react-native";
import { xml } from "@dicebear/core/lib/utils/license.js";
import * as FileSystem from "expo-file-system";

const API_URL = "http://" + IP_ADDRESS + ":8000";

const EditProfile = ({navigation, onSwitch}) => {
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

  const [errorMessage, setErrorMessage] = useState(null);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);


  const navigateProfileView = () => {
    if (onSwitch) {
      onSwitch();
    }
  }

  const saveUsername = async () => {
    await Storage.setItem("@username", userInfo.username);
    console.log("successfully saved username: ", userInfo.username);
  };

  const avatar = createAvatar(micah, {
    seed: userInfo.originalUsername,
    radius: 50,
    mouth: ["smile", "smirk", "laughing"],
  }).toString();

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
      const response = await axios.post(
        `${API_URL}/update_user_information/`,
        {
          username: userInfo.originalUsername,
          newusername: userInfo.username,
          //password: ,
          //reentered_password: reentered_password,
          firstname: userInfo.fname,
          lastname: userInfo.lname,
          email: userInfo.email,
          profilepicture: userInfo.profilePicture ? userInfo.profilePicture : undefined,
        },
        {
          headers: {
            "X-CSRFToken": csrfToken,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      console.log("update profile response:", response.data);
      navigateProfileView();
      saveUsername();
      
    } catch (error) {
      console.log(error)
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
    mediaTypes: ImagePicker.MediaTypeOptions.All, // Allows both videos and images
    allowsEditing: true, // Only applies to images
    aspect: [4, 3],
    quality: 1,
    });

    if (!result.cancelled) {
      const base64String = await readFileAsBase64(result.assets[0].uri);    
      setUserInfo(prevUserInfo => ({
        ...prevUserInfo,
        profilePicture: base64String,
      }));
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
    mediaTypes: ImagePicker.MediaTypeOptions.All, // This will still default to capturing images
    allowsEditing: true, // Only applies to images
    aspect: [4, 3],
    quality: 1,
    });

    if (result && !result.cancelled) {
      const base64String = await readFileAsBase64(result.assets[0].uri);    
        setUserInfo(prevUserInfo => ({
          ...prevUserInfo,
          profilePicture: base64String,
        }));
    }
};

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const storedUsername = await Storage.getItem("@username");
        setUserInfo(prevState => ({
          ...prevState,
          username: storedUsername || "",
          originalUsername: storedUsername || "", //dont update this value after retrieval 
        }));
        const csrfToken = await getCsrfToken();

        const response = await axios.get(`${API_URL}/get_user_info/`, {
          params: {
            username: storedUsername,
          },
          headers: {
            "X-CSRFToken": csrfToken,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });
  
        //console.log("Response fname:", response.data);
        setUserInfo(prevUserInfo => ({
          ...prevUserInfo,
          fname: response.data.first_name, 
          lname: response.data.last_name,
          email:  response.data.email,
          password: response.data.password,
          profilePicture: response.data.profilepicture,
        }));
      } catch (error) {
        handleUserInfoError(error);
      }
    };
  
    const handleUserInfoError = (error) => {
      console.log(error);
      setErrorMessage(
        <View style={styles.errorMessageBox}>
          <Text style={styles.errorMessageText}>{error.response.data}</Text>
        </View>
      );
      console.error("Error Loading User:", error.response.data);
    };
  
    const getCsrfToken = async () => {
      try {
        const response = await axios.get(`${API_URL}/csrf-token/`);
        return response.data.csrfToken;
      } catch (error) {
        handleCsrfTokenError(error);
      }
    };
  
    const handleCsrfTokenError = (error) => {
      console.error("Error retrieving CSRF token:", error);
      setErrorMessage(
        <View style={styles.errorMessageBox}>
          <Text style={styles.errorMessageText}>
            CSRF token retrieval failed
          </Text>
        </View>
      );
      throw new Error("CSRF token retrieval failed");
    };
  
    loadUserInfo();
  
  }, []);
  

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, theme["background"]]}
    >
   <View style={styles.topBar}>
        <View style={{ flexDirection: "row", width:"80%" }}>
          <TouchableOpacity onPress={navigateProfileView}>
            <View style={styles.buttonContent}>
              <Ionicons name="caret-back" size={25} color="#4A90E2" />
              <Text style={styles.cancelText}>Cancel</Text>
            </View>
          </TouchableOpacity>
        </View>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleUpdateUser}
          >
          <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>
        
  </View> 
      <TouchableOpacity onPress={handleEditProfilePicture} >
        <View style={styles.profilePicContainer}>
        {userInfo.profilePicture && userInfo.profilePicture.trim() != "" ? (
          <Image //source={{ uri: userInfo.profilePicture }} />
            style={styles.profilePic}
            source={{uri: `data:image/jpeg;base64,${userInfo?.profilePicture}`,}}/>
        ) : (
          <SvgXml xml={avatar} style={styles.profilePic} /> 
        )}
        <View style={styles.cameraIcon}>
         <Ionicons name="camera" size={24} color="black" />
        </View>
      </View>

        </TouchableOpacity>
        {<Text style={styles.attribute} >First Name:</Text>}
        <TextInput
          style={styles.info}
          placeholder="First Name"
          onChangeText = {(text) =>   setUserInfo(prevUserInfo => ({
                                      ...prevUserInfo,
                                      fname: (text), 
                                    }))}

        >{userInfo.fname}</TextInput>
        {<Text style={styles.attribute} >Last Name:</Text>}
        <TextInput
          style={styles.info}
          placeholder="Last Name"
          onChangeText = {(text) =>   setUserInfo(prevUserInfo => ({
                                      ...prevUserInfo,
                                      lname: (text), 
                                    }))}

        >{userInfo.lname}</TextInput>
        {<Text style={styles.attribute} >Username:</Text>}
        <TextInput
          style={styles.info}
          placeholder="Username"
          onChangeText = {(text) =>   setUserInfo(prevUserInfo => ({
                                      ...prevUserInfo,
                                      username: (text), 
                                    }))}

        >{userInfo.username}</TextInput>
        {<Text style={styles.attribute} >Email:</Text>}
        <TextInput
          style={styles.info}
          placeholder="Email"
          onChangeText = {(text) =>   setUserInfo(prevUserInfo => ({
                                      ...prevUserInfo,
                                      email: (text), 
                                    }))}

        >{userInfo.email}</TextInput>
        {/*Password Modal - (move to another file)*/}
        <Modal
        animationType="slide"
        transparent={true}
        visible={passwordModalVisible}
        onRequestClose={() => {
          setPasswordModalVisible(!passwordModalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.title}>Edit Password</Text>
            <View style={{ flexDirection: "column", width:"80%" }}>
            <TextInput
              style={styles.info}
              placeholder="Current Password"
            ></TextInput>
             <TextInput
              style={styles.info}
              placeholder="New Password"
            ></TextInput>
             <TextInput
              style={styles.info}
              placeholder="Confirm New Password"
              onChangeText = {(text) =>   setUserInfo(prevUserInfo => ({
                                          ...prevUserInfo,
                                          password: (text), 
                                        }))}
            ></TextInput>
            </View>
            
            <View style={{ flexDirection: "row", width:"80%" }}>
              <TouchableOpacity 
                  style={styles.button} 
                  onPress={() => setPasswordModalVisible(!passwordModalVisible)}>
                  <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                  style={styles.button} 
                  onPress={() => setPasswordModalVisible(!passwordModalVisible)}>
                  {/*trigger password change here! */}
                  <Text style={styles.buttonText}>Update</Text>
              </TouchableOpacity>
            </View>
            
          </View>
        </View>
      </Modal>
      {/* <Pressable
        style={[styles.button, styles.buttonOpen]}
        onPress={() => setPasswordModalVisible(true)}>
        <Text style={styles.buttonText}>Change Password</Text>
      </Pressable> */}
    </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  profilePic: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#4A90E2", 
  },
  title: {
    fontSize: 20,
    //fontWeight: "bold",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 10, 
    right: 5, 
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: 4,
  },
  button: {
    backgroundColor: '#4A90E2',
    paddingVertical: 10,
    paddingHorizontal: 50,
    marginTop: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.16,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  info: {
    fontSize: 16,
    //marginBottom: 10,
    //shadowColor: 'rbga(3, 138, 255, 1)',
    borderColor: '#4A90E2',
    borderWidth: 2,
    borderRadius: 15,
    padding: 16,
    fontSize: 16,
    width: '80%',
    // backgroundColor: '#f9f9f9',
    // padding: 20,
    margin: 10,
    // shadowOpacity: 0.1,
    // shadowRadius: 10,
    // elevation: 5,
    //borderColor: 'rbg(3, 138, 255)', 
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  attribute: {
    fontSize: 16,
    width: '80%',
  },
  content: {
    flex: 1,
    backgroundColor: "#4A90E2", 
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
  submitButton: {},
  ActivityIndicator: {
    marginRight: 20
  },
  submitText: {
    color: "#4A90E2",
    fontSize: 19,
  },
  errorMessageBox: {
    textAlign: "center",
    borderRadius: 6,
    backgroundColor: "#ffc3c3",
    paddingVertical: 10,
    paddingHorizontal: 50,
    marginTop: 5,
    marginBottom: 10,
    marginHorizontal: 5,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.06,
    width: "80%",
  },
  errorMessageText: {
    textAlign: "center",
    color: "#ff0000",
  },
  horizontalBar: {
    height: 1,
    backgroundColor: "#ccc",
    marginTop: 15,
  },
});

export default EditProfile;
