import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
} from "react-native";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";

const RecordingViewer = ({ uri, onDelete, dimensions }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackInstance, setPlaybackInstance] = useState(null);
    const [duration, setDuration] = useState(0);
    const [position, setPosition] = useState(0);
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
      { uri },
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
          { height: dimensions.height, width: dimensions.width },
        ]}
        // onLongPress={setModalVisible(true)}
      >
        {/* <TouchableWithoutFeedback onPress={handlePlayPausePress}> */}
          <View style={styles.timerContainer}>
            {isPlaying ? (
              <Text style={styles.timer}>
                {formatTime(duration - position)}
              </Text>
            ) : (
              <Text style={[styles.timer, { color: "white" }]}>Audio</Text>
            )}
          </View>
          <TouchableOpacity
            onPress={handlePlayPausePress}
            // onLongPress={setModalVisible(true)}
          >
            {isPlaying ? (
              <Ionicons
                name="stop-circle"
                color={"white"}
                size={dimensions.width / 2}
              />
            ) : (
              <Ionicons
                name="play-circle"
                color={"white"}
                size={dimensions.width / 2}
              />
            )}
          </TouchableOpacity>
        {/* </TouchableWithoutFeedback> */}



        {/* Delete Media Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.centeredView}>
              <TouchableWithoutFeedback>
                <View style={styles.modalView}>
                  <Text style={styles.modalText}>
                    Do You Want to DELETE This Recording?
                  </Text>
                  <View style={styles.horizontalBar} />
                  <TouchableOpacity
                    onPress={() => {
                      // onDelete();
                      setModalVisible(false);
                    }}
                  >
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
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
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
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
    marginBottom: 15,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
  },
  deleteText: {
    color: "red",
    fontSize: 16,
    marginVertical: 10,
  },
  horizontalBar: {
    height: 1,
    width: "90%",
    backgroundColor: "#ccc",
    // marginTop: 15,
    // borderWidth: 2,
  },
});

export default RecordingViewer;