import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import type { Product, EventData, EventProduct } from '../types';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, doc, setDoc, deleteDoc, getDocs, writeBatch } from 'firebase/firestore';

const createInitialEventState = (): EventData => ({
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
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  savedEvents: EventData[];
  saveEvent: (event: EventData) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  currentEvent: EventData;
  updateCurrentEvent: (key: keyof EventData, value: any) => void;
  updateEventProduct: (productId: string, key: keyof EventProduct, value: any) => void;
  resetCurrentEvent: () => void;
  getCalculatedCosts: (event: EventData) => {
    fuelCost: number;
    helperCost: number;
    productsCost: number;
    totalCosts: number;
  };
  isEditing: boolean;
  loadEventForEditing: (eventId: string, callback?: () => void) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [savedEvents, setSavedEvents] = useState<EventData[]>([]);
  const [currentEvent, setCurrentEvent] = useState<EventData>(createInitialEventState());
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const migrateData = async () => {
      const migrationDone = localStorage.getItem('firebaseMigrationDone');
      if (migrationDone) return;
      console.log("Iniciando migração de dados do localStorage para o Firebase...");
      try {
        const batch = writeBatch(db);
        const localProducts: Product[] = JSON.parse(localStorage.getItem('products') || '[]');
        if (localProducts.length > 0) {
          const productsCollection = collection(db, "products");
          const existingProductsSnap = await getDocs(productsCollection);
          if (existingProductsSnap.empty) {
            localProducts.forEach(product => {
              const docRef = doc(productsCollection, product.id);
              batch.set(docRef, product);
            });
          }
        }
        const localEvents: EventData[] = JSON.parse(localStorage.getItem('savedEvents') || '[]');
        if (localEvents.length > 0) {
           const eventsCollection = collection(db, "savedEvents");
           const existingEventsSnap = await getDocs(eventsCollection);
           if (existingEventsSnap.empty) {
              localEvents.forEach(event => {
                const docRef = doc(eventsCollection, event.id);
                batch.set(docRef, event);
              });
           }
        }
        await batch.commit();
        console.log("Migração concluída com sucesso!");
        localStorage.setItem('firebaseMigrationDone', 'true');
      } catch (error) {
        console.error("Erro durante a migração de dados:", error);
      }
    };
    migrateData();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Product[];
      setProducts(productsData);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "savedEvents"), (snapshot) => {
      const eventsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as EventData[];
      setSavedEvents(eventsData);
    });
    return () => unsubscribe();
  }, []);

  const addProduct = async (productData: Omit<Product, 'id'>) => {
    const newDocRef = doc(collection(db, "products"));
    const newProduct: Product = { ...productData, id: newDocRef.id };
    await setDoc(newDocRef, newProduct);
  };
  
  const deleteProduct = async (productId: string) => {
    const batch = writeBatch(db);
    const productDocRef = doc(db, "products", productId);
    batch.delete(productDocRef);
    savedEvents.forEach(event => {
      if (event.products.some(p => p.id === productId)) {
        const updatedProducts = event.products.filter(p => p.id !== productId);
        const eventDocRef = doc(db, "savedEvents", event.id);
        batch.update(eventDocRef, { products: updatedProducts });
      }
    });
    await batch.commit();
  };

  const saveEvent = async (event: EventData) => {
    await setDoc(doc(db, "savedEvents", event.id), event);
  };
  
  const deleteEvent = async (eventId: string) => {
    await deleteDoc(doc(db, "savedEvents", eventId));
  };
  
  const updateCurrentEvent = useCallback((key: keyof EventData, value: any) => {
    setCurrentEvent(prev => ({ ...prev, [key]: value }));
  }, []);
  
  const updateEventProduct = useCallback((productId: string, key: keyof EventProduct, value: any) => {
    setCurrentEvent(prevEvent => {
      const productTemplate = products.find(p => p.id === productId);
      if (!productTemplate) return prevEvent;
      const existingProductIndex = prevEvent.products.findIndex(p => p.id === productId);
      let updatedProducts: EventProduct[];
      if (existingProductIndex > -1) {
        updatedProducts = [...prevEvent.products];
        const updatedProduct = { ...updatedProducts[existingProductIndex], [key]: value };
        updatedProducts[existingProductIndex] = updatedProduct;
      } else {
        const newEventProduct: EventProduct = {
          ...productTemplate,
          quantityTaken: 0,
          quantitySold: 0,
          [key]: value,
        };
        updatedProducts = [...prevEvent.products, newEventProduct];
      }
      return { ...prevEvent, products: updatedProducts };
    });
  }, [products]);

  const resetCurrentEvent = useCallback(() => {
    setCurrentEvent(createInitialEventState());
    setIsEditing(false);
  }, []);

  const loadEventForEditing = useCallback((eventId: string, callback?: () => void) => {
    const eventToEdit = savedEvents.find(e => e.id === eventId);
    if (eventToEdit) {
      setCurrentEvent(eventToEdit);
      setIsEditing(true);
      if (callback) callback();
    }
  }, [savedEvents]);

  const getCalculatedCosts = useCallback((event: EventData) => {
    const distance = parseFloat(String(event.distance)) || 0;
    const consumption = parseFloat(String(event.consumption)) || 0;
    const fuelPrice = parseFloat(String(event.fuelPrice)) || 0;
    const fuelCost = consumption > 0 ? (distance / consumption) * fuelPrice : 0;
    const helpers = parseFloat(String(event.helpers)) || 0;
    const helperPayment = parseFloat(String(event.helperPayment)) || 0;
    const helperCost = helpers * helperPayment;
    const extraCosts = parseFloat(String(event.extraCosts)) || 0;
    const productsCost = event.products.reduce((acc, p) => acc + (p.quantitySold * p.costPrice), 0);
    const totalCosts = fuelCost + helperCost + extraCosts + productsCost;
    return { fuelCost, helperCost, productsCost, totalCosts };
  }, []);
  
  const value: AppContextType = {
    products,
    addProduct,
    deleteProduct,
    savedEvents,
    saveEvent,
    deleteEvent,
    currentEvent,
    updateCurrentEvent,
    updateEventProduct,
    resetCurrentEvent,
    getCalculatedCosts,
    isEditing,
    loadEventForEditing,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
