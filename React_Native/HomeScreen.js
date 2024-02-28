import * as React from 'react';
import { View, Text, Alert } from 'react-native';

export default function HomeScreen({navigaton}) {
    return(
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' , backgroundColor: "white"}}>
            <Text
                onPress={() => alert('This is the "Home" screen ')}
                style={{ fontSize: 26, fontWeight: 'bold' }}>Home Screen</Text>
        </View>
    );
}
