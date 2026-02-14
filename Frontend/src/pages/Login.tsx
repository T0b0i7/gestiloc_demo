import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AtSign,ArrowLeft, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { authService } from "@/services/api";
import { cn } from "@/lib/utils";

// Schéma de validation du formulaire de connexion
const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const handleLogin = async (data: LoginFormData) => {
    setError("");
    try {
      setIsLoading(true);

      const response = await authService.login(data.email, data.password);

      if (response?.data?.user) {
        const { user } = response.data;
        toast.success("Connexion réussie !");

        localStorage.setItem("token", response.data.access_token);
        localStorage.setItem("user", JSON.stringify(user));

        const roles = user.roles ?? [];
        let redirectPath = "/";
        let userRole = "";

        if (roles.includes("admin")) {
          redirectPath = "/admin";
          userRole = "admin";
        } else if (roles.includes("landlord") || roles.includes("proprietaire")) {
          redirectPath = "/proprietaire";
          userRole = "proprietaire";
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
    } catch (err: unknown) {
      const e = err as {
        response?: { data?: { message?: string; errors?: Record<string, string[]> } };
        request?: unknown;
        message?: string;
      };
      let errorMessage = "Email ou mot de passe incorrect";

      if (e.response?.data?.message) {
        errorMessage = e.response.data.message;
      } else if (e.response?.data?.errors) {
        errorMessage = Object.values(e.response.data.errors).flat().join("\n");
      } else if (e.request) {
        errorMessage = "Le serveur ne répond pas. Vérifiez votre connexion.";
      } else if (e.message) {
        errorMessage = e.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex min-h-[calc(100vh-5rem)] items-center justify-center py-12">
      <Card className="w-full max-w-md rounded-2xl border-2 border-primary/50 shadow-md">
        {/* En-tête : logo, titre et sous-titre (aligné Register) */}
        <CardHeader className="space-y-1">
          <CardTitle className="text-center">
            <h1 className="text-4xl font-bold text-primary">Gestiloc</h1>
          </CardTitle>
          <CardTitle className="text-center text-lg font-semibold text-foreground">
            Connexion à votre compte
          </CardTitle>
          <CardDescription className="text-center">
            Créer de meilleures relations entre les propriétaires et les
            locataires !
          </CardDescription>
        </CardHeader>

        <form onSubmit={loginForm.handleSubmit(handleLogin)}>
          <CardContent className="space-y-5">
            {/* Message d'erreur global */}
            {error && (
              <div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
                <p className="text-sm font-medium text-destructive">{error}</p>
              </div>
            )}

            {/* Champ email avec icône @ */}
            <div className="space-y-1">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <AtSign className="h-4 w-4" />
                </span>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="Email"
                  {...loginForm.register("email")}
                  className={cn(
                    "h-11 rounded-lg border border-border bg-muted/50 pl-10",
                    "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary",
                    loginForm.formState.errors.email && "border-destructive"
                  )}
                />
              </div>
              {loginForm.formState.errors.email?.message && (
                <p className="text-sm text-destructive">
                  {loginForm.formState.errors.email.message}
                </p>
              )}
            </div>

            {/* Champ mot de passe avec icône œil */}
            <div className="space-y-1">
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mot de passe"
                  {...loginForm.register("password")}
                  className={cn(
                    "h-11 rounded-lg border border-border bg-muted/50 pr-10",
                    "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary",
                    loginForm.formState.errors.password && "border-destructive"
                  )}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {loginForm.formState.errors.password?.message && (
                <p className="text-sm text-destructive">
                  {loginForm.formState.errors.password.message}
                </p>
              )}
            </div>

            {/* Ligne : case "Se souvenir de moi" à gauche, lien "Mot de passe oublié ?" à droite */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <Controller
                  name="rememberMe"
                  control={loginForm.control}
                  render={({ field }) => (
                    <Checkbox
                      id="remember"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="h-4 w-4"
                    />
                  )}
                />
                <Label
                  htmlFor="remember"
                  className="cursor-pointer text-sm font-normal text-foreground"
                >
                  Se souvenir de moi
                </Label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-primary hover:underline"
              >
                Mot de passe oublié ?
              </Link>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pt-0">
            <Button
              type="submit"
              className="w-full rounded-lg font-medium shadow-sm"
              disabled={isLoading}
            >
              {isLoading ? "Connexion en cours..." : "Connexion"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Pas de compte ?{" "}
              <Link
                to="/register"
                className="font-medium text-primary hover:underline"
              >
                Cliquez ici
              </Link>
              <br />
              
              <Link to="/" className="text-gray-500 underline"><ArrowLeft className="h-4 w-4  inline-block" /> Retour à l'accueil
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
