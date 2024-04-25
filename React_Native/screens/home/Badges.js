import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Pressable, Modal, Alert } from 'react-native';
import makeThemeStyle from '../../tools/Theme.js';
import axios from "axios";
import IP_ADDRESS from "../../ip.js";
import * as Storage from "../../AsyncStorage.js";

export default function Badges({}) {
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
        console.log('username: ', username);
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
          const longestStreakResponse = await axios.get(`${API_URL}/longest_streak/`, {
            params: {
              username: username,
            },
            headers: {
              "X-CSRFToken": csrfToken,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          });
          const currentStreakResponse = await axios.get(`${API_URL}/current_streak/`, {
            params: {
              username: username,
            },
            headers: {
              "X-CSRFToken": csrfToken,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          });
          console.log('Day response:', badgeResponse.data.one_day);
          console.log('Week response:', badgeResponse.data.one_week);
          console.log('Month response:', badgeResponse.data.one_month);
          console.log('Year response:', badgeResponse.data.one_year);

          console.log('Current response:', currentStreakResponse.data);
          console.log('Longest response:', longestStreakResponse.data);


          if(badgeResponse.data.one_day) {
            setDayBadgeIcon(require('../../assets/images/badges/starDay.png')) }
          if(badgeResponse.data.one_week) {
            setWeekBadgeIcon(require('../../assets/images/badges/starWeek.png')) }
          if(badgeResponse.data.one_month) {
            setMonthBadgeIcon(require('../../assets/images/badges/starMonth.png')) }
          if(badgeResponse.data.year) {
            setYearBadgeIcon(require('../../assets/images/badges/starYear.png')) }

          setCurrentStreak(currentStreakResponse.data);
          setLongestStreak(longestStreakResponse.data);
          

        } catch (error) {
          console.log('Error getting the info from database: ', error);
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
    
   //Determines which trophy icon is used
   const [dayBadgeIcon, setDayBadgeIcon] = useState(require('../../assets/images/badges/starDayGrey.png'));
   const [weekBadgeIcon, setWeekBadgeIcon] = useState(require('../../assets/images/badges/starWeekGrey.png'));
   const [monthBadgeIcon, setMonthBadgeIcon] = useState(require('../../assets/images/badges/starMonthGrey.png'));
   const [yearBadgeIcon, setYearBadgeIcon] = useState(require('../../assets/images/badges/starYearGrey.png'));


    const handleModalDay = () => {
        setIsModalVisibleDay(!isModalVisibleDay)
        //checkLock()
    };
    const handleModalWeek = () => {
        setIsModalVisibleWeek(!isModalVisibleWeek)
        //checkLock()
    };
    const handleModalMonth = () => {
        setIsModalVisibleMonth(!isModalVisibleMonth)
        //checkLock()
    };
    const handleModalYear = () => {
        setIsModalVisibleYear(!isModalVisibleYear)
        //checkLock()
    };
    const handleModalCurrent = () => {
        setIsModalVisibleCurrent(!isModalVisibleCurrent)
    };
    const handleModalLongest = () => {
        setIsModalVisibleLongest(!isModalVisibleLongest)
    };

   

    return(
        <ScrollView contentContainerStyle={styles.container}>
            
            <View style={[{ flex: 1, alignItems: 'center', justifyContent: 'center'}, theme['background']]}>    
                <Text style={styles.mainHeader}>Streaks</Text>

                <View style={styles.rowContainer}>

                {/*Current*/}
                <TouchableOpacity style={styles.button} onPress={handleModalCurrent}>
                    <Text>Current Streak</Text>
                    <Text style={styles.streakHeader}>{currentStreak} Days</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={handleModalLongest}>
                    <Text>Longest Streak</Text>
                    <Text style={styles.streakHeader}>{longestStreak} Days</Text>
                </TouchableOpacity>
            </View>

        <View style={styles.separator}></View>

         <Text style={styles.mainHeader}>Badges</Text>

            {/* ==============================================Day Badge============================================== */}
            <View style={styles.rowContainer}>
                <TouchableOpacity style={styles.button} onPress={handleModalDay}> 
                    <Image
                        source={dayBadgeIcon}
                        style={styles.trophyButton}
                    />

                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={isModalVisibleDay}
                        onRequestClose={() => {
                        Alert.alert('Modal has been closed.');
                        setIsModalVisibleDay(!isModalVisibleDay);
                    }}>

                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                                <Image
                                    source={dayBadgeIcon}
                                    style={styles.trophyButtonA}
                                />

                                <Text style={styles.modalText}>Badge for completing a daily check-in</Text>
                                <Pressable
                                    style={[styles.buttonClose]}
                                    onPress={() => setIsModalVisibleDay(!isModalVisibleDay)}>
                                    <Text style={styles.textStyle}>Hide Trophy</Text>
                                </Pressable>
                            </View>
                        </View>
                    </Modal>
                </TouchableOpacity>
           
                {/* ==============================================Week Badge============================================== */}
                <TouchableOpacity style={styles.button} onPress={handleModalWeek}> 
                    <Image
                        source={weekBadgeIcon}
                        style={styles.trophyButton}
                    />

                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={isModalVisibleWeek}
                        onRequestClose={() => {
                        Alert.alert('Modal has been closed.');
                        setIsModalVisibleWeek(!isModalVisibleWeek);
                    }}>

                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                                <Image
                                    source={weekBadgeIcon}
                                    style={styles.trophyButtonA}
                                />

                                <Text style={styles.modalText}>Badge for completing a check-in daily for a week</Text>
                                <Pressable
                                    style={[styles.buttonClose]}
                                    onPress={() => setIsModalVisibleWeek(!isModalVisibleWeek)}>
                                    <Text style={styles.textStyle}>Hide Trophy</Text>
                                </Pressable>
                            </View>
                        </View>
                    </Modal>
                </TouchableOpacity>


            </View>
            <View style={styles.rowContainer}>

            {/* ==============================================Month Badge============================================== */}
            <TouchableOpacity style={styles.button} onPress={handleModalMonth}> 
                    <Image
                        source={monthBadgeIcon}
                        style={styles.trophyButton}
                    />

                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={isModalVisibleMonth}
                        onRequestClose={() => {
                        Alert.alert('Modal has been closed.');
                        setIsModalVisibleMonth(!isModalVisibleMonth);
                    }}>

                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                                <Image
                                    source={monthBadgeIcon}
                                    style={styles.trophyButtonA}
                                />

                                <Text style={styles.modalText}>Badge for completing a check-in daily for a month</Text>
                                <Pressable
                                    style={[styles.buttonClose]}
                                    onPress={() => setIsModalVisibleMonth(!isModalVisibleMonth)}>
                                    <Text style={styles.textStyle}>Hide Trophy</Text>
                                </Pressable>
                            </View>
                        </View>
                    </Modal>
                </TouchableOpacity>

                {/* ==============================================Year Badge============================================== */}
                <TouchableOpacity style={styles.button} onPress={handleModalYear}> 
                    <Image
                        source={yearBadgeIcon}
                        style={styles.trophyButton}
                    />

                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={isModalVisibleYear}
                        onRequestClose={() => {
                        Alert.alert('Modal has been closed.');
                        setIsModalVisibleYear(!isModalVisibleYear);
                    }}>

                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                                <Image
                                    source={yearBadgeIcon}
                                    style={styles.trophyButtonA}
                                />

                                <Text style={styles.modalText}>Badge for completing a check-in daily for a year</Text>
                                <Pressable
                                    style={[styles.buttonClose]}
                                    onPress={() => setIsModalVisibleYear(!isModalVisibleYear)}>
                                    <Text style={styles.textStyle}>Hide Trophy</Text>
                                </Pressable>
                            </View>
                        </View>
                    </Modal>
                </TouchableOpacity>

                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({ 
    container: {
        flex: 1,
        padding: 0,
        justifyContent: 'center',
        backgroundColor: "000000"
    },

    button: {
        width: 150, //100
        height: 150,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: "#FFFFFF",
        backgroundColor: '#FFFFFF',
        alignItems: "center",
    },
    trophyButton: {
        padding: 10,
        margin: 5,
        height: 120, //70
        width: 120,
        alignItems: "center",
        resizeMode: 'cover',
    },
    trophyButtonA: {
        padding: 10,
        margin: 5,
        height: 200, //70
        width: 200,
        alignItems: "center",
        resizeMode: 'cover',
    },
    streakButton: {
        padding: 5,
        margin: 0,
        height: 85,
        width: 85,
        alignItems: "center",
        resizeMode: 'contain',
    },
    rowContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "80%",
        marginBottom: 10,
    },
    streakHeader:{
        color: "black",
        fontSize: 30,
        fontWeight: "bold"
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: "80%",
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        }
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },

    modalText: {
        marginBottom: 15,
        textAlign: 'center',
    },

    buttonClose: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        backgroundColor: 'red',      
    },

    textStyle: {
        textAlign: 'center',
        fontWeight: 'bold',
        color: 'black'
    },

    mainHeader: {
        textAlign: 'center',
        fontSize: 30,
        fontWeight: '900'
    }
});