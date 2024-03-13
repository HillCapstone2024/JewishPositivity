import React from 'react';
import * as Storage from "./AsyncStorage.js";

const Theme = {
    light: {
        backgroundColor: '#fff',
        color: '#000',
    },
    dark: {
        backgroundColor: '#000',
        color: '#fff',
    },
    system: {
        backgroundColor: 'system',
        color: 'system',
    },
    currentTheme: async () => {
        try {
            const theme = await Storage.getItem('@theme');
            return theme;
        }
        catch (e) {
            await Storage.setItem('@theme', 'light');
            console.log(e);
        }
    }
}


export default Theme;