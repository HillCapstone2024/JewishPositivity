import React, { useEffect, useState } from "react";
import {
    View,
    Image,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Platform,
    Keyboard,
    Alert,
} from "react-native";
import axios from "axios";
import IP_ADDRESS from "../../ip.js";
import makeThemeStyle from '../../Theme.js';

const API_URL = "http://" + IP_ADDRESS + ":8000";

const ForgotPassword = ({ navigation }) => {
    const [username, setUsername] = useState("");
    const theme = makeThemeStyle();

    const handlePasswordReset = async () => {
        const getCsrfToken = async () => {
            try {
                const response = await axios.get(`${API_URL}/csrf-token/`);
                return response.data.csrfToken;
            } catch (error) {
                console.error("Error retrieving CSRF token:", error);
                throw new Error("CSRF token retrieval failed");
            }
        };

        try {
            const csrfToken = await getCsrfToken();
            const response = await axios.post(`${API_URL}/reset_password/`,
                {
                    username: username,
                },
                {
                    headers: {
                        "X-CSRFToken": csrfToken,
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                }
            );
            console.log("response:", response.data);
            Alert.alert("Password reset email sent");
        } catch (error) {
            console.error("error:", error.response.data);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={[styles.container, theme['background']]}
            >
                <Image source={require("../../assets/images/logo.png")} style={styles.logo} />
                <TextInput
                    style={[styles.input, theme["color"]]}
                    placeholder="Username"
                    placeholderTextColor={theme["color"].color}
                    onChangeText={(text) => setUsername(text)}
                    value={username}
                    testID="usernameInput"
                />
                <View>
                    <TouchableOpacity style={styles.button} onPress={handlePasswordReset} testID="passwordResetButton">
                        <Text style={styles.buttonText}>Reset Password</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
    },
    logo: {
        width: 200,
        height: 200,
        marginBottom: 20,
        shadowColor: "black",
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        shadowOpacity: 0.16,
    },
    input: {
        width: "80%",
        height: 40,
        borderStyle: "solid",
        borderBottomColor: "#e8bd25",
        borderBottomWidth: 2,
        // borderRadius: 10,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    button: {
        backgroundColor: "#4A90E2",
        paddingVertical: 10,
        paddingHorizontal: 50,
        marginTop: 10,
        marginHorizontal: 5,
        borderRadius: 5,
        shadowColor: "black",
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        shadowOpacity: 0.16,
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default ForgotPassword;
