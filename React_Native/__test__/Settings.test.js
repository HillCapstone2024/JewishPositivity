import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import axios from "axios";
import Times from "../screens/home/Times";
import * as Storage from "../AsyncStorage.js";
import IP_ADDRESS from "../ip.js";
const API_URL = "http://" + IP_ADDRESS + ":8000";

//mocks below
jest.mock("../AsyncStorage.js", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock("axios");
const mockNavigate = jest.fn();
const navigationMock = {
  navigate: mockNavigate,
};

describe("Settings Component", () => {
    it.skip("loads and displays initial settings", async () => {
      // Mock AsyncStorage to return specific values for username, theme, and haptic feedback.
      Storage.getItem = jest
        .fn()
        .mockResolvedValueOnce("testUser") // Mock username
        .mockResolvedValueOnce("true") // Mock haptic feedback enabled
        .mockResolvedValueOnce("dark"); // Mock theme

      const { findByText, findByTestId } = render(<SettingsScreen />);

      const usernameDisplay = await findByText("testUser");
      const hapticFeedbackSwitch = await findByTestId("haptic-feedback-switch");
      const themeSelector = await findByTestId("theme-selector");

      expect(usernameDisplay).toBeTruthy();
      expect(hapticFeedbackSwitch.props.value).toBe(true);
      expect(themeSelector.props.value).toBe("dark");
    });
});
