
import React, { useState, useRef } from 'react';
import GlassCard from './common/GlassCard';
import { Lead, LeadStatus } from '../types';
import { Search, Filter, Plus, FileUp, MoreVertical, X, Loader2, CloudUpload, FileText, ChevronDown } from 'lucide-react';

interface LeadsManagerProps {
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
}

const LeadsManager: React.FC<LeadsManagerProps> = ({ leads, setLeads }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'LEADS' | 'CONTACTS'>('LEADS');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newLead, setNewLead] = useState({
    email: '',
    companyName: '',
    contactName: '',
    phone: '',
    city: '',
    country: '',
    leadFrom: 'Cappah'
  });

  const filteredLeads = leads.filter(l => {
    const matchesSearch = 
      l?.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      l?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l?.contactName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    const lead: Lead = {
      id: Math.random().toString(36).substr(2, 9),
      email: newLead.email,
      companyName: newLead.companyName,
      contactName: newLead.contactName,
      phone: newLead.phone,
      city: newLead.city,
      country: newLead.country,
      leadFrom: newLead.leadFrom,
      industry: 'General',
      location: `${newLead.city}, ${newLead.country}`,
      status: LeadStatus.NEW,
      tags: []
    };
    setLeads(prev => [lead, ...prev]);
    setShowAddModal(false);
    setNewLead({ email: '', companyName: '', contactName: '', phone: '', city: '', country: '', leadFrom: 'Cappah' });
  };

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1600px] mx-auto px-0 md:px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 md:px-0">
        <div>
          <h1 className="text-3xl md:text-[42px] font-bold text-[#1a1a2e]">Leads Database</h1>
          <p className="text-gray-400 mt-1 md:mt-2 text-sm md:text-lg">Manage and track your AI-powered outreach assets.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
          <button 
            onClick={() => setShowImportModal(true)}
            className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-3.5 bg-white border border-[#e2e8f0] hover:bg-gray-50 transition-all rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-[#1a1a2e] shadow-sm"
          >
            <FileUp size={18} /> Import CSV
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-3.5 bg-[#8B5CF6] hover:bg-[#7c3aed] text-white transition-all rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#8B5CF6]/20 text-sm font-bold"
          >
            <Plus size={18} /> Add Lead
          </button>
        </div>
      </div>

      <GlassCard className="!p-0 border-[#f1f5f9] bg-white rounded-2xl md:rounded-[32px] overflow-hidden shadow-sm" glow="none">
        {/* Table Controls */}
        <div className="p-4 md:p-6 border-b border-[#f1f5f9] flex flex-col xl:flex-row xl:items-center gap-4 md:gap-6 justify-between">
          <div className="flex bg-[#f8fafc] rounded-xl md:rounded-2xl p-1 border border-[#e2e8f0] w-fit">
            {(['LEADS', 'CONTACTS'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 md:px-10 py-2.5 md:py-3 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === tab 
                    ? 'bg-white text-[#8B5CF6] shadow-sm' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
            <button className="flex items-center justify-center gap-2 px-5 md:px-6 py-2.5 md:py-3 bg-white border border-[#e2e8f0] rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-50 transition-all">
              <Filter size={16} /> Filter
            </button>
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Filter by name,domain...."
                className="bg-white border border-[#e2e8f0] rounded-xl pl-11 pr-4 py-2.5 md:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/10 focus:border-[#8B5CF6] transition-all w-full sm:w-64 md:w-80 text-[#1a1a2e] placeholder:text-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left min-w-[1000px]">
            <thead>
              <tr className="border-b border-[#f1f5f9] text-gray-400 text-[10px] md:text-[11px] uppercase tracking-[0.15em] font-bold bg-[#fcfdfe]">
                <th className="px-6 md:px-10 py-4 md:py-5">Profile</th>
                <th className="px-6 md:px-10 py-4 md:py-5">Company</th>
                <th className="px-6 md:px-10 py-4 md:py-5">City</th>
                <th className="px-6 md:px-10 py-4 md:py-5">Country</th>
                <th className="px-6 md:px-10 py-4 md:py-5">From</th>
                <th className="px-6 md:px-10 py-4 md:py-5">Status</th>
                <th className="px-6 md:px-10 py-4 md:py-5">Engagement</th>
                <th className="px-6 md:px-10 py-4 md:py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {filteredLeads.map(lead => (
                <tr key={lead.id} className="hover:bg-[#f8fafc]/50 transition-colors group">
                  <td className="px-6 md:px-10 py-4 md:py-7">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-[#f5f0ff] text-[#8B5CF6] flex items-center justify-center text-base md:text-xl font-bold border border-[#e9e0ff] flex-shrink-0">
                        {lead?.contactName?.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm md:text-[15px] font-bold text-[#1a1a2e] mb-0.5 truncate">{lead.contactName}</p>
                        <p className="text-[11px] md:text-[13px] text-gray-400 font-medium truncate">{lead.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 md:px-10 py-4 md:py-7">
                    <p className="text-sm md:text-[15px] text-[#1a1a2e] font-bold">{lead.companyName}</p>
                  </td>
                  <td className="px-6 md:px-10 py-4 md:py-7">
                    <p className="text-sm md:text-[15px] text-[#1a1a2e] font-medium">{lead.city}</p>
                  </td>
                  <td className="px-6 md:px-10 py-4 md:py-7">
                    <p className="text-sm md:text-[15px] text-[#1a1a2e] font-medium">{lead.country}</p>
                  </td>
                  <td className="px-6 md:px-10 py-4 md:py-7">
                    <p className="text-sm md:text-[15px] text-[#1a1a2e] font-medium">{lead.leadFrom}</p>
                  </td>
                  <td className="px-6 md:px-10 py-4 md:py-7">
                    <span className={`px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[11px] md:text-[13px] font-bold inline-flex items-center gap-2 border ${
                      lead.status === LeadStatus.SENT ? 'bg-[#f0f5ff] text-[#3b82f6] border-[#dbeafe]' : 'bg-[#f8fafc] text-[#64748b] border-[#e2e8f0]'
                    }`}>
                      <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${
                        lead.status === LeadStatus.SENT ? 'bg-[#3b82f6]' : 'bg-[#64748b]'
                      }`} />
                      {lead.status === LeadStatus.SENT ? 'Sent' : 'New'}
                    </span>
                  </td>
                  <td className="px-6 md:px-10 py-4 md:py-7">
                    <span className="text-sm md:text-[15px] text-[#1a1a2e] font-medium">No activity</span>
                  </td>
                  <td className="px-6 md:px-10 py-4 md:py-7 text-right">
                    <button className="p-2 md:p-3 text-gray-300 hover:text-[#8B5CF6] transition-all">
                      <MoreVertical size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredLeads.length === 0 && (
            <div className="py-16 md:py-24 text-center">
              <Search size={40} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-500 text-base md:text-lg font-medium px-4">No records found matching your search.</p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-[2px] animate-in fade-in duration-300 overflow-y-auto">
          <div className="w-full max-w-2xl my-auto animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
            <GlassCard className="relative flex-1 overflow-hidden flex flex-col p-0 shadow-2xl bg-white border-none rounded-2xl md:rounded-[32px]" glow="none">
              <div className="flex items-center gap-3 p-6 md:p-10 border-b border-gray-100 flex-shrink-0">
                <FileText className="text-[#8B5CF6]" size={28} />
                <h2 className="text-xl md:text-2xl font-bold text-[#1a1a2e]">Add New Lead</h2>
              </div>
              
              <form onSubmit={handleAddLead} className="p-6 md:p-10 space-y-5 md:space-y-6 overflow-y-auto custom-scrollbar">
                <div className="space-y-1.5 md:space-y-2">
                  <label className="text-base md:text-lg font-bold text-[#1a1a2e]">Customer Name</label>
                  <input 
                    required 
                    className="w-full bg-white border border-[#e2e8f0] rounded-xl md:rounded-2xl px-4 py-3 md:px-5 md:py-4 text-sm md:text-[16px] focus:border-[#8B5CF6] outline-none text-[#1a1a2e]" 
                    placeholder="Lead 1" 
                    value={newLead.contactName} 
                    onChange={e => setNewLead({...newLead, contactName: e.target.value})} 
                  />
                </div>
                <div className="space-y-1.5 md:space-y-2">
                  <label className="text-base md:text-lg font-bold text-[#1a1a2e]">Email</label>
                  <input 
                    required 
                    type="email" 
                    className="w-full bg-white border border-[#e2e8f0] rounded-xl md:rounded-2xl px-4 py-3 md:px-5 md:py-4 text-sm md:text-[16px] focus:border-[#8B5CF6] outline-none text-[#1a1a2e]" 
                    placeholder="xyz@gmail.com" 
                    value={newLead.email} 
                    onChange={e => setNewLead({...newLead, email: e.target.value})} 
                  />
                </div>
                <div className="space-y-1.5 md:space-y-2">
                  <label className="text-base md:text-lg font-bold text-[#1a1a2e]">Phone No.</label>
                  <input 
                    className="w-full bg-white border border-[#e2e8f0] rounded-xl md:rounded-2xl px-4 py-3 md:px-5 md:py-4 text-sm md:text-[16px] focus:border-[#8B5CF6] outline-none text-[#1a1a2e]" 
                    placeholder="0335-4334355" 
                    value={newLead.phone} 
                    onChange={e => setNewLead({...newLead, phone: e.target.value})} 
                  />
                </div>
                <div className="space-y-1.5 md:space-y-2">
                  <label className="text-base md:text-lg font-bold text-[#1a1a2e]">Company Name</label>
                  <input 
                    required 
                    className="w-full bg-white border border-[#e2e8f0] rounded-xl md:rounded-2xl px-4 py-3 md:px-5 md:py-4 text-sm md:text-[16px] focus:border-[#8B5CF6] outline-none text-[#1a1a2e]" 
                    placeholder="Al-Fatah" 
                    value={newLead.companyName} 
                    onChange={e => setNewLead({...newLead, companyName: e.target.value})} 
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 md:space-y-2">
                    <label className="text-base md:text-lg font-bold text-[#1a1a2e]">City</label>
                    <input 
                      required 
                      className="w-full bg-white border border-[#e2e8f0] rounded-xl md:rounded-2xl px-4 py-3 md:px-5 md:py-4 text-sm md:text-[16px] focus:border-[#8B5CF6] outline-none text-[#1a1a2e]" 
                      placeholder="Lahore" 
                      value={newLead.city} 
                      onChange={e => setNewLead({...newLead, city: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-1.5 md:space-y-2">
                    <label className="text-base md:text-lg font-bold text-[#1a1a2e]">Country</label>
                    <input 
                      required 
                      className="w-full bg-white border border-[#e2e8f0] rounded-xl md:rounded-2xl px-4 py-3 md:px-5 md:py-4 text-sm md:text-[16px] focus:border-[#8B5CF6] outline-none text-[#1a1a2e]" 
                      placeholder="Pakistan" 
                      value={newLead.country} 
                      onChange={e => setNewLead({...newLead, country: e.target.value})} 
                    />
                  </div>
                </div>
                <div className="space-y-1.5 md:space-y-2">
                  <label className="text-base md:text-lg font-bold text-[#1a1a2e]">Lead From</label>
                  <div className="relative">
                    <select 
                      className="w-full bg-white border border-[#e2e8f0] rounded-xl md:rounded-2xl px-4 py-3 md:px-5 md:py-4 text-sm md:text-[16px] focus:border-[#8B5CF6] outline-none text-[#1a1a2e] appearance-none" 
                      value={newLead.leadFrom} 
                      onChange={e => setNewLead({...newLead, leadFrom: e.target.value})}
                    >
                      <option>Cappah</option>
                      <option>GreenWay</option>
                      <option>Easycleanup</option>
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                  </div>
                </div>
              </form>

              <div className="p-6 md:p-10 border-t border-gray-100 flex flex-col sm:flex-row gap-3 md:gap-5 flex-shrink-0">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)} 
                  className="w-full sm:flex-1 py-3 md:py-4 bg-[#71717a] text-white font-bold rounded-xl md:rounded-2xl hover:bg-[#52525b] transition-all text-sm md:text-base"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddLead}
                  type="button" 
                  className="w-full sm:flex-[2] py-3 md:py-4 bg-[#8B5CF6] text-white font-bold rounded-xl md:rounded-2xl hover:bg-[#7c3aed] transition-all shadow-lg shadow-[#8B5CF6]/20 text-sm md:text-base"
                >
                  Add Lead
                </button>
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-[2px] animate-in fade-in duration-300 overflow-y-auto">
          <div className="w-full max-w-4xl my-auto animate-in zoom-in duration-300 max-h-[95vh] flex flex-col">
            <GlassCard className="relative flex-1 overflow-hidden flex flex-col p-0 shadow-2xl bg-white border-none rounded-[24px] md:rounded-[40px]" glow="none">
              <div className="flex items-center gap-3 p-6 md:p-12 border-b border-gray-100 flex-shrink-0">
                <FileText className="text-[#8B5CF6]" size={28} />
                <h2 className="text-xl md:text-2xl font-bold text-[#1a1a2e]">Import Leads</h2>
              </div>
              
              <div className="p-6 md:p-12 flex-1 overflow-y-auto custom-scrollbar">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#e2e8f0] rounded-2xl md:rounded-[48px] p-8 md:p-20 text-center hover:border-[#8B5CF6] transition-all cursor-pointer group mb-0"
                >
                  <div className="space-y-4 md:space-y-8">
                    <div className="w-16 h-16 md:w-24 md:h-24 bg-[#f8fafc] rounded-full flex items-center justify-center mx-auto border border-[#e2e8f0] group-hover:scale-110 transition-transform">
                      <CloudUpload size={32} className="md:text-[48px] text-[#1a1a2e]" />
                    </div>
                    <div>
                      <h4 className="text-lg md:text-[28px] font-bold text-[#1a1a2e] px-4">Choose a file or drag &drop it here</h4>
                      <p className="text-gray-400 text-sm md:text-lg mt-2 md:mt-4 font-medium">You can add up to csv file jpg, excel file</p>
                    </div>
                    <button className="px-8 md:px-14 py-2.5 md:py-4 bg-[#8B5CF6] text-white rounded-xl md:rounded-2xl font-bold hover:bg-[#7c3aed] transition-all shadow-md shadow-[#8B5CF6]/20 text-sm md:text-lg">
                      Browse File
                    </button>
                    <input type="file" ref={fileInputRef} hidden accept=".csv,.xlsx,.xls" />
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-12 border-t border-gray-100 flex flex-col sm:flex-row gap-3 md:gap-6 flex-shrink-0">
                <button 
                  onClick={() => setShowImportModal(false)} 
                  className="w-full sm:flex-1 py-3 md:py-4 bg-[#71717a] text-white font-bold rounded-xl md:rounded-[20px] hover:bg-[#52525b] transition-all text-base md:text-xl"
                >
                  Cancel
                </button>
                <button 
                  className="w-full sm:flex-[2] py-3 md:py-4 bg-[#8B5CF6] text-white font-bold rounded-xl md:rounded-[20px] hover:bg-[#7c3aed] transition-all shadow-lg shadow-[#8B5CF6]/30 text-base md:text-xl"
                >
                  Import Leads
                </button>
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsManager;
