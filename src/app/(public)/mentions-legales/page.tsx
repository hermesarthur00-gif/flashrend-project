import type { Metadata } from "next";
import { LegalPage } from "@/components/landing/page-shell";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = { title: "Mentions légales" };

const { legal } = siteConfig;

export default function LegalNoticePage() {
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
              <li><strong>Forme juridique</strong> : {legal.legalForm}</li>
              <li><strong>Siège social</strong> : {legal.address}</li>
              <li><strong>Immatriculation</strong> : {legal.registration}</li>
              <li><strong>Identifiant fiscal</strong> : {legal.taxId}</li>
              <li><strong>Contact</strong> : <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a></li>
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
          id: "propriete",
          title: "Propriété intellectuelle",
          body: <p>La marque FlashInv, son logo et l&apos;ensemble des contenus du site sont protégés. Toute reproduction sans autorisation écrite est interdite.</p>,
        },
      ]}
    />
  );
}
