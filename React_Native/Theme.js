import React, { useState, useEffect } from "react";
import * as Storage from "./AsyncStorage.js";
import { Appearance } from "react-native";
import { useFocusEffect } from '@react-navigation/native';

export default makeThemeStyle = () => {
    const [theme, setTheme] = useState(false);
    const [storage_theme, setStorageTheme] = useState('system');
    const [hapticFeedback, setHapticFeedback] = useState(false);

    const getHapticFeedback = async () => {
        try {
            setHapticFeedback(await Storage.getItem('@hapticFeedback'));
        }
        catch (e) {
            await Storage.setItem('@hapticFeedback', 'false');
            setHapticFeedback(false);
            console.log(e);
        }
    };
    getHapticFeedback();

    const getTheme = async () => {
        try {
            setStorageTheme(await Storage.getItem('@theme'));
            if (storage_theme === 'dark') {
                setTheme(true)
            } else if (storage_theme === 'light') {
                setTheme(false)
            } else if (storage_theme === 'system') {
                if (Appearance.getColorScheme() == 'dark') {
                    setTheme(true)
                } else {
                    setTheme(false)
                }
            } else {
                await Storage.setItem('@theme', 'system');
                setTheme(false);
            }
        }
        catch (e) {
            await Storage.setItem('@theme', 'system');
            setTheme(false)
            console.log(e);
        }
    };
    getTheme()

    useEffect(() => {
        getHapticFeedback();
        getTheme();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            // Do something when the screen is focused
            getHapticFeedback();
            getTheme();
            return () => {
                // Do something when the screen is unfocused
                getHapticFeedback();
                getTheme();
            };
        }, [])
    );

    return {
        "background": { backgroundColor: theme ? '#333333' : '#ececf6', }, //#ececf6 or #f2f2f2 or #ffffff
        "color": { color: theme ? '#FFFFFF' : '#333333', },
        "theme": storage_theme,
        "hapticFeedback": hapticFeedback,
    }
};