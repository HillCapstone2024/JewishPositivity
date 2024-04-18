import React, { useRef, useState } from "react";
import { View, Text, Animated, Dimensions, StyleSheet, Platform, TouchableOpacity } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';

import { Ionicons } from "@expo/vector-icons";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPen } from '@fortawesome/free-solid-svg-icons/faPen';
import { faBoxArchive } from '@fortawesome/free-solid-svg-icons/faBoxArchive';
import { faUsersLine } from '@fortawesome/free-solid-svg-icons/faUsersLine';

import FriendFeed from "../screens/home/FriendFeed";
import Archive from "../screens/home/Archive";
import JournalModal from "../screens/home/JournalModal";
import CheckIn from "../screens/home/CheckIn";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const BottomTabNavigator = ( ) => {
  const tabOffsetValue = useRef(new Animated.Value(0)).current;
  const [showJournalModal, setShowJournalModal] = useState(false);
  const navigation = useNavigation(); // Access navigation here
 
  const openJournalModal = () => {
    setShowJournalModal(true);
  };

  const closeJournalModal = () => {
    setShowJournalModal(false);
  };

  const submitJournalEntry = () => {
    closeJournalModal();
  };

  return (
    <>
      <Tab.Navigator
        initialRouteName="Archive"
        screenOptions={{
          tabBarShowLabel: false,
          headerShown: false,
          tabBarStyle: {
            position: "absolute",
            backgroundColor: "transparent",
            bottom: 40,
            marginHorizontal: 20,
            height: 60,
            borderTopWidth: 0,
            borderRadius: 10,
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowOffset: {
              width: 10,
              height: 10,
            },
            paddingHorizontal: 20,
          },
        }}
      >
        <Tab.Screen
          name="Archive"
          component={Archive}
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={{ position: "absolute", top: 15 }}>
                <View style={[styles.spaceFillerLeft, styles.borderLeft]} />
                <FontAwesomeIcon icon={faBoxArchive} 
                  size={28}
                  color={focused ? "#4A90E2" : "gray"}
                />
              </View>
            ),
          }}
          listeners={({ navigation, route }) => ({
            // Onpress Update....
            tabPress: (e) => {
              Animated.spring(tabOffsetValue, {
                toValue: 0,
                useNativeDriver: true,
              }).start();
            },
          })}
        />

        <Tab.Screen
          name="Journal"
          component={CheckIn}
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={styles.btnWrapper}>
                <View  style={{ flexDirection: 'row' }}>
                  <View style={[styles.svgGapFiller, styles.borderLeft]} />
                    <Svg width={71} height={58} viewBox="0 0 75 61">
                      <Path
                        d="M75.2 0v61H0V0c4.1 0 7.4 3.1 7.9 7.1C10 21.7 22.5 33 37.7 33c15.2 0 27.7-11.3 29.7-25.9.5-4 3.9-7.1 7.9-7.1h-.1z"
                        fill={"white"}
                      />
                    </Svg>
                  <View style={[styles.svgGapFiller, styles.borderRight]} />
                </View>

                <TouchableOpacity
                  activeOpacity={0.5}
                  onPress={() => setShowJournalModal(true)}
                  style={[styles.activeBtn]}                
                >
                  <FontAwesomeIcon icon={faPen} 
                    size={25}
                    color={"#4A90E2"}
                  />
                </TouchableOpacity>
              </View>
            ),
          }}
          listeners={({ navigation, route }) => ({
            tabPress: (e) => {
              e.preventDefault(); // Prevent default behavior
              openJournalModal(); // Call the openJournalModal function
            },
          })}
        />

        <Tab.Screen
          name="Feed"
          component={FriendFeed}
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={{ position: "absolute", top: 15 }}>
                <View style={[styles.spaceFillerRight, styles.borderRight]} />
                <Ionicons
                  name="people"
                  size={28}
                  color={focused ? "#4A90E2" : "gray"}
                />
                {/* <FontAwesomeIcon icon={faUsersLine} 
                  size={28}
                  color={focused ? "#4A90E2" : "gray"}
                /> */}
              </View>
            ),
          }}
          listeners={({ navigation, route }) => ({
            // Onpress Update....
            tabPress: (e) => {
              Animated.spring(tabOffsetValue, {
                toValue: getWidth() * 3.35,
                useNativeDriver: true,
              }).start();
            },
          })}
        />
      </Tab.Navigator>

      <Animated.View
        style={{
          width: getWidth() - 20,
          height: 2,
          backgroundColor: "#4A90E2",
          position: "absolute",
          bottom: 41,
          left: 70,
          borderRadius: 20,
          transform: [{ translateX: tabOffsetValue }],
        }}
      ></Animated.View>

      {showJournalModal && (
        <JournalModal
          onClose={closeJournalModal}
          onSubmit={submitJournalEntry}
          visible={showJournalModal}
          navigation={navigation}
          // checkInType={selectedCheckInType} // Pass the check-in type here
          onRequestClose={() => setShowJournalModal(false)}
        />
      )}
    </>
  );
};

function getWidth() {
  let width = Dimensions.get("window").width;

  // Horizontal Padding = 20...
  width = width - 80;

  // divide by total Tabs...
  return width / 5;
}

export default BottomTabNavigator;

const styles = StyleSheet.create({
  btnWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  activeBtn: {
    flex: 1,
    position: 'absolute',
    top: -22,
    width: 50,
    height: 50,
    borderRadius: 50 / 2,
    backgroundColor: "white",
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveBtn: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: 'center',
    alignItems: 'center',
  },
  svgGapFiller: {
    // flex: 1,
    width: 0,
    height: 58,
    // left:20,
    borderTopWidth: 0,
    // borderRadius: 10,
    backgroundColor: "red",
  },
  spaceFillerLeft: {
    position: "absolute",
    width: 142,
    height: 58,
    left:-59,
    bottom: -15,
    borderTopWidth: 0,
    backgroundColor: "white",
  },
  spaceFillerRight: {
    position: "absolute",
    width: 142,
    height: 58,
    left:-55,
    bottom: -15,
    borderTopWidth: 0,
    backgroundColor: "white",
  },
  borderLeft: {
    borderBottomLeftRadius: 10,
    borderTopLeftRadius: 10,
  },
  borderRight: {
    borderBottomRightRadius: 10,
    borderTopRightRadius: 10,
  },
});