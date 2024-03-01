import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, useColorScheme } from 'react-native';
import { Video, ResizeMode } from 'expo-av';

const Landing = ({ navigation }) => {
    const [videoName, setVideoName] = useState(null);
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    
    useEffect(() => {
        if (colorScheme === 'dark') {

            setVideoName(require("./assets/LandingDark.mp4"));
        } else {
            setVideoName(require("./assets/LandingLight.mp4"));
        }
    }, [colorScheme]);
    const words = [
        ["Practice", "Gratitude"],
        ["Share", "Positivity"],
        ["Spread", "Kindness"],
        ["Foster", "Unity"],
        ["Engage in your", "Community"],
        ["Embrace", "Empathy"],
        ["Cultivate", "Resilience"],
        ["Encourage", "Compassion"],
        ["Cherish", "Friendship"],
        ["Promote", "Inclusivity"]
    ];

    const handleLogin = () => {
        navigation.navigate('Login');
    };

    const video = React.useRef(null);

    const [currentIndex, setCurrentIndex] = useState(0);
    const screenWidth = Dimensions.get('window').width;
    const screenHeight = Dimensions.get('window').height;
    const translateX = useRef(new Animated.Value(-screenWidth)).current;

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
            }),
            Animated.timing(translateX, {
                toValue: -screenWidth,
                duration: 1000,
                useNativeDriver: true,
                delay: 3000 // Delay before sliding out
            })
        ]).start();
    }, [currentIndex]);

    return (
        <View style={styles.container}>
            <Text>
                Jewish Positivity
            </Text>
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
                <Text style={styles.header}>Jewish Positivity</Text>
                <Animated.View style={[styles.wordPair, { transform: [{ translateX }] }]}>
                    <Text style={[styles.wordOne, { color: isDarkMode ? 'white' : 'black' }]}>{words[currentIndex][0]}</Text>
                    <Text style={[styles.wordTwo, { color: isDarkMode ? 'white' : 'black' }]}>{words[currentIndex][1]}</Text>
                </Animated.View>
            </View>

            <TouchableOpacity onPress={handleLogin} style={[styles.continueButton, { top: screenHeight * 0.3 }]}>
                <Text style={[styles.buttonText]}>Continue</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backgroundVideo: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
    wordContainer: {
        position: 'absolute',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        top: Dimensions.get('window').height / 4,
    },
    wordPair: {
        flexDirection: 'column',
        alignItems: 'left',
    },
    wordOne: {
        fontSize: Dimensions.get('window').width/7,
        fontWeight: 'bold',
        marginHorizontal: 10,
    },
    wordTwo: {
        fontSize: Dimensions.get('window').width/5,
        color: 'white',
        fontWeight: 'bold',
        marginHorizontal: 10,
    },
    continueButton: {
        backgroundColor: '#96d7ff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 15,
        elevation: 5, // Add elevation for the glow effect
        marginVertical: 20,
        bottom: 0,
    },
    buttonText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    header: {
        fontSize: 30,
        fontWeight: 'bold',
        top: -130,
        marginBottom: 100,
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 3,
    },
});

export default Landing;
