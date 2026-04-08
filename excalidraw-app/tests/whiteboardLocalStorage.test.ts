import { newElement, newFreeDrawElement } from "@excalidraw/element";
import { pointFrom } from "@excalidraw/math";
import { restoreElements } from "@excalidraw/excalidraw/data/restore";

import {
  parseElementsFromLocalStorageString,
  serializeElementsForLocalStorage,
  setWhiteboardCompactLocalStoragePreference,
} from "../data/localStorage";

import type { ExcalidrawElement } from "@excalidraw/element/types";

const toComparableElements = (elements: readonly ExcalidrawElement[]) =>
  restoreElements(elements, null, {
    repairBindings: true,
    deleteInvisibleElements: true,
  }).map((element) => {
    if (element.type === "freedraw") {
      return {
        id: element.id,
        type: element.type,
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height,
        strokeColor: element.strokeColor,
        strokeWidth: element.strokeWidth,
        points: element.points,
        pressures: element.pressures,
        simulatePressure: element.simulatePressure,
        freedrawSmoothingEnabled: element.freedrawSmoothingEnabled,
      };
    }

    return {
      id: element.id,
      type: element.type,
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
      strokeColor: element.strokeColor,
      backgroundColor: element.backgroundColor,
    };
  });

describe("whiteboard localStorage compaction", () => {
  beforeEach(() => {
    localStorage.clear();
    setWhiteboardCompactLocalStoragePreference(false);
  });

  it("compresses whiteboard freedraw elements when the preference is enabled", () => {
    setWhiteboardCompactLocalStoragePreference(true);

    const stroke = {
      ...newFreeDrawElement({
        type: "freedraw",
        x: 120,
        y: 80,
        width: 40,
        height: 30,
        strokeColor: "#018eee",
        strokeWidth: 4,
        simulatePressure: false,
        pressures: [0.35, 0.42, 0.51],
        points: [
          pointFrom(0, 0),
          pointFrom(10, 8),
          pointFrom(18, 14),
        ],
        freedrawSmoothingEnabled: false,
      }),
      id: "stroke-1",
    };

    const serialized = serializeElementsForLocalStorage([stroke], {
      whiteboardMode: true,
    });
    const parsed = JSON.parse(serialized);

    expect(Array.isArray(parsed)).toBe(false);
    expect(parsed.format).toBe("firewhiteboard-whiteboard-elements-v1");

    expect(
      toComparableElements(parseElementsFromLocalStorageString(serialized)),
    ).toEqual(toComparableElements([stroke]));
  });

  it("keeps unsupported elements alongside compressed strokes", () => {
    setWhiteboardCompactLocalStoragePreference(true);

    const stroke = {
      ...newFreeDrawElement({
        type: "freedraw",
        x: 10,
        y: 20,
        width: 20,
        height: 10,
        strokeColor: "#e60012",
        simulatePressure: true,
        points: [pointFrom(0, 0), pointFrom(12, 6)],
        freedrawSmoothingEnabled: false,
      }),
      id: "stroke-2",
    };
    const rectangle = {
      ...newElement({
        type: "rectangle",
        x: 200,
        y: 160,
        width: 100,
        height: 60,
        strokeColor: "#1e1e1e",
        backgroundColor: "transparent",
      }),
      id: "rect-1",
    };

    const serialized = serializeElementsForLocalStorage([stroke, rectangle], {
      whiteboardMode: true,
    });

    expect(
      toComparableElements(parseElementsFromLocalStorageString(serialized)),
    ).toEqual(toComparableElements([stroke, rectangle]));
  });

  it("falls back to plain JSON when the preference is disabled", () => {
    const stroke = {
      ...newFreeDrawElement({
        type: "freedraw",
        x: 0,
        y: 0,
        width: 12,
        height: 12,
        strokeColor: "#2f9e44",
        simulatePressure: true,
        points: [pointFrom(0, 0), pointFrom(6, 6)],
        freedrawSmoothingEnabled: false,
      }),
      id: "stroke-3",
    };

    const serialized = serializeElementsForLocalStorage([stroke], {
      whiteboardMode: true,
    });

    expect(Array.isArray(JSON.parse(serialized))).toBe(true);
  });
});
