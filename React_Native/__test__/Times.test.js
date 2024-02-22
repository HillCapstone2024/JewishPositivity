//Here is where unit tests for Times page will go

import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import axios from "axios";
import Times from "../Times";

describe("Times Component", () => {
    it("successfully renders the page", () => {
    const { getByText } = render(<Times />);
    expect(getByText("Times")).toBeTruthy();
    });
});