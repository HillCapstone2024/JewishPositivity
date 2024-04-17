import { Text, Modal, View, TouchableOpacity, TextInput, StyleSheet, Keyboard, FlatList, KeyboardAvoidingView, TouchableWithoutFeedback, Image, RefreshControl, Platform, ScrollView } from 'react-native'
import React, { useState, useEffect } from 'react'
import * as Storage from "../../AsyncStorage.js";
import { PanGestureHandler, State } from 'react-native-gesture-handler';

const BottomPopupJoin = ({ visible, onRequestClose }) => {
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

    const handleCommunityJoin = () => {
        console.log("Joining a community");
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
                <View style={styles.bottomView}>
                    <Text style={styles.joinHeader}>Join a Community</Text>
                    <TextInput placeholder='Community Name' style={styles.input} />
                    <TextInput placeholder='Passcode' style={styles.inputPasscode} />

                    <TouchableOpacity style={styles.joinModal} onPress={handleCommunityJoin}>
                        <Text style={styles.buttonText}>Join</Text>
                    </TouchableOpacity>
                </View>
            </PanGestureHandler>
        </Modal>
    );
};

const BottomPopupCreate = ({ visible, onRequestClose }) => {
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

    const handleCommunityCreate = () => {
        console.log("Create a community");
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
                <View style={styles.bottomView}>
                    <Text style={styles.joinHeader}>Create a Community</Text>
                    <TextInput placeholder='Community Name' style={styles.input} />
                    <TextInput placeholder='Description' multiline={true} scrollEnabled={true} returnKeyType="default" style={styles.inputDesc} />

                    <TextInput placeholder='Passcode' style={styles.inputPasscode} />

                    <TouchableOpacity style={styles.createModal} onPress={handleCommunityCreate}>
                        <Text style={styles.buttonText}>Create</Text>
                    </TouchableOpacity>

                </View>
            </PanGestureHandler>
        </Modal>
    );
};

const Communities = () => {
    const [username, setUsername] = useState("");
    const [joinModalVisible, setJoinModalVisible] = useState(false);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [search, setSearch] = useState("");
    const [communities, setCommunities] = useState([]);
    const [refreshing, setRefreshing] = useState(false);


    const onRefresh = () => {
        //refresh function here
    };

    const renderItem = ({ item, profilepicProp }) => {

        return (
            <TouchableOpacity>
                <View style={styles.row}>
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
                                {item.username}
                            </Text>
                        </View>
                        <View style={styles.msgContainer}>
                            <Text style={styles.msgTxt}>@{item.name}</Text>
                        </View>
                    </View>
                    <View>
                        <TouchableOpacity
                            style={styles.deleteFriendButton}
                            onPress={() => {
                                console.log("delete button pressed.");
                                //add functionality here
                            }}
                        >
                            <Text style={styles.deleteFriendButtonText}>Remove</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };



    useEffect(() => {
        const loadUsername = async () => {
            const storedUsername = await Storage.getItem("@username");
            setUsername(storedUsername || "No username");
        };
        loadUsername();
        setCommunities(prevCommunities => [...prevCommunities, {
            id: communities.length + 1,
            name: 'New Community',
            description: 'Community Description',
            members: [],
        },]);
    }, []);

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <KeyboardAvoidingView
                // behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={[styles.container, theme["background"]]}>
                <TextInput style={styles.search} placeholder='search...' onChangeText={(text) => setSearch(text)}></TextInput>
                <View style={{ flexDirection: "row" }}>
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
                <View style={styles.middleView}>
                    {communities.length === 0 ? (
                        <Text style={styles.noCommunities}>
                            Join or create a community to get started!
                        </Text>) : (
                        <FlatList
                            enableEmptySections={true}
                            data={communities}
                            keyExtractor={(item) => item.name}
                            renderItem={(item) => renderItem(item, item.pic)}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={onRefresh}
                                    testID="refresh-control"
                                />
                            }
                        />
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
        backgroundColor: '#4A90E2',
        borderRadius: 10,
    },
    create: {
        flex: 1,
        alignItems: "center",
        padding: 10,
        margin: 10,
        backgroundColor: 'gold',
        borderRadius: 10,
    },
    buttonText: {
        fontWeight: "bold",
        color: 'white',
        fontSize: 20,
    },
    bottomView: {
        alignItems: "center",
        marginTop: 120,
        flex: 1,
        backgroundColor: 'white',
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
        padding: 35,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
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
        color: "#0066cc",
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

    deleteFriendButton: {
        backgroundColor: "#0066cc",
        padding: 5,
        borderRadius: 5,
        color: "#0066cc",
        flexDirection: "row",
        justifyContent: "center",
    },
    deleteFriendButtonText: {
        // backgroundColor: "blue",
        color: "white",
        fontSize: 12,
        fontWeight: "bold",
        // paddingRight: 16,
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
        margin: 10,
        backgroundColor: '#4A90E2',
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
        backgroundColor: 'gold',
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