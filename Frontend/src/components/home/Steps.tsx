import React from "react";
import { Building2, UserPlus, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";

type StepVariant = "property" | "tenant" | "rental";

const steps = [
  {
    id: "01",
    icon: Building2,
    title: "Créer un bien",
    subtitle: "Maison, Appartement, Parking",
    description:
      "Créez la fiche détaillée de votre bien. Adresse, surface, équipements, charges… tout est centralisé.",
    variant: "property" as StepVariant,
  },
  {
    id: "02",
    icon: UserPlus,
    title: "Créer un locataire",
    subtitle: "Locataires et colocataires",
    description:
      "Renseignez les informations de vos locataires : coordonnées, garants, pièces justificatives, etc.",
    variant: "tenant" as StepVariant,
  },
  {
    id: "03",
    icon: FileText,
    title: "Créer une location",
    subtitle: "Contrat de location",
    description:
      "Reliez votre bien et vos locataires, définissez le loyer, les charges et générez votre bail.",
    variant: "rental" as StepVariant,
  },
];

function StepFormCard({ variant }: { variant: StepVariant }) {
  return (
    <div className="h-full rounded-3xl bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-5 md:p-6 flex items-center justify-center">
      <div className="w-full max-w-md rounded-lg shadow-xl bg-white border border-gray-200 flex flex-col">
        {/* Header */}
        <div className="px-5 py-3 border-b border-gray-200 bg-white flex items-center justify-between flex-shrink-0">
          <h3 className="text-sm font-semibold text-gray-900">Nouveau document</h3>
          <button className="text-gray-400 hover:text-gray-600 text-lg font-light">×</button>
        </div>
        
        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-xs" style={{scrollbarWidth: 'thin', scrollbarColor: '#3b82f6 #dbeafe'}}>
          <style>{`
            div::-webkit-scrollbar { width: 10px; }
            div::-webkit-scrollbar-track { background: #dbeafe; border-radius: 5px; }
            div::-webkit-scrollbar-thumb { background: #3b82f6; border-radius: 5px; }
            div::-webkit-scrollbar-thumb:hover { background: #1e40af; }
          `}</style>

          {/* Document Section - Buttons */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Document <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              <button className="flex-1 border border-gray-300 bg-white rounded-md px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1">
                📄 Nouveau
              </button>
              <button className="flex-1 border border-gray-300 bg-white rounded-md px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1">
                📋 Déjà existant
              </button>
            </div>
          </div>

          {/* Type Section */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Type <span className="text-red-500">*</span></label>
            <select title="Type" className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary">
              <option>Choisir</option>
              <option>Bail</option>
              <option>Justificatif</option>
              <option>Autre</option>
            </select>
          </div>

          {/* File Section */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Fichier <span className="text-red-500">*</span></label>
            <div className="border border-dashed border-gray-300 rounded-md p-3 bg-gray-50 text-center">
              <input type="file" title="Sélectionner un fichier" className="w-full text-xs" />
              <p className="text-xs text-gray-600 mt-1.5">Formats acceptés: Word, Excel, PDF, Images (GIF, JPG, PNG). Taille maximale: 15 Mo</p>
            </div>
          </div>

          {/* Description Section */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Description</label>
            <textarea placeholder="Description du document" rows={3} className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary resize-none"></textarea>
          </div>

          {/* Partage Section */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Partage</label>
            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-md border border-gray-200">
              <button className="flex-shrink-0 bg-red-500 hover:bg-red-600 text-white rounded-md px-2 py-1 text-xs font-bold">
                ✕
              </button>
              <p className="text-xs text-gray-700 flex-1">Partager le document avec votre locataire</p>
            </div>
          </div>
        </div>

        {/* Footer - Buttons */}
        <div className="px-5 py-3 border-t border-gray-200 bg-white flex items-center justify-end gap-2 flex-shrink-0">
          <button className="text-gray-700 hover:text-gray-900 text-xs font-medium px-4 py-1.5">Annuler</button>
          <button className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-4 py-1.5 rounded">Sauvegarder</button>
        </div>
      </div>
    </div>
  );
}

/* -------- Reveal : apparition au scroll (fade + slide-up) ---------- */

function Reveal({
  children,
  delay = "0s",
}: {
  children: React.ReactNode;
  delay?: string;
}) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={[
      "reveal-element",
      "transition-all duration-700 ease-out",
      visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
      ].join(" ")}
      style={{ "--transition-delay": delay } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

export function Steps() {
  return (
    <>
      {/* Animations champs + bouton */}
      <style>{`
        @keyframes fieldFill {
          0%   { transform: scaleX(0); opacity: 0; }
          15%  { opacity: 0.45; }
          40%  { transform: scaleX(1); opacity: 0.6; }
          65%  { transform: scaleX(1); opacity: 0.2; }
          90%  { transform: scaleX(0); opacity: 0; }
          100% { transform: scaleX(0); opacity: 0; }
        }
        .step-field {
          overflow: hidden;
        }
        .step-field-bar {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            rgba(59,130,246,0.05),
            rgba(30,64,175,0.18),
            rgba(59,130,246,0.05)
          );
          transform-origin: left;
          transform: scaleX(0);
          animation: fieldFill 3s ease-in-out infinite;
        }

        @keyframes buttonPulseClick {
          0%   { transform: scale(1); box-shadow: 0 0 0 0 rgba(59,130,246,0); }
          30%  { transform: scale(1.07); box-shadow: 0 0 0 8px rgba(30,64,175,0.18); }
          45%  { transform: scale(0.97); box-shadow: 0 0 0 3px rgba(30,64,175,0.12); }
          60%  { transform: scale(1.04); box-shadow: 0 0 0 6px rgba(30,64,175,0.14); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59,130,246,0); }
        }
        .step-submit-btn {
          animation: buttonPulseClick 3s ease-in-out infinite;
        }

        .reveal-element {
          --transition-delay: 0s;
          animation-delay: var(--transition-delay);
        }
      `}</style>

      <section className="container py-16 md:py-24">
        {/* Titre */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            Comment ça marche&nbsp;?
          </h2>
          <p className="text-lg text-muted-foreground">Simple comme 1, 2, 3</p>
        </div>

        <div className="space-y-10 md:space-y-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isEven = index % 2 === 1;
            const textColOrder = isEven ? "md:order-2" : "md:order-1";
            const formColOrder = isEven ? "md:order-1" : "md:order-2";

            return (
              <Reveal key={step.id} delay={`${index * 0.15}s`}>
                <div className="grid gap-6 md:gap-10 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] items-stretch">
                  {/* Carte texte style Rentila */}
                  <div
                    className={`rounded-3xl bg-muted/60 px-6 py-8 md:px-10 md:py-10 ${textColOrder}`}
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-semibold">
                        {step.id}
                      </div>
                      <h3 className="text-2xl md:text-3xl font-semibold">
                        {step.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3 mb-4 text-base font-medium">
                      <Icon className="h-5 w-5 text-primary" />
                      <span>{step.subtitle}</span>
                    </div>

                    <p className="text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Carte formulaire animée avec fond bleu */}
                  <div className={formColOrder}>
                    <StepFormCard variant={step.variant} />
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>
    </>
  );
}
