import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/landing/page-shell";
import { getPublicConfig } from "@/lib/server/public-config";

export const metadata: Metadata = { title: "Conditions générales" };

export default async function TermsPage() {
  const siteConfig = await getPublicConfig();
  const { legal } = siteConfig;
  return (
    <LegalPage
      eyebrow="Légal"
      title="Conditions générales d'utilisation"
      intro="Les règles qui encadrent l'utilisation de FlashInv. Lisez-les avant d'ouvrir un compte."
      sections={[
        {
          id: "objet",
          title: "Objet",
          body: (
            <p>
              Les présentes conditions générales régissent l&apos;accès et l&apos;utilisation du site flashinv.com et de l&apos;application FlashInv, édités par {legal.companyName}, {legal.legalForm} au capital de {legal.shareCapital}, immatriculée au {legal.registration}, dont le siège est situé {legal.address} (« FlashInv »). En créant un compte, vous les acceptez sans réserve.
            </p>
          ),
        },
        {
          id: "service",
          title: "Le service",
          body: (
            <>
              <p>
                FlashInv investit les fonds de ses clients sur des actifs numériques (cryptomonnaies) selon le profil choisi par le client : prudent, équilibré ou dynamique. La répartition entre actifs est déterminée et ajustée par FlashInv.
              </p>
              <p>Le client suit en temps réel son solde, sa répartition, ses opérations et les frais appliqués depuis son espace.</p>
            </>
          ),
        },
        {
          id: "compte",
          title: "Ouverture du compte",
          body: (
            <>
              <p>L&apos;ouverture d&apos;un compte est réservée aux personnes majeures et capables. Elle nécessite :</p>
              <ul>
                <li>des informations exactes et à jour ;</li>
                <li>une vérification d&apos;identité (pièce d&apos;identité et selfie) ;</li>
                <li>l&apos;activation de la double authentification.</li>
              </ul>
              <p>FlashInv peut refuser ou suspendre un compte si les vérifications n&apos;aboutissent pas ou en cas de suspicion de fraude.</p>
            </>
          ),
        },
        {
          id: "depots",
          title: "Dépôts",
          body: (
            <p>
              Les dépôts se font uniquement par virement bancaire, en dollars américains ou en euros, sur le compte au nom de FlashInv indiqué dans l&apos;espace du client, avec sa référence personnelle et une preuve du virement. Après vérification de la réception par FlashInv, le montant reçu est crédité en dollars sur le solde disponible du client ; un virement en euros est converti au taux appliqué à la réception. Le client décide ensuite d&apos;investir tout ou partie de ce solde selon son profil. Un virement sans référence peut retarder la vérification.
            </p>
          ),
        },
        {
          id: "retraits",
          title: "Retraits",
          body: (
            <p>
              Le client peut à tout moment désinvestir tout ou partie de ses investissements vers son solde disponible, aux cours du moment, puis demander le retrait de ce solde depuis son espace. Le montant est envoyé par virement sur un compte bancaire à son nom sous {siteConfig.withdrawalDelay}. Chaque retrait est confirmé par un code de vérification.
            </p>
          ),
        },
        {
          id: "frais",
          title: "Frais",
          body: <p>{siteConfig.fees}. Les frais applicables sont affichés dans l&apos;espace du client avant chaque opération.</p>,
        },
        {
          id: "risques",
          title: "Risques",
          body: (
            <p>
              Investir en cryptomonnaies comporte un risque de perte partielle ou totale du capital. FlashInv ne garantit aucun rendement. Le client reconnaît avoir pris connaissance de l&apos;
              <Link href="/risques">avertissement sur les risques</Link>.
            </p>
          ),
        },
        {
          id: "securite",
          title: "Sécurité du compte",
          body: (
            <p>
              Le client est responsable de la confidentialité de ses identifiants et codes. FlashInv ne les demandera jamais par e-mail, téléphone ou message. Toute opération suspecte doit être signalée sans délai à{" "}
              <a href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a>.
            </p>
          ),
        },
        {
          id: "resiliation",
          title: "Clôture du compte",
          body: <p>Le client peut clôturer son compte à tout moment après le retrait de l&apos;ensemble de ses fonds. FlashInv peut clôturer un compte en cas de manquement grave aux présentes conditions, après en avoir informé le client.</p>,
        },
        {
          id: "droit",
          title: "Droit applicable",
          body: <p>Les présentes conditions sont soumises au droit français. En cas de litige, le client peut contacter FlashInv pour rechercher une solution amiable, puis recourir gratuitement à un médiateur de la consommation : [NOM ET COORDONNÉES DU MÉDIATEUR]. À défaut d&apos;accord, les tribunaux français sont compétents.</p>,
        },
      ]}
    />
  );
}
