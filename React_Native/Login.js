import React, { useState } from 'react';
import { View, Image, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, TouchableWithoutFeedback, Platform, Keyboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios'


const Login = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const navigate = () => {
    navigation.navigate('Signup');
  }
  const handleLogin = async () => {
    console.log('reached function');
    try {
      console.log('made it to try');

      const response = await axios.post(
        "/login",
        {
          username: username,
          password: password,
        }
      )
      console.log('make request');
      console.log("Login response:", response.data);
      //In the event of a successful login, here we would navigate to another page.
    } catch (error) {
      console.error("Login error:", error);
      //Here we would determine what the error is and then act accordingly.
      //Most likely display wrong credentials message to the user.
    }
  };

  return (
    <View style={styles.container}>
      {/* <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}> */}
      <Image
        source={require('./assets/logo.png')}
        style={styles.logo}
      />
      <TextInput
        style={styles.input}
        placeholder="Username"
        onChangeText={(text) => setUsername(text)}
        value={username}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        onChangeText={(text) => setPassword(text)}
        value={password}
        secureTextEntry
      />
      <View>
        <View style={{ flexDirection: "row" }}>
          <LinearGradient
            // Button Linear Gradient
            colors={['#8282e7', '#80c0ff']}
            start={[0, 1]}
            end={[1, 0]}
            style={styles.button}>
            <Text style={styles.buttonText} onPress={handleLogin}>Login</Text>
          </LinearGradient>
          <LinearGradient
            // Button Linear Gradient
            colors={['#8282e7', '#80c0ff']}
            start={[0, 1]} end={[1, 0]}
            style={styles.button}>
            <Text style={styles.buttonText} onPress={navigate}>Sign Up</Text>
          </LinearGradient>
        </View>
        <LinearGradient
          // Button Linear Gradient
          colors={['#0023ff', '#000fcf']}
          start={[0, 1]}
          end={[1, 0]}
          style={styles.button}>
          <Text style={styles.buttonText}>Sign in with Facebook</Text>
        </LinearGradient>
        <LinearGradient
          // Button Linear Gradient
          colors={['#ff9e00', '#e64141']}
          start={[0, 1]}
          end={[1, 0]}
          style={styles.button}>
          <Text style={styles.buttonText}>Sign in with Google</Text>
        </LinearGradient>
      </View>
    </View >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'white'
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: 'white',
    borderStyle: 'solid',
    borderBottomColor: '#000',
    borderBottomWidth: 2,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#6c94b4',
    paddingVertical: 10,
    paddingHorizontal: 50,
    marginTop: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Login;
