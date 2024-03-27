import React, { useEffect, useState } from "react";
import {
  View,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import axios from "axios";
import logos from "../../assets/SVGs.js";
import SvgXml from "react-native-svg";
import IP_ADDRESS from "../../ip.js";
import * as Storage from "../../AsyncStorage.js";
import makeThemeStyle from '../../Theme.js';

const API_URL = "http://" + IP_ADDRESS + ":8000";

const Login = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const theme = makeThemeStyle();

  const saveUsername = async () => {
    await Storage.setItem("@username", username);
    console.log("successfully saved username")
  };

  const navigateSignUp = () => {
    navigation.navigate("Signup");
  };

  const navigateForgotPassword = () => {
    navigation.navigate("ForgotPassword");
  };

  const navigateDrawer = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "Drawer" }]
    });
    navigation.navigate("Drawer");
  };

  const navigateTemp = () => {
    navigation.navigate("Main");
  };

  const handleLogin = async () => {
    setErrorMessage(
      <ActivityIndicator />
    );
    const getCsrfToken = async () => {
      try {
        const response = await axios.get(`${API_URL}/csrf-token/`);
        return response.data.csrfToken;
      } catch (error) {
        console.error("Error retrieving CSRF token:", error);
        setErrorMessage(
          <View style={styles.errorMessageBox}>
            <Text style={styles.errorMessageText}>
              CSRF token retrieval failed
            </Text>
          </View>
        );
        throw new Error("CSRF token retrieval failed");
      }
    };

    try {
      const csrfToken = await getCsrfToken();
      console.log('hgfhfg');
      const response = await axios.post(`${API_URL}/login/`,
        {
          username: username,
          password: password,
        },
        {
          headers: {
            "X-CSRFToken": csrfToken,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      console.log("Login response:", response.data);
      saveUsername();
      navigateDrawer();
    } catch (error) {
      console.log(error);
      setErrorMessage(
        <View style={styles.errorMessageBox}>
          <Text style={styles.errorMessageText}>{error.response.data}</Text>
        </View>
      );
      console.error("Login error:", error.response.data);
    }
  };


  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, theme["background"]]}
      >
        {/* <SvgXml xml={logos['notebookPen.svg']} style={styles.logo} /> */}
        {/* <SvgXml xml={logos['appTileFinal.svg']} style={styles.logo} /> */}
        {/* <SvgXml xml={logos['notebook.svg']} style={styles.logo} /> */}
        {/* <SvgXml xml={logos['pen.svg']} style={styles.logo} /> */}
        <Image source={require("../../assets/images/notebookPen.png")} style={styles.logo} />
        {errorMessage}
        <TextInput
          style={[styles.input, theme["color"]]}
          placeholderTextColor={theme["color"].color}
          placeholder="Username"
          onChangeText={(text) => setUsername(text)}
          value={username}
          testID="usernameInput"
        />
        <TextInput
          style={[styles.input, theme["color"]]}
          placeholderTextColor={theme["color"].color}
          placeholder="Password"
          onChangeText={(text) => setPassword(text)}
          value={password}
          testID="passwordInput"
          secureTextEntry
        />
        <View>
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity style={styles.button} onPress={handleLogin} testID="loginButton">
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={navigateSignUp}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.forgot}>
            <TouchableOpacity onPress={navigateForgotPassword}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* <TouchableOpacity style={styles.button} onPress={navigateDrawer}>
                <Text style={styles.buttonText}>Temp Drawer</Text> 
          </TouchableOpacity> */}

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
    width: 200,
    height: 200,
    marginBottom: 20,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "white",
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
    backgroundColor: "#4A90E2",
    paddingVertical: 10,
    paddingHorizontal: 50,
    marginTop: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.16,
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
    paddingVertical: 10,
    paddingHorizontal: 50,
    marginTop: 5,
    marginBottom: 10,
    marginHorizontal: 5,
    width: "80%",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.06,
  },
  errorMessageTextInvisible: {
    color: "white",
  },
  forgot: {
    marginTop: 50,
    alignContent: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  forgotText: {
    color: "#4A90E2",
  },
});

export default Login;
