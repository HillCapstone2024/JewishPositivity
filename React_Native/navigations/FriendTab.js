import * as React from "react";
import { View, Animated, StyleSheet, useWindowDimensions } from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { Ionicons } from "@expo/vector-icons";

import Friends from "../screens/friends/FriendsList";
import AddFriends from "../screens/friends/AddFriends";
import FriendRequests from "../screens/friends/FriendRequests";

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

  const renderIcon = ({ route, focused }) => (
    <Ionicons
      name={route.icon}
      size={24}
      color={focused ? "white" : "#4A90E2"}
    />
  );


  const renderIndicator = (props) => {
    const { position, navigationState, getTabWidth } = props;
    const width = layout.width / navigationState.routes.length;

    const translateX = Animated.multiply(position, width - width/7);

    return (
      <Animated.View
        style={{
          position: "absolute",
          // padding: "10%",
          width: width, // Circle's width as a third of each tab's width
          height: "100%", // Circle's height
          borderRadius: 10, // Half of height to make it a perfect circle
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
          useNativeDriver: true,
          speed: 15,
          bounciness: 80,
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
