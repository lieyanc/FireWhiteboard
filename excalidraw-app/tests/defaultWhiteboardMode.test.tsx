import { render, waitFor } from "@excalidraw/excalidraw/tests/test-utils";

import ExcalidrawApp from "../App";

const { h } = window;

describe("default whiteboard mode", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("enters whiteboard mode by default on a fresh load", async () => {
    await render(<ExcalidrawApp />);

    await waitFor(() => {
      expect(h.state.whiteboardMode).toBe(true);
      expect(h.state.freedrawSmoothingEnabled).toBe(false);
      expect(h.state.lowLatencyDrawingEnabled).toBe(false);
    });
  });
});
