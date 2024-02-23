import React from "react";
import {
    View,
    StyleSheet,
    Image,
    Animated,
    Easing,
    Text,
    TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const words1 = [["Practice ", "Gratitude"],
["Share", "Positivity"],
["Spread", "Kindness"],
["Foster", "Unity"],
["Engage in your", "Community"]]

spinValue = new Animated.Value(0);

Animated.loop(
    Animated.timing(
        this.spinValue,
        {
            toValue: 1,
            duration: 3000,
            easing: Easing.elastic(1), // Easing is an additional import from react-native
            useNativeDriver: true  // To make use of native driver for performance
        }
    )).start()

// Next, interpolate beginning and end values (in this case 0 and 1)
const spin = this.spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
})

const Landing = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <Animated.Image
                style={[{ transform: [{ rotate: spin }] }, styles.pen]}
                source={require("./assets/pen.png")} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
    },
    pen: {
        width: 100,
        height: 100,
    },
});

export default Landing;
