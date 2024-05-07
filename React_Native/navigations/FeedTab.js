import React, { useState, useEffect, useRef } from "react";

import { View, Animated, StyleSheet, useWindowDimensions } from "react-native";
import { TabView, SceneMap, TabBar, Text } from "react-native-tab-view";
import axios from "axios";
import IP_ADDRESS from "../ip.js";
import * as Storage from "../AsyncStorage.js";
import CommunityFeed from "../screens/communities/CommunityFeed.js";
const API_URL = "http://" + IP_ADDRESS + ":8000";

const FeedTab = () => {
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);
  const [routes, setRoutes] = React.useState([
    { key: "frends", title: "Friends" },
    { key: "second", title: "person-add" },
    { key: "third", title: "mail" },
    { key: "fourth", title: "mail" },
  ]);

  const position = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    console.log("initializing community feed tab data");
    const storedUsername = await Storage.getItem("@username");
    const communitiesData = await getCommunities(storedUsername);
    console.log('community data', communitiesData);
    const newRoutes = communitiesData.map((communityName, idx) => ({
      key: `community_${idx}`,
      title: communityName,
    }));
    setRoutes(newRoutes);
    console.log('finished initializing community feed tab');
  };

  const getCommunities = async (username) => {
    console.log('fetching communities for ', username);
    try {
      const response = await axios.get(`${API_URL}/get_user_community_info/`, {
        params: { username },
      });
      return response.data.map((community) => community.community_name);
    } catch (error) {
      console.error("Error fetching communities:", error);
      return [
        { key: "frends", title: "Friends" },
        { key: "second", title: "person-add" },
        { key: "third", title: "mail" },
        { key: "fourth", title: "mail" },
      ];
    }
  };

  const renderLabel = (route) => {
    return (
    <Text style={{color: "white"}}>{route.title}</Text>
  )};

  const renderIndicator = (props) => {
    const { position, navigationState, getTabWidth } = props;
    const width = layout.width / navigationState.routes.length;

    const translateX = Animated.multiply(position, width - width / 7);

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

  const renderScene = ({ route }) => {
    // Check if route exists before rendering
    console.log('route:', route);
    if (!route) return null;
    return <CommunityFeed communityNameProp={route?.communityName} />
  };

  const renderTabBar = (props) => (
    <TabBar
      {...props}
      scrollEnabled
      tabStyle={styles.tabStyle}
      // indicatorStyle={styles.indicatorStyle}
      renderIndicator={renderIndicator}
      style={styles.tabBar}
      labelStyle={styles.labelStyle}
      renderIcon={renderLabel}
    />
  );

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
      renderTabBar={renderTabBar}
    />
  );
};

const styles = StyleSheet.create({
  tabStyle: {
    width: "auto", // Ensures the tab width auto-adjusts to content
  },
  indicatorStyle: {
    backgroundColor: "#4A90E2",
  },
  tabBar: {
    backgroundColor: "white",
    borderRadius: 10,
    marginHorizontal: 20,
    overflow: "hidden",
    elevation: 0,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    marginTop: 20,
  },
  labelStyle: {
    display: "none",
    color: "black",
  },
});

export default FeedTab;
