// const Tab = createBottomTabNavigator();




// };

// export default BottomTabNavigator;

import React, { useRef, useState } from "react";
import { View, Animated, Dimensions } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import FriendFeed from "../screens/home/FriendFeed";
import JournalEntry from "../screens/home/CheckIn";
import Archive from "../screens/home/Archive";
import JournalModal from "../screens/home/JournalModal";
import JournalEntryDetailsScreen from "../screens/home/JournalEntryDetailsScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  const tabOffsetValue = useRef(new Animated.Value(0)).current;
  const [showJournalModal, setShowJournalModal] = useState(false);
 
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
        initialRouteName="Feed"
        screenOptions={{
          tabBarShowLabel: false,
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "white",
            position: "absolute",
            bottom: 40,
            marginHorizontal: 20,
            // Max Height...
            height: 60,
            borderRadius: 10,
            // Shadow...
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
          name="Feed"
          component={FriendFeed}
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={{ position: "absolute", top: 15 }}>
                <Ionicons
                  name="people"
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
          component={JournalEntry}
          options={{
            tabBarIcon: ({ focused }) => (
              <View
                style={{
                  width: 55,
                  height: 55,
                  backgroundColor: "#4A90E2",
                  borderRadius: 30,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 30,
                }}
              >
                <Ionicons
                  name="journal"
                  size={25}
                  color={"#ffffff"}
                  style={{
                    width: 25,
                    height: 25,
                    // tintColor: 'white',
                  }}
                />
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
          name="Archive"
          component={Archive}
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={{ position: "absolute", top: 15 }}>
                <Ionicons
                  name="archive"
                  size={25}
                  color={focused ? "#4A90E2" : "gray"}
                />
              </View>
            ),
          }}
          listeners={({ navigation, route }) => ({
            // Onpress Update....
            tabPress: (e) => {
              Animated.spring(tabOffsetValue, {
                toValue: getWidth() * 3.33,
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
          bottom: 39,
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
          onRequestClose={() => setShowJournalModal(false)}
        />
      )}
    </>
  );
};

const JournalNavigator = () => {
  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator>
        <Stack.Screen
          name="Main"
          component={BottomTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="JournalEntryDetails"
          component={JournalEntryDetailsScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

function getWidth() {
  let width = Dimensions.get("window").width;

  // Horizontal Padding = 20...
  width = width - 80;

  // divide by total Tabs...
  return width / 5;
}

export default JournalNavigator;
