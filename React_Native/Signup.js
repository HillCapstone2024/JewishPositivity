import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import IP_ADDRESS from "./ip.js";

const API_URL = "http://" + IP_ADDRESS + ":8000";

const Signup = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [reentered_password, setReentered_password] = useState("");
  const [errorMessage, setErrorMessage] = useState(
    <View style={styles.errorMessageBoxInvisible}>
      <Text style={styles.errorMessageTextInvisible}>Null</Text>
    </View>
  );

  const navigateLogin = () => {
    navigation.navigate("Login");
  };

  const navigateTimes = () => {
    navigation.navigate("Times");
  };

  const handleSignup = async () => {
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
        `${API_URL}/create_user/`,
        {
          username: username,
          password: password,
          reentered_password: reentered_password,
          firstname: firstname,
          lastname: lastname,
          email: email,
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
      navigateTimes();
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
    <View style={styles.container}>
      <Text style={styles.title}>Signup</Text>
      {errorMessage}
      <TextInput
        style={styles.input}
        placeholder="Email"
        onChangeText={(text) => setEmail(text)}
        value={email}
      />
      <TextInput
        style={styles.input}
        placeholder="Username"
        onChangeText={(text) => setUsername(text)}
        value={username}
      />
      <TextInput
        style={styles.input}
        placeholder="First Name"
        onChangeText={(text) => setFirstname(text)}
        value={firstname}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        onChangeText={(text) => setLastname(text)}
        value={lastname}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        onChangeText={(text) => setPassword(text)}
        value={password}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Verify Password"
        onChangeText={(text) => setReentered_password(text)}
        value={reentered_password}
        secureTextEntry
      />
      {/* <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={navigate}>
        <Text style={styles.buttonText}>Already Have an Account?</Text>
      </TouchableOpacity> */}
      <View>
        <View style={{ flexDirection: "column" }}>
          <TouchableOpacity onPress={handleSignup}>
            <LinearGradient
              // Button Linear Gradient
              colors={["#69a5ff", "#10c3e3"]}
              start={[0, 1]}
              end={[1, 0]}
              style={styles.button}
            >
              <Text testID="signupButton" style={styles.buttonText}>
                Sign Up
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={navigateLogin}>
            <LinearGradient
              // Button Linear Gradient
              colors={["#69a5ff", "#10c3e3"]}
              start={[0, 1]}
              end={[1, 0]}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Already a Member?</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
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
    //backgroundColor: '#6c94b4',
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
