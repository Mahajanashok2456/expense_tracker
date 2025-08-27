
import React, { createContext, useContext, ReactNode } from 'react';
import { Transaction, Category, TransactionType } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';
import { icons } from 'lucide-react';

const UNCATEGORIZED_ID = 'uncategorized';

const DEFAULT_CATEGORIES: Category[] = [
  { id: UNCATEGORIZED_ID, name: 'Uncategorized', color: '#64748b', icon: 'Shapes', parentId: null },
  { id: '1', name: 'Groceries', color: '#3b82f6', icon: 'ShoppingCart', parentId: null },
  { id: '2', name: 'Transport', color: '#ef4444', icon: 'Car', parentId: null },
  { id: '3', name: 'Entertainment', color: '#eab308', icon: 'Ticket', parentId: null },
  { id: '4', name: 'Salary', color: '#22c55e', icon: 'Landmark', parentId: null },
];

interface AppContextType {
  transactions: Transaction[];
  categories: Category[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  getCategoryById: (id: string | null) => Category | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
  const [categories, setCategories] = useLocalStorage<Category[]>('categories', DEFAULT_CATEGORIES);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    setTransactions(prev => [...prev, { ...transaction, id: crypto.randomUUID() }]);
  };

  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(prev => prev.map(t => (t.id === updatedTransaction.id ? updatedTransaction : t)));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    setCategories(prev => [...prev, { ...category, id: crypto.randomUUID() }]);
  };

  const updateCategory = (updatedCategory: Category) => {
    setCategories(prev => prev.map(c => (c.id === updatedCategory.id ? updatedCategory : c)));
  };

  const deleteCategory = (id: string) => {
    if (id === UNCATEGORIZED_ID) {
      alert("Cannot delete the default 'Uncategorized' category.");
      return;
    }
    // Reassign transactions to 'Uncategorized'
    setTransactions(prev =>
      prev.map(t => (t.categoryId === id ? { ...t, categoryId: UNCATEGORIZED_ID } : t))
    );
    // Delete the category
    setCategories(prev => prev.filter(c => c.id !== id));
  };
  
  const getCategoryById = (id: string | null) => {
    if (id === null) return categories.find(c => c.id === UNCATEGORIZED_ID);
    return categories.find(c => c.id === id);
  }

  return (
    <AppContext.Provider
      value={{
        transactions,
        categories,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addCategory,
        updateCategory,
        deleteCategory,
        getCategoryById,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
