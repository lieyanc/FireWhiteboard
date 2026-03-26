import clsx from "clsx";
import React, { useState } from "react";

import { t } from "../i18n";

import {
  handIcon,
  FreedrawIcon,
  EraserIcon,
  SelectionIcon,
  RectangleIcon,
  DiamondIcon,
  EllipseIcon,
  ArrowIcon,
  LineIcon,
  TextIcon,
  ImageIcon,
  DotsHorizontalIcon,
  StrokeWidthBaseIcon,
  StrokeWidthBoldIcon,
  StrokeWidthExtraBoldIcon,
} from "./icons";

import { Island } from "./Island";
import DropdownMenu from "./dropdownMenu/DropdownMenu";
import * as Popover from "@radix-ui/react-popover";
import { useExcalidrawContainer } from "./App";

import "./WhiteboardToolbar.scss";

import type { AppClassProperties, UIAppState, AppState } from "../types";
import type { ActionManager } from "../actions/manager";

interface WhiteboardToolbarProps {
  appState: UIAppState;
  app: AppClassProperties;
  setAppState: React.Component<any, AppState>["setState"];
  actionManager: ActionManager;
}

const MAIN_TOOLS = [
  { type: "hand", icon: handIcon, label: "平移" },
  { type: "freedraw", icon: FreedrawIcon, label: "画笔" },
  { type: "eraser", icon: EraserIcon, label: "橡皮" },
] as const;

const MORE_TOOLS = [
  { type: "selection", icon: SelectionIcon, labelKey: "toolBar.selection" },
  { type: "rectangle", icon: RectangleIcon, labelKey: "toolBar.rectangle" },
  { type: "diamond", icon: DiamondIcon, labelKey: "toolBar.diamond" },
  { type: "ellipse", icon: EllipseIcon, labelKey: "toolBar.ellipse" },
  { type: "arrow", icon: ArrowIcon, labelKey: "toolBar.arrow" },
  { type: "line", icon: LineIcon, labelKey: "toolBar.line" },
  { type: "text", icon: TextIcon, labelKey: "toolBar.text" },
  { type: "image", icon: ImageIcon, labelKey: "toolBar.image" },
] as const;

const STROKE_WIDTHS = [
  { value: 1, icon: StrokeWidthBaseIcon },
  { value: 2, icon: StrokeWidthBoldIcon },
  { value: 4, icon: StrokeWidthExtraBoldIcon },
] as const;

const OPACITY_VALUES = [
  { value: 20, label: "20%" },
  { value: 50, label: "50%" },
  { value: 100, label: "100%" },
] as const;

const STROKE_WIDTH_MIN = 0.5;
const STROKE_WIDTH_MAX = 4;
const STROKE_WIDTH_STEP = 0.1;

// Common stroke colors
const STROKE_COLORS = [
  "#1e1e1e", "#e03131", "#2f9e44", "#1971c2", "#f08c00",
  "#6741d9", "#0c8599", "#e8590c", "#000000", "#868e96",
];
const INLINE_STROKE_COLORS = STROKE_COLORS.slice(0, 5);

// Common background colors
const BG_COLORS = [
  "transparent", "#ffc9c9", "#b2f2bb", "#a5d8ff", "#ffec99",
  "#d0bfff", "#99e9f2", "#ffd8a8", "#ffffff", "#e9ecef",
];

const formatStrokeWidth = (value: number) => {
  const fixed = value.toFixed(2);
  return fixed.replace(/\.?0+$/, "");
};

