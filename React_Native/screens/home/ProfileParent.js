import React, { useState } from "react";
import { View, Text, Image, StyleSheet, TextInput, Button } from "react-native";
import UserProfile from "./Profile.js";
import EditProfile from "./EditProfile.js";
import IP_ADDRESS from "../../ip.js";

const API_URL = "http://" + IP_ADDRESS + ":8000";

const ParentProfile = () => {
    const [editMode, setEditMode] = useState(false);

    const switchEditMode = () => {
        // console.log('switching to edit mode.');
        setEditMode(!editMode);
    };

  return (
    <View style={styles.container}>
      {editMode ?
        <EditProfile onSwitch={switchEditMode} /> :
        <UserProfile onSwitch={switchEditMode} />
    }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //justifyContent: "center",
    // alignItems: "center",
    // padding: 20,
  },
});

export default ParentProfile;
