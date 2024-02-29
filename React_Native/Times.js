import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Button,
  Appearance
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import axios from "axios";
import TopBar from "./topBar";
import IP_ADDRESS from "./ip.js";
import * as Storage from "./AsyncStorage.js";

const API_URL = "http://" + IP_ADDRESS + ":8000";

const Times = ({ navigation }) => {
  //Creates time variables with defaults built in
  const [timeOne, setTimeOne] = useState(new Date(2024,2,28,8,0,0));
  const [timeTwo, setTimeTwo] = useState(new Date(2024,2,28,15,0,0));
  const [timeThree, setTimeThree] = useState(new Date(2024,2,28,21,0,0));
  const [username, setUsername] = useState("");
  const [errorMessage, setErrorMessage] = useState(
    <View style = {styles.errorMessageBoxInvisible}>
      <Text style = {styles.errorMessageTextInvisible}>Null</Text>
    </View>
  );

  useEffect(() => {
    const loadUsername = async () => {
      const storedUsername = await Storage.getItem("@username");
      setUsername(storedUsername || "");
    };

    loadUsername();
  }, []);

  const navigateHome = () => {
    navigation.navigate("Drawer");
  };

  const [isDatePickerVisible1, setDatePickerVisibility1] = useState(false);
  const [isDatePickerVisible2, setDatePickerVisibility2] = useState(false);
  const [isDatePickerVisible3, setDatePickerVisibility3] = useState(false);

  //Changes theme of spinner depending on OS' theme (resolves iOS issue)
  const colorScheme = Appearance.getColorScheme();
  const handleTheme = () => {
    let handleTheme=false;
    if (colorScheme=='light'){
      handleTheme=true;
    } else {
      handleTheme-false;
    } };
 
  //Used to show or hide picker for each button  
  const showDatePicker1 = () => {
    setDatePickerVisibility1(true);
  };
  const hideDatePicker1 = () => {
    setDatePickerVisibility1(false);
  };

  const showDatePicker2 = () => {
    setDatePickerVisibility2(true);
  };
  const hideDatePicker2 = () => {
    setDatePickerVisibility2(false);
  };

  const showDatePicker3 = () => {
    setDatePickerVisibility3(true);
  };
  const hideDatePicker3 = () => {
    setDatePickerVisibility3(false);
  };

  //Updates time variable and hides time picker once time is confirmed
  const handleConfirmOne = (date) => {
    setTimeOne(date);
    hideDatePicker1(); }
  const handleConfirmTwo = (date) => {
   setTimeTwo(date);
   hideDatePicker2(); }
  const handleConfirmThree = (date) => {
    setTimeThree(date);
    hideDatePicker3(); }

  //POST
const handleTimeChange = async () => {
  //console.log("time1: " + timeOne.toTimeString().split(' ')[0] + " time2: " + timeTwo.toTimeString().split(' ')[0] + " time3: " + timeThree.toTimeString().split(' ')[0])
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
      `${API_URL}/update-times/`,
      {
        username: username,
        time1: timeOne.toTimeString().split(' ')[0],
        time2: timeTwo.toTimeString().split(' ')[0],
        time3: timeThree.toTimeString().split(' ')[0],
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
    console.log("username is: ", username);
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
        <Pressable onPress={showDatePicker1}>
              <LinearGradient
                  // Button Linear Gradient
                  colors={["#69a5ff", "#10c3e3"]}
                  start={[0, 1]}
                  end={[1, 0]}
                  style={styles.button}
                >
                <Text style={styles.buttonText}>{timeOne.toLocaleTimeString()}</Text>
                </LinearGradient>
                
                <DateTimePickerModal
                isVisible={isDatePickerVisible1}
                mode="time"
                value = {timeOne}
                onConfirm={handleConfirmOne}
                onCancel={hideDatePicker1}
                display="spinner"
                isDarkModeEnabled={handleTheme}
                minuteInterval={5}
                is24Hour={false}
              />
                
            </Pressable>
            <Pressable onPress={showDatePicker2}>
              <LinearGradient
                  // Button Linear Gradient
                  colors={["#69a5ff", "#10c3e3"]}
                  start={[0, 1]}
                  end={[1, 0]}
                  style={styles.button}
                >
                <Text style={styles.buttonText}>{timeTwo.toLocaleTimeString()}</Text>
                </LinearGradient>
                <DateTimePickerModal
                isVisible={isDatePickerVisible2}
                mode="time"
                value = {timeTwo}
                onConfirm={handleConfirmTwo}
                onCancel={hideDatePicker2}
                display="spinner"
                isDarkModeEnabled={handleTheme}
                minuteInterval={5}
                is24Hour={false}
              />
            </Pressable>

            <Pressable onPress={showDatePicker3}>
              <LinearGradient
                  // Button Linear Gradient
                  colors={["#69a5ff", "#10c3e3"]}
                  start={[0, 1]}
                  end={[1, 0]}
                  style={styles.button}
                >
                <Text style={styles.buttonText}>{timeThree.toLocaleTimeString()}</Text>
                </LinearGradient>
                <DateTimePickerModal
                isVisible={isDatePickerVisible3}
                mode="time"
                value = {timeThree}
                onConfirm={handleConfirmThree}
                onCancel={hideDatePicker3}
                display="spinner"
                isDarkModeEnabled={handleTheme}
                minuteInterval={5}
                is24Hour={false}
              />
            </Pressable>
            </View>

            <View style={{ flexDirection: "row" }}>

            <Pressable onPress={handleTimeChange}>
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

              <Pressable onPress={navigateHome}>
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
