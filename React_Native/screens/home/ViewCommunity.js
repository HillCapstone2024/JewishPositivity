import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Button,
  Image,
  Dimensions,
  Modal,
  Pressable,
  TouchableWithoutFeedback,
  RefreshControl,
  FlatList
} from "react-native";
import axios from "axios";
const API_URL = "http://" + IP_ADDRESS + ":8000";
import IP_ADDRESS from "../../ip.js";
import { Video, Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";

export default function ViewCommunity({ communityName }) {
    const [communityInfo, setCommunityInfo] = useState({});
    const [members, setMembers] = useState([]);
    const [numMembers, setNumMembers] = useState(0);
    const [expanded, setExpanded] = useState(false);

    const handlePressBio = () => {
      setExpanded(!expanded);
    };

    useEffect(() => {
        console.log("community view getting data");
        const membersList = getCommunityMembers();
        setMembers(membersList);

    }, []);

    const getCsrfToken = async () => {
    try {
        const response = await axios.get(`${API_URL}/csrf-token/`);
        return response.data.csrfToken;
    } catch (error) {
        console.error("Error retrieving CSRF token:", error);
        throw new Error("CSRF token retrieval failed");
    }
    };

    const handleLeave = () => {

        const sendLeaveRequest = () => {

        }
        Alert.alert(
          "Leave Community",
          "Are you sure you want to leave this community?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Leave",
              style: "destructive",
              onPress: () => sendLeaveRequest(),
            },
          ]
        );
    };

    const getCommunityInfo = (communityName) => {

    };

    const getCommunityMembers = async () => {
        try {
            const csrfToken = await getCsrfToken();
            const response = await axios.get(`${API_URL}/get_friend_info/`, {
                params: {
                username: 'admin',
                },
            });
            console.log("response of members:", response.data);
            const memberList = response.data;
            return memberList;
        } catch (error) {
            console.log("error fetching community members:", error);
        return [];
        }
    };

    const leaveCommunity = () => {
        //LEAVE COMMUNITY LOGIC BELOW
    }



  const renderItem = ({ item }) => {
    // Check if the user is already a friend

    return (
      <TouchableOpacity>
        <View style={styles.row}>
          <View style={styles.pic}>
            {/* <SvgUri style={styles.pic} uri={item.profile_pic} /> */}
            <Image
              source={{ uri: `data:Image/jpeg;base64,${item.profile_picture}` }}
              style={styles.pic}
            />
          </View>
          <View style={styles.textContainer}>
            <View style={styles.nameContainer}>
              <Text
                style={styles.nameTxt}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.username}
              </Text>
            </View>
            <View style={styles.msgContainer}>
              <Text style={styles.msgTxt}>@{item.username}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };


    return (
      <ScrollView style={styles.container}>
        {/* displaying community info */}
        <View style={styles.communityInfoSection}>
          <Image
            source={require("../../assets/images/profile_background.png")}
            style={styles.communityPicture}
          />
          {/* <View style={styles.belowPicture}> */}
            <Text style={styles.communityName}>Community Name</Text>
            <View style={styles.communityInfo}>
              <Text style={styles.communityInfoText}>Owner: John Doe</Text>
              <Text style={styles.communityInfoText}>Since: January 2020</Text>
            </View>
            <View style={styles.communityInfoBio}>
              <Text style={styles.bioLabel}>About Community:</Text>
              <TouchableOpacity onPress={handlePressBio}>
                <Text
                  style={styles.bioText}
                  numberOfLines={expanded ? undefined : 2}
                >
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat.
                </Text>
              </TouchableOpacity>
            </View>
            {/* members list */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}> Members(0)</Text>
              <View style={styles.horizontalLine} />
            </View>
            <View style={styles.memberSection}>
              <FlatList
                enableEmptySections={true}
                data={members}
                keyExtractor={(item) => item.username}
                renderItem={(item) => renderItem(item)}
              />
            </View>
            {/* leave button */}
            <View>
                <Pressable
                style={styles.leaveButton}
                onPress={() => {
                  handleLeave();
                }}
              >
                <Text style={styles.redText}> Leave Community </Text>
              </Pressable>
            </View>
          </View>
        {/* </View> */}
      </ScrollView>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  communityName: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  belowPicture: {
    backgroundColor: "blue",
    flex: 1,
    borderTopEndRadius: 15,
    borderTopStartRadius: 15,
  },
  communityInfoSection: {
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
  },
  communityInfo: {
    flexDirection: "row",
    // backgroundColor: "red",
    justifyContent: "space-between",
    width: "100%",
    margin: 10,
  },
  communityInfoText: {},
  communityInfoBio: {
    width: "100%",
    marginHorizontal: 10,
  },
  communityPicture: {
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  memberSection: {
    height: "80%",
    backgroundColor: "red",
  },
  sectionContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  horizontalLine: {
    flex: 1,
    height: 1.25,
    backgroundColor: "#9e9e9e",
    marginLeft: 8, // Adjust spacing between title and line
  },
  sectionTitle: {
    paddingVertical: 12,
    fontSize: 12,
    fontWeight: "600",
    color: "#9e9e9e",
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  leaveButton: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    marginBottom: 12,
    paddingLeft: 12,
    paddingRight: 12,
    shadowColor: "#4A90E2", // Updated shadow color
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  redText: {
    color: "red",
    fontSize: 20,
  },
});