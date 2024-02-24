import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import axios from "axios";
import Signup from "../Signup";

//mock axios call
jest.mock("axios");

describe("Signup Component", () => {
  it("successfully renders login and signup buttons", () => {
    const { getByText } = render(<Signup />);
    expect(getByText("Already a Member?")).toBeTruthy();
    expect(getByText("Sign Up")).toBeTruthy();
  });

  it.skip("successfully handles missing credentials", async () => {
    const { getByTestId, getByText } = render(<Signup />);
    fireEvent.press(getByTestId("signupButton"));
    expect(getByText("Please enter missing credentials")).toBeTruthy();
  });


  it.skip("successfully calls the backend for successful Signup", async () => {
  });

  it.skip("successfully calls the backend for unsuccessful Signup", async () => {
  });
});
