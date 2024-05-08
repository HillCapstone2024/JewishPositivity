import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import axios from "axios";
import IP_ADDRESS from "../../ip.js";
import * as Storage from "../../AsyncStorage.js";

const API_URL = "http://" + IP_ADDRESS + ":8000";

const Times = ({ navigation }) => {
  //Creates time variables with defaults built in
  const [timeOne, setTimeOne] = useState(new Date(2024, 2, 28, 8, 0, 0));
  const [timeTwo, setTimeTwo] = useState(new Date(2024, 2, 28, 15, 0, 0));
  const [timeThree, setTimeThree] = useState(new Date(2024, 2, 28, 21, 0, 0));
  const [username, setUsername] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const loadUsername = async () => {
      const storedUsername = await Storage.getItem("@username");
      setUsername(storedUsername || "");
    };

    loadUsername();
  }, []);

  useEffect(() => {
    getIntialTimes();
  }, [username]);

  const navigateHome = () => {
    navigation.navigate("Home");
  };

  const [isDatePickerVisible1, setDatePickerVisibility1] = useState(false);
  const [isDatePickerVisible2, setDatePickerVisibility2] = useState(false);
  const [isDatePickerVisible3, setDatePickerVisibility3] = useState(false);


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

  function parseTimeToCurrentDate(timeString) {
    const [hours, minutes, seconds] = timeString.split(":");
    const currentDate = new Date();

    currentDate.setHours(parseInt(hours, 10));
    currentDate.setMinutes(parseInt(minutes, 10));
    currentDate.setSeconds(parseInt(seconds, 10));

    return currentDate;
  }

  //Updates time variable and hides time picker once time is confirmed
  const handleConfirmOne = (time) => {
    // time = parseTimeToCurrentDate(time);
    setTimeOne(time);
    hideDatePicker1();
    handleTimeChange(time, timeTwo, timeThree);
  }

  const handleConfirmTwo = (time) => {
    setTimeTwo(time);
    hideDatePicker2();
    handleTimeChange(timeOne, time, timeThree);
  }
  const handleConfirmThree = (time) => {
    setTimeThree(time);
    hideDatePicker3();
    handleTimeChange(timeOne, timeTwo, time);
  }

  // const getCsrfToken = async () => {
  //   try {
  //     const response = await axios.get(`${API_URL}/csrf-token/`);
  //     return response.data.csrfToken;
  //   } catch (error) {
  //     console.error("Error retrieving CSRF token:", error);
  //     throw new Error("CSRF token retrieval failed");
  //   }
  // };

  //GET
  const getIntialTimes = async () => {
    console.log('username: ', username);
    try {
      // const csrfToken = await getCsrfToken();
      const csrfToken = await Storage.getItem("@CSRF");
      const response = await axios.get(`${API_URL}/get_times/`, {
        params: {
          username: username,
        },
        headers: {
          "X-CSRFToken": csrfToken,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      console.log('successful response:', response.data);
      const timeOneDate = parseTimeToCurrentDate(response.data.time1);
      setTimeOne(timeOneDate);
      const timeTwoDate = parseTimeToCurrentDate(response.data.time2);
      setTimeTwo(timeTwoDate);
      const timeThreeDate = parseTimeToCurrentDate(response.data.time3);
      setTimeThree(timeThreeDate);
    } catch (error) {
      console.log('error getting the times from database: ', error);
    }
  };

  //POST
  async function handleTimeChange(timeOneParam, timeTwoParam, timeThreeParam) {
    //console.log("time1: " + timeOne.toTimeString().split(' ')[0] + " time2: " + timeTwo.toTimeString().split(' ')[0] + " time3: " + timeThree.toTimeString().split(' ')[0])

    try {
      // const csrfToken = await getCsrfToken();
      const csrfToken = await Storage.getItem("@CSRF");
      const response = await axios.post(
        `${API_URL}/update-times/`,
        {
          username: username,
          time1: timeOneParam.toTimeString().split(" ")[0],
          time2: timeTwoParam.toTimeString().split(" ")[0],
          time3: timeThreeParam.toTimeString().split(" ")[0],
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
      setErrorMessage(null);
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

      <View style={styles.container}>
        <View style={styles.rowContainer}>
          <Text style={styles.descriptionText}>Modeh Ani:</Text>
          <Pressable style={styles.button} testID="dateTimePicker1" onPress={showDatePicker1}>
            <Text testID="timeOneText" style={styles.buttonText}>
              {timeOne.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <DateTimePickerModal
              isVisible={isDatePickerVisible1}
              mode="time"
              value={timeOne}
              onConfirm={handleConfirmOne}
              onCancel={hideDatePicker1}
              display="spinner"
              minuteInterval={5}
              is24Hour={false}
              testID="dateTimePickerModal1"
            />
          </Pressable>
        </View>

        <View style={styles.rowContainer}>
          <Text style={styles.descriptionText}>Ashrei:</Text>
          <Pressable style={styles.button} onPress={showDatePicker2}>
            <Text testID="timeTwoText" style={styles.buttonText}>
              {timeTwo.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <DateTimePickerModal
              isVisible={isDatePickerVisible2}
              mode="time"
              value={timeTwo}
              onConfirm={handleConfirmTwo}
              onCancel={hideDatePicker2}
              display="spinner"
              minuteInterval={5}
              is24Hour={false}
              testID="dateTimePickerModal2"
            />
          </Pressable>
        </View>

        <View style={styles.rowContainer}>
          <Text style={styles.descriptionText}>Shema:</Text>
          <Pressable style={styles.button} onPress={showDatePicker3}>
            <Text testID="timeThreeText" style={styles.buttonText}>
              {timeThree.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <DateTimePickerModal
              isVisible={isDatePickerVisible3}
              mode="time"
              value={timeThree}
              onConfirm={handleConfirmThree}
              onCancel={hideDatePicker3}
              display="spinner"
              minuteInterval={5}
              is24Hour={false}
            />
          </Pressable>
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
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: '80%',
    height: 40,
    borderStyle: 'solid',
    borderBottomWidth: 2,
    // borderRadius: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "85%",
    marginBottom: 10,
  },
  button: {
    width: 120,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#4A90E2",
    backgroundColor: '#4A90E2',
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  descriptionText: {
    // fontSize: 16,
    // fontWeight: "bold",
    fontSize: 16,
    fontWeight: '600',
    color: '#9e9e9e',
    // textTransform: 'uppercase',
    // letterSpacing: 1.1,
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
  successMessageBox: {
    textAlign: "center",
    borderRadius: 6,
    backgroundColor: "#5cb85c",
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
  successMessageText: {
    textAlign: "center",
    color: "#FFFFFF",
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
