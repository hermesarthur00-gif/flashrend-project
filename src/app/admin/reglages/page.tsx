import Link from "next/link";
import { AdminHead, LinkTabs, Panel, Person, Table } from "@/components/admin/ui";
import { Badge } from "@/components/app/primitives";
import { requireAdmin } from "@/lib/server/session";
import { getSettings } from "@/lib/server/settings";
import { db } from "@/lib/server/db";
import { formatDate } from "@/lib/utils";
import { BankSettings, SectionForm, TeamForm } from "./settings-forms";

export const metadata = { title: "Réglages" };

const TABS = [
  { key: "societe", label: "Société" },
  { key: "banque", label: "Coordonnées bancaires" },
  { key: "frais", label: "Frais et délais" },
  { key: "contact", label: "Contact" },
  { key: "equipe", label: "Équipe" },
];

export default async function SettingsPage({ searchParams }: PageProps<"/admin/reglages">) {
  const admin = await requireAdmin();
  const sp = await searchParams;
  const tab = TABS.find((t) => t.key === sp.onglet)?.key ?? "societe";
  const s = await getSettings();
  const team = tab === "equipe" ? await db.user.findMany({ where: { role: "ADMIN" }, orderBy: { createdAt: "asc" } }) : [];

  return (
    <>
      <AdminHead title="Réglages" sub="Ces informations s'affichent sur le site public et dans l'app des clients." />
      <LinkTabs base="/admin/reglages" param="onglet" value={tab} items={TABS} />
      {tab === "societe" && (
        <Panel title="Informations légales" right={<Badge>Mentions légales</Badge>} className="max-w-[880px]">
          <SectionForm
            section="legal"
            fields={[
              { name: "companyName", label: "Raison sociale", value: s.legal.companyName, placeholder: "FlashRend SAS" },
              { name: "legalForm", label: "Forme juridique", value: s.legal.legalForm, placeholder: "SAS" },
              { name: "shareCapital", label: "Capital social", value: s.legal.shareCapital, placeholder: "10 000 €" },
              { name: "registration", label: "RCS et SIREN", value: s.legal.registration, placeholder: "RCS Paris 123 456 789" },
              { name: "vatNumber", label: "N° de TVA intracommunautaire", value: s.legal.vatNumber, placeholder: "FR12 123456789" },
              { name: "director", label: "Directeur de la publication", value: s.legal.director, placeholder: "Prénom Nom" },
              { name: "address", label: "Adresse du siège", value: s.legal.address, placeholder: "10 rue Exemple, 75001 Paris", wide: true },
              { name: "host", label: "Hébergeur", value: s.legal.host, placeholder: "Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis", wide: true },
              { name: "mediator", label: "Médiateur de la consommation", value: s.legal.mediator, placeholder: "Nom et site du médiateur", wide: true },
              { name: "lastUpdated", label: "Date de mise à jour des documents", value: s.legal.lastUpdated, placeholder: "5 novembre 2026" },
            ]}
          />
        </Panel>
      )}
      {tab === "banque" && <BankSettings bank={s.bank} email={admin.email} />}
      {tab === "frais" && (
        <Panel title="Frais et délais" className="max-w-[880px]">
          <SectionForm
            section="money"
            fields={[
              { name: "managementFee", label: "Frais de gestion", value: s.money.managementFee, placeholder: "1,5 % par an" },
              { name: "depositFee", label: "Frais de dépôt", value: s.money.depositFee, placeholder: "Aucun" },
              { name: "withdrawalFee", label: "Frais de retrait (en euros)", value: String(s.money.withdrawalFee).replace(".", ","), placeholder: "0", hint: "Prélevé sur le solde disponible en plus du montant retiré." },
              { name: "depositMin", label: "Dépôt minimum (en euros)", value: String(s.money.depositMin).replace(".", ",") },
              { name: "withdrawalMin", label: "Retrait minimum (en euros)", value: String(s.money.withdrawalMin).replace(".", ",") },
              { name: "depositDelayStandard", label: "Délai d'un dépôt par virement classique", value: s.money.depositDelayStandard, placeholder: "1 à 3 jours ouvrés", hint: "Temps de vérification annoncé au client." },
              { name: "depositDelayInstant", label: "Délai d'un dépôt par virement instantané", value: s.money.depositDelayInstant, placeholder: "quelques minutes à quelques heures" },
              { name: "investMin", label: "Investissement minimum (en euros)", value: String(s.money.investMin).replace(".", ",") },
              { name: "withdrawalDelay", label: "Délai de retrait", value: s.money.withdrawalDelay, placeholder: "1 à 3 jours ouvrés" },
              { name: "kycDelay", label: "Délai de vérification d'identité", value: s.money.kycDelay, placeholder: "24 h ouvrées" },
            ]}
          />
        </Panel>
      )}
      {tab === "contact" && (
        <Panel title="Contact" className="max-w-[880px]">
          <SectionForm
            section="contact"
            fields={[
              { name: "email", label: "E-mail de contact", value: s.contact.email, type: "email" },
              { name: "phone", label: "Téléphone", value: s.contact.phone, placeholder: "+33 1 00 00 00 00" },
              { name: "address", label: "Adresse postale", value: s.contact.address, placeholder: "10 rue Exemple, 75001 Paris", wide: true },
            ]}
          />
          <p className="m-0 text-sm text-ink-muted">L&apos;expéditeur des e-mails transactionnels se règle avec la variable EMAIL_FROM (Resend).</p>
        </Panel>
      )}
      {tab === "equipe" && (
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Table head={["Administrateur", "Depuis le", ""]} align={["left", "left", "right"]}>
            {team.map((u) => (
              <tr key={u.id}>
                <td><Person name={u.name} email={u.email} /></td>
                <td>{formatDate(u.createdAt)}</td>
                <td className="text-right">
                  {u.id === admin.id ? (
                    <Badge>Vous</Badge>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <Link href={`/admin/clients/${u.id}`} className="px-2 text-sm font-semibold">
                        Fiche
                      </Link>
                      <TeamForm email={u.email} remove />
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </Table>
          <Panel title="Ajouter un administrateur">
            <p className="m-0 text-sm text-ink-muted">La personne doit déjà avoir un compte FlashRend. Elle accède à l&apos;admin après sa prochaine connexion.</p>
            <TeamForm />
          </Panel>
        </div>
      )}
    </>
  );
}
