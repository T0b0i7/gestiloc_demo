import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Building2,
  User2,
  MapPin,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { authService } from "@/services/api";

// Couleur primaire personnalisée - VERT
const PRIMARY_COLOR = "#70AE48";

// Types d'utilisateur
const USER_TYPES = [
  { value: "owner", label: "Je suis propriétaire", icon: Home },
  { value: "agency", label: "Je suis agence ou entreprise", icon: Building2 },
] as const;

// -------------------- SCHEMAS --------------------

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
  rememberMe: z.boolean().default(false),
});

const registerSchema = z
  .object({
    userType: z.enum(["owner", "agency"], {
      required_error: "Veuillez sélectionner un type de compte",
    }),
    firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
    lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    email: z.string().email("Email invalide").toLowerCase(),
    phone: z.string().min(8, "Le téléphone est requis"),
    address: z.string().min(2, "La ville est requise"),
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "Vous devez accepter les conditions d'utilisation",
    }),
    rememberMe: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    // Vérification correspondance mots de passe
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Les mots de passe ne correspondent pas",
        path: ["confirmPassword"],
      });
    }
  });

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

type ApiErr = {
  response?: { status?: number; data?: { message?: string; errors?: Record<string, string[]> } };
  request?: unknown;
  message?: string;
};

