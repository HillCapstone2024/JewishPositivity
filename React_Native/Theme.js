import React, { useState } from "react";
import * as Storage from "./AsyncStorage.js";
import { Appearance } from "react-native";

export default makeThemeStyle = () => {
    const [theme, setTheme] = useState(false);
    const [storage_theme, setStorageTheme] = useState('system');

    const getTheme = async () => {
        try {
            setStorageTheme(await Storage.getItem('@theme'));
            if (storage_theme === 'dark') {
                setTheme(true)
            } else if (storage_theme === 'light') {
                setTheme(false)
            } else {
                if (Appearance.getColorScheme() == 'dark') {
                    setTheme(true)
                } else {
                    setTheme(false)
                }
            }
        }
        catch (e) {
            await Storage.setItem('@theme', 'system');
            console.log(e);
        }
    };
    getTheme()

    return {
        "background": {backgroundColor: theme ? '#333333' : '#FFFFFF',},
        "color": {color: theme ? '#FFFFFF' : '#333333',},
        "theme": storage_theme,
    }
};