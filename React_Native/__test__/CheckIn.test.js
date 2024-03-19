import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import axios from "axios";
import JournalEntry from "../screens/home/CheckIn";

//mock axios call
jest.mock("axios");
const mockNavigate = jest.fn();
const navigationMock = {
    navigate: mockNavigate,
}

jest.mock("@react-native-async-storage/async-storage", () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
}));

describe("Journal Component", () => {
    it("Successfully renders journal input", () => {
        const {getByTestId} = render(<JournalEntry/>);
        expect(getByTestId("journalInput")).toBeTruthy();
    });



    // opens photos
    // opens camera
    // takes photo
    // takes video
    // records voice
    // check bar dismises keyboard
    // axios post works
    //gets username from async storage
    //deletes photo/video/recording


});