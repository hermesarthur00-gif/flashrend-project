import type { Metadata } from "next";
import { LegalPage } from "@/components/landing/page-shell";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = { title: "Confidentialité" };

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Légal"
      title="Politique de confidentialité"
      intro="Quelles données nous collectons, pourquoi, et comment vous gardez la main dessus."
      sections={[
        {
          id: "responsable",
          title: "Responsable du traitement",
          body: (
            <p>
              Les données personnelles sont traitées par {siteConfig.legal.companyName}, {siteConfig.legal.address}. Pour toute question : <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>.
            </p>
          ),
        },
        {
          id: "donnees",
          title: "Données collectées",
          body: (
            <ul>
              <li><strong>Identité</strong> : nom, prénom, date de naissance, pièce d&apos;identité, selfie de vérification.</li>
              <li><strong>Contact</strong> : adresse e-mail, numéro de téléphone, adresse postale.</li>
              <li><strong>Bancaires</strong> : coordonnées du compte utilisé pour les dépôts et retraits.</li>
              <li><strong>Utilisation</strong> : profil choisi, opérations, historique de connexion, appareil utilisé.</li>
            </ul>
          ),
        },
        {
          id: "finalites",
          title: "Pourquoi nous les utilisons",
          body: (
            <ul>
              <li>ouvrir et gérer votre compte ;</li>
              <li>vérifier votre identité et lutter contre la fraude et le blanchiment ;</li>
              <li>exécuter vos dépôts, placements et retraits ;</li>
              <li>vous informer sur votre compte et répondre à vos demandes ;</li>
              <li>respecter nos obligations légales.</li>
            </ul>
          ),
        },
        {
          id: "partage",
          title: "Avec qui nous les partageons",
          body: (
            <p>
              Vos données ne sont jamais vendues. Elles sont partagées uniquement avec nos prestataires techniques (hébergement, vérification d&apos;identité, envoi d&apos;e-mails, stockage de fichiers), nos partenaires bancaires et les autorités lorsque la loi l&apos;exige. Chaque prestataire est tenu à la confidentialité.
            </p>
          ),
        },
        {
          id: "duree",
          title: "Durée de conservation",
          body: <p>Les données sont conservées pendant la durée de la relation, puis archivées pendant la durée imposée par les obligations légales et comptables : [DURÉE DE CONSERVATION].</p>,
        },
        {
          id: "droits",
          title: "Vos droits",
          body: (
            <>
              <p>Vous pouvez à tout moment accéder à vos données, les faire rectifier ou supprimer, vous opposer à certains traitements ou demander leur portabilité, dans les limites prévues par la loi.</p>
              <p>
                Écrivez-nous à <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a> en précisant votre demande. Une pièce d&apos;identité pourra vous être demandée.
              </p>
            </>
          ),
        },
        {
          id: "securite",
          title: "Sécurité",
          body: <p>Les données sont chiffrées en transit, l&apos;accès aux comptes est protégé par double authentification et l&apos;accès interne est limité aux personnes qui en ont besoin.</p>,
        },
        {
          id: "cookies",
          title: "Cookies",
          body: <p>Le site utilise uniquement les cookies nécessaires à son fonctionnement et à la sécurité de votre session. Aucun cookie publicitaire n&apos;est déposé.</p>,
        },
      ]}
    />
  );
}
