import { DEFAULT_ELEMENT_PROPS } from "@excalidraw/common";
import { pointFrom } from "@excalidraw/math";

import type {
  ExcalidrawElement,
  ExcalidrawFreeDrawElement,
} from "@excalidraw/element/types";
import type { LocalPoint } from "@excalidraw/math";

const WHITEBOARD_LOCAL_STORAGE_ELEMENTS_FORMAT =
  "firewhiteboard-whiteboard-elements-v1";

const WHITEBOARD_STROKE_PALETTE = [
  "#1e1e1e",
  "#e60012",
  "#2f9e44",
  "#018eee",
  "#f08c00",
  "#6741d9",
  "#0c8599",
  "#e8590c",
  "#000000",
  "#868e96",
] as const;

type CompactWhiteboardStroke = {
  i: string;
  b: [number, number, number, number];
  c: number | string;
  d: number[];
  s?: number;
  p?: number[];
  m?: 0;
};

type CompactWhiteboardElements = {
  format: typeof WHITEBOARD_LOCAL_STORAGE_ELEMENTS_FORMAT;
  palette: readonly string[];
  strokes: CompactWhiteboardStroke[];
  extras?: ExcalidrawElement[];
};

const encodePoints = (points: readonly LocalPoint[]) => {
  if (!points.length) {
    return [];
  }

  const encoded = [points[0][0], points[0][1]];
  let previousX = points[0][0];
  let previousY = points[0][1];

  for (let index = 1; index < points.length; index += 1) {
    const [x, y] = points[index];
    encoded.push(x - previousX, y - previousY);
    previousX = x;
    previousY = y;
  }

  return encoded;
};

const decodePoints = (encoded: readonly number[]): readonly LocalPoint[] => {
  if (encoded.length < 2) {
    return [];
  }

  const points = [
    pointFrom<LocalPoint>(encoded[0], encoded[1]),
  ] as LocalPoint[];
  let previousX = encoded[0];
  let previousY = encoded[1];

  for (let index = 2; index + 1 < encoded.length; index += 2) {
    previousX += encoded[index];
    previousY += encoded[index + 1];
    points.push(pointFrom<LocalPoint>(previousX, previousY));
  }

  return points;
};

const encodeStrokeColor = (color: string) => {
  const paletteIndex = WHITEBOARD_STROKE_PALETTE.indexOf(
    color as (typeof WHITEBOARD_STROKE_PALETTE)[number],
  );
  return paletteIndex >= 0 ? paletteIndex : color;
};

const decodeStrokeColor = (
  color: CompactWhiteboardStroke["c"],
  palette: readonly string[],
) => {
  if (typeof color === "number") {
    return palette[color] || DEFAULT_ELEMENT_PROPS.strokeColor;
  }
  return color;
};

const isCompressibleWhiteboardStroke = (
  element: ExcalidrawElement,
): element is ExcalidrawFreeDrawElement => {
  return (
    element.type === "freedraw" &&
    !element.isDeleted &&
    element.backgroundColor === DEFAULT_ELEMENT_PROPS.backgroundColor &&
    element.fillStyle === DEFAULT_ELEMENT_PROPS.fillStyle &&
    element.strokeStyle === DEFAULT_ELEMENT_PROPS.strokeStyle &&
    element.roughness === DEFAULT_ELEMENT_PROPS.roughness &&
    element.opacity === DEFAULT_ELEMENT_PROPS.opacity &&
    element.roundness === null &&
    element.frameId === null &&
    element.groupIds.length === 0 &&
    (element.boundElements?.length ?? 0) === 0 &&
    element.link === null &&
    element.locked === DEFAULT_ELEMENT_PROPS.locked &&
    element.customData == null
  );
};

export const encodeWhiteboardElementsForLocalStorage = (
  elements: readonly ExcalidrawElement[],
): CompactWhiteboardElements => {
  const strokes: CompactWhiteboardStroke[] = [];
  const extras: ExcalidrawElement[] = [];

  for (const element of elements) {
    if (!isCompressibleWhiteboardStroke(element)) {
      extras.push(element);
      continue;
    }

    const compactStroke: CompactWhiteboardStroke = {
      i: element.id,
      b: [element.x, element.y, element.width, element.height],
      c: encodeStrokeColor(element.strokeColor),
      d: encodePoints(element.points),
    };

    if (element.strokeWidth !== DEFAULT_ELEMENT_PROPS.strokeWidth) {
      compactStroke.s = element.strokeWidth;
    }
    if (!element.simulatePressure) {
      compactStroke.p = [...element.pressures];
    }
    if (element.freedrawSmoothingEnabled === false) {
      compactStroke.m = 0;
    }

    strokes.push(compactStroke);
  }

  return {
    format: WHITEBOARD_LOCAL_STORAGE_ELEMENTS_FORMAT,
    palette: WHITEBOARD_STROKE_PALETTE,
    strokes,
    ...(extras.length ? { extras } : {}),
  };
};

const isCompactWhiteboardElements = (
  value: unknown,
): value is CompactWhiteboardElements => {
  return (
    !!value &&
    typeof value === "object" &&
    "format" in value &&
    (value as CompactWhiteboardElements).format ===
      WHITEBOARD_LOCAL_STORAGE_ELEMENTS_FORMAT &&
    Array.isArray((value as CompactWhiteboardElements).palette) &&
    Array.isArray((value as CompactWhiteboardElements).strokes)
  );
};

export const decodeWhiteboardElementsFromLocalStorage = (
  value: unknown,
): ExcalidrawElement[] => {
  if (!isCompactWhiteboardElements(value)) {
    throw new Error("Invalid whiteboard localStorage data.");
  }

  const decodedStrokes = value.strokes.map(
    (stroke): ExcalidrawElement => ({
      id: stroke.i,
      type: "freedraw",
      x: stroke.b[0],
      y: stroke.b[1],
      width: stroke.b[2],
      height: stroke.b[3],
      strokeColor: decodeStrokeColor(stroke.c, value.palette),
      strokeWidth: stroke.s ?? DEFAULT_ELEMENT_PROPS.strokeWidth,
      points: decodePoints(stroke.d),
      pressures: stroke.p ?? [],
      simulatePressure: !stroke.p,
      ...(stroke.m === 0 ? { freedrawSmoothingEnabled: false } : {}),
    } as unknown as ExcalidrawElement),
  );

  return [...decodedStrokes, ...(value.extras ?? [])];
};
