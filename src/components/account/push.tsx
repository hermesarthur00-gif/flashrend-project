"use client";
import { useEffect, useState } from "react";
import { useBrowserValue } from "@/components/app/use-browser-value";
import { IconBell } from "@tabler/icons-react";
import { toast } from "sonner";
import { Stripes } from "@/components/ui/decor";
import { Button } from "@/components/ui/button";
import { removePushSubscription, savePushSubscription } from "@/app/account/(app)/notifications/actions";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

type State = "unsupported" | "default" | "granted" | "denied" | "loading";

async function registration() {
  return (await navigator.serviceWorker.getRegistration("/account/")) ?? navigator.serviceWorker.register("/account/sw.js", { scope: "/account/" });
}

export function usePush(vapidKey: string) {
  const supported = useBrowserValue(() => "serviceWorker" in navigator && "PushManager" in window && "Notification" in window, false);
  const permission = useBrowserValue(() => ("Notification" in window ? Notification.permission : "default"), null);
  const [asked, setState] = useState<State | null>(null);
  const state: State = permission === null ? "loading" : !supported || !vapidKey ? "unsupported" : (asked ?? (permission as State));
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.getRegistration("/account/").then(async (reg) => setSubscribed(Boolean(await reg?.pushManager.getSubscription())));
  }, []);

  async function enable() {
    try {
      const perm = await Notification.requestPermission();
      setState(perm as State);
      if (perm !== "granted") return false;
      const reg = await registration();
      await navigator.serviceWorker.ready;
      const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(vapidKey) }));
      const json = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
      const res = await savePushSubscription(json);
      if (res.error) throw new Error(res.error);
      setSubscribed(true);
      toast.success("Notifications activées");
      return true;
    } catch {
      toast.error("Activation impossible sur cet appareil.");
      return false;
    }
  }

  async function disable() {
    const reg = await navigator.serviceWorker.getRegistration("/account/");
    const sub = await reg?.pushManager.getSubscription();
    if (sub) {
      await removePushSubscription(sub.endpoint);
      await sub.unsubscribe();
    }
    setSubscribed(false);
    toast.success("Notifications désactivées sur cet appareil");
  }

  return { state, subscribed, enable, disable };
}

/** Encart d'activation des notifications push. */
export function PushOptIn({ vapidKey }: { vapidKey: string }) {
  const { state, subscribed, enable } = usePush(vapidKey);
  const later = useBrowserValue(() => localStorage.getItem("fi-push-later") === "1", true);
  const [dismissed, setHidden] = useState(false);
  const hidden = later || dismissed;

  if (hidden || state === "loading" || state === "unsupported" || state === "denied" || subscribed) return null;

  return (
    <div className="relative flex flex-col gap-3 overflow-hidden rounded-lg bg-band p-[18px] text-on-band">
      <div className="pointer-events-none absolute -top-1.5 -right-1.5">
        <Stripes count={4} height={64} />
      </div>
      <span className="grid size-11 place-items-center rounded-md bg-flash text-on-flash">
        <IconBell size={24} stroke={1.75} />
      </span>
      <div className="relative">
        <h2 className="m-0 mb-1 text-lg font-bold">Activez les notifications</h2>
        <p className="m-0 text-sm leading-5 opacity-80">Soyez prévenu dès qu&apos;un virement est reçu ou qu&apos;un retrait part, même app fermée.</p>
      </div>
      <div className="flex gap-2">
        <Button onClick={enable}>Activer</Button>
        <Button
          variant="ghost"
          className="text-on-band hover:bg-on-band/10"
          onClick={() => {
            localStorage.setItem("fi-push-later", "1");
            setHidden(true);
          }}
        >
          Plus tard
        </Button>
      </div>
    </div>
  );
}
