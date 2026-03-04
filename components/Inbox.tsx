
import React, { useState, useMemo } from 'react';
import { Lead, Message, Campaign } from '../types';
import GlassCard from './common/GlassCard';
import { Search, Star, Trash2, Reply, MoreHorizontal, Paperclip, Send as SendIcon, Sparkles, Clock, Filter, Inbox as InboxIcon, MessageCircle } from 'lucide-react';
import { generateReplySuggestion } from '../services/geminiService';

interface InboxProps {
  leads: Lead[];
  campaigns?: Campaign[];
}

// Simulated initial messages from the leads
const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm1',
    leadId: '1', 
    campaignId: 'c1',
    subject: 'Re: Logistics Optimization for SpaceX',
    preview: 'This sounds interesting. Do you support heavy...',
    fullContent: "Hi Alex,\n\nThis sounds interesting. Do you support heavy cargo tracking specifically for orbital logistics? We are looking for a vendor who can handle high-frequency data updates.\n\nLet me know your availability for a quick sync next Tuesday.\n\nBest,\nJeff",
    timestamp: '10:42 AM',
    read: false,
    sentiment: 'Interested',
    folder: 'Primary'
  },
  {
    id: 'm2',
    leadId: '2', 
    campaignId: 'c2',
    subject: 'Re: Enterprise Cloud Partnership',
    preview: 'Can you send over the technical documentation?',
    fullContent: "Alex,\n\nThanks for reaching out. Can you send over the technical documentation regarding your API latency? We have strict compliance requirements on the Azure side.\n\nRegards,\nSatya",
    timestamp: 'Yesterday',
    read: true,
    sentiment: 'Question',
    folder: 'Primary'
  }
];

const Inbox: React.FC<InboxProps> = ({ leads, campaigns = [] }) => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [selectedId, setSelectedId] = useState<string | null>(INITIAL_MESSAGES[0].id);
  const [replyText, setReplyText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeCampaignFilter, setActiveCampaignFilter] = useState<string | 'ALL'>('ALL');
  const [replyFilter, setReplyFilter] = useState<'ALL' | 'UNREAD' | 'ACTION_REQUIRED'>('ALL');

  const filteredMessages = useMemo(() => {
    return messages.filter(m => {
      const campaignMatch = activeCampaignFilter === 'ALL' || m.campaignId === activeCampaignFilter;
      const statusMatch = replyFilter === 'ALL' || (replyFilter === 'UNREAD' && !m.read) || (replyFilter === 'ACTION_REQUIRED' && m.sentiment === 'Interested');
      return campaignMatch && statusMatch;
    });
  }, [messages, activeCampaignFilter, replyFilter]);

  const selectedMessage = messages.find(m => m.id === selectedId);
  const selectedLead = leads.find(l => l.id === selectedMessage?.leadId);
  const selectedCampaign = campaigns.find(c => c.id === selectedMessage?.campaignId);

  const handleAiDraft = async () => {
    if (!selectedMessage || !selectedLead) return;
    setIsGenerating(true);
    try {
      const draft = await generateReplySuggestion(selectedMessage.fullContent, selectedLead);
      if (draft) setReplyText(draft);
    } catch (e) {
      setReplyText("Error generating draft. Please type manually.");
    } finally {
      setIsGenerating(false);
    }
  };

  const markAsRead = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
    setSelectedId(id);
  };

  return (
    <div className="h-[calc(100vh-140px)] animate-in fade-in slide-in-from-bottom-4 duration-500 flex gap-6">
      
      {/* Sidebar: Sub-Filters */}
      <div className="w-64 hidden lg:flex flex-col gap-6">
         <div className="space-y-1">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 pl-4">Filters</h4>
            {[
              { id: 'ALL', label: 'All Replies', icon: <InboxIcon size={16} /> },
              { id: 'UNREAD', label: 'Unread', icon: <Clock size={16} />, badge: messages.filter(m => !m.read).length },
              { id: 'ACTION_REQUIRED', label: 'Action Required', icon: <Sparkles size={16} /> }
            ].map(f => (
              <button 
                key={f.id}
                onClick={() => setReplyFilter(f.id as any)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${replyFilter === f.id ? 'bg-purple-600 text-white shadow-md' : 'text-gray-500 hover:bg-white hover:text-gray-900'}`}
              >
                <div className="flex items-center gap-2">
                   {f.icon} {f.label}
                </div>
                {f.badge && <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${replyFilter === f.id ? 'bg-white text-purple-600' : 'bg-purple-100 text-purple-600'}`}>{f.badge}</span>}
              </button>
            ))}
         </div>

         <div className="space-y-1">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 pl-4">By Campaign</h4>
            <button 
              onClick={() => setActiveCampaignFilter('ALL')}
              className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeCampaignFilter === 'ALL' ? 'bg-white text-purple-600 border border-purple-100 shadow-sm' : 'text-gray-500 hover:bg-white'}`}
            >
              <Filter size={14} /> All Campaigns
            </button>
            {campaigns.map(c => (
              <button 
                key={c.id}
                onClick={() => setActiveCampaignFilter(c.id)}
                className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeCampaignFilter === c.id ? 'bg-white text-purple-600 border border-purple-100 shadow-sm' : 'text-gray-500 hover:bg-white'}`}
              >
                <MessageCircle size={14} /> {c.name}
              </button>
            ))}
         </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 h-full">
        
        {/* Middle Column: Message List */}
        <div className="col-span-12 md:col-span-5 lg:col-span-4 flex flex-col h-full">
          <div className="mb-4 relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
             <input type="text" placeholder="Search replies..." className="w-full bg-white border border-gray-100 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-purple-500/10 outline-none shadow-sm" />
          </div>

          <GlassCard className="flex-1 !p-0 overflow-hidden flex flex-col bg-white" glow="none">
            <div className="overflow-y-auto custom-scrollbar flex-1 divide-y divide-gray-50">
              {filteredMessages.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                   <p className="text-xs font-bold">No matching responses.</p>
                </div>
              ) : (
                filteredMessages.map(msg => {
                  const lead = leads.find(l => l.id === msg.leadId);
                  const isSelected = selectedId === msg.id;
                  return (
                    <div key={msg.id} onClick={() => markAsRead(msg.id)} className={`p-4 cursor-pointer transition-all hover:bg-purple-50/50 ${isSelected ? 'bg-purple-50 border-l-4 border-l-purple-600 shadow-inner' : 'border-l-4 border-l-transparent'}`}>
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-sm ${!msg.read ? 'font-black text-gray-900' : 'font-semibold text-gray-600'}`}>{lead?.contactName}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">{msg.timestamp}</span>
                      </div>
                      <p className={`text-xs truncate ${!msg.read ? 'text-gray-900 font-bold' : 'text-gray-500'}`}>{msg.subject}</p>
                      
                      <div className="mt-2 flex items-center justify-between">
                         <div className="flex gap-1.5">
                            {msg.sentiment === 'Interested' && <span className="text-[8px] px-1.5 py-0.5 rounded bg-green-50 text-green-600 border border-green-100 font-black uppercase">Interested</span>}
                            {msg.sentiment === 'Question' && <span className="text-[8px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-100 font-black uppercase">Question</span>}
                         </div>
                         {msg.campaignId && (
                           <span className="text-[8px] font-bold text-gray-400 truncate max-w-[80px]">#{campaigns.find(c => c.id === msg.campaignId)?.name}</span>
                         )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Message Detail */}
        <div className="col-span-12 md:col-span-7 lg:col-span-8 h-full flex flex-col">
           {selectedMessage && selectedLead ? (
             <GlassCard className="h-full !p-0 flex flex-col overflow-hidden bg-white shadow-md border-gray-100" glow="none">
               <div className="p-6 border-b border-gray-50 flex justify-between items-start bg-gray-50/30">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-sm font-black text-purple-600 shadow-sm">
                      {selectedLead.contactName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">{selectedLead.contactName}</h3>
                      <p className="text-[11px] text-gray-500 font-medium">Outreach context: <span className="text-purple-600 font-bold">{selectedCampaign?.name || 'Manual Reach'}</span></p>
                    </div>
                 </div>
                 <div className="flex gap-2">
                    <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-all"><Star size={16} /></button>
                    <button className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all"><Trash2 size={16} /></button>
                 </div>
               </div>

               <div className="flex-1 overflow-y-auto p-8 bg-gray-50/20">
                 <div className="max-w-2xl mx-auto space-y-6">
                    <div className="flex justify-center mb-8">
                       <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 px-3 py-1 bg-white rounded-full border border-gray-100 shadow-sm">{selectedMessage.timestamp}</span>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 leading-relaxed text-gray-700 text-sm whitespace-pre-line">
                      {selectedMessage.fullContent}
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-100 w-fit shadow-sm">
                       <Sparkles size={12} className="text-purple-600" />
                       <span className="text-[10px] font-bold text-gray-500 uppercase">AI Detected: <span className="text-purple-600">{selectedMessage.sentiment}</span></span>
                    </div>
                 </div>
               </div>

               <div className="p-6 bg-white border-t border-gray-100">
                 {!replyText && (
                   <button 
                    onClick={handleAiDraft} 
                    disabled={isGenerating}
                    className="mb-4 flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition-all shadow-md shadow-purple-500/20 disabled:opacity-50"
                   >
                     {isGenerating ? <Clock size={14} className="animate-spin" /> : <Sparkles size={14} />}
                     AI Smart Reply
                   </button>
                 )}
                 <div className="relative">
                   <textarea
                     value={replyText}
                     onChange={(e) => setReplyText(e.target.value)}
                     placeholder="Type your response..."
                     className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 pr-12 text-sm focus:ring-2 focus:ring-purple-500/10 outline-none min-h-[120px] text-gray-900"
                   />
                   <div className="absolute bottom-4 right-4 flex gap-2">
                     <button className="p-2 text-gray-400 hover:text-gray-600"><Paperclip size={18} /></button>
                     <button 
                       className="p-2 bg-purple-600 text-white rounded-lg shadow-lg shadow-purple-500/20 hover:scale-105 transition-all"
                       onClick={() => { setReplyText(''); alert('Reply sent!'); }}
                     >
                       <SendIcon size={18} />
                     </button>
                   </div>
                 </div>
               </div>
             </GlassCard>
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-white rounded-2xl border border-gray-100">
               <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                 <InboxIcon size={32} className="text-gray-300" />
               </div>
               <p className="font-bold">Select a reply to continue the conversation.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Inbox;
