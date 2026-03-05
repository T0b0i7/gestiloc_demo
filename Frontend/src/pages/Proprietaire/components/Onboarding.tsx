import React, { useState } from 'react';
import { CheckCircle2, Building, Users, FileText, ArrowRight, HelpCircle } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Tab } from '../types';

interface OnboardingProps {
  onNavigate: (tab: Tab) => void;
  notify: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onNavigate, notify }) => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const steps = [
    {
      id: 1,
      title: 'Créer un Bien',
      description: 'Créer la fiche de votre bien immobilier',
      icon: Building,
      action: () => {
        setCompletedSteps([...completedSteps, 1]);
        onNavigate('biens');
        notify('Accédez à la gestion de vos biens', 'info');
      }
    },
    {
      id: 2,
      title: 'Créer un Locataire',
      description: 'Créer la fiche descriptive de votre locataire',
      icon: Users,
      action: () => {
        setCompletedSteps([...completedSteps, 2]);
        onNavigate('locataires');
        notify('Accédez à la gestion de vos locataires', 'info');
      }
    },
    {
      id: 3,
      title: 'Créer une Location',
      description: 'Lier le bien immobilier et le locataire dans une Location',
      icon: FileText,
      action: () => {
        setCompletedSteps([...completedSteps, 3]);
        onNavigate('locations');
        notify('Accédez à la gestion de vos locations', 'info');
      }
    }
  ];

  const progressPercentage = (completedSteps.length / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-2">
            Bienvenue sur GestiLoc !
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
            Pour démarrer, c'est simple comme 1, 2, 3...
          </p>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Progression du compte
              </span>
              <span className="text-sm font-semibold text-primary">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary to-primary-light h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Les premières étapes sont importantes !
            </p>
          </div>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = completedSteps.includes(step.id);

            return (
              <div key={step.id}>
                <Card className="h-full flex flex-col overflow-hidden group hover:shadow-lg transition-shadow duration-300">
                  {/* Step Number Badge */}
                  <div className={`p-6 pb-4 ${
                    isCompleted
                      ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30'
                      : 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30'
                  } flex items-start justify-between`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {isCompleted ? (
                          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                          </div>
                        ) : (
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg ${
                            index === 0 ? 'bg-blue-500 text-white' :
                            index === 1 ? 'bg-purple-500 text-white' :
                            'bg-orange-500 text-white'
                          }`}>
                            {step.id}
                          </div>
                        )}
                        {isCompleted && (
                          <span className="text-xs font-semibold text-green-600 dark:text-green-400 px-2 py-1 bg-green-200 dark:bg-green-900/50 rounded-full">
                            Complété
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {step.title}
                      </h3>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-3 mb-4 justify-center">
                      <Icon className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 text-center flex-1">
                      {step.description}
                    </p>

                    {/* Action Button */}
                    <Button
                      onClick={step.action}
                      className="w-full mt-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200"
                    >
                      Commencer
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Illustration Section */}
        <Card className="mb-12 overflow-hidden">
          <div className="bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 p-8 md:p-12 text-center">
            <div className="w-full max-w-md mx-auto">
              <div className="w-full aspect-video bg-gradient-to-br from-primary/20 to-primary-light/20 dark:from-primary/10 dark:to-primary-light/10 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600">
                <div className="text-center">
                  <Building className="w-16 h-16 text-primary/50 dark:text-primary-light/50 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-slate-400">
                    Capture d'écran GestiLoc
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Help Section */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
          <div className="p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
                <HelpCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Besoin d'aide ?
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Consultez notre site d'assistance complet ou contactez notre équipe de support pour toute question.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg">
                    Visitez notre support en ligne
                  </Button>
                  <Button variant="outline" className="font-semibold py-2 px-4 rounded-lg">
                    Nous contacter
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Skip Section */}
        <div className="text-center mt-8">
          <Button
            variant="outline"
            onClick={() => onNavigate('dashboard')}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            Passer et aller au tableau de bord
          </Button>
        </div>
      </div>
    </div>
  );
};
