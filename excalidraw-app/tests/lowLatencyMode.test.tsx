import { fireEvent } from "@testing-library/react";

import {
  render,
  toggleMenu,
  waitFor,
} from "@excalidraw/excalidraw/tests/test-utils";

import ExcalidrawApp from "../App";

const { h } = window;

describe("low latency mode", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("toggles from the whiteboard main menu", async () => {
    const { container, getByTestId } = await render(<ExcalidrawApp />);

    toggleMenu(container);
    fireEvent.click(getByTestId("toggle-low-latency-mode"));

    await waitFor(() => {
      expect(h.state.lowLatencyDrawingEnabled).toBe(true);
    });

    toggleMenu(container);
    fireEvent.click(getByTestId("toggle-low-latency-mode"));

    await waitFor(() => {
      expect(h.state.lowLatencyDrawingEnabled).toBe(false);
    });
  });
});
