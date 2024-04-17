//the page renders, username, first name, last name, email is there
//the profile page is there
//when edit profile is clicked, it changes to edit page
//when they press profile change button, alert appears
//test profile submit change, axios mock call
//new profile information gets displayed

import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import Profile from "../screens/home/Profile.js";

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

  it("Successfully renders username, first name, last name, and email", () => {
    const {getByTestId} = render(<Profile />);
    expect(getByTestId("firstnameInput")).toBeTruthy();
    expect(getByTestId("lastnameInput")).toBeTruthy();
    expect(getByTestId("usernameInput")).toBeTruthy();
    expect(getByTestId("emailInput")).toBeTruthy();
  });
});