import React, { useState } from "react";
import {
  View,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  Button,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  Keyboard,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";

const Login = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(
    <View style={styles.errorMessageBoxInvisible}>
      <Text style={styles.errorMessageTextInvisible}>Null</Text>
    </View>
  );

  const navigate = () => {
    navigation.navigate("Signup");
  };
  const handleLogin = async () => {
    if (username == "" && password == "") {
      setErrorMessage(
        <View style={styles.errorMessageBox}>
          <Text style={styles.errorMessageText}>
            Enter a Username and Password
          </Text>
        </View>
      );
      return;
    } else if (username == "") {
      setErrorMessage(
        <View style={styles.errorMessageBox}>
          <Text style={styles.errorMessageText}>Enter a Username</Text>
        </View>
      );
      return;
    } else if (password == "") {
      setErrorMessage(
        <View style={styles.errorMessageBox}>
          <Text style={styles.errorMessageText}>Enter a Password</Text>
        </View>
      );
      return;
    }
    try {
      console.log("made it to try");
      const response = await axios.post("/login", {
        username: username,
        password: password,
      });
      console.log("make request");
      console.log("Login response:", response.data);
      setErrorMessage(
        <View style={styles.errorMessageBox}>
          <Text style={styles.errorMessageText}>Login Successful!</Text>
        </View>
      );
      //In the event of a successful login, here we would navigate to another page.
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage(
        <View style={styles.errorMessageBox}>
          <Text style={styles.errorMessageText}>
            Invalid Username or Password
          </Text>
        </View>
      );
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
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        onChangeText={(text) => setPassword(text)}
        value={password}
        secureTextEntry
      />
      <View>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity onPress={handleLogin}>
            <LinearGradient
              // Button Linear Gradient
              colors={["#69a5ff", "#10c3e3"]}
              start={[0, 1]}
              end={[1, 0]}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Login</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={navigate}>
            <LinearGradient
              // Button Linear Gradient
              colors={["#69a5ff", "#10c3e3"]}
              start={[0, 1]}
              end={[1, 0]}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Sign Up</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
      </View>
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
    width: '80%',
    height: 40,
    borderStyle: 'solid',
    borderBottomColor: '#e8bd25',
    borderBottomWidth: 2,
    borderRadius: 10,
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
