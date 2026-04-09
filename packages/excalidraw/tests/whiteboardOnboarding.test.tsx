import React from "react";
import { afterEach, vi } from "vitest";

import { Excalidraw } from "../index";

import { API } from "./helpers/api";
import { fireEvent, render, waitFor } from "./test-utils";

const installFullscreenMock = () => {
  let fullscreenElement: Element | null = null;
  const originalFullscreenEnabled = Object.getOwnPropertyDescriptor(
    document,
    "fullscreenEnabled",
  );
  const originalFullscreenElement = Object.getOwnPropertyDescriptor(
    document,
    "fullscreenElement",
  );
  const originalRequestFullscreen = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "requestFullscreen",
  );

  const requestFullscreen = vi.fn(async function (this: Element) {
    fullscreenElement = this;
    fireEvent(document, new Event("fullscreenchange"));
  });

  Object.defineProperty(document, "fullscreenEnabled", {
    configurable: true,
    value: true,
  });
  Object.defineProperty(document, "fullscreenElement", {
    configurable: true,
    get: () => fullscreenElement,
  });
  Object.defineProperty(HTMLElement.prototype, "requestFullscreen", {
    configurable: true,
    value: requestFullscreen,
  });

  return {
    requestFullscreen,
    enterFullscreen(element: Element) {
      fullscreenElement = element;
      fireEvent(document, new Event("fullscreenchange"));
    },
    exitFullscreen() {
      fullscreenElement = null;
      fireEvent(document, new Event("fullscreenchange"));
    },
    restore() {
      if (originalFullscreenEnabled) {
        Object.defineProperty(
          document,
          "fullscreenEnabled",
          originalFullscreenEnabled,
        );
      } else {
        Reflect.deleteProperty(document, "fullscreenEnabled");
      }

      if (originalFullscreenElement) {
        Object.defineProperty(
          document,
          "fullscreenElement",
          originalFullscreenElement,
        );
      } else {
        Reflect.deleteProperty(document, "fullscreenElement");
      }

      if (originalRequestFullscreen) {
        Object.defineProperty(
          HTMLElement.prototype,
          "requestFullscreen",
          originalRequestFullscreen,
        );
      } else {
        Reflect.deleteProperty(HTMLElement.prototype, "requestFullscreen");
      }
    },
  };
};

afterEach(() => {
  vi.restoreAllMocks();
});

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

  it("shows a fullscreen interruption dialog after exiting fullscreen in whiteboard mode", async () => {
    const fullscreenMock = installFullscreenMock();
    const { container, getByText, queryByText } = await render(<Excalidraw />);
    const excalidrawContainer = container.querySelector(
      ".excalidraw-container",
    ) as HTMLElement | null;

    expect(excalidrawContainer).not.toBeNull();

    try {
      API.setAppState({ whiteboardMode: true });

      await waitFor(() => {
        expect(getByText("Enter fullscreen")).toBeInTheDocument();
      });

      fireEvent.click(getByText("Enter fullscreen"));

      await waitFor(() => {
        expect(fullscreenMock.requestFullscreen).toHaveBeenCalledTimes(1);
      });

      fullscreenMock.exitFullscreen();

      await waitFor(() => {
        expect(getByText("Fullscreen exited")).toBeInTheDocument();
        expect(getByText("Ignore this session")).toBeInTheDocument();
        expect(getByText("Return to fullscreen")).toBeInTheDocument();
      });

      fireEvent.click(getByText("Ignore this session"));

      await waitFor(() => {
        expect(queryByText("Fullscreen exited")).not.toBeInTheDocument();
      });

      fullscreenMock.enterFullscreen(excalidrawContainer!);
      fullscreenMock.exitFullscreen();

      await waitFor(() => {
        expect(queryByText("Fullscreen exited")).not.toBeInTheDocument();
      });
    } finally {
      fullscreenMock.restore();
    }
  });

  it("can return to fullscreen from the interruption dialog", async () => {
    const fullscreenMock = installFullscreenMock();
    const { getByText, queryByText } = await render(<Excalidraw />);

    try {
      API.setAppState({ whiteboardMode: true });

      await waitFor(() => {
        expect(getByText("Enter fullscreen")).toBeInTheDocument();
      });

      fireEvent.click(getByText("Enter fullscreen"));

      await waitFor(() => {
        expect(fullscreenMock.requestFullscreen).toHaveBeenCalledTimes(1);
      });

      fullscreenMock.exitFullscreen();

      await waitFor(() => {
        expect(getByText("Return to fullscreen")).toBeInTheDocument();
      });

      fireEvent.click(getByText("Return to fullscreen"));

      await waitFor(() => {
        expect(fullscreenMock.requestFullscreen).toHaveBeenCalledTimes(2);
        expect(queryByText("Fullscreen exited")).not.toBeInTheDocument();
      });
    } finally {
      fullscreenMock.restore();
    }
  });
});
