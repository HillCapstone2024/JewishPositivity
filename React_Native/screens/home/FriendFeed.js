import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from "react-native";
import { Video } from "expo-av";
import VideoViewer from "../../tools/VideoViewer.js";
import ImageViewer from "../../tools/ImageViewer.js";
import axios from "axios";
const API_URL = "http://" + IP_ADDRESS + ":8000";
import IP_ADDRESS from "../../ip.js";
import * as Storage from "../../AsyncStorage.js";
import RecordingViewer from "../../tools/RecordingViewer.js";
import ViewCheckIn from "./ViewCheckIn.js";
import LoadingScreen from "../greet/Loading.js";
import SpinningPen from "../greet/Pen.js";
import * as FileSystem from "expo-file-system";

const FriendFeed = () => {
  const [username, setUsername] = useState();
  const [posts, setPosts] = useState([]);
  const [friends, setFriends] = useState([]);
  const [profilePicMap, setProfilePicMap] = useState({});
  const [video, setVideo] = useState({});
  const [contentLoading, setContentLoading] = useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [showViewCheckIn, setShowViewCheckIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [noFriends, setNoFriends] = useState(false);
  const [noPosts, setNoPosts] = useState(false);
  const videoRefs = useRef({});

  const slideAnimFlatList = useRef(new Animated.Value(-800)).current; // Initial position for FlatList
  const slideAnimScrollView = useRef(new Animated.Value(-800)).current; // Initial position for ScrollView

  const saveBase64Video = async (base64String, checkin_id) => {
    console.log("reached file function");
    const filename = FileSystem.documentDirectory + checkin_id + "downloadedVideo.mp4";
    await FileSystem.writeAsStringAsync(filename, base64String, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return filename; // This is a URI that can be used in the app
  };

  const initializeData = async () => {
    try {
      setIsLoading(true);
      const storedUsername = await Storage.getItem("@username");
      setUsername(storedUsername);
      console.log('username is', storedUsername);

      const csrfToken = await getCsrfToken();
      const friendsList = await fetchFriendsList(storedUsername, csrfToken);
      console.log('friends list', friendsList);
      // if (friendsList.length > 0) {
      // console.log('you have friends!');
      const entries = await fetchEntries(friendsList, csrfToken);
      console.log('entries:', entries.length);
          // if (entries.length >= 1) {
      const map = await fetchProfilePics(friendsList, csrfToken);

      const updatedPosts = entries.map((post) => ({
        ...post,
        profilepic: map[post.username] || "default_pic_base64",
      }));

      //updated all states at once to prevent rerenders and 'flickers'
      setPosts(updatedPosts);
      setFriends(friendsList);
      setProfilePicMap(map);
      // setNoPosts(true);

      // setNoFriends(true);
      setIsLoading(false);
      setContentLoading(false);
      if (friendsList.length < 1) {
        setNoFriends(true);
      } else if (entries.length < 1) {
        setNoPosts(true);
      }
    } catch (error) {
      console.error("Initialization failed:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    if (!isLoading && !contentLoading) {
      Animated.parallel([
        Animated.spring(slideAnimScrollView, {
          toValue: 0,
          useNativeDriver: true,
          speed: 1,
          bounciness: 1,
        }),
        Animated.spring(slideAnimFlatList, {
          toValue: 0,
          useNativeDriver: true,
          speed: 1,
          bounciness: 1,
        }),
      ]).start();
    }
  }, [isLoading, contentLoading]);

  const onRefresh = React.useCallback(() => {
    console.log("friends list on refresh: ", friends);
    setRefreshing(true);
    // fetchEntries();
    initializeData();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
    // setRefreshing(false);
  }, []);

  const loadUsername = async () => {
    const storedUsername = await Storage.getItem("@username");
    setUsername(storedUsername || "No username");
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

  const fetchFriendsList = async (username) => {
    try {
      const csrfToken = await getCsrfToken();
      const response = await axios.get(`${API_URL}/get_friend_info/`, {
        params: {
          username: username,
        },
      });
      // console.log("response of friends:", response);
      const friendsList = response.data
        .filter((item) => item.status === true)
        .map((item) => item.username);
      // console.log("friends list: ", friendsList);
      return friendsList;
    } catch (error) {
      console.log("error fetching friends:", error);
    }
  };

  const fetchEntries = async (friends) => {
    // console.log("friends list being sent: ", friends);
    if (friends.length < 1) {
      return [];
    }
    try {
      const csrfToken = await getCsrfToken();
      const response = await axios.get(`${API_URL}/get_todays_checkin_info/`, {
        params: {
          username: friends,
        },
      });
      // setPosts(response.data);
      // setContentLoading(false);
      return response.data;
    } catch (error) {
      console.log("Error retrieving friends check in entries:", error);
      // setContentLoading(false);
      throw new Error("Check in entries failed");
    }
  };

  const handleGetVideo = async (checkin_id) => {
    console.log("getting video for check num:", checkin_id);
    try {
      const csrfToken = await getCsrfToken();
      const response = await axios.get(`${API_URL}/get_video_info/`, {
        params: {
          checkin_id: checkin_id,
        },
      });
      // console.log(response.data);
      const videoUri = await saveBase64Video(response.data, checkin_id);
      console.log("got video success:", videoUri);

      setVideo((prevVideos) => ({
        ...prevVideos,
        [checkin_id]: videoUri,
      }));
      // setVideo(videoUri);
      // videoUriRef.current = videoUri;
      videoRefs.current[checkin_id] = videoUri;
      console.log(videoRefs.current);
      return response.data;
    } catch (error) {
      console.log("Error retrieving video:", error);
      throw new Error("video retreival failed");
    }
  };

  const fetchProfilePics = async (friends) => {
    if (friends.length < 1) {
      return {};
    };
    console.log("getting profile pics for ", friends);
    try {
      const csrfToken = await getCsrfToken();
      const response = await axios.get(`${API_URL}/profile_pictures_view/`, {
        params: {
          username_list: friends,
        },
      });
      // setProfilePics(response.data);
      console.log("got profile pic success!");
      const map = {};
      response.data.forEach((pic) => {
        map[pic.username] = pic.profile_picture;
      });

      return map;
    } catch (error) {
      console.log("Error retrieving profile pics:", error);
      throw new Error("profile pic retreival failed");
    }
  };

  const Moment = ({ moment_number }) => {
    if (moment_number === 1) {
      return <Text style={styles.postMomentType}>Modeh Ani - Gratitude: </Text>;
    } else if (moment_number === 2) {
      return <Text style={styles.postMomentType}>Ashrei - Happiness: </Text>;
    } else if (moment_number === 3) {
      return <Text style={styles.postMomentType}>Shema - Reflection: </Text>;
    }
  };

  const flatListRef = useRef(null);

  const UserListItem = ({ user, profilepic }) => (
    <View style={styles.userItem} testID={`usernameList-${user}`}>
      <Image
        source={{ uri: `data:Image/mp4;base64,${profilepic}` }}
        style={styles.avatar}
      />
      <Text
        style={styles.statusUserName}
        ellipsizeMode="tail"
        numberOfLines={1}
      >
        {user}
      </Text>
    </View>
  );

  const VideoPost = React.memo(({ video, post }) => {
    //implement this code later to prevent an entire page rerender
    //the rerender is ugly and causes a flicker with the images
    //also later on it would be a good idea to have video be a dictionary
    //so multiple videos can be loaded at once
    const handlePress = useCallback(() => {
      handleGetVideo(post.checkin_id);
    }, [post.checkin_id]);

    return (
      <View style={[styles.video, { marginBottom: 20 }]}>
        {video ? (
          <VideoViewer
            source={video}
            style={{ height: 100, width: 100, borderRadius: 5 }}
          />
        ) : (
          <TouchableOpacity
            onPress={
              handlePress
            }
          >
            <Image
              source={{ uri: `data:Image/mp4;base64,${post?.content}` }}
              style={styles.postImage}
            />
            {/* <Text>load video</Text> */}
          </TouchableOpacity>
        )}
      </View>
    );
  }, (prevProps, nextProps) => {
    return prevProps.video === nextProps.video && prevProps.post.checkin_id === nextProps.post.checkin_id;
  });

  const PostCard = ({ post }) => {
    const truncateText = (text, maxLength) => {
      if (text.length > maxLength) {
        return text.substring(0, maxLength) + "...";
      }
      return text;
    };
    return (
      <View>
        <View style={styles.postCard}>
          <View style={styles.postHeaderBar}>
            {/* note profile picture would replace logo image below */}
            <Image
              source={{ uri: `data:Image/mp4;base64,${post.profilepic}` }}
              style={styles.postAvatar}
            />
            <Text style={styles.postUsername}>{post.username}</Text>
            <Text style={styles.postDate}>{post.date}</Text>
          </View>

          {post.content_type === "image" && (
            <View
              style={[styles.postImage, { marginBottom: 10 }]}
              testID={`image-${post.checkin_id}`}
              key={`image-${post.checkin_id}`}
            >
              <Image
                source={{ uri: `data:image/jpeg;base64,${post?.content}` }}
                style={styles.postImage}
              />
            </View>
          )}
          {post.content_type === "video" && (
            <View
              style={[styles.video, { marginBottom: 10 }]}
              testID={`video-${post.checkin_id}`}
              key={`video-${post.checkin_id}`}
            >
              {video[post.checkin_id] ? (
                <VideoViewer
                  source={video[post.checkin_id]}
                  style={{ aspectRatio: 1, width: "100%"}}
                />
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    handleGetVideo(post.checkin_id);
                  }}
                >
                  <Image
                    source={{ uri: `data:Image/mp4;base64,${post?.content}` }}
                    style={styles.postImage}
                  />
                </TouchableOpacity>
              )}
            </View>
            // <VideoPost uri={videoUriRef} post={post} />
          )}
          {post.content_type === "recording" && (
            <View
              style={styles.audioContainer}
              testID={`recording-${post.checkin_id}`}
              key={`recording-${post.checkin_id}`}
            >
              <RecordingViewer
                source={`data:audio/mp3;base64,${post.content}`}
                style={{ height: 60, width: 60, borderRadius: 5 }}
              />
            </View>
          )}
          
          {post.text_entry && 
            <Text style={styles.postDescription}>
              <Moment moment_number={post.moment_number}/>
              {truncateText(post.text_entry, 100)}
            </Text>
          }

        </View>
      </View>
    );
  };

  // if (isLoading) {
  //   return <LoadingScreen styleProp={styles.loadingStyle}/>;
  // }

  return (
    <View 
      style={[
        styles.container,
        paddingBottom=300,
        theme["background"],
      ]}
      > 
      {isLoading && contentLoading ? (
        // <ActivityIndicator style={{ height: 100, width: 100 }} />
        <View testID="loading-screen" style={styles.loadingStyle}>
          {/* <LoadingScreen /> */}
          <SpinningPen loadingText="Loading Friend's Daily Check-ins"/>
        </View>
      ) : (
        <View>
          <View style={styles.userList}>
            <Animated.ScrollView
              horizontal
              style={[
                styles.scrollView,
                {
                  transform: [{ translateX: slideAnimScrollView }],
                },
              ]}
            >
              <View style={styles.userContainer}>
                {friends.map((user) => (
                  <UserListItem
                    key={user.id}
                    user={user}
                    profilepic={profilePicMap[user]}
                  />
                ))}
              </View>
            </Animated.ScrollView>
          </View>
          
          <ScrollView 
            contentContainerStyle={styles.scrollViewContent}
            refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  testID="refresh-control"
                />
              }>
            {noFriends && (
              <View>
                <Text style={styles.Message}>Add friends to see their posts!</Text>
              </View>
            )}
            {noPosts && (
              <View>
                <Text style={styles.Message}>Be the first to post!</Text>
              </View>
            )}
            <Animated.FlatList
              testID={"flat-list"}
              data={posts}
              ref={flatListRef}
              contentContainerStyle={styles.postListContainer}
              keyExtractor={(post) => post.checkin_id.toString()}
              renderItem={({ item }) => <PostCard post={item} />}
              
              style={{
                transform: [{ translateY: slideAnimFlatList }],
              }}
          />
          </ScrollView>
            
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingStyle: {
    // width: 20,
    // height: 20,
    // alignContent: "center",
    marginTop: 200,
    // backgroundColor: "red",
    justifyContent: "center"
  },
  scrollViewContent: {
    paddingBottom: "20%",
  },
  container: {
    // flex: 1,
    // paddingTop: 60,
    paddingBottom: "25%",
    height: "100%",
    // backgroundColor: "red",
  },
  userContainer: {
    flexDirection: "row",
    padding: 10,
    height: 80,
    width: "100%",
  },
  userList: {
    width: "100%",
    backgroundColor: "#4A90E2",
  },
  userItem: {
    marginRight: 10,
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  statusUserName: {
    marginTop: 5,
    fontSize: 10,
    color: "white",
    width: 60,
    textAlign: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    // borderWidth: 1,
    // borderColor: "black",
  },
  postListContainer: {
    // paddingTop: 20,
    // marginTop: 30,
    // paddingHorizontal: 15,
    height: "87%",
    // backgroundColor: "red",
  },
  postCard: {
    marginBottom: 10,
    paddingBottom: 10,
    backgroundColor: "#f2f2f2",
    // borderRadius: 5,
  },
  postHeaderBar: {
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  postAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  postUsername: {
    flex: 1,
    color: "#4A90E2",
  },
  postDate: {
    fontSize: 12,
    color: "#4A90E2",
  },
  postDescription: {
    paddingHorizontal: 10,
  },
  postMomentType: {
    paddingTop: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
  postImage: {
    width: "100%",
    aspectRatio: 1,
  },
  postFooter: {
    flexDirection: "row",
    marginTop: 10,
  },
  postButton: {
    marginRight: 10,
  },
  postButtonText: {
    color: "#808080",
  },
  video: {
    // flexDirection: "row",
  },
  Message: {
    fontSize: 24,
    textAlign: "center",
    textAlignVertical: "center",
    marginTop: 200,
  }
});

export default FriendFeed;
