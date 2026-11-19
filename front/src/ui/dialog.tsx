import { useEffect, useRef } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
type Props = { open: boolean; onClose: () => void; children: ComponentChildren };
export function Dialog({ open, onClose, children }: Props) {
  const ref = useRef<HTMLDialogElement | null>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (open && !el.open) el.showModal(); if (!open && el.open) el.close();
  }, [open]);
  return (
    <dialog ref={ref} onClose={onClose} onClick={(e) => { if (e.target === ref.current) onClose(); }}
      class="fixed inset-0 m-auto w-[calc(100vw-2rem)] max-w-lg max-h-[calc(100vh-2rem)] overflow-hidden rounded-sm border border-border-strong bg-surface text-foreground p-0 backdrop:bg-black/80">
      <div class="max-h-[calc(100vh-2rem)] overflow-y-auto p-6">{children}</div>
    </dialog>
  );
}
