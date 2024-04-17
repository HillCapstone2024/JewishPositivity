import * as React from "react";
import { View, useWindowDimensions } from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import Friends from "../screens/home/FriendsList";
import AddFriends from "../screens/home/AddFriends";
import FriendRequest from "../screens/home/FriendRequest";
import FriendRequests from "../screens/home/FriendRequests";

const FirstRoute = () => (
  <View style={{ flex: 1, backgroundColor: "#ff4081" }} />
);

const SecondRoute = () => (
  <View style={{ flex: 1, backgroundColor: "#673ab7" }} />
);

const renderScene = SceneMap({
  View: Friends,
  Add: AddFriends,
  Request: FriendRequests,
});

export default function FriendTab() {
  const layout = useWindowDimensions();

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: "View", title: "My Friends" },
    { key: "Add", title: "Add Friends" },
    { key: "Request", title: "Requests" },
  ]);

  const renderTabBar = (props) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: "#0066cc" }}
      style={{ backgroundColor: "white" }}
      labelStyle={{ color: "#0066cc", fontWeight: "bold" }}
    />
  );

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
      indicatorStyle={{ backgroundColor: "white" }}
      bounces={true}
      renderTabBar={renderTabBar}
    />
  );
}
