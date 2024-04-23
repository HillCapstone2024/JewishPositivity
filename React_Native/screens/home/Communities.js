import { Text, Modal, View, TouchableOpacity, Switch, TextInput, Pressable, StyleSheet, Alert, Dimensions, Keyboard, FlatList, KeyboardAvoidingView, TouchableWithoutFeedback, Image, RefreshControl, Platform, ScrollView } from 'react-native'
import React, { useState, useEffect } from 'react'
import * as FileSystem from "expo-file-system";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import IP_ADDRESS from "../../ip.js";
import * as Storage from "../../AsyncStorage.js";
import * as ImagePicker from "expo-image-picker";
import { PanGestureHandler, State } from 'react-native-gesture-handler';

const layout = Dimensions.get("window");
const API_URL = "http://" + IP_ADDRESS + ":8000";

const BottomPopupJoin = ({ visible, onRequestClose }) => {
    const [communityName, setCommunityName] = useState("")
    const onGestureEvent = (event) => {
        if (event.nativeEvent.translationY > 100) {
            onRequestClose();
        }
    };

    const onHandlerStateChange = (event) => {
        if (event.nativeEvent.oldState === State.ACTIVE) {
            onRequestClose();
        }
    };

    const handleCommunityJoin = async () => {
        try {
            const response = await axios.post(
                `${API_URL}/request_community/`,
                {
                    username: username,
                    community_name: communityName,
                },
                {
                    headers: {
                        "X-CSRFToken": csrfToken,
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                }
            );
            console.log("Join Community Response:", response.data);
        } catch (error) {
            if (error.response.data) {
                console.error("Error Joining Community:", error.response.data);
            }
        }
    }

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onRequestClose}
        >
            <PanGestureHandler
                onGestureEvent={onGestureEvent}
                onHandlerStateChange={onHandlerStateChange}
            >
                <View style={[styles.bottomView, { marginTop: layout.height / 2.8 }]}>
                    <Text style={styles.joinHeader}>Join a Community</Text>
                    <TextInput placeholder='Community Name' onChangeText={(text) => setCommunityName(text)} style={styles.input} />
                    <TouchableOpacity style={styles.joinModal} onPress={handleCommunityJoin}>
                        <Text style={styles.buttonText}>Join</Text>
                    </TouchableOpacity>
                </View>
            </PanGestureHandler>
        </Modal>
    );
};

