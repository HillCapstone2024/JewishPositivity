import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { act } from "react-test-renderer";
import axios from "axios";
import { cleanup } from "@testing-library/react-native";

import FriendFeed from "../screens/home/FriendFeed";

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

describes.skip("FriendFeed", () => {
    afterEach(() => {
        cleanup();
        jest.resetAllMocks();
    });
    it("renders correctly", async () => {
        const { getByTestId } = render(<FriendFeed />);
        await waitFor(() => expect(getByTestId("loading-screen")).toBeTruthy());
    });

    it("displays the loading screen before data is fetched", () => {
        const { getByTestId } = render(<FriendFeed />);
        expect(getByTestId("loading-screen")).not.toBeNull();
    });

    it("fetches data and updates state on mount", async () => {
        axios.get.mockResolvedValue({ data: { csrfToken: "test-csrf-token" } });
        const mockFetch = axios.get.mockResolvedValue({
        data: { friends: [], posts: [], profilePics: {} },
        });

        let component;
        component = render(<FriendFeed />);

        await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
        expect(component.getByTestId("flat-list")).not.toBeNull();
        });

        mockFetch.mockRestore();
  });

  it("displays an image for a post with image content type", async () => {
    // Mock data for the post
    const mockPostData = {
      data: [
        {
          checkin_id: "1",
          username: "testuser",
          date: "2021-07-21",
          content: "iVBORw0KGgoAAAANSUhEUgAAAAUA...",
          content_type: "image",
          moment_number: 1,
          text_entry: "This is a test post with an image.",
        },
      ],
    };

    axios.get.mockResolvedValue(mockPostData);
    const { findByTestId } = render(<FriendFeed />);
    const image = await findByTestId(
    `image-${mockPostData.data[0].checkin_id}`
    );

    expect(image).toBeTruthy(); // This checks that the image is rendered
    });

    it("displays an video for a post with video content type", async () => {
    // Mock data for the post
    const mockPostData = {
        data: [
            {
            checkin_id: "2",
            username: "testuser",
            date: "2021-07-21",
            content: "iVBORw0KGgoAAAANSUhEUgAAAAUA...",
            content_type: "video",
            moment_number: 1,
            text_entry: "This is a test post with an video.",
            },
        ],
    };

    axios.get.mockResolvedValue(mockPostData);
    const { findByTestId } = render(<FriendFeed />);
    const video = await findByTestId(
    `video-${mockPostData.data[0].checkin_id}`
    );

    expect(video).toBeTruthy(); // This checks that the image is rendered
    });

    it.skip("displays an recording for a post with recording content type", async () => {
    // Mock data for the post
    const mockPostData = {
        data: [
            {
            checkin_id: "3",
            username: "testuser",
            date: "2021-07-21",
            content: "iVBORw0KGgoAAAANSUhEUgAAAAUA...",
            content_type: "recording",
            moment_number: 1,
            text_entry: "This is a test post with an recording.",
            },
        ],
    };

    axios.get.mockResolvedValue({ data: mockPostData });
    const { findByTestId } = render(<FriendFeed />);
    const recording = await findByTestId(
    `recording-${mockPostData.data[0].checkin_id}`
    );

    expect(recording).toBeTruthy();
    });

    it('displays "Modeh Ani" when moment number is 1', async () => {
      // Mock data reflecting moment_number as 1
      const mockPostData = {
        data: [
          {
            checkin_id: "1",
            username: "testuser",
            date: "2021-07-21",
            content: "sampleContent",
            content_type: "text",
            moment_number: 1,
            text_entry: "This is a test post.",
          },
        ],
      };

      // Setup axios mock to return this data
      axios.get.mockResolvedValue(mockPostData);

      const { findByText } = render(<FriendFeed />);

      // Use findByText to locate "Modeh Ani"
      const modehAniText = await findByText("Modeh Ani");

      expect(modehAniText).toBeTruthy(); // Validates that "Modeh Ani" is indeed on the screen
    });

    it("renders usernames after fetching friends list", async () => {
        // Mock data returned by the axios call
        const mockFriendsData = {
          data: [
            { username: "mnelson", status: true },
            { username: "admin", status: true },
          ],
        };

        // Mocking axios.get to resolve to mockFriendsData
        axios.get.mockResolvedValue(mockFriendsData);

        // Render the FriendFeed component
        const { findByTestId } = render(<FriendFeed />);

        // Assertions to check if the usernames are in the document
        const usernameMnelson = await findByTestId(`usernameList-mnelson`);
        const usernameAdmin = await findByTestId(`usernameList-admin`);
        // const usernameJane = await findByText("admin");

        expect(usernameMnelson).toBeTruthy();
        expect(usernameAdmin).toBeTruthy();
        // expect(usernameJane).toBeTruthy();
      });
});

//test cases TODO
//loads recording correctly
//refresh works
//when click on element, modal appears at top
