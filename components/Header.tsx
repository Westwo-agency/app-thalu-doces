import React from 'react';
import type { Tab } from '../types';

interface HeaderProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  onShareClick: () => void;
}

const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>;
const CakeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.993.883L4 8v9a1 1 0 001 1h10a1 1 0 001-1V8l-.007-.117A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm-2 4V6a2 2 0 114 0v1H8z" clipRule="evenodd" /></svg>;
const CashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8.433 7.418c.158-.103.346-.196.567-.267v1.698a2.5 2.5 0 00-1.168-.217c-.737 0-1.368.322-1.368.91 0 .588.632.91 1.368.91.319 0 .629-.077.908-.217v1.7c-.25.087-.532.16-.829.217-1.076.166-2.206-.289-2.206-1.582 0-1.316 1.13-1.91 2.206-1.91.319 0 .629.077.908.217z" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 7.95c0 1.229 1.01 1.954 2.457 1.954 1.447 0 2.457-.725 2.457-1.954 0-.94-.602-1.716-1.324-2.258A4.535 4.535 0 0011 5.092V5z" clipRule="evenodd" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>;
const ShareOutlineIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>;


const tabs: { id: Tab; name: string; icon: React.ReactNode }[] = [
  { id: 'home', name: 'Evento', icon: <HomeIcon /> },
  { id: 'products', name: 'Produtos/Custos', icon: <CakeIcon /> },
  { id: 'sales', name: 'Vendas', icon: <CashIcon /> },
  { id: 'events', name: 'Eventos Salvos', icon: <CalendarIcon /> },
];

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onShareClick }) => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          <h1 className="text-2xl font-bold text-purple-800">
            Thalu Doces <span className="font-light">Gestão</span>
          </h1>
          <div className="flex items-center gap-4">
             <nav className="hidden md:flex space-x-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                    }`}
                  >
                    {tab.icon} <span className="ml-2">{tab.name}</span>
                  </button>
                ))}
              </nav>
              <button
                onClick={onShareClick}
                className="p-2 rounded-full text-gray-500 hover:bg-purple-100 hover:text-purple-700 transition-colors"
                title="Compartilhar App para uso"
                aria-label="Compartilhar App para uso"
              >
                <ShareOutlineIcon />
              </button>
          </div>
        </div>
        <div className="md:hidden">
            <div className="flex justify-around border-t border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-gray-500 hover:bg-purple-50 hover:text-purple-600'
                  }`}
                >
                  {tab.icon} <span>{tab.name}</span>
                </button>
              ))}
            </div>
          </div>
      </div>
    </header>
  );
};