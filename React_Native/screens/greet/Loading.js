import React, { useState, useEffect, useRef } from "react";
import {
    View,
    StyleSheet,
    Image,
    Animated,
    Easing,
} from "react-native";

const LoadingScreen = () => {
    const floatAnim = useRef(new Animated.Value(0)).current;
    const spinValue = useRef(new Animated.Value(0)).current;
    const wobbleAnim = useRef(new Animated.Value(0)).current;

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
                    toValue: -17,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(floatAnim, {
                    toValue: 13,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(floatAnim, {
                    toValue: -17,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(floatAnim, {
                    toValue: 13,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );

        Animated.sequence([spin]).start(() => { wobble.start(); float.start() });
    }, [floatAnim, spinValue, wobbleAnim]);

    const wobble = wobbleAnim.interpolate({
        inputRange: [-1, 1],
        outputRange: ['-3deg', '3deg'],
    });

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['100deg', '360deg'],
    });

    return (
        <View style={styles.container}>
            <Image source={require("../../assets/images/nopen.png")} style={styles.book} />
            <Animated.Image
                style={[{ transform: [{ translateY: floatAnim }, { rotate: spin }, { rotateZ: wobble }], }, styles.pen]}
                source={require("../../assets/images/pen.png")} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pen: {
        position: 'absolute',
        top: '50%',
        left: '60%',
        // transformOrigin: '20px',
        marginLeft: -25, 
        marginTop: -25, 
        width: 65,
        height: 65,
    },
    book: {
        width: 200,
        height: 200,
    }
});

export default LoadingScreen;
