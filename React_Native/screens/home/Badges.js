import React, { useState, useEffect } from 'react';
import { View, Text, Alert } from 'react-native';
import makeThemeStyle from '../../tools/Theme.js';

export default function Badges({navigaton}) {
    theme = makeThemeStyle();
    return(
        <View style={[{ flex: 1, alignItems: 'center', justifyContent: 'center'}, theme['background']]}>
            <Text
                onPress={() => alert('This is the "Badges" screen ')}
                style={[{ fontSize: 26, fontWeight: 'bold' }, theme['color']]}>Badges</Text>
        </View>
    );
}
