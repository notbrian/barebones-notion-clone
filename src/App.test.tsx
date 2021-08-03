import React from "react";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import App from "./App";

afterEach(cleanup);
test("renders app without errors", () => {
  render(<App />);
});

test("renders top level elements", () => {
  render(<App />);
  const node = screen.getByText(/editable 3/i);
  expect(node).toBeInTheDocument();
});

test("renders nested elements", () => {
  render(<App />);
  const node = screen.getByText(/Child 2/i);
  expect(node).toBeInTheDocument();
});

test("creates a new block on enter", () => {
  render(<App />);
  const node = screen.getByText(/Child 2/i);
  fireEvent.keyDown(node, { key: "Enter" });
  const newNode = screen.getByText(/New Text/i);
});
