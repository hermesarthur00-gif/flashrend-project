"use client";
import { useRef, useState } from "react";
import { IconFileText, IconX } from "@tabler/icons-react";

/** Document d'identité : vignette, puis agrandissement dans une fenêtre du site. */
export function DocViewer({ src, label }: { src: string; label: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [isFile, setIsFile] = useState(false); // PDF : pas d'aperçu image
  const open = () => dialog.current?.showModal();

  return (
    <figure className="m-0 flex flex-col gap-2">
      <button type="button" onClick={open} aria-label={`Agrandir : ${label}`} className="grid aspect-[4/3] cursor-zoom-in place-items-center overflow-hidden rounded-lg bg-band text-on-band">
        {isFile ? (
          <span className="flex flex-col items-center gap-2 text-sm font-semibold">
            <IconFileText size={36} stroke={1.5} /> Document PDF
          </span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={label} className="size-full object-contain" loading="lazy" onError={() => setIsFile(true)} />
        )}
      </button>
      <figcaption className="flex justify-between text-[13px]">
        <span className="font-semibold">{label}</span>
        <button type="button" onClick={open} className="font-semibold text-ink underline-offset-2 hover:underline">
          Agrandir
        </button>
      </figcaption>

      <dialog
        ref={dialog}
        aria-label={label}
        onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
        className="m-auto h-[min(92dvh,1000px)] w-[min(94vw,1200px)] max-w-none overflow-hidden rounded-lg border-0 bg-band p-0 text-on-band backdrop:bg-ink/80"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-on-band/15 px-4 py-3">
            <span className="font-bold">{label}</span>
            <button type="button" onClick={() => dialog.current?.close()} aria-label="Fermer" className="grid size-10 place-items-center rounded-md hover:bg-on-band/10">
              <IconX size={22} stroke={1.75} />
            </button>
          </div>
          <div className="grid min-h-0 flex-1 place-items-center p-4">
            {isFile ? (
              <iframe src={src} title={label} className="size-full rounded-md bg-surface" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt={label} className="max-h-full max-w-full object-contain" />
            )}
          </div>
        </div>
      </dialog>
    </figure>
  );
}
