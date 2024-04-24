import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing, Text } from "react-native";
import makeThemeStyle from "../../tools/Theme.js";

const SpinningPen = ({ width = 180, height = 204, loadingText="Loading" }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const spinValue = useRef(new Animated.Value(0)).current;
  const wobbleAnim = useRef(new Animated.Value(0)).current;
  const dotOpacity1 = useRef(new Animated.Value(0)).current;
  const dotOpacity2 = useRef(new Animated.Value(0)).current;
  const dotOpacity3 = useRef(new Animated.Value(0)).current;
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
    const animateDots = Animated.loop(
      Animated.sequence([
        Animated.timing(dotOpacity1, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(dotOpacity2, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(dotOpacity3, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(300),
        Animated.parallel([
          Animated.timing(dotOpacity1, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dotOpacity2, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dotOpacity3, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    Animated.sequence([spin]).start(() => {
      wobble.start();
      float.start();
      animateDots.start();
    });
  }, [floatAnim, spinValue, wobbleAnim, dotOpacity1, dotOpacity2, dotOpacity3]);

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
      <View style={styles.textContainer}>
        <Text style={styles.loadingText}>{loadingText}</Text>
        <View style={styles.dotContainer}>
          <Animated.Text style={[styles.dot, { opacity: dotOpacity1 }]}>.</Animated.Text>
          <Animated.Text style={[styles.dot, { opacity: dotOpacity2 }]}>.</Animated.Text>
          <Animated.Text style={[styles.dot, { opacity: dotOpacity3 }]}>.</Animated.Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // marginLeft: "40%",
    // backgroundColor: "red",
    padding: 10,
  },
  pen: {
    width: 13, // Adjust the width as needed
    height: 100, // Adjust the height as needed
    // justifyContent: "center",
    marginRight: "20%",
  },
  textContainer: {
    flexDirection: "row",
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A90E2",
  },
  dotContainer: {
    flexDirection: "row",
  },
  dot: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A90E2",
  },
  // Removed 'book' styles since the notebook is no longer part of this component
});

export default SpinningPen;