const BottomPopupCreate = ({ visible, onRequestClose }) => {
    const [communityInfo, setCommunityInfo] = useState({
        community_name: "",
        community_description: "",
        community_photo: "",
        privacy: "",
    });
    const onGestureEvent = (event) => {
        if (event.nativeEvent.translationY > 100) {
            onRequestClose();
        }
    };

    const onHandlerStateChange = (event) => {
        if (event.nativeEvent.oldState === State.ACTIVE) {
            onRequestClose();
        }
    };

    const handleCommunityCreate = async () => {
        const getCsrfToken = async () => {
            try {
                const response = await axios.get(`${API_URL}/csrf-token/`);
                return response.data.csrfToken;
            } catch (error) {
                console.error("Error retrieving CSRF token:", error);
                throw new Error("CSRF token retrieval failed");
            }
        };
        try {
            const csrfToken = await getCsrfToken();
            console.log("Creating a community");
            console.log(`${API_URL}/create_community/`)
            const response = await axios.post(`${API_URL}/create_community/`,
             {
                    username: username,
                    community_name: communityInfo.community_name,
                    community_photo: communityInfo.community_photo,
                    community_description: communityInfo.community_description,
                    privacy: communityInfo.privacy,
                },
                {
                    headers: {
                        "X-CSRFToken": csrfToken,
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                }
            );
            console.log("Created a community", response);

            console.log("create community response:", response.data);
        } catch (error) {
            console.error("error creating community:", error.response.data);
        }
    };

    // const pickMedia = async () => {
    //     let result = await ImagePicker.launchImageLibraryAsync({
    //         mediaTypes: ImagePicker.MediaTypeOptions.Images,
    //         allowsEditing: true,
    //         aspect: [4, 3],
    //         quality: 1,
    //     });

    //     if (!result.cancelled) {
    //         setUpdateProfilePicture(true);
    //         const base64String = await readFileAsBase64(result.assets[0].uri);
    //         setUserInfo(prevUserInfo => ({
    //             ...prevUserInfo,
    //             profilePicture: base64String,
    //         }));
    //     }
    // };

    // const takeMedia = async () => {
    //     const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    //     if (!cameraPermission.granted) {
    //         alert("Permissions to access camera and microphone are required!");
    //         return;
    //     }

    //     let result = await ImagePicker.launchCameraAsync({
    //         mediaTypes: ImagePicker.MediaTypeOptions.Images,
    //         allowsEditing: true,
    //         aspect: [4, 3],
    //         quality: 1,
    //     });

    //     if (result && !result.canceled) {
    //         setUpdateProfilePicture(true);
    //         const base64String = await readFileAsBase64(result.assets[0].uri);
    //         setUserInfo(prevUserInfo => ({
    //             ...prevUserInfo,
    //             profilePicture: base64String,
    //         }));
    //     }
    // };

    const handleEditProfilePicture = () => {
        Alert.alert("Media Type", "", [
            { text: "Camera Roll", onPress: () => pickMedia() },
            { text: "Take Photo", onPress: () => takeMedia() },
            { text: "Cancel", style: "cancel" },
        ]);
    };

    const handlePrivacyAlert = () => {
        Alert.alert("Privacy Setting", 'When the privacy setting is on, users are only able to join by request or invite.', [{ text: 'Ok', style: 'default' }])
    }

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onRequestClose}
        >
            <PanGestureHandler
                onGestureEvent={onGestureEvent}
                onHandlerStateChange={onHandlerStateChange}
            >
                <ScrollView style={[styles.bottomView, { marginTop: 120 }]}>
                    <Text style={styles.joinHeader}>Create a Community</Text>
                    <TouchableOpacity onPress={handleEditProfilePicture} >
                        <View style={styles.profilePicContainer}>
                            <Image
                                style={styles.profilePic}
                            // source={{ uri: `data:image/jpeg;base64,${userInfo?.profilePicture}`, }} 
                            />
                            <View style={styles.cameraIcon}>
                                <Ionicons name="camera" size={24} color="black" />
                            </View>
                        </View>
                    </TouchableOpacity>
                    <TextInput placeholder='Community Name' onValueChange={(text) => setCommunityInfo(prevCommunityInfo => ({ ...prevCommunityInfo, community_name: (text) }))} style={styles.input} />
                    <TextInput placeholder='Description' multiline={true} scrollEnabled={true} returnKeyType="default" onValueChange={(text) => setCommunityInfo(prevCommunityInfo => ({ ...prevCommunityInfo, community_description: (text) }))} style={styles.inputDesc} />
                    <View style={styles.privacy}>
                        <TouchableOpacity
                            onPress={handlePrivacyAlert}
                        >
                            <Text style={styles.privacyText}>Privacy  </Text>
                        </TouchableOpacity>
                        <Switch
                            trackColor={{ false: '#f2f2f2', true: '#4A90E2' }}
                            thumbColor={'#f2f2f2'}
                            onValueChange={() => setCommunityInfo(prevCommunityInfo => ({ ...prevCommunityInfo, privacy: prevCommunityInfo.privacy === "private" ? "public" : "private" }))}
                            value={communityInfo.privacy === "private" ? true : false}
                        />
                    </View>
                    <TouchableOpacity style={styles.createModal} onPress={handleCommunityCreate}>
                        <Text style={styles.buttonText}>Create</Text>
                    </TouchableOpacity>

                </ScrollView>
            </PanGestureHandler>
        </Modal >
    );
};

