import {
  loginIcon,
  ExcalLogo,
  eyeIcon,
  share,
  shield,
  LibraryIcon,
  FreedrawIcon,
} from "@excalidraw/excalidraw/components/icons";
import { MainMenu } from "@excalidraw/excalidraw/index";
import React from "react";

import {
  DEFAULT_SIDEBAR,
  LIBRARY_SIDEBAR_TAB,
  isDevEnv,
} from "@excalidraw/common";
import { useExcalidrawSetAppState } from "@excalidraw/excalidraw/components/App";
import { useUIAppState } from "@excalidraw/excalidraw/context/ui-appState";
import { useI18n } from "@excalidraw/excalidraw/i18n";

import type { Theme } from "@excalidraw/element/types";

import { LanguageList } from "../app-language/LanguageList";
import { isExcalidrawPlusSignedUser } from "../app_constants";
import {
  getWhiteboardCompactLocalStoragePreference,
  setWhiteboardCompactLocalStoragePreference,
} from "../data/localStorage";

import { saveDebugState } from "./DebugCanvas";

export const AppMainMenu: React.FC<{
  onCollabDialogOpen: () => any;
  onShareDialogOpen: () => any;
  isCollaborating: boolean;
  isCollabEnabled: boolean;
  theme: Theme | "system";
  setTheme: (theme: Theme | "system") => void;
  refresh: () => void;
}> = React.memo((props) => {
  const { t } = useI18n();
  const appState = useUIAppState();
  const setAppState = useExcalidrawSetAppState();

  const WHITEBOARD_SCALE_MIN = 0.6;
  const WHITEBOARD_SCALE_MAX = 2;
  const WHITEBOARD_SCALE_STEP = 0.1;
  const clampScale = (value: number) =>
    Math.min(WHITEBOARD_SCALE_MAX, Math.max(WHITEBOARD_SCALE_MIN, value));

  const toolbarScale = clampScale(appState.whiteboardToolbarScale ?? 1);
  const sideControlsScale = clampScale(
    appState.whiteboardSideControlsScale ?? 1,
  );
  const pageNavScale = clampScale(appState.whiteboardPageNavScale ?? 1);
  const freedrawSmoothingEnabled = appState.freedrawSmoothingEnabled ?? true;
  const [whiteboardCompactLocalStorage, setWhiteboardCompactLocalStorage] =
    React.useState(() => getWhiteboardCompactLocalStoragePreference());

  return (
    <MainMenu>
      <MainMenu.DefaultItems.LoadScene />
      <MainMenu.DefaultItems.SaveToActiveFile />
      <MainMenu.DefaultItems.Export />
      <MainMenu.DefaultItems.SaveAsImage />
      {props.isCollabEnabled && (
        <MainMenu.DefaultItems.LiveCollaborationTrigger
          isCollaborating={props.isCollaborating}
          onSelect={() => props.onCollabDialogOpen()}
        />
      )}
      <MainMenu.DefaultItems.CommandPalette className="highlighted" />
      <MainMenu.DefaultItems.SearchMenu />
      <MainMenu.Item
        icon={LibraryIcon}
        onSelect={() => {
          setAppState((state) => ({
            openSidebar:
              state.openSidebar?.name === DEFAULT_SIDEBAR.name &&
              state.openSidebar?.tab === LIBRARY_SIDEBAR_TAB
                ? null
                : { name: DEFAULT_SIDEBAR.name, tab: LIBRARY_SIDEBAR_TAB },
            openMenu: null,
            openPopup: null,
          }));
        }}
        aria-label={t("toolBar.library")}
      >
        {t("toolBar.library")}
      </MainMenu.Item>
      <MainMenu.DefaultItems.Help />
      {appState.whiteboardMode && props.isCollabEnabled && (
        <MainMenu.Item
          icon={share}
          onSelect={() => props.onShareDialogOpen()}
          aria-label={t("labels.share")}
        >
          {t("labels.share")}
        </MainMenu.Item>
      )}
      {appState.whiteboardMode && !isExcalidrawPlusSignedUser && (
        <MainMenu.ItemLink
          icon={shield}
          href="https://plus.excalidraw.com/blog/end-to-end-encryption"
        >
          {t("encrypted.link")}
        </MainMenu.ItemLink>
      )}
      <MainMenu.DefaultItems.ClearCanvas />
      <MainMenu.Separator />
      <MainMenu.ItemLink
        icon={ExcalLogo}
        href={`${
          import.meta.env.VITE_APP_PLUS_LP
        }/plus?utm_source=excalidraw&utm_medium=app&utm_content=hamburger`}
        className=""
      >
        Excalidraw+
      </MainMenu.ItemLink>
      <MainMenu.DefaultItems.Socials />
      <MainMenu.ItemLink
        icon={loginIcon}
        href={`${import.meta.env.VITE_APP_PLUS_APP}${
          isExcalidrawPlusSignedUser ? "" : "/sign-up"
        }?utm_source=signin&utm_medium=app&utm_content=hamburger`}
        className="highlighted"
      >
        {isExcalidrawPlusSignedUser ? "Sign in" : "Sign up"}
      </MainMenu.ItemLink>
      {isDevEnv() && (
        <MainMenu.Item
          icon={eyeIcon}
          onClick={() => {
            if (window.visualDebug) {
              delete window.visualDebug;
              saveDebugState({ enabled: false });
            } else {
              window.visualDebug = { data: [] };
              saveDebugState({ enabled: true });
            }
            props?.refresh();
          }}
        >
          Visual Debug
        </MainMenu.Item>
      )}
      <MainMenu.Separator />
      <MainMenu.DefaultItems.ToggleTheme
        allowSystemTheme
        theme={props.theme}
        onSelect={props.setTheme}
      />
      <MainMenu.DefaultItems.ToggleWhiteboardMode />
      {appState.whiteboardMode && (
        <MainMenu.Item
          icon={FreedrawIcon}
          onSelect={() => {
            setAppState({
              freedrawSmoothingEnabled: !freedrawSmoothingEnabled,
            });
          }}
          aria-label={
            freedrawSmoothingEnabled
              ? t("buttons.disableStrokeStabilization")
              : t("buttons.enableStrokeStabilization")
          }
        >
          {freedrawSmoothingEnabled
            ? t("buttons.disableStrokeStabilization")
            : t("buttons.enableStrokeStabilization")}
        </MainMenu.Item>
      )}
      {appState.whiteboardMode && (
        <MainMenu.Item
          onSelect={() => {
            const nextValue = !whiteboardCompactLocalStorage;
            setWhiteboardCompactLocalStoragePreference(nextValue);
            setWhiteboardCompactLocalStorage(nextValue);
            setAppState({
              openMenu: null,
              openPopup: null,
            });
          }}
          aria-label="白板压缩本地缓存"
        >
          白板压缩本地缓存
          {whiteboardCompactLocalStorage && " ✓"}
        </MainMenu.Item>
      )}
      {appState.whiteboardMode && (
        <MainMenu.ItemCustom className="whiteboard-scale-menu">
          <div className="whiteboard-scale-menu__title">
            Whiteboard scale
          </div>
          <div className="whiteboard-scale-menu__row">
            <span className="whiteboard-scale-menu__label">Toolbar</span>
            <input
              className="whiteboard-scale-menu__slider"
              type="range"
              min={WHITEBOARD_SCALE_MIN}
              max={WHITEBOARD_SCALE_MAX}
              step={WHITEBOARD_SCALE_STEP}
              value={toolbarScale}
              aria-label="Whiteboard toolbar scale"
              onChange={(event) => {
                const nextValue = clampScale(
                  Number(event.currentTarget.value),
                );
                setAppState({ whiteboardToolbarScale: nextValue });
              }}
            />
            <span className="whiteboard-scale-menu__value">
              {toolbarScale.toFixed(1)}x
            </span>
          </div>
          <div className="whiteboard-scale-menu__row">
            <span className="whiteboard-scale-menu__label">Side controls</span>
            <input
              className="whiteboard-scale-menu__slider"
              type="range"
              min={WHITEBOARD_SCALE_MIN}
              max={WHITEBOARD_SCALE_MAX}
              step={WHITEBOARD_SCALE_STEP}
              value={sideControlsScale}
              aria-label="Whiteboard side controls scale"
              onChange={(event) => {
                const nextValue = clampScale(
                  Number(event.currentTarget.value),
                );
                setAppState({ whiteboardSideControlsScale: nextValue });
              }}
            />
            <span className="whiteboard-scale-menu__value">
              {sideControlsScale.toFixed(1)}x
            </span>
          </div>
          <div className="whiteboard-scale-menu__row">
            <span className="whiteboard-scale-menu__label">Page nav</span>
            <input
              className="whiteboard-scale-menu__slider"
              type="range"
              min={WHITEBOARD_SCALE_MIN}
              max={WHITEBOARD_SCALE_MAX}
              step={WHITEBOARD_SCALE_STEP}
              value={pageNavScale}
              aria-label="Whiteboard page navigation scale"
              onChange={(event) => {
                const nextValue = clampScale(
                  Number(event.currentTarget.value),
                );
                setAppState({ whiteboardPageNavScale: nextValue });
              }}
            />
            <span className="whiteboard-scale-menu__value">
              {pageNavScale.toFixed(1)}x
            </span>
          </div>
        </MainMenu.ItemCustom>
      )}
      <MainMenu.ItemCustom>
        <LanguageList style={{ width: "100%" }} />
      </MainMenu.ItemCustom>
      <MainMenu.DefaultItems.ChangeCanvasBackground />
    </MainMenu>
  );
});
