import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, AlertCircle, User, Phone } from 'lucide-react';
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

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(location.pathname === '/login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      acceptTerms: false
    }
  });

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
    } catch (error: unknown) {
      console.error('Erreur de connexion :', error);
      let errorMessage = 'Email ou mot de passe incorrect';

      const err = error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } }; request?: unknown; message?: string };

      if (err.response) {
        if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data?.errors) {
          errorMessage = Object.values(err.response.data.errors).flat().join('\n');
        }
      } else if (err.request) {
        errorMessage = 'Le serveur ne répond pas. Vérifiez votre connexion.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
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
    } catch (error: unknown) {
      console.error('Erreur lors de l\'inscription :', error);
      let errorMessage = "Une erreur est survenue lors de l'inscription";

      const err = error as { response?: { data?: { errors?: Record<string, string[]>; message?: string } }; message?: string };

      if (err.response?.data?.errors) {
        const validationErrors = Object.values(err.response.data.errors).flat();
        errorMessage = validationErrors.join('\n');
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white">
      {/* Forms */}
      <div className="w-full max-w-md">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">GestiLoc</h1>
          </div>

          {/* Toggle Buttons */}
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

          {/* Forms Container */}
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
                  {/* Login Form */}
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

                    <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-6">
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
                        <Button type="submit" className="w-full h-12 text-lg font-medium relative overflow-hidden" disabled={isLoading}>
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
                  {/* Register Form */}
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
                      style={{color: 'black'}}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                    >
                      Compte gratuit, sans carte bancaire. Vous pourrez ajouter vos locataires ensuite.
                    </motion.h2>

                    <form onSubmit={registerForm.handleSubmit(handleRegister)}>
                      <ScrollArea className="h-[350px] pr-4">
                        <motion.div
                          className="space-y-6 pb-6"
                          initial="hidden"
                          animate="visible"
                          variants={{
                            hidden: { opacity: 0 },
                            visible: {
                              opacity: 1,
                              transition: {
                                staggerChildren: 0.1,
                                delayChildren: 0.4,
                              },
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
                        <Button type="submit" className="w-full h-12 text-lg font-medium mt-6 relative overflow-hidden" disabled={isLoading}>
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

          {/* Retour */}
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