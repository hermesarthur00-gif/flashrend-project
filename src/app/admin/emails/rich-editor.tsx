"use client";
import { useState } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import Placeholder from "@tiptap/extension-placeholder";
import {
  IconAlignCenter, IconAlignLeft, IconAlignRight, IconArrowBackUp, IconArrowForwardUp, IconBlockquote, IconBold, IconH1, IconH2, IconH3, IconItalic, IconLink, IconLinkOff,
  IconList, IconListNumbers, IconPalette, IconPhoto, IconSeparatorHorizontal, IconStrikethrough, IconUnderline,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

const SWATCHES = [
  { name: "Noir", value: "#111110" },
  { name: "Gris", value: "#5C584E" },
  { name: "Rouge", value: "#B3261E" },
  { name: "Vert", value: "#1B7A46" },
  { name: "Bleu", value: "#1F5FBF" },
  { name: "Orange", value: "#B25E00" },
];

function normalizeUrl(raw: string) {
  const v = raw.trim();
  if (!v) return "";
  if (/^(https?:\/\/|mailto:|tel:)/i.test(v)) return v;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return `mailto:${v}`;
  return `https://${v}`;
}

function Btn({ label, active, disabled, onClick, children }: { label: string; active?: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn("grid size-9 shrink-0 place-items-center rounded-sm text-ink hover:bg-surface-sunken disabled:opacity-35", active && "bg-flash text-on-flash hover:bg-flash")}
    >
      {children}
    </button>
  );
}
const Sep = () => <span className="mx-1 hidden h-6 w-px shrink-0 bg-line sm:block" aria-hidden="true" />;

type Panel = null | "link" | "image" | "color";

