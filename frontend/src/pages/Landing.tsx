import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  Users, 
  ShoppingCart, 
  BarChart3, 
  Store, 
  Shield,
  Check,
  ArrowRight,
  Glasses,
  Clock,
  CreditCard,
  FileText,
  Settings,
  Zap,
  Globe,
  Sparkles,
  TrendingUp,
  HeadphonesIcon,
  Scan
} from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Gestion des Clients',
    description: 'Fichier client complet avec historique des prescriptions, achats et préférences.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: ShoppingCart,
    title: 'Point de Vente',
    description: 'Interface de vente fluide avec gestion du stock et facturation automatique.',
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: FileText,
    title: 'Prescriptions',
    description: 'Suivi des ordonnances et mesures optométriques avec historique complet.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: BarChart3,
    title: 'Rapports & Analytics',
    description: 'Tableaux de bord détaillés pour analyser et optimiser votre activité.',
    color: 'from-orange-500 to-amber-500',
  },
  {
    icon: Store,
    title: 'Multi-Magasins',
    description: 'Gérez tous vos points de vente depuis une interface centralisée.',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: Settings,
    title: 'Atelier Intégré',
    description: 'Suivi des commandes atelier, montages et réparations en temps réel.',
    color: 'from-indigo-500 to-blue-500',
  },
];

const benefits = [
  { icon: Zap, text: 'Démarrage en 5 minutes' },
  { icon: Globe, text: 'Accessible partout, 24h/24' },
  { icon: Shield, text: 'Données 100% sécurisées' },
  { icon: HeadphonesIcon, text: 'Support client réactif' },
  { icon: Sparkles, text: 'Mises à jour automatiques' },
  { icon: TrendingUp, text: 'Évolutif selon vos besoins' },
];

