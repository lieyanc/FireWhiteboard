import React from "react";

import { useI18n } from "../i18n";

import { useExcalidrawContainer, useExcalidrawSetAppState } from "./App";
import { Dialog } from "./Dialog";
import DialogActionButton from "./DialogActionButton";

import "./WhiteboardOnboardingDialog.scss";

interface WhiteboardOnboardingDialogProps {
  open: boolean;
  canEnterFullscreen: boolean;
  variant?: "onboarding" | "fullscreenInterrupted";
  onDismiss: () => void;
  onEnterFullscreen?: () => void;
}

export const WhiteboardOnboardingDialog = ({
  open,
  canEnterFullscreen,
  variant = "onboarding",
  onDismiss,
  onEnterFullscreen,
}: WhiteboardOnboardingDialogProps) => {
  const { t } = useI18n();
  const { container } = useExcalidrawContainer();
  const setAppState = useExcalidrawSetAppState();
  const isFullscreenInterrupted = variant === "fullscreenInterrupted";

  if (!open) {
    return null;
  }

  const handleEnterFullscreen = async () => {
    if (!container?.requestFullscreen) {
      setAppState({ errorMessage: t("errors.cannotEnterFullscreen") });
      return;
    }

    try {
      await container.requestFullscreen();
      (onEnterFullscreen ?? onDismiss)();
    } catch (error: any) {
      console.warn(error);
      setAppState({ errorMessage: t("errors.cannotEnterFullscreen") });
    }
  };

  return (
    <Dialog
      onCloseRequest={onDismiss}
      size="small"
      title={
        isFullscreenInterrupted
          ? t("whiteboardOnboarding.fullscreenInterruptedTitle")
          : t("whiteboardOnboarding.title")
      }
      className="WhiteboardOnboardingDialog"
      closeOnClickOutside={!isFullscreenInterrupted}
    >
      <p className="WhiteboardOnboardingDialog__body">
        {isFullscreenInterrupted
          ? t("whiteboardOnboarding.fullscreenInterruptedDescription")
          : t("whiteboardOnboarding.description")}
      </p>
      {!isFullscreenInterrupted && (
        <p className="WhiteboardOnboardingDialog__body WhiteboardOnboardingDialog__body--notice">
          {t("whiteboardOnboarding.predictionNotice")}
        </p>
      )}
      <div className="WhiteboardOnboardingDialog__actions">
        <DialogActionButton
          label={
            isFullscreenInterrupted
              ? t("whiteboardOnboarding.ignoreThisSession")
              : t("whiteboardOnboarding.dismiss")
          }
          onClick={onDismiss}
        />
        {canEnterFullscreen && (
          <DialogActionButton
            label={
              isFullscreenInterrupted
                ? t("whiteboardOnboarding.returnToFullscreen")
                : t("whiteboardOnboarding.enterFullscreen")
            }
            onClick={handleEnterFullscreen}
            actionType="primary"
          />
        )}
      </div>
    </Dialog>
  );
};
