import type { Metadata } from "next";
import { IconClock, IconCircleCheck } from "@tabler/icons-react";
import { Alert, Card, Page, StatusBadge, TopBar } from "@/components/app/primitives";
import { Coin, Stripes } from "@/components/ui/decor";
import { ButtonLink } from "@/components/ui/button";
import { requireUser } from "@/lib/server/session";
import { db } from "@/lib/server/db";
import { getSettings } from "@/lib/server/settings";
import { KycFlow } from "./kyc-flow";

export const metadata: Metadata = { title: "Vérification d'identité" };

export default async function VerificationPage() {
  const user = await requireUser();

  if (user.kycStatus === "PENDING" || user.kycStatus === "APPROVED") {
    const approved = user.kycStatus === "APPROVED";
    const kycDelay = approved ? "" : (await getSettings()).money.kycDelay;
    return (
      <>
        <TopBar bell={false} title="Vérification" back={user.profile ? "/account/reglages" : undefined} className="lg:flex" />
        <Page narrow className="flex-1">
          <div className="relative grid h-[200px] place-items-center">
            <Coin tone="black" size={96} tilt={50} spin={-16} />
            <span className="absolute top-11 right-[calc(50%-96px)] grid size-12 place-items-center rounded-full bg-flash text-on-flash">
              {approved ? <IconCircleCheck size={24} stroke={1.75} /> : <IconClock size={24} stroke={1.75} />}
            </span>
            <div className="absolute bottom-4 left-6">
              <Stripes count={4} height={40} />
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-h2 m-0 mb-2">{approved ? "Identité vérifiée" : "Vérification en cours"}</h1>
            <p className="m-0 text-ink-muted">
              {approved ? "Votre compte est actif : vous pouvez déposer et retirer." : `Nous vérifions vos documents${kycDelay ? `, généralement sous ${kycDelay}` : ""}. Vous recevrez une notification dès que c'est fait.`}
            </p>
          </div>
          <Card className="py-1 lg:py-1">
            {["Adresse", "Pièce d'identité", "Selfie"].map((l, i) => (
              <div key={l} className={i ? "flex items-center justify-between border-t border-line py-3" : "flex items-center justify-between py-3"}>
                <span className="font-semibold">{l}</span>
                <StatusBadge status={approved || i === 0 ? "done" : "processing"} label={approved || i === 0 ? "Validé" : undefined} />
              </div>
            ))}
          </Card>
          <div className="mt-auto flex flex-col gap-2">
            {!user.profile ? (
              <ButtonLink href="/account/profil" size="lg" block>
                {approved ? "Choisir mon profil" : "Choisir mon profil en attendant"}
              </ButtonLink>
            ) : (
              <ButtonLink href="/account" size="lg" block>
                Revenir à l&apos;accueil
              </ButtonLink>
            )}
          </div>
        </Page>
      </>
    );
  }

  const last = user.kycStatus === "REJECTED" ? await db.kycSubmission.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }) : null;
  return (
    <KycFlow
      rejected={
        last ? (
          <Alert tone="down" title="Vérification refusée">
            {last.rejectReason ?? "Un document n'a pas pu être validé."} Merci de recommencer.
          </Alert>
        ) : null
      }
      defaults={last ? { birthDate: last.birthDate, address: last.address, postalCode: last.postalCode, city: last.city, country: last.country } : undefined}
    />
  );
}
