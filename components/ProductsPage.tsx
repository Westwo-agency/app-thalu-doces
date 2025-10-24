import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import type { Product } from '../types';

const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const LockClosedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>;

const PASSWORD = '123';

export const ProductsPage: React.FC = () => {
  const { products, setProducts, currentEvent, updateCurrentEvent, updateEventProduct } = useAppContext();
  const [newProduct, setNewProduct] = useState({ name: '', costPrice: '', sellPrice: '' });
  const [showPasswordPrompt, setShowPasswordPrompt] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleAddProduct = () => {
    if (newProduct.name && newProduct.costPrice && newProduct.sellPrice) {
      const productToAdd: Product = {
        id: `prod_${new Date().toISOString()}`,
        name: newProduct.name,
        costPrice: parseFloat(String(newProduct.costPrice).replace(',', '.')) || 0,
        sellPrice: parseFloat(String(newProduct.sellPrice).replace(',', '.')) || 0,
      };
      setProducts(prev => [...prev, productToAdd]);
      setNewProduct({ name: '', costPrice: '', sellPrice: '' });
    }
  };

  const handleRequestDelete = (productId: string) => {
    setShowPasswordPrompt(productId);
    setPassword('');
    setPasswordError('');
  };

  const handleDeleteProduct = () => {
    if (password !== PASSWORD) {
      setPasswordError('Senha incorreta.');
      return;
    }
    if (showPasswordPrompt) {
      setProducts(prev => prev.filter(p => p.id !== showPasswordPrompt));
    }
    setShowPasswordPrompt(null);
    setPassword('');
    setPasswordError('');
  };

  const isFormValid = newProduct.name && newProduct.costPrice && newProduct.sellPrice;

  return (
    <div className="space-y-6">
      <Card title="Cadastrar Novo Produto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
          <Input 
            label="Nome do Produto" 
            id="productName" 
            value={newProduct.name}
            onChange={e => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Ex: Brigadeiro"
          />
          <Input 
            label="Preço de Custo (R$)" 
            id="costPrice"
            type="number"
            min="0"
            step="0.01"
            value={newProduct.costPrice}
            onChange={e => setNewProduct(prev => ({ ...prev, costPrice: e.target.value }))}
            placeholder="Ex: 1.50"
          />
          <Input 
            label="Preço de Venda (R$)" 
            id="sellPrice"
            type="number"
            min="0"
            step="0.01"
            value={newProduct.sellPrice}
            onChange={e => setNewProduct(prev => ({ ...prev, sellPrice: e.target.value }))}
            placeholder="Ex: 3.00"
          />
        </div>
        <div className="mt-4 text-right">
          <Button onClick={handleAddProduct} disabled={!isFormValid}>
            Adicionar Produto
          </Button>
        </div>
      </Card>

      <Card title="Produtos Cadastrados e Estoque do Evento">
        {products.length > 0 ? (
          <div className="space-y-4">
            {products.map(product => {
              const eventProduct = currentEvent.products.find(p => p.id === product.id);
              return (
                <div key={product.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center p-3 bg-purple-50 rounded-lg">
                  <div className="md:col-span-2">
                    <p className="font-semibold text-purple-800">{product.name}</p>
                    <p className="text-xs text-gray-500">
                      Custo: R$ {product.costPrice.toFixed(2)} / Venda: R$ {product.sellPrice.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      label="Qtd. p/ Evento"
                      id={`qty-${product.id}`}
                      type="number"
                      min="0"
                      value={eventProduct?.quantityTaken ?? ''}
                      onChange={e => updateEventProduct(product.id, 'quantityTaken', e.target.value)}
                      className="w-24 bg-white"
                    />
                  </div>
                  <div className="text-right">
                    <Button variant="danger" onClick={() => handleRequestDelete(product.id)} icon={<TrashIcon />} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-500">Nenhum produto cadastrado ainda.</p>
        )}
      </Card>

      <Card title="Outros Custos Fixos do Evento">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
               <Input 
                label="Nº de Ajudantes" 
                id="helpers" 
                type="number" 
                min="0"
                value={currentEvent.helpers}
                onChange={e => updateCurrentEvent('helpers', e.target.value)}
              />
              <Input 
                label="Pagamento por Ajudante (R$)" 
                id="helperPayment" 
                type="number" 
                min="0"
                step="0.01"
                value={currentEvent.helperPayment}
                onChange={e => updateCurrentEvent('helperPayment', e.target.value)}
              />
               <Input 
                label="Custos Extras (R$)" 
                id="extraCosts" 
                type="number" 
                min="0"
                step="0.01"
                value={currentEvent.extraCosts}
                onChange={e => updateCurrentEvent('extraCosts', e.target.value)}
                placeholder="Ex: Aluguel de barraca"
              />
          </div>
      </Card>
      
      {showPasswordPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
          <Card title="Confirmação Necessária" className="w-full max-w-sm">
            <p className="mb-4 text-sm text-gray-600">Para excluir o produto, por favor, insira a senha.</p>
            <Input
              label="Senha"
              id="delete-password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError('');
              }}
              icon={<LockClosedIcon />}
            />
            {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>}
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="secondary" onClick={() => setShowPasswordPrompt(null)}>Cancelar</Button>
              <Button variant="danger" onClick={handleDeleteProduct}>Confirmar Exclusão</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};