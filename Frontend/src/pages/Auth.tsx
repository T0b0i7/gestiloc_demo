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
  IdCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { authService } from "@/services/api";

const ID_TYPES = [
  { value: "CNI", label: "Carte d'identité (CNI)" },
  { value: "PASSPORT", label: "Passeport" },
  { value: "PERMIS", label: "Permis de conduire" },
  { value: "SEJOUR", label: "Titre de séjour" },
] as const;

// -------------------- SCHEMAS --------------------

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

const registerSchema = z
  .object({
    // Toggle
    isProfessional: z.boolean().default(false),

    // ✅ Représentant (désormais requis en Pro aussi)
    firstName: z.string().optional(),
    lastName: z.string().optional(),

    // Pro
    companyName: z.string().optional(),
    ifu: z.string().optional(),
    rccm: z.string().optional(),

    // Commun
    email: z.string().email("Email invalide").toLowerCase(),
    phone: z.string().min(1, "Le téléphone est requis"),
    address: z.string().min(5, "L'adresse du bailleur est requise"),
    idType: z.enum(["CNI", "PASSPORT", "PERMIS", "SEJOUR"], {
      required_error: "Type de pièce d'identité requis",
    }),
    idNumber: z.string().optional(),

    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "Vous devez accepter les conditions d'utilisation",
    }),
  })
  .superRefine((data, ctx) => {
    // passwords match
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Les mots de passe ne correspondent pas",
        path: ["confirmPassword"],
      });
    }

    // ✅ Prénom/Nom requis dans tous les cas (Particulier ET Pro)
    if (!data.firstName || data.firstName.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le prénom doit contenir au moins 2 caractères",
        path: ["firstName"],
      });
    }
    if (!data.lastName || data.lastName.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le nom doit contenir au moins 2 caractères",
        path: ["lastName"],
      });
    }

    // Particulier vs Pro rules
    if (data.isProfessional) {
      if (!data.companyName || data.companyName.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La raison sociale est requise",
          path: ["companyName"],
        });
      }
      if (!data.ifu || data.ifu.trim().length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "L'IFU est requis",
          path: ["ifu"],
        });
      }
      if (!data.rccm || data.rccm.trim().length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Le RCCM est requis",
          path: ["rccm"],
        });
      }
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: true,
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: true,
    defaultValues: {
      acceptTerms: false,
      isProfessional: false,
      idType: "CNI",
    },
  });

  // maps backend -> form fields
  const registerFieldMap = useMemo(
    () =>
      ({
        // Commun
        email: "email",
        phone: "phone",
        address: "address",
        id_type: "idType",
        id_number: "idNumber",

        password: "password",
        password_confirmation: "confirmPassword",
        accept_terms: "acceptTerms",

        // Toggle
        is_professional: "isProfessional",

        // Représentant / Personne
        first_name: "firstName",
        last_name: "lastName",

        // Pro
        company_name: "companyName",
        ifu: "ifu",
        rccm: "rccm",
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
  }, [isLogin]); // eslint-disable-line react-hooks/exhaustive-deps

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

      if (token) localStorage.setItem("token", token);
      if (user) localStorage.setItem("user", JSON.stringify(user));

      if (user) {
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

      const isPro = !!data.isProfessional;

      // ✅ On envoie first_name/last_name TOUJOURS (représentant)
      const userData: any = {
        email: data.email.toLowerCase().trim(),
        phone: data.phone,
        password: data.password,
        password_confirmation: data.confirmPassword,

        is_professional: isPro,

        address: data.address,

        id_type: data.idType,
        id_number: (data.idNumber || "").trim() || null,

        first_name: (data.firstName || "").trim(),
        last_name: (data.lastName || "").trim(),

        company_name: isPro ? (data.companyName || "").trim() : null,
        ifu: isPro ? (data.ifu || "").trim() : null,
        rccm: isPro ? (data.rccm || "").trim() : null,

        role: "proprietaire",
        accept_terms: data.acceptTerms,
      };

      const response = await authService.register(userData);

      if (response?.status === "success" || response?.data?.token || (response as any)?.token) {
        toast.success("Compte créé avec succès ! Vous allez être redirigé vers la page de connexion.");

        setTimeout(() => {
          setIsLogin(true);
          registerForm.reset({
            acceptTerms: false,
            isProfessional: false,
            idType: "CNI",
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

  const isProfessional = registerForm.watch("isProfessional");

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
                isLogin ? "bg-primary text-white shadow-sm" : "text-slate-600 hover:bg-slate-200"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
            >
              Connexion
            </motion.button>
            <motion.button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                !isLogin ? "bg-primary text-white shadow-sm" : "text-slate-600 hover:bg-slate-200"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
            >
              Inscription
            </motion.button>
          </motion.div>

          <div className="relative min-h-[760px]">
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
                          <p className="text-sm text-red-600 mt-1">{loginForm.formState.errors.email.message}</p>
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
                            type={showPassword ? "text" : "password"}
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
                          <p className="text-sm text-red-600 mt-1">{loginForm.formState.errors.password.message}</p>
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
                            {isLoading ? "Connexion en cours..." : "Se connecter"}
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

                    <motion.p
                      className="mb-6 text-slate-700"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                    >
                      Compte gratuit, sans carte bancaire. Vous pourrez ajouter vos locataires ensuite.
                    </motion.p>

                    {/* Toggle Particulier / Pro */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 mb-6 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isProfessional ? (
                          <Building2 size={18} className="text-slate-600" />
                        ) : (
                          <User2 size={18} className="text-slate-600" />
                        )}
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {isProfessional ? "Professionnel" : "Particulier"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {isProfessional ? "Société + représentant" : "Prénom + Nom"}
                          </p>
                        </div>
                      </div>

                      <Controller
                        name="isProfessional"
                        control={registerForm.control}
                        render={({ field }) => (
                          <button
                            type="button"
                            onClick={() => field.onChange(!field.value)}
                            className={`h-9 px-3 rounded-lg text-sm font-medium transition-colors ${
                              field.value ? "bg-primary text-white" : "bg-white text-slate-700 border border-slate-200"
                            }`}
                          >
                            {field.value ? "Pro" : "Particulier"}
                          </button>
                        )}
                      />
                    </div>

                    <form onSubmit={registerForm.handleSubmit(handleRegister, (errs) => notifyClientValidation(errs))}>
                      <ScrollArea className="h-[420px] pr-4">
                        <motion.div
                          className="space-y-6 pb-6"
                          initial="hidden"
                          animate="visible"
                          variants={{
                            hidden: { opacity: 0 },
                            visible: {
                              opacity: 1,
                              transition: { staggerChildren: 0.08, delayChildren: 0.15 },
                            },
                          }}
                        >
                          {/* ✅ Représentant / Identité (toujours affiché) */}
                          <motion.div
                            className="grid grid-cols-2 gap-4"
                            variants={{ hidden: { y: 12, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
                          >
                            <div className="space-y-2">
                              <Label htmlFor="firstName" className="text-slate-700 font-medium">
                                {isProfessional ? "Prénom du représentant *" : "Prénom *"}
                              </Label>
                              <Input
                                id="firstName"
                                placeholder="Jean"
                                {...registerForm.register("firstName")}
                                className="h-12 border-slate-300 focus:border-primary focus:ring-primary/20"
                              />
                              {registerForm.formState.errors.firstName && (
                                <p className="text-sm text-red-600">
                                  {registerForm.formState.errors.firstName.message as any}
                                </p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="lastName" className="text-slate-700 font-medium">
                                {isProfessional ? "Nom du représentant *" : "Nom *"}
                              </Label>
                              <Input
                                id="lastName"
                                placeholder="Dupont"
                                {...registerForm.register("lastName")}
                                className="h-12 border-slate-300 focus:border-primary focus:ring-primary/20"
                              />
                              {registerForm.formState.errors.lastName && (
                                <p className="text-sm text-red-600">
                                  {registerForm.formState.errors.lastName.message as any}
                                </p>
                              )}
                            </div>
                          </motion.div>

                          {/* Pro */}
                          {isProfessional && (
                            <motion.div
                              className="space-y-4"
                              variants={{ hidden: { y: 12, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
                            >
                              <div className="space-y-2">
                                <Label htmlFor="companyName" className="text-slate-700 font-medium">
                                  Raison sociale *
                                </Label>
                                <div className="relative mt-1">
                                  <Building2 size={18} className="absolute left-3 top-3.5 text-slate-400" />
                                  <Input
                                    id="companyName"
                                    placeholder="MB Pro Services"
                                    {...registerForm.register("companyName")}
                                    className="pl-10 h-12 border-slate-300 focus:border-primary focus:ring-primary/20"
                                  />
                                </div>
                                {registerForm.formState.errors.companyName && (
                                  <p className="text-sm text-red-600">
                                    {registerForm.formState.errors.companyName.message as any}
                                  </p>
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="ifu" className="text-slate-700 font-medium">
                                    IFU *
                                  </Label>
                                  <Input
                                    id="ifu"
                                    placeholder="Ex: 123456789"
                                    {...registerForm.register("ifu")}
                                    className="h-12 border-slate-300 focus:border-primary focus:ring-primary/20"
                                  />
                                  {registerForm.formState.errors.ifu && (
                                    <p className="text-sm text-red-600">
                                      {registerForm.formState.errors.ifu.message as any}
                                    </p>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="rccm" className="text-slate-700 font-medium">
                                    RCCM *
                                  </Label>
                                  <Input
                                    id="rccm"
                                    placeholder="Ex: RB/ABC/2025"
                                    {...registerForm.register("rccm")}
                                    className="h-12 border-slate-300 focus:border-primary focus:ring-primary/20"
                                  />
                                  {registerForm.formState.errors.rccm && (
                                    <p className="text-sm text-red-600">
                                      {registerForm.formState.errors.rccm.message as any}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}

                          {/* Email */}
                          <motion.div
                            className="space-y-2"
                            variants={{ hidden: { x: -10, opacity: 0 }, visible: { x: 0, opacity: 1 } }}
                          >
                            <Label htmlFor="register-email" className="text-slate-700 font-medium">
                              Adresse email *
                            </Label>
                            <div className="relative mt-1">
                              <Mail size={18} className="absolute left-3 top-3.5 text-slate-400" />
                              <Input
                                id="register-email"
                                type="email"
                                placeholder="nom@exemple.fr"
                                {...registerForm.register("email")}
                                className="pl-10 h-12 border-slate-300 focus:border-primary focus:ring-primary/20"
                              />
                            </div>
                            {registerForm.formState.errors.email && (
                              <p className="text-sm text-red-600">{registerForm.formState.errors.email.message}</p>
                            )}
                          </motion.div>

                          {/* Phone */}
                          <motion.div
                            className="space-y-2"
                            variants={{ hidden: { x: -10, opacity: 0 }, visible: { x: 0, opacity: 1 } }}
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
                              <p className="text-sm text-red-600">{registerForm.formState.errors.phone.message}</p>
                            )}
                          </motion.div>

                          {/* Address */}
                          <motion.div
                            className="space-y-2"
                            variants={{ hidden: { x: -10, opacity: 0 }, visible: { x: 0, opacity: 1 } }}
                          >
                            <Label htmlFor="address" className="text-slate-700 font-medium">
                              Adresse du bailleur *
                            </Label>
                            <div className="relative mt-1">
                              <MapPin size={18} className="absolute left-3 top-3.5 text-slate-400" />
                              <Input
                                id="address"
                                placeholder="1 rue Marguerin, 75014 Paris"
                                {...registerForm.register("address")}
                                className="pl-10 h-12 border-slate-300 focus:border-primary focus:ring-primary/20"
                              />
                            </div>
                            {registerForm.formState.errors.address && (
                              <p className="text-sm text-red-600">
                                {registerForm.formState.errors.address.message as any}
                              </p>
                            )}
                          </motion.div>

                          {/* ID Type + Number */}
                          <motion.div
                            className="space-y-3"
                            variants={{ hidden: { y: 10, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
                          >
                            <div className="space-y-2">
                              <Label className="text-slate-700 font-medium">Type de pièce d'identité *</Label>
                              <div className="relative mt-1">
                                <IdCard size={18} className="absolute left-3 top-3.5 text-slate-400" />
                                <select
                                  className="w-full h-12 pl-10 pr-3 rounded-md border border-slate-300 bg-white text-slate-800 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                  {...registerForm.register("idType")}
                                >
                                  {ID_TYPES.map((t) => (
                                    <option key={t.value} value={t.value}>
                                      {t.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              {registerForm.formState.errors.idType && (
                                <p className="text-sm text-red-600">
                                  {registerForm.formState.errors.idType.message as any}
                                </p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="idNumber" className="text-slate-700 font-medium">
                                Numéro de la pièce (optionnel)
                              </Label>
                              <Input
                                id="idNumber"
                                placeholder="Ex: AB123456"
                                {...registerForm.register("idNumber")}
                                className="h-12 border-slate-300 focus:border-primary focus:ring-primary/20"
                              />
                              {registerForm.formState.errors.idNumber && (
                                <p className="text-sm text-red-600">
                                  {registerForm.formState.errors.idNumber.message as any}
                                </p>
                              )}
                            </div>
                          </motion.div>

                          {/* Password */}
                          <motion.div
                            className="space-y-2"
                            variants={{ hidden: { x: -10, opacity: 0 }, visible: { x: 0, opacity: 1 } }}
                          >
                            <Label htmlFor="register-password" className="text-slate-700 font-medium">
                              Mot de passe *
                            </Label>
                            <div className="relative mt-1">
                              <Lock size={18} className="absolute left-3 top-3.5 text-slate-400" />
                              <Input
                                id="register-password"
                                type="password"
                                placeholder="Ex : G3$t!L0c/2026***"
                                {...registerForm.register("password")}
                                className="pl-10 h-12 border-slate-300 focus:border-primary focus:ring-primary/20"
                              />
                            </div>
                            <p className="text-xs text-slate-500">
                              Le mot de passe doit contenir au moins 8 caractères, avec des lettres, des chiffres et des caractères spéciaux.
                            </p>
                            {registerForm.formState.errors.password && (
                              <p className="text-sm text-red-600">{registerForm.formState.errors.password.message}</p>
                            )}
                          </motion.div>

                          {/* Confirm Password */}
                          <motion.div
                            className="space-y-2"
                            variants={{ hidden: { x: -10, opacity: 0 }, visible: { x: 0, opacity: 1 } }}
                          >
                            <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">
                              Confirmer le mot de passe *
                            </Label>
                            <Input
                              id="confirmPassword"
                              type="password"
                              placeholder="Répétez le mot de passe"
                              {...registerForm.register("confirmPassword")}
                              className="h-12 border-slate-300 focus:border-primary focus:ring-primary/20"
                            />
                            {registerForm.formState.errors.confirmPassword && (
                              <p className="text-sm text-red-600">
                                {registerForm.formState.errors.confirmPassword.message as any}
                              </p>
                            )}
                          </motion.div>

                          {/* Terms */}
                          <motion.div
                            className="flex items-start space-x-3"
                            variants={{ hidden: { y: 10, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
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
                            <p className="text-sm text-red-600">{registerForm.formState.errors.acceptTerms.message}</p>
                          )}
                        </motion.div>
                      </ScrollArea>

                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.25 }}
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
                        transition={{ duration: 0.4, delay: 0.3 }}
                      >
                        <p className="text-sm text-secondary">
                          Déjà un compte ?{" "}
                          <button
                            type="button"
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
              onClick={() => navigate("/")}
              className="text-secondary hover:text-primary font-medium transition-colors"
              type="button"
            >
              ← Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}