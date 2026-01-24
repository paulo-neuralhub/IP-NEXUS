import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  defaultSubject?: string;
  defaultContent?: string;
  submitLabel?: string;
  onSubmit: (payload: { subject?: string; content?: string }) => Promise<void> | void;
};

export function QuickActivityDialog({
  open,
  onOpenChange,
  title,
  defaultSubject,
  defaultContent,
  submitLabel = "Crear",
  onSubmit,
}: Props) {
  const [subject, setSubject] = useState(defaultSubject ?? "");
  const [content, setContent] = useState(defaultContent ?? "");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => (subject.trim() || content.trim()) && !submitting, [subject, content, submitting]);

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onSubmit({ subject: subject.trim() || undefined, content: content.trim() || undefined });
      onOpenChange(false);
      setSubject(defaultSubject ?? "");
      setContent(defaultContent ?? "");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Asunto</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="(opcional)" />
          </div>

          <div className="space-y-2">
            <Label>Contenido</Label>
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Escribe una nota…" />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={!canSubmit}>
              {submitting ? "Guardando…" : submitLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
