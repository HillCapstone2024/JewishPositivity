import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import axios from "axios";
import Login from "../screens/auth/Login.js";
import * as Storage from "../AsyncStorage.js";

//mock axios call
jest.mock("axios");

//Mocking navigateDrawer
const mockNavigateDrawer = jest.fn();
const mockResetNavigation = jest.fn();

jest.mock("../AsyncStorage.js", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(), // Adjust this as needed for your tests
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

describe("Login Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Storage.getItem.mockImplementation((key) => {
      switch (key) {
        case '@username':
          return Promise.resolve('testUser');
        case '@timezone':
          return Promise.resolve('America/New_York');
        case '@theme':
          return Promise.resolve('light');
        case '@CSRF':
          return Promise.resolve('dummyCsrfToken');
        default:
          return Promise.resolve(null);
      }
    });
  });

  it("can do simple jest test", () => {
    expect(1 + 2).toBe(3);
  });

  it("Successfully renders login and signup buttons", () => {
    const { getByText, getByTestId } = render(<Login />);
    expect(getByTestId("usernameInput")).toBeTruthy();
    expect(getByTestId("passwordInput")).toBeTruthy();
    expect(getByText("Login")).toBeTruthy();
    expect(getByText("Sign Up")).toBeTruthy();
  });

  it("Displays error message on failed login", async () => {
    axios.get.mockResolvedValue({ data: { csrfToken: "test-csrf-token" } }); // always suppose to do this
    const mockLoginResponse = { // set up the response
      response: {
        data: "Login failed!",
      },
    };
    axios.post.mockRejectedValue(mockLoginResponse); // Want this value to fail

    const { getByText, getByTestId } = render(<Login />);
    fireEvent.changeText(getByTestId("usernameInput"), "testuser");
    fireEvent.changeText(getByTestId("passwordInput"), "password");
    fireEvent.press(getByText("Login"));

    await waitFor(() => {
      expect(getByText("Login failed!")).toBeTruthy();
    });
  });

  it("Navigates to 'Drawer' on successful login", async () => {
    axios.get.mockResolvedValue({ data: { csrfToken: "test-csrf-token" } });
    const mockLoginResponse = {
        data: "Login successful!",
    };
    axios.post.mockResolvedValue(mockLoginResponse);

    const { getByTestId } = render(
      <Login
        navigation={{
          navigate: mockNavigateDrawer,
          reset: mockResetNavigation, // Mocked reset function
        }}
      />
    );

    fireEvent.changeText(getByTestId("usernameInput"), "testuser");
    fireEvent.changeText(getByTestId("passwordInput"), "password");
    fireEvent.press(getByTestId("loginButton"));

    // Wait for navigation to occur
    await waitFor(() => {
      // Assert that mockResetNavigation was called with the correct parameters
      expect(mockResetNavigation).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: "Drawer" }],
      });

      // Assert that mockNavigateDrawer was called with "Drawer" route name
      expect(mockNavigateDrawer).toHaveBeenCalledWith("Drawer");
    });
  });

  it("tests updated timezone", async () => {
    
    const { getByTestId, getByPlaceholderText } = render(
      <Login
        navigation={{
          navigate: mockNavigateDrawer,
          reset: mockResetNavigation, // Mocked reset function
        }}
      />
    );

    const usernameInput = getByPlaceholderText('Username');
    const passwordInput = getByPlaceholderText('Password');
    const loginButton = getByTestId('loginButton');

    fireEvent.changeText(usernameInput, 'testuser');
    fireEvent.changeText(passwordInput, 'password123');

    axios.get.mockResolvedValue({ data: { csrfToken: "test-csrf-token" } });
    axios.post.mockResolvedValueOnce({ data: { success: true } }); // Mock login response
    axios.get.mockResolvedValueOnce({
      data: {
        first_name: 'John',
        last_name: 'Doe',
        password: 'encodedpassword',
        profilePicture: 'avatar.png',
        email: 'john.doe@example.com',
        timezone: 'America/New_York',
      }
    }); // Mock get_user_info response
    axios.post.mockResolvedValueOnce({ data: { success: true } }); // Mock update_user_information response

    fireEvent.press(loginButton);

    await waitFor(() => {
      // Log all calls to Storage.setItem for debugging
      console.log("Storage.setItem calls:", Storage.setItem.mock.calls);
      expect(Storage.setItem).toHaveBeenCalledWith("@timezone", "America/New_York");
    });
  });
});