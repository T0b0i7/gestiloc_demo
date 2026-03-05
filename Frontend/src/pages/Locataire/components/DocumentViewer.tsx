import React from 'react';
import { Download, Printer, Share2 } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';

interface DocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  fileType: string;
  notify: (msg: string, type: 'success' | 'info') => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ isOpen, onClose, fileName, fileType, notify }) => {
  
  const handleDownload = () => {
    notify(`Téléchargement de ${fileName} lancé...`, 'success');
  };

  const handlePrint = () => {
    notify('Envoi vers l\'imprimante...', 'info');
  };

  // Mock content based on file type
  const isImage = fileType.toLowerCase().endsWith('jpg') || fileType.toLowerCase().endsWith('png');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={fileName}>
      <div className="flex flex-col h-[70vh]">
        {/* Toolbar */}
        <div className="flex justify-end gap-2 mb-4 pb-4 border-b border-gray-100">
           <button onClick={handlePrint} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" title="Imprimer">
             <Printer size={20} />
           </button>
           <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" title="Partager">
             <Share2 size={20} />
           </button>
           <Button variant="primary" size="sm" icon={<Download size={16}/>} onClick={handleDownload}>
             Télécharger
           </Button>
        </div>

        {/* Viewer Content Area (Simulation) */}
        <div className="flex-1 bg-slate-100 rounded-lg overflow-hidden relative flex items-center justify-center p-4 md:p-8 border border-gray-200">
           {isImage ? (
             <img src="https://via.placeholder.com/600x800?text=Document+Preview" alt="Preview" className="max-w-full max-h-full shadow-lg object-contain" />
           ) : (
             <div className="bg-white shadow-xl w-full h-full max-w-3xl mx-auto p-8 md:p-12 overflow-y-auto flex flex-col">
                {/* Simulated PDF Content */}
                <div className="flex justify-between items-start mb-8 border-b border-gray-100 pb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wider mb-2">Document Officiel</h1>
                        <p className="text-sm text-gray-500">Réf: {fileName}</p>
                    </div>
                    <div className="w-16 h-16 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-xl">MT</div>
                </div>
                
                <div className="space-y-4">
                    <div className="h-4 bg-gray-100 rounded w-full"></div>
                    <div className="h-4 bg-gray-100 rounded w-full"></div>
                    <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                    <div className="h-8"></div>
                    <div className="h-4 bg-gray-100 rounded w-full"></div>
                    <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-100 rounded w-full"></div>
                    
                    <div className="py-8 grid grid-cols-2 gap-8">
                        <div className="h-32 bg-gray-50 rounded border border-gray-100 p-4">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Le Bailleur</p>
                            <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                        </div>
                        <div className="h-32 bg-gray-50 rounded border border-gray-100 p-4 relative">
                             <p className="text-xs font-bold text-gray-400 uppercase mb-2">Le Locataire</p>
                             <div className="absolute bottom-4 right-4 font-handwriting text-2xl text-blue-600 transform -rotate-6">Lu et approuvé</div>
                        </div>
                    </div>
                </div>

                <div className="mt-auto pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
                    Généré numériquement par GestiLoc App - Page 1/3
                </div>
             </div>
           )}
        </div>
      </div>
    </Modal>
  );
};