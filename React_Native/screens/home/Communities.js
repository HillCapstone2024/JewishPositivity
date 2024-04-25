import { Text, Modal, View, TouchableOpacity, Switch, TextInput, Pressable, ActivityIndicator, StyleSheet, Alert, Dimensions, Keyboard, FlatList, KeyboardAvoidingView, TouchableWithoutFeedback, Image, RefreshControl, Platform, ScrollView } from 'react-native'
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

const BottomPopupJoin = ({ visible, onRequestClose, username, CSRF }) => {
    const [communityName, setCommunityName] = useState("")
    const [activity, setActivity] = useState(null)

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
        setActivity(
            <ActivityIndicator />
        )
        try {
            const response = await axios.post(
                `${API_URL}/request_community/`,
                {
                    username: username,
                    community_name: communityName.trim(),
                },
                {
                    headers: {
                        "X-CSRFToken": CSRF,
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                }
            );
            console.log("Join Community Response:", response.data);
            onRequestClose();
            setActivity(null);
            return Alert.alert(`You're now apart of the ${communityName} community!`);
        } catch (error) {
            setActivity(null);
            if (error.response.data) {
                console.error("Error Joining Community:", error.response.data);
                onRequestClose();
                return Alert.alert(error.response.data);
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

                    <View style={styles.dragIndicatorJoin}>
                        <View style={styles.dragIndicatorInner} />
                    </View>
                    <Text style={styles.joinHeader}>Join a Community</Text>
                    <TextInput placeholder='Community Name' placeholderTextColor={'#858585'} onChangeText={(text) => setCommunityName(text)} style={styles.input} />
                    {activity}
                    <TouchableOpacity style={styles.joinModal} onPress={handleCommunityJoin}>
                        <Text style={styles.buttonText}>Join</Text>
                    </TouchableOpacity>
                </View>
            </PanGestureHandler>
        </Modal>
    );
};

const BottomPopupCreate = ({ visible, onRequestClose, username, CSRF }) => {
    const [communityName, setCommunityName] = useState('');
    const [communityDescription, setCommunityDescription] = useState('');
    const [communityPhoto, setCommunityPhoto] = useState('');
    const [privacy, setPrivacy] = useState('public');
    const [activity, setActivity] = useState(null)

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
        setActivity(
            <ActivityIndicator />
        )
        try {
            console.log("Creating a community");
            const response = await axios.post(`${API_URL}/create_community/`,
                {
                    username: username,
                    community_name: communityName,
                    community_photo: communityPhoto,
                    community_description: communityDescription,
                    privacy: privacy,
                },
                {
                    headers: {
                        "X-CSRFToken": CSRF,
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                }
            );
            console.log("create community response:", response.data);
            onRequestClose();
            setActivity(null);
            setCommunityName('');
            setCommunityDescription('');
            setCommunityPhoto('');
            setPrivacy('public');
            return Alert.alert(`The ${communityName} community has been created!`)
        } catch (error) {
            console.error("error creating community:", error.response.data);
        }
    };


    async function readFileAsBase64(uri) {
        try {
            const base64Content = await FileSystem.readAsStringAsync(uri, {
                encoding: FileSystem.EncodingType.Base64,
            });
            return base64Content;
        } catch (error) {
            console.error("Failed to read file as base64", error);
            return null;
        }
    }

    const pickMedia = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            const base64String = await readFileAsBase64(result.assets[0].uri);
            setCommunityPhoto(base64String);
        }
    };

    const takeMedia = async () => {
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
        if (!cameraPermission.granted) {
            alert("Permissions to access camera and microphone are required!");
            return;
        }

        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (result && !result.canceled) {
            const base64String = await readFileAsBase64(result.assets[0].uri);
            setCommunityPhoto(base64String);
        }
    };

    const handleEditProfilePicture = () => {
        Alert.alert("Media Type", "", [
            { text: "Camera Roll", onPress: () => pickMedia() },
            { text: "Take Photo", onPress: () => takeMedia() },
            { text: "Cancel", style: "cancel" },
        ]);
    };

    const handlePrivacyAlert = () => {
        Alert.alert("Privacy Setting", 'When the privacy setting is set to on, users may only join via request or invite.', [{ text: 'Ok', style: 'default' }])
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
                <View style={styles.createContainer}>
                    <View style={styles.dragIndicatorCreate}>
                        <View style={styles.dragIndicatorInner} />
                    </View>
                    <ScrollView keyboardDismissMode={'interactive'} style={[styles.bottomView, { marginTop: 100 }]}>
                        <Text style={styles.joinHeader}>Create a Community</Text>
                        <TouchableOpacity onPress={handleEditProfilePicture} >
                            <View style={styles.profilePicContainer}>
                                <Image
                                    style={styles.profilePic}
                                    source={{ uri: `data:image/jpeg;base64,${communityPhoto}`, }}
                                />
                                <View style={styles.cameraIcon}>
                                    <Ionicons name="camera" size={24} color="black" />
                                </View>
                            </View>
                        </TouchableOpacity>
                        <TextInput
                            placeholder='Community Name'
                            onChangeText={(text) => setCommunityName(text)}
                            value={communityName}
                            style={styles.input}
                        />
                        <TextInput
                            placeholder='Description'
                            multiline={true}
                            returnKeyType="default"
                            onChangeText={(text) => setCommunityDescription(text)}
                            value={communityDescription}
                            style={styles.inputDesc}
                        />
                        <View style={styles.privacy}>
                            <TouchableOpacity
                                onPress={handlePrivacyAlert}
                            >
                                <Text style={styles.privacyText}>Privacy</Text>
                            </TouchableOpacity>
                            <Switch
                                trackColor={{ false: '#f2f2f2', true: '#4A90E2' }}
                                thumbColor={'#f2f2f2'}
                                onValueChange={() => setPrivacy(privacy === "private" ? "public" : "private")}
                                value={privacy === "private" ? true : false}
                            />
                        </View>
                        {activity}
                        <TouchableOpacity style={styles.createModal} onPress={handleCommunityCreate}>
                            <Text style={styles.buttonText}>Create</Text>
                        </TouchableOpacity>

                    </ScrollView>
                </View>
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
    const [refreshingJoined, setRefreshingJoined] = useState(false);
    const [refreshingOwned, setRefreshingOwned] = useState(false);
    const [refreshingInvites, setRefreshingInvites] = useState(false);
    const [invites, setInvites] = useState([])

    const getJoinedCommunities = async (storedUsername) => {
        setRefreshingJoined(true);
        let CommunitiesJoinedRetrieved = await Storage.getItem("@CommunitiesJoined")
        if (CommunitiesJoinedRetrieved !== null) {
            CommunitiesJoinedRetrieved = await JSON.parse(CommunitiesJoinedRetrieved);
            setCommunities(CommunitiesJoinedRetrieved);
        }
        try {
            console.log(`getting communities ${storedUsername} is apart of`)
            const response = await axios.get(
                `${API_URL}/get_user_community_info/`,
                {
                    params: {
                        username: storedUsername,
                    }
                }
            );
            if (CommunitiesJoinedRetrieved != response.data) {
                await Storage.setItem("@CommunitiesJoined", JSON.stringify(response.data));
                setCommunities(response.data);
            }
            setRefreshingJoined(false);
            console.log("Succesfully retrieved communities user is apart of");
        } catch (error) {
            setRefreshingJoined(false);
            if (error.response.data) {
                console.error("Error Getting Communities that user is apart of:", error.response.data);
            }
        }
    }

    const getOwnedCommunities = async (storedUsername) => {
        setRefreshingOwned(true);
        let CommunitiesOwnedRetrieved = await Storage.getItem("@CommunitiesOwned");
        if (CommunitiesOwnedRetrieved !== null) {
            CommunitiesOwnedRetrieved = await JSON.parse(CommunitiesOwnedRetrieved);
            setOwnedCommunities(CommunitiesOwnedRetrieved);
        }
        try {
            console.log(`getting owned communities for ${storedUsername}`);
            const response = await axios.get(
                `${API_URL}/get_owner_community_info/`,
                {
                    params: { username: storedUsername }
                }
            );
            if (CommunitiesOwnedRetrieved !== response.data) {
                await Storage.setItem("@CommunitiesOwned", JSON.stringify(response.data));
                setOwnedCommunities(response.data);
            }
            setRefreshingOwned(false);
            console.log("Succesfully retrieved communities user owns");
        } catch (error) {
            if (error.response.data) {
                console.error("Error Getting Communities that user owns:", error.response.data);
            }
        }
    }


    const renderCommunity = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => { navigation.navigate("ViewCommunity", { community: item }); }}>
                <View style={styles.community}>
                    <View style={styles.pic}>
                        {/* <SvgUri style={styles.pic} uri={item.profile_pic} /> */}
                        <Image
                            source={{ uri: `data:Image/jpeg;base64,${item.community_photo}` }}
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
                                {item.community_name}
                            </Text>
                        </View>
                        <View style={styles.msgContainer}>
                            <Text style={styles.msgTxt}>Members: 10</Text>
                        </View>
                    </View>

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
                        source={{ uri: `data:Image/jpeg;base64,${item.community_photo}` }}
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
                            {item.community_name}
                        </Text>
                    </View>
                </View>
                <View>
                    <TouchableOpacity
                        style={styles.deleteCommunityButton}
                        onPress={() => { handleAcceptInvite }}>
                        <Ionicons name="checkmark" size={24} color="white" />
                    </TouchableOpacity>
                </View>
                <View>
                    <TouchableOpacity
                        style={styles.deleteCommunityButton}
                        onPress={() => { handleDeclineInvite }}>
                        <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    async function refreshAll() {
        // getInvitations(username);
        getJoinedCommunities(username);
        getOwnedCommunities(username);
    }

    const initializeData = async () => {
        console.log(`initializing community data`)
        const storedUsername = await Storage.getItem("@username");
        setUsername(storedUsername)
        const storedCSRF = await Storage.getItem("@CSRF");
        setCSRF(storedCSRF);
        console.log(`username: ${storedUsername}`);
        console.log(`CSRF: ${storedCSRF}`);
        await Storage.setItem("@CommunitiesJoined", "")
        getJoinedCommunities(storedUsername);
        getOwnedCommunities(storedUsername);
    }

    useEffect(() => {
        initializeData();
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
                        username={username}
                        CSRF={CSRF}
                    />
                    <BottomPopupCreate
                        visible={createModalVisible}
                        onRequestClose={() => setCreateModalVisible(false)}
                        username={username}
                        CSRF={CSRF}
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
                                        renderItem={(item) => renderInvite(item)}
                                        refreshControl={
                                            <RefreshControl
                                                refreshing={refreshingInvites}
                                                onRefresh={getInvitations}
                                                testID="refresh-control"
                                            />
                                        }
                                    />
                                </View>
                            </View>
                        </>
                    ) : (null)}
                    {communities.length === 0 ? (
                        <>
                            <Text style={styles.noCommunities}>
                                Join or create a community to get started!
                            </Text>
                            <TouchableOpacity onPress={refreshAll} style={styles.refresh}>
                                <Text style={styles.buttonText}>Check for communities</Text>
                                <Text >This is a temp button in case the communities aren't properly retrieved at first</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
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
                                                refreshing={refreshingJoined}
                                                onRefresh={() => getJoinedCommunities(username)}
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
                                        data={ownedCommunities}
                                        keyExtractor={(item) => item.name}
                                        renderItem={(item) => renderCommunity(item)}
                                        refreshControl={
                                            <RefreshControl
                                                refreshing={refreshingOwned}
                                                onRefresh={() => getOwnedCommunities(username)}
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
    refresh: {
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
        paddingBottom: 10,
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
        height: 70,
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
        marginBottom: 100,
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
    dragIndicatorJoin: {
        justifyContent: "center",
        alignItems: "center",
        zIndex: 5,
        borderTopColor: "#ccc",
    },
    dragIndicatorCreate: {
        top: 137,
        height: 30,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 5,
        borderTopColor: "#ccc",
    },
    dragIndicatorInner: {
        width: 50,
        height: 5,
        backgroundColor: "#ccc",
        borderRadius: 5,
    },
    createContainer: {
        flex: 1,
    },
    pic: {
        width: 50,
        height: 50,
        borderRadius: 25,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
    },
});

export default Communities;