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

describe("Times Component", () => {
  it("loads with default times and username", async () => {
    Storage.getItem.mockResolvedValue("@username", "testUser");
    const { getByText, getByTestId } = render(
      <Times navigation={navigationMock} />
    );

    await waitFor(() => {
      expect(getByTestId("timeOneText").props.children).toContain("8:00:00 AM");
      expect(getByTestId("timeTwoText").props.children).toContain("3:00:00 PM");
      expect(getByTestId("timeThreeText").props.children).toContain(
        "9:00:00 PM"
      );
    });
  });
  it("updates time when a new time is selected from picker", async () => {
    const { getByTestId } = render(<Times navigation={navigationMock} />);
    fireEvent.press(getByTestId("dateTimePicker1"));
    fireEvent(
      getByTestId("dateTimePickerModal1"),
      "onConfirm",
      new Date(2024, 2, 28, 11, 0, 0)
    );

    await waitFor(() => {
      expect(getByTestId("timeOneText").props.children).toContain(
        "11:00:00 AM"
      );
    });
  });
  it("submits time changes successfully", async () => {
    axios.get.mockResolvedValue({
      data: { csrfToken: "test-csrf-token" },
    });
    const mockLoginResponse = {
      data: "Success! Times have been updated",
    };
    axios.post.mockResolvedValue(mockLoginResponse);

    const { getByText, getByTestId } = render(
      <Times navigation={navigationMock} />
    );
    fireEvent.press(getByTestId("dateTimePicker1"));
    fireEvent(
      getByTestId("dateTimePickerModal1"),
      "onConfirm",
      new Date(2024, 2, 28, 11, 0, 0)
    );
    fireEvent.press(getByText("Submit Changes"));
    axios.post.mockResolvedValue(mockLoginResponse);
    await waitFor(() => {
      expect(getByText("Times Changed Successfully")).toBeTruthy();
    });
  });
});
