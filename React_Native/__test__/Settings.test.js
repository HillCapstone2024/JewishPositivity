import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import Settings from "../screens/home/Settings.js"; // Adjust the import path according to your file structure
import * as Storage from "../AsyncStorage.js";
import axios from "axios";
import { Linking } from 'react-native';

jest.mock("../AsyncStorage.js", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const mockNavigate = jest.fn();
const navigationMock = {
  navigate: mockNavigate,
};

jest.mock("axios");

describe("Settings Component", () => {
  it("loads and displays initial settings", async () => {
    Storage.getItem
      .mockResolvedValueOnce("testUser") // Mock username
      .mockResolvedValueOnce("true")     // Mock haptic feedback enabled
      .mockResolvedValueOnce("dark");    // Mock theme

    const { findByText, findByTestId } = render(<Settings />);

    const usernameDisplay = await findByText("testUser");
    const hapticFeedbackSwitch = await findByTestId("haptic-feedback-switch");
    const themeSelector = await findByTestId("theme-selector");

    expect(usernameDisplay).toBeTruthy();
    expect(hapticFeedbackSwitch.props.value).toBe(true);
    expect(themeSelector.props.value).toBe("dark");
  });

  it("updates theme setting when changed", async () => {
    Storage.getItem
      .mockResolvedValueOnce("testUser")
      .mockResolvedValueOnce("true")
      .mockResolvedValueOnce("dark");

    const { findByTestId } = render(<Settings />);

    const themeSelector = await findByTestId("theme-selector");

    fireEvent(themeSelector, 'onValueChange', 'light');
    await waitFor(() => {
      expect(Storage.setItem).toHaveBeenCalledWith("@theme", "light");
    });
  });

  it("toggles haptic feedback setting", async () => {
    Storage.getItem
      .mockResolvedValueOnce("testUser")
      .mockResolvedValueOnce("true")     // Initially true
      .mockResolvedValueOnce("dark");

    const { findByTestId } = render(<Settings />);

    const hapticFeedbackSwitch = await findByTestId("haptic-feedback-switch");

    fireEvent(hapticFeedbackSwitch, 'onValueChange', false);
    await waitFor(() => {
      expect(Storage.setItem).toHaveBeenCalledWith("@hapticFeedbackEnabled", "false");
    });
  });

  it("updates local storage after successful theme change", async () => {
    Storage.getItem.mockResolvedValueOnce("testUser").mockResolvedValueOnce("true").mockResolvedValueOnce("dark");

    const { findByTestId } = render(<Settings />);
    const themeSelector = await findByTestId("theme-selector");

    fireEvent(themeSelector, 'onValueChange', 'light');

    await waitFor(() => {
      expect(Storage.setItem).toHaveBeenCalledWith("@theme", "light");
    });
  });

  it("reflects the change in UI when the theme is changed", async () => {
    Storage.getItem.mockResolvedValueOnce("testUser").mockResolvedValueOnce("true").mockResolvedValueOnce("dark");

    const { findByTestId, getByTestId } = render(<Settings />);
    const themeSelector = await findByTestId("theme-selector");

    fireEvent(themeSelector, 'onValueChange', 'light');

    await waitFor(() => {
      expect(getByTestId("theme-selector").props.value).toBe("light");
    });
  });

  it("navigates to the Terms of Use screen when the option is selected", async () => {
    const { findByTestId } = render(<Settings navigation={navigationMock} />);
    const termsButton = await findByTestId("terms-of-use-button");

    fireEvent.press(termsButton);

    await waitFor(() => {
      expect(navigationMock.navigate).toHaveBeenCalledWith("TermsOfUseScreen");
    });
  });

  // Mock Linking.openURL
  jest.mock('react-native/Libraries/Linking/Linking', () => ({
    openURL: jest.fn(),
  }));

  it("opens the Privacy Policy in a web browser when selected", async () => {
    const { findByTestId } = render(<Settings />);
    const privacyPolicyButton = await findByTestId("privacy-policy-button");

    fireEvent.press(privacyPolicyButton);

    await waitFor(() => {
      expect(Linking.openURL).toHaveBeenCalledWith("http://your-privacy-policy-url.com");
    });
  });

  it("deletes the user account when confirmed", async () => {
    axios.delete.mockResolvedValue({ status: 200 }); // Assume the API responds correctly on successful deletion

    const { findByTestId } = render(<Settings />);
    const deleteAccountButton = await findByTestId("delete-account-button");

    fireEvent.press(deleteAccountButton);
    // Assume there's a confirmation dialog, and you simulate pressing the "Confirm" button
    const confirmButton = await findByTestId("confirm-delete-button");
    fireEvent.press(confirmButton);

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(`${API_URL}/deleteUser`);
      // Optionally, check if the user is redirected to the login screen or logged out
      expect(navigationMock.navigate).toHaveBeenCalledWith("LoginScreen");
    });
  });


});