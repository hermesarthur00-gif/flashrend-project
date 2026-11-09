import Link from "next/link";
import { Alert } from "@/components/app/primitives";
import { AdminHead } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/server/session";
import { GuideToc } from "./guide-toc";

export const metadata = { title: "Guide" };

const SECTIONS = [
  { id: "prise-en-main", label: "Prise en main" },
  { id: "tableau-de-bord", label: "Tableau de bord" },
  { id: "clients", label: "Clients" },
  { id: "verifications", label: "Vérifications" },
  { id: "depots", label: "Dépôts" },
  { id: "retraits", label: "Retraits" },
  { id: "profils", label: "Profils" },
  { id: "reglages", label: "Réglages" },
  { id: "journal", label: "Journal" },
  { id: "parcours", label: "Parcours complets" },
];

function Section({ id, n, title, href, intro, children }: { id: string; n: number; title: string; href?: string; intro: string; children: React.ReactNode }) {
  return (
    <section id={id} className="flex scroll-mt-6 flex-col gap-4 rounded-lg border border-line bg-surface-raised p-6 lg:p-8">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-overline text-flash-text">{String(n).padStart(2, "0")}</span>
        <h2 className="text-h2 m-0">{title}</h2>
        {href && (
          <Link href={href} className="ml-auto text-sm font-semibold">
            Ouvrir l&apos;onglet
          </Link>
        )}
      </div>
      <p className="m-0 max-w-[70ch] text-ink-muted">{intro}</p>
      {children}
    </section>
  );
}

function Sub({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 border-t border-line pt-4">
      <h3 className="text-h3 m-0">{title}</h3>
      <div className="flex max-w-[72ch] flex-col gap-2 text-[15px] leading-6 [&_ol]:m-0 [&_ol]:list-decimal [&_ol]:grid [&_ol]:gap-1.5 [&_ol]:pl-5 [&_p]:m-0 [&_ul]:m-0 [&_ul]:list-disc [&_ul]:grid [&_ul]:gap-1.5 [&_ul]:pl-5">{children}</div>
    </div>
  );
}

/** Ce que le client voit ou reçoit après l'action. */
function Client({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-md bg-surface-sunken px-3.5 py-2.5 text-sm">
      <strong>Côté client : </strong>
      {children}
    </p>
  );
}

