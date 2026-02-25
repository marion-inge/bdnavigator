import { Button } from "@/components/ui/button";
import { Pencil, Check } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface EditableSectionProps {
  editing: boolean;
  onEdit: () => void;
  onSave: () => void;
  readonly?: boolean;
  children: React.ReactNode;
  dirty?: boolean;
}

export function EditableSection({ editing, onEdit, onSave, readonly, children, dirty }: EditableSectionProps) {
  const { language } = useI18n();

  if (readonly) {
    return <div className="display-mode">{children}</div>;
  }

  return (
    <div className={editing ? "" : "display-mode"}>
      <div className="flex justify-end mb-4 sticky top-2 z-10">
        {editing ? (
          <div className="flex gap-2 bg-card/95 backdrop-blur-sm rounded-lg border border-border px-3 py-2 shadow-sm">
            <Button size="sm" onClick={onSave} disabled={dirty === false} className="gap-1.5">
              <Check className="h-3.5 w-3.5" />
              {language === "de" ? "Speichern" : "Save"}
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={onEdit} className="gap-1.5">
            <Pencil className="h-3.5 w-3.5" />
            {language === "de" ? "Bearbeiten" : "Edit"}
          </Button>
        )}
      </div>
      {children}
    </div>
  );
}
