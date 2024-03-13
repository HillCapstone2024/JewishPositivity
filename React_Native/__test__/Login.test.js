import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import axios from "axios";
import Login from "../screens/auth/Login";

//mock axios call
jest.mock("axios");
const mockNavigate = jest.fn();
const navigationMock = {
  navigate: mockNavigate,
};

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
    axios.get.mockResolvedValue({ data: { csrfToken: "test-csrf-token" } });
    const mockLoginResponse = {
      response: {
        data: "Login failed!",
      },
    };
    axios.post.mockRejectedValue(mockLoginResponse);

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

    const { getByText, getByTestId } = render(<Login navigation={navigationMock}/>);
    fireEvent.changeText(getByTestId("usernameInput"), "testuser");
    fireEvent.changeText(getByTestId("passwordInput"), "password");
    fireEvent.press(getByTestId("loginButton"));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("Drawer");
    });
  });

});