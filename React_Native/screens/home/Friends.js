import React, { useState, useEffect } from 'react';
import { View, Text, Alert } from 'react-native';
import makeThemeStyle from '../../Theme.js';

export default function Friends({navigaton}) {
    theme = makeThemeStyle();
    return(
        <View style={[{ flex: 1, alignItems: 'center', justifyContent: 'center'}, theme['background']]}>
            <Text
                onPress={() => alert('This is the "Friends" screen ')}
                style={[{ fontSize: 26, fontWeight: 'bold' }, theme['color']]}>Friends</Text>
        </View>
    );
}
