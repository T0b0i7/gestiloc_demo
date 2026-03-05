import React, { useState } from 'react';
import { Send, Paperclip, Image as ImageIcon, MoreVertical } from 'lucide-react';
import { Contact, Message } from '../types';

const contacts: Contact[] = [
  { id: '1', name: 'M. Dupont', role: 'Propriétaire', unreadCount: 3, avatar: 'https://picsum.photos/100/100' },
  { id: '2', name: 'Agence Immo', role: 'Gestion', unreadCount: 0 },
  { id: '3', name: 'Syndic', role: 'Immeuble', unreadCount: 0 },
];

const initialMessages: Message[] = [
  { id: '1', sender: 'owner', content: 'Bonjour, avez-vous pu vérifier le radiateur ?', timestamp: '10:30', isRead: false },
  { id: '2', sender: 'me', content: 'Bonjour M. Dupont. Pas encore, je rentre ce soir.', timestamp: '10:35', isRead: true },
  { id: '3', sender: 'owner', content: 'D\'accord, tenez-moi au courant. C\'est important pour l\'entretien annuel.', timestamp: '10:36', isRead: false },
];

interface MessagesProps {
    notify: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export const Messages: React.FC<MessagesProps> = ({ notify }) => {
  const [selectedContact, setSelectedContact] = useState<Contact>(contacts[0]);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'me',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: true
    };
    setMessages([...messages, newMessage]);
    setInputValue('');
    notify('Message envoyé', 'success');
  };

  return (
    <div className="h-[calc(100vh-8rem)] bg-white rounded-xl shadow-sm border border-gray-200 flex overflow-hidden animate-fade-in">
      {/* Contacts List - Hidden on mobile if chat open (simplified logic for this demo) */}
      <div className="w-full md:w-1/3 border-r border-gray-200 bg-gray-50 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="font-bold text-lg text-gray-800">Contacts</h2>
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-1">
          {contacts.map(contact => (
            <div 
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${selectedContact.id === contact.id ? 'bg-white shadow-sm border border-gray-200' : 'hover:bg-gray-200/50'}`}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-primary font-bold text-sm overflow-hidden">
                    {contact.avatar ? <img src={contact.avatar} alt="" className="w-full h-full object-cover"/> : contact.name.charAt(0)}
                </div>
                {contact.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </div>
              <div className="ml-3 flex-1">
                 <div className="flex justify-between items-baseline">
                    <p className={`text-sm font-medium ${contact.unreadCount > 0 ? 'text-gray-900 font-bold' : 'text-gray-700'}`}>{contact.name}</p>
                    {contact.unreadCount > 0 && <span className="text-xs text-red-500 font-bold">{contact.unreadCount}</span>}
                 </div>
                 <p className="text-xs text-gray-500">{contact.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area - Hidden on mobile if no contact selected (simplified for demo, showing by default) */}
      <div className="hidden md:flex w-2/3 flex-col bg-white relative">
         {/* Header */}
         <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white z-10">
             <div className="flex items-center">
                 <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-primary font-bold text-xs mr-3">
                     {selectedContact.name.charAt(0)}
                 </div>
                 <div>
                     <h3 className="font-bold text-gray-900">{selectedContact.name}</h3>
                     <p className="text-xs text-green-500 flex items-center">● En ligne</p>
                 </div>
             </div>
             <button className="text-gray-400 hover:text-gray-600"><MoreVertical size={20} /></button>
         </div>

         {/* Messages */}
         <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
             {messages.map((msg) => (
                 <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                     <div className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${
                         msg.sender === 'me' 
                         ? 'bg-primary text-white rounded-br-none' 
                         : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                     }`}>
                         <p className="text-sm">{msg.content}</p>
                         <p className={`text-[10px] mt-1 text-right ${msg.sender === 'me' ? 'text-blue-200' : 'text-gray-400'}`}>{msg.timestamp}</p>
                     </div>
                 </div>
             ))}
         </div>

         {/* Input */}
         <div className="p-4 bg-white border-t border-gray-200">
             <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-xl border border-gray-200 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                 <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors"><Paperclip size={20}/></button>
                 <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors"><ImageIcon size={20}/></button>
                 <input 
                    type="text" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Votre message..." 
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-700 placeholder-gray-400 outline-none"
                 />
                 <button 
                    onClick={handleSend}
                    className="p-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
                 >
                     <Send size={18} />
                 </button>
             </div>
         </div>
      </div>
    </div>
  );
};
