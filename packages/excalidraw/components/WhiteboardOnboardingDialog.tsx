import React from "react";

import { useI18n } from "../i18n";

import { useExcalidrawContainer, useExcalidrawSetAppState } from "./App";
import { Dialog } from "./Dialog";
import DialogActionButton from "./DialogActionButton";

import "./WhiteboardOnboardingDialog.scss";

interface WhiteboardOnboardingDialogProps {
  open: boolean;
  canEnterFullscreen: boolean;
  onDismiss: () => void;
}

export const WhiteboardOnboardingDialog = ({
  open,
  canEnterFullscreen,
  onDismiss,
}: WhiteboardOnboardingDialogProps) => {
  const { t } = useI18n();
  const { container } = useExcalidrawContainer();
  const setAppState = useExcalidrawSetAppState();

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
      onDismiss();
    } catch (error: any) {
      console.warn(error);
      setAppState({ errorMessage: t("errors.cannotEnterFullscreen") });
    }
  };

  return (
    <Dialog
      onCloseRequest={onDismiss}
      size="small"
      title={t("whiteboardOnboarding.title")}
      className="WhiteboardOnboardingDialog"
    >
      <p className="WhiteboardOnboardingDialog__body">
        {t("whiteboardOnboarding.description")}
      </p>
      <p className="WhiteboardOnboardingDialog__body WhiteboardOnboardingDialog__body--notice">
        {t("whiteboardOnboarding.predictionNotice")}
      </p>
      <div className="WhiteboardOnboardingDialog__actions">
        <DialogActionButton
          label={t("whiteboardOnboarding.dismiss")}
          onClick={onDismiss}
        />
        {canEnterFullscreen && (
          <DialogActionButton
            label={t("whiteboardOnboarding.enterFullscreen")}
            onClick={handleEnterFullscreen}
            actionType="primary"
          />
        )}
      </div>
    </Dialog>
  );
};
