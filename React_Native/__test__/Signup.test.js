import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import axios from "axios";
import Signup from "../screens/auth/Signup.js";

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

describe("Signup Component", () => {
  it("Successfully renders Signup page", () => {
    const { getByTestId } = render(<Signup />);
    expect(getByTestId("emailInput")).toBeTruthy();
    expect(getByTestId("usernameInput")).toBeTruthy();
    expect(getByTestId("firstNameInput")).toBeTruthy();
    expect(getByTestId("lastNameInput")).toBeTruthy();
    expect(getByTestId("passwordInput")).toBeTruthy();
    expect(getByTestId("passwordTwoInput")).toBeTruthy();
    expect(getByTestId("signupButton")).toBeTruthy();
  });

  it("Displays error message on mismatching passwords", async () => {
    axios.get.mockResolvedValue({ data: { csrfToken: "test-csrf-token" } });
    const mockLoginResponse = {
      response: {
        data: "Passwords do not match",
      },
    };
    axios.post.mockRejectedValue(mockLoginResponse);

    const { getByText, getByTestId } = render(<Signup />);
    fireEvent.changeText(getByTestId("emailInput"), "test");
    fireEvent.changeText(getByTestId("usernameInput"), "testuser");
    fireEvent.changeText(getByTestId("firstNameInput"), "test");
    fireEvent.changeText(getByTestId("lastNameInput"), "test");
    fireEvent.changeText(getByTestId("passwordInput"), "test");
    fireEvent.changeText(getByTestId("passwordTwoInput"), "test");
    fireEvent.press(getByTestId("signupButton"));

    await waitFor(() => {
      expect(getByText("Passwords do not match")).toBeTruthy();
    });
  });

  it("Displays error message on duplicate email address", async () => {
    axios.get.mockResolvedValue({ data: { csrfToken: "test-csrf-token" } });
    const mockLoginResponse = {
      response: {
        data: "Account with this email already exists",
      },
    };
    axios.post.mockRejectedValue(mockLoginResponse);

    const { getByText, getByTestId } = render(<Signup />);
    fireEvent.changeText(getByTestId("emailInput"), "test");
    fireEvent.changeText(getByTestId("usernameInput"), "testuser");
    fireEvent.changeText(getByTestId("firstNameInput"), "test");
    fireEvent.changeText(getByTestId("lastNameInput"), "test");
    fireEvent.changeText(getByTestId("passwordInput"), "test");
    fireEvent.changeText(getByTestId("passwordTwoInput"), "test");
    fireEvent.press(getByTestId("signupButton"));

    await waitFor(() => {
      expect(getByText("Account with this email already exists")).toBeTruthy();
    });
  });

  it("Displays error message on invalid email address", async () => {
    axios.get.mockResolvedValue({ data: { csrfToken: "test-csrf-token" } });
    const mockLoginResponse = {
      response: {
        data: "Not a valid email address",
      },
    };
    axios.post.mockRejectedValue(mockLoginResponse);

    const { getByText, getByTestId } = render(<Signup />);
    fireEvent.changeText(getByTestId("emailInput"), "test");
    fireEvent.changeText(getByTestId("usernameInput"), "testuser");
    fireEvent.changeText(getByTestId("firstNameInput"), "test");
    fireEvent.changeText(getByTestId("lastNameInput"), "test");
    fireEvent.changeText(getByTestId("passwordInput"), "test");
    fireEvent.changeText(getByTestId("passwordTwoInput"), "test");
    fireEvent.press(getByTestId("signupButton"));

    await waitFor(() => {
      expect(getByText("Not a valid email address")).toBeTruthy();
    });
  });

  it("Displays error message on duplicate username", async () => {
    axios.get.mockResolvedValue({ data: { csrfToken: "test-csrf-token" } });
    const mockLoginResponse = {
      response: {
        data: "Account with this username already exists",
      },
    };
    axios.post.mockRejectedValue(mockLoginResponse);

    const { getByText, getByTestId } = render(<Signup />);
    fireEvent.changeText(getByTestId("emailInput"), "test");
    fireEvent.changeText(getByTestId("usernameInput"), "testuser");
    fireEvent.changeText(getByTestId("firstNameInput"), "test");
    fireEvent.changeText(getByTestId("lastNameInput"), "test");
    fireEvent.changeText(getByTestId("passwordInput"), "test");
    fireEvent.changeText(getByTestId("passwordTwoInput"), "test");
    fireEvent.press(getByTestId("signupButton"));

    await waitFor(() => {
      expect(
        getByText("Account with this username already exists")
      ).toBeTruthy();
    });
  });

  it("Navigates to 'Drawer' on successful signup", async () => {
    axios.get.mockResolvedValue({ data: { csrfToken: "test-csrf-token" } });
    const mockLoginResponse = {
      data: "Create a new user successful!",
    };
    axios.post.mockResolvedValue(mockLoginResponse);

    const { getByTestId } = render(
      <Signup
        navigation={{
          navigate: mockNavigateDrawer,
          reset: mockResetNavigation, // Mocked reset function
        }}
      />
    );

    fireEvent.changeText(getByTestId("emailInput"), "test");
    fireEvent.changeText(getByTestId("usernameInput"), "testuser");
    fireEvent.changeText(getByTestId("firstNameInput"), "test");
    fireEvent.changeText(getByTestId("lastNameInput"), "test");
    fireEvent.changeText(getByTestId("passwordInput"), "test");
    fireEvent.changeText(getByTestId("passwordTwoInput"), "test");
    fireEvent.press(getByTestId("signupButton"));

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
