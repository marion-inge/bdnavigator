import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

export function NewOpportunityDialog() {
  const { t } = useI18n();
  const { addOpportunity } = useStore();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [industry, setIndustry] = useState("");
  const [geography, setGeography] = useState("");
  const [technology, setTechnology] = useState("");
  const [owner, setOwner] = useState("");

  const handleCreate = () => {
    if (!title.trim()) return;
    addOpportunity({ title: title.trim(), description, industry, geography, technology, owner });
    setTitle("");
    setDescription("");
    setIndustry("");
    setGeography("");
    setTechnology("");
    setOwner("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {t("newOpportunity")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("newOpportunity")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">{t("title")} *</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">{t("description")}</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">{t("industry")}</label>
              <Input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. Marine, Aviation" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">{t("geography")}</label>
              <Input value={geography} onChange={(e) => setGeography(e.target.value)} placeholder="e.g. Europe, APAC" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">{t("technology")}</label>
              <Input value={technology} onChange={(e) => setTechnology(e.target.value)} placeholder="e.g. AI, Robotics" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">{t("owner")}</label>
              <Input value={owner} onChange={(e) => setOwner(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleCreate} disabled={!title.trim()}>
              {t("create")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
