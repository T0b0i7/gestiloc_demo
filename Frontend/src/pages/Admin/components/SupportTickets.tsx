
import React, { useState } from 'react';
import { MessageSquare, Clock, CheckCircle, AlertTriangle, MoreVertical, Plus, ArrowRight, X } from 'lucide-react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { Input, Select } from './ui/Input';
import { MOCK_TICKETS } from '../constants';
import { TicketPriority, TicketStatus, Ticket } from '../types';
import { useAppContext } from '../context/AppContext';

// Move helper function outside component
const getPriorityColor = (p: TicketPriority) => {
  switch(p) {
    case TicketPriority.URGENT: return 'border-l-4 border-l-red-500';
    case TicketPriority.HIGH: return 'border-l-4 border-l-amber-500';
    case TicketPriority.MEDIUM: return 'border-l-4 border-l-blue-500';
    default: return 'border-l-4 border-l-slate-300';
  }
};

// Move sub-component outside to avoid re-creation on every render
const TicketCardItem: React.FC<{ ticket: Ticket; onClick: () => void }> = ({ ticket, onClick }) => (
  <div 
    onClick={onClick}
    className={`
      bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm mb-3 
      hover:shadow-md transition-all duration-300 cursor-pointer 
      hover:-translate-y-1 group relative overflow-hidden
      ${getPriorityColor(ticket.priority)}
    `}
  >
    <div className="flex justify-between items-start mb-2">
      <span className="text-xs font-mono text-slate-400 dark:text-slate-500">{ticket.id}</span>
    </div>
    <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
      {ticket.subject}
    </h4>
    <div className="flex items-center justify-between mt-4">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-[10px] text-white font-bold">
          {ticket.requester.charAt(0)}
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">{ticket.requester}</span>
      </div>
      <div className="flex gap-1">
         {ticket.tags.map((tag: string) => (
           <span key={tag} className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded">
             {tag}
           </span>
         ))}
      </div>
    </div>
  </div>
);

