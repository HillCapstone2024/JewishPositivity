import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import axios from "axios";
import EditProfile from "../screens/profile/EditProfile.js";

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

describe("EditProfile Component", () => {
  it("can do simple jest test", () => {
    expect(1 + 2).toBe(3);
  });

  // The edit profile page renders username,first name, last name, and email
  it("Successfully renders username, first name, last name, and email", () => {
    const {getByTestId} = render(<EditProfile />);
    expect(getByTestId("usernameInputEditProfile")).toBeTruthy();
    expect(getByTestId("firstnameInputEditProfile")).toBeTruthy();
    expect(getByTestId("lastnameInputEditProfile")).toBeTruthy();
    expect(getByTestId("emailInputEditProfile")).toBeTruthy();
  });

  // The edit profile page renders submit and cancel buttons
  it("Successfully renders submit and cancel buttons", () => {
    const {getByTestId} = render(<EditProfile />);
    expect(getByTestId("cancelButton")).toBeTruthy();
    expect(getByTestId("submitButton")).toBeTruthy();
  });

  it("Displays error message when failed submit", async () => {
    axios.get.mockResolvedValue({ data: { csrfToken: "test-csrf-token" } }); // always suppose to do this
    const mockLoginResponse = { // set up the response
      response: {
      data: "Error Updating Profile!",
      },
    };
    axios.post.mockRejectedValue(mockLoginResponse); // Want this value to fail

    const { getByText, getByTestId } = render(<EditProfile />);
    fireEvent.changeText(getByTestId("firstnameInputEditProfile"), "test");
    fireEvent.changeText(getByTestId("lastnameInputEditProfile"), "user");
    fireEvent.changeText(getByTestId("emailInputEditProfile"), "testuser@gmail.com");
    fireEvent.press(getByTestId("submitButton"));

    await waitFor(() => {
      expect(getByTestId("errorMessage")).toBeTruthy();
      //expect(getByText("Error Updating Profile!")).toBeTruthy();
    });
  }); 

  
});