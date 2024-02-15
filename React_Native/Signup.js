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

const Signup = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");

  const navigate = () => {
    navigation.navigate("Login");
  };

  const handleSignup = async () => {
      try {
        const response = await axios.post("/signup", {
          username,
          password,
          firstname,
          lastname,
          email
        });
        console.log("Signup response:", response.data);
        //In the event of a successful signup, here we would navigate to another page.
      } catch (error) {
        console.error("Signup error:", error);
        //Here we would determine what the error is and then act accordingly.
        //Most likely display wrong credentials message to the user.
      }
    };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Signup</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        onChangeText={(text) => setEmail(text)}
        value={email}
        secureTextEntry
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
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        onChangeText={(text) => setLastname(text)}
        value={lastname}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        onChangeText={(text) => setPassword(text)}
        value={password}
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
          <LinearGradient
            // Button Linear Gradient
            colors={["#69a5ff", "#10c3e3"]}
            start={[0, 1]}
            end={[1, 0]}
            style={styles.button}
          >
            <Text style={styles.buttonText} onPress={handleSignup}>
              Sign Up
            </Text>
          </LinearGradient>
          <LinearGradient
            // Button Linear Gradient
            colors={["#69a5ff", "#10c3e3"]}
            start={[0, 1]}
            end={[1, 0]}
            style={styles.button}
          >
            <Text style={styles.buttonText} onPress={navigate}>
              Already a Member?
            </Text>
          </LinearGradient>
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
    color: 'black',
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
    //backgroundColor: '#6c94b4',
    paddingVertical: 10,
    paddingHorizontal: 50,
    marginTop: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    shadowColor: 'black',
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
});

export default Signup;
