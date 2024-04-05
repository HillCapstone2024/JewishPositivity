import React, { useState, useEffect, useRef } from "react";
import {
    View,
    StyleSheet,
    Image,
    Animated,
    Easing,
} from "react-native";
import makeThemeStyle from '../../tools/Theme.js';

const LoadingScreen = () => {
    const floatAnim = useRef(new Animated.Value(0)).current;
    const spinValue = useRef(new Animated.Value(0)).current;
    const wobbleAnim = useRef(new Animated.Value(0)).current;
    theme = makeThemeStyle();

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

        Animated.sequence([spin]).start(() => { wobble.start(); float.start() });
    }, [floatAnim, spinValue, wobbleAnim]);

    const wobble = wobbleAnim.interpolate({
        inputRange: [-1, 1],
        outputRange: ['8deg', '15deg'],
    });

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['100deg', '360deg'],
    });

    return (
        <View style={[styles.container, theme['background']]}>
            {/* <SvgXml xml={logos['notebook.svg']} style={styles.book} /> */}
            <Image source={require("../../assets/images/notebook.png")} style={styles.book} />
            <Animated.Image
                style={[{ transform: [{ translateX: floatAnim }, { rotate: spin }, { rotateZ: wobble }], }, styles.pen]}
                source={require("../../assets/images/new_pen.png")} />
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
        top: '37%',
        left: '41%',
        width: 17,
        height: 120,
    },
    book: {
        position: 'absolute',
        top: '33%',
        left: '26%',
        height: 204,
        width: 180,
    }
});

export default LoadingScreen;
