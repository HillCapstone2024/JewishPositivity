// CustomVideoComponent.js
import React, { useState, useRef } from "react";
import {
  Modal,
  View,
  Button,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Text,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Video, ResizeMode } from "expo-av";
import makeThemeStyle from "./Theme.js";

const VideoViewer = ({ mediaUri, onDelete, dimensions }) => {
  const videoRef = useRef(null);
  const [modalVisible, setModalVisible] = useState(false);
  const theme = makeThemeStyle();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.fullSize}
        onLongPress={() => {
          setModalVisible(true);
          theme["hapticFeedback"] ? null : Haptics.selectionAsync();
        }}
        activeOpacity={1} // Keep the video appearance normal on press
      >
        <Video
          source={{ uri: mediaUri }}
          playsInSilentModeIOS={true}
          useNativeControls
          ref={videoRef}
          style={[styles.video, {height: dimensions.height, width: dimensions.width}]}
          controls={true}
          resizeMode={ResizeMode.COVER}
          onError={(e) => console.log("video error", e)}
          onTouchEnd={() => videoRef.current?.presentFullscreenPlayer()}
          // Include other video props as needed
        />
      </TouchableOpacity>

      {/* Delete Media Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.centeredView}>
            <TouchableWithoutFeedback>
              <View style={styles.modalView}>
                <Text style={styles.modalText}>
                  Do you want to delete this video?
                </Text>
                <View style={styles.horizontalBar} />
                <TouchableOpacity
                  onPress={() => {
                    onDelete();
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
    // flex: 1,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  fullSize: {
    width: "100%",
    // height: "100%",
  },
  video: {
    // width: "100%",
    // height: 60, // Set a fixed height or make it dynamic as needed
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  centeredView: {
    flex: 1,
    justifyContent: "flex-end",
    // alignItems: "center",
    marginBottom: 20,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    paddingTop: 35,
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
  // Add other styles if necessary
});

export default VideoViewer;
