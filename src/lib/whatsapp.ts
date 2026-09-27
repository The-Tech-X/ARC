import { site } from "@/content/site";

/**
 * A wa.me link that opens WhatsApp (app on phones, WhatsApp Web on desktop)
 * to ARC's number with `text` already typed in — the visitor only has to
 * press send. https://faq.whatsapp.com/5913398998672934
 */
export function whatsappLink(text: string) {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;
}
