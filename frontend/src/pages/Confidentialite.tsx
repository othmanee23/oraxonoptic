import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function Confidentialite() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/landing" className="flex items-center gap-3">
              <img
                src="/logo-03.png"
                alt="OrAxonOptic"
                className="h-[104px] w-[104px] rounded-xl"
              />
            </Link>
            <Link to="/landing">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-8">Politique de Confidentialité</h1>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">1. Collecte des données</h2>
            <p className="text-muted-foreground leading-relaxed">
              Dans le cadre de l'utilisation du service OrAxonOptic, nous collectons les données suivantes :
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Informations d'identification (nom, prénom, email)</li>
              <li>Données professionnelles (nom du magasin, adresse)</li>
              <li>Données clients gérées via l'application</li>
              <li>Données de connexion et d'utilisation</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">2. Utilisation des données</h2>
            <p className="text-muted-foreground leading-relaxed">
              Vos données sont utilisées pour :
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Fournir et améliorer nos services</li>
              <li>Gérer votre compte et votre abonnement</li>
              <li>Vous contacter concernant votre utilisation du service</li>
              <li>Assurer la sécurité et prévenir la fraude</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">3. Protection des données</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger 
              vos données contre tout accès non autorisé, modification, divulgation ou destruction. Toutes 
              les données sont chiffrées en transit et au repos.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">4. Conservation des données</h2>
            <p className="text-muted-foreground leading-relaxed">
              Vos données sont conservées pendant toute la durée de votre abonnement et jusqu'à 12 mois 
              après la résiliation, sauf obligation légale de conservation plus longue.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">5. Vos droits</h2>
            <p className="text-muted-foreground leading-relaxed">
              Conformément au RGPD, vous disposez des droits suivants :
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Droit d'accès à vos données personnelles</li>
              <li>Droit de rectification des données inexactes</li>
              <li>Droit à l'effacement de vos données</li>
              <li>Droit à la portabilité de vos données</li>
              <li>Droit d'opposition au traitement</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">6. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              Notre application utilise des cookies essentiels au fonctionnement du service. Ces cookies 
              permettent de maintenir votre session et vos préférences. Aucun cookie publicitaire n'est utilisé.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">7. Sous-traitants</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nous pouvons faire appel à des sous-traitants pour l'hébergement et le traitement des données. 
              Ces sous-traitants sont soumis aux mêmes obligations de confidentialité et de sécurité.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">8. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              Pour exercer vos droits ou pour toute question relative à cette politique, contactez-nous via 
              notre <Link to="/contact" className="text-primary hover:underline">page de contact</Link>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
