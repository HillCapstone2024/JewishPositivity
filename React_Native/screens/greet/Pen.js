import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import makeThemeStyle from "../../tools/Theme.js";

const SpinningPen = ({ width = 180, height = 204 }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const spinValue = useRef(new Animated.Value(0)).current;
  const wobbleAnim = useRef(new Animated.Value(0)).current;
  const theme = makeThemeStyle();

  useEffect(() => {
    const spin = Animated.timing(spinValue, {
      toValue: 1,
      duration: 1000,
      easing: Easing.elastic(1),
      useNativeDriver: true,
    });

    const wobble = Animated.loop(
      Animated.sequence([
        Animated.timing(wobbleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(wobbleAnim, {
          toValue: -1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(wobbleAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );

    const float = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 75,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 75,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );

    Animated.sequence([spin]).start(() => {
      wobble.start();
      float.start();
    });
  }, [floatAnim, spinValue, wobbleAnim]);

  const wobble = wobbleAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ["8deg", "15deg"],
  });

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["100deg", "360deg"],
  });

  return (
    <View style={[styles.container]}>
      {/* Removed the notebook image */}
      <Animated.Image
        style={[
          {
            transform: [
              { translateX: floatAnim },
              { rotate: spin },
              { rotateZ: wobble },
            ],
          },
          styles.pen,
        ]}
        source={require("../../assets/images/new_pen.png")} // Ensure this path is correct
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    // alignItems: "center",
    marginLeft: "40%"
  },
  pen: {
    width: 13, // Adjust the width as needed
    height: 100, // Adjust the height as needed
  },
  // Removed 'book' styles since the notebook is no longer part of this component
});

export default SpinningPen;
