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
import * as Storage from "../../AsyncStorage.js";
import SpinningPen from "../greet/Pen.js";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

export default function ViewCommunity({ route, navigation }) {
    const [communityInfo, setCommunityInfo] = useState({});
    const [username, setUsername] = useState("");
    const [members, setMembers] = useState([]);
    const [numMembers, setNumMembers] = useState(0);
    const [expanded, setExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isHapticFeedbackEnabled, setIsHapticFeedbackEnabled] = useState(false);
    const { community } = route.params;
    const community_name = community.community_name;
    const community_desc = community.community_description;
    const community_photo = community.community_photo;
    const owner = community.owner_id;
    const date_created = community.date_created;

    const dateObject = new Date(date_created);
    const formattedDate = dateObject.toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });


    const handlePressBio = () => {
      setExpanded(!expanded);
    };

    useEffect(() => {
        initializeData();
    }, []);

    const initializeData = async () => {
        setIsLoading(true);
        const storedUsername = await Storage.getItem("@username");
        console.log("community view getting data");
        // console.log('community:', community)
        let membersList = await getCommunityMembers();
        membersList = membersList.map((user) => user.username);
        const retrievedProfilepics = await fetchProfilePics(membersList);
        setMembers(retrievedProfilepics);
        setNumMembers(membersList.length);
        setUsername(storedUsername);
        console.log('members', members.data);
        setIsLoading(false);
    };

    // const getCsrfToken = async () => {
    // try {
    //     const response = await axios.get(`${API_URL}/csrf-token/`);
    //     return response.data.csrfToken;
    // } catch (error) {
    //     console.error("Error retrieving CSRF token:", error);
    //     throw new Error("CSRF token retrieval failed");
    // }
    // };

    const getHapticFeedback = async () => {
      try {
        const hapticFeedbackEnabled = await Storage.getItem('@hapticFeedbackEnabled');
        if (hapticFeedbackEnabled === 'true') {
          setIsHapticFeedbackEnabled(true);
        } else {
          setIsHapticFeedbackEnabled(false);
        }
      } catch (e) {
        console.log(e);
      }
    };
    getHapticFeedback();

    const handleLeave = () => {

        const sendLeaveRequest = async () => {
            try {
                // const csrfToken = await getCsrfToken();
                const csrfToken = await Storage.getItem("@CSRF");
                const response = await axios.post(
                `${API_URL}/delete_user_from_community/`,
                {
                    username: username,
                    community_name: community_name,
                },
                {
                    headers: {
                    "X-CSRFToken": csrfToken,
                    "Content-Type": "application/json",
                    },
                    withCredentials: true,
                }
                );
                console.log("leave community response: ", response);
                navigation.goBack();
            } catch(error) {
                console.log("error leaving community:", error);
            }
        };

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


    const getCommunityMembers = async () => {
        try {
            // const csrfToken = await getCsrfToken();
            const csrfToken = await Storage.getItem("@CSRF");
            const response = await axios.get(
              `${API_URL}/get_users_in_community/`,
              {
                params: {
                  community_name: community_name,
                },
              }
            );
            console.log("response of members:", response.data);
            const memberList = response.data;
            return memberList;
        } catch (error) {
            console.log("error fetching community members:", error);
        return [];
        }
    };

      const fetchProfilePics = async (friends) => {
        if (friends.length < 1) {
          return [];
        }
        console.log("getting profile pics for ", friends);
        try {
          // const csrfToken = await getCsrfToken();
          const csrfToken = await Storage.getItem("@CSRF");
          const response = await axios.get(
            `${API_URL}/profile_pictures_view/`,
            {
              params: {
                username_list: friends,
              },
            }
          );
          console.log("got profile pic success!");
          return response.data;
        } catch (error) {
          console.log("Error retrieving profile pics:", error);
          throw new Error("profile pic retreival failed");
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
          </View>
        </View>
      </TouchableOpacity>
    );
  };


    return (
      <View style={styles.container}>
        {/* displaying community info */}
        <View style={styles.communityInfoSection}>
          <Image
            source={{ uri: `data:Image/jpeg;base64,${community_photo}` }}
            style={styles.communityPicture}
          />
          <View style={styles.belowPicture}>
            <View style={styles.communityNameContainer}>
              <Text style={styles.communityName}>{community_name}</Text>
            </View>
            <View style={styles.communityInfo}>
              <Text style={styles.communityInfoText}>Owner: {owner}</Text>
              <Text style={styles.communityInfoText}>
                Since: {formattedDate}
              </Text>
            </View>
            <View style={styles.communityInfoBio}>
              <Text style={styles.communityInfoText}>About:</Text>
              <TouchableOpacity onPress={handlePressBio}>
                <Text
                  style={styles.communityInfoText}
                  numberOfLines={expanded ? undefined : 2}
                >
                  {community_desc}
                </Text>
              </TouchableOpacity>
            </View>
            {/* members list */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}> Members({numMembers})</Text>
              <View style={styles.horizontalLine} />
            </View>
            <View style={styles.memberSection}>
              {isLoading ? (
                <View style={styles.loadingStyle}>
                  <SpinningPen loadingText="Loading Members" />
                </View>
              ) : (
                <FlatList
                  enableEmptySections={true}
                  data={members}
                  keyExtractor={(item) => item.username}
                  renderItem={(item) => renderItem(item)}
                />
              )}
            </View>
            {/* leave button */}
            <View>
              <Pressable
                style={styles.leaveButton}
                onPress={ () => { handleLeave(); isHapticFeedbackEnabled ? Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium) : null; }}
              >
                <Text style={styles.redText}> Leave Community </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // padding: 20,
    backgroundColor: "#4A90E2",
    paddingTop: 50,
    // height: "100%"
  },
  communityNameContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  communityName: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    color: "#4A90E2",
  },
  belowPicture: {
    backgroundColor: "#ececf6",
    // flex: 1,
    borderTopEndRadius: 75,
    borderTopStartRadius: 75,
    padding: 10,
    paddingTop: 80,
    marginTop: -80,
    alignContent: "center",
    height: "100%",
  },
  communityInfoSection: {
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    // backgroundColor: "white"
    // zIndex: 1,
  },
  communityInfo: {
    flexDirection: "row",
    // backgroundColor: "red",
    justifyContent: "space-between",
    width: "100%",
    margin: 10,
  },
  communityInfoText: {
    color: "#4A90E2",
  },
  communityInfoBio: {
    width: "100%",
    marginHorizontal: 10,
  },
  communityPicture: {
    width: 160,
    height: 160,
    borderRadius: 80,
    zIndex: 1,
  },
  memberSection: {
    height: "50%",
    // backgroundColor: "red",
  },
  loadingStyle: {
    marginTop: 50,
    // backgroundColor: "red",
  },
  sectionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 5,
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
    alignContent: "center",
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
    marginHorizontal: 15,
  },
  redText: {
    color: "red",
    fontSize: 20,
    justifyContent: "center",
    alignSelf: "center",
  },

  //user row styling
  textContainer: {
    // flexDirection: "row",
    // justifyContent: "space-between",
  },
  nameContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
    // backgroundColor: "yellow",
  },
  nameTxt: {
    marginLeft: 15,
    fontWeight: "600",
    color: "#4A90E2",
    fontSize: 14,
    width: 170,
  },
  msgContainer: {
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor: "red",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#DCDCDC",
    // backgroundColor: "#fff",
    // borderBottomWidth: 1,
    padding: 5,
    marginHorizontal: 15,
    // justifyContent: "space-between",
  },
  pic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
});