function normalizeBackendMessage(err: ApiErr, fallback: string) {
  const status = err.response?.status;

  if (err.request && !err.response) {
    return "Le serveur ne répond pas. Vérifiez votre connexion internet puis réessayez.";
  }

  if (status === 401) return "Email ou mot de passe incorrect.";
  if (status === 403) return "Accès refusé. Vérifiez vos droits ou contactez le support.";
  if (status === 422) return "Certains champs sont invalides. Vérifiez le formulaire.";
  if (status && status >= 500) return "Problème serveur. Réessayez dans quelques instants.";

  const backendMsg = err.response?.data?.message?.trim();
  if (backendMsg) {
    const looksTechnical =
      backendMsg.toLowerCase().includes("sql") ||
      backendMsg.toLowerCase().includes("exception") ||
      backendMsg.toLowerCase().includes("stack") ||
      backendMsg.toLowerCase().includes("undefined") ||
      backendMsg.toLowerCase().includes("trace");

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
    setError(formKey as any, { type: "server", message: msg });
    applied = true;
  });

  return applied;
}

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(location.pathname === "/login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: true,
    defaultValues: {
      rememberMe: false,
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: true,
    defaultValues: {
      userType: "owner",
      acceptTerms: false,
      rememberMe: false,
    },
  });

  const registerFieldMap = useMemo(
    () =>
      ({
        email: "email",
        phone: "phone",
        address: "address",
        password: "password",
        password_confirmation: "confirmPassword",
        accept_terms: "acceptTerms",
        remember_me: "rememberMe",
        user_type: "userType",
        first_name: "firstName",
        last_name: "lastName",
      }) as Record<string, keyof RegisterFormData>,
    []
  );

  const loginFieldMap = useMemo(
    () =>
      ({
        email: "email",
        password: "password",
      }) as Record<string, keyof LoginFormData>,
    []
  );

  useEffect(() => {
    setError("");
    loginForm.clearErrors();
    registerForm.clearErrors();
  }, [isLogin]);

  const notifyClientValidation = (formErrors: Record<string, any>) => {
    const first = Object.values(formErrors)?.[0];
    const msg = first?.message || "Vérifiez les champs du formulaire.";
    toast.error(msg);
  };

  const handleLogin = async (data: LoginFormData) => {
    setError("");

    try {
      setIsLoading(true);

      const response = await authService.login(data.email, data.password);

      const responseData = (response as any).data;

      // Gérer les deux formats possibles de réponse
      let user: any = null;
      let token: string | null = null;

      if (responseData?.access_token && responseData?.user) {
        // Format : { data: { access_token, user } }
        token = responseData.access_token;
        user = responseData.user;
      } else if (responseData?.access_token) {
        // Format : { access_token, user } à la racine
        token = responseData.access_token;
        user = responseData.user;
      } else if ((response as any)?.access_token && (response as any)?.user) {
        // Format : { access_token, user } à la racine
        token = (response as any).access_token;
        user = (response as any).user;
      }

      if (token) {
        localStorage.setItem("token", token);
        if (data.rememberMe) {
          localStorage.setItem("rememberMe", "true");
        }
      }
      
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        toast.success("Connexion réussie !");

        const roles = user.roles || [];

        let redirectPath = "/";
        let userRole = "";

        if (roles.includes("admin")) {
          redirectPath = "/admin";
          userRole = "admin";
        } else if (roles.includes("landlord") || roles.includes("proprietaire")) {
          redirectPath = "/proprietaire";
          userRole = "proprietaire";
        } else if (roles.includes("coproprietaire") || roles.includes("co_owner")) {
          redirectPath = "/coproprietaire";
          userRole = "coproprietaire";
        } else if (roles.includes("tenant") || roles.includes("locataire")) {
          redirectPath = "/locataire";
          userRole = "locataire";
        } else if (user.user_type === "owner") {
          redirectPath = "/proprietaire";
          userRole = "proprietaire";
        } else if (user.user_type === "agency") {
          redirectPath = "/agence";
          userRole = "agence";
        }

        const updatedUser = { ...user, role: userRole };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        navigate(redirectPath, { replace: true });
      } else {
        throw new Error("Réponse du serveur invalide");
      }
    } catch (e: unknown) {
      const err = e as ApiErr;

      console.error("Erreur de connexion :", err);

      const applied = applyBackendFieldErrors<LoginFormData>(err, loginForm.setError, loginFieldMap);

      const msg = normalizeBackendMessage(err, "Email ou mot de passe incorrect.");
      setError(msg);

      if (applied) toast.error("Vérifiez vos informations de connexion.");
      else toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);

      // Déterminer le rôle
      const isProfessional = data.userType === "agency";
      let role = "proprietaire";
      
      if (data.userType === "agency") {
        role = "agence";
      }

      const userData: any = {
        email: data.email.toLowerCase().trim(),
        phone: data.phone,
        password: data.password,
        password_confirmation: data.confirmPassword,
        user_type: data.userType,
        is_professional: isProfessional,
        role: role,
        address: data.address,
        first_name: data.firstName.trim(),
        last_name: data.lastName.trim(),
        remember_me: data.rememberMe,
        accept_terms: data.acceptTerms,
      };

      const response = await authService.register(userData);

      if (response?.status === "success" || response?.data?.token || (response as any)?.token) {
        toast.success("Compte créé avec succès ! Vous allez être redirigé vers la page de connexion.");

        setTimeout(() => {
          setIsLogin(true);
          registerForm.reset({
            userType: "owner",
            acceptTerms: false,
            rememberMe: false,
          });
        }, 1500);
      } else {
        throw new Error(response?.message || "Erreur lors de l'inscription");
      }
    } catch (e: unknown) {
      const err = e as ApiErr;

      console.error("Erreur lors de l'inscription :", err);

      const applied = applyBackendFieldErrors<RegisterFormData>(err, registerForm.setError, registerFieldMap);
      const msg = normalizeBackendMessage(err, "Une erreur est survenue lors de la création du compte.");

      if (applied) toast.error("Certains champs sont invalides. Vérifiez le formulaire.");
      else toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedUserType = registerForm.watch("userType");

  // Style pour le bouton avec la couleur verte
  const buttonStyle = {
    backgroundColor: PRIMARY_COLOR,
    color: "white",
  };

  const linkStyle = {
    color: PRIMARY_COLOR,
  };

  const checkboxStyle = {
    borderColor: PRIMARY_COLOR,
    color: PRIMARY_COLOR,
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white">
      <div className="w-full max-w-md">
        {/* Logo centré */}
        <motion.div 
          className="text-center mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-2" style={{ color: PRIMARY_COLOR }}>
            Gestiloc
          </h1>
          <p className="text-sm text-slate-600 max-w-xs mx-auto">
            Créer de meilleures relations entre les propriétaires et les locataires !
          </p>
        </motion.div>

        <div className="relative">
          <AnimatePresence mode="wait">
            {isLogin ? (
              /* FORMULAIRE DE CONNEXION */
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <motion.h2
                    className="text-2xl font-bold text-slate-800 mb-6"
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    Connexion à votre compte
                  </motion.h2>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                      >
                        <AlertCircle size={20} className="text-red-600" />
                        <p className="text-sm text-red-600">{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form
                    onSubmit={loginForm.handleSubmit(handleLogin, (errs) => notifyClientValidation(errs))}
                    className="space-y-5"
                  >
                    {/* Email */}
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      <Label htmlFor="login-email" className="text-slate-700 font-medium text-sm">
                        Email
                      </Label>
                      <div className="relative mt-1.5">
                        <Mail size={18} className="absolute left-3 top-3.5 text-slate-400" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="votre@email.fr"
                          {...loginForm.register("email")}
                          className="pl-10 h-12 border-slate-300 focus:border-[#70AE48] focus:ring-[#70AE48]/20"
                        />
                      </div>
                      {loginForm.formState.errors.email && (
                        <p className="text-sm text-red-600 mt-1">{loginForm.formState.errors.email.message}</p>
                      )}
                    </motion.div>

                    {/* Mot de passe */}
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                    >
                      <Label htmlFor="login-password" className="text-slate-700 font-medium text-sm">
                        Mot de passe
                      </Label>
                      <div className="relative mt-1.5">
                        <Lock size={18} className="absolute left-3 top-3.5 text-slate-400" />
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...loginForm.register("password")}
                          className="pl-10 pr-10 h-12 border-slate-300 focus:border-[#70AE48] focus:ring-[#70AE48]/20"
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
                        <p className="text-sm text-red-600 mt-1">{loginForm.formState.errors.password.message}</p>
                      )}
                    </motion.div>

                    {/* Se souvenir de moi + Mot de passe oublié */}
                    <motion.div
                      className="flex items-center justify-between"
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                    >
                      <div className="flex items-center space-x-2">
                        <Controller
                          name="rememberMe"
                          control={loginForm.control}
                          render={({ field }) => (
                            <Checkbox
                              id="remember"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              style={field.value ? checkboxStyle : {}}
                            />
                          )}
                        />
                        <Label htmlFor="remember" className="text-sm font-normal text-slate-600 cursor-pointer">
                          Se souvenir de moi
                        </Label>
                      </div>
                      <a 
                        href="/forgot-password" 
                        className="text-sm hover:underline"
                        style={linkStyle}
                      >
                        Mot de passe oublié ?
                      </a>
                    </motion.div>

                    {/* Bouton Connexion */}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.5 }}
                    >
                      <Button
                        type="submit"
                        className="w-full h-12 text-base font-medium relative overflow-hidden border-0"
                        style={buttonStyle}
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
                          {isLoading ? "Connexion en cours..." : "Connexion"}
                        </motion.div>
                      </Button>
                    </motion.div>

                    {/* Lien vers inscription */}
                    <motion.div
                      className="mt-4 text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.6 }}
                    >
                      <p className="text-sm text-slate-600">
                        Pas de compte ?{" "}
                        <button
                          type="button"
                          onClick={() => setIsLogin(false)}
                          className="font-medium hover:underline"
                          style={linkStyle}
                        >
                          Cliquez ici
                        </button>
                      </p>
                    </motion.div>
                  </form>
                </motion.div>
              </motion.div>
            ) : (
              /* FORMULAIRE D'INSCRIPTION */
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <motion.h2
                    className="text-2xl font-bold text-slate-800 mb-2"
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    Créer un compte
                  </motion.h2>

                  <motion.p
                    className="mb-6 text-slate-600 text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.15 }}
                  >
                    Créer de meilleures relations entre les propriétaires et les locataires !
                  </motion.p>

                  {/* Sélection du type d'utilisateur */}
                  <motion.div
                    className="space-y-3 mb-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <Label className="text-slate-700 font-medium text-sm block mb-2">
                      Vous êtes ?
                    </Label>
                    <Controller
                      name="userType"
                      control={registerForm.control}
                      render={({ field }) => (
                        <div className="space-y-2">
                          {USER_TYPES.map((type) => {
                            const Icon = type.icon;
                            const isSelected = field.value === type.value;
                            return (
                              <div
                                key={type.value}
                                className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                  isSelected 
                                    ? "border-[#70AE48] bg-green-50" 
                                    : "border-slate-200 hover:border-slate-300"
                                }`}
                                onClick={() => field.onChange(type.value)}
                              >
                                <div className="flex items-center flex-1">
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${
                                    isSelected ? "border-[#70AE48]" : "border-slate-400"
                                  }`}>
                                    {isSelected && (
                                      <div className="w-2.5 h-2.5 rounded-full bg-[#70AE48]" />
                                    )}
                                  </div>
                                  <Icon size={18} className={`mr-2 ${
                                    isSelected ? "text-[#70AE48]" : "text-slate-500"
                                  }`} />
                                  <span className={`text-sm ${
                                    isSelected ? "text-[#70AE48] font-medium" : "text-slate-700"
                                  }`}>
                                    {type.label}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    />
                    {registerForm.formState.errors.userType && (
                      <p className="text-xs text-red-600">{registerForm.formState.errors.userType.message}</p>
                    )}
                  </motion.div>

                  <form onSubmit={registerForm.handleSubmit(handleRegister, (errs) => notifyClientValidation(errs))}>
                    <ScrollArea className="h-[380px] pr-4">
                      <div className="space-y-4 pb-4">
                        {/* Prénom & Nom */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="firstName" className="text-slate-700 font-medium text-sm">
                              Prénom *
                            </Label>
                            <Input
                              id="firstName"
                              placeholder="Jean"
                              {...registerForm.register("firstName")}
                              className="h-11 border-slate-300 focus:border-[#70AE48] focus:ring-[#70AE48]/20"
                            />
                            {registerForm.formState.errors.firstName && (
                              <p className="text-xs text-red-600">
                                {registerForm.formState.errors.firstName.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="lastName" className="text-slate-700 font-medium text-sm">
                              Nom *
                            </Label>
                            <Input
                              id="lastName"
                              placeholder="Dupont"
                              {...registerForm.register("lastName")}
                              className="h-11 border-slate-300 focus:border-[#70AE48] focus:ring-[#70AE48]/20"
                            />
                            {registerForm.formState.errors.lastName && (
                              <p className="text-xs text-red-600">
                                {registerForm.formState.errors.lastName.message}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                          <Label htmlFor="register-email" className="text-slate-700 font-medium text-sm">
                            @ Email *
                          </Label>
                          <div className="relative">
                            <Mail size={18} className="absolute left-3 top-2.5 text-slate-400" />
                            <Input
                              id="register-email"
                              type="email"
                              placeholder="nom@exemple.fr"
                              {...registerForm.register("email")}
                              className="pl-10 h-11 border-slate-300 focus:border-[#70AE48] focus:ring-[#70AE48]/20"
                            />
                          </div>
                          {registerForm.formState.errors.email && (
                            <p className="text-xs text-red-600">{registerForm.formState.errors.email.message}</p>
                          )}
                        </div>

                        {/* Téléphone & Ville */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="phone" className="text-slate-700 font-medium text-sm">
                              Téléphone *
                            </Label>
                            <Input
                              id="phone"
                              type="tel"
                              placeholder="06 12 34 56 78"
                              {...registerForm.register("phone")}
                              className="h-11 border-slate-300 focus:border-[#70AE48] focus:ring-[#70AE48]/20"
                            />
                            {registerForm.formState.errors.phone && (
                              <p className="text-xs text-red-600">{registerForm.formState.errors.phone.message}</p>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="address" className="text-slate-700 font-medium text-sm">
                              Ville *
                            </Label>
                            <div className="relative">
                              <MapPin size={18} className="absolute left-3 top-2.5 text-slate-400" />
                              <Input
                                id="address"
                                placeholder="Paris"
                                {...registerForm.register("address")}
                                className="pl-10 h-11 border-slate-300 focus:border-[#70AE48] focus:ring-[#70AE48]/20"
                              />
                            </div>
                            {registerForm.formState.errors.address && (
                              <p className="text-xs text-red-600">
                                {registerForm.formState.errors.address.message}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Mot de passe */}
                        <div className="space-y-1.5">
                          <Label htmlFor="register-password" className="text-slate-700 font-medium text-sm">
                            ☐ Mot de passe *
                          </Label>
                          <div className="relative">
                            <Lock size={18} className="absolute left-3 top-2.5 text-slate-400" />
                            <Input
                              id="register-password"
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              {...registerForm.register("password")}
                              className="pl-10 pr-10 h-11 border-slate-300 focus:border-[#70AE48] focus:ring-[#70AE48]/20"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                            >
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                          {registerForm.formState.errors.password && (
                            <p className="text-xs text-red-600">{registerForm.formState.errors.password.message}</p>
                          )}
                        </div>

                        {/* Confirmation mot de passe */}
                        <div className="space-y-1.5">
                          <Label htmlFor="confirmPassword" className="text-slate-700 font-medium text-sm">
                            ☑ Confirmer le mot de passe *
                          </Label>
                          <div className="relative">
                            <Lock size={18} className="absolute left-3 top-2.5 text-slate-400" />
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="••••••••"
                              {...registerForm.register("confirmPassword")}
                              className="pl-10 pr-10 h-11 border-slate-300 focus:border-[#70AE48] focus:ring-[#70AE48]/20"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                            >
                              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                          {registerForm.formState.errors.confirmPassword && (
                            <p className="text-xs text-red-600">
                              {registerForm.formState.errors.confirmPassword.message}
                            </p>
                          )}
                        </div>

                        {/* Checkbox Conditions d'utilisation */}
                        <div className="flex items-start space-x-3 pt-2">
                          <Controller
                            name="acceptTerms"
                            control={registerForm.control}
                            render={({ field }) => (
                              <Checkbox
                                id="terms"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="mt-0.5"
                                style={field.value ? checkboxStyle : {}}
                              />
                            )}
                          />
                          <Label
                            htmlFor="terms"
                            className="text-xs font-normal leading-relaxed cursor-pointer text-slate-600"
                          >
                            ☑ J'accepte les{" "}
                            <a href="/terms" className="font-medium hover:underline" style={linkStyle}>
                              Conditions d'utilisation
                            </a>{" "}
                            et la{" "}
                            <a href="/privacy" className="font-medium hover:underline" style={linkStyle}>
                              Politique de Confidentialité
                            </a>
                          </Label>
                        </div>
                        {registerForm.formState.errors.acceptTerms && (
                          <p className="text-xs text-red-600">{registerForm.formState.errors.acceptTerms.message}</p>
                        )}

                        {/* Checkbox Se souvenir de moi */}
                        <div className="flex items-center space-x-3">
                          <Controller
                            name="rememberMe"
                            control={registerForm.control}
                            render={({ field }) => (
                              <Checkbox
                                id="remember-register"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                style={field.value ? checkboxStyle : {}}
                              />
                            )}
                          />
                          <Label
                            htmlFor="remember-register"
                            className="text-xs font-normal cursor-pointer text-slate-600"
                          >
                            ☑ Se souvenir de moi
                          </Label>
                        </div>

                        {/* Message de confirmation légal */}
                        <motion.p
                          className="text-xs text-slate-500 italic mt-4 pt-2 border-t border-slate-100"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          En vous inscrivant, vous reconnaissez avoir lu et accepté les Conditions d'utilisation et Politique de Confidentialité
                        </motion.p>
                      </div>
                    </ScrollArea>

                    {/* Bouton Créer mon compte */}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.25 }}
                    >
                      <Button
                        type="submit"
                        className="w-full h-12 text-base font-medium mt-6 relative overflow-hidden border-0"
                        style={buttonStyle}
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

                    {/* Lien vers connexion */}
                    <motion.div
                      className="mt-4 text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                    >
                      <p className="text-sm text-slate-600">
                        Déjà un compte ?{" "}
                        <button
                          type="button"
                          onClick={() => setIsLogin(true)}
                          className="font-medium hover:underline"
                          style={linkStyle}
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

        {/* Lien retour accueil */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/")}
            className="text-sm hover:text-[#70AE48] font-medium transition-colors text-slate-500"
            type="button"
          >
            ← Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}