export default async function GuidePage() {
  await requireAdmin();
  return (
    <>
      <AdminHead title="Guide de l'admin" sub="Chaque onglet, chaque action, et ce que le client voit ensuite." />
      <div className="grid items-start gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden lg:sticky lg:top-8 lg:block">
          <GuideToc items={SECTIONS} />
        </aside>
        <div className="flex min-w-0 flex-col gap-6">
          <Section id="prise-en-main" n={1} title="Prise en main" intro="L'admin se trouve sur /admin. On y accède avec un compte FlashInv qui a le rôle administrateur.">
            <Sub title="Se connecter">
              <ol>
                <li>Connectez-vous sur /account/connexion avec votre e-mail et votre mot de passe.</li>
                <li>Saisissez le code à 6 chiffres reçu par e-mail. Il est demandé à chaque connexion.</li>
                <li>Vous arrivez directement sur l&apos;admin.</li>
              </ol>
            </Sub>
            <Sub title="Rôle administrateur">
              <p>Un nouveau compte est toujours client. Un administrateur peut donner le rôle à un autre compte depuis sa fiche client ou depuis Réglages, onglet Équipe. Personne ne peut modifier, bannir ou supprimer son propre compte, et il reste toujours au moins un administrateur.</p>
            </Sub>
            <Sub title="Traçabilité">
              <p>Toutes les actions sensibles sont inscrites au Journal avec leur auteur : validation d&apos;identité, placement, retrait, changement de réglage, de rôle, bannissement, suppression, consultation d&apos;une pièce d&apos;identité.</p>
            </Sub>
            <Alert tone="info" title="Les compteurs du menu">
              Les pastilles jaunes à côté de Vérifications, Dépôts et Retraits indiquent le nombre de dossiers en attente.
            </Alert>
          </Section>

          <Section id="tableau-de-bord" n={2} title="Tableau de bord" href="/admin" intro="La vue d'ensemble : ce que FlashInv gère et ce qui attend une action.">
            <Sub title="Les indicateurs">
              <ul>
                <li><strong>Encours total</strong> : valeur de toutes les cryptos détenues par les clients, aux cours actuels.</li>
                <li><strong>Clients actifs</strong> : clients dont l&apos;identité est validée et qui ne sont pas bannis, avec le nombre d&apos;inscrits du mois.</li>
                <li><strong>Vérifications à faire</strong>, <strong>Dépôts à rapprocher</strong>, <strong>Retraits à envoyer</strong> : un clic ouvre l&apos;onglet concerné.</li>
              </ul>
            </Sub>
            <Sub title="La courbe et les listes">
              <p>La courbe « Encours sous gestion » se remplit jour après jour, grâce à une tâche planifiée qui relève chaque jour la valeur des portefeuilles. Sous la courbe, les 5 plus anciens dépôts et retraits en attente donnent un accès direct à leur traitement.</p>
            </Sub>
          </Section>

          <Section id="clients" n={3} title="Clients" href="/admin/clients" intro="La liste des clients, leur fiche détaillée et la gestion de leur compte.">
            <Sub title="Trouver un client">
              <ul>
                <li>Filtres : Tous, Actifs, À vérifier, Bannis.</li>
                <li>Recherche par nom, e-mail ou référence de virement (ex. FI-48210).</li>
                <li><strong>Exporter en CSV</strong> télécharge la liste complète, lisible dans Excel. L&apos;export est noté au Journal.</li>
                <li>Les administrateurs n&apos;apparaissent pas dans cette liste : retrouvez-les dans Réglages, onglet Équipe.</li>
              </ul>
            </Sub>
            <Sub title="La fiche client">
              <p>Bouton <strong>Ouvrir</strong> sur une ligne. La fiche montre le solde et le gain, le montant net déposé, les opérations en attente, chaque position (quantité, cours, valeur), l&apos;historique des opérations, l&apos;identité déclarée, le profil, les comptes bancaires et l&apos;activité de connexion.</p>
            </Sub>
            <Sub title="Changer le rôle">
              <ol>
                <li>Dans « Gestion du compte », choisissez Client ou Administrateur.</li>
                <li>Cliquez sur Appliquer.</li>
              </ol>
              <p>Un administrateur repassé client est déconnecté de tous ses appareils.</p>
            </Sub>
            <Sub title="Bannir et réactiver">
              <ol>
                <li>Indiquez un motif. Il reste interne, le client ne le voit pas.</li>
                <li>Cliquez sur Bannir le compte.</li>
              </ol>
              <Client>il est déconnecté immédiatement et voit « Ce compte est suspendu. Contactez le support. » s&apos;il essaie de se reconnecter.</Client>
              <p>Le bouton Réactiver le compte lui rend l&apos;accès à sa prochaine connexion.</p>
            </Sub>
            <Sub title="Supprimer un compte">
              <ol>
                <li>Cliquez sur Supprimer le compte.</li>
                <li>Retapez l&apos;e-mail du client pour confirmer.</li>
                <li>Cliquez sur Supprimer définitivement.</li>
              </ol>
              <ul>
                <li>Sans aucune opération : le compte est supprimé entièrement.</li>
                <li>Avec un historique : le compte est anonymisé. Nom, e-mail, téléphone, adresse et pièces d&apos;identité sont effacés, les IBAN réduits à leurs 4 derniers caractères. Les dépôts et retraits restent dans l&apos;historique, comme la loi l&apos;impose.</li>
              </ul>
            </Sub>
            <Alert tone="warning" title="Suppression définitive">
              Elle est impossible tant que le client a un solde ou une opération en attente : il doit d&apos;abord tout retirer. Une fois faite, rien ne peut être récupéré.
            </Alert>
          </Section>

          <Section id="verifications" n={4} title="Vérifications d'identité" href="/admin/verifications" intro="Un client ne peut ni déposer ni retirer tant que son identité n'est pas validée.">
            <Sub title="Examiner un dossier">
              <ol>
                <li>Dans l&apos;onglet En attente, cliquez sur un dossier. Le plus ancien est en haut.</li>
                <li>Regardez le recto, le verso (carte d&apos;identité) ou la page photo (passeport), et le selfie. Agrandir (ou un clic sur l&apos;image) l&apos;ouvre en grand dans une fenêtre ; Échap ou un clic à côté la referme.</li>
                <li>Comparez avec les informations déclarées : nom, date de naissance, adresse, pays.</li>
              </ol>
              <p>Chaque consultation d&apos;un document est notée au Journal.</p>
            </Sub>
            <Sub title="Valider">
              <p>Cochez les 4 contrôles (document valide, nom et date identiques, selfie conforme, document non retouché). Le bouton Valider l&apos;identité ne s&apos;active qu&apos;après.</p>
              <Client>notification et e-mail « Identité vérifiée ». Les dépôts s&apos;ouvrent.</Client>
            </Sub>
            <Sub title="Refuser">
              <p>Écrivez le motif dans le champ prévu, puis cliquez sur Refuser. Le motif est montré au client : soyez précis (photo floue, document expiré, nom différent…).</p>
              <Client>notification et e-mail avec le motif. Il refait la vérification depuis l&apos;app, et son nouveau dossier revient dans En attente.</Client>
            </Sub>
          </Section>

          <Section id="depots" n={5} title="Dépôts" href="/admin/depots" intro="Les clients déposent par virement bancaire sur le compte FlashInv. L'admin rapproche chaque virement reçu avec le dépôt annoncé, et le montant est placé automatiquement.">
            <Sub title="Comment un dépôt arrive">
              <p>Le client choisit la devise (USD ou EUR), voit les coordonnées bancaires de FlashInv et sa référence personnelle (ex. FI-48210), fait le virement depuis sa banque puis clique sur « J&apos;ai fait le virement ». Le dépôt apparaît alors dans l&apos;onglet À rapprocher.</p>
            </Sub>
            <Sub title="Rapprocher un virement reçu">
              <ol>
                <li>Sur votre relevé bancaire, repérez le virement et sa référence.</li>
                <li>Dans À rapprocher, cliquez sur la ligne du client qui a cette référence.</li>
                <li>Saisissez le montant réellement reçu, et pour un virement en euros le taux EUR → USD appliqué (prérempli avec le taux par défaut des Réglages).</li>
                <li>Vérifiez la date de réception, puis cliquez sur Confirmer la réception.</li>
              </ol>
              <p>Le montant est converti en dollars si besoin, puis réparti sur les cryptos du profil du client, aux cours du moment.</p>
              <Client>notification et e-mail « Virement reçu et placé ». Les cryptos apparaissent dans son portefeuille.</Client>
            </Sub>
            <Sub title="Virement reçu sans annonce">
              <p>Sans ligne sélectionnée, le panneau de droite permet d&apos;enregistrer un virement que le client n&apos;a pas annoncé : référence du client, devise, montant et taux. Le placement est fait de la même façon.</p>
            </Sub>
            <Sub title="Refuser ou signaler un écart">
              <p>Signaler un écart ou refuser, indiquez la raison (visible par le client), puis Refuser le dépôt. Rien n&apos;est placé.</p>
              <Client>notification et e-mail « Virement non accepté » avec la raison.</Client>
            </Sub>
            <Alert tone="warning" title="Avant de confirmer">
              Vérifiez que la référence correspond, que le compte émetteur est au nom du client et que le montant saisi est celui réellement reçu (après frais bancaires). Un placement confirmé ne s&apos;annule pas depuis l&apos;admin. Un client sans profil choisi ne peut pas être placé.
            </Alert>
          </Section>

          <Section id="retraits" n={6} title="Retraits" href="/admin/retraits" intro="Le client demande un retrait dans l'app et le confirme avec un code reçu par e-mail. L'admin envoie le virement puis le marque comme envoyé.">
            <Sub title="Ce qui se passe à la demande">
              <p>Dès la confirmation par code, le montant et les frais de retrait sont vendus sur le portefeuille du client, sur chaque crypto en proportion. Le montant à virer est donc figé : il ne bouge plus avec les cours.</p>
            </Sub>
            <Sub title="Envoyer un retrait">
              <ol>
                <li>Dans À envoyer, cliquez sur le retrait. Le plus ancien est sélectionné d&apos;office.</li>
                <li>Faites le virement depuis la banque de FlashInv : montant « À virer », titulaire et IBAN affichés (bouton pour copier l&apos;IBAN).</li>
                <li>Saisissez la référence du virement donnée par votre banque (facultatif mais conseillé).</li>
                <li>Cliquez sur Marquer comme envoyé.</li>
              </ol>
              <Client>notification et e-mail « Retrait envoyé ».</Client>
            </Sub>
            <Sub title="Refuser un retrait">
              <p>Refuser la demande, indiquez le motif (visible par le client), puis Refuser.</p>
              <Client>notification et e-mail « Retrait annulé » avec le motif.</Client>
            </Sub>
            <Alert tone="warning" title="Un retrait refusé est replacé">
              Le montant et les frais sont rachetés en cryptos selon le profil du client, aux cours du moment du refus. Les quantités obtenues peuvent donc différer de celles vendues à la demande.
            </Alert>
          </Section>

          <Section id="profils" n={7} title="Profils et répartition" href="/admin/profils" intro="Chaque profil (Prudent, Équilibré, Dynamique) a une répartition cible entre les cryptos. Elle s'applique à chaque nouveau dépôt.">
            <Sub title="Modifier une répartition">
              <ol>
                <li>Dans la carte du profil, saisissez la part de chaque crypto en %. Laissez vide ou 0 pour l&apos;exclure.</li>
                <li>Le total doit faire exactement 100 % pour que Enregistrer s&apos;active.</li>
                <li>Cliquez sur Enregistrer.</li>
              </ol>
              <p>Sans autre option, seuls les prochains dépôts suivent la nouvelle répartition. Le site public affiche aussi la nouvelle répartition.</p>
            </Sub>
            <Sub title="Rééquilibrer les portefeuilles">
              <p>Cochez « Rééquilibrer les clients de ce profil » avant d&apos;enregistrer : tous les portefeuilles du profil sont échangés pour suivre la nouvelle répartition, aux cours du moment.</p>
              <Client>notification « Portefeuille rééquilibré » et une ligne dans son historique.</Client>
            </Sub>
            <Alert tone="warning" title="Le rééquilibrage touche tous les clients du profil">
              Il se fait en une fois, pour tous. Vérifiez la répartition avant de cocher la case. Le tableau « Derniers changements » garde la trace de chaque modification.
            </Alert>
            <p className="m-0 text-sm text-ink-muted">Quand un client change lui-même de profil depuis l&apos;app, son portefeuille est rééquilibré automatiquement vers la répartition du nouveau profil.</p>
          </Section>

          <Section id="reglages" n={8} title="Réglages" href="/admin/reglages" intro="Les informations affichées sur le site public et dans l'app des clients. Chaque enregistrement est noté au Journal.">
            <Sub title="Société">
              <p>Raison sociale, forme juridique, capital, RCS et SIREN, TVA, directeur de la publication, siège, hébergeur, médiateur de la consommation, date de mise à jour. Ces champs alimentent les mentions légales, les conditions générales et la politique de confidentialité. Tant qu&apos;un champ est vide, le site affiche un repère entre crochets, par exemple [RAISON SOCIALE].</p>
            </Sub>
            <Sub title="Coordonnées bancaires">
              <ol>
                <li>Choisissez Compte USD ou Compte EUR.</li>
                <li>Renseignez bénéficiaire, IBAN ou numéro de compte, BIC / SWIFT, banque et adresse de la banque.</li>
                <li>Cliquez sur Enregistrer : un code est envoyé à votre e-mail.</li>
                <li>Saisissez le code et cliquez sur Confirmer la modification.</li>
              </ol>
              <Client>ces coordonnées s&apos;affichent dans l&apos;écran de dépôt. Une devise sans IBAN n&apos;est pas proposée au dépôt.</Client>
            </Sub>
            <Alert tone="down" title="Coordonnées bancaires : vérifiez deux fois">
              Une erreur d&apos;IBAN enverrait les virements des clients sur un mauvais compte. Le code par e-mail et le Journal protègent contre une modification non voulue, pas contre une faute de frappe.
            </Alert>
            <Sub title="Frais et délais">
              <ul>
                <li>Frais de gestion et frais de dépôt : textes affichés sur le site (ex. « 1,5 % par an », « Aucun »).</li>
                <li>Frais de retrait en dollars : prélevés sur le portefeuille en plus du montant retiré.</li>
                <li>Dépôt minimum et retrait minimum, en dollars.</li>
                <li>Taux EUR → USD par défaut : proposé lors du rapprochement, modifiable à chaque dépôt.</li>
                <li>Délais de réception d&apos;un dépôt, de retrait et de vérification d&apos;identité : affichés aux clients (écran de dépôt, de retrait, et attente de vérification).</li>
              </ul>
            </Sub>
            <Sub title="Contact">
              <p>E-mail, téléphone et adresse affichés sur le site. Les messages du formulaire de contact arrivent sur l&apos;e-mail indiqué ici, sauf si une adresse dédiée est configurée chez l&apos;hébergeur.</p>
            </Sub>
            <Sub title="Équipe">
              <p>La liste des administrateurs. Pour en ajouter un, saisissez l&apos;e-mail d&apos;un compte FlashInv existant (la personne doit d&apos;abord s&apos;inscrire). Retirer le repasse client. Fiche ouvre sa fiche.</p>
            </Sub>
          </Section>

          <Section id="journal" n={9} title="Journal" href="/admin/journal" intro="L'historique de toutes les actions sensibles, du plus récent au plus ancien, 50 par page.">
            <Sub title="Lire une ligne">
              <ul>
                <li><strong>Date</strong> et <strong>Par</strong> : quand et quel administrateur.</li>
                <li><strong>Action</strong> : par exemple Identité validée, Dépôt placé, Coordonnées bancaires modifiées, Compte banni.</li>
                <li><strong>Cible</strong> : le client concerné (lien vers sa fiche) ou le réglage modifié.</li>
                <li><strong>Détail</strong> : les valeurs enregistrées (montant, taux, motif, ancienne et nouvelle valeur). Survolez pour tout lire.</li>
              </ul>
            </Sub>
            <p className="m-0 text-sm text-ink-muted">Le Journal ne se modifie pas et ne se vide pas.</p>
          </Section>

          <Section id="parcours" n={10} title="Parcours complets" intro="Les enchaînements les plus fréquents, de bout en bout.">
            <Sub title="D'une inscription au premier placement">
              <ol>
                <li>Le client s&apos;inscrit, confirme son e-mail par code, envoie sa pièce d&apos;identité et son selfie, puis choisit son profil.</li>
                <li><strong>Vous</strong> : Vérifications, contrôles cochés, Valider l&apos;identité.</li>
                <li>Le client fait son virement avec sa référence et clique sur « J&apos;ai fait le virement ».</li>
                <li><strong>Vous</strong> : à réception sur le compte bancaire, Dépôts, ligne du client, montant reçu, Confirmer la réception.</li>
                <li>Le client voit ses cryptos dans son portefeuille.</li>
              </ol>
            </Sub>
            <Sub title="D'une demande de retrait au virement envoyé">
              <ol>
                <li>Le client ajoute son compte bancaire, demande un retrait et le confirme avec le code reçu par e-mail.</li>
                <li><strong>Vous</strong> : Retraits, retrait sélectionné, virement fait depuis la banque de FlashInv.</li>
                <li><strong>Vous</strong> : référence du virement saisie, Marquer comme envoyé.</li>
                <li>Le client reçoit la notification et l&apos;e-mail « Retrait envoyé ».</li>
              </ol>
            </Sub>
            <Sub title="Un client signale un problème de virement">
              <ol>
                <li>Recherchez-le dans Clients par nom, e-mail ou référence.</li>
                <li>Sur sa fiche, regardez les opérations en attente et l&apos;historique.</li>
                <li>Si le virement est arrivé sans être annoncé, enregistrez-le dans Dépôts avec « Virement sans annonce ».</li>
              </ol>
            </Sub>
          </Section>
        </div>
      </div>
    </>
  );
}
