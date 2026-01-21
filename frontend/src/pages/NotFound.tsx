import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Home, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 right-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        </div>
        <div className="relative mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6 py-16">
          <Card className="w-full border-border/50 bg-background/80 shadow-xl backdrop-blur">
            <CardContent className="py-12">
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg">
                  <img src="/favicon.ico" alt="OpticAxon" className="h-7 w-7 rounded-sm" />
                </div>
                <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">OpticAxon</p>
                <h1 className="mt-2 text-4xl font-bold text-foreground sm:text-5xl">Page introuvable</h1>
                <p className="mt-3 max-w-xl text-base text-muted-foreground sm:text-lg">
                  Cette page n'existe pas ou a ete deplacee. Revenez a l'accueil ou connectez-vous pour continuer.
                </p>
                <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
                  <Button asChild size="lg" className="shadow-lg shadow-primary/20">
                    <Link to="/landing">
                      <Home className="mr-2 h-5 w-5" />
                      Retour a l'accueil
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-2">
                    <Link to="/auth">
                      <ArrowRight className="mr-2 h-5 w-5" />
                      Connexion
                    </Link>
                  </Button>
                </div>
                <div className="mt-10 flex items-center gap-2 text-sm text-muted-foreground">
                  <Search className="h-4 w-4" />
                  <span>URL demandee: {location.pathname}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
