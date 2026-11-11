import Script from "next/script";

const TIDIO_KEY = process.env.NEXT_PUBLIC_TIDIO_KEY ?? "w41ym7plpvzk8zu2nbb0lafrqfc3ufum";

/** Messagerie d'assistance Tidio (site public et espace client, pas l'administration). */
export function SupportChat() {
  return <Script src={`//code.tidio.co/${TIDIO_KEY}.js`} strategy="afterInteractive" />;
}

/** Sur mobile, remonte la bulle au-dessus de la barre de navigation de l'espace client. */
export function SupportChatLift() {
  return <style>{`@media (max-width: 1023px){#tidio-chat-iframe{bottom:calc(76px + env(safe-area-inset-bottom)) !important}}`}</style>;
}
