import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export interface ConfirmOptions {
  /** Dialog title. Defaults to "Are you sure?". */
  title?: string;
  /** Dialog message. Defaults to a generic "cannot be undone" message. */
  message?: string;
  /** Label for the confirm button. Defaults to "Delete". */
  confirmLabel?: string;
  /** Label for the cancel button. Defaults to "Cancel". */
  cancelLabel?: string;
}

interface ConfirmContextType {
  /**
   * Show a confirmation dialog and run `onConfirm` only if the user confirms.
   * Usage: confirm(() => doDelete(), { message: "..." })
   */
  confirm: (onConfirm: () => void, options?: ConfirmOptions) => void;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<ConfirmOptions>({});
  const [pending, setPending] = useState<(() => void) | null>(null);

  const confirm = useCallback((onConfirm: () => void, options?: ConfirmOptions) => {
    setOpts(options || {});
    setPending(() => onConfirm);
    setOpen(true);
  }, []);

  const handleAction = () => {
    setOpen(false);
    const action = pending;
    setPending(null);
    if (action) action();
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {opts.title || (t as (k: string) => string)("confirmDelete")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {opts.message || (t as (k: string) => string)("confirmDeleteMessage")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {opts.cancelLabel || (t as (k: string) => string)("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {opts.confirmLabel || (t as (k: string) => string)("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmContextType["confirm"] {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    // Fallback: if used outside provider, just run the action immediately.
    return (onConfirm: () => void) => onConfirm();
  }
  return ctx.confirm;
}
