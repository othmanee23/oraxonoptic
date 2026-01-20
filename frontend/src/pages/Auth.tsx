import { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, Loader2, AlertCircle, Check } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { z } from 'zod';
import { apiFetch } from '@/lib/api';

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Email invalide').max(255),
  password: z.string().min(8, 'Mot de passe trop court (min. 8 caractères)'),
});

const signupSchema = z.object({
  firstName: z.string().min(2, 'Prénom trop court').max(50),
  lastName: z.string().min(2, 'Nom trop court').max(50),
  email: z.string().email('Email invalide').max(255),
  phone: z.string().optional(),
  password: z.string().min(8, 'Mot de passe trop court (min. 8 caractères)'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

const resetSchema = z.object({
  password: z.string().min(8, 'Mot de passe trop court (min. 8 caractères)'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup, isAuthenticated, user } = useAuth();
  
  const initialTab = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('tab') === 'signup' ? 'signup' : 'login';
  }, [location.search]);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [signupComplete, setSignupComplete] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmailSent, setForgotEmailSent] = useState(false);

  const verificationStatus = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('verified');
  }, [location.search]);

  const isVerified = verificationStatus === '1';
  const verificationFailed = verificationStatus === '0';
  const resetToken = useMemo(() => new URLSearchParams(location.search).get('token'), [location.search]);
  const resetEmail = useMemo(() => new URLSearchParams(location.search).get('email'), [location.search]);

  // Keep the login form visible even if a session exists.

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    // Validate
    const result = loginSchema.safeParse(data);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setValidationErrors(errors);
      return;
    }

    setIsLoading(true);
    const response = await login(data.email, data.password);
    setIsLoading(false);

    if (!response.success) {
      if (response.fieldErrors) {
        setValidationErrors(response.fieldErrors);
      }
      setError(response.error || 'Erreur de connexion');
    } else {
      const from = response.user?.role === 'super_admin'
        ? '/admin-saas'
        : (location.state as { from?: { pathname: string } })?.from?.pathname || '/app';
      navigate(from, { replace: true });
    }
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setForgotEmailSent(false);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('forgotEmail') as string;

    if (!email) {
      setError('Veuillez saisir votre email.');
      return;
    }

    setIsLoading(true);
    try {
      await apiFetch('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setForgotEmailSent(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Impossible d'envoyer le lien.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});

    const formData = new FormData(e.currentTarget);
    const data = {
      password: formData.get('resetPassword') as string,
      confirmPassword: formData.get('resetConfirmPassword') as string,
    };

    const result = resetSchema.safeParse(data);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setValidationErrors(errors);
      return;
    }

    if (!resetToken || !resetEmail) {
      setError('Lien de réinitialisation invalide.');
      return;
    }

    setIsLoading(true);
    try {
      await apiFetch('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          token: resetToken,
          email: resetEmail,
          password: data.password,
          password_confirmation: data.confirmPassword,
        }),
      });
      setError(null);
      setActiveTab('login');
      navigate('/auth?verified=1', { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Impossible de réinitialiser le mot de passe.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});

    const formData = new FormData(e.currentTarget);
    const data = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    };

    // Validate
    const result = signupSchema.safeParse(data);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setValidationErrors(errors);
      return;
    }

    setIsLoading(true);
    const response = await signup({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone || undefined,
      password: data.password,
    });
    setIsLoading(false);

    if (!response.success) {
      if (response.fieldErrors) {
        setValidationErrors(response.fieldErrors);
      }
      setError(response.error || 'Erreur lors de l\'inscription');
    } else {
      setError(null);
      setActiveTab('login');
      setSignupComplete(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg">
            <Eye className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">OpticAxon</h1>
            <p className="text-sm text-muted-foreground">optic</p>
          </div>
        </div>

        <Card className="shadow-xl border-border/50">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">Bienvenue</CardTitle>
            <CardDescription>
              Connectez-vous pour accéder à votre espace de gestion
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(isVerified || verificationFailed || signupComplete) ? (
              <div className="space-y-4 text-center">
                <div className="flex items-center justify-center">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-full ${isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {isVerified ? <Check className="h-7 w-7" /> : <AlertCircle className="h-7 w-7" />}
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-foreground">
                    {isVerified ? 'Compte verifie' : 'Veuillez verifier votre adresse email'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {isVerified
                      ? 'Votre compte est maintenant actif. Vous pouvez vous connecter.'
                      : verificationFailed
                        ? 'Le lien de verification est invalide ou a expire. Veuillez demander un nouveau lien.'
                        : 'Un lien de verification vous a ete envoye par email. Cliquez dessus pour activer votre compte.'}
                  </p>
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    setSignupComplete(false);
                    setError(null);
                    setValidationErrors({});
                    navigate('/auth', { replace: true });
                  }}
                >
                  Aller a la connexion
                </Button>
              </div>
            ) : resetToken && resetEmail ? (
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-semibold text-foreground">Réinitialiser le mot de passe</h2>
                  <p className="text-sm text-muted-foreground">
                    Choisissez un nouveau mot de passe pour votre compte.
                  </p>
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={resetEmail} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="resetPassword">Nouveau mot de passe</Label>
                    <Input
                      id="resetPassword"
                      name="resetPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      required
                      disabled={isLoading}
                      className={validationErrors.password ? 'border-destructive' : ''}
                    />
                    {validationErrors.password && (
                      <p className="text-sm text-destructive">{validationErrors.password}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="resetConfirmPassword">Confirmer le mot de passe</Label>
                    <Input
                      id="resetConfirmPassword"
                      name="resetConfirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      required
                      disabled={isLoading}
                      className={validationErrors.confirmPassword ? 'border-destructive' : ''}
                    />
                    {validationErrors.confirmPassword && (
                      <p className="text-sm text-destructive">{validationErrors.confirmPassword}</p>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Réinitialisation...' : 'Mettre à jour'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => navigate('/auth', { replace: true })}
                  >
                    Retour
                  </Button>
                </form>
              </div>
            ) : forgotOpen ? (
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-semibold text-foreground">Mot de passe oublié</h2>
                  <p className="text-sm text-muted-foreground">
                    Entrez votre email pour recevoir un lien de réinitialisation.
                  </p>
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {forgotEmailSent ? (
                  <Alert>
                    <AlertDescription>Un lien de réinitialisation a été envoyé.</AlertDescription>
                  </Alert>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="forgotEmail">Email</Label>
                      <Input
                        id="forgotEmail"
                        name="forgotEmail"
                        type="email"
                        placeholder="votre@email.com"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Envoi...' : 'Envoyer le lien'}
                    </Button>
                  </form>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setForgotOpen(false);
                    setError(null);
                  }}
                >
                  Retour à la connexion
                </Button>
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={(v) => {
                setActiveTab(v as 'login' | 'signup');
                setError(null);
                setValidationErrors({});
              }}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Connexion</TabsTrigger>
                <TabsTrigger value="signup">Inscription</TabsTrigger>
              </TabsList>

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      name="email"
                      type="email"
                      placeholder="votre@email.com"
                      required
                      disabled={isLoading}
                      className={validationErrors.email ? 'border-destructive' : ''}
                    />
                    {validationErrors.email && (
                      <p className="text-sm text-destructive">{validationErrors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        required
                        disabled={isLoading}
                        className={validationErrors.password ? 'border-destructive pr-10' : 'pr-10'}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    {validationErrors.password && (
                      <p className="text-sm text-destructive">{validationErrors.password}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connexion...
                      </>
                    ) : (
                      'Se connecter'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setForgotOpen(true);
                      setError(null);
                    }}
                  >
                    Mot de passe oublié ?
                  </Button>
                </form>

              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        placeholder="Mohamed"
                        required
                        disabled={isLoading}
                        className={validationErrors.firstName ? 'border-destructive' : ''}
                      />
                      {validationErrors.firstName && (
                        <p className="text-sm text-destructive">{validationErrors.firstName}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        placeholder="Alami"
                        required
                        disabled={isLoading}
                        className={validationErrors.lastName ? 'border-destructive' : ''}
                      />
                      {validationErrors.lastName && (
                        <p className="text-sm text-destructive">{validationErrors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="votre@email.com"
                      required
                      disabled={isLoading}
                      className={validationErrors.email ? 'border-destructive' : ''}
                    />
                    {validationErrors.email && (
                      <p className="text-sm text-destructive">{validationErrors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone (optionnel)</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+212 6 00 00 00 00"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        required
                        disabled={isLoading}
                        className={validationErrors.password ? 'border-destructive pr-10' : 'pr-10'}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    {validationErrors.password && (
                      <p className="text-sm text-destructive">{validationErrors.password}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      required
                      disabled={isLoading}
                      className={validationErrors.confirmPassword ? 'border-destructive' : ''}
                    />
                    {validationErrors.confirmPassword && (
                      <p className="text-sm text-destructive">{validationErrors.confirmPassword}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Inscription...
                      </>
                    ) : (
                      'Créer un compte'
                    )}
                  </Button>
                </form>
              </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          © 2024 OpticAxon. Tous droits réservés.
        </p>
      </div>
    </div>
  );
}
