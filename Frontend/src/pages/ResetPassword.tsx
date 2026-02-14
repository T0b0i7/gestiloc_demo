import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AtSign, ArrowLeft } from "lucide-react";
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

// Un seul champ : email pour recevoir le lien de réinitialisation
const resetPasswordSchema = z.object({
  email: z.string().email("Email invalide"),
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const inputBaseClass =
  "h-11 rounded-lg border border-border bg-muted/50 pl-10 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary";

export default function ResetPassword() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    try {
      // TODO: appeler l'API d'envoi du lien de réinitialisation (ex. authService.forgotPassword(data.email))
      await new Promise((r) => setTimeout(r, 1000));
      toast.success(
        "Un lien de réinitialisation a été envoyé à votre adresse email.",
      );
    } catch {
      toast.error("Une erreur est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex min-h-[calc(100vh-5rem)] items-center justify-center py-12">
      <Card className="w-full max-w-md rounded-2xl border-2 border-primary/20 shadow-md">
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

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-5">
            <h2 className="text-center text-lg font-semibold text-foreground">
              Mot de passe perdu ?
            </h2>

            <div className="space-y-1">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <AtSign className="h-4 w-4" />
                </span>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  {...register("email")}
                  aria-invalid={errors.email ? "true" : "false"}
                  className={cn(
                    inputBaseClass,
                    errors.email &&
                      "border-destructive focus-visible:ring-destructive",
                  )}
                />
              </div>
              {errors.email?.message && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pt-0">
            <Button
              type="submit"
              className="w-full rounded-lg font-medium shadow-sm bg-primary-light text-primary-foreground hover:bg-primary-light/90"
              disabled={isLoading}
            >
              {isLoading ? "Envoi..." : "Envoyer"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Pas de compte ?{" "}
              <Link
                to="/register"
                className="font-medium text-primary hover:underline"
              >
                Cliquez ici
              </Link>
            </p>

            <Link
              to="/"
              className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à l&apos;accueil
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
