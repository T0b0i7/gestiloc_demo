import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState } from "react";
import { contractService, RentalContractData } from "@/services/api";
import { toast } from "@/components/ui/use-toast";

interface DownloadContractButtonProps {
  contractData: RentalContractData;
  buttonText?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon" | null | undefined;
  className?: string;
}

export function DownloadContractButton({
  contractData,
  buttonText = "Télécharger le contrat",
  variant = "default",
  size = "default",
  className = "",
}: DownloadContractButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsLoading(true);
      
      // Générer le PDF
      const pdfBlob = await contractService.generateRentalContract(contractData);
      
      // Télécharger le PDF
      const today = new Date().toISOString().split('T')[0];
      contractService.downloadBlob(
        pdfBlob, 
        `contrat-location-${today}.pdf`
      );
      
      toast({
        title: "Contrat téléchargé",
        description: "Le contrat a été généré avec succès.",
      });
    } catch (error) {
      console.error("Erreur lors de la génération du contrat:", error);
      
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération du contrat.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={className}
    >
      {isLoading ? (
        <span>Génération en cours...</span>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          {buttonText}
        </>
      )}
    </Button>
  );
}
