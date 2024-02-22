import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import axios from "axios";
import Login from "../Login";

//mock axios call
jest.mock("axios");

describe("Login Component", () => {
  it("can do simple jest test", () => {
    expect(1 + 2).toBe(3);
  });
  it("successfully renders login and signup buttons", () => {
    const { getByText } = render(<Login />);
    expect(getByText("Login")).toBeTruthy();
    expect(getByText("Sign Up")).toBeTruthy();
  });

  it("successfully handles missing username and password", async () => {
    const { getByText } = render(<Login />);
    fireEvent.press(getByText("Login"));
    expect(getByText("Enter a Username and Password")).toBeTruthy();
  });

  it("successfully handles missing password", async () => {
    const { getByTestId } = render(<Login />);
    const { getByText } = render(<Login />);
    const usernameInput = getByTestId("usernameInput");
    fireEvent.changeText(usernameInput, "testing");
    fireEvent.press(getByText("Login"));
    expect(usernameInput.props.value).toBe("testing");
    expect(getByText("Enter a Password")).toBeTruthy();
  });

  it("successfully handles missing username", async () => {
    const { getByTestId } = render(<Login />);
    const { getByText } = render(<Login />);
    const passwordInput = getByTestId("passwordInput");
    fireEvent.changeText(passwordInput, "testing");
    fireEvent.press(getByText("Login"));
    expect(passwordInput.props.value).toBe("testing");
    expect(getByText("Enter a Username")).not.toBeNull();
  });

  it.skip("successfully calls the backend for successful login", async () => {
    const mockLoginResponse = { data: "Login Successful!" };
    axios.post.mockResolvedValue(mockLoginResponse);

    const { getByText } = render(<Login navigation={navigationMock} />);
    fireEvent.changeText(getByText("Username"), "testuser");
    fireEvent.changeText(getByText("Password"), "password");
    fireEvent.press(getByText("Login"));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("Signup");
      name;
    });
  });

  it.skip("successfully calls the backend for unsuccessful login", async () => {
    const mockLoginResponse = { data: "Login unSuccessful!" };
    axios.post.mockResolvedValue(mockLoginResponse);

    const { getByText } = render(<Login navigation={navigationMock} />);
    fireEvent.changeText(getByText("Username"), "testuser");
    fireEvent.changeText(getByText("Password"), "password");
    fireEvent.press(getByText("Login"));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("Signup");
    });
  });
});
