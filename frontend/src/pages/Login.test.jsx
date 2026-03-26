import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Login from "./login";

vi.mock("axios", () => ({
  default: { post: vi.fn() },
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

import axios from "axios";

const renderLogin = () =>
  render(<MemoryRouter><Login /></MemoryRouter>);

beforeEach(() => { vi.clearAllMocks(); localStorage.clear(); });
afterEach(() => { localStorage.clear(); });

describe("Login Page", () => {

  it("renders the login form with username, password, and submit button", () => {
    renderLogin();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows a validation error when username and password are empty", async () => {
    renderLogin();
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));
    expect(await screen.findByText(/username and password are required/i)).toBeInTheDocument();
    expect(axios.post).not.toHaveBeenCalled();
  });

  it("displays an error message when the login API call fails", async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { message: "Invalid credentials" } },
    });
    renderLogin();
    await userEvent.type(screen.getByLabelText(/username/i), "wronguser");
    await userEvent.type(screen.getByLabelText(/password/i), "badpassword");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));
    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("stores the JWT token and role in localStorage on successful login", async () => {
    axios.post.mockResolvedValueOnce({
      data: { token: "fake-jwt-token-xyz", role: "admin" },
    });
    renderLogin();
    await userEvent.type(screen.getByLabelText(/username/i), "adminuser");
    await userEvent.type(screen.getByLabelText(/password/i), "securepassword");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => {
      expect(localStorage.getItem("token")).toBe("fake-jwt-token-xyz");
      expect(localStorage.getItem("role")).toBe("admin");
    });
  });

  it("redirects to the home page after a successful login", async () => {
    axios.post.mockResolvedValueOnce({
      data: { token: "fake-jwt-token-xyz", role: "employee" },
    });
    renderLogin();
    await userEvent.type(screen.getByLabelText(/username/i), "empuser");
    await userEvent.type(screen.getByLabelText(/password/i), "mypassword");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("shows a generic fallback error when the API response has no message", async () => {
    axios.post.mockRejectedValueOnce(new Error("Network Error"));
    renderLogin();
    await userEvent.type(screen.getByLabelText(/username/i), "user");
    await userEvent.type(screen.getByLabelText(/password/i), "somepassword");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));
    expect(await screen.findByText(/login failed\. please try again/i)).toBeInTheDocument();
  });

});