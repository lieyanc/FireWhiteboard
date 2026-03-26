import React from "react";

import { Excalidraw } from "../index";

import { API } from "./helpers/api";
import { act, fireEvent, render, waitFor } from "./test-utils";

const { h } = window;

describe("WhiteboardToolbar", () => {
  it("switches to pen when selecting a stroke color", async () => {
    const { container } = await render(<Excalidraw />);

    API.setAppState({ whiteboardMode: true });

    act(() => {
      h.app.setActiveTool({ type: "eraser" });
    });

    await waitFor(() => {
      expect(
        container.querySelectorAll(".whiteboard-toolbar__color-option--inline")
          .length,
      ).toBeGreaterThan(1);
    });

    const swatches = container.querySelectorAll(
      ".whiteboard-toolbar__color-option--inline",
    );

    fireEvent.click(swatches[1]!);

    await waitFor(() => {
      expect(h.state.currentItemStrokeColor).toBe("#e03131");
      expect(h.state.activeTool.type).toBe("freedraw");
    });
  });
});
