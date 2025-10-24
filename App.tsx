import React, { useState, useCallback } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import type { Tab } from './types';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { ProductsPage } from './components/ProductsPage';
import { SalesPage } from './components/SalesPage';
import { EventsPage } from './components/EventsPage';
import { Card } from './components/ui/Card';
import { Input } from './components/ui/Input';
import { Button } from './components/ui/Button';

const LockClosedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>;
const PRODUCTS_PAGE_PASSWORD = '12345';
const SAVE_EVENT_PASSWORD = '12345';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const { currentEvent, saveEvent, resetCurrentEvent } = useAppContext();

  const [isProductsPageUnlocked, setIsProductsPageUnlocked] = useState(false);
  const [showProductsPasswordModal, setShowProductsPasswordModal] = useState(false);
  const [productsPasswordInput, setProductsPasswordInput] = useState('');
  const [productsPasswordError, setProductsPasswordError] = useState('');

  const [showSavePasswordModal, setShowSavePasswordModal] = useState(false);
  const [savePasswordInput, setSavePasswordInput] = useState('');
  const [savePasswordError, setSavePasswordError] = useState('');

  const [showShareModal, setShowShareModal] = useState(false);
  const [copyButtonText, setCopyButtonText] = useState('Copiar');

  const handleShareClick = () => {
    setShowShareModal(true);
    setCopyButtonText('Copiar'); 
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
        setCopyButtonText('Copiado!');
        setTimeout(() => setCopyButtonText('Copiar'), 2000);
    }).catch(err => {
        console.error('Falha ao copiar o link: ', err);
        setCopyButtonText('Erro!');
        setTimeout(() => setCopyButtonText('Copiar'), 2000);
    });
  };

  const executeSaveEvent = useCallback(() => {
    saveEvent();
    alert('Evento salvo com sucesso!');
    setShowSavePasswordModal(false);
    resetCurrentEvent();
    setActiveTab('events');
    // CORREÇÃO: Adicionada a dependência 'setActiveTab' ao array do useCallback.
  }, [saveEvent, resetCurrentEvent, setActiveTab]);

  const handleSaveEventRequest = useCallback(() => {
      if (!currentEvent.name) {
          alert("Por favor, dê um nome ao evento antes de salvar.");
          setActiveTab('home');
          return;
      }
      setSavePasswordInput('');
      setSavePasswordError('');
      setShowSavePasswordModal(true);
    // CORREÇÃO: Adicionada a dependência 'setActiveTab' ao array do useCallback.
  }, [currentEvent.name, setActiveTab]);
  
  const handleProductsPasswordCheck = () => {
    if (productsPasswordInput === PRODUCTS_PAGE_PASSWORD) {
        setIsProductsPageUnlocked(true);
        setShowProductsPasswordModal(false);
        setActiveTab('products');
        setProductsPasswordInput('');
        setProductsPasswordError('');
    } else {
        setProductsPasswordError('Senha incorreta.');
    }
  };

  const handleSavePasswordCheck = () => {
    if (savePasswordInput === SAVE_EVENT_PASSWORD) {
      executeSaveEvent();
    } else {
      setSavePasswordError('Senha incorreta.');
    }
  };

  const handleTabChange = (tab: Tab) => {
    if (tab === 'products' && !isProductsPageUnlocked) {
      setProductsPasswordError('');
      setProductsPasswordInput('');
      setShowProductsPasswordModal(true);
    } else {
      setActiveTab(tab);
    }
  };
  
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage />;
      case 'products':
        return <ProductsPage />;
      case 'sales':
        return <SalesPage onSaveEvent={handleSaveEventRequest} />;
      case 'events':
        return <EventsPage setActiveTab={setActiveTab} />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-purple-50 text-gray-800 font-sans">
      <Header activeTab={activeTab} setActiveTab={handleTabChange} onShareClick={handleShareClick} />
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </main>
      <footer className="text-center py-4 text-xs text-purple-400">
        Feito com ♡ para Thalu Doces
      </footer>
      
      {showProductsPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <Card title="Acesso Restrito" className="w-full max-w-sm">
                <p className="mb-4 text-sm text-gray-600">Por favor, insira a senha para acessar a página de Produtos e Custos.</p>
                <Input
                  label="Senha"
                  id="page-password"
                  type="password"
                  value={productsPasswordInput}
                  onChange={(e) => {
                    setProductsPasswordInput(e.target.value);
                    setProductsPasswordError('');
                  }}
                  onKeyUp={(e) => e.key === 'Enter' && handleProductsPasswordCheck()}
                  icon={<LockClosedIcon />}
                />
                {productsPasswordError && <p className="text-red-500 text-xs mt-1">{productsPasswordError}</p>}
                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="secondary" onClick={() => setShowProductsPasswordModal(false)}>Cancelar</Button>
                  <Button variant="primary" onClick={handleProductsPasswordCheck}>Entrar</Button>
                </div>
            </Card>
        </div>
      )}

      {showSavePasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <Card title="Confirmar Alterações" className="w-full max-w-sm">
                <p className="mb-4 text-sm text-gray-600">Para salvar as informações do evento, por favor, insira a senha.</p>
                <Input
                  label="Senha"
                  id="save-password"
                  type="password"
                  value={savePasswordInput}
                  onChange={(e) => {
                    setSavePasswordInput(e.target.value);
                    setSavePasswordError('');
                  }}
                  onKeyUp={(e) => e.key === 'Enter' && handleSavePasswordCheck()}
                  icon={<LockClosedIcon />}
                />
                {savePasswordError && <p className="text-red-500 text-xs mt-1">{savePasswordError}</p>}
                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="secondary" onClick={() => setShowSavePasswordModal(false)}>Cancelar</Button>
                  <Button variant="primary" onClick={handleSavePasswordCheck}>Confirmar e Salvar</Button>
                </div>
            </Card>
        </div>
      )}

      {showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
              <Card title="Compartilhar App" className="w-full max-w-lg">
                  <p className="mb-4 text-sm text-gray-600">
                      Copie e envie este link. A pessoa que recebê-lo terá acesso apenas à visualização e uso do aplicativo, sem acesso ao código-fonte.
                  </p>
                  <div className="flex items-end space-x-2">
                      <Input
                          label="Link para Compartilhamento"
                          id="share-link"
                          type="text"
                          value={window.location.href}
                          readOnly
                          className="bg-gray-100"
                      />
                      <Button onClick={handleCopyLink} className="flex-shrink-0">
                          {copyButtonText}
                      </Button>
                  </div>
                  <div className="text-right mt-4">
                      <Button variant="secondary" onClick={() => setShowShareModal(false)}>Fechar</Button>
                  </div>
              </Card>
          </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