export const SupportTickets: React.FC = () => {
  const { t, showToast } = useAppContext();
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);
  
  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  
  // Form State
  const [newTicket, setNewTicket] = useState({ subject: '', description: '', priority: TicketPriority.MEDIUM, requester: 'Alice Dubois' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateTicket = () => {
    if (!newTicket.subject) return;
    setIsSubmitting(true);
    setTimeout(() => {
      const ticket: Ticket = {
        id: `T-${Math.floor(Math.random() * 9000) + 1000}`,
        subject: newTicket.subject,
        requester: newTicket.requester,
        status: TicketStatus.NEW,
        priority: newTicket.priority,
        created: 'Now',
        tags: ['Support']
      };
      setTickets([ticket, ...tickets]);
      setIsCreateModalOpen(false);
      setIsSubmitting(false);
      setNewTicket({ subject: '', description: '', priority: TicketPriority.MEDIUM, requester: 'Alice Dubois' });
      showToast(t('tickets.ticketCreated'), 'success');
    }, 800);
  };

  const handleStatusChange = (ticketId: string, newStatus: TicketStatus) => {
    setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
    if(selectedTicket && selectedTicket.id === ticketId) {
       setSelectedTicket({...selectedTicket, status: newStatus});
    }
    showToast(t('tickets.statusUpdated'), 'info');
  };

  return (
    <div className="p-6 h-full flex flex-col pb-20">
      <div className="flex justify-between items-center mb-6 animate-slide-in">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{t('tickets.title')}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{t('tickets.subtitle')}</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} icon={<Plus size={16} />}>
          {t('tickets.createTicket')}
        </Button>
      </div>

      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-6 min-w-[1000px] h-full">
          {/* Column: New */}
          <div className="flex-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl p-4 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-red-500" />
                <h3 className="font-semibold text-slate-700 dark:text-slate-200">{t('tickets.status.new')}</h3>
              </div>
              <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full text-xs font-bold">
                {tickets.filter(t => t.status === TicketStatus.NEW).length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {tickets.filter(t => t.status === TicketStatus.NEW).map((t) => (
                <TicketCardItem key={t.id} ticket={t} onClick={() => setSelectedTicket(t)} />
              ))}
            </div>
          </div>

          {/* Column: In Progress */}
          <div className="flex-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl p-4 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2">
                <Clock size={18} className="text-amber-500" />
                <h3 className="font-semibold text-slate-700 dark:text-slate-200">{t('tickets.status.inProgress')}</h3>
              </div>
              <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full text-xs font-bold">
                 {tickets.filter(t => t.status === TicketStatus.IN_PROGRESS).length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
               {tickets.filter(t => t.status === TicketStatus.IN_PROGRESS).map((t) => (
                <TicketCardItem key={t.id} ticket={t} onClick={() => setSelectedTicket(t)} />
              ))}
            </div>
          </div>

          {/* Column: Resolved */}
          <div className="flex-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl p-4 flex flex-col h-full">
             <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-emerald-500" />
                <h3 className="font-semibold text-slate-700 dark:text-slate-200">{t('tickets.status.resolved')}</h3>
              </div>
              <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full text-xs font-bold">
                 {tickets.filter(t => t.status === TicketStatus.RESOLVED).length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
               {tickets.filter(t => t.status === TicketStatus.RESOLVED).map((t) => (
                <TicketCardItem key={t.id} ticket={t} onClick={() => setSelectedTicket(t)} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Create Ticket Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={t('tickets.newModal.title')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleCreateTicket} isLoading={isSubmitting}>{t('common.save')}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input 
            label={t('tickets.newModal.subject')}
            value={newTicket.subject}
            onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
            placeholder="Ex: Broken heater"
          />
           <Input 
            label={t('tickets.newModal.requester')}
            value={newTicket.requester}
            onChange={(e) => setNewTicket({...newTicket, requester: e.target.value})}
          />
          <Select 
             label={t('tickets.newModal.priority')}
             options={[
               { value: TicketPriority.LOW, label: 'Low' },
               { value: TicketPriority.MEDIUM, label: 'Medium' },
               { value: TicketPriority.HIGH, label: 'High' },
               { value: TicketPriority.URGENT, label: 'Urgent' },
             ]}
             value={newTicket.priority}
             onChange={(e) => setNewTicket({...newTicket, priority: e.target.value as TicketPriority})}
          />
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('tickets.newModal.description')}</label>
            <textarea 
              title="Ticket description"
              placeholder="Describe the issue..."
              className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 min-h-[100px]"
              value={newTicket.description}
              onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
            />
          </div>
        </div>
      </Modal>

      {/* View/Edit Ticket Modal */}
      <Modal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title={selectedTicket?.subject || 'Ticket Details'}
        size="lg"
        footer={
           <Button variant="ghost" onClick={() => setSelectedTicket(null)}>{t('common.cancel')}</Button>
        }
      >
        {selectedTicket && (
          <div className="flex flex-col gap-6">
            {/* Status Bar */}
            <div className="flex flex-wrap items-center gap-2 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Current Status:</span>
              <Badge>{selectedTicket.status}</Badge>
              <div className="flex-1"></div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Move to:</span>
                {selectedTicket.status !== TicketStatus.NEW && (
                   <button onClick={() => handleStatusChange(selectedTicket.id, TicketStatus.NEW)} className="px-2 py-1 text-xs rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 shadow-sm hover:bg-slate-50">New</button>
                )}
                 {selectedTicket.status !== TicketStatus.IN_PROGRESS && (
                   <button onClick={() => handleStatusChange(selectedTicket.id, TicketStatus.IN_PROGRESS)} className="px-2 py-1 text-xs rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 shadow-sm hover:bg-slate-50">In Progress</button>
                )}
                 {selectedTicket.status !== TicketStatus.RESOLVED && (
                   <button onClick={() => handleStatusChange(selectedTicket.id, TicketStatus.RESOLVED)} className="px-2 py-1 text-xs rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 shadow-sm hover:bg-slate-50">Resolved</button>
                )}
              </div>
            </div>

            {/* Conversation View */}
            <div className="space-y-4">
               <div className="flex gap-3">
                 <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                    {selectedTicket.requester.charAt(0)}
                 </div>
                 <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-2xl rounded-tl-none max-w-[80%]">
                   <p className="text-sm text-slate-800 dark:text-slate-200">
                     Hello, I have an issue with the {selectedTicket.subject.toLowerCase()}. Can you please check?
                   </p>
                   <span className="text-[10px] text-slate-400 mt-1 block">{selectedTicket.created}</span>
                 </div>
               </div>

               {/* Admin Response Simulation */}
               <div className="flex gap-3 flex-row-reverse">
                 <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold flex-shrink-0">
                    A
                 </div>
                 <div className="bg-blue-600 text-white p-3 rounded-2xl rounded-tr-none max-w-[80%]">
                   <p className="text-sm">
                     Thanks for reporting this. We have assigned a technician to look into it.
                   </p>
                   <span className="text-[10px] text-blue-200 mt-1 block">Just now</span>
                 </div>
               </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Type a reply..." 
                  className="w-full pl-4 pr-12 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button 
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  title="Send reply"
                  aria-label="Send reply"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
