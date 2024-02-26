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

const Times = ({ navigation }) => {
  const [timeOne, setTimeOne] = useState(new Date());
  const [timeTwo, setTimeTwo] = useState(new Date());
  const [timeThree, setTimeThree] = useState(new Date());
  const [showOne, setShowOne] = useState(false);
  const [showTwo, setShowTwo] = useState(false);
  const [showThree, setShowThree] = useState(false);
  const [mode, setMode] = useState("time");
  const [errorMessage, setErrorMessage] = useState(
    <View style = {styles.errorMessageBoxInvisible}>
      <Text style = {styles.errorMessageTextInvisible}>Null</Text>
    </View>
  );
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
    // <View>
    //   <TopBar navigation={navigation} />
      <View style={styles.container}>
        {errorMessage}

        <View style={{ flexDirection: "column" }}>
          <View style = {styles.buttonEnabled}>
          <Button title="Time 1" onPress={() => showModeOne("time")} />
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
            </View>
              
              <Pressable>
                <LinearGradient
                  // Button Linear Gradient
                  colors={["#69a5ff", "#10c3e3"]}
                  start={[0, 1]}
                  end={[1, 0]}
                  style={styles.button}
                  
                >
                  <Text style={styles.buttonText}>Temp to time</Text>
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
