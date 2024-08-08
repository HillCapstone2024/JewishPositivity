import React, { useState, useRef } from "react";
import { View, Text, Modal, StyleSheet, Dimensions, Animated, PanResponder, TouchableOpacity, } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const windowHeight = Dimensions.get("window").height;

const CheckInModal = ({ onClose, visible, navigation }) => {
  const [checkInType, setCheckInType] = useState("");
  const translateY = useRef(new Animated.Value(windowHeight)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (_, gestureState) => {
        return gestureState.y0 < 30;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
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
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: windowHeight,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [visible, translateY, windowHeight]);

  const handlePress = (message) => {
    console.log(message);
  };

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
          ]}
          {...panResponder.panHandlers}
        >

          <View style={styles.dragIndicator}>
            <View style={styles.dragIndicatorInner} />
          </View>

          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>What are you checking in for?</Text>
          </View>

          <View style={[styles.contentContainer, { height: windowHeight * 0.4 }]}>
            <TouchableOpacity 
              style={styles.pressableBox} 
              onPress={() => {
                const type = "ModehAni";
                setCheckInType(type);
                console.log("CheckInModal Passing:", type);
                navigation.navigate('CheckIn', { checkInType: type });
                onClose();
              }}
            >
              <Text style={styles.pressableText}>Modeh Ani - Gratitude</Text>
              <Ionicons name="chevron-forward-circle-outline" style={styles.iconStyling} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.pressableBox} 
              onPress={() => {
                const type = "Ashrei";
                setCheckInType(type);
                console.log("CheckInModal Passing:", type);
                navigation.navigate('CheckIn', { checkInType: type }); 
                onClose();
              }}
            >
              <Text style={styles.pressableText}>Ashrei - Happiness</Text>
              <Ionicons name="chevron-forward-circle-outline" style={styles.iconStyling}/>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.pressableBox} 
              onPress={() => {
                const type = "Shema";
                setCheckInType(type);
                console.log("CheckInModal Passing:", type);
                navigation.navigate('CheckIn', { checkInType: type });
                onClose();
              }}
            >
              <Text style={styles.pressableText}>Shema - Reflection</Text>
              <Ionicons name="chevron-forward-circle-outline" style={styles.iconStyling} />
            </TouchableOpacity>
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
    backgroundColor: "white",
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
  titleContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  titleText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  contentContainer: {
    padding: 20,
  },
  pressableBox: {
    height: 80,
    padding: 10,
    marginVertical: 5,
    alignItems: "center",
    borderRadius: 5,
    flexDirection: "row",
    justifyContent: "space-between",

    backgroundColor: "#f2f2f2",
    shadowColor: "#4A90E2",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  }, 
  pressableText: {
    fontSize: 20,
    color: "#4A90E2",
  },
  iconStyling: {
    fontSize: 32, 
    color: "#4A90E2",
  },
});

export default CheckInModal;
