import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, Controller, Control, FieldErrors, UseFormWatch, UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AtSign, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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

type UserType = "proprietaire" | "agence" | "locataire";

type RegisterFormData = {
  userType: UserType;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  city?: string;
  password?: string;
  confirmPassword?: string;
  acceptTerms: boolean;
  rememberMe?: boolean;
};

const isNonTenant = (userType: UserType) => userType !== "locataire";

const registerSchema = z
  .object({
    userType: z.enum(["proprietaire", "agence", "locataire"], {
      required_error: "Veuillez sélectionner un type d'utilisateur",
    }),
    firstName: z
      .string()
      .min(2, "Le prénom doit contenir au moins 2 caractères")
      .optional(),
    lastName: z
      .string()
      .min(2, "Le nom doit contenir au moins 2 caractères")
      .optional(),
    email: z.string().email("Email invalide").toLowerCase().optional(),
    phone: z.string().min(1, "Le téléphone est requis").optional(),
    city: z.string().optional(),
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .optional(),
    confirmPassword: z.string().optional(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "Vous devez accepter les conditions d'utilisation",
    }),
    rememberMe: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (isNonTenant(data.userType)) {
        return data.firstName && data.firstName.length >= 2;
      }
      return true;
    },
    {
      message: "Le prénom est requis",
      path: ["firstName"],
    },
  )
  .refine(
    (data) => {
      if (isNonTenant(data.userType)) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: "Les mots de passe ne correspondent pas",
      path: ["confirmPassword"],
    },
  );

interface UserTypeSelectorProps {
  control: Control<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
  watch: UseFormWatch<RegisterFormData>;
}

const userTypeOptions: { label: string; value: UserType }[] = [
  { label: "Je suis propriétaire", value: "proprietaire" },
  { label: "Je suis agence ou entreprise", value: "agence" },
  { label: "Je suis locataire", value: "locataire" },
];

