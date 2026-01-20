import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { StoreProvider } from "@/contexts/StoreContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Landing from "./pages/Landing";
import Utilisateurs from "./pages/Utilisateurs";
import Clients from "./pages/Clients";
import Magasins from "./pages/Magasins";
import Prescriptions from "./pages/Prescriptions";
import Stock from "./pages/Stock";
import Ventes from "./pages/Ventes";
import Factures from "./pages/Factures";
import Atelier from "./pages/Atelier";
import Parametres from "./pages/Parametres";
import Fournisseurs from "./pages/Fournisseurs";
import Rapports from "./pages/Rapports";
import Abonnement from "./pages/Abonnement";
import AdminSaas from "./pages/AdminSaas";
import Profil from "./pages/Profil";
import Conditions from "./pages/Conditions";
import Confidentialite from "./pages/Confidentialite";
import Contact from "./pages/Contact";
import MessagesContact from "./pages/MessagesContact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <StoreProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/conditions" element={<Conditions />} />
            <Route path="/confidentialite" element={<Confidentialite />} />
            <Route path="/contact" element={<Contact />} />
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route path="/utilisateurs" element={<ProtectedRoute><Utilisateurs /></ProtectedRoute>} />
            <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
            <Route path="/magasins" element={<ProtectedRoute><Magasins /></ProtectedRoute>} />
            <Route path="/prescriptions" element={<ProtectedRoute><Prescriptions /></ProtectedRoute>} />
            <Route path="/stock" element={<ProtectedRoute><Stock /></ProtectedRoute>} />
            <Route path="/fournisseurs" element={<ProtectedRoute><Fournisseurs /></ProtectedRoute>} />
            <Route path="/ventes" element={<ProtectedRoute><Ventes /></ProtectedRoute>} />
            <Route path="/factures" element={<ProtectedRoute><Factures /></ProtectedRoute>} />
            <Route path="/atelier" element={<ProtectedRoute><Atelier /></ProtectedRoute>} />
            <Route path="/rapports" element={<ProtectedRoute><Rapports /></ProtectedRoute>} />
            <Route path="/abonnement" element={<ProtectedRoute><Abonnement /></ProtectedRoute>} />
            <Route path="/admin-saas" element={<ProtectedRoute><AdminSaas /></ProtectedRoute>} />
            <Route path="/profil" element={<ProtectedRoute><Profil /></ProtectedRoute>} />
            <Route path="/messages-contact" element={<ProtectedRoute><MessagesContact /></ProtectedRoute>} />
            <Route path="/parametres" element={<ProtectedRoute><Parametres /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </StoreProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
