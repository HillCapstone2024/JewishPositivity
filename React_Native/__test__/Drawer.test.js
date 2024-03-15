import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import axios from "axios";
import MyDrawer from "../navigations/DrawerNavigator.js";
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

// jest.mock("alert");

describe("Drawer Component", () => {
    it.skip("displays username and generates avatar on load", async () => {
        const username = "testUser";
        Storage.getItem.mockResolvedValue(username);
        const { findByText, findByTestId } = render(<MyDrawer />);

        expect(await findByText(username)).toBeTruthy();
        await waitFor(() => {
            expect(getByTestId("usernameText").props.children).toContain(
            username
            );
        });
    });

    it.skip("navigates to profile page when profile item is pressed", () => {

        const { getByTestId } = render(
          <MyDrawer navigation={navigationMock} />
        );

        fireEvent.press(getByTestId("profileButton"));
        expect(mockNavigate).toHaveBeenCalledWith("UserProfile");
    });
    it.skip("navigates to settings page when settings item is pressed", () => {
        const navigateMock = jest.fn();

        const { getByTestId } = render(
          <MyDrawer navigation={navigationMock} />
        );

        fireEvent.press(getByTestId("profileButton"));
        expect(navigateMock).toHaveBeenCalledWith("SettingsPage");
    });

    it.skip("initiates logout process when logout drawer item is pressed", () => {
        const removeItemMock = Storage.removeItem.mockResolvedValue();
        const resetMock = jest.fn();

        useNavigation.mockReturnValue({ navigate: jest.fn(), reset: resetMock });
        render(<MyDrawer />);

        fireEvent.press(getByText("Logout"));
        expect(Alert.alert).toHaveBeenCalledWith(
            "Logout?",
            "Are you sure you want to log out?",
            expect.anything() // This is to match the structure of the buttons array
        );

        // Simulate the Logout confirmation by pressing the Logout button in the Alert dialog
        // Note: This step assumes you have a way to simulate pressing the 'Logout' button in the alert dialog
        // which might involve more complex mocking or a different testing approach
    });
});
