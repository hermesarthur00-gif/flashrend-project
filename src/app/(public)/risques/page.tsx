import type { Metadata } from "next";
import { LegalPage } from "@/components/landing/page-shell";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = { title: "Avertissement sur les risques" };

export default function RisksPage() {
  return (
    <LegalPage
      eyebrow="Avant d'investir"
      title="Avertissement sur les risques"
      intro="Investir en crypto peut rapporter, et peut aussi faire perdre de l'argent. Voici ce qu'il faut savoir."
      sections={[
        {
          id: "perte",
          title: "Risque de perte en capital",
          body: (
            <p>
              <strong>La valeur de votre investissement peut baisser, et vous pouvez perdre tout ou partie de l&apos;argent investi.</strong> FlashInv ne garantit aucun rendement. N&apos;investissez que de l&apos;argent dont vous n&apos;avez pas besoin à court terme.
            </p>
          ),
        },
        {
          id: "volatilite",
          title: "Volatilité",
          body: <p>Les cours des cryptomonnaies peuvent varier très fortement en quelques heures. Même le profil prudent peut connaître des baisses. Plus le profil est dynamique, plus les variations peuvent être importantes.</p>,
        },
        {
          id: "performances",
          title: "Performances passées",
          body: <p>Les performances passées ne préjugent pas des performances futures. Les répartitions affichées par profil sont indicatives et peuvent être ajustées par FlashInv selon le marché.</p>,
        },
        {
          id: "stablecoins",
          title: "Stablecoins",
          body: <p>Les stablecoins (comme l&apos;USDT) visent à suivre la valeur du dollar, sans garantie absolue. Leur émetteur peut rencontrer des difficultés et leur valeur peut s&apos;écarter du dollar.</p>,
        },
        {
          id: "change",
          title: "Risque de change",
          body: <p>Les placements sont suivis en dollars. Si vous déposez en euros, la conversion et l&apos;évolution du taux de change peuvent modifier la valeur de votre investissement exprimée en euros.</p>,
        },
        {
          id: "reglementation",
          title: "Évolution de la réglementation",
          body: <p>La réglementation des actifs numériques évolue. Des changements peuvent affecter le fonctionnement du service, la fiscalité ou les délais de retrait.</p>,
        },
        {
          id: "arnaques",
          title: "Arnaques et usurpations",
          body: (
            <>
              <p>FlashInv ne vous demandera jamais :</p>
              <ul>
                <li>votre mot de passe ou vos codes de vérification ;</li>
                <li>un virement vers un autre compte que celui affiché dans votre espace ;</li>
                <li>d&apos;installer un logiciel de prise en main à distance.</li>
              </ul>
              <p>
                En cas de doute, ne faites rien et écrivez-nous à <a href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a>.
              </p>
            </>
          ),
        },
        {
          id: "fiscalite",
          title: "Fiscalité",
          body: <p>Les gains réalisés peuvent être imposables selon votre pays de résidence. Il vous appartient de les déclarer. En cas de doute, renseignez-vous auprès d&apos;un conseiller.</p>,
        },
      ]}
    />
  );
}
