import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function Conditions() {
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
        <h1 className="text-3xl font-bold text-foreground mb-8">Conditions Générales d'Utilisation</h1>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">1. Objet</h2>
            <p className="text-muted-foreground leading-relaxed">
              Les présentes conditions générales d'utilisation (CGU) ont pour objet de définir les modalités et conditions 
              d'utilisation du service OrAxonOptic, une solution de gestion destinée aux opticiens et professionnels de l'optique.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">2. Accès au service</h2>
            <p className="text-muted-foreground leading-relaxed">
              L'accès au service OrAxonOptic nécessite la création d'un compte utilisateur. L'utilisateur s'engage à fournir 
              des informations exactes et à maintenir la confidentialité de ses identifiants de connexion.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">3. Utilisation du service</h2>
            <p className="text-muted-foreground leading-relaxed">
              L'utilisateur s'engage à utiliser le service conformément à sa destination et aux lois en vigueur. 
              Toute utilisation frauduleuse ou abusive est strictement interdite et peut entraîner la suspension 
              ou la résiliation du compte.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">4. Abonnement et tarification</h2>
            <p className="text-muted-foreground leading-relaxed">
              L'utilisation complète du service est soumise à un abonnement payant. Les tarifs sont indiqués sur 
              notre site et peuvent être modifiés avec un préavis de 30 jours. Une période d'essai gratuite peut 
              être proposée aux nouveaux utilisateurs.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">5. Propriété intellectuelle</h2>
            <p className="text-muted-foreground leading-relaxed">
              L'ensemble des éléments constituant le service OrAxonOptic (logiciel, design, textes, images) sont 
              protégés par les droits de propriété intellectuelle. Toute reproduction ou utilisation non autorisée 
              est interdite.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">6. Responsabilité</h2>
            <p className="text-muted-foreground leading-relaxed">
              OrAxonOptic s'efforce d'assurer la disponibilité et la fiabilité du service. Cependant, nous ne pouvons 
              garantir un fonctionnement sans interruption. L'utilisateur reste responsable de la sauvegarde de ses données.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">7. Modification des CGU</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nous nous réservons le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront 
              informés des modifications par email ou notification dans l'application.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">8. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              Pour toute question concernant ces conditions, veuillez nous contacter via notre{' '}
              <Link to="/contact" className="text-primary hover:underline">page de contact</Link>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
