import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Message {
  id: number;
  text: string;
  sender: "user" | "support";
  timestamp: Date;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Bonjour ! Bienvenue sur GestiLoc. Notre équipe Innovtech est là pour vous aider. Comment puis-je vous assister aujourd'hui ?",
      sender: "support",
      timestamp: new Date(),
    },
  ]);

  const handleSend = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      text: message,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    const userQuestion = message.toLowerCase().trim();
    setMessage("");

    // Simulate intelligent support responses based on keywords
    setTimeout(() => {
      let responseText = "";
      
      // Salutations
      if (userQuestion.match(/^(bonjour|salut|bonsoir|hello|hey|hi|coucou)$/)) {
        responseText = "Bonjour ! 👋 Comment puis-je vous aider avec GestiLoc aujourd'hui ?";
      }
      // Remerciements
      else if (userQuestion.match(/merci|thanks|thank you/)) {
        responseText = "Je vous en prie ! N'hésitez pas si vous avez d'autres questions. L'équipe Innovtech est toujours là pour vous accompagner. 😊";
      }
      // Questions sur les fonctionnalités générales
      else if (userQuestion.match(/comment ça marche|comment ça fonctionne|fonctionnalit|que fait|qu'est-ce que|c'est quoi/)) {
        responseText = "GestiLoc simplifie la gestion locative au Bénin : suivi des loyers, gestion des locataires et biens, paiements Mobile Money, relances automatiques. Consultez notre page 'Fonctionnalités' pour en savoir plus !";
      }
      // Compte et inscription
      else if (userQuestion.match(/compte|inscription|s'inscrire|créer un compte|enregistr|sign up/)) {
        responseText = "Pour créer un compte sur GestiLoc, cliquez sur 'Inscription' en haut à droite. En tant que propriétaire, vous pourrez ensuite ajouter vos locataires. Consultez notre Centre d'aide > Comptes & Profils pour plus de détails.";
      }
      // Connexion
      else if (userQuestion.match(/connexion|connecter|se connecter|login|mot de passe oublié/)) {
        responseText = "Vous pouvez vous connecter via le bouton 'Connexion'. En cas d'oubli de mot de passe, utilisez 'Mot de passe oublié' pour le réinitialiser. Besoin d'aide ? Consultez notre Centre d'aide > Comptes & Profils.";
      }
      // Paiements et Mobile Money
      else if (userQuestion.match(/paiement|payer|mobile money|mtn|moov|transaction|fcfa|argent/)) {
        responseText = "GestiLoc supporte les paiements Mobile Money (MTN, Moov) pour enregistrer facilement les loyers de vos locataires. Consultez notre Centre d'aide > Paiements & Loyers pour savoir comment enregistrer un paiement.";
      }
      // Biens et propriétés
      else if (userQuestion.match(/bien|propriété|maison|appartement|ajouter un bien|mes biens|immeuble/)) {
        responseText = "Pour ajouter un bien, accédez à 'Mes biens' puis 'Ajouter un bien' dans votre tableau de bord. Vous pourrez gérer toutes vos propriétés depuis cet espace. Guide détaillé : Centre d'aide > Gestion des biens.";
      }
      // Locataires et baux
      else if (userQuestion.match(/locataire|bail|contrat|loyer|gérer locataire|ajouter locataire/)) {
        responseText = "Vous pouvez gérer vos locataires, créer des baux et suivre les paiements de loyers depuis votre tableau de bord. En tant que propriétaire, vous inscrivez vos locataires dans le système. Plus d'infos : Centre d'aide > Baux & Locataires.";
      }
      // Prix et tarifs
      else if (userQuestion.match(/prix|tarif|coût|combien|abonnement|gratuit|essai/)) {
        responseText = "GestiLoc propose plusieurs formules adaptées à vos besoins. Consultez notre page 'Tarifs' pour découvrir les détails de chaque offre. Un essai gratuit est disponible !";
      }
      // Innovtech
      else if (userQuestion.match(/innovtech|qui a créé|développeur|créateur|qui êtes-vous|entreprise/)) {
        responseText = "GestiLoc est développé avec passion par Innovtech, votre partenaire technologique pour la gestion locative au Bénin. Nous sommes là pour moderniser et simplifier votre gestion. 🚀";
      }
      // Contact
      else if (userQuestion.match(/contact|téléphone|email|adresse|joindre|appeler/)) {
        responseText = "Vous pouvez nous contacter via notre page 'Contact' ou directement ici dans le chat. Notre équipe Innovtech à Cotonou est disponible pour vous répondre rapidement !";
      }
      // Aide et support
      else if (userQuestion.match(/aide|help|support|assistance|question|problème|bug|erreur/)) {
        responseText = "Notre Centre d'aide regroupe des articles détaillés sur toutes les fonctionnalités de GestiLoc. Vous pouvez aussi poser vos questions ici, l'équipe support Innovtech vous répond sous 5 minutes ! 💬";
      }
      // Démo
      else if (userQuestion.match(/démo|demo|essayer|tester|voir|exemple/)) {
        responseText = "Vous pouvez tester GestiLoc gratuitement ! Consultez notre page 'Démo' pour découvrir l'interface en action, ou créez un compte pour un essai complet.";
      }
      // FAQ
      else if (userQuestion.match(/faq|questions fréquentes|questions courantes/)) {
        responseText = "Consultez notre FAQ pour trouver des réponses aux questions les plus courantes. Si vous ne trouvez pas votre réponse, je suis là pour vous aider !";
      }
      // Default response
      else {
        responseText = "Merci pour votre message ! Je peux vous renseigner sur les fonctionnalités de GestiLoc, les tarifs, la création de compte, les paiements Mobile Money, etc. Quelle information recherchez-vous ? 🤔";
      }
      
      const supportMessage: Message = {
        id: messages.length + 2,
        text: responseText,
        sender: "support",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, supportMessage]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="flex flex-col bg-background border border-border rounded-2xl shadow-2xl w-[380px] h-[580px]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-primary rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-10 w-10 border-2 border-primary-foreground">
                  <AvatarFallback className="bg-primary-light text-primary-foreground">
                    GL
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-primary"></div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-primary-foreground">
                  Support GestiLoc
                </h3>
                <p className="text-xs text-primary-foreground/80">Innovtech • En ligne</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      {msg.timestamp.toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                placeholder="Écrivez votre message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                className="flex-1"
              />
              <Button size="icon" onClick={handleSend} className="bg-primary hover:bg-primary/90">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Nous répondons généralement en moins de 5 minutes
            </p>
          </div>
        </div>
      ) : (
        <Button
          size="lg"
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 hover:scale-110 transition-transform"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
