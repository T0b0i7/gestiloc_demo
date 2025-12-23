import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { authService } from '@/services/api';

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

const registerSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide").toLowerCase(),
  phone: z.string().min(1, "Le téléphone est requis"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "Vous devez accepter les conditions d'utilisation",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

type ApiErr = {
  response?: { status?: number; data?: { message?: string; errors?: Record<string, string[]> } };
  request?: unknown;
  message?: string;
};

function normalizeBackendMessage(err: ApiErr, fallback: string) {
  // On logge les détails techniques mais on renvoie un message propre au user.
  const status = err.response?.status;

  // Erreurs réseau / serveur HS
  if (err.request && !err.response) {
    return "Le serveur ne répond pas. Vérifiez votre connexion internet puis réessayez.";
  }

  // Codes utiles
  if (status === 401) return "Email ou mot de passe incorrect.";
  if (status === 403) return "Accès refusé. Vérifiez vos droits ou contactez le support.";
  if (status === 422) return "Certains champs sont invalides. Vérifiez le formulaire.";
  if (status && status >= 500) return "Problème serveur. Réessayez dans quelques instants.";

  // Message backend parfois utile mais pas toujours “user-friendly”
  const backendMsg = err.response?.data?.message?.trim();
  if (backendMsg) {
    // Petit filtre : on évite d'afficher des messages techniques.
    const looksTechnical =
      backendMsg.toLowerCase().includes('sql') ||
      backendMsg.toLowerCase().includes('exception') ||
      backendMsg.toLowerCase().includes('stack') ||
      backendMsg.toLowerCase().includes('undefined') ||
      backendMsg.toLowerCase().includes('trace');

    if (!looksTechnical) return backendMsg;
  }

  return fallback;
}

function applyBackendFieldErrors<T extends Record<string, any>>(
  err: ApiErr,
  setError: (name: any, error: any) => void,
  map: Record<string, keyof T>
) {
  const errors = err.response?.data?.errors;
  if (!errors) return false;

  let applied = false;

  Object.entries(errors).forEach(([backendKey, messages]) => {
    const formKey = map[backendKey];
    if (!formKey) return;

    const msg = Array.isArray(messages) ? messages[0] : "Champ invalide";
    setError(formKey as any, { type: 'server', message: msg });
    applied = true;
  });

  return applied;
}

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(location.pathname === '/login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    shouldFocusError: true,
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    shouldFocusError: true,
    defaultValues: { acceptTerms: false },
  });

  // maps backend -> form fields (si Laravel renvoie first_name, etc.)
  const registerFieldMap = useMemo(
    () => ({
      first_name: 'firstName',
      last_name: 'lastName',
      email: 'email',
      phone: 'phone',
      password: 'password',
      password_confirmation: 'confirmPassword',
      accept_terms: 'acceptTerms',
    }) as Record<string, keyof RegisterFormData>,
    []
  );

  const loginFieldMap = useMemo(
    () => ({
      email: 'email',
      password: 'password',
    }) as Record<string, keyof LoginFormData>,
    []
  );

  // Petite aide UX : quand on bascule login/register on reset les messages
  useEffect(() => {
    setError('');
    loginForm.clearErrors();
    registerForm.clearErrors();
  }, [isLogin]); // eslint-disable-line react-hooks/exhaustive-deps

  const notifyClientValidation = (formErrors: Record<string, any>) => {
    const first = Object.values(formErrors)?.[0];
    const msg = first?.message || "Vérifiez les champs du formulaire.";
    toast.error(msg);
  };

  const handleLogin = async (data: LoginFormData) => {
    setError('');

    try {
      setIsLoading(true);

      const response = await authService.login(data.email, data.password);

      if (response && response.data && response.data.user) {
        const { user } = response.data;

        toast.success('Connexion réussie !');

        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(user));

        const roles = user.roles || [];

        let redirectPath = '/';
        let userRole = '';

        if (roles.includes('admin')) {
          redirectPath = '/admin';
          userRole = 'admin';
        } else if (roles.includes('landlord') || roles.includes('proprietaire')) {
          redirectPath = '/proprietaire';
          userRole = 'proprietaire';
        } else if (roles.includes('tenant') || roles.includes('locataire')) {
          redirectPath = '/locataire';
          userRole = 'locataire';
        }

        const updatedUser = { ...user, role: userRole };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        navigate(redirectPath, { replace: true });
      } else {
        throw new Error('Réponse du serveur invalide');
      }
    } catch (e: unknown) {
      const err = e as ApiErr;

      // Log technique pour toi
      console.error('Erreur de connexion :', err);

      // Appliquer erreurs de champs si 422
      const applied = applyBackendFieldErrors<LoginFormData>(err, loginForm.setError, loginFieldMap);

      const msg = normalizeBackendMessage(err, "Email ou mot de passe incorrect.");
      setError(msg);

      // Notifs : si erreurs champs, on affiche un toast clair, sinon message général
      if (applied) {
        toast.error("Vérifiez vos informations de connexion.");
      } else {
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);

      const userData = {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email.toLowerCase(),
        phone: data.phone,
        password: data.password,
        password_confirmation: data.confirmPassword,
        role: 'proprietaire',
        accept_terms: data.acceptTerms
      };

      const response = await authService.register(userData);

      if (response?.status === 'success' || response?.data?.token) {
        toast.success("Compte créé avec succès ! Vous allez être redirigé vers la page de connexion.");

        setTimeout(() => {
          setIsLogin(true);
          registerForm.reset();
        }, 1500);
      } else {
        throw new Error(response?.message || "Erreur lors de l'inscription");
      }
    } catch (e: unknown) {
      const err = e as ApiErr;

      // Log technique pour toi
      console.error("Erreur lors de l'inscription :", err);

      // Appliquer erreurs champ par champ si Laravel renvoie errors{}
      const applied = applyBackendFieldErrors<RegisterFormData>(err, registerForm.setError, registerFieldMap);

      // Message user-friendly
      const msg = normalizeBackendMessage(err, "Une erreur est survenue lors de la création du compte.");

      // Notifs : si erreurs champs -> toast générique; sinon -> msg
      if (applied) {
        toast.error("Certains champs sont invalides. Vérifiez le formulaire.");
      } else {
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white">
      <div className="w-full max-w-md">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">GestiLoc</h1>
          </div>

          <motion.div
            className="flex rounded-lg bg-slate-100 p-1 mb-8"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                isLogin ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Connexion
            </motion.button>
            <motion.button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                !isLogin ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Inscription
            </motion.button>
          </motion.div>

          <div className="relative min-h-[700px]">
            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="absolute top-0 left-0 w-full"
                >
                  <motion.div
                    className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <motion.h2
                      className="text-2xl font-bold text-slate-800 mb-6"
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                    >
                      Connexion à votre compte
                    </motion.h2>

                    <AnimatePresence>
                      {error && (
                        <motion.div
                          className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3"
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          transition={{ duration: 0.3 }}
                        >
                          <AlertCircle size={20} className="text-red-600" />
                          <p className="text-sm text-red-600">{error}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <form
                      onSubmit={loginForm.handleSubmit(handleLogin, (errs) => notifyClientValidation(errs))}
                      className="space-y-6"
                    >
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                      >
                        <Label htmlFor="login-email" className="text-slate-700 font-medium">
                          Adresse email
                        </Label>
                        <div className="relative mt-2">
                          <Mail size={18} className="absolute left-3 top-3.5 text-slate-400" />
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="votre@email.fr"
                            {...loginForm.register("email")}
                            className="pl-10 h-12 border-slate-300 focus:border-primary focus:ring-primary/20"
                          />
                        </div>
                        {loginForm.formState.errors.email && (
                          <p className="text-sm text-red-600 mt-1">
                            {loginForm.formState.errors.email.message}
                          </p>
                        )}
                      </motion.div>

                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.4 }}
                      >
                        <Label htmlFor="login-password" className="text-slate-700 font-medium">
                          Mot de passe
                        </Label>
                        <div className="relative mt-2">
                          <Lock size={18} className="absolute left-3 top-3.5 text-slate-400" />
                          <Input
                            id="login-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            {...loginForm.register("password")}
                            className="pl-10 pr-10 h-12 border-slate-300 focus:border-primary focus:ring-primary/20"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        {loginForm.formState.errors.password && (
                          <p className="text-sm text-red-600 mt-1">
                            {loginForm.formState.errors.password.message}
                          </p>
                        )}
                      </motion.div>

                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.5 }}
                      >
                        <Button
                          type="submit"
                          className="w-full h-12 text-lg font-medium relative overflow-hidden"
                          disabled={isLoading}
                        >
                          <motion.div
                            className="flex items-center justify-center gap-2"
                            animate={isLoading ? { scale: [1, 1.05, 1] } : {}}
                            transition={{ duration: 1.5, repeat: isLoading ? Infinity : 0 }}
                          >
                            {isLoading && (
                              <motion.div
                                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              />
                            )}
                            {isLoading ? 'Connexion en cours...' : 'Se connecter'}
                          </motion.div>
                        </Button>
                      </motion.div>
                    </form>

                    <motion.div
                      className="mt-6 text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.6 }}
                    >
                      <a href="/forgot-password" className="text-primary hover:underline text-sm">
                        Mot de passe oublié ?
                      </a>
                    </motion.div>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="absolute top-0 left-0 w-full"
                >
                  <motion.div
                    className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <motion.h2
                      className="text-2xl font-bold text-slate-800 mb-2"
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                    >
                      Créer un compte propriétaire
                    </motion.h2>
                    <motion.h2
                      className="p-leading mb-8"
                      style={{ color: 'black' }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                    >
                      Compte gratuit, sans carte bancaire. Vous pourrez ajouter vos locataires ensuite.
                    </motion.h2>

                    <form
                      onSubmit={registerForm.handleSubmit(handleRegister, (errs) => notifyClientValidation(errs))}
                    >
                      <ScrollArea className="h-[350px] pr-4">
                        <motion.div
                          className="space-y-6 pb-6"
                          initial="hidden"
                          animate="visible"
                          variants={{
                            hidden: { opacity: 0 },
                            visible: {
                              opacity: 1,
                              transition: { staggerChildren: 0.1, delayChildren: 0.4 },
                            },
                          }}
                        >
                          <motion.div
                            className="grid grid-cols-2 gap-4"
                            variants={{
                              hidden: { y: 20, opacity: 0 },
                              visible: { y: 0, opacity: 1 },
                            }}
                          >
                            <div className="space-y-2">
                              <Label htmlFor="firstName" className="text-slate-700 font-medium">
                                Prénom *
                              </Label>
                              <Input
                                id="firstName"
                                placeholder="Jean"
                                {...registerForm.register("firstName")}
                                className="h-12 border-slate-300 focus:border-primary focus:ring-primary/20"
                              />
                              {registerForm.formState.errors.firstName && (
                                <p className="text-sm text-red-600">
                                  {registerForm.formState.errors.firstName.message}
                                </p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="lastName" className="text-slate-700 font-medium">
                                Nom *
                              </Label>
                              <Input
                                id="lastName"
                                placeholder="Dupont"
                                {...registerForm.register("lastName")}
                                className="h-12 border-slate-300 focus:border-primary focus:ring-primary/20"
                              />
                              {registerForm.formState.errors.lastName && (
                                <p className="text-sm text-red-600">
                                  {registerForm.formState.errors.lastName.message}
                                </p>
                              )}
                            </div>
                          </motion.div>

                          <motion.div
                            className="space-y-2"
                            variants={{
                              hidden: { x: -20, opacity: 0 },
                              visible: { x: 0, opacity: 1 },
                            }}
                          >
                            <Label htmlFor="register-email" className="text-slate-700 font-medium">
                              Adresse email *
                            </Label>
                            <Input
                              id="register-email"
                              type="email"
                              placeholder="nom@exemple.fr"
                              {...registerForm.register("email")}
                              className="h-12 border-slate-300 focus:border-primary focus:ring-primary/20"
                            />
                            {registerForm.formState.errors.email && (
                              <p className="text-sm text-red-600">
                                {registerForm.formState.errors.email.message}
                              </p>
                            )}
                          </motion.div>

                          <motion.div
                            className="space-y-2"
                            variants={{
                              hidden: { x: -20, opacity: 0 },
                              visible: { x: 0, opacity: 1 },
                            }}
                          >
                            <Label htmlFor="phone" className="text-slate-700 font-medium">
                              Téléphone *
                            </Label>
                            <Input
                              id="phone"
                              type="tel"
                              placeholder="06 12 34 56 78"
                              {...registerForm.register("phone")}
                              className="h-12 border-slate-300 focus:border-primary focus:ring-primary/20"
                            />
                            {registerForm.formState.errors.phone && (
                              <p className="text-sm text-red-600">
                                {registerForm.formState.errors.phone.message}
                              </p>
                            )}
                          </motion.div>

                          <motion.div
                            className="space-y-2"
                            variants={{
                              hidden: { x: -20, opacity: 0 },
                              visible: { x: 0, opacity: 1 },
                            }}
                          >
                            <Label htmlFor="register-password" className="text-slate-700 font-medium">
                              Mot de passe *
                            </Label>
                            <Input
                              id="register-password"
                              type="password"
                              placeholder="Minimum 8 caractères"
                              {...registerForm.register("password")}
                              className="h-12 border-slate-300 focus:border-primary focus:ring-primary/20"
                            />
                            {registerForm.formState.errors.password && (
                              <p className="text-sm text-red-600">
                                {registerForm.formState.errors.password.message}
                              </p>
                            )}
                          </motion.div>

                          <motion.div
                            className="space-y-2"
                            variants={{
                              hidden: { x: -20, opacity: 0 },
                              visible: { x: 0, opacity: 1 },
                            }}
                          >
                            <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">
                              Confirmer le mot de passe *
                            </Label>
                            <Input
                              id="confirmPassword"
                              type="password"
                              placeholder="Répétez votre mot de passe"
                              {...registerForm.register("confirmPassword")}
                              className="h-12 border-slate-300 focus:border-primary focus:ring-primary/20"
                            />
                            {registerForm.formState.errors.confirmPassword && (
                              <p className="text-sm text-red-600">
                                {registerForm.formState.errors.confirmPassword.message}
                              </p>
                            )}
                          </motion.div>

                          <motion.div
                            className="flex items-start space-x-3"
                            variants={{
                              hidden: { y: 20, opacity: 0 },
                              visible: { y: 0, opacity: 1 },
                            }}
                          >
                            <Controller
                              name="acceptTerms"
                              control={registerForm.control}
                              render={({ field }) => (
                                <Checkbox
                                  id="terms"
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="mt-1"
                                />
                              )}
                            />
                            <Label
                              htmlFor="terms"
                              className="text-sm font-normal leading-relaxed cursor-pointer text-slate-600"
                            >
                              J'accepte les{" "}
                              <a href="/terms" className="text-primary hover:underline font-medium">
                                conditions d'utilisation
                              </a>{" "}
                              et la{" "}
                              <a href="/privacy" className="text-primary hover:underline font-medium">
                                politique de confidentialité
                              </a>{" "}
                              de GestiLoc *
                            </Label>
                          </motion.div>
                          {registerForm.formState.errors.acceptTerms && (
                            <p className="text-sm text-red-600">
                              {registerForm.formState.errors.acceptTerms.message}
                            </p>
                          )}
                        </motion.div>
                      </ScrollArea>

                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.8 }}
                      >
                        <Button
                          type="submit"
                          className="w-full h-12 text-lg font-medium mt-6 relative overflow-hidden"
                          disabled={isLoading}
                        >
                          <motion.div
                            className="flex items-center justify-center gap-2"
                            animate={isLoading ? { scale: [1, 1.05, 1] } : {}}
                            transition={{ duration: 1.5, repeat: isLoading ? Infinity : 0 }}
                          >
                            {isLoading && (
                              <motion.div
                                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              />
                            )}
                            {isLoading ? "Création du compte..." : "Créer mon compte"}
                          </motion.div>
                        </Button>
                      </motion.div>

                      <motion.div
                        className="mt-6 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.9 }}
                      >
                        <p className="text-sm text-secondary">
                          Déjà un compte ?{" "}
                          <button
                            onClick={() => setIsLogin(true)}
                            className="text-primary hover:underline font-medium"
                          >
                            Se connecter
                          </button>
                        </p>
                      </motion.div>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => navigate('/')}
              className="text-secondary hover:text-primary font-medium transition-colors"
            >
              ← Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
