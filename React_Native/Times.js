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

const TimeChange = ({ navigation }) => {
  const [timeOne, setTimeOne] = useState("");
  const [timeTwo, setTimeTwo] = useState("");
  const [timeThree, setTimeThree] = useState("");


  const navigate = () => {
    navigation.navigate("Login");
  };

  // const handleTimeChange = async () => {
  //   try {
  //     const response = await axios.post("/signup", {
  //       timeOne,
  //       timeTwo,
  //       timeThree,
  //     });
  //     console.log("Signup response:", response.data);
  //     //In the event of a successful signup, here we would navigate to another page.
  //   } catch (error) {
  //     console.error("Signup error:", error);
  //     //Here we would determine what the error is and then act accordingly.
  //     //Most likely display wrong credentials message to the user.
  //   }
  // };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Times</Text>
      <TextInput
        style={styles.input}
        placeholder="First Time"
        onChangeText={(text) => setTimeOne(text)}
        value={timeOne}
      />

      <View>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity >
            <LinearGradient
              // Button Linear Gradient
              colors={["#69a5ff", "#10c3e3"]}
              start={[0, 1]}
              end={[1, 0]}
              style={styles.button}
            >
              <Text style={styles.buttonText} >
                Edit
              </Text>
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
              <Text style={styles.buttonText}>
                Return Log in
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          {/* This Return to log in will eventually be changed to a submit button */}
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

export default TimeChange;
