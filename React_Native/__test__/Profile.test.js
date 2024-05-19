//the page renders, username, first name, last name, email is there
//the profile page is there
//when edit profile is clicked, it changes to edit page
//when they press profile change button, alert appears
//test profile submit change, axios mock call
//new profile information gets displayed

import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import axios from "axios";
import Profile from "../screens/profile/Profile.js";

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

describe("Profile Component", () => {
  it("can do simple jest test", () => {
    expect(1 + 2).toBe(3);
  });

  //the page renders, username, first name, last name, email is there
  it("Successfully renders username, first name, last name, and email", () => {
    const {getByTestId} = render(<Profile />);
    expect(getByTestId("firstnameInput")).toBeTruthy();
    expect(getByTestId("lastnameInput")).toBeTruthy();
    expect(getByTestId("usernameInput")).toBeTruthy();
    expect(getByTestId("emailInput")).toBeTruthy();
  });

  //the profile page is there
  it("Renders the Profile Component", () => {
    const { getByTestId }= render(<Profile />);
    expect(getByTestId("profileContainer")).toBeTruthy();
  });

  //when edit profile is clicked, it changes to edit page
  it("Navigates to the edit profile page when 'Edit Profile' is clicked", () => {
    const { getByTestId } = render(<Profile navigation={{ navigate: mockNavigateDrawer }} />);
    fireEvent.press(getByText("Edit Profile"));
    expect(mockNavigateDrawer).toHaveBeenCalledWith("EditProfile");
  });

  //when they press profile change button, alert appears
  it("Displays an alert when the profile change button is pressed", () => {
    const { getByText } = render(<Profile />);
    jest.spyOn(global,'alert').mockImplementation(() => {});
    fireEvent.press(getByText("Change Profile Picture"));
    expect(global.alert).toHaveBeenCalledWith("Profile picture changed successfully!");
    global.alert.mockRestore();
  });

  //test profile submit change, axios mock call
  
  //new profile information gets displayed
});