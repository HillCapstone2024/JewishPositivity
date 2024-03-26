import React, { useState, useEffect } from 'react';
import { View, Text, Alert, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import makeThemeStyle from '../../Theme.js';

export default function HomeScreen({ navigation }) {
    const theme = makeThemeStyle();

    const entries = [
        {
            id: '1',
            username: "Bfarrell",
            title: "Modeh Ani",
            date: "2021-10-01 06:00",
            content: "Thank you for your unwavering support and kindness. Your generosity has made a significant difference in my life.",
        },
        {
            id: '2',
            username: "Mnelson",
            title: "Ashrei",
            date: "2021-10-01 12:00",
            content: "I'm deeply grateful for the laughter and joy you bring into my life. You make every moment brighter.",
        },
        {
            id: '3',
            username: "Jpacheco",
            title: "Shema",
            date: "2021-10-02 20:00",
            content: "Your thoughtful guidance has been a guiding light for me. Thank you for being my mentor and friend.",
        },
    ];

    const handleViewEntry = (entry) => {
        // Assuming "Entry" screen expects the entry id as a parameter
        // navigation.navigate("Entry", { entryID: entry.id });
        navigation.navigate('Entry');
        console.log("Viewing an entry: ", entry.id);
    }

    const renderItem = ({ item }) => (
        <TouchableOpacity style={[styles.itemContainer, theme['background']]} onPress={() => handleViewEntry(item)}>
            <Text style={[styles.username, theme['text']]}>{item.username}</Text>
            <Text style={[styles.title, theme['text']]}>{item.title}</Text>
            <Text style={[styles.date, theme['text']]}>{item.date}</Text>
            <Text style={[styles.content, theme['text']]}>{item.content}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, theme['background']]}>
            <FlatList
                data={entries}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    itemContainer: {
        margin: 10,
        padding: 20,
    },
    username: {
        fontSize: 24,
        fontWeight: "bold",
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",

    },
    date: {
        fontSize: 14,
    },
    content: {
        fontSize: 14,
    },
});
