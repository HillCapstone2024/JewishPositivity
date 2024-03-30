import React, { useState, useRef, useEffect } from "react";
import {
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  Animated,
  Dimensions,
  Image,
  Text,
  Button,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import makeThemeStyle from "./Theme.js";

const { height } = Dimensions.get("window");

const ImageViewer = ({ source, onDelete }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(height)).current;
  const theme = makeThemeStyle();

  // const mediaBoxAnim = useRef(new Animated.Value(0)).current;
  // useEffect(() => {
  //   const loadMediaContainer = () => {
  //     Animated.timing(mediaBoxAnim, {
  //       toValue: count, //final value
  //       duration: 1500, //update value in 500 milliseconds
  //       useNativeDriver: true,
  //     }).start();
  //   };
  //   loadMediaContainer;
  // }, [showMediaBar]);

  const showDeleteModal = () => {
    setIsDeleteModalVisible(true);
    theme["hapticFeedback"] ? null : Haptics.selectionAsync();
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
    theme["hapticFeedback"] ? null : Haptics.selectionAsync();
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
        {/* <View style={styles.centeredView}>
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
        </View> */}
        <TouchableWithoutFeedback
          onPress={() => setIsDeleteModalVisible(false)}
        >
          <View style={styles.centeredView}>
            {/* Prevents the modal content from closing when pressing on it */}
            <TouchableWithoutFeedback>
              <View style={styles.modalView}>
                <Text style={styles.modalText}>
                  Do you want to delete this image?
                </Text>
                <View style={styles.horizontalBar} />
                <TouchableOpacity
                  onPress={() => {
                    onDelete();
                    setIsDeleteModalVisible(false);
                  }}
                >
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
                {/* Removed the Cancel button since pressing off the modal now also acts as cancel */}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
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
    // backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
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
});

export default ImageViewer;
