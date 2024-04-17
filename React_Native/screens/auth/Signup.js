import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator
} from "react-native";
import axios from "axios";
import IP_ADDRESS from "../../ip.js";
import * as Storage from "../../AsyncStorage.js";
import makeThemeStyle from '../../tools/Theme.js';

const API_URL = "http://" + IP_ADDRESS + ":8000";

import { LogLevel, OneSignal } from "react-native-onesignal";
import Constants from "expo-constants";

OneSignal.Debug.setLogLevel(LogLevel.Verbose);
OneSignal.initialize(Constants.expoConfig.extra.oneSignalAppId);

const Signup = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [reentered_password, setReentered_password] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const theme = makeThemeStyle();

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;


  const saveUsername = async () => {
    await Storage.setItem("@username", username);
    await Storage.setItem("@first_name", firstname);
    await Storage.setItem("@last_name", lastname);
    await Storage.setItem("@email", email);
    await Storage.setItem("@password", password);
    //await Storage.setItem("@profilePicture", profilePicture);
    console.log("Saved user information");
  };


  const navigateLogin = () => {
    navigation.navigate("Login");
  };

  const navigateDrawer = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "Drawer" }]
    });
    navigation.navigate("Drawer");
  };

  const handleSignup = async () => {
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
      const avatar = createAvatar(micah, {
        seed: username,
        radius: 50,
        mouth: ["smile", "smirk", "laughing"],
      }).toString();
      const csrfToken = await getCsrfToken();
      const response = await axios.post(
        `${API_URL}/create_user/`,
        {
          username: username,
          password: password,
          reentered_password: reentered_password,
          firstname: firstname,
          lastname: lastname,
          email: email,
          timezone: timezone
        },
        {
          headers: {
            "X-CSRFToken": csrfToken,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      console.log("Signup response:", response.data);
      saveUsername();
      OneSignal.login(username);
      console.log("OneSignal login successful");
      console.log(username);
      navigateDrawer();
    } catch (error) {
      console.log(error)
      setErrorMessage(
        <View style={styles.errorMessageBox}>
          <Text style={styles.errorMessageText}>{error.response.data}</Text>
        </View>
      );
      console.error("Signup error:", error.response.data);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, theme["background"]]}
      >
        <Image source={require("../../assets/images/notebookPen.png")} style={styles.logo} />
        {errorMessage}
        <TextInput
          style={[styles.input, theme["color"]]}
          placeholder="Email"
          placeholderTextColor={theme["color"].color}
          onChangeText={(text) => setEmail(text)}
          value={email}
          testID="emailInput"
        />
        <TextInput
          style={[styles.input, theme["color"]]}
          placeholder="Username"
          placeholderTextColor={theme["color"].color}
          onChangeText={(text) => setUsername(text)}
          value={username}
          testID="usernameInput"
        />
        <TextInput
          style={[styles.input, theme["color"]]}
          placeholder="First Name"
          placeholderTextColor={theme["color"].color}
          onChangeText={(text) => setFirstname(text)}
          value={firstname}
          testID="firstNameInput"
        />
        <TextInput
          style={[styles.input, theme["color"]]}
          placeholder="Last Name"
          placeholderTextColor={theme["color"].color}
          onChangeText={(text) => setLastname(text)}
          value={lastname}
          testID="lastNameInput"
        />
        <TextInput
          style={[styles.input, theme["color"]]}
          placeholder="Password"
          placeholderTextColor={theme["color"].color}
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry
          testID="passwordInput"
        />
        <TextInput
          style={[styles.input, theme["color"]]}
          placeholder="Verify Password"
          placeholderTextColor={theme["color"].color}
          onChangeText={(text) => setReentered_password(text)}
          value={reentered_password}
          secureTextEntry
          testID="passwordTwoInput"
        />
        <View>
          <View style={{ flexDirection: "column" }}>
            <TouchableOpacity style={styles.button} onPress={handleSignup}>
              <Text testID="signupButton" style={styles.buttonText}>
                Sign Up
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={navigateLogin}>
              <Text style={styles.buttonText}>Already a Member?</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  logo: {
    width: 180,
    height: 180,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "black",
  },
  input: {
    width: "80%",
    height: 40,
    borderStyle: "solid",
    borderBottomColor: "#e8bd25",
    borderBottomWidth: 2,
    // borderRadius: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
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
  errorMessageBoxInvisible: {
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 50,
    marginTop: 5,
    marginBottom: 10,
    marginHorizontal: 5,
    width: "80%",
    shadowColor: "white",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.06,
  },
  errorMessageTextInvisible: {
    color: "white",
  },
});

export default Signup;
