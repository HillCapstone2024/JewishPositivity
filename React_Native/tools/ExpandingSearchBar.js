import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Animated,
  Text,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ExpandingSearchBar = () => {
  const [isFocused, setFocused] = useState(false);
  const widthAnim = useRef(new Animated.Value(150)).current; // Initial width of the search bar

  useEffect(() => {
    if (isFocused) {
      Animated.timing(widthAnim, {
        toValue: 250, // Expanded width
        duration: 300,
        useNativeDriver: false, // Width cannot be animated using native driver
      }).start();
    } else {
      Animated.timing(widthAnim, {
        toValue: 140, // Initial width
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [isFocused]);

  return (
    <View style={styles.container}>
      <View style={styles.sectionContainer}>
        <Animated.View style={[styles.searchContainer, { width: widthAnim }]}>
          <Ionicons
            name="search"
            size={20}
            color="#4A90E2"
            style={styles.iconStyle}
          />
          <TextInput
            style={styles.sectionTitle}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="ADD FRIENDS"
            placeholderTextColor={"#ccc"}
          />
        </Animated.View>
        <View style={styles.horizontalLine} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    justifyContent: "center",
  },
  sectionContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 10,
    borderRadius: 20,
    height: 40,
    marginRight: 8,
    overflow: "hidden",
  },
  input: {
    fontSize: 16,
    marginLeft: 5,
    width: "90%", // TextInput width take the majority of searchContainer
  },
  iconStyle: {
    marginRight: 5,
  },
  sectionTitle: {
    paddingVertical: 12,
    fontSize: 12,
    fontWeight: "600",
    color: "#9e9e9e",
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  sectionContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  horizontalLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#9e9e9e",
    marginLeft: 8, // Adjust spacing between title and line
  },
});

export default ExpandingSearchBar;
