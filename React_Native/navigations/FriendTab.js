import * as React from "react";
import { View, Animated, StyleSheet, useWindowDimensions } from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { Ionicons } from "@expo/vector-icons";

import Friends from "../screens/home/FriendsList";
import AddFriends from "../screens/home/AddFriends";
import FriendRequests from "../screens/home/FriendRequests";

const renderScene = SceneMap({
  first: Friends,
  second: AddFriends,
  third: FriendRequests,
});

const FriendTab = () => {
  const layout = useWindowDimensions();

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: "first", icon: "people" },
    { key: "second", icon: "person-add" },
    { key: "third", icon: "mail" },
  ]);

  const position = React.useRef(new Animated.Value(0)).current; // Use useRef to persist the animated value

  const renderIcon = ({ route, focused }) => {
    const color = position.interpolate({
      inputRange: routes.map((_, i) => i),
      outputRange: routes.map((_, i) => (i === index ? "white" : "#0066cc")),
    });

    return (
      <Animated.Text style={{ color }}>
        <Ionicons
          name={route.icon}
          size={24}
          color={focused ? "white" : "#4A90E2"}
        />
      </Animated.Text>
    );
  };

  const renderIndicator = (props) => {
    const width = layout.width / routes.length;
    const translateX = position.interpolate({
      inputRange: [0, 1, 2], // Assuming you have three tabs
      outputRange: [0, width - 25, 2 * width - 25], // Move between multiples of tab width
    });

    return (
      <Animated.View
        style={{
          position: "absolute",
          width: width,
          height: "100%",
          borderRadius: 10,
          backgroundColor: "#4A90E2",
          transform: [{ translateX }],
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 4,
        }}
      />
    );
  };

  const renderTabBar = (props) => (
    <TabBar
      {...props}
      renderIcon={renderIcon}
      renderIndicator={renderIndicator}
      indicatorStyle={{ backgroundColor: "transparent" }}
      style={{
        backgroundColor: "white",
        borderRadius: 10,
        marginHorizontal: 20,
        overflow: "hidden",
        elevation: 0,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
      }}
      labelStyle={{ display: "none" }}
      iconStyle={{ justifyContent: "center", alignItems: "center" }}
    />
  );

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={(i) => {
        Animated.spring(position, {
          toValue: i,
          useNativeDriver: true, // Ensure you use the native driver for better performance
          speed: 15, // Control the speed of the animation
          bounciness: 8, // This prop will add a bounce effect to the sliding animation
        }).start();
        setIndex(i);
      }}
      initialLayout={{ width: layout.width }}
      renderTabBar={renderTabBar}
      style={{ marginTop: 20 }}
    />
  );
};

export default FriendTab;
