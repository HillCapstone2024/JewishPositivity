import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import axios from 'axios'; // Make sure axios is installed
import IP_ADDRESS from "../../ip.js";
const API_URL = "http://" + IP_ADDRESS + ":8000";

const CheckInScreen = ({ route }) => {
  const { username } = route.params;
  const [checkinData, setCheckinData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCheckinData = async () => {
      try {
        const response = await axios.get(`http://${API_URL}/checkin/${username}/${moment_number}`);
        setCheckinData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching check-in data:', error);
        setLoading(false);
      }
    };

    fetchCheckinData();
  }, [username, moment_number]);

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  if (!checkinData) {
    return <Text>No check-in data found.</Text>;
  }

  return (
    <View>
      <Text>Username: {username}</Text>
      <Text>Moment Number: {moment_number}</Text>
      <Text>Date: {checkinData.date}</Text>
      <Text>Text Entry: {checkinData.text_entry}</Text>
      <Text>Content: {checkinData.content}</Text>
      {/* Add more UI elements to display other check-in details */}
    </View>
  );
};

export default CheckInScreen;