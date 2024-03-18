import * as React from 'react';
import { View, Text, Alert } from 'react-native';
import makeThemeStyle from '../../Theme.js';

export default function Archive({navigaton}) {
    theme = makeThemeStyle();
    return(
        <View style={[{ flex: 1, alignItems: 'center', justifyContent: 'center'}, theme['background']]}>
            <Text
                onPress={() => alert('This is the "Archive" screen ')}
                style={[{ fontSize: 26, fontWeight: 'bold' }, theme['color']]}>Archive</Text>
        </View>
    );
}
