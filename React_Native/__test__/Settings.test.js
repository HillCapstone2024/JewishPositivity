import React from "react";
import { fireEvent, render, waitFor, screen } from "@testing-library/react-native";
import Settings from "../screens/settings/Settings.js"; // Adjust the import path according to your file structure
import * as Storage from "../AsyncStorage.js";
import axios from "axios";
import * as WebBrowser from 'expo-web-browser';
import { Linking } from 'react-native';
import { Alert } from 'react-native';
import IP_ADDRESS from "../ip.js";
const API_URL = "http://" + IP_ADDRESS + ":8000";

jest.mock("../AsyncStorage.js", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock('react-native-picker-select', () => jest.fn().mockImplementation(({ onValueChange }) => {
  const items = [
    { label: 'Dark', value: 'dark' },
    { label: 'Light', value: 'light' },
    { label: 'System', value: 'system' },
  ];
  
  return (
    <select
      data-testid="theme-selector"
      onChange={(e) => onValueChange(e.target.value)}
    >
      {items.map((item) => (
        <option key={item.value} value={item.value}>
          {item.label}
        </option>
      ))}
    </select>
  );
}));

const navigationMock = {
  navigate: jest.fn(),
  reset: jest.fn(),
};

jest.mock("axios");

// Mock the Alert module
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// Mock Linking.openURL
jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn(() => Promise.resolve("http://your-privacy-policy-url.com")),
}));

describe("Settings Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Storage.getItem.mockImplementation((key) => {
      switch (key) {
        case '@username':
          return Promise.resolve('testUser');
        case '@hapticFeedbackEnabled':
          return Promise.resolve('false');
        case '@theme':
          return Promise.resolve('light');
        case '@CSRF':
          return Promise.resolve('dummyCsrfToken');
        default:
          return Promise.resolve(null);
      }
    });
  });


  it('renders the 3 parts correctly', async () => {
    const { getByText } = render(<Settings navigation={navigationMock} />);

    await waitFor(() => {
      expect(getByText('Preferences')).toBeTruthy();
      expect(getByText('Check-in notifications')).toBeTruthy();
      expect(getByText('Resources')).toBeTruthy();
    });
  });

  it('loads haptic feedback setting and toggles it', async () => {

    const { getByRole, getByTestId } = render(<Settings navigation={navigationMock} />);

    // Toggle haptic feedback
    const hapticFeedbackSwitch = getByTestId('haptic-feedback-switch');
    fireEvent(hapticFeedbackSwitch, 'valueChange', true);
    expect(Storage.setItem).toHaveBeenCalledWith('@hapticFeedbackEnabled', 'true');

    await waitFor(() => expect(getByRole('switch').props.value).toBe(true));
    
  });

  it.skip("loads and displays initial settings", async () => {
    Storage.getItem
      .mockResolvedValueOnce("testUser") // Mock username
      .mockResolvedValueOnce("true")     // Mock haptic feedback enabled
      .mockResolvedValueOnce("dark");    // Mock theme

    const { getByText, getByRole  } = render(<Settings navigation={navigationMock} />);

    await waitFor(() => expect(getByText('testUser')).toBeTruthy());
    await waitFor(() => expect(getByRole('switch').props.value).toBe(true));
    await waitFor(() => expect(getByText('dark')).toBeTruthy());

    // const usernameDisplay = await findByText("testUser");
    // const hapticFeedbackSwitch = await findByTestId("haptic-feedback-switch");
    // const themeSelector = await findByTestId("theme-selector");

    // expect(usernameDisplay).toBeTruthy();
    // expect(hapticFeedbackSwitch.props.value).toBe(true);
    // expect(themeSelector.props.value).toBe("dark");
  });

  // it("updates theme setting when changed", async () => {
  //   const { findByTestId } = render(<Settings navigation={navigationMock} />);
  //   const themeSelector = await findByTestId("theme-selector");

  //   fireEvent(themeSelector, 'valueChange', 'light');
  //   await waitFor(() => {
  //     expect(Storage.setItem).toHaveBeenCalledWith("@theme", "light");
  //   });
  // });

  it.skip("updates local storage after successful theme change", async () => {
    const { findByTestId } = render(<Settings navigation={navigationMock} />);
    const themeSelector = await findByTestId("theme-selector");

    fireEvent(themeSelector, 'onValueChange', 'dark');

    await waitFor(() => {
      expect(Storage.setItem).toHaveBeenCalledWith("@theme", "dark");
    });
  });

  it.skip("reflects the change in UI when the theme is changed", async () => {
    const { findByTestId, getByTestId } = render(<Settings navigation={navigationMock} />);
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

    expect(Alert.alert).toHaveBeenCalledWith(
      'Terms of Use',
      'Read the terms of use?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Read', onPress: expect.any(Function) }
      ]
    );

    const termsAlertAction = Alert.alert.mock.calls[0][2][1].onPress;
    termsAlertAction();

    await waitFor(() => {
      expect(navigationMock.navigate).toHaveBeenCalledWith("Terms of Use");
    });
  });

  it("opens the Privacy Policy in a web browser when selected", async () => {
    WebBrowser.openBrowserAsync = jest.fn();
    const { findByTestId } = render(<Settings />);
    const privacyPolicyButton = await findByTestId("privacy-policy-button");

    fireEvent.press(privacyPolicyButton);

    expect(Alert.alert).toHaveBeenCalledWith(
      'Privacy Policy',
      'Read the privacy policy?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Read', onPress: expect.any(Function) }
      ]
    );

    const privacyAlertAction = Alert.alert.mock.calls[0][2][1].onPress;
    privacyAlertAction();

    await waitFor(() => {
      expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith("https://drive.google.com/file/d/15TGCUb7dvpNorO9IcGfiyDL60WatPa07/edit");
    });
  });

  it("deletes the user account when confirmed", async () => {
    axios.delete.mockResolvedValue({ status: 200 }); // Assume the API responds correctly on successful deletion

    const { findByTestId } = render(<Settings />);
    const deleteAccountButton = await findByTestId("delete-account-button");

    fireEvent.press(deleteAccountButton);

    expect(Alert.alert).toHaveBeenCalledWith(
      'Delete Account',
      'Are you sure you want to delete your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: expect.any(Function) }
      ]
    );

    const deleteAlertAction = Alert.alert.mock.calls[0][2][1].onPress;
    deleteAlertAction();

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${API_URL}/delete_user/`,
        { username: 'testUser' },
        {
          headers: {
            "X-CSRFToken": 'dummyCsrfToken',
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
    });


    // Assume there's a confirmation dialog, and you simulate pressing the "Confirm" button
    // const confirmButton = await findByTestId("confirm-delete-button");
    // fireEvent.press(confirmButton);

    // await waitFor(() => {
    //   expect(axios.delete).toHaveBeenCalledWith(`${API_URL}/deleteUser`);
    //   // Optionally, check if the user is redirected to the login screen or logged out
    //   expect(navigationMock.navigate).toHaveBeenCalledWith("LoginScreen");
    // });
  });


});