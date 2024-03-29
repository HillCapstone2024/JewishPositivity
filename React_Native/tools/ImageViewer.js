import React, { useState, useRef } from "react";
import {
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  Animated,
  Dimensions,
  Image,
  Text,
  Button
} from "react-native";

const { height } = Dimensions.get("window"); // Get the screen height

const ImageViewer = ({ source, onDelete }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(height)).current; // Start off-screen

  const showDeleteModal = () => {
    setIsDeleteModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const hideDeleteModal = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 150,
      useNativeDriver: true,
    }).start(() => setIsDeleteModalVisible(false));
  };

    const showModal = () => {
      setIsModalVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    };

    const hideModal = () => {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 150,
        useNativeDriver: true,
      }).start(() => setIsModalVisible(false));
    };

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback
        onPress={showModal}
        onLongPress={showDeleteModal}
      >
        <Image source={{ uri: source }} style={styles.triggerImage} />
      </TouchableWithoutFeedback>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isDeleteModalVisible}
        onRequestClose={() => setIsDeleteModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              Do you want to delete this image?
            </Text>
            <View style={styles.horizontalBar} />
            <Button
              title="Delete"
              style={styles.deleteText}
              onPress={() => {
                onDelete();
                setIsDeleteModalVisible(false);
              }}
            />
            <View style={styles.horizontalBar} />
            <Button
              title="Cancel"
              onPress={() => setIsDeleteModalVisible(false)}
            />
          </View>
        </View>
      </Modal>
      <Modal
        visible={isModalVisible}
        transparent={true}
        onRequestClose={hideModal}
      >
        <TouchableWithoutFeedback onPress={hideModal}>
          <Animated.View
            style={[
              styles.fullScreenContainer,
              {
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Image source={{ uri: source }} style={styles.fullScreenImage} />
          </Animated.View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  trigger: {
    borderRadius: 5,
    elevation: 3, // for Android shadow
    shadowColor: "#000", // for iOS shadow
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  triggerImage: {
    width: 60,
    height: 60,
    borderTopEndRadius: 5,
    borderTopStartRadius: 5,
  },
  fullScreenContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  fullScreenImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  centeredView: {
    flex: 1,
    justifyContent: "flex-end",
    // alignItems: "center",
    marginTop: 22,
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
  },
  deleteText: {
    color: "red",
  },
  horizontalBar: {
    height: 1,
    width: "100%",
    backgroundColor: "#ccc",
    // marginTop: 15,
    // borderWidth: 2,
  },
});

export default ImageViewer;
