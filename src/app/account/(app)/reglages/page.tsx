import type { Metadata } from "next";
import Link from "next/link";
import { IconBuildingBank, IconChartLine, IconChevronRight, IconFileText, IconId, IconMail, IconShieldCheck, IconAlertTriangle } from "@tabler/icons-react";
import { Badge, IconTile, Page, PageHeading, TopBar } from "@/components/app/primitives";
import { requireUser } from "@/lib/server/session";
import { db } from "@/lib/server/db";
import { PROFILE_LABELS } from "@/lib/utils";
import { ContactForm, PasswordForm, PreferenceRows, SignOutButton } from "./settings-client";

export const metadata: Metadata = { title: "Profil et réglages" };

const KYC = { NONE: { tone: "warning", label: "À faire" }, PENDING: { tone: "info", label: "En cours" }, APPROVED: { tone: "up", label: "Vérifiée" }, REJECTED: { tone: "down", label: "Refusée" } } as const;

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-overline m-0 mb-2 text-ink-muted">{title}</h2>
      <div className="overflow-hidden rounded-lg border border-line bg-surface-raised">{children}</div>
    </section>
  );
}

function Row({ href, Icon, label, value }: { href: string; Icon: typeof IconMail; label: string; value?: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-3 border-t border-line px-4 py-3.5 text-ink first:border-t-0 hover:bg-surface-sunken">
      <IconTile size={36}>
        <Icon size={20} stroke={1.75} />
      </IconTile>
      <span className="flex-1 text-[15px] font-semibold">{label}</span>
      <span className="text-sm text-ink-muted">{value}</span>
      <IconChevronRight size={18} stroke={1.75} className="text-ink-muted" />
    </Link>
  );
}

export default async function SettingsPage() {
  const user = await requireUser();
  const accounts = await db.bankAccount.count({ where: { userId: user.id, archivedAt: null } });
  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();
  const kyc = KYC[user.kycStatus];

  return (
    <>
      <TopBar title="Profil" />
      <Page narrow>
        <PageHeading title="Profil et réglages" />
        <div className="flex items-center gap-3.5 rounded-lg bg-flash p-4 text-on-flash">
          <span className="grid size-14 shrink-0 place-items-center rounded-full bg-ink text-xl font-bold text-flash">{initials}</span>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-lg font-bold">
              {user.firstName} {user.lastName}
            </span>
            <span className="truncate text-sm">{user.email}</span>
            <span className="text-caption mt-0.5">Référence de virement : {user.reference}</span>
          </div>
        </div>

        <Group title="Mon compte">
          <Row href="/account/profil" Icon={IconChartLine} label="Profil d'investissement" value={user.profile ? PROFILE_LABELS[user.profile] : "À choisir"} />
          <Row href="/account/reglages/comptes" Icon={IconBuildingBank} label="Comptes bancaires" value={accounts || "Aucun"} />
          <Row href="/account/verification" Icon={IconId} label="Vérification d'identité" value={<Badge tone={kyc.tone}>{kyc.label}</Badge>} />
        </Group>

        <Group title="Coordonnées">
          <ContactForm phone={user.phone ?? ""} email={user.email} />
        </Group>

        <Group title="Préférences">
          <PreferenceRows vapidKey={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ""} />
        </Group>

        <Group title="Sécurité">
          <div className="flex items-center gap-3 px-4 py-3.5">
            <IconTile size={36} tone="up">
              <IconShieldCheck size={20} stroke={1.75} />
            </IconTile>
            <span className="flex flex-1 flex-col">
              <span className="text-[15px] font-semibold">Double vérification</span>
              <span className="text-sm text-ink-muted">Un code par e-mail à chaque connexion et chaque retrait.</span>
            </span>
            <Badge tone="up">Active</Badge>
          </div>
          <PasswordForm />
        </Group>

        <Group title="Aide">
          <Row href="/contact" Icon={IconMail} label="Contacter FlashInv" />
          <Row href="/risques" Icon={IconAlertTriangle} label="Comprendre les risques" />
          <Row href="/conditions-generales" Icon={IconFileText} label="Conditions générales" />
        </Group>

        <SignOutButton />
      </Page>
    </>
  );
}
