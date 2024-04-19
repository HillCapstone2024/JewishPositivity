import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import axios from "axios";
import Login from "../screens/auth/Login.js";

//mock axios call
jest.mock("axios");

//Mocking navigateDrawer
const mockNavigateDrawer = jest.fn();
const mockResetNavigation = jest.fn();

jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(() => Promise.resolve(null)), // Adjust this as needed for your tests
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

describe("Login Component", () => {
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

});