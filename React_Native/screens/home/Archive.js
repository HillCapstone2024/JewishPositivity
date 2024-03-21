import React, { useEffect, useState } from "react";
import { View, Text, Alert, ActivityIndicator, TextInput, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import makeThemeStyle from '../../Theme.js';
import { SearchBar } from 'react-native-elements';

import IP_ADDRESS from "../../ip.js";
const API_URL = "http://" + IP_ADDRESS + ":8000";
import axios from 'axios';
import { AntDesign, FontAwesome5 } from '@expo/vector-icons';


import { Ionicons } from "@expo/vector-icons";
import { ListItem } from '@rneui/themed';

export default function Archive({ navigaton }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [username, setUsername] = useState("");
    const [entries, setEntries] = useState([]);
    const [areEntries, setAreEntries] = useState(false);
    const [message, setMessage] = useState(<ActivityIndicator />);
    theme = makeThemeStyle();
    const index = 0;


    useEffect(() => {
        if (entries.length == 0) {
            setAreEntries(false);
            setMessage(<Text style={[styles.title, theme['color']]}>No entries yet!</Text>);
        } else {
            setAreEntries(true);
            setMessage(null)
        }
        const loadUsername = async () => {
            const storedUsername = await Storage.getItem("@username");
            setUsername(storedUsername || "No username");
        };
        loadUsername();

        setEntries([
            { id: 1, title: "First entry", Date: "2021-10-01 12:00:00", Content: "This is the first entry" },
            { id: 2, title: "Second entry", Date: "2021-10-02 12:00:00", Content: "This is the second entry" },
            { id: 3, title: "Third entry", Date: "2021-10-03 12:00:00", Content: "This is the third entry" },
        ]);
    }, []);

    const Item = ({ title, time }) => (
        <View style={styles.item}>
            <View style={styles.itemLeft}>
                <FontAwesome5 name="coffee" size={24} color="#4F8EF7" />
                <View style={styles.itemText}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.time}>{time}</Text>
                </View>
            </View>
            <TouchableOpacity>
                <AntDesign name="right" size={24} color="black" />
            </TouchableOpacity>
        </View>
    );

    const renderItem = ({ item }) => <Item title={item.title} time={item.time} />;

    return (
        <View style={[styles.container, theme['background']]}>
            {areEntries ?
                <FlatList
                    data={entries}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.container}
                />
                : null}
            {message}
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    listContainer: {
        alignItems: 'stretch', // Ensure children stretch to fill the container
    },
    searchBar: {
        padding: 10,
        flex: 1,
        fontSize: 18,
        padding: 10,
        borderRadius: 5,
        borderColor: 'gray',
        borderWidth: 1,
    },
    title: {
        fontSize: 30,
        fontWeight: "bold",
        marginBottom: 20,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemText: {
        marginLeft: 15,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    time: {
        fontSize: 14,
        color: '#666',
    },
});
