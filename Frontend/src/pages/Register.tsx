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
  socialReason?: string;
  ifu?: string;
  rccm?: string;
  agencyAddress?: string;
  personalAddress?: string;
};

const isNonTenant = (userType: UserType) => userType !== "locataire";

const registerSchema = z
  .object({
    userType: z.enum(["proprietaire", "agence", "locataire"], {
      required_error: "Veuillez sélectionner un type d'utilisateur",
    }),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email("Email invalide").toLowerCase().optional(),
    phone: z.string().min(1, "Le téléphone est requis").optional(),
    city: z.string().optional(),
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .regex(/[a-z]/, "Le mot de passe doit contenir au moins une lettre minuscule")
      .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une lettre majuscule")
      .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
      .regex(/[@$!%*?&]/, "Le mot de passe doit contenir au moins un caractère spécial (@$!%*?&)")
      .optional(),
    confirmPassword: z.string().optional(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "Vous devez accepter les conditions d'utilisation",
    }),
    rememberMe: z.boolean().optional(),
    socialReason: z.string().optional(),
    ifu: z.string().optional(),
    rccm: z.string().optional(),
    agencyAddress: z.string().optional(),
    personalAddress: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.userType === "proprietaire" || data.userType === "agence") {
        return !!data.firstName && data.firstName.length >= 2;
      }
      return true;
    },
    { message: "Le prénom est requis", path: ["firstName"] }
  )
  .refine(
    (data) => {
      if (data.userType === "proprietaire" || data.userType === "agence") {
        return !!data.lastName && data.lastName.length >= 2;
      }
      return true;
    },
    { message: "Le nom est requis", path: ["lastName"] }
  )
  .refine(
    (data) => {
      if (data.userType === "agence") {
        return !!data.socialReason && data.socialReason.length >= 2;
      }
      return true;
    },
    { message: "La raison sociale est requise", path: ["socialReason"] }
  )
  .refine(
    (data) => {
      if (data.userType === "proprietaire" || data.userType === "agence") {
        return (
          !!data.password &&
          data.password === data.confirmPassword
        );
      }
      return true;
    },
    {
      message: "Les mots de passe ne correspondent pas",
      path: ["confirmPassword"],
    }
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
  label: string;
  placeholder: string;
  type?: string;
  error?: { message?: string };
  register: UseFormRegister<RegisterFormData>;
  fieldName: keyof RegisterFormData;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
  required?: boolean;
}

const inputBaseClass =
  "bg-muted/50 border-border rounded-lg focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary h-11 min-h-[44px]";

const FormField = ({
  label,
  placeholder,
  type = "text",
  error,
  register,
  fieldName,
  leftIcon,
  rightIcon,
  onRightIconClick,
  required,
}: FormFieldProps) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-semibold text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </Label>
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
          leftIcon && (fieldName === "phone" ? "pl-20" : "pl-10"),
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
      <p className="text-sm text-destructive font-bold">{error.message}</p>
    )}
    {fieldName === "password" && (
      <div className="pt-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100 space-y-2">
        <p className="text-xs text-blue-800 font-extrabold flex items-center gap-1.5">
          <AtSign size={12} /> Format du mot de passe requis :
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            <p className="text-[11px] text-blue-900 font-bold">8 caractères min.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            <p className="text-[11px] text-blue-900 font-bold">1 Chiffre (0-9)</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            <p className="text-[11px] text-blue-900 font-bold">1 Majuscule (A-Z)</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            <p className="text-[11px] text-blue-900 font-bold">1 Minuscule (a-z)</p>
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            <p className="text-[11px] text-blue-900 font-bold">1 Caractère spécial (@$!%*?&)</p>
          </div>
        </div>
      </div>
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
    social_reason: data.socialReason || "",
    ifu: data.ifu || "",
    rccm: data.rccm || "",
    agency_address: data.agencyAddress || "",
    personal_address: data.personalAddress || "",
  });

  const errorTranslations: Record<string, string> = {
    "The password field format is invalid.": "Le format du mot de passe est invalide. Assurez-vous d'inclure une majuscule, une minuscule, un chiffre et un caractère spécial.",
    "The email has already been taken.": "Cet e-mail est déjà utilisé.",
    "The phone has already been taken.": "Ce numéro de téléphone est déjà utilisé.",
    "The password confirmation does not match.": "La confirmation du mot de passe ne correspond pas.",
    "These credentials do not match our records.": "Ces identifiants ne correspondent pas à nos enregistrements.",
    "There is no role named `landlord` for guard `web`.": "Une erreur de configuration serveur est survenue (Rôle manquant). Veuillez contacter le support.",
    "There is no role named `co_owner` for guard `web`.": "Une erreur de configuration serveur est survenue (Rôle manquant). Veuillez contacter le support.",
  };

  const getErrorMessage = (error: unknown): string => {
    const apiError = error as {
      response?: {
        data?: { errors?: Record<string, string[]>; message?: string };
      };
      message?: string;
    };

    if (apiError.response?.data?.errors) {
      const messages = Object.values(apiError.response.data.errors).flat();
      return messages.map(m => errorTranslations[m] || m).join("\n");
    }

    const mainMessage = apiError.response?.data?.message || apiError.message || "";
    if (mainMessage && errorTranslations[mainMessage]) {
      return errorTranslations[mainMessage];
    }

    return mainMessage || "Une erreur est survenue lors de l'inscription";
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
            Tout votre immobilier au même endroit
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

              {/* Formulaire pour Agences */}
              {userType === "agence" && (
                <div className="space-y-5 border-t border-border pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="Prénom du représentant"
                      placeholder="Prénom"
                      register={register}
                      fieldName="firstName"
                      error={errors.firstName}
                      required
                    />
                    <FormField
                      label="Nom du représentant"
                      placeholder="Nom"
                      register={register}
                      fieldName="lastName"
                      error={errors.lastName}
                      required
                    />
                  </div>

                  <FormField
                    label="Raison sociale"
                    placeholder="Nom de l'agence ou entreprise"
                    register={register}
                    fieldName="socialReason"
                    error={errors.socialReason}
                    required
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="IFU"
                      placeholder="Numéro IFU"
                      register={register}
                      fieldName="ifu"
                      error={errors.ifu}
                    />
                    <FormField
                      label="RCCM"
                      placeholder="Numéro RCCM"
                      register={register}
                      fieldName="rccm"
                      error={errors.rccm}
                    />
                  </div>

                  <FormField
                    label="Email professionnel"
                    placeholder="Email"
                    type="email"
                    register={register}
                    fieldName="email"
                    error={errors.email}
                    leftIcon={<AtSign className="h-4 w-4" />}
                    required
                  />

                  <FormField
                    label="Téléphone"
                    placeholder="00 00 00 00"
                    type="tel"
                    register={register}
                    fieldName="phone"
                    error={errors.phone}
                    required
                    leftIcon={<span className="flex items-center gap-1.5 text-sm font-bold text-gray-600 pl-1">🇧🇯 +229</span>}
                  />

                  <FormField
                    label="Adresse de l'agence"
                    placeholder="Ex: Cotonou, Haie Vive..."
                    register={register}
                    fieldName="agencyAddress"
                    error={errors.agencyAddress}
                  />

                  <FormField
                    label="Mot de passe"
                    placeholder="********"
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
                    required
                  />

                  <FormField
                    label="Confirmer le mot de passe"
                    placeholder="********"
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
                    required
                  />
                </div>
              )}

              {/* Formulaire pour Propriétaires */}
              {userType === "proprietaire" && (
                <div className="space-y-5 border-t border-border pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="Prénom"
                      placeholder="Prénom"
                      register={register}
                      fieldName="firstName"
                      error={errors.firstName}
                      required
                    />
                    <FormField
                      label="Nom"
                      placeholder="Nom"
                      register={register}
                      fieldName="lastName"
                      error={errors.lastName}
                      required
                    />
                  </div>

                  <FormField
                    label="Email personnel"
                    placeholder="Email"
                    type="email"
                    register={register}
                    fieldName="email"
                    error={errors.email}
                    leftIcon={<AtSign className="h-4 w-4" />}
                    required
                  />

                  <FormField
                    label="Téléphone"
                    placeholder="00 00 00 00"
                    type="tel"
                    register={register}
                    fieldName="phone"
                    error={errors.phone}
                    required
                    leftIcon={<span className="flex items-center gap-1.5 text-sm font-bold text-gray-600 pl-1">🇧🇯 +229</span>}
                  />

                  <FormField
                    label="Adresse personnelle"
                    placeholder="Ex: Cotonou, Akpakpa..."
                    register={register}
                    fieldName="personalAddress"
                    error={errors.personalAddress}
                  />

                  <FormField
                    label="Mot de passe"
                    placeholder="********"
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
                    required
                  />

                  <FormField
                    label="Confirmer le mot de passe"
                    placeholder="********"
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
                    required
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
                  <p className="text-sm text-destructive font-medium">
                    {errors.acceptTerms.message}
                  </p>
                )}

                {!isTenant && (
                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all mt-4"
                    disabled={isLoading}
                  >
                    {isLoading ? "Création du compte..." : "Créer mon compte"}
                  </Button>
                )}

                {isTenant && (
                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all mt-4"
                  >
                    Comprendre le processus
                  </Button>
                )}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pt-0">
            <p className="text-center text-sm text-muted-foreground w-full">
              Déjà un compte ?{" "}
              <Link
                to="/login"
                className="font-bold text-primary hover:underline"
              >
                Se connecter
              </Link>
            </p>

            <div className="pt-6 border-t border-border w-full text-center space-y-4">
              <p className="text-center text-xs text-muted-foreground px-4">
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
              </p>

              <Link to="/" className="text-gray-500 underline text-xs block pt-2">
                <ArrowLeft className="h-3 w-3 inline-block mr-1" /> Retour à l'accueil
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
