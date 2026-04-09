import { THEME, applyDarkModeFilter, throttleRAF } from "@excalidraw/common";

import {
  getTargetFrame,
  isInvisiblySmallElement,
  renderElement,
  shouldApplyFrameClip,
} from "@excalidraw/element";
import type { ExcalidrawFreeDrawElement } from "@excalidraw/element/types";

import { bootstrapCanvas, getNormalizedCanvasDimensions } from "./helpers";

import { frameClip } from "./staticScene";

import type { NewElementSceneRenderConfig } from "../scene/types";

const renderLowLatencyFreedrawPreview = ({
  element,
  context,
  appState,
  renderConfig,
}: {
  element: ExcalidrawFreeDrawElement;
  context: CanvasRenderingContext2D;
  appState: NewElementSceneRenderConfig["appState"];
  renderConfig: NewElementSceneRenderConfig["renderConfig"];
}) => {
  const strokeColor =
    renderConfig.theme === THEME.DARK
      ? applyDarkModeFilter(element.strokeColor)
      : element.strokeColor;

  context.save();
  context.globalAlpha = element.opacity / 100;
  context.translate(element.x + appState.scrollX, element.y + appState.scrollY);
  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineWidth = Math.max(1, element.strokeWidth * 4.25);
  context.strokeStyle = strokeColor;
  context.fillStyle = strokeColor;

  const [firstPoint, ...restPoints] = element.points;

  if (!firstPoint) {
    context.restore();
    return;
  }

  if (restPoints.length === 0) {
    context.beginPath();
    context.arc(
      firstPoint[0],
      firstPoint[1],
      context.lineWidth / 2,
      0,
      Math.PI * 2,
    );
    context.fill();
    context.restore();
    return;
  }

  context.beginPath();
  context.moveTo(firstPoint[0], firstPoint[1]);

  for (const [x, y] of restPoints) {
    context.lineTo(x, y);
  }

  context.stroke();
  context.restore();
};

const _renderNewElementScene = ({
  canvas,
  rc,
  newElement,
  elementsMap,
  allElementsMap,
  scale,
  appState,
  renderConfig,
}: NewElementSceneRenderConfig) => {
  if (canvas) {
    const [normalizedWidth, normalizedHeight] = getNormalizedCanvasDimensions(
      canvas,
      scale,
    );

    const context = bootstrapCanvas({
      canvas,
      scale,
      normalizedWidth,
      normalizedHeight,
    });

    context.save();

    // Apply zoom
    context.scale(appState.zoom.value, appState.zoom.value);

    if (newElement && newElement.type !== "selection") {
      const shouldRenderLowLatencyPreview =
        appState.lowLatencyDrawingEnabled &&
        newElement.type === "freedraw" &&
        !renderConfig.isExporting;

      // e.g. when creating arrows and we're still below the arrow drag distance
      // threshold
      // (for now we skip render only with elements while we're creating to be
      // safe)
      if (
        !shouldRenderLowLatencyPreview &&
        isInvisiblySmallElement(newElement)
      ) {
        context.restore();
        return;
      }

      const frameId = newElement.frameId || appState.frameToHighlight?.id;

      if (
        frameId &&
        appState.frameRendering.enabled &&
        appState.frameRendering.clip
      ) {
        const frame = getTargetFrame(newElement, elementsMap, appState);

        if (
          frame &&
          shouldApplyFrameClip(newElement, frame, appState, elementsMap)
        ) {
          frameClip(frame, context, renderConfig, appState);
        }
      }

      if (shouldRenderLowLatencyPreview) {
        renderLowLatencyFreedrawPreview({
          element: newElement,
          context,
          appState,
          renderConfig,
        });
      } else {
        renderElement(
          newElement,
          elementsMap,
          allElementsMap,
          rc,
          context,
          renderConfig,
          appState,
        );
      }
    } else {
      context.clearRect(0, 0, normalizedWidth, normalizedHeight);
    }

    context.restore();
  }
};

export const renderNewElementSceneThrottled = throttleRAF(
  (config: NewElementSceneRenderConfig) => {
    _renderNewElementScene(config);
  },
  { trailing: true },
);

export const renderNewElementScene = (
  renderConfig: NewElementSceneRenderConfig,
  throttle?: boolean,
) => {
  if (throttle) {
    renderNewElementSceneThrottled(renderConfig);
    return;
  }

  _renderNewElementScene(renderConfig);
};
