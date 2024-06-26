import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
} from "react-native";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import makeThemeStyle from "./Theme.js";

const { height } = Dimensions.get("window");

const RecordingViewer = ({ source, onDelete, style }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackInstance, setPlaybackInstance] = useState(null);
    const [duration, setDuration] = useState(0);
    const [position, setPosition] = useState(0);
    const slideAnim = useRef(new Animated.Value(height)).current;
    const theme = makeThemeStyle();
//   const [sound, setSound] = useState();

  const playbackInstanceRef = useRef(null);

  useEffect(() => {
    setupAudio();
    return () => {
      if (playbackInstanceRef.current) {
        playbackInstanceRef.current.unloadAsync();
      }
    };
  }, []);

  const setupAudio = async () => {
    const { sound } = await Audio.Sound.createAsync(
      { uri: source },
      { shouldPlay: false },
      updatePlaybackStatus
    );
    playbackInstanceRef.current = sound;
    setPlaybackInstance(sound);
  };

  const updatePlaybackStatus = (status) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis);
      if (status.didJustFinish) {
        setIsPlaying(false);
        playbackInstanceRef.current.setPositionAsync(0); // Reset position to start
      }
    }
  };

  const handlePlayPausePress = async () => {
    if (playbackInstance) {
      if (isPlaying) {
        await playbackInstance.pauseAsync();
      } else {
        await playbackInstance.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

    const showDeleteModal = () => {
      setModalVisible(true);
      theme["hapticFeedback"] ? null : Haptics.selectionAsync();
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    };

  // Convert milliseconds to mm:ss format
  const formatTime = (millis) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
  };

    return (
      <View
        style={[
          styles.container,
          style
        ]}
      >
          <View style={styles.timerContainer}>
            {isPlaying ? (
              <Text style={styles.timer}>
                {" "}
                {formatTime(duration - position)}{" "}
              </Text>
            ) : (
              <Text style={[styles.timer, { color: "white" }]}>Audio</Text>
            )}
          </View>
          <TouchableOpacity
            onPress={handlePlayPausePress}
            onLongPress={() => {
              if (onDelete) {
              showDeleteModal();
              }
            }}
          >
            {isPlaying ? (
              <Ionicons
                name="stop-circle"
                color={"white"}
                size={style.width / 2}
              />
            ) : (
              <Ionicons
                name="play-circle"
                color={"white"}
                size={style.width / 2}
              />
            )}
          </TouchableOpacity>

        {/* Delete Media Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.centeredView}>
              {/* Prevents the modal content from closing when pressing on it */}
              <TouchableWithoutFeedback>
                <View style={styles.modalView}>
                    <View style={styles.editDeleteContainer}>
                      <Text style={styles.modalText}>
                        Do you want to delete this recording?
                      </Text>
                      <View style={styles.horizontalBar} />
                      {/* Delete button */}
                      <TouchableOpacity 
                        onPress={() => {
                          onDelete();
                          setModalVisible(false);
                        }}
                      >
                        <Text style={styles.deleteText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4A90E2",
    // backgroundColor: "pink",
    // width: 60,
    // height: 60,
    paddingBottom: 6,
    // borderTopLeftRadius: 5,
    // borderTopRightRadius: 5,
    // borderColor: "#4A90E2",
    // borderWidth: 2,
  },
  playPauseButton: {
    fontSize: 20,
    color: "blue",
  },
  timer: {
    // marginTop: 10,
    fontSize: 10,
    color: "white",
  },
  modalText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
  },
  centeredView: {
    flex: 1,
    justifyContent: "flex-end",
    // alignItems: "center",
    marginBottom: 20,
  },
  horizontalBar: {
    height: 1,
    width: "100%",
    backgroundColor: "#ccc",
    margin: 15,
  },
  editDeleteContainer: {
    marginBottom: 20,
    marginHorizontal: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  deleteText: {
    color: "red",
    fontSize: 18,
  },
});

export default RecordingViewer;