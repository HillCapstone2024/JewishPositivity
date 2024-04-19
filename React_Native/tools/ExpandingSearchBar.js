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
import { width } from "@fortawesome/free-solid-svg-icons/faPen";

const ExpandingSearchBar = ({ onSearch }) => {
  const [isFocused, setFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const widthAnim = useRef(new Animated.Value(150)).current;

  useEffect(() => {
    if (isFocused) {
      Animated.timing(widthAnim, {
        toValue: 250,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(widthAnim, {
        toValue: 140,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [isFocused]);

  return (
    <View style={styles.container}>
      <View style={styles.sectionContainer}>
        <Animated.View style={[styles.searchContainer, { width: widthAnim }]}>
          <TextInput
            style={styles.sectionTitle}
            onFocus={() => setFocused(true)}
            onBlur={() => 
              {setFocused(false);
              onSearch(searchQuery);
              }
            }
            placeholder="ADD FRIENDS"
            placeholderTextColor={"#ccc"}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity
            onPress={() => onSearch(searchQuery)}
            disabled={searchQuery.trim() === ""}
            style={styles.iconContainer}
          >
            <Ionicons name="search" size={20} color={"#4A90E2"} />
          </TouchableOpacity>
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
    // paddingHorizontal: 10,
    borderRadius: 20,
    height: 40,
    overflow: "hidden",
    justifyContent: "space-between",
  },
  iconContainer: {
    // marginRight: "1%",
    width: "20%",
    justifyContent: "right",
    // position: "absolute",
    alignItems: "flex-end",
    // backgroundColor: "red",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 10,
    borderRadius: 20,
    height: 40,
    // marginRight: 8,
    overflow: "hidden",
  },
  input: {
    fontSize: 16,
    marginLeft: 5,
    width: "80%", // TextInput width take the majority of searchContainer
  },
  sectionTitle: {
    paddingVertical: 12,
    fontSize: 12,
    fontWeight: "600",
    color: "#9e9e9e",
    textTransform: "uppercase",
    letterSpacing: 1.1,
    width: "80%",
  },
  horizontalLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#9e9e9e",
    marginLeft: 8, // Adjust spacing between title and line
  },
});

export default ExpandingSearchBar;
