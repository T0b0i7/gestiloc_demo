import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { authService } from '@/services/api';

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
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
        
        // Stocker le token et les informations utilisateur
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Vérifier les rôles disponibles
        const roles = user.roles || [];
        
        // Déterminer la route de redirection en fonction du rôle
        let redirectPath = '/';
        let userRole = '';
        
        // Vérifier d'abord si admin
        if (roles.includes('admin')) {
          redirectPath = '/admin';
          userRole = 'admin';
        } 
        // Ensuite vérifier si propriétaire/bailleur
        else if (roles.includes('landlord') || roles.includes('proprietaire')) {
          redirectPath = '/proprietaire';
          userRole = 'proprietaire';
        } 
        // Enfin, par défaut, rediriger vers l'espace locataire
        else if (roles.includes('tenant') || roles.includes('locataire')) {
          redirectPath = '/locataire';
          userRole = 'locataire';
        }
        
        // Mettre à jour le rôle de l'utilisateur dans le stockage local
        const updatedUser = { ...user, role: userRole };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Rediriger vers la page appropriée
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


  return (
    <div className="min-h-screen flex">
      {/* Left side - Image */}
      <motion.div
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary-light items-center justify-center p-12 relative overflow-hidden"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Animated background elements */}
        <motion.div
          className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-16 h-16 bg-white/10 rounded-full"
          animate={{
            y: [0, 20, 0],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/4 w-12 h-12 bg-white/10 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />

        <motion.div
          className="max-w-md relative z-10"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <motion.img
            src="/src/assets/p.jpeg"
            alt="GestiLoc Illustration"
            className="w-full h-auto rounded-2xl shadow-2xl"
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="mt-8 text-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <motion.h1
              className="text-4xl font-bold text-white mb-4"
              animate={{
                textShadow: [
                  "0 0 0px rgba(255,255,255,0)",
                  "0 0 20px rgba(255,255,255,0.5)",
                  "0 0 0px rgba(255,255,255,0)",
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              GestiLoc
            </motion.h1>
            <motion.p
              className="text-blue-100 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              Gestion Immobilière Intelligente
            </motion.p>
            <motion.p
              className="text-blue-100 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              Simplifiez la gestion de vos biens immobiliers avec notre plateforme moderne.
            </motion.p>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Right side - Forms */}
      <div className="flex-1 flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 lg:bg-gradient-to-br lg:from-white lg:to-slate-50/50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <motion.div
            className="text-center mb-8 lg:hidden"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.h1
              className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent mb-2"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              GestiLoc
            </motion.h1>
            <p className="text-slate-600 font-medium">
              Gestion Immobilière Intelligente
            </p>
          </motion.div>

          {/* Login Form */}
          <motion.div
            className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-slate-200/50"
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
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
                  className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200/50 rounded-xl p-4 mb-6 flex items-center gap-3 shadow-lg"
                  initial={{ opacity: 0, scale: 0.9, y: -20, rotateX: -15 }}
                  animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20, rotateX: -15 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <AlertCircle size={20} className="text-red-600" />
                  </motion.div>
                  <p className="text-sm text-red-700 font-medium">{error}</p>
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
                    className="pl-10 pr-10 h-12 border-slate-300/50 focus:border-primary focus:ring-4 focus:ring-primary/10 bg-slate-50/50 transition-all duration-300"
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
              <motion.a
                href="/forgot-password"
                className="text-primary hover:text-primary-light font-medium text-sm transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Mot de passe oublié ?
              </motion.a>
            </motion.div>
          </motion.div>

          {/* Retour */}
          <div className="text-center mt-8">
            <button
              onClick={() => navigate('/')}
              className="text-slate-600 hover:text-primary text-sm font-medium transition-colors"
            >
              ← Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
