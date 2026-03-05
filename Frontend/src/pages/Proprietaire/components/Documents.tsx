
import React, { useState } from 'react';
import { FileText, Download, Search, Eye } from 'lucide-react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { DocumentViewer } from './DocumentViewer';

const docCategories = [
  {
    title: 'Contrat de Location',
    count: 3,
    files: [
        { name: 'Bail signé.pdf', date: '15/09/2024', size: '2.4 MB', tag: 'Important' },
        { name: 'Avenant chauffage.pdf', date: '10/01/2025', size: '1.1 MB' },
        { name: 'Règlement de copropriété.pdf', date: '15/09/2024', size: '4.5 MB' },
    ]
  },
  {
    title: 'Quittances & Finances',
    count: 12,
    files: [
        { name: 'Quittance_Novembre_2025.pdf', date: '28/11/2025', size: '156 KB', tag: 'Nouveau' },
        { name: 'Quittance_Octobre_2025.pdf', date: '03/10/2025', size: '154 KB' },
        { name: 'Régularisation charges 2024.pdf', date: '15/01/2025', size: '1.2 MB' },
    ]
  },
  {
    title: 'Diagnostics Techniques',
    count: 4,
    files: [
        { name: 'DPE.pdf', date: '01/08/2024', size: '3.2 MB' },
        { name: 'Diagnostic Électricité.pdf', date: '01/08/2024', size: '2.1 MB' },
    ]
  }
];

interface DocumentsProps {
    notify: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export const Documents: React.FC<DocumentsProps> = ({ notify }) => {
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  
  const handlePreview = (fileName: string) => {
    setSelectedDoc(fileName);
  };

  const handleDownload = (fileName: string) => {
    notify(`Téléchargement de ${fileName}...`, 'success');
  };

  return (
    <>
        <DocumentViewer 
            isOpen={!!selectedDoc} 
            onClose={() => setSelectedDoc(null)} 
            fileName={selectedDoc || ''} 
            fileType="pdf"
            notify={notify}
        />

        <div className="space-y-6 animate-slide-up">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Mes Documents</h1>
            <div className="relative w-full md:w-64">
                <input 
                    type="text" 
                    placeholder="Rechercher un document..." 
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary text-sm"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
        </div>

        <div className="space-y-6">
            {docCategories.map((cat, idx) => (
                <div key={idx}>
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 ml-1">
                        {cat.title} <span className="text-gray-400 font-normal">({cat.count})</span>
                    </h2>
                    <div className="grid gap-3">
                        {cat.files.map((file, fIdx) => (
                            <Card key={fIdx} className="!p-4 hover:shadow-md cursor-pointer group transition-all duration-200">
                                <div className="flex items-center justify-between" onClick={() => handlePreview(file.name)}>
                                    <div className="flex items-center space-x-4">
                                        <div className="p-3 bg-blue-50 text-primary rounded-lg group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-medium text-gray-900 group-hover:text-primary transition-colors">{file.name}</h3>
                                                {file.tag && (
                                                    <Badge variant={file.tag === 'Nouveau' ? 'info' : 'warning'}>{file.tag}</Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500">{file.date} • {file.size}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handlePreview(file.name); }}
                                            className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Aperçu"
                                        >
                                            <Eye size={20} />
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleDownload(file.name); }}
                                            className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Télécharger"
                                        >
                                            <Download size={20} />
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}
        </div>
        </div>
    </>
  );
};
