import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function VerifyEmail() {
  const [isResending, setIsResending] = useState(false);

  const handleResend = () => {
    setIsResending(true);
    setTimeout(() => {
      setIsResending(false);
      toast.success("Email renvoyé avec succès !");
    }, 1000);
  };

  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Vérifiez votre email</CardTitle>
          <CardDescription>
            Une dernière étape pour sécuriser votre compte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Nous avons envoyé un email de confirmation à votre adresse. Cliquez sur le lien dans l'email pour activer votre compte.
            </AlertDescription>
          </Alert>
          <p className="text-sm text-muted-foreground text-center">
            Vous n'avez pas reçu l'email ? Vérifiez vos spams ou demandez un nouveau lien.
          </p>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleResend}
            variant="outline"
            className="w-full"
            disabled={isResending}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isResending ? "animate-spin" : ""}`} />
            {isResending ? "Envoi..." : "Renvoyer l'email"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
