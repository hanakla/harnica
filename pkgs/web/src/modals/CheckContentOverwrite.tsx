import { ModalPropsBase } from "@fleur/mordred/dist/react-bind";
import useEvent from "react-use-event-hook";
import { Button } from "@/components/Button";
import { ModalBase } from "@/components/ModalBase";
import { useI18n } from "@/locales";

export function CheckContentOverwrite({
  onClose,
}: ModalPropsBase<{}, boolean>) {
  const t = useI18n();

  return (
    <ModalBase.Root onClose={onClose}>
      <ModalBase.Header>
        <h1>{t("editor.modals.checkOverWrite.title")}</h1>
      </ModalBase.Header>
      <ModalBase.Content>
        <p>{t("editor.modals.checkOverWrite.description", { br: <br /> })}</p>
      </ModalBase.Content>

      <ModalBase.Footer>
        <Button $kind="default" onClick={() => onClose(false)}>
          {t("common.cancel")}
        </Button>
        <Button $kind="primary" onClick={() => onClose(true)}>
          {t("common.continue")}
        </Button>
      </ModalBase.Footer>
    </ModalBase.Root>
  );
}
