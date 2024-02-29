//Here is where unit tests for Times page will go

import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import axios from "axios";
import Times from "../Times";

jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(() => Promise.resolve(null)), // Adjust this as needed for your tests
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

describe("Times Component", () => {
    it("successfully renders the page", () => {
    const { getByText } = render(<Times />);
    // expect(getByText("Times")).toBeTruthy();
    });
});