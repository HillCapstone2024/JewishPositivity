import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from "axios";

const Times = ({ navigation }) => {
  const [timeOne, setTimeOne] = useState(new Date());
  const [timeTwo, setTimeTwo] = useState(new Date());
  const [timeThree, setTimeThree] = useState(new Date());
  const [showOne, setShowOne] = useState(false);
  const [showTwo, setShowTwo] = useState(false);
  const [showThree, setShowThree] = useState(false);
  const [mode, setMode] = useState("time");
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
    <View style={styles.container}>
      <Text style={styles.title}>Times</Text>
      <TextInput
        style={styles.input}
        placeholder="First Time"
        onChangeText={(text) => setTimeOne(text)}
      />
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

export default Times;