const stats = [
  { value: '5 min', label: 'Configuration', sublabel: 'pour démarrer' },
  { value: '100%', label: 'Cloud', sublabel: 'accessible partout' },
  { value: '24/7', label: 'Disponibilité', sublabel: 'sans interruption' },
  { value: '0 MAD', label: 'Essai gratuit', sublabel: 'sans engagement' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/landing" className="flex items-center gap-3">
              <img
                src="/logo-03.png"
                alt="OrAxonOptic"
                className="h-[120px] w-[120px] rounded-xl"
              />
            </Link>
            <div className="flex items-center gap-3">
              <Button asChild className="shadow-lg shadow-primary/25">
                <Link to="/auth">Connexion</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 text-primary border-primary/20 hover:from-primary/15 hover:to-accent/15 transition-all">
              <Sparkles className="h-3.5 w-3.5 mr-2" />
              La solution de gestion #1 pour les opticiens
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-foreground leading-[1.1] mb-6 tracking-tight">
              Gérez votre magasin
              <br />
              <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                en toute simplicité
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              OrAxonOptic centralise la gestion de vos clients, ventes, stocks et prescriptions 
              dans une application moderne et intuitive.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Button
                asChild
                size="lg"
                className="text-lg px-8 h-14 shadow-xl shadow-primary/30 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
              >
                <Link to="/auth?tab=signup">
                  <Glasses className="mr-2 h-5 w-5" />
                  Démarrer l'essai gratuit
                </Link>
              </Button>
              <a href="#demo">
                <Button size="lg" variant="outline" className="text-lg px-8 h-14 border-2">
                  <Eye className="mr-2 h-5 w-5" />
                  Découvrez OrAxonOptic
                </Button>
              </a>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-success" />
                14 jours d'essai gratuit
              </span>
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-success" />
                Aucune carte requise
              </span>
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-success" />
                Annulation à tout moment
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center p-6 rounded-2xl bg-gradient-to-br from-card to-muted/30 border border-border/50 shadow-sm"
              >
                <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-sm font-medium text-foreground mt-1">{stat.label}</p>
                <p className="text-xs text-muted-foreground">{stat.sublabel}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section id="demo" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <Badge variant="outline" className="mb-4">Découvrez OrAxonOptic</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 tracking-tight">
              Voyez OrAxonOptic en action
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Découvrez comment OrAxonOptic peut transformer la gestion de votre magasin d'optique
            </p>
          </div>
          
          <div className="relative aspect-[9/16] max-w-sm sm:max-w-md mx-auto rounded-2xl overflow-hidden shadow-2xl border border-border/50 bg-muted">
            <video
              className="absolute inset-0 h-full w-full object-cover"
              src="/reeloptic.mp4"
              title="Presentation OrAxonOptic"
              controls
              playsInline
              preload="metadata"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-muted/30 to-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Fonctionnalités</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Une suite complète d'outils conçus pour les opticiens modernes
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group bg-card/50 backdrop-blur-sm hover:bg-card hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 border-border/50 hover:border-primary/30 overflow-hidden"
              >
                <CardContent className="p-6 relative">
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity`} />
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} mb-4 shadow-lg`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge variant="outline" className="mb-4">Pourquoi OrAxonOptic ?</Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 tracking-tight">
                Conçu pour les opticiens,
                <br />
                <span className="text-primary">par des experts</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                OrAxonOptic répond à tous vos besoins quotidiens avec une interface intuitive 
                et des fonctionnalités pensées pour optimiser votre productivité.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <benefit.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-medium text-foreground">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-3xl" />
              <div className="relative bg-gradient-to-br from-card to-muted/50 rounded-3xl p-8 border border-border shadow-2xl">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-6 bg-background/80 rounded-2xl border border-border/50">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 mx-auto mb-3 shadow-lg">
                      <Clock className="h-7 w-7 text-primary-foreground" />
                    </div>
                    <p className="text-3xl font-bold text-foreground">5 min</p>
                    <p className="text-sm text-muted-foreground">Configuration</p>
                  </div>
                  <div className="text-center p-6 bg-background/80 rounded-2xl border border-border/50">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 mx-auto mb-3 shadow-lg">
                      <Shield className="h-7 w-7 text-white" />
                    </div>
                    <p className="text-3xl font-bold text-foreground">100%</p>
                    <p className="text-sm text-muted-foreground">Sécurisé</p>
                  </div>
                  <div className="text-center p-6 bg-background/80 rounded-2xl border border-border/50">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 mx-auto mb-3 shadow-lg">
                      <Store className="h-7 w-7 text-white" />
                    </div>
                    <p className="text-3xl font-bold text-foreground">∞</p>
                    <p className="text-sm text-muted-foreground">Multi-magasins</p>
                  </div>
                  <div className="text-center p-6 bg-background/80 rounded-2xl border border-border/50">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 mx-auto mb-3 shadow-lg">
                      <Globe className="h-7 w-7 text-white" />
                    </div>
                    <p className="text-3xl font-bold text-foreground">24/7</p>
                    <p className="text-sm text-muted-foreground">Disponible</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-primary/80 p-12 lg:p-16 shadow-2xl">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-accent/20 rounded-full blur-3xl" />
            
            <div className="relative text-center">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6 tracking-tight">
                Prêt à transformer votre activité ?
              </h2>
              <p className="text-lg text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
                Rejoignez des centaines d'opticiens qui ont déjà optimisé leur gestion avec OrAxonOptic. 
                Commencez votre essai gratuit dès aujourd'hui.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/auth?tab=signup">
                  <Button size="lg" variant="secondary" className="text-lg px-8 h-14 shadow-xl">
                    Créer mon compte gratuit
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button size="lg" variant="outline" className="text-lg px-8 h-14 bg-transparent border-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                    Contacter l'équipe
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg">
                <img
                  src="/logoo-01.jpg"
                  alt="OrAxonOptic"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">OrAxonOptic</h1>
                <p className="text-xs text-muted-foreground">Solution de gestion pour opticiens</p>
              </div>
            </div>
            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <Link to="/conditions" className="hover:text-foreground transition-colors">Conditions</Link>
              <Link to="/confidentialite" className="hover:text-foreground transition-colors">Confidentialité</Link>
              <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} OrAxonOptic. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
