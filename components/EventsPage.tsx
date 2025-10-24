import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { EventData, Tab } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

const ShareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const PencilIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
const LockClosedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>;

interface EventsPageProps {
  setActiveTab: (tab: Tab) => void;
}

export const EventsPage: React.FC<EventsPageProps> = ({ setActiveTab }) => {
    const { savedEvents, setSavedEvents, getCalculatedCosts, loadEventForEditing } = useAppContext();
    const [sharingEventId, setSharingEventId] = useState<string | null>(null);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState<string | null>(null);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const DELETE_EVENT_PASSWORD = '12345';

    const handleRequestDelete = (eventId: string) => {
        setShowDeleteConfirmModal(eventId);
        setPassword('');
        setPasswordError('');
    };

    const handleConfirmDelete = () => {
        if (password !== DELETE_EVENT_PASSWORD) {
            setPasswordError('Senha incorreta.');
            return;
        }
        if (showDeleteConfirmModal) {
            setSavedEvents((prev: EventData[]) => prev.filter((e: EventData) => e.id !== showDeleteConfirmModal));
        }
        setShowDeleteConfirmModal(null);
        setPassword('');
        setPasswordError('');
    };

    const handleSharePdf = async (event: EventData) => {
        setSharingEventId(event.id);
        // Allow UI to update to loading state before blocking to generate PDF
        await new Promise(resolve => setTimeout(resolve, 50));

        try {
            const doc = new jsPDF();

            // Title and Subtitle
            doc.setFontSize(18);
            doc.text(`Relatório do Evento: ${event.name}`, 14, 22);
            doc.setFontSize(11);
            const eventDate = new Date(event.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
            doc.text(`${event.location} - ${eventDate}`, 14, 30);

            // Financial Summary
            doc.setFontSize(14);
            doc.text('Resumo Financeiro', 14, 45);
            autoTable(doc, {
                startY: 50,
                body: [
                    ['Total de Vendas', `R$ ${(event.totalSales ?? 0).toFixed(2)}`],
                    ['Total de Custos', `R$ ${(event.totalCosts ?? 0).toFixed(2)}`],
                    [{ content: 'Lucro', styles: { fontStyle: 'bold' } }, { content: `R$ ${(event.profit ?? 0).toFixed(2)}`, styles: { fontStyle: 'bold' } }]
                ],
                theme: 'grid',
            });

            const finalYAfterSummary = (doc as any).lastAutoTable.finalY;

            // Cost Breakdown
            const { fuelCost, helperCost } = getCalculatedCosts(event);
            const productsCost = event.products.reduce((acc, p) => acc + (p.quantitySold * p.costPrice), 0);
            doc.setFontSize(14);
            doc.text('Detalhamento de Custos', 14, finalYAfterSummary + 15);
            autoTable(doc, {
                startY: finalYAfterSummary + 20,
                body: [
                    ['Combustível (Ida e Volta)', `R$ ${fuelCost.toFixed(2)}`],
                    ['Ajudantes', `R$ ${helperCost.toFixed(2)}`],
                    ['Custos Extras', `R$ ${(parseFloat(String(event.extraCosts)) || 0).toFixed(2)}`],
                    ['Custo dos Produtos Vendidos', `R$ ${productsCost.toFixed(2)}`],
                ],
                theme: 'striped'
            });
            
            const finalYAfterCosts = (doc as any).lastAutoTable.finalY;

            // Sales Breakdown Table
            const salesData = event.products
                .filter(p => p.quantitySold > 0)
                .map(p => [p.name, p.quantitySold, `R$ ${p.sellPrice.toFixed(2)}`, `R$ ${(p.quantitySold * p.sellPrice).toFixed(2)}`]);
            if(salesData.length > 0) {
                doc.setFontSize(14);
                doc.text('Vendas por Produto', 14, finalYAfterCosts + 15);
                autoTable(doc, {
                    startY: finalYAfterCosts + 20,
                    head: [['Produto', 'Qtd. Vendida', 'Preço Un.', 'Total']],
                    body: salesData,
                });
            }
            
            // Inventory Summary Table
            const inventoryData = event.products
                .filter(p => (parseFloat(String(p.quantityTaken)) || 0) > 0)
                .map(p => [p.name, p.quantityTaken, p.quantitySold, (parseFloat(String(p.quantityTaken)) || 0) - p.quantitySold]);
            const finalYAfterSales = (doc as any).lastAutoTable.finalY || finalYAfterCosts;
            if(inventoryData.length > 0) {
                doc.setFontSize(14);
                doc.text('Resumo do Estoque', 14, finalYAfterSales + 15);
                autoTable(doc, {
                    startY: finalYAfterSales + 20,
                    head: [['Produto', 'Qtd. Levada', 'Qtd. Vendida', 'Sobra']],
                    body: inventoryData,
                });
            }

            const pdfBlob = doc.output('blob');
            const pdfFile = new File([pdfBlob], `Relatorio_${event.name.replace(/\s/g, '_')}.pdf`, { type: 'application/pdf' });
            const shareData = { 
                files: [pdfFile], 
                title: `Relatório do Evento: ${event.name}`, 
                text: `*Relatório do Evento: ${event.name}*\n\nSegue o relatório detalhado em PDF.` 
            };

            if (navigator.canShare && navigator.canShare(shareData)) {
                await navigator.share(shareData);
            } else {
                alert('Não é possível compartilhar diretamente a partir deste navegador/computador. O arquivo PDF será baixado para que você possa enviá-lo manualmente.');
                console.log("Web Share API for files not supported, falling back to download.");
                const link = document.createElement('a');
                link.href = URL.createObjectURL(pdfFile);
                link.download = pdfFile.name;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                console.error('Error sharing PDF:', error);
                alert('Não foi possível compartilhar ou baixar o arquivo. Verifique as permissões do seu navegador.');
            } else {
                console.log('Share action was cancelled by the user.');
            }
        } finally {
            setSharingEventId(null);
        }
    };

    return (
        <div className="space-y-6">
            <Card title="Histórico de Eventos">
                {savedEvents.length > 0 ? (
                    <div className="space-y-4">
                        {savedEvents.slice().reverse().map(event => {
                            const isSharing = sharingEventId === event.id;
                            return (
                                <div key={event.id} className="p-4 bg-white rounded-lg shadow-md border border-purple-100">
                                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-purple-800">{event.name}</h3>
                                            <p className="text-sm text-gray-500">{event.location} - {new Date(event.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                                        </div>
                                        <div className="flex space-x-2 flex-shrink-0">
                                            <Button
                                                variant="secondary"
                                                onClick={() => loadEventForEditing(event.id, () => setActiveTab('home'))}
                                                icon={<PencilIcon />}
                                                disabled={isSharing}
                                            >
                                                Editar
                                            </Button>
                                            <Button 
                                                variant="secondary" 
                                                onClick={() => handleSharePdf(event)} 
                                                icon={isSharing ? null : <ShareIcon />}
                                                disabled={isSharing}
                                            >
                                                {isSharing ? 'Gerando...' : 'Compartilhar'}
                                            </Button>
                                            <Button 
                                                variant="danger" 
                                                onClick={() => handleRequestDelete(event.id)} 
                                                icon={<TrashIcon />}
                                                disabled={isSharing} 
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-purple-100 grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                                        <div>
                                            <p className="text-xs text-gray-500">Vendas</p>
                                            <p className="font-semibold text-green-600">R$ {(event.totalSales ?? 0).toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Custos</p>
                                            <p className="font-semibold text-red-600">R$ {(event.totalCosts ?? 0).toFixed(2)}</p>
                                        </div>
                                        <div className="col-span-2 md:col-span-1">
                                            <p className="text-xs text-gray-500">Lucro</p>
                                            <p className={`font-bold text-lg ${(event.profit ?? 0) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                                R$ {(event.profit ?? 0).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-center text-gray-500">Nenhum evento foi salvo ainda.</p>
                )}
            </Card>

            {showDeleteConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
                  <Card title="Confirmar Exclusão" className="w-full max-w-sm">
                    <p className="mb-4 text-sm text-gray-600">Para excluir o evento, por favor, insira a senha. Esta ação não pode ser desfeita.</p>
                    <Input
                      label="Senha"
                      id="delete-event-password"
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordError('');
                      }}
                      icon={<LockClosedIcon />}
                      onKeyUp={(e) => e.key === 'Enter' && handleConfirmDelete()}
                    />
                    {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>}
                    <div className="flex justify-end space-x-2 mt-4">
                      <Button variant="secondary" onClick={() => setShowDeleteConfirmModal(null)}>Cancelar</Button>
                      <Button variant="danger" onClick={handleConfirmDelete}>Confirmar Exclusão</Button>
                    </div>
                  </Card>
                </div>
            )}
        </div>
    );
};
