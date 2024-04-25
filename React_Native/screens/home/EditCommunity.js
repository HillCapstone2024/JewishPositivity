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
import { TextInput } from "react-native-gesture-handler";

export default function EditCommunity({ route, navigation }) {
    const [communityInfo, setCommunityInfo] = useState({});
    const [username, setUsername] = useState("");
    const [members, setMembers] = useState([]);
    const [numMembers, setNumMembers] = useState(0);
    const [expanded, setExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { community } = route.params;
    const community_name = community.community_name;
    const origingal_community_name = community.community_name; //store name before user changes
    const community_desc = community.community_description;
    const community_photo = community.community_photo;
    const owner = community.owner_id;
    const date_created = community.date_created;
    const [loadingSubmit, setLoadingSubmit] = useState(false);


    const dateObject = new Date(date_created);
    const formattedDate = dateObject.toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });

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

const deleteCommunity = async () => {
    //pass in community Id
    //view 'delete_community/'
};

const handleUpdateCommunity = async () => {
    setLoadingSubmit(true);
    //update community logic here
    setLoadingSubmit(false);
    navigateManageView();
};


const handlePressBio = () => {
    setExpanded(!expanded);
};

const navigateManageView = () => {
    navigation.navigate("Communities");
}


const getCommunityMembers = async () => {
    try {
    const csrfToken = await getCsrfToken();
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
      const csrfToken = await getCsrfToken();
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

  const getCsrfToken = async () => {
    try {
        const response = await axios.get(`${API_URL}/csrf-token/`);
        return response.data.csrfToken;
    } catch (error) {
        console.error("Error retrieving CSRF token:", error);
        throw new Error("CSRF token retrieval failed");
    }
    };

    
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


const deleteUserFromCommunity = async (deleteUser) => {
    //pass in username, and community name
    //view ''delete_user_from_community/'
    Alert.alert(
        `Are you sure you want to delete ${deleteUser} from this community?`,
        `${deleteUser}'s reflections will no longer be viewable in the community tab and they may need an invite to rejoin.`,
        [
            {
                text: "Cancel",
                onPress: () => console.log("Cancel Pressed"),
                style: styles.alertCancelText,
            },
            {
                text: "Delete",
                onPress: () => deleteMember(),
                style: styles.alertDeleteText,
            }
        ]
    );


    const deleteMember = async () => {
        console.log("deleting:", deleteUser);
        try {
            //get csrf token
            const response = await axios.post(`${API_URL}/delete_user_from_community/`, 
            {
                username: deleteUser,
                community_name: community_name,
            },
            {
                headers:
                {
                    "X-CSRFToken": csrfToken,
                    "Content-Type": "application/json",
                },
                withCredentials: true,
            });
            console.log("response:", response);
            //reload the page
        } catch(error) {
            console.log("error deleting community", error);
        }
    }
};

return (
    <View style={styles.container}>
      {/* displaying community info */}
      <View style={styles.communityInfoSection}>
        <Image
          source={{ uri: `data:Image/jpeg;base64,${community_photo}` }}
          style={styles.communityPicture}
        />
        <View style={styles.cameraIcon}>
            <Ionicons name="camera" size={24} color="black" />
        </View>
        <View style={styles.belowPicture}>
        <View style={styles.topBar}>
            <View style={{ flexDirection: "row", width: "80%" }}>
                <TouchableOpacity
                onPress={navigateManageView}>
                <View style={styles.buttonContent}>
                    <Ionicons name="caret-back" size={25} color="#4A90E2" />
                    <Text style={styles.cancelText}>Cancel</Text>
                </View>
                </TouchableOpacity>
            </View>

            {loadingSubmit ? (
                <View style={styles.ActivityIndicator}>
                <ActivityIndicator />
                </View>
            ) : (
                <TouchableOpacity
                style={styles.submitButton}
                onPress={handleUpdateCommunity}
                >
                <Text
                    style={styles.submitText}
                >
                    Submit
                </Text>
                </TouchableOpacity>
            )}
            </View>
          <View style={styles.community_nameContainer}>
            <TextInput style={styles.community_name}>{community_name}</TextInput>
          </View>
          <View style={styles.communityInfo}>
            <Text style={styles.communityInfoText}>Owner: {owner}</Text>
            <Text style={styles.communityInfoText}>
              Since: {formattedDate}
            </Text>
          </View>
          <View style={styles.communityInfoBio}>
            <TextInput style={styles.communityInfoText}>About:</TextInput>
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
          {/* delete button */}
          <View>
            <Pressable
              style={styles.leaveButton}
              onPress={() => {
                deleteCommunity();
              }}
            >
              <Text style={styles.redText}> Delete Community </Text>
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
      cameraIcon: {
        position: "absolute",
        bottom: 10,
        right: 5,
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        padding: 4,
      },
      buttonContent: {
        flexDirection: "row",
        alignItems: "center",
        fontSize: 19,
      },
      cancelText: {
        fontSize: 19,
        color: "#4A90E2",
      },
      topBar: {
        flexDirection: "row",
        marginTop: 5,
        marginRight: 15,
        justifyContent: "space-between",
        alignItems: "center",
      },
      submitButton: {},
      ActivityIndicator: {
        marginRight: 20
      },
      submitText: {
        color: "#4A90E2",
        fontSize: 19,
      },
      community_nameContainer: {
        justifyContent: "center",
        alignItems: "center",
      },
      community_name: {
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
      },
      row: {
        flexDirection: "row",
        alignItems: "center",
        borderColor: "#DCDCDC",
        padding: 5,
        marginHorizontal: 15,
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