const Communities = ({ navigation }) => {
    const [username, setUsername] = useState("");
    const [CSRF, setCSRF] = useState("");
    const [joinModalVisible, setJoinModalVisible] = useState(false);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [search, setSearch] = useState("");
    const [communities, setCommunities] = useState([]);
    const [ownedCommunities, setOwnedCommunities] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [invites, setInvites] = useState([])

    const getJoinedCommunities = () => {

    }

    const onRefresh = () => {
        //refresh function here
    };

    const renderCommunity = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => { navigation.navigate("Community", { community: item }); }}>
                <View style={styles.community}>
                    <View style={styles.pic}>
                        {/* <SvgUri style={styles.pic} uri={item.profile_pic} /> */}
                        <Image
                            source={{ uri: `data:Image/jpeg;base64,${item.profile_picture}` }}
                            style={styles.avatar}
                        />
                    </View>
                    <View style={styles.textContainer}>
                        <View style={styles.nameContainer}>
                            <Text
                                style={styles.nameTxt}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {item.name}
                            </Text>
                        </View>
                        <View style={styles.msgContainer}>
                            <Text style={styles.msgTxt}>Members: {Math.floor(item.members.length * Math.random() * 10)}</Text>
                        </View>
                    </View>
                    {/* <View>
                        <TouchableOpacity
                            style={styles.deleteCommunityButton}
                            onPress={() => {
                                
                            }}
                        >
                            <Ionicons name="trash" size={24} color="white" />
                        </TouchableOpacity>
                    </View> */}
                </View>
            </TouchableOpacity>
        );
    };


    const renderInvite = ({ item }) => {
        return (
            <View style={styles.community}>
                <View style={styles.pic}>
                    {/* <SvgUri style={styles.pic} uri={item.profile_pic} /> */}
                    <Image
                        source={{ uri: `data:Image/jpeg;base64,${item.profile_picture}` }}
                        style={styles.avatar}
                    />
                </View>
                <View style={styles.textContainer}>
                    <View style={styles.nameContainer}>
                        <Text
                            style={styles.nameTxt}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {item.name}
                        </Text>
                    </View>
                    <View style={styles.msgContainer}>
                        <Text style={styles.msgTxt}>Members: {Math.floor(item.members.length * Math.random() * 10)}</Text>
                    </View>
                </View>
                <View>
                    <TouchableOpacity
                        style={styles.deleteCommunityButton}
                        onPress={() => { handleAcceptInvite() }}>
                        <Ionicons name="check" size={24} color="white" />
                    </TouchableOpacity>
                </View>
                <View>
                    <TouchableOpacity
                        style={styles.deleteCommunityButton}
                        onPress={() => { handleDeclineInvite() }}>
                        <Ionicons name="x" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };



    useEffect(() => {
        const loadUsernameToken = async () => {
            const storedUsername = await Storage.getItem("@username");
            const storedCSRFToken = await Storage.getItem("@CSRF");
            setUsername(storedUsername || "No username");
            setCSRF(storedCSRFToken || "No CSRF");
        };
        loadUsernameToken();
        setCommunities(prevCommunities => [...prevCommunities, {
            id: communities.length + 1,
            name: 'New Community' + communities.length,
            description: 'Community Description' + communities.length,
            members: ["sef", "dave", "bob", "joe", "jane"],
        },]);
        setInvites(prevCommunities => [...prevCommunities, {
            id: communities.length + 1,
            name: 'New Community' + communities.length,
            description: 'Community Description' + communities.length,
            members: ["sef", "dave", "bob", "joe", "jane"],
        },])
    }, []);

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <KeyboardAvoidingView
                // behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={[styles.container, theme["background"]]}>
                {/* <TextInput style={styles.search} placeholder='search...' onChangeText={(text) => setSearch(text)}></TextInput> */}
                <View style={{ flexDirection: "row", paddingBottom: 10 }}>
                    <TouchableOpacity style={styles.join} onPress={() => setJoinModalVisible(true)}>
                        <Text style={styles.buttonText}>Join</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.create} onPress={() => setCreateModalVisible(true)}>
                        <Text style={styles.buttonText}>Create</Text>
                    </TouchableOpacity>
                    <BottomPopupJoin
                        visible={joinModalVisible}
                        onRequestClose={() => setJoinModalVisible(false)}
                    />
                    <BottomPopupCreate
                        visible={createModalVisible}
                        onRequestClose={() => setCreateModalVisible(false)}
                    />
                </View>
                <View style={{ flex: 1 }}>
                    {invites.length > 0 ? (
                        <>
                            <View style={styles.sectionContainer}>
                                <Text style={styles.sectionTitle}>Invitations</Text>
                                <View style={styles.horizontalLine} />
                            </View>

                            <View style={styles.container}>
                                <View style={[styles.body, { flex: 1 }]}>
                                    <FlatList
                                        enableEmptySections={true}
                                        data={communities}
                                        keyExtractor={(item) => item.name}
                                        renderItem={(item) => renderCommunity(item)}
                                        refreshControl={
                                            <RefreshControl
                                                refreshing={refreshing}
                                                onRefresh={onRefresh}
                                                testID="refresh-control"
                                            />
                                        }
                                    />
                                </View>
                            </View>
                        </>
                    ) : (null)}
                    {communities.length === 0 ? (
                        <Text style={styles.noCommunities}>
                            Join or create a community to get started!
                        </Text>) : (
                        <>
                            <View style={styles.sectionContainer}>
                                <Text style={styles.sectionTitle}>Your Communities</Text>
                                <View style={styles.horizontalLine} />
                            </View>
                            <View style={styles.container}>
                                <View style={[styles.body, { flex: 1 }]}>
                                    <FlatList
                                        enableEmptySections={true}
                                        data={communities}
                                        keyExtractor={(item) => item.name}
                                        renderItem={(item) => renderCommunity(item)}
                                        refreshControl={
                                            <RefreshControl
                                                refreshing={refreshing}
                                                onRefresh={onRefresh}
                                                testID="refresh-control"
                                            />
                                        }
                                    />
                                </View>
                            </View>
                            <View style={styles.sectionContainer}>
                                <Text style={styles.sectionTitle}>Communities you own</Text>
                                <View style={styles.horizontalLine} />
                            </View>
                            <View style={styles.container}>
                                <View style={[styles.body, { flex: 1 }]}>
                                    <FlatList
                                        enableEmptySections={true}
                                        data={communities}
                                        keyExtractor={(item) => item.name}
                                        renderItem={(item) => renderCommunity(item)}
                                        refreshControl={
                                            <RefreshControl
                                                refreshing={refreshing}
                                                onRefresh={onRefresh}
                                                testID="refresh-control"
                                            />
                                        }
                                    />
                                </View>
                            </View>
                        </>

                    )}

                </View>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback >
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    join: {
        flex: 1,
        alignItems: "center",
        padding: 10,
        margin: 10,
        backgroundColor: "#4A90E2",
        borderRadius: 10,
    },
    create: {
        flex: 1,
        alignItems: "center",
        padding: 10,
        margin: 10,
        backgroundColor: "gold",
        borderRadius: 10,
    },
    normalText: {
        fontSize: 20,
        paddingLeft: 5,
    },
    privacy: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
    },
    picture: {
        marginRight: 5,
        fontSize: 20,
    },
    buttonText: {
        fontWeight: "bold",
        color: "white",
        fontSize: 20,
    },
    bottomView: {
        // alignItems: "center",
        flex: 1,
        backgroundColor: "white",
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
        padding: 35,
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    community: {
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
    joinHeader: {
        fontSize: 40,
        fontWeight: "bold",
        marginBottom: 20,
    },
    nameContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: 200,
        // backgroundColor: "yellow",
    },
    msgContainer: {
        flexDirection: "row",
        alignItems: "center",
        // backgroundColor: "red",
    },
    msgTxt: {
        fontWeight: "400",
        color: "#4A90E2",
        fontSize: 12,
        marginLeft: 15,
    },
    input: {
        width: "80%",
        height: 40,
        borderStyle: "solid",
        borderBottomColor: "#e8bd25",
        borderBottomWidth: 2,
        marginBottom: 20,
        paddingHorizontal: 10,
    },

    profilePic: {
        width: 150,
        height: 150,
        borderRadius: 75,
        marginBottom: 20,
        borderWidth: 2,
        borderColor: "#4A90E2",
    },

    cameraIcon: {
        position: "absolute",
        bottom: 10,
        right: 5,
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        padding: 4,
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
        fontSize: 12,
        fontWeight: "600",
        color: "#9e9e9e",
        textTransform: "uppercase",
        letterSpacing: 1.1,
    },

    privacyText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#4A90E2",
        textTransform: "uppercase",
        letterSpacing: 1.1,
    },
    deleteCommunityButton: {
        backgroundColor: "#4A90E2",
        padding: 5,
        borderRadius: 5,
        color: "#4A90E2",
        marginLeft: 60,
    },
    inputDesc: {
        width: "100%",
        minHeight: "10%",
        borderStyle: "solid",
        borderColor: "#e8bd25",
        borderWidth: 2,
        borderRadius: 10,
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    joinModal: {
        alignItems: "center",
        padding: 10,
        paddingHorizontal: 20,
        margin: 10,
        backgroundColor: "#4A90E2",
        borderRadius: 10,
    },
    inputPasscode: {
        width: "80%",
        height: 40,
        borderStyle: "solid",
        borderColor: "#e8bd25",
        borderWidth: 2,
        borderRadius: 10,
        fontWeight: "bold",
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    createModal: {
        alignItems: "center",
        padding: 10,
        margin: 10,
        backgroundColor: "gold",
        borderRadius: 10,
    },
    noCommunities: {
        fontSize: 30,
        fontWeight: "bold",
        textAlign: "center",
        marginTop: 20,
    },
    middleView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    search: {
        alignSelf: "center",
        width: "95%",
        height: 40,
        borderColor: "grey",
        borderWidth: 1,
        borderRadius: 10,
        // fontWeight: "bold",
        marginBottom: 10,
        paddingHorizontal: 10,
    },
});

export default Communities;