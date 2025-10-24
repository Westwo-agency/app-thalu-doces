// context/AppContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import type { Product, EventData, EventProduct } from '../types';

// Function to get a fresh initial state for an event
const getInitialEvent = (): EventData => ({
  id: `event_${new Date().toISOString()}`,
  name: '',
  date: new Date().toISOString().split('T')[0],
  location: '',
  eventAddress: '',
  products: [],
  helpers: '',
  helperPayment: '',
  extraCosts: '',
  startAddress: '',
  distance: '',
  consumption: '',
  fuelPrice: '',
});

interface AppContextType {
  products: Product[];
  addProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  savedEvents: EventData[];
  setSavedEvents: React.Dispatch<React.SetStateAction<EventData[]>>;
  saveEvent: () => void;
  currentEvent: EventData;
  setCurrentEvent: React.Dispatch<React.SetStateAction<EventData>>;
  updateCurrentEvent: <K extends keyof EventData>(field: K, value: EventData[K]) => void;
  updateEventProduct: (productId: string, field: 'quantityTaken' | 'quantitySold', value: string | number) => void;
  getCalculatedCosts: (event: EventData) => {
    productsCost: number;
    fuelCost: number;
    helperCost: number;
    totalCosts: number;
  };
  resetCurrentEvent: () => void;
  loadEventForEditing: (eventId: string, onLoaded: () => void) => void;
  isEditing: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useLocalStorage<Product[]>('products', []);
  const [savedEvents, setSavedEvents] = useLocalStorage<EventData[]>('savedEvents', []);
  const [currentEvent, setCurrentEvent] = useLocalStorage<EventData>('currentEvent', getInitialEvent());
  const [isEditing, setIsEditing] = useState(false);

  const updateCurrentEvent = useCallback(<K extends keyof EventData>(field: K, value: EventData[K]) => {
    setCurrentEvent(prev => ({ ...prev, [field]: value }));
  }, [setCurrentEvent]);

  const updateEventProduct = useCallback((productId: string, field: 'quantityTaken' | 'quantitySold', value: string | number) => {
    setCurrentEvent(prev => {
      const existingProductInfo = products.find(p => p.id === productId);
      if (!existingProductInfo) return prev;

      const newEventProducts = [...prev.products];
      const productIndex = newEventProducts.findIndex(p => p.id === productId);

      if (productIndex > -1) {
        // Update existing event product
        newEventProducts[productIndex] = { ...newEventProducts[productIndex], [field]: value };
      } else {
        // Add new event product
        const newEventProduct: EventProduct = {
          ...existingProductInfo,
          quantityTaken: 0,
          quantitySold: 0,
          [field]: value,
        };
        newEventProducts.push(newEventProduct);
      }

      return { ...prev, products: newEventProducts };
    });
  }, [setCurrentEvent, products]);
  
  const getCalculatedCosts = useCallback((event: EventData) => {
    const distance = parseFloat(String(event.distance)) || 0;
    const consumption = parseFloat(String(event.consumption)) || 0;
    const fuelPrice = parseFloat(String(event.fuelPrice)) || 0;
    
    const fuelCost = consumption > 0 ? ((distance * 2) / consumption) * fuelPrice : 0;
    
    const helpers = parseFloat(String(event.helpers)) || 0;
    const helperPayment = parseFloat(String(event.helperPayment)) || 0;
    const helperCost = helpers * helperPayment;
    
    const extraCosts = parseFloat(String(event.extraCosts)) || 0;

    const productsCost = event.products.reduce((acc, p) => {
      const sold = p.quantitySold || 0;
      const cost = p.costPrice || 0;
      return acc + (sold * cost);
    }, 0);

    const totalCosts = productsCost + fuelCost + helperCost + extraCosts;

    return { productsCost, fuelCost, helperCost, totalCosts };
  }, []);

  const addProduct = useCallback((product: Product) => {
    setProducts(prev => [...prev, product]);
  }, [setProducts]);

  const deleteProduct = useCallback((productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  }, [setProducts]);

  const saveEvent = useCallback(() => {
    const totalSales = currentEvent.products.reduce((acc, p) => acc + (p.quantitySold * p.sellPrice), 0);
    const { totalCosts } = getCalculatedCosts(currentEvent);
    const profit = totalSales - totalCosts;

    const eventToSave = {
        ...currentEvent,
        totalSales,
        totalCosts,
        profit,
    };

    setSavedEvents(prev => {
      const existingEventIndex = prev.findIndex(e => e.id === eventToSave.id);
      if (existingEventIndex > -1) {
          const updatedEvents = [...prev];
          updatedEvents[existingEventIndex] = eventToSave;
          return updatedEvents;
      }
      return [...prev, eventToSave];
    });
  }, [currentEvent, setSavedEvents, getCalculatedCosts]);

  const resetCurrentEvent = useCallback(() => {
    setCurrentEvent(getInitialEvent());
    setIsEditing(false);
  }, [setCurrentEvent]);
  
  const loadEventForEditing = useCallback((eventId: string, onLoaded: () => void) => {
    const eventToLoad = savedEvents.find(e => e.id === eventId);
    if (eventToLoad) {
      setCurrentEvent(eventToLoad);
      setIsEditing(true);
      onLoaded();
    }
  }, [savedEvents, setCurrentEvent]);

  // FIX: Removed the 'useMemo' hook that was causing build errors.
  const value: AppContextType = {
    products,
    addProduct,
    deleteProduct,
    savedEvents,
    setSavedEvents,
    saveEvent,
    currentEvent,
    setCurrentEvent,
    updateCurrentEvent,
    updateEventProduct,
    getCalculatedCosts,
    resetCurrentEvent,
    loadEventForEditing,
    isEditing,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
