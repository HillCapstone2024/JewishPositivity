import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, useColorScheme } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import LoadingScreen from './Loading';
import makeThemeStyle from '../../Theme.js';

const Landing = ({ navigation }) => {
    const [videoName, setVideoName] = useState(null);
    const theme = makeThemeStyle();

    useEffect(() => {
        if (theme['theme'] == 'dark') {
            setVideoName(require("../../assets/LandingDark.mp4"));
        } else {
            setVideoName(require("../../assets/LandingLight.mp4"));
        }
    });

    const words = [
        ["Practice", "Gratitude"],
        ["Share", "Positivity"],
        ["Spread", "Kindness"],
        ["Engage in your", "Community"],
        ["Promote", "Inclusivity"],
        ["Encourage", "Compassion"],
        ["Foster", "Unity"],
        ["Embrace", "Empathy"],
        ["Cherish", "Friendship"],
    ];

    const handleLogin = () => {
        navigation.navigate('Login');
    };

    const video = React.useRef(null);

    const [currentIndex, setCurrentIndex] = useState(0);
    const screenWidth = Dimensions.get('window').width;
    const screenHeight = Dimensions.get('window').height;
    const translateX = useRef(new Animated.Value(-screenWidth)).current;
    const translateX2 = useRef(new Animated.Value(-screenWidth)).current;

    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentIndex === words.length - 1) {
                setCurrentIndex(0);
            } else {
                setCurrentIndex(currentIndex + 1);
            }
        }, 5000);

        return () => clearTimeout(timer);
    }, [currentIndex]);

    useEffect(() => {
        // Reset translateX to initial position
        translateX.setValue(-screenWidth);

        Animated.sequence([
            Animated.timing(translateX, {
                toValue: 0,
                duration: 1000,
                useNativeDriver: true,
                delay: 100
            }),
            Animated.timing(translateX, {
                toValue: -screenWidth,
                duration: 1000,
                useNativeDriver: true,
                delay: 3150 // Delay before sliding out
            })
        ]).start();

        translateX2.setValue(-screenWidth);

        Animated.sequence([
            Animated.timing(translateX2, {
                toValue: 0,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(translateX2, {
                toValue: -screenWidth,
                duration: 1000,
                useNativeDriver: true,
                delay: 3000 // Delay before sliding out
            })
        ]).start();
    }, [currentIndex]);

    return (
        <View style={[styles.container, theme["background"]]}>
            <Text style={[styles.header, theme["color"]]}>Jewish Positivity</Text>
            <Video
                ref={video}
                style={styles.backgroundVideo}
                source={videoName}
                useNativeControls={false}
                shouldPlay={true}
                resizeMode={ResizeMode.COVER}
                isLooping={true}
                isMuted={true}
            />
            <View style={styles.wordContainer}>
                <Animated.View style={[styles.wordPair, { transform: [{ translateX }] }]}>
                    <Text style={[styles.wordOne, theme["color"]]}>{words[currentIndex][0]}</Text>
                </Animated.View>
                <Animated.View style={[styles.wordPair, { transform: [{ translateX: translateX2 }] }]}>
                    <Text style={[styles.wordTwo, theme["color"]]}>{words[currentIndex][1]}</Text>
                </Animated.View>
            </View>
            <View style={styles.contentContainer}>
            </View>
            <View style={styles.footer}>
                <TouchableOpacity onPress={handleLogin} style={styles.continueButton}>
                    <Text style={[styles.buttonText]}>Continue</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 5,
        paddingVertical: 50,
    },
    backgroundVideo: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        opacity: 0.5,
    },
    wordContainer: {
        width: '100%',
        top: Dimensions.get('window').height / 4,
    },
    wordPair: {
        flexDirection: 'column',
        alignItems: 'left',
    },
    wordOne: {
        fontSize: Dimensions.get('window').width / 10,
        fontWeight: 'bold',
        marginHorizontal: 10,
    },
    wordTwo: {
        fontSize: Dimensions.get('window').width / 6.5,
        fontWeight: 'bold',
        marginHorizontal: 10,
    },
    continueButton: {
        backgroundColor: '#4A90E2',
        textAlign: 'center',
        alignContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 15,
        shadowColor: "4A90E2",
    },
    buttonText: {
        alignContent: 'center',
        textAlign: 'center',
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    header: {
        alignContent: 'center',
        textAlign: 'center',
        fontSize: 30,
        paddingTop: 50,
        fontWeight: 'bold',
        zIndex: 1,
    },
    contentContainer: {
        marginTop: 50,
        flex: 1 // pushes the footer to the end of the screen
    },
    footer: {
        height: 100,
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default Landing;
