import React, { useRef } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  TouchableOpacity,
} from "react-native";
import makeThemeStyle from "../../tools/Theme.js";
import CheckIn from "./CheckIn";

const windowHeight = Dimensions.get("window").height;

const JournalModal = ({ onClose, onSubmit, visible }) => {
  const translateY = useRef(new Animated.Value(windowHeight)).current;
  theme = makeThemeStyle();

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (_, gestureState) => {
        // Allow pan responder activation only if the gesture starts from the top bar
        return gestureState.y0 < 30; // Adjust this value according to your top bar height
      },
      onPanResponderMove: (_, gestureState) => {
        // Update translateY value based on gesture movement
        translateY.setValue(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        // Handle release of pan responder
        if (gestureState.dy > windowHeight * 0.3) {
          onClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  React.useEffect(() => {
    if (visible) {
      // Animate modal in
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      // Animate modal out
      Animated.timing(translateY, {
        toValue: windowHeight,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [visible, translateY, windowHeight]);

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <Animated.View
          style={[
            styles.bottomSheetContainer,
            { transform: [{ translateY: translateY }] },
            theme["background"],
          ]}
          //{...panResponder.panHandlers} // Pass panHandlers only to the Animated.View
        >
          <TouchableOpacity style={(theme["background"], styles.dragIndicator)}>
            <View style={styles.dragIndicatorInner} />
          </TouchableOpacity>
          <View
            style={[styles.contentContainer, { height: windowHeight * 0.9 }]}
          >
            <CheckIn handleCancel={onClose} handleSubmitClose={onSubmit} />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  bottomSheetContainer: {
    // backgroundColor: 'white',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    overflow: "hidden",
  },
  dragIndicator: {
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  dragIndicatorInner: {
    width: 50,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 5,
  },
  contentContainer: {
    // padding: 20,
  },
});

export default JournalModal;
