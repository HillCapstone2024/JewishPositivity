import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import axios from "axios";
import CheckIn from "../screens/home/CheckIn";

//mock axios call
jest.mock("axios");

const mockNavigation = {
    goBack: jest.fn(),
};

const mockRoute = {
    params: { checkInType: 'ModehAni' },
};

jest.mock("@react-native-async-storage/async-storage", () => ({
    getItem: jest.fn(() => Promise.resolve('test_user')),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
}));

describe("Journal Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Successfully renders input and submit button, type of checkin, and reflection. Additionally does a correct checkin", async () => {
    const mockGetResponse = { data: 'test_user' };
    axios.get.mockResolvedValueOnce(mockGetResponse);

    const {getByTestId, getByText, getByPlaceholderText} = render(<CheckIn navigation={mockNavigation} route={mockRoute} />);

    await waitFor(() => {
      expect(getByTestId("CheckInInput")).toBeTruthy();
      expect(getByTestId("submitButton")).toBeTruthy();
      expect(getByText('Modeh Ani - Gratitude')).toBeTruthy();
      expect(getByPlaceholderText('Enter reflection here…')).toBeTruthy();
    });

    fireEvent.changeText(getByPlaceholderText('Enter reflection here…'), 'This is a test check-in.');

    // Mock the axios post response
    axios.post.mockResolvedValueOnce({ data: { success: true } });

    fireEvent.press(getByTestId("submitButton"));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/check-in/'),
        expect.objectContaining({
          username: 'test_user',
          moment_number: 1,
          content: expect.any(String),
          content_type: 'text',
          text_entry: 'This is a test check-in.',
        }),
        expect.any(Object)
      );
      expect(mockNavigation.goBack).toHaveBeenCalled();
    });

  });

  // displays specific checkin moment
  // opens photos
  // opens camera
  // takes photo
  // takes video
  // records voice
  // check bar dismises keyboard
  //gets username from async storage
  //deletes photo/video/recording


});