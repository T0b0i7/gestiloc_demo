import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AtSign, ArrowLeft, Lock, CheckCircle, Eye, EyeOff, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { authService } from "@/services/api";

type Mode = "forgot" | "reset";

// Schéma pour la demande (email seul)
const forgotPasswordSchema = z.object({
  email: z.string().email("Email invalide"),
});

// Schéma pour la réinitialisation (mot de passe + confirmation)
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Le mot de passe doit faire au moins 8 caractères")
      .regex(/[A-Z]/, "Doit contenir au moins une majuscule")
      .regex(/[a-z]/, "Doit contenir au moins une minuscule")
      .regex(/[0-9]/, "Doit contenir au moins un chiffre")
      .regex(/[^a-zA-Z0-9]/, "Doit contenir au moins un caractère spécial"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

const inputBaseClass =
  "h-11 rounded-lg border border-border bg-muted/50 pl-10 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const mode: Mode = token ? "reset" : "forgot";

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Formulaire pour "Forgot Password"
  const forgotForm = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  // Formulaire pour "Reset Password"
  const resetForm = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onForgotSubmit = async (data: ForgotPasswordData) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setIsSuccess(true);
      toast.success("Un lien de réinitialisation a été envoyé.");
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  const onResetSubmit = async (data: ResetPasswordData) => {
    setIsLoading(true);
    try {
      if (!token || !email) throw new Error("Paramètres manquants.");
      await authService.resetPassword({
        token,
        email,
        password: data.password,
        password_confirmation: data.confirmPassword,
      });
      setIsSuccess(true);
      toast.success("Mot de passe mis à jour avec succès !");
      setTimeout(() => navigate("/login"), 3000);
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess && mode === "forgot") {
    return (
      <div className="container flex min-h-[calc(100vh-5rem)] items-center justify-center py-12">
        <Card className="w-full max-w-md rounded-2xl border-2 border-primary/20 shadow-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Email envoyé</CardTitle>
            <CardDescription>
              Vérifiez votre boîte de réception pour le lien de réinitialisation.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/login">Retour à la connexion</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (isSuccess && mode === "reset") {
    return (
      <div className="container flex min-h-[calc(100vh-5rem)] items-center justify-center py-12">
        <Card className="w-full max-w-md rounded-2xl border-2 border-primary/20 shadow-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Succès !</CardTitle>
            <CardDescription>
              Votre mot de passe a été mis à jour. Redirection vers la connexion...
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/login">Se connecter maintenant</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container flex min-h-[calc(100vh-5rem)] items-center justify-center py-12">
      <Card className="w-full max-w-md rounded-2xl border-2 border-primary/20 shadow-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle>
            <h1 className="text-4xl font-bold text-primary">Gestiloc</h1>
          </CardTitle>
          <CardDescription>Tout votre immobilier au même endroit</CardDescription>
          <h2 className="text-lg font-semibold text-foreground pt-4">
            {mode === "forgot" ? "Mot de passe perdu ?" : "Définir un nouveau mot de passe"}
          </h2>
        </CardHeader>

        <form
          onSubmit={
            mode === "forgot"
              ? forgotForm.handleSubmit(onForgotSubmit)
              : resetForm.handleSubmit(onResetSubmit)
          }
        >
          <CardContent className="space-y-5">
            {mode === "forgot" ? (
              <div className="space-y-1">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <AtSign className="h-4 w-4" />
                  </span>
                  <Input
                    type="email"
                    placeholder="Votre email"
                    {...forgotForm.register("email")}
                    className={cn(
                      inputBaseClass,
                      forgotForm.formState.errors.email && "border-destructive"
                    )}
                  />
                </div>
                {forgotForm.formState.errors.email && (
                  <p className="text-xs text-destructive">
                    {forgotForm.formState.errors.email.message}
                  </p>
                )}
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Lock className="h-4 w-4" />
                    </span>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Nouveau mot de passe"
                      {...resetForm.register("password")}
                      className={cn(
                        inputBaseClass,
                        "pr-10",
                        resetForm.formState.errors.password && "border-destructive"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {resetForm.formState.errors.password && (
                    <p className="text-xs text-destructive">
                      {resetForm.formState.errors.password.message}
                    </p>
                  )}

                  {/* Password requirements helper */}
                  <div className="mt-3 space-y-2 rounded-xl bg-muted/40 p-4 text-[11px] text-muted-foreground border border-border/50">
                    <div className="flex items-center gap-2 font-bold text-foreground/80 mb-2 uppercase tracking-tight">
                      <Info className="h-3.5 w-3.5 text-primary" />
                      <span>Format requis pour le mot de passe :</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <div className="flex items-center gap-2">
                        <div className={cn("h-1.5 w-1.5 rounded-full", resetForm.watch("password").length >= 8 ? "bg-primary shadow-[0_0_8px_rgba(131,199,87,0.6)]" : "bg-muted-foreground/30")} />
                        <span className={cn(resetForm.watch("password").length >= 8 && "text-primary font-medium")}>8+ caractères</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={cn("h-1.5 w-1.5 rounded-full", /[A-Z]/.test(resetForm.watch("password")) ? "bg-primary shadow-[0_0_8px_rgba(131,199,87,0.6)]" : "bg-muted-foreground/30")} />
                        <span className={cn(/[A-Z]/.test(resetForm.watch("password")) && "text-primary font-medium")}>1 Majuscule</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={cn("h-1.5 w-1.5 rounded-full", /[a-z]/.test(resetForm.watch("password")) ? "bg-primary shadow-[0_0_8px_rgba(131,199,87,0.6)]" : "bg-muted-foreground/30")} />
                        <span className={cn(/[a-z]/.test(resetForm.watch("password")) && "text-primary font-medium")}>1 Minuscule</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={cn("h-1.5 w-1.5 rounded-full", /[0-9]/.test(resetForm.watch("password")) ? "bg-primary shadow-[0_0_8px_rgba(131,199,87,0.6)]" : "bg-muted-foreground/30")} />
                        <span className={cn(/[0-9]/.test(resetForm.watch("password")) && "text-primary font-medium")}>1 Chiffre</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={cn("h-1.5 w-1.5 rounded-full", /[^a-zA-Z0-9]/.test(resetForm.watch("password")) ? "bg-primary shadow-[0_0_8px_rgba(131,199,87,0.6)]" : "bg-muted-foreground/30")} />
                        <span className={cn(/[^a-zA-Z0-9]/.test(resetForm.watch("password")) && "text-primary font-medium")}>1 Spécial</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Lock className="h-4 w-4" />
                    </span>
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirmer le mot de passe"
                      {...resetForm.register("confirmPassword")}
                      className={cn(
                        inputBaseClass,
                        "pr-10",
                        resetForm.formState.errors.confirmPassword && "border-destructive"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {resetForm.formState.errors.confirmPassword && (
                    <p className="text-xs text-destructive">
                      {resetForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pt-0">
            <Button
              type="submit"
              className="w-full rounded-lg font-medium shadow-sm bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? "Traitement..." : mode === "forgot" ? "Envoyer le lien" : "Mettre à jour"}
            </Button>

            <Link
              to="/login"
              className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à la connexion
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