export const WhiteboardToolbar: React.FC<WhiteboardToolbarProps> = ({
  appState,
  app,
  setAppState,
  actionManager,
}) => {
  const [isMoreToolsOpen, setIsMoreToolsOpen] = useState(false);
  const [isBgColorOpen, setIsBgColorOpen] = useState(true);
  const [isStrokeWidthOpen, setIsStrokeWidthOpen] = useState(false);
  const [isOpacityOpen, setIsOpacityOpen] = useState(false);

  const activeTool = appState.activeTool.type;
  const { container } = useExcalidrawContainer();
  const popoverContainer = container ?? undefined;

  const handleToolSelect = (toolType: string) => {
    app.setActiveTool({ type: toolType as any });
  };

  const handleStrokeColorSelect = (color: string) => {
    setAppState({ currentItemStrokeColor: color });
    handleToolSelect("freedraw");
  };

  const currentStrokeColor = appState.currentItemStrokeColor;
  const currentBgColor = appState.currentItemBackgroundColor;
  const currentStrokeWidth = appState.currentItemStrokeWidth;
  const currentOpacity = appState.currentItemOpacity;

  return (
    <div className="whiteboard-toolbar-wrapper">
      <div className="whiteboard-toolbar-scale">
        <Island padding={1} className="whiteboard-toolbar">
          <div className="whiteboard-toolbar__content">
          {/* Color Section */}
          <div className="whiteboard-toolbar__section whiteboard-toolbar__section--colors">
            {/* Stroke Color (inline) */}
            <div className="whiteboard-toolbar__stroke-inline">
              <span className="whiteboard-toolbar__inline-label">线条</span>
              <div className="whiteboard-toolbar__inline-swatches">
                {INLINE_STROKE_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={clsx(
                      "whiteboard-toolbar__color-option",
                      "whiteboard-toolbar__color-option--inline",
                      {
                        "whiteboard-toolbar__color-option--active":
                          currentStrokeColor === color,
                      },
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => handleStrokeColorSelect(color)}
                  />
                ))}
              </div>
            </div>

            {/* Background Color */}
            <Popover.Root open={isBgColorOpen} onOpenChange={setIsBgColorOpen}>
              <Popover.Trigger asChild>
                <button
                  type="button"
                  className="whiteboard-toolbar__color-button"
                  title="填充颜色"
                >
                  <div
                    className="whiteboard-toolbar__color-swatch whiteboard-toolbar__color-swatch--bg"
                    style={{
                      backgroundColor: currentBgColor === "transparent" ? "#fff" : currentBgColor,
                    }}
                  >
                    {currentBgColor === "transparent" && (
                      <div className="whiteboard-toolbar__color-swatch--transparent" />
                    )}
                  </div>
                  <span className="whiteboard-toolbar__color-label">填充</span>
                </button>
              </Popover.Trigger>
              <Popover.Portal container={popoverContainer}>
                <Popover.Content
                  className="whiteboard-toolbar__popover"
                  side="top"
                  sideOffset={8}
                  align="center"
                  collisionBoundary={popoverContainer}
                >
                  <div className="whiteboard-toolbar__color-grid">
                    {BG_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={clsx("whiteboard-toolbar__color-option", {
                          "whiteboard-toolbar__color-option--active": currentBgColor === color,
                          "whiteboard-toolbar__color-option--transparent": color === "transparent",
                        })}
                        style={{
                          backgroundColor: color === "transparent" ? "#fff" : color,
                        }}
                        onClick={() => {
                          setAppState({ currentItemBackgroundColor: color });
                          setIsBgColorOpen(false);
                        }}
                      >
                        {color === "transparent" && (
                          <div className="whiteboard-toolbar__color-option--slash" />
                        )}
                      </button>
                    ))}
                  </div>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          </div>

          <div className="whiteboard-toolbar__divider" />

          {/* Tools Section */}
          <div className="whiteboard-toolbar__section whiteboard-toolbar__section--tools">
            {MAIN_TOOLS.map((tool) => (
              <button
                key={tool.type}
                type="button"
                className={clsx("whiteboard-toolbar__tool-button", {
                  "whiteboard-toolbar__tool-button--active": activeTool === tool.type,
                })}
                onClick={() => handleToolSelect(tool.type)}
                title={tool.label}
              >
                <span className="whiteboard-toolbar__tool-icon">{tool.icon}</span>
                <span className="whiteboard-toolbar__tool-label">{tool.label}</span>
              </button>
            ))}

            <DropdownMenu open={isMoreToolsOpen} placement="top">
              <DropdownMenu.Trigger
                className={clsx("whiteboard-toolbar__tool-button whiteboard-toolbar__tool-button--more", {
                  "whiteboard-toolbar__tool-button--active": MORE_TOOLS.some(
                    (tool) => tool.type === activeTool,
                  ),
                })}
                onToggle={() => {
                  setIsMoreToolsOpen(!isMoreToolsOpen);
                  setAppState({ openMenu: null, openPopup: null });
                }}
              >
                <span className="whiteboard-toolbar__tool-icon">{DotsHorizontalIcon}</span>
                <span className="whiteboard-toolbar__tool-label">更多</span>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content
                onClickOutside={() => setIsMoreToolsOpen(false)}
                onSelect={() => setIsMoreToolsOpen(false)}
                className="whiteboard-toolbar__dropdown"
              >
                {MORE_TOOLS.map((tool) => (
                  <DropdownMenu.Item
                    key={tool.type}
                    onSelect={() => handleToolSelect(tool.type)}
                    icon={tool.icon}
                    selected={activeTool === tool.type}
                  >
                    {t(tool.labelKey)}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu>
          </div>

          <div className="whiteboard-toolbar__divider" />

          {/* Properties Section */}
          <div className="whiteboard-toolbar__section whiteboard-toolbar__section--properties">
            {/* Stroke Width */}
            <Popover.Root open={isStrokeWidthOpen} onOpenChange={setIsStrokeWidthOpen}>
              <Popover.Trigger asChild>
                <button
                  type="button"
                  className="whiteboard-toolbar__prop-button"
                  title="线条粗细"
                >
                  <span className="whiteboard-toolbar__prop-icon">
                    {currentStrokeWidth <= 1
                      ? StrokeWidthBaseIcon
                      : currentStrokeWidth <= 2
                      ? StrokeWidthBoldIcon
                      : StrokeWidthExtraBoldIcon}
                  </span>
                  <span className="whiteboard-toolbar__prop-label">粗细</span>
                </button>
              </Popover.Trigger>
              <Popover.Portal container={popoverContainer}>
                <Popover.Content
                  className="whiteboard-toolbar__popover whiteboard-toolbar__popover--small"
                  side="top"
                  sideOffset={8}
                  align="center"
                  collisionBoundary={popoverContainer}
                >
                  <div className="whiteboard-toolbar__stroke-width-controls">
                    <div className="whiteboard-toolbar__prop-options">
                      {STROKE_WIDTHS.map((sw) => (
                        <button
                          key={sw.value}
                          type="button"
                          className={clsx("whiteboard-toolbar__prop-option", {
                            "whiteboard-toolbar__prop-option--active":
                              currentStrokeWidth === sw.value,
                          })}
                          onClick={() => {
                            setAppState({ currentItemStrokeWidth: sw.value });
                          }}
                        >
                          {sw.icon}
                        </button>
                      ))}
                    </div>
                    <div className="whiteboard-toolbar__stroke-slider">
                      <input
                        type="range"
                        min={STROKE_WIDTH_MIN}
                        max={STROKE_WIDTH_MAX}
                        step={STROKE_WIDTH_STEP}
                        value={currentStrokeWidth}
                        className="whiteboard-toolbar__stroke-range"
                        aria-label="线条粗细"
                        onChange={(event) => {
                          setAppState({
                            currentItemStrokeWidth: Number(event.target.value),
                          });
                        }}
                      />
                      <span className="whiteboard-toolbar__stroke-value">
                        {formatStrokeWidth(currentStrokeWidth)}
                      </span>
                    </div>
                  </div>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>

            {/* Opacity */}
            <Popover.Root open={isOpacityOpen} onOpenChange={setIsOpacityOpen}>
              <Popover.Trigger asChild>
                <button
                  type="button"
                  className="whiteboard-toolbar__prop-button"
                  title="透明度"
                >
                  <span className="whiteboard-toolbar__prop-value">{currentOpacity}%</span>
                  <span className="whiteboard-toolbar__prop-label">透明</span>
                </button>
              </Popover.Trigger>
              <Popover.Portal container={popoverContainer}>
                <Popover.Content
                  className="whiteboard-toolbar__popover whiteboard-toolbar__popover--small"
                  side="top"
                  sideOffset={8}
                  align="center"
                  collisionBoundary={popoverContainer}
                >
                  <div className="whiteboard-toolbar__prop-options">
                    {OPACITY_VALUES.map((op) => (
                      <button
                        key={op.value}
                        type="button"
                        className={clsx("whiteboard-toolbar__prop-option whiteboard-toolbar__prop-option--text", {
                          "whiteboard-toolbar__prop-option--active": currentOpacity === op.value,
                        })}
                        onClick={() => {
                          setAppState({ currentItemOpacity: op.value });
                          setIsOpacityOpen(false);
                        }}
                      >
                        {op.label}
                      </button>
                    ))}
                  </div>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          </div>
          </div>
        </Island>
      </div>
    </div>
  );
};

export default WhiteboardToolbar;
