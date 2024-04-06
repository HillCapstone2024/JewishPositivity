import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Video, Audio } from "expo-av";
import VideoViewer from "../../tools/VideoViewer.js";
import ImageViewer from "../../tools/ImageViewer.js";
import axios from "axios";
import { Button } from "react-native-elements";
const API_URL = "http://" + IP_ADDRESS + ":8000";
import IP_ADDRESS from "../../ip.js";
import * as Storage from "../../AsyncStorage.js";
import * as FileSystem from "expo-file-system";
import { Buffer } from "buffer";
import RecordingViewer from "../../tools/RecordingViewer.js";

const FriendFeed = () => {
  const [username, setUsername] = useState();
  const [posts, setPosts] = useState([]);
  const [friends, setFriends] = useState([]);
  const [video, setVideo] = useState(null);
  const [lastScrollPosition, setLastScrollPosition] = useState(0);
  const [timeoutId, setTimeoutId] = useState(null);
  const [scrollLoading, setScrollLoading] = useState(true);

  // const base64ToImage = async (base64String, fileName) => {
  //   // Expo's FileSystem expects a URI, so we need to convert the base64 to a binary format
  //   console.log('reached base to image');
  //   const buffer = Buffer.from(base64String, "base64");

  //   // Determine the directory to save the file, such as FileSystem.documentDirectory
  //   const fileUri = FileSystem.documentDirectory + fileName;

  //   try {
  //     await FileSystem.writeAsStringAsync(fileUri, buffer.toString("base64"), {
  //       encoding: FileSystem.EncodingType.Base64,
  //     });
  //     console.log(`Image saved to: ${fileUri}`);
  //     return fileUri; // Return the file URI in case you want to use it later
  //   } catch (error) {
  //     console.error("Couldn't save the image", error);
  //   }
  // };
  useEffect(() => {
    const loadUsername = async () => {
      const storedUsername = await Storage.getItem("@username");
      setUsername(storedUsername || "No username");
    };

    loadUsername();
  }, []);

  useEffect(() => {
    getFriends();
  }, [username]);

  useEffect(() => {
    // console.log("now we will fetch check ins.");
    handleGetEntries();
  }, [friends]);

  const getCsrfToken = async () => {
    try {
      const response = await axios.get(`${API_URL}/csrf-token/`);
      return response.data.csrfToken;
    } catch (error) {
      console.error("Error retrieving CSRF token:", error);
      throw new Error("CSRF token retrieval failed");
    }
  };

  const getFriends = async () => {
    try {
      const csrfToken = await getCsrfToken();
      const response = await axios.get(`${API_URL}/get_friend_info/`, {
        params: {
          username: username,
        },
      });
      console.log("response of friends:", response);
      const friendsList = response.data
        .filter((item) => item.status === true)
        .map((item) => item.username);
      console.log("friends list: ", friendsList);
      setFriends(friendsList);
    } catch (error) {
      console.log("error fetching friends:", error);
    }
  };

  const handleGetEntries = async () => {
    console.log("friends list being sent: ", friends);
    try {
      const csrfToken = await getCsrfToken();
      const response = await axios.get(`${API_URL}/get_todays_checkin_info/`, {
        params: {
          username: friends,
        },
      });
      setPosts(response.data);
      setScrollLoading(false);
      return response.data;
    } catch (error) {
      // console.log("Error retrieving check in entries:", error);
      setScrollLoading(false);
      throw new Error("Check in entries failed");
    }
  };

  const handleGetVideo = async (checkin_id) => {
    try {
      const csrfToken = await getCsrfToken();
      const response = await axios.get(`${API_URL}/get_video_info/`, {
        params: {
          checkin_id: checkin_id,
        },
      });
      setVideo(response.data);
      console.log('got video success!');
      return response.data;
    } catch (error) {
      console.log("Error retrieving video:", error);
      throw new Error("video retreival failed");
    }
  };

  const Moment = ({ moment_number }) => {
    if (moment_number === 1) {
      return <Text>Modeh Ani</Text>;
    } else if (moment_number === 2) {
      return <Text>Ashrei</Text>;
    } else if (moment_number === 3) {
      return <Text>Shema</Text>;
    }
  };

  const flatListRef = useRef(null);

  const handleScroll = (event) => {
    const y = event.nativeEvent.contentOffset.y;
    if (y === 0 && !timeoutId) {
      const id = setTimeout(() => {
        setScrollLoading(true);
        console.log("Held at the top!");
        handleGetEntries();
      }, 200000); // Adjust the hold time as needed
      setTimeoutId(id);
    }
  };

  const handleTouchEnd = () => {
    console.log("ended touch");
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  };

  const UserListItem = ({ user }) => (
    <View style={styles.userItem}>
      <Image
        source={require("../../assets/images/notebookPen.png")}
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

  const PostCard = ({ post }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeaderBar}>
        {/* note profile picture would replace logo image below */}
        <Image
          source={require("../../assets/images/notebookPen.png")}
          style={styles.postAvatar}
        />
        <Text style={styles.postUsername}>{post.username}</Text>
        <Text style={styles.postDate}>{post.date}</Text>
      </View>
      <Moment moment_number={post.moment_number} />
      <Text style={styles.postHeader}>{post.header}</Text>
      {post.content_type === "image" && (
        <View style={[styles.JournalEntryModalImage, { marginBottom: 20 }]}>
          <ImageViewer
            source={`data:Image/mp4;base64,${post?.content}`}
            // dimensions={{ height: 100, width: 100 }}
            style={styles.JournalEntryModalImage}
          />
        </View>
      )}
      {post.content_type === "video" && (
        <View style={styles.videoContainer}>
          {/* <VideoViewer
            source={`data:video/mp4;base64,${post.content}`}
            style={{ height: 100, width: 60 }}
          /> */}
          <TouchableOpacity
            onPress={() => {
              handleGetVideo(post?.checkin_id);
            }}
          >
            {/* later instead of text video this would be the video thumbnail */}
            <Text>get video</Text>
          </TouchableOpacity>
          {video ? <VideoViewer source={video} /> : null}
          {video !== null ? <Text>showing video</Text> : null}
        </View>
      )}
      {post.content_type === "recording" && (
        <View style={styles.audioContainer}>
          <RecordingViewer
            source={`data:audio/mp3;base64,${post.content}`}
            style={{ height: 60, width: 60, borderRadius: 5 }}
          />
        </View>
      )}
      {post.text_entry && <Text>{post.text_entry}</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.userList}>
        <ScrollView horizontal>
          <View style={styles.userContainer}>
            {friends.map((user) => (
              <UserListItem key={user.id} user={user} />
            ))}
          </View>
        </ScrollView>
      </View>
      {scrollLoading ? <ActivityIndicator /> : null}

      <FlatList
        data={posts}
        ref={flatListRef}
        contentContainerStyle={styles.postListContainer}
        keyExtractor={(post) => post.checkin_id}
        renderItem={({ item }) => <PostCard post={item} />}
        // onScroll={handleScroll}
        // onTouchEnd={handleTouchEnd} // Clear the timeout when touch ends
        // scrollEventThrottle={16}
      />
      {/* <Button onPress={getFriends} title={"get friends"}>
        Get friends
      </Button> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // paddingTop: 60,
    paddingBottom: 100,
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
  },
  postListContainer: {
    paddingTop: 20,
    // marginTop: 30,
    paddingHorizontal: 15,
    // height: "100%"
  },
  postCard: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
  },
  postHeaderBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
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
  postHeader: {
    fontSize: 16,
    // color: "#00008B",
    fontWeight: "bold",
  },
  postImage: {
    marginTop: 10,
    width: "100%",
    height: 200,
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
  JournalEntryModalImage: {
    // width: "100%",
    width: 100,
    aspectRatio: 1,
    borderRadius: 5,
  },
});

export default FriendFeed;