const UserTypeSelector = ({
  control,
  errors,
  watch,
}: UserTypeSelectorProps) => {
  const userType = watch("userType");

  return (
    <div className="space-y-3">
      <Controller
        name="userType"
        control={control}
        render={({ field }) => (
          <RadioGroup
            value={field.value}
            onValueChange={field.onChange}
            className="grid gap-3"
          >
            {userTypeOptions.map(({ label, value }) => (
              <div
                key={value}
                className={cn(
                  "flex items-center space-x-3 rounded-lg py-2",
                  userType === value ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <RadioGroupItem
                  value={value}
                  id={`userType-${value}`}
                  className={cn(
                    "h-5 w-5 border-2 transition-colors",
                    userType === value
                      ? "border-primary text-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                      : "border-muted-foreground/50"
                  )}
                />
                <Label
                  htmlFor={`userType-${value}`}
                  className="flex-1 cursor-pointer text-sm font-medium"
                >
                  {label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}
      />
      {errors.userType?.message && (
        <p className="text-sm text-destructive">{errors.userType.message}</p>
      )}
    </div>
  );
};

interface FormFieldProps {
  placeholder: string;
  type?: string;
  error?: { message?: string };
  register: UseFormRegister<RegisterFormData>;
  fieldName: keyof RegisterFormData;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
}

const inputBaseClass =
  "bg-muted/50 border-border rounded-lg focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary h-11 min-h-[44px]";

const FormField = ({
  placeholder,
  type = "text",
  error,
  register,
  fieldName,
  leftIcon,
  rightIcon,
  onRightIconClick,
}: FormFieldProps) => (
  <div className="space-y-1">
    <div className="relative flex items-center">
      {leftIcon && (
        <span className="pointer-events-none absolute left-3 text-muted-foreground">
          {leftIcon}
        </span>
      )}
      <Input
        placeholder={placeholder}
        type={type}
        {...register(fieldName)}
        aria-invalid={error ? "true" : "false"}
        className={cn(
          inputBaseClass,
          error && "border-destructive focus-visible:ring-destructive",
          leftIcon && "pl-10",
          rightIcon && "pr-10"
        )}
      />
      {rightIcon && (
        <button
          type="button"
          tabIndex={-1}
          onClick={onRightIconClick}
          className="absolute right-3 text-muted-foreground hover:text-foreground"
          aria-label={type === "password" ? "Afficher le mot de passe" : "Masquer le mot de passe"}
        >
          {rightIcon}
        </button>
      )}
    </div>
    {error?.message && (
      <p className="text-sm text-destructive">{error.message}</p>
    )}
  </div>
);

export default function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      userType: "locataire",
      acceptTerms: false,
      rememberMe: false,
    },
  });

  const userType = watch("userType");
  const isTenant = userType === "locataire";

  const mapFormDataToApi = (data: RegisterFormData) => ({
    first_name: data.firstName || "",
    last_name: data.lastName || "",
    email: data.email?.toLowerCase() || "",
    phone: data.phone || "",
    city: data.city || "",
    password: data.password || "",
    password_confirmation: data.confirmPassword || "",
    role: data.userType,
    accept_terms: data.acceptTerms,
  });

  const getErrorMessage = (error: unknown): string => {
    const apiError = error as {
      response?: {
        data?: { errors?: Record<string, string[]>; message?: string };
      };
      message?: string;
    };

    if (apiError.response?.data?.errors) {
      return Object.values(apiError.response.data.errors).flat().join("\n");
    }
    if (apiError.response?.data?.message) {
      return apiError.response.data.message;
    }
    if (apiError.message) {
      return apiError.message;
    }
    return "Une erreur est survenue lors de l'inscription";
  };

  const onSubmit = async (data: RegisterFormData) => {
    // Empêcher la création de compte pour les locataires
    if (data.userType === "locataire") {
      toast.info(
        "Les locataires doivent être invités par leur bailleur. Merci de contacter votre propriétaire pour recevoir une invitation."
      );
      return;
    }

    try {
      setIsLoading(true);

      const userData = mapFormDataToApi(data);
      const response = await authService.register(userData);

      if (response?.status === "success" || response?.data?.token) {
        toast.success(
          "Compte créé avec succès ! Vous allez être redirigé vers la page de connexion.",
        );
        setTimeout(() => navigate("/login"), 1500);
      } else {
        throw new Error(response?.message || "Erreur lors de l'inscription");
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex min-h-[calc(100vh-5rem)] items-center justify-center py-12">
      <Card className="w-full max-w-2xl rounded-2xl border-2 border-primary/1 ">
        <CardHeader className="space-y-1">
          <div className="text-center">
            <h1 className="text-primary text-4xl font-bold">Gestiloc</h1>
          </div>
          <CardTitle className="text-center text-lg font-semibold">
            Créer un compte
          </CardTitle>
          <CardDescription className="text-center">
            Créer de meilleures relations entre les propriétaires et les
            locataires !
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="w-full rounded-xl border-2 border-primary/50 bg-card p-4">
              <UserTypeSelector
                control={control}
                errors={errors}
                watch={watch}
              />

              {isTenant && (
                <div className="mt-4 text-center text-foreground">
                  <p className="font-medium">
                    Merci de demander à votre bailleur de vous inviter.
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Une fois l'invitation reçue par e-mail, suivez le lien pour
                    confirmer votre inscription.
                  </p>
                </div>
              )}

              {/* Formulaire pour propriétaires et agences */}
              {!isTenant && (
                <div className="space-y-5 border-t border-border pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      placeholder="Prénom"
                      register={register}
                      fieldName="firstName"
                      error={errors.firstName}
                    />
                    <FormField
                      placeholder="Nom"
                      register={register}
                      fieldName="lastName"
                      error={errors.lastName}
                    />
                  </div>

                  <FormField
                    placeholder="Email"
                    type="email"
                    register={register}
                    fieldName="email"
                    error={errors.email}
                    leftIcon={<AtSign className="h-4 w-4" />}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      placeholder="Téléphone"
                      type="tel"
                      register={register}
                      fieldName="phone"
                      error={errors.phone}
                    />
                    <FormField
                      placeholder="Ville"
                      register={register}
                      fieldName="city"
                      error={errors.city}
                    />
                  </div>

                  <FormField
                    placeholder="Mot de passe"
                    type={showPassword ? "text" : "password"}
                    register={register}
                    fieldName="password"
                    error={errors.password}
                    leftIcon={<Lock className="h-4 w-4" />}
                    rightIcon={
                      showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )
                    }
                    onRightIconClick={() => setShowPassword((v) => !v)}
                  />

                  <FormField
                    placeholder="Confirmer le mot de passe"
                    type={showConfirmPassword ? "text" : "password"}
                    register={register}
                    fieldName="confirmPassword"
                    error={errors.confirmPassword}
                    rightIcon={
                      showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )
                    }
                    onRightIconClick={() => setShowConfirmPassword((v) => !v)}
                  />
                </div>
              )}
              <br />
              {/* Checkboxes */}
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Controller
                    name="acceptTerms"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="terms"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label
                    htmlFor="terms"
                    className="cursor-pointer text-sm font-normal leading-relaxed text-foreground"
                  >
                    J'accepte les{" "}
                    <Link
                      to="/legal/terms"
                      className="text-primary hover:underline"
                    >
                      Conditions d'utilisation
                    </Link>{" "}
                    et la{" "}
                    <Link
                      to="/legal/privacy"
                      className="text-primary hover:underline"
                    >
                      Politique de confidentialité
                    </Link>
                  </Label>
                </div>
                {errors.acceptTerms && (
                  <p className="text-sm text-destructive">
                    {errors.acceptTerms.message}
                  </p>
                )}

                {/* Se souvenir de moi pour non-locataires */}
                {!isTenant && (
                  <div className="flex items-start space-x-2">
                    <Controller
                      name="rememberMe"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="remember"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label
                      htmlFor="remember"
                      className="text-sm font-normal leading-relaxed cursor-pointer"
                    >
                      Se souvenir de moi
                    </Label>
                  </div>
                )}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pt-0">
            <Button
              type="submit"
              className=" rounded-lg font-medium shadow-sm"
              disabled={isLoading}
            >
              {isTenant
                ? "Comprendre le processus"
                : isLoading
                  ? "Création..."
                  : "Créer mon compte"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Déjà un compte ?{" "}
              <Link
                to="/login"
                className="font-medium text-primary hover:underline"
              >
                Se connecter
              </Link>
            </p>

            <p className="border-t border-border pt-4 text-center text-xs text-muted-foreground">
              En vous inscrivant, vous reconnaissez avoir lu et accepté les{" "}
              <Link to="/legal/terms" className="text-primary hover:underline">
                Conditions d'utilisation
              </Link>{" "}
              et la{" "}
              <Link
                to="/legal/privacy"
                className="text-primary hover:underline"
              >
                Politique de Confidentialité
              </Link>
              .
              <br />
              <br />
              <Link to="/" className="text-gray-500 underline">
                <ArrowLeft className="h-4 w-4  inline-block" /> Retour à
                l'accueil
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