function Toolbar({ editor }: { editor: Editor }) {
  const [panel, setPanel] = useState<Panel>(null);
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"), italic: e.isActive("italic"), underline: e.isActive("underline"), strike: e.isActive("strike"),
      h1: e.isActive("heading", { level: 1 }), h2: e.isActive("heading", { level: 2 }), h3: e.isActive("heading", { level: 3 }),
      bullet: e.isActive("bulletList"), ordered: e.isActive("orderedList"), quote: e.isActive("blockquote"), link: e.isActive("link"),
      left: e.isActive({ textAlign: "left" }), center: e.isActive({ textAlign: "center" }), right: e.isActive({ textAlign: "right" }),
      canUndo: e.can().undo(), canRedo: e.can().redo(), href: (e.getAttributes("link").href as string | undefined) ?? "",
    }),
  });
  const chain = () => editor.chain().focus();

  const open = (p: Exclude<Panel, null>) => {
    if (panel === p) return setPanel(null);
    setUrl(p === "link" ? s.href : "");
    setAlt("");
    setPanel(p);
  };
  const applyLink = () => {
    const href = normalizeUrl(url);
    if (!href) chain().extendMarkRange("link").unsetLink().run();
    else if (editor.state.selection.empty && !s.link) chain().insertContent({ type: "text", text: url.trim(), marks: [{ type: "link", attrs: { href } }] }).run();
    else chain().extendMarkRange("link").setLink({ href }).run();
    setPanel(null);
  };
  const applyImage = () => {
    const src = normalizeUrl(url);
    if (!/^https:\/\//i.test(src)) return;
    chain().setImage({ src, alt: alt.trim() }).run();
    setPanel(null);
  };

  return (
    <div className="flex flex-col border-b border-line">
      <div className="flex flex-wrap items-center gap-0.5 p-1.5" role="toolbar" aria-label="Mise en forme">
        <Btn label="Annuler" disabled={!s.canUndo} onClick={() => chain().undo().run()}><IconArrowBackUp size={18} stroke={1.75} /></Btn>
        <Btn label="Rétablir" disabled={!s.canRedo} onClick={() => chain().redo().run()}><IconArrowForwardUp size={18} stroke={1.75} /></Btn>
        <Sep />
        <Btn label="Titre 1" active={s.h1} onClick={() => chain().toggleHeading({ level: 1 }).run()}><IconH1 size={18} stroke={1.75} /></Btn>
        <Btn label="Titre 2" active={s.h2} onClick={() => chain().toggleHeading({ level: 2 }).run()}><IconH2 size={18} stroke={1.75} /></Btn>
        <Btn label="Titre 3" active={s.h3} onClick={() => chain().toggleHeading({ level: 3 }).run()}><IconH3 size={18} stroke={1.75} /></Btn>
        <Sep />
        <Btn label="Gras" active={s.bold} onClick={() => chain().toggleBold().run()}><IconBold size={18} stroke={1.75} /></Btn>
        <Btn label="Italique" active={s.italic} onClick={() => chain().toggleItalic().run()}><IconItalic size={18} stroke={1.75} /></Btn>
        <Btn label="Souligné" active={s.underline} onClick={() => chain().toggleUnderline().run()}><IconUnderline size={18} stroke={1.75} /></Btn>
        <Btn label="Barré" active={s.strike} onClick={() => chain().toggleStrike().run()}><IconStrikethrough size={18} stroke={1.75} /></Btn>
        <Btn label="Couleur du texte" active={panel === "color"} onClick={() => open("color")}><IconPalette size={18} stroke={1.75} /></Btn>
        <Sep />
        <Btn label="Aligner à gauche" active={s.left} onClick={() => chain().setTextAlign("left").run()}><IconAlignLeft size={18} stroke={1.75} /></Btn>
        <Btn label="Centrer" active={s.center} onClick={() => chain().setTextAlign("center").run()}><IconAlignCenter size={18} stroke={1.75} /></Btn>
        <Btn label="Aligner à droite" active={s.right} onClick={() => chain().setTextAlign("right").run()}><IconAlignRight size={18} stroke={1.75} /></Btn>
        <Sep />
        <Btn label="Liste à puces" active={s.bullet} onClick={() => chain().toggleBulletList().run()}><IconList size={18} stroke={1.75} /></Btn>
        <Btn label="Liste numérotée" active={s.ordered} onClick={() => chain().toggleOrderedList().run()}><IconListNumbers size={18} stroke={1.75} /></Btn>
        <Btn label="Citation" active={s.quote} onClick={() => chain().toggleBlockquote().run()}><IconBlockquote size={18} stroke={1.75} /></Btn>
        <Btn label="Séparateur" onClick={() => chain().setHorizontalRule().run()}><IconSeparatorHorizontal size={18} stroke={1.75} /></Btn>
        <Sep />
        <Btn label="Lien" active={s.link || panel === "link"} onClick={() => open("link")}><IconLink size={18} stroke={1.75} /></Btn>
        <Btn label="Image par adresse web" active={panel === "image"} onClick={() => open("image")}><IconPhoto size={18} stroke={1.75} /></Btn>
      </div>
      {panel === "color" && (
        <div className="flex flex-wrap items-center gap-2 border-t border-line bg-surface-sunken px-3 py-2">
          <span className="text-sm text-ink-muted">Couleur :</span>
          {SWATCHES.map((c) => (
            <button key={c.value} type="button" aria-label={c.name} title={c.name} onMouseDown={(e) => e.preventDefault()} onClick={() => { chain().setColor(c.value).run(); setPanel(null); }} className="size-7 rounded-full border border-line-strong" style={{ background: c.value }} />
          ))}
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { chain().unsetColor().run(); setPanel(null); }} className="h-7 rounded-full border border-line-strong px-3 text-sm font-semibold">
            Par défaut
          </button>
        </div>
      )}
      {(panel === "link" || panel === "image") && (
        <div className="flex flex-wrap items-center gap-2 border-t border-line bg-surface-sunken px-3 py-2">
          <input
            autoFocus
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (panel === "link") applyLink(); else applyImage(); } if (e.key === "Escape") setPanel(null); }}
            aria-label={panel === "link" ? "Adresse du lien" : "Adresse de l'image"}
            placeholder={panel === "link" ? "https://flashinv.com ou nom@exemple.com" : "https://… (adresse de l'image, en https)"}
            inputMode="url"
            className="h-10 min-w-0 flex-1 basis-56 rounded-sm border border-line-strong bg-surface-raised px-3 text-[15px] outline-none focus:border-ink"
          />
          {panel === "image" && <input value={alt} onChange={(e) => setAlt(e.target.value)} aria-label="Description de l'image" placeholder="Description (facultatif)" className="h-10 min-w-0 flex-1 basis-40 rounded-sm border border-line-strong bg-surface-raised px-3 text-[15px] outline-none focus:border-ink" />}
          <button type="button" onClick={panel === "link" ? applyLink : applyImage} className="h-10 rounded-sm bg-flash px-4 text-sm font-bold text-on-flash">
            {panel === "link" ? "Valider" : "Insérer"}
          </button>
          {panel === "link" && s.link && (
            <button type="button" onClick={() => { chain().extendMarkRange("link").unsetLink().run(); setPanel(null); }} className="inline-flex h-10 items-center gap-1.5 rounded-sm border border-line-strong px-3 text-sm font-semibold">
              <IconLinkOff size={16} stroke={1.75} /> Retirer
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function RichEditor({ onChange }: { onChange: (html: string) => void }) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] }, link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" } } }),
      TextStyle,
      Color,
      Image,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Écrivez votre message ici…" }),
    ],
    content: "",
    editorProps: { attributes: { "aria-label": "Contenu du message", role: "textbox", "aria-multiline": "true" } },
    onUpdate: ({ editor: e }) => onChange(e.isEmpty ? "" : e.getHTML()),
  });
  if (!editor) return <div className="h-[340px] animate-pulse rounded-lg border border-line bg-surface-sunken" />;
  return (
    <div className="mail-editor overflow-hidden rounded-lg border border-line-strong bg-surface-raised focus-within:border-ink">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
