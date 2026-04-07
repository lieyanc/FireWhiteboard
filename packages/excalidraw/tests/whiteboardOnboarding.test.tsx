import React from "react";

import { Excalidraw } from "../index";

import { API } from "./helpers/api";
import { render, waitFor } from "./test-utils";

describe("Whiteboard onboarding", () => {
  it("shows that stroke prediction is disabled by default in whiteboard mode", async () => {
    const { getByText } = await render(<Excalidraw />);

    API.setAppState({ whiteboardMode: true });

    await waitFor(() => {
      expect(getByText("Whiteboard mode")).toBeInTheDocument();
      expect(
        getByText(
          "Stroke prediction & stabilization is off by default in whiteboard mode. You can turn it back on from the menu if needed.",
        ),
      ).toBeInTheDocument();
    });
  });
});
