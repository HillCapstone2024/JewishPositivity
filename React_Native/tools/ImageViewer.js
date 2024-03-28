import React, { useState, useRef } from "react";
import {
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  Animated,
  Dimensions,
  Image,
} from "react-native";

const { height } = Dimensions.get("window"); // Get the screen height

const ImageViewer = ({ source }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(height)).current; // Start off-screen

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
      <TouchableWithoutFeedback onPress={showModal}>
        <View style={styles.trigger}>
          <Image
            source={{ uri: source }}
            style={styles.triggerImage}
            // width={height}
          />
        </View>
      </TouchableWithoutFeedback>

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
            <Image
              source={{ uri: source }}
              style={styles.fullScreenImage}
            />
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
    width: 50,
    height: 50,
    // borderRadius: 5,
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
});

export default ImageViewer;
