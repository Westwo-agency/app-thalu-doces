// FIX: Create and export the HomePage component to render the main event details form.
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

export const HomePage: React.FC = () => {
  const { currentEvent, updateCurrentEvent, isEditing } = useAppContext();
  const [calculatedFuelCost, setCalculatedFuelCost] = useState<number | null>(null);

  const handleCalculateFuel = () => {
    const distance = parseFloat(String(currentEvent.distance)) || 0;
    const consumption = parseFloat(String(currentEvent.consumption)) || 0;
    const fuelPrice = parseFloat(String(currentEvent.fuelPrice)) || 0;
    
    if (consumption > 0) {
      const cost = (distance / consumption) * fuelPrice;
      setCalculatedFuelCost(cost);
    } else {
      setCalculatedFuelCost(0);
    }
  };

  return (
    <div className="space-y-6">
      <Card title={isEditing ? "Editando Evento" : "Informações do Evento"}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nome do Evento"
            id="eventName"
            value={currentEvent.name}
            onChange={(e) => updateCurrentEvent('name', e.target.value)}
            placeholder="Ex: Feira de Domingo"
          />
          <Input
            label="Data do Evento"
            id="eventDate"
            type="date"
            value={currentEvent.date}
            onChange={(e) => updateCurrentEvent('date', e.target.value)}
          />
          <Input
            label="Local do Evento"
            id="eventLocation"
            value={currentEvent.location}
            onChange={(e) => updateCurrentEvent('location', e.target.value)}
            placeholder="Ex: Praça Central"
            className="md:col-span-2"
          />
           <Input
            label="Endereço do Evento"
            id="eventAddress"
            value={currentEvent.eventAddress}
            onChange={(e) => updateCurrentEvent('eventAddress', e.target.value)}
            placeholder="Ex: Rua das Flores, 123"
            className="md:col-span-2"
          />
        </div>
      </Card>

      <Card title="Cálculo de Combustível">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Endereço de Partida"
              id="startAddress"
              value={currentEvent.startAddress}
              onChange={(e) => updateCurrentEvent('startAddress', e.target.value)}
              placeholder="Ex: Minha Casa"
              className="md:col-span-2"
            />
            <Input
              label="Km total (ida e volta)"
              id="distance"
              type="number"
              min="0"
              value={currentEvent.distance}
              onChange={(e) => {
                updateCurrentEvent('distance', e.target.value)
                setCalculatedFuelCost(null);
              }}
              placeholder="Ex: 50"
            />
            <Input
              label="Consumo (km/L)"
              id="consumption"
              type="number"
              min="0"
              value={currentEvent.consumption}
              onChange={(e) => {
                updateCurrentEvent('consumption', e.target.value)
                setCalculatedFuelCost(null);
              }}
              placeholder="Ex: 12"
            />
            <Input
              label="Preço Combustível (R$/L)"
              id="fuelPrice"
              type="number"
              min="0"
              step="0.01"
              value={currentEvent.fuelPrice}
              onChange={(e) => {
                updateCurrentEvent('fuelPrice', e.target.value)
                setCalculatedFuelCost(null);
              }}
              placeholder="Ex: 5.80"
            />
            <div className="md:col-span-2 flex items-center justify-between gap-4 pt-2">
                <Button onClick={handleCalculateFuel}>
                    Calcular
                </Button>
                {calculatedFuelCost !== null && (
                    <div className="text-right p-2 bg-purple-50 rounded-lg">
                        <p className="text-sm text-gray-600">Custo com combustível:</p>
                        <p className="font-bold text-lg text-purple-800">
                            R$ {calculatedFuelCost.toFixed(2)}
                        </p>
                    </div>
                )}
            </div>
        </div>
      </Card>
    </div>
  );
};