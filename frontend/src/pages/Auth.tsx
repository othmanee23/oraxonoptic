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
import { apiFetch } from '@/lib/api';

const INVISIBLE_OR_SPACE_REGEX = /[\p{C}\s]/u;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[\p{L}][\p{L}\s-]*$/u;

const normalizeEmail = (value: string) => value.trim().toLowerCase();

const validateEmail = (value: string) => {
  if (!value.trim()) return 'L’email est obligatoire.';
  if (INVISIBLE_OR_SPACE_REGEX.test(value)) return 'L’email ne doit pas contenir d’espaces.';
  const normalized = normalizeEmail(value);
  if (!EMAIL_REGEX.test(normalized)) return 'Le format de l’email est invalide.';
  return null;
};

const validateName = (value: string, label: 'prénom' | 'nom') => {
  const trimmed = value.trim();
  if (!trimmed) return `Le ${label} est obligatoire.`;
  if (trimmed.length < 2) return `Le ${label} doit contenir au moins 2 caractères.`;
  if (trimmed.length > 50) return `Le ${label} ne doit pas dépasser 50 caractères.`;
  if (!NAME_REGEX.test(trimmed)) return `Le ${label} ne peut contenir que des lettres, espaces et tirets.`;
  return null;
};

const validatePhone = (value: string) => {
  if (!value.trim()) return null;
  if (!/^\d{10}$/.test(value.trim())) {
    return 'Le téléphone doit contenir exactement 10 chiffres (ex: 0612345678).';
  }
  return null;
};

const validatePassword = (value: string) => {
  if (!value) return 'Le mot de passe est obligatoire.';
  if (INVISIBLE_OR_SPACE_REGEX.test(value)) return 'Le mot de passe ne doit pas contenir d’espaces.';
  if (value.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères.';
  if (!/[A-Z]/.test(value)) return 'Ajoutez au moins une majuscule.';
  if (!/[0-9]/.test(value)) return 'Ajoutez au moins un chiffre.';
  if (!/[^A-Za-z0-9]/.test(value)) return 'Ajoutez au moins un symbole (ex: !@#$…).';
  return null;
};

const validateLoginPassword = (value: string) => {
  if (!value) return 'Le mot de passe est obligatoire.';
  return null;
};

const validatePasswordConfirmation = (password: string, confirmation: string) => {
  if (!confirmation) return 'Confirmez votre mot de passe.';
  if (password !== confirmation) return 'Les mots de passe ne correspondent pas.';
  return null;
};

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
      email: (formData.get('email') as string) || '',
      password: formData.get('password') as string,
    };

    const errors: Record<string, string> = {};
    const emailError = validateEmail(data.email);
    if (emailError) errors.email = emailError;
    const passwordError = validateLoginPassword(data.password || '');
    if (passwordError) errors.password = passwordError;
    if (Object.keys(errors).length) {
      setValidationErrors(errors);
      return;
    }

    setIsLoading(true);
    const response = await login(normalizeEmail(data.email), data.password);
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
      password: (formData.get('resetPassword') as string) || '',
      confirmPassword: (formData.get('resetConfirmPassword') as string) || '',
    };

    const errors: Record<string, string> = {};
    const passwordError = validatePassword(data.password);
    if (passwordError) errors.password = passwordError;
    const confirmError = validatePasswordConfirmation(data.password, data.confirmPassword);
    if (confirmError) errors.confirmPassword = confirmError;
    if (Object.keys(errors).length) {
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
      firstName: (formData.get('firstName') as string) || '',
      lastName: (formData.get('lastName') as string) || '',
      email: (formData.get('email') as string) || '',
      phone: (formData.get('phone') as string) || '',
      password: (formData.get('password') as string) || '',
      confirmPassword: (formData.get('confirmPassword') as string) || '',
    };

    const errors: Record<string, string> = {};
    const firstNameError = validateName(data.firstName, 'prénom');
    if (firstNameError) errors.firstName = firstNameError;
    const lastNameError = validateName(data.lastName, 'nom');
    if (lastNameError) errors.lastName = lastNameError;
    const emailError = validateEmail(data.email);
    if (emailError) errors.email = emailError;
    const phoneError = validatePhone(data.phone);
    if (phoneError) errors.phone = phoneError;
    const passwordError = validatePassword(data.password);
    if (passwordError) errors.password = passwordError;
    const confirmError = validatePasswordConfirmation(data.password, data.confirmPassword);
    if (confirmError) errors.confirmPassword = confirmError;
    if (Object.keys(errors).length) {
      setValidationErrors(errors);
      return;
    }

    setIsLoading(true);
    const response = await signup({
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: normalizeEmail(data.email),
      phone: data.phone.trim() || undefined,
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
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg">
            <img
              src="/logoo-02.jpg"
              alt="OrAxonOptic"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">OrAxonOptic</h1>
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
                    <div className="relative">
                      <Input
                        id="resetPassword"
                        name="resetPassword"
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
                    <Label htmlFor="resetConfirmPassword">Confirmer le mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="resetConfirmPassword"
                        name="resetConfirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        required
                        disabled={isLoading}
                        className={validationErrors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
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
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        required
                        disabled={isLoading}
                        className={validationErrors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
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
          © 2024 OrAxonOptic. Tous droits réservés.
        </p>
      </div>
    </div>
  );
}
