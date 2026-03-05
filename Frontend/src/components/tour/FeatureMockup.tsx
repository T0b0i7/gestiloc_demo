interface FeatureMockupProps {
  type: 'properties' | 'tenants' | 'lease' | 'rent' | 'revision' | 'bank' | 'accounting' | 'inspection' | 'maintenance' | 'messaging' | 'seasonal';
}

export function FeatureMockup({ type }: FeatureMockupProps) {
  const mockups = {
    properties: (
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 p-6 rounded-xl h-full flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-primary">Mes Biens</div>
          <div className="text-xs bg-primary/20 px-3 py-1 rounded-full">12 biens</div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm flex gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm mb-1">Appartement T{i + 1}</div>
                <div className="text-xs text-muted-foreground">Cotonou, Akpakpa</div>
                <div className="text-xs text-primary font-medium mt-1">{(i + 1) * 75000} FCFA/mois</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    tenants: (
      <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 p-6 rounded-xl h-full">
        <div className="text-sm font-semibold text-primary mb-4">Locataires Actifs</div>
        <div className="space-y-3">
          {['Kouassi M.', 'Diallo A.', 'Mensah K.'].map((name, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {name.split(' ')[0][0]}
                </div>
                <div>
                  <div className="font-semibold text-sm">{name}</div>
                  <div className="text-xs text-muted-foreground">Appt. {i + 1}A</div>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <div className="flex-1 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded text-xs text-center">
                  <div className="text-green-700 dark:text-green-400 font-medium">À jour</div>
                </div>
                <div className="flex-1 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded text-xs text-center">
                  <div className="text-blue-700 dark:text-blue-400 font-medium">Bail actif</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    lease: (
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 p-6 rounded-xl h-full">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="text-center mb-6">
            <div className="text-2xl font-bold text-primary mb-2">Contrat de Bail</div>
            <div className="text-sm text-muted-foreground">Location d'habitation</div>
          </div>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Bailleur:</span>
              <span className="font-medium">Votre nom</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Locataire:</span>
              <span className="font-medium">Nom du locataire</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Loyer mensuel:</span>
              <span className="font-medium text-primary">150 000 FCFA</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Durée:</span>
              <span className="font-medium">12 mois</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Début:</span>
              <span className="font-medium">01/01/2024</span>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t flex gap-2">
            <div className="flex-1 h-8 bg-gradient-to-r from-primary/20 to-primary/10 rounded"></div>
            <div className="w-20 text-xs text-muted-foreground flex items-center">Signature</div>
          </div>
        </div>
      </div>
    ),
    rent: (
      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/20 p-6 rounded-xl h-full">
        <div className="text-sm font-semibold text-primary mb-4">Quittances de loyer</div>
        <div className="space-y-3">
          {['Janvier 2024', 'Février 2024', 'Mars 2024'].map((month, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-sm">{month}</div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  i === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 
                  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                }`}>
                  {i === 2 ? 'En attente' : 'Payé'}
                </div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Kouassi M.</span>
                <span className="font-bold text-foreground">{150000} FCFA</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    revision: (
      <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 p-6 rounded-xl h-full flex flex-col justify-center">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center">
          <div className="text-sm text-muted-foreground mb-2">Révision de loyer 2024</div>
          <div className="text-4xl font-bold text-primary mb-4">+2.5%</div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Loyer actuel:</span>
              <span className="font-medium">150 000 FCFA</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nouveau loyer:</span>
              <span className="font-bold text-primary">153 750 FCFA</span>
            </div>
            <div className="pt-3 border-t">
              <span className="text-xs text-muted-foreground">Basé sur l'IRL Q4 2023</span>
            </div>
          </div>
        </div>
      </div>
    ),
    bank: (
      <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950/20 dark:to-cyan-900/20 p-6 rounded-xl h-full">
        <div className="text-sm font-semibold text-primary mb-4">Transactions bancaires</div>
        <div className="space-y-2">
          {[
            { label: 'Virement Kouassi M.', amount: '+150000', date: '15/03', color: 'green' },
            { label: 'Charges eau', amount: '-12500', date: '12/03', color: 'red' },
            { label: 'Virement Diallo A.', amount: '+125000', date: '10/03', color: 'green' },
            { label: 'Réparation plomberie', amount: '-35000', date: '08/03', color: 'red' },
          ].map((tx, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm flex justify-between items-center">
              <div>
                <div className="text-sm font-medium">{tx.label}</div>
                <div className="text-xs text-muted-foreground">{tx.date}</div>
              </div>
              <div className={`font-bold text-sm ${tx.color === 'green' ? 'text-green-600' : 'text-red-600'}`}>
                {tx.amount} FCFA
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    accounting: (
      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/20 dark:to-indigo-900/20 p-6 rounded-xl h-full">
        <div className="text-sm font-semibold text-primary mb-4">Tableau de bord</div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: 'Revenus', value: '1 875 000', color: 'green' },
            { label: 'Charges', value: '285 000', color: 'red' },
            { label: 'Taux occup.', value: '92%', color: 'blue' },
            { label: 'Rentabilité', value: '6.8%', color: 'purple' },
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm text-center">
              <div className="text-xs text-muted-foreground mb-1">{stat.label}</div>
              <div className="text-lg font-bold text-primary">{stat.value}</div>
            </div>
          ))}
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <div className="flex items-end justify-between h-24 gap-2">
            {[60, 80, 70, 90, 75, 85].map((height, i) => (
              <div key={i} className="flex-1 bg-gradient-to-t from-primary to-primary/50 rounded-t" style={{ height: `${height}%` }}></div>
            ))}
          </div>
          <div className="text-xs text-center text-muted-foreground mt-2">Évolution des revenus</div>
        </div>
      </div>
    ),
    inspection: (
      <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/20 dark:to-pink-900/20 p-6 rounded-xl h-full">
        <div className="text-sm font-semibold text-primary mb-4">État des lieux - Salon</div>
        <div className="space-y-3">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded"></div>
              <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded"></div>
              <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded flex items-center justify-center text-xs text-muted-foreground">
                +12
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Murs: Bon état</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Sol: Bon état</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Fenêtre: Rayure légère</span>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg text-center">
            <div className="text-xs text-muted-foreground">Compteur électrique</div>
            <div className="text-2xl font-bold text-primary mt-1">45892 kWh</div>
          </div>
        </div>
      </div>
    ),
    maintenance: (
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 p-6 rounded-xl h-full">
        <div className="text-sm font-semibold text-primary mb-4">Demandes d'intervention</div>
        <div className="space-y-3">
          {[
            { title: 'Fuite robinet', status: 'En cours', priority: 'Urgent', color: 'red' },
            { title: 'Peinture salon', status: 'Planifié', priority: 'Normal', color: 'blue' },
            { title: 'Volet bloqué', status: 'Nouveau', priority: 'Urgent', color: 'orange' },
          ].map((ticket, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div className="font-semibold text-sm">{ticket.title}</div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  ticket.color === 'red' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                  ticket.color === 'blue' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                  'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                }`}>
                  {ticket.priority}
                </div>
              </div>
              <div className="flex gap-2 text-xs">
                <div className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{ticket.status}</div>
                <div className="text-muted-foreground">Appt. {i + 1}A</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    messaging: (
      <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950/20 dark:to-teal-900/20 p-6 rounded-xl h-full flex flex-col">
        <div className="text-sm font-semibold text-primary mb-4">Messages</div>
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex flex-col">
          <div className="space-y-3 flex-1">
            <div className="flex gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white text-xs font-bold">K</div>
              <div className="flex-1 bg-gray-100 dark:bg-gray-700 p-2 rounded-lg text-xs">
                Bonjour, le robinet de la cuisine fuit
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <div className="bg-primary/10 p-2 rounded-lg text-xs max-w-[70%]">
                Merci pour votre signalement. Un plombier interviendra demain
              </div>
            </div>
            <div className="flex gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white text-xs font-bold">K</div>
              <div className="flex-1 bg-gray-100 dark:bg-gray-700 p-2 rounded-lg text-xs">
                Parfait, merci beaucoup !
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t flex gap-2">
            <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded px-3 py-2 text-xs text-muted-foreground">
              Écrire un message...
            </div>
          </div>
        </div>
      </div>
    ),
    seasonal: (
      <div className="bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950/20 dark:to-violet-900/20 p-6 rounded-xl h-full">
        <div className="text-sm font-semibold text-primary mb-4">Calendrier saisonnier</div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <div className="grid grid-cols-7 gap-1 mb-3">
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
              <div key={i} className="text-center text-xs font-medium text-muted-foreground">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }, (_, i) => {
              const isBooked = [3, 4, 5, 10, 11, 12, 13, 24, 25, 26].includes(i);
              const isPending = [17, 18].includes(i);
              return (
                <div
                  key={i}
                  className={`aspect-square rounded text-xs flex items-center justify-center ${
                    isBooked ? 'bg-primary text-primary-foreground font-medium' :
                    isPending ? 'bg-yellow-200 dark:bg-yellow-900/50 text-yellow-900 dark:text-yellow-200' :
                    'bg-gray-100 dark:bg-gray-700 text-muted-foreground'
                  }`}
                >
                  {i + 1}
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-primary rounded"></div>
              <span>Réservé</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-200 dark:bg-yellow-900/50 rounded"></div>
              <span>En attente</span>
            </div>
          </div>
        </div>
      </div>
    ),
  };

  return mockups[type] || mockups.properties;
}
