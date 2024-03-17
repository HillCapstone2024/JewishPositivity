import * as React from 'react';
import { View, Text, Alert } from 'react-native';
import makeThemeStyle from '../../Theme.js';

export default function HomeScreen({navigaton}) {
    theme = makeThemeStyle();
    return(
        <View style={[{ flex: 1, alignItems: 'center', justifyContent: 'center'}, theme['background']]}>
            <Text
                onPress={() => alert('This is the "Home" screen ')}
                style={[{ fontSize: 26, fontWeight: 'bold' }, theme['color']]}>Home Screen</Text>
        </View>
    );
}
