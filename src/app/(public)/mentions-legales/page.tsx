import type { Metadata } from "next";
import { LegalPage } from "@/components/landing/page-shell";
import { getPublicConfig } from "@/lib/server/public-config";

export const metadata: Metadata = { title: "Mentions légales" };

export default async function LegalNoticePage() {
  const siteConfig = await getPublicConfig();
  const { legal } = siteConfig;
  return (
    <LegalPage
      eyebrow="Légal"
      title="Mentions légales"
      sections={[
        {
          id: "editeur",
          title: "Éditeur du site",
          body: (
            <ul>
              <li><strong>Raison sociale</strong> : {legal.companyName}</li>
              <li><strong>Forme juridique</strong> : {legal.legalForm} au capital de {legal.shareCapital}</li>
              <li><strong>Siège social</strong> : {legal.address}</li>
              <li><strong>Immatriculation</strong> : {legal.registration}</li>
              <li><strong>TVA intracommunautaire</strong> : {legal.vatNumber}</li>
              <li><strong>E-mail</strong> : <a href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a></li>
              <li><strong>Téléphone</strong> : {siteConfig.contact.phone}</li>
            </ul>
          ),
        },
        {
          id: "publication",
          title: "Directeur de la publication",
          body: <p>{legal.director}</p>,
        },
        {
          id: "hebergement",
          title: "Hébergement",
          body: <p>{legal.host}</p>,
        },
        {
          id: "mediation",
          title: "Médiation de la consommation",
          body: <p>En cas de litige non résolu avec notre service client, vous pouvez saisir gratuitement le médiateur : {legal.mediator}.</p>,
        },
        {
          id: "propriete",
          title: "Propriété intellectuelle",
          body: <p>La marque FlashRend, son logo et l&apos;ensemble des contenus du site sont protégés. Toute reproduction sans autorisation écrite est interdite.</p>,
        },
      ]}
    />
  );
}
