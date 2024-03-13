import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import axios from "axios";
import Login from "../Login";

//mock axios call
jest.mock("axios");
const mockNavigate = jest.fn();
const navigationMock = {
  navigate: mockNavigate,
};

jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

describe("JournalEntry Component", () => {
  it("Successfully renders journal page", () => {
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

  it("Navigates to 'Main' on successful login", async () => {
    axios.get.mockResolvedValue({ data: { csrfToken: "test-csrf-token" } });
    const mockLoginResponse = {
      data: "Login successful!",
    };
    axios.post.mockResolvedValue(mockLoginResponse);

    const { getByText, getByTestId } = render(
      <Login navigation={navigationMock} />
    );
    fireEvent.changeText(getByTestId("usernameInput"), "testuser");
    fireEvent.changeText(getByTestId("passwordInput"), "password");
    fireEvent.press(getByText("Login"));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("Drawer");
    });
  });
});
