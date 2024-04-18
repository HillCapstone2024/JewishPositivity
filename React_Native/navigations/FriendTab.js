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

  const renderIcon = ({ route, focused }) => (
    <Ionicons name={route.icon} size={24} color={focused ? "white" : "#0066cc"} />
  );

  const renderIndicator = (props) => {
    const { position, navigationState, getTabWidth } = props;
    const width = layout.width / navigationState.routes.length;
    // const width = layout.width / routes.length;

    const translateX = Animated.multiply(position, width - 18);

    // const translateX = Animated.multiply(position, new Animated.Value(width));

    return (
      <Animated.View
        style={{
          position: "absolute",
          // padding: "10%",
          width: width, // Circle's width as a third of each tab's width
          height: "100%", // Circle's height
          borderRadius: 25, // Half of height to make it a perfect circle
          backgroundColor: "#0066cc",
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
      renderIcon={({ route }) =>
        renderIcon({
          route,
          focused: index === routes.findIndex((e) => e.key === route.key),
        })
      }
      renderIndicator={renderIndicator}
      indicatorStyle={{ backgroundColor: "transparent" }}
      style={{
        backgroundColor: "white",
        borderRadius: 25,
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
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
      renderTabBar={renderTabBar}
      style={{ marginTop: 20 }}
    />
  );
};

export default FriendTab;
