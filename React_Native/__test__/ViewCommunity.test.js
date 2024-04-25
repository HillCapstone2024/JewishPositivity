import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import ViewCommunity from "../screens/home/ViewCommunity"; // Adjust the import based on your actual file path
import axios from "axios";
import * as Storage from "../AsyncStorage.js"; // Assuming this is the path

// Mocks
jest.mock("axios");

jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Navigation mock
const mockGoBack = jest.fn();
const mockNavigate = jest.fn();
const mockRoute = {
  params: {
    community: {
      community_name: "Test Community",
      community_description: "A place to test things",
      community_photo: "photo_url_base64",
      owner_id: "1",
      date_created: "2024-04-24",
    },
  },
};

describes.skip("ViewCommunity", () => {
  beforeEach(() => {
    // Setup or cleanup any mocks here
    // Storage.getItem.mockResolvedValue("testUsername");
    axios.get.mockResolvedValue({
      data: [{ username: "user1", profile_picture: "url1" }],
    });
  });

  it("renders community information correctly", async () => {
    const { getByText, findByText } = render(
      <ViewCommunity
        route={mockRoute}
        navigation={{ goBack: mockGoBack, navigate: mockNavigate }}
      />
    );

    await waitFor(() => {
      expect(getByText("Test Community")).toBeTruthy();
      expect(getByText("A place to test things")).toBeTruthy();
    });
  });

  it("handles bio expansion correctly", async () => {
    const { getByText } = render(
      <ViewCommunity
        route={mockRoute}
        navigation={{ goBack: mockGoBack, navigate: mockNavigate }}
      />
    );

    const bioText = getByText("A place to test things");
    fireEvent.press(bioText);

    await waitFor(() => {
      expect(bioText.props.numberOfLines).toBeUndefined(); // Checking if the bio text is expanded
    });
  });

  it("navigates back on community leave", async () => {
    axios.post.mockResolvedValue({ data: "leave success" }); // Mock leaving the community
    const { getByText } = render(
      <ViewCommunity
        route={mockRoute}
        navigation={{ goBack: mockGoBack, navigate: mockNavigate }}
      />
    );

    const leaveButton = getByText("Leave Community");
    fireEvent.press(leaveButton);

    await waitFor(() => {
      expect(mockGoBack).toHaveBeenCalled(); // Check if navigated back after leaving
    });
  });
});
