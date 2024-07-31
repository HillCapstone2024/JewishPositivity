import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Pressable,
  Modal,
  Alert,
  Dimensions
} from "react-native";
import makeThemeStyle from "../../tools/Theme.js";
import axios from "axios";
import IP_ADDRESS from "../../ip.js";
import * as Storage from "../../AsyncStorage.js";
import { Ionicons } from "@expo/vector-icons";
import ConfettiCannon from "react-native-confetti-cannon";

export default function Badges({}) {
    const layout = Dimensions.get("window");
    const width = layout.width;
  theme = makeThemeStyle();

  const API_URL = "http://" + IP_ADDRESS + ":8000";
  const [username, setUsername] = useState("");

  useEffect(() => {
    const loadUsername = async () => {
      const storedUsername = await Storage.getItem("@username");
      setUsername(storedUsername || "");
    };

    loadUsername();
  }, []);

  useEffect(() => {
    getBadgeStreakInfo();
  }, [username]);

  const getCsrfToken = async () => {
    try {
      const response = await axios.get(`${API_URL}/csrf-token/`);
      return response.data.csrfToken;
    } catch (error) {
      console.error("Error retrieving CSRF token:", error);
      throw new Error("CSRF token retrieval failed");
    }
  };

  //GET
  const getBadgeStreakInfo = async () => {
    console.log("username: ", username);
    try {
      const csrfToken = await getCsrfToken();
      const badgeResponse = await axios.get(`${API_URL}/get_badges/`, {
        params: {
          username: username,
        },
        headers: {
          "X-CSRFToken": csrfToken,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      const longestStreakResponse = await axios.get(
        `${API_URL}/longest_streak/`,
        {
          params: {
            username: username,
          },
          headers: {
            "X-CSRFToken": csrfToken,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      const currentStreakResponse = await axios.get(
        `${API_URL}/current_streak/`,
        {
          params: {
            username: username,
          },
          headers: {
            "X-CSRFToken": csrfToken,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      console.log("num badges:", Object.keys(badgeResponse.data).length);
      console.log("Day response:", badgeResponse.data.one_day);
      console.log("Week response:", badgeResponse.data.one_week);
      console.log("Month response:", badgeResponse.data.one_month);
      console.log("Year response:", badgeResponse.data.one_year);

      console.log("Current response:", currentStreakResponse.data);
      console.log("Longest response:", longestStreakResponse.data);

      if (badgeResponse.data.one_day) {
        setDayBadgeIcon(require("../../assets/images/badges/starDay.png"));
      }
      if (badgeResponse.data.one_week) {
        setWeekBadgeIcon(require("../../assets/images/badges/starWeek.png"));
      }
      if (badgeResponse.data.one_month) {
        setMonthBadgeIcon(require("../../assets/images/badges/starMonth.png"));
      }
      if (badgeResponse.data.year) {
        setYearBadgeIcon(require("../../assets/images/badges/starYear.png"));
      }

      setCurrentStreak(currentStreakResponse.data);
      setLongestStreak(longestStreakResponse.data);
      setNumAwards(Object.keys(badgeResponse.data).length);
    } catch (error) {
      console.log("Error getting the info from database: ", error);
    }
  };

  //Variables for toggling modal visibility
  const [isModalVisibleDay, setIsModalVisibleDay] = useState(false);
  const [isModalVisibleWeek, setIsModalVisibleWeek] = useState(false);
  const [isModalVisibleMonth, setIsModalVisibleMonth] = useState(false);
  const [isModalVisibleYear, setIsModalVisibleYear] = useState(false);
  const [isModalVisibleCurrent, setIsModalVisibleCurrent] = useState(false);
  const [isModalVisibleLongest, setIsModalVisibleLongest] = useState(false);

  //Stores longest and current streaks
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [numAwards, setNumAwards] = useState(0);

  //Determines which trophy icon is used
  const [dayBadgeIcon, setDayBadgeIcon] = useState(
    require("../../assets/images/badges/starDayGrey.png")
  );
  const [weekBadgeIcon, setWeekBadgeIcon] = useState(
    require("../../assets/images/badges/starWeekGrey.png")
  );
  const [monthBadgeIcon, setMonthBadgeIcon] = useState(
    require("../../assets/images/badges/starMonthGrey.png")
  );
  const [yearBadgeIcon, setYearBadgeIcon] = useState(
    require("../../assets/images/badges/starYearGrey.png")
  );

  const handleModalDay = () => {
    setIsModalVisibleDay(!isModalVisibleDay);
    //checkLock()
  };
  const handleModalWeek = () => {
    setIsModalVisibleWeek(!isModalVisibleWeek);
    //checkLock()
  };
  const handleModalMonth = () => {
    setIsModalVisibleMonth(!isModalVisibleMonth);
    //checkLock()
  };
  const handleModalYear = () => {
    setIsModalVisibleYear(!isModalVisibleYear);
    //checkLock()
  };
  const handleModalCurrent = () => {
    setIsModalVisibleCurrent(!isModalVisibleCurrent);
  };
  const handleModalLongest = () => {
    setIsModalVisibleLongest(!isModalVisibleLongest);
  };

  return (
    <View style={styles.container}>
      <View style={[{ flex: 1, alignItems: "center" }, theme["background"]]}>
        {/* <Text style={styles.mainHeader}>Streaks</Text>#4A90E2 */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}> My Stats</Text>
          <View style={styles.horizontalLine} />
        </View>

        <View style={styles.rowContainer}>
          {/*Current*/}
          <TouchableOpacity style={styles.button} onPress={handleModalCurrent}>
            <View style={{ flexDirection: "row" }}>
              <Text style={[styles.streakValue, theme['color']]}>
                {currentStreak} {currentStreak == 1 ? "Day" : "Days"}
              </Text>
              <Ionicons name="flame" size={16} color={"orange"} />
            </View>
            <Text style={styles.streakHeader}>Current Streak</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleModalLongest}>
            <View style={{ flexDirection: "row" }}>
              <Text style={[styles.streakValue, theme['color']]}>
                {longestStreak} {longestStreak == 1 ? "Day" : "Days"}
              </Text>
              <Ionicons name="flame" size={16} color={"orange"} />
            </View>
            <Text style={styles.streakHeader}>Longest Streak</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleModalLongest}>
            <View style={{ flexDirection: "row" }}>
              <Text style={[styles.streakValue, theme['color']]}>
                {numAwards} {numAwards == 1 ? "Trophy" : "Trophies"}
              </Text>
              <Ionicons name="trophy" size={16} color={"orange"} />
            </View>
            <Text style={styles.streakHeader}>Current Awards</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.separator}></View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}> My Awards</Text>
          <View style={styles.horizontalLine} />
        </View>

        {/* <Text style={styles.mainHeader}>My Trophies</Text> */}

        {/* ==============================================Day Badge============================================== */}
        <View style={styles.badgeContainer}>
          <TouchableOpacity style={styles.badgeButton} onPress={handleModalDay}>
            <Image source={dayBadgeIcon} style={styles.trophyButton} />
            <Text style={styles.normalText}>Level One</Text>

            <Modal
              animationType="slide"
              transparent={true}
              visible={isModalVisibleDay}
              onRequestClose={() => {
                Alert.alert("Modal has been closed.");
                setIsModalVisibleDay(!isModalVisibleDay);
              }}
            >
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <ConfettiCannon
                    count={200}
                    origin={{ x: width/2, y: 0 }}
                    fadeOut={true}
                    fallSpeed={2000}
                    colors={["orange", "#4A90E2", "white"]}
                  />
                  <Image source={dayBadgeIcon} style={styles.trophyButtonA} />

                  <Text style={styles.modalText}>
                    Badge for completing a daily check-in
                  </Text>
                  <Pressable
                    style={[styles.buttonClose]}
                    onPress={() => setIsModalVisibleDay(!isModalVisibleDay)}
                  >
                    <Text style={styles.textStyle}>Hide Trophy</Text>
                  </Pressable>
                </View>
              </View>
            </Modal>
          </TouchableOpacity>

          {/* ==============================================Week Badge============================================== */}
          <TouchableOpacity
            style={styles.badgeButton}
            onPress={handleModalWeek}
          >
            <Image source={weekBadgeIcon} style={styles.trophyButton} />
            <Text style={styles.normalText}>Level Two</Text>

            <Modal
              animationType="slide"
              transparent={true}
              visible={isModalVisibleWeek}
              onRequestClose={() => {
                Alert.alert("Modal has been closed.");
                setIsModalVisibleWeek(!isModalVisibleWeek);
              }}
            >
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <Image source={weekBadgeIcon} style={styles.trophyButtonA} />

                  <Text style={styles.modalText}>
                    Badge for completing a check-in daily for a week
                  </Text>
                  <Pressable
                    style={[styles.buttonClose]}
                    onPress={() => setIsModalVisibleWeek(!isModalVisibleWeek)}
                  >
                    <Text style={styles.textStyle}>Hide Trophy</Text>
                  </Pressable>
                </View>
              </View>
            </Modal>
          </TouchableOpacity>
          {/* </View> */}
          {/* <View style={styles.rowContainer}> */}
          {/* ==============================================Month Badge============================================== */}
          <TouchableOpacity
            style={styles.badgeButton}
            onPress={handleModalMonth}
          >
            <Image source={monthBadgeIcon} style={styles.trophyButton} />
            <Text style={styles.normalText}>Level Three</Text>

            <Modal
              animationType="slide"
              transparent={true}
              visible={isModalVisibleMonth}
              onRequestClose={() => {
                Alert.alert("Modal has been closed.");
                setIsModalVisibleMonth(!isModalVisibleMonth);
              }}
            >
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <Image source={monthBadgeIcon} style={styles.trophyButtonA} />

                  <Text style={styles.modalText}>
                    Badge for completing a check-in daily for a month
                  </Text>
                  <Pressable
                    style={[styles.buttonClose]}
                    onPress={() => setIsModalVisibleMonth(!isModalVisibleMonth)}
                  >
                    <Text style={styles.textStyle}>Hide Trophy</Text>
                  </Pressable>
                </View>
              </View>
            </Modal>
          </TouchableOpacity>

          {/* ==============================================Year Badge============================================== */}
          <TouchableOpacity
            style={styles.badgeButton}
            onPress={handleModalYear}
          >
            <Image source={yearBadgeIcon} style={styles.trophyButton} />
            <Text style={styles.normalText}>Level Four</Text>
            <Modal
              animationType="slide"
              transparent={true}
              visible={isModalVisibleYear}
              onRequestClose={() => {
                Alert.alert("Modal has been closed.");
                setIsModalVisibleYear(!isModalVisibleYear);
              }}
            >
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <Image source={yearBadgeIcon} style={styles.trophyButtonA} />

                  <Text style={styles.modalText}>
                    Badge for completing a check-in daily for a year
                  </Text>
                  <Pressable
                    style={[styles.buttonClose]}
                    onPress={() => setIsModalVisibleYear(!isModalVisibleYear)}
                  >
                    <Text style={styles.textStyle}>Hide Trophy</Text>
                  </Pressable>
                </View>
              </View>
            </Modal>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // padding: 0,
    // justifyContent: "center",
    backgroundColor: "000000",
  },

  button: {
    // width: 150, //100
    // height: 150,
    paddingVertical: 10,
    paddingHorizontal: 10,
    // borderRadius: 5,
    // borderWidth: 1,
    // borderColor: "#FFFFFF",
    // backgroundColor: '#FFFFFF',
    alignItems: "center",
  },
  badgeButton: {
    flexDirection: "row",
    alignItems: "center",
    // height: 60,
    height: "14%",
    width: "100%",
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    marginBottom: 12,
    paddingLeft: 12,
    paddingRight: 12,
    shadowColor: "#4A90E2", // Updated shadow color
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  normalText: {
    fontSize: 20,
    paddingLeft: 5,
  },
  trophyButton: {
    padding: 10,
    margin: 5,
    height: 50, //70
    width: 50,
    alignItems: "center",
    resizeMode: "cover",
  },
  trophyButtonA: {
    padding: 10,
    margin: 5,
    height: 200, //70
    width: 200,
    alignItems: "center",
    resizeMode: "cover",
  },
  streakButton: {
    padding: 5,
    margin: 0,
    height: 85,
    width: 85,
    alignItems: "center",
    resizeMode: "contain",
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // width: "80%",
    marginBottom: 10,
  },
  badgeContainer: {
    alignContent: "left",
    // backgroundColor: 'red',
    width: "100%",
  },
  streakValue: {
    color: "black",
    fontSize: 14,
    fontWeight: "bold",
    
  },
  streakHeader: {
    color: "#9e9e9e",
    fontSize: 12,
    fontWeight: "bold",
    
  },
  separator: {
    // marginVertical: 30,
    height: 1,
    width: "80%",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },

  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },

  buttonClose: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    backgroundColor: "red",
  },

  textStyle: {
    textAlign: "center",
    fontWeight: "bold",
    color: "black",
  },

  mainHeader: {
    textAlign: "center",
    fontSize: 30,
    fontWeight: "900",
  },
  sectionContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    paddingVertical: 12,
    fontSize: 12,
    fontWeight: "600",
    color: "#9e9e9e",
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  horizontalLine: {
    flex: 1,
    height: 1.25,
    backgroundColor: "#9e9e9e",
    marginLeft: 8, // Adjust spacing between title and line
  },
});