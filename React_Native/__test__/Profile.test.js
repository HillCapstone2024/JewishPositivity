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
import EditProfile from "../screens/profile/EditProfile.js";
import ProfileParent from "../screens/profile/ProfileParent.js";

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

  // The profile page renders username, name, and email
  it("Successfully renders username, name, and email", () => {
    const {getByTestId} = render(<Profile />);
    expect(getByTestId("usernameInput")).toBeTruthy();
    expect(getByTestId("nameInput")).toBeTruthy();
    expect(getByTestId("emailInput")).toBeTruthy();
  });

  //the profile picture is there
  it("Successfully renders the Profile Picture Component", () => {
    const { getByTestId }= render(<Profile />);
    expect(getByTestId("profilePicture")).toBeTruthy();
  });

  //when edit profile is clicked, onSwitch is called and directs to ProfileParent.js
  it("Navigates to the edit profile page when 'Edit Profile' is clicked in the parent", () => {
    const onSwitchMock = jest.fn();
    const {getByTestId} = render(<Profile onSwitch={onSwitchMock} />);
    fireEvent.press(getByTestId('editProfileButton'));
    expect(onSwitchMock).toHaveBeenCalled();
  }); 

  //when onSwitch occurs, it goes from UserProfile to EditProfile in ProfileParent.js
  // it("Navigates to EditProfile from UserProfile within the parent", () => {
  //   const onSwitchMock = jest.fn();
  //   const {getByTestId, queryByTestId} = render(<Profile onSwitch={onSwitchMock} />);
  //   // expect(getByTestId('userProfileComponent')).toBeTruthy();
  //   // expect(queryByTestId('editProfileComponent')).toBeNull();
  //   fireEvent.press(getByTestId('editProfileButton'));
  //   expect(onSwitchMock).toHaveBeenCalled();
  //   expect(getByTestId('cancelButton')).toBeTruthy();
  //   expect(getByTestId('submitButton')).toBeTruthy();
  // });

  // //test profile submit change, axios mock call
  // it("Successfully submits information when submit button is clicked", () => {
  //   const onSwitchMock = jest.fn();
  //   const {getByTestId} = render(<Profile onSwitch={onSwitchMock} />);
  //   fireEvent.press(getByTestId('editProfileButton'));
  //   expect(onSwitchMock).toHaveBeenCalled();
  //   expect(getByTestId('editProfileButton').props.children).toBe('Submit')

  // }); 

  //new profile information gets displayed
});