import React, { useState } from "react";
import {
  View,
  Image,
  Text,
  TextInput,
  Pressable,
  Button,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  Keyboard,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import IP_ADDRESS from "./ip.js";

const API_URL = "http://" + IP_ADDRESS + ":8000";
console.log(API_URL);

const Login = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(
    <View style={styles.errorMessageBoxInvisible}>
      <Text testID="errorMessage" style={styles.errorMessageTextInvisible}>Null</Text>
    </View>
  );

  const navigateSignOn = () => {
    navigation.navigate("Signup");
  };
   const navigateDrawer = () => {
     navigation.navigate("Drawer");
   };
  const navigateTemp = () => {
    navigation.navigate("Main");
  };
  const handleLogin = async () => {
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
      navigateTemp();
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
    <View style={styles.container}>
      {/* <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}> */}
      <Image source={require("./assets/logo.png")} style={styles.logo} />
      {errorMessage}
      <TextInput
        style={styles.input}
        placeholder="Username"
        onChangeText={(text) => setUsername(text)}
        value={username}
        testID="usernameInput"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        onChangeText={(text) => setPassword(text)}
        value={password}
        testID="passwordInput"
        secureTextEntry
      />
      <View>
        <View style={{ flexDirection: "row" }}>
          <Pressable onPress={handleLogin} testID="loginButton">
            <LinearGradient
              // Button Linear Gradient
              colors={["#69a5ff", "#10c3e3"]}
              start={[0, 1]}
              end={[1, 0]}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Login</Text>
            </LinearGradient>
          </Pressable>
          <Pressable onPress={navigateSignOn}>
            <LinearGradient
              // Button Linear Gradient
              colors={["#69a5ff", "#10c3e3"]}
              start={[0, 1]}
              end={[1, 0]}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Sign Up</Text>
            </LinearGradient>
          </Pressable>
        </View>
        <View style={{ flexDirection: "row" }}>
          <Pressable onPress={navigateTemp}>
            <LinearGradient
              // Button Linear Gradient
              colors={["#69a5ff", "#10c3e3"]}
              start={[0, 1]}
              end={[1, 0]}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Temp to Home</Text>
            </LinearGradient>
          </Pressable>
          <Pressable onPress={navigateDrawer}>
            <LinearGradient
              // Button Linear Gradient
              colors={["#69a5ff", "#10c3e3"]}
              start={[0, 1]}
              end={[1, 0]}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Temp to Drawer</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>

      {/* This view is temporary until we get our homepage working it only links to the Time change page */}
      {/* <LinearGradient
          // Button Linear Gradient
          colors={["#0023ff", "#000fcf"]}
          start={[0, 1]}
          end={[1, 0]}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Sign in with Facebook</Text>
        </LinearGradient>
        <LinearGradient
          // Button Linear Gradient
          colors={["#ff9e00", "#e64141"]}
          start={[0, 1]}
          end={[1, 0]}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Sign in with Google</Text>
        </LinearGradient> */}
      {/* </TouchableWithoutFeedback>
      </KeyboardAvoidingView > */}
    </View>
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
    backgroundColor: "#6c94b4",
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

export default Login;
