import "server-only";
import sanitizeHtml from "sanitize-html";

const SAFE_VALUE = /^[\w\s#.,()%-]+$/;
const COLORS = /^(#[0-9a-fA-F]{3,8}|rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\))$/;

/**
 * Nettoie le HTML de l'éditeur (pas de script, pas de style libre) et le met en forme pour les clients mail :
 * styles en ligne, seuls les liens http(s), mailto et tel sont gardés, images en https uniquement.
 */
export function cleanEmailHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: ["p", "br", "strong", "b", "em", "i", "u", "s", "h1", "h2", "h3", "ul", "ol", "li", "blockquote", "hr", "a", "img", "span"],
    allowedAttributes: { a: ["href", "target", "rel", "style"], img: ["src", "alt", "style"], p: ["style"], h1: ["style"], h2: ["style"], h3: ["style"], span: ["style"], ul: ["style"], ol: ["style"], blockquote: ["style"], hr: ["style"] },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["https"] },
    allowedStyles: {
      "*": {
        color: [COLORS],
        "text-align": [/^(left|center|right|justify)$/],
        // Mise en forme appliquée par nos propres balises (voir transformTags).
        margin: [SAFE_VALUE], "padding-left": [SAFE_VALUE], padding: [SAFE_VALUE], "font-size": [SAFE_VALUE], "line-height": [SAFE_VALUE], "font-weight": [SAFE_VALUE],
        "text-decoration": [SAFE_VALUE], "border-left": [SAFE_VALUE], "border-top": [SAFE_VALUE], border: [SAFE_VALUE], "max-width": [SAFE_VALUE], height: [SAFE_VALUE],
        "border-radius": [SAFE_VALUE], display: [SAFE_VALUE],
      },
    },
    exclusiveFilter: (f) => (f.tag === "img" && !f.attribs.src) || (f.tag === "a" && !f.attribs.href),
    transformTags: {
      a: (_, a) => ({ tagName: "a", attribs: { href: a.href ?? "", target: "_blank", rel: "noopener noreferrer", style: "color:#111110;font-weight:700;text-decoration:underline" } }),
      img: (_, a) => ({ tagName: "img", attribs: { src: a.src ?? "", alt: a.alt ?? "", style: "max-width:100%;height:auto;border-radius:8px;display:block;margin:12px 0" } }),
      p: (_, a) => ({ tagName: "p", attribs: { style: `margin:0 0 12px;${a.style ?? ""}` } }),
      h1: (_, a) => ({ tagName: "h1", attribs: { style: `margin:18px 0 10px;font-size:22px;line-height:28px;${a.style ?? ""}` } }),
      h2: (_, a) => ({ tagName: "h2", attribs: { style: `margin:16px 0 8px;font-size:18px;line-height:24px;${a.style ?? ""}` } }),
      h3: (_, a) => ({ tagName: "h3", attribs: { style: `margin:14px 0 6px;font-size:16px;line-height:22px;${a.style ?? ""}` } }),
      ul: (_, a) => ({ tagName: "ul", attribs: { ...a, style: "margin:0 0 12px;padding-left:22px" } }),
      ol: (_, a) => ({ tagName: "ol", attribs: { ...a, style: "margin:0 0 12px;padding-left:22px" } }),
      blockquote: (_, a) => ({ tagName: "blockquote", attribs: { ...a, style: "margin:0 0 12px;padding:4px 0 4px 14px;border-left:3px solid #FDD700;color:#5C584E" } }),
      hr: (_, a) => ({ tagName: "hr", attribs: { ...a, style: "border:0;border-top:1px solid #E0DCCD;margin:18px 0" } }),
    },
  });
}

/** Version texte : paragraphes, listes et liens (adresse entre parenthèses). */
export function emailHtmlToText(html: string) {
  const withLinks = html.replace(/<a [^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g, (_, href: string, label: string) => `${label.replace(/<[^>]+>/g, "")} (${href.replace(/&amp;/g, "&")})`);
  const withBreaks = withLinks.replace(/<li[^>]*>/g, "• ").replace(/<\/(p|h1|h2|h3|li|blockquote|ul|ol)>|<br\s*\/?>|<hr[^>]*>/g, "\n");
  const plain = sanitizeHtml(withBreaks, { allowedTags: [], allowedAttributes: {} });
  return plain
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Le message a-t-il un contenu visible (texte ou image) ? */
export function hasContent(html: string) {
  return /<img\s/i.test(html) || emailHtmlToText(html).length > 0;
}

