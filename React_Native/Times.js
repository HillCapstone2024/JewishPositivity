import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Button,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from "axios";
import TopBar from "./topBar";
import IP_ADDRESS from "./ip.js";

const API_URL = "http://" + IP_ADDRESS + ":8000";

const Times = ({ navigation }) => {
  const [timeOne, setTimeOne] = useState(new Date(2024,2,28,8,0,0));
  const [timeTwo, setTimeTwo] = useState(new Date(2024,2,28,15,0,0));
  const [timeThree, setTimeThree] = useState(new Date(2024,2,28,21,0,0));
  const [showOne, setShowOne] = useState(false);
  const [showTwo, setShowTwo] = useState(false);
  const [showThree, setShowThree] = useState(false);
  const [mode, setMode] = useState("time");
  const [errorMessage, setErrorMessage] = useState(
    <View style = {styles.errorMessageBoxInvisible}>
      <Text style = {styles.errorMessageTextInvisible}>Null</Text>
    </View>
  );

  //Handles changes to time on Time Picker
  const onChange1 = (e, selectedDate) => {
      setTimeOne(selectedDate);
      setShowOne(false);
  };

  const onChange2 = (e, selectedDate) => {
    setTimeTwo(selectedDate);
    setShowTwo(false);
  };

  const onChange3 = (e, selectedDate) => {
    setTimeThree(selectedDate);
    setShowThree(false);
  };

  const showModeOne = (modeToShow) => {
    setShowOne(true);
    setMode(modeToShow);
  };

  const showModeTwo = (modeToShow) => {
    setShowTwo(true);
    setMode(modeToShow);
  };

  const showModeThree = (modeToShow) => {
    setShowThree(true);
    setMode(modeToShow);
  };

  //POST
const handleTimeChange = async () => {
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
      `${API_URL}/update_times/`,
      {
        username: username,
        password: password,
        time1: timeOne,
        time2: timeTwo,
        time3: timeThree,
      },
      {
        headers: {
          "X-CSRFToken": csrfToken,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    console.log("Time change response:", response.data);
    navigateHome();
  } catch (error) {
    console.log(error)
    setErrorMessage(
      <View style={styles.errorMessageBox}>
        <Text style={styles.errorMessageText}>{error.response.data}</Text>
      </View>
    );
    console.error("Time change error:", error.response.data);
  }
};


  return (
      <View style={styles.container}>
        {errorMessage}

        <View style={{ flexDirection: "column" }}>
        <Pressable onPress={() => showModeOne("time")}>
              <LinearGradient
                  // Button Linear Gradient
                  colors={["#69a5ff", "#10c3e3"]}
                  start={[0, 1]}
                  end={[1, 0]}
                  style={styles.button}
                >
                <Text style={styles.buttonText}>{timeOne.toLocaleTimeString()}</Text>
                </LinearGradient>
                {showOne && (
                <DateTimePicker
                value = {timeOne}
                mode = {mode}
                is24Hour = {false}
                onChange={onChange1}
                minuteInterval = {5}
                display = "spinner"
                /> 
                )}
            </Pressable>
            <Pressable onPress={() => showModeTwo("time")}>
              <LinearGradient
                  // Button Linear Gradient
                  colors={["#69a5ff", "#10c3e3"]}
                  start={[0, 1]}
                  end={[1, 0]}
                  style={styles.button}
                >
                <Text style={styles.buttonText}>{timeTwo.toLocaleTimeString()}</Text>
                </LinearGradient>
                {showTwo && (
                <DateTimePicker
                value = {timeTwo}
                mode = {mode}
                is24Hour = {false}
                onChange={onChange2}
                minuteInterval = {5}
                display = "spinner"
                /> 
                )}
            </Pressable>

            <Pressable onPress={() => showModeThree("time")}>
              <LinearGradient
                  // Button Linear Gradient
                  colors={["#69a5ff", "#10c3e3"]}
                  start={[0, 1]}
                  end={[1, 0]}
                  style={styles.button}
                >
                <Text style={styles.buttonText}>{timeThree.toLocaleTimeString()}</Text>
                </LinearGradient>
                {showThree && (
                <DateTimePicker
                value = {timeThree}
                mode = {mode}
                is24Hour = {false}
                onChange={onChange3}
                minuteInterval = {5}
                display = "spinner"
                /> 
                )}
            </Pressable>
            </View>

            <View style={{ flexDirection: "row" }}>

            <Pressable>
                <LinearGradient
                  // Button Linear Gradient
                  colors={["#69a5ff", "#10c3e3"]}
                  start={[0, 1]}
                  end={[1, 0]}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>Submit Changes</Text>
                </LinearGradient>
              </Pressable>

              <Pressable>
                <LinearGradient
                  // Button Linear Gradient
                  colors={["#69a5ff", "#10c3e3"]}
                  start={[0, 1]}
                  end={[1, 0]}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>Cancel Changes</Text>
                </LinearGradient>
              </Pressable>
            </View>
      </View>
    // </View>
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
    backgroundColor: '#6c94b4',
    paddingVertical: 10,
    paddingHorizontal: 20,
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

export default Times;
