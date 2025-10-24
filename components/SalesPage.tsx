import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

export const SalesPage: React.FC<{ onSaveEvent: () => void }> = ({ onSaveEvent }) => {
  const { currentEvent, updateEventProduct, getCalculatedCosts, isEditing } = useAppContext();

  const productsForSale = useMemo(() => {
    return currentEvent.products.filter(p => (parseFloat(String(p.quantityTaken)) || 0) > 0);
  }, [currentEvent.products]);

  const incrementSale = (productId: string) => {
    const product = currentEvent.products.find(p => p.id === productId);
    if (product && product.quantitySold < (parseFloat(String(product.quantityTaken)) || 0)) {
      updateEventProduct(productId, 'quantitySold', product.quantitySold + 1);
    }
  };

  const decrementSale = (productId: string) => {
    const product = currentEvent.products.find(p => p.id === productId);
    if (product && product.quantitySold > 0) {
      updateEventProduct(productId, 'quantitySold', product.quantitySold - 1);
    }
  };

  const salesByProduct = useMemo(() => {
    return productsForSale.map(p => ({
      ...p,
      totalValue: p.quantitySold * p.sellPrice,
    }));
  }, [productsForSale]);

  const totalSalesValue = useMemo(() => {
    return salesByProduct.reduce((acc, p) => acc + p.totalValue, 0);
  }, [salesByProduct]);
  
  const { fuelCost, helperCost, productsCost, totalCosts } = useMemo(() => getCalculatedCosts(currentEvent), [currentEvent, getCalculatedCosts]);
  
  const profit = useMemo(() => totalSalesValue - totalCosts, [totalSalesValue, totalCosts]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card title="Registrar Vendas">
          {productsForSale.length > 0 ? (
            <div className="space-y-4">
              {productsForSale.map(product => {
                 const quantityTaken = parseFloat(String(product.quantityTaken)) || 0;
                 return (
                    <div key={product.id} className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4 p-3 bg-purple-50 rounded-lg">
                      <div className="font-medium text-purple-800">
                        <p>{product.name}</p>
                        <p className="text-xs text-gray-500">R$ {product.sellPrice.toFixed(2)} / un.</p>
                      </div>
                      <div className="flex items-center justify-center space-x-4">
                        <Button onClick={() => decrementSale(product.id)} className="px-3 py-1 text-lg font-bold">-</Button>
                        <span className="text-xl font-bold w-12 text-center">{product.quantitySold}</span>
                        <Button onClick={() => incrementSale(product.id)} className="px-3 py-1 text-lg font-bold">+</Button>
                      </div>
                      <div className="text-center sm:text-right">
                        <p className="text-gray-500 text-sm">Restante: {quantityTaken - product.quantitySold}</p>
                        <p className="font-semibold text-purple-700">Total: R$ {(product.quantitySold * product.sellPrice).toFixed(2)}</p>
                      </div>
                    </div>
                 );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500">Nenhum produto foi levado para este evento. Defina as quantidades na aba 'Produtos/Custos'.</p>
          )}
        </Card>
      </div>

      <div className="lg:col-span-1">
        <Card title="Resumo Financeiro" className="sticky top-24">
          <div className="space-y-3">
            <div className="text-center mb-4">
                <p className="text-sm text-purple-700">Total de Vendas</p>
                <p className="text-4xl font-bold text-green-600">R$ {totalSalesValue.toFixed(2)}</p>
            </div>
            
            <h3 className="font-semibold text-purple-800 border-t pt-3 mt-3">Detalhes de Custos</h3>
            <div className="flex justify-between text-sm">
                <span className="text-gray-600">Produtos Vendidos:</span>
                <span className="font-medium text-red-600">- R$ {productsCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
                <span className="text-gray-600">Combustível:</span>
                <span className="font-medium text-red-600">- R$ {fuelCost.toFixed(2)}</span>
            </div>
             <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ajudantes:</span>
                <span className="font-medium text-red-600">- R$ {helperCost.toFixed(2)}</span>
            </div>
             <div className="flex justify-between text-sm">
                <span className="text-gray-600">Custos Extras:</span>
                <span className="font-medium text-red-600">- R$ {(parseFloat(String(currentEvent.extraCosts)) || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                <span className="text-purple-800">Total de Custos:</span>
                <span className="text-red-700">R$ {totalCosts.toFixed(2)}</span>
            </div>

            <div className={`flex justify-between text-2xl font-bold p-3 rounded-lg mt-4 ${profit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <span className={`${profit >= 0 ? 'text-green-800' : 'text-red-800'}`}>Lucro:</span>
                <span className={`${profit >= 0 ? 'text-green-800' : 'text-red-800'}`}>R$ {profit.toFixed(2)}</span>
            </div>
            
             <div className="pt-4">
                <Button 
                  onClick={onSaveEvent} 
                  className="w-full"
                  disabled={!currentEvent.name}
                  title={!currentEvent.name ? "Adicione um nome ao evento para salvar" : isEditing ? "Salvar alterações do evento" : "Salvar relatório do evento"}
                >
                  {isEditing ? 'Salvar Alterações' : 'Finalizar e Salvar Evento'}
                </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};