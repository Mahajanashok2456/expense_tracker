
import React, { useMemo, useRef, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Transaction, TransactionType } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Download, TrendingUp, TrendingDown, MoreVertical, Upload, FileText, Database } from 'lucide-react';
import { exportToCSV, exportToJSON, exportToPDF, importFromCSV, importFromJSON } from '../utils/helpers';
import DynamicIcon from './ui/DynamicIcon';

const SummaryCard: React.FC<{ title: string; amount: number; icon: React.ReactNode; color: string }> = ({ title, amount, icon, color }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between">
    <div>
      <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
      <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)}
      </p>
    </div>
    <div className={`p-3 rounded-full ${color}`}>
      {icon}
    </div>
  </div>
);

const TransactionItem: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
  const { getCategoryById } = useAppContext();
  const category = getCategoryById(transaction.categoryId);
  const isIncome = transaction.type === TransactionType.INCOME;
  
  return (
    <li className="flex items-center justify-between py-3">
      <div className="flex items-center">
        <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-700 mr-4">
          <DynamicIcon name={category?.icon || 'Shapes'} className="w-5 h-5" style={{ color: category?.color }} />
        </div>
        <div>
          <p className="font-medium text-slate-800 dark:text-slate-200">{category?.name || 'Uncategorized'}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(transaction.date).toLocaleDateString()}</p>
        </div>
      </div>
      <p className={`font-semibold ${isIncome ? 'text-green-500' : 'text-red-500'}`}>
        {isIncome ? '+' : '-'} {new Intl.NumberFormat('en-US', { style: 'currency', currency: transaction.currency || 'USD' }).format(transaction.amount)}
      </p>
    </li>
  );
};

const Dashboard: React.FC = () => {
  const { transactions, categories, getCategoryById, addTransaction, addCategory } = useAppContext();
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

  const summary = useMemo(() => {
    return transactions.reduce(
      (acc, t) => {
        if (t.type === TransactionType.INCOME) {
          acc.income += t.amount;
        } else {
          acc.expense += t.amount;
        }
        acc.balance = acc.income - acc.expense;
        return acc;
      },
      { income: 0, expense: 0, balance: 0 }
    );
  }, [transactions]);

  const expenseByCategory = useMemo(() => {
    const data = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((acc, t) => {
        const category = getCategoryById(t.categoryId) || getCategoryById('uncategorized');
        if (category) {
          if (!acc[category.id]) {
            acc[category.id] = { name: category.name, value: 0, color: category.color };
          }
          acc[category.id].value += t.amount;
        }
        return acc;
      }, {} as { [key: string]: { name: string; value: number; color: string } });
    
    return Object.values(data);
  }, [transactions, getCategoryById]);

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportStatus({ type: null, message: '' });
    
    try {
      const { transactions: importedTransactions, errors } = await importFromCSV(file);
      
      if (errors.length > 0) {
        setImportStatus({ type: 'error', message: `Import completed with ${errors.length} errors: ${errors.slice(0, 3).join(', ')}${errors.length > 3 ? '...' : ''}` });
      }
      
      if (importedTransactions.length > 0) {
        importedTransactions.forEach(transaction => addTransaction(transaction));
        setImportStatus({ 
          type: 'success', 
          message: `Successfully imported ${importedTransactions.length} transaction(s)${errors.length > 0 ? ` with ${errors.length} errors` : ''}` 
        });
      } else if (errors.length === 0) {
        setImportStatus({ type: 'error', message: 'No valid transactions found in the CSV file' });
      }
    } catch (error) {
      setImportStatus({ type: 'error', message: `Failed to import CSV: ${error}` });
    }
    
    // Clear the input
    event.target.value = '';
  };

  const handleImportJSON = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportStatus({ type: null, message: '' });
    
    try {
      const { data, errors } = await importFromJSON(file);
      
      if (errors.length > 0) {
        setImportStatus({ type: 'error', message: `Import completed with ${errors.length} errors: ${errors.slice(0, 3).join(', ')}${errors.length > 3 ? '...' : ''}` });
      }
      
      let importedCount = 0;
      
      // Import categories first
      if (data.categories.length > 0) {
        data.categories.forEach(category => {
          // Check if category with same name already exists
          const existingCategory = categories.find(c => c.name.toLowerCase() === category.name.toLowerCase());
          if (!existingCategory) {
            addCategory(category);
            importedCount++;
          }
        });
      }
      
      // Import transactions
      if (data.transactions.length > 0) {
        data.transactions.forEach(transaction => {
          addTransaction(transaction);
          importedCount++;
        });
      }
      
      if (importedCount > 0) {
        setImportStatus({ 
          type: 'success', 
          message: `Successfully imported ${data.transactions.length} transaction(s) and ${data.categories.length} new categor${data.categories.length === 1 ? 'y' : 'ies'}${errors.length > 0 ? ` with ${errors.length} errors` : ''}` 
        });
      } else if (errors.length === 0) {
        setImportStatus({ type: 'error', message: 'No valid data found in the JSON file' });
      }
    } catch (error) {
      setImportStatus({ type: 'error', message: `Failed to import JSON: ${error}` });
    }
    
    // Clear the input
    event.target.value = '';
  };

  // Clear status message after 5 seconds
  React.useEffect(() => {
    if (importStatus.type) {
      const timer = setTimeout(() => {
        setImportStatus({ type: null, message: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [importStatus]);

  return (
    <div className="space-y-6" ref={dashboardRef}>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <div className="relative">
          <button onClick={() => exportToPDF(dashboardRef.current, 'dashboard-report')} className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 flex items-center gap-2 transition-colors">
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard title="Total Income" amount={summary.income} icon={<TrendingUp className="w-6 h-6 text-green-800" />} color="bg-green-100 dark:bg-green-900" />
        <SummaryCard title="Total Expense" amount={summary.expense} icon={<TrendingDown className="w-6 h-6 text-red-800" />} color="bg-red-100 dark:bg-red-900" />
        <SummaryCard title="Balance" amount={summary.balance} icon={<TrendingUp className="w-6 h-6 text-blue-800" />} color="bg-blue-100 dark:bg-blue-900" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">Expense Breakdown</h2>
          {expenseByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={expenseByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8">
                  {expenseByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-slate-500 dark:text-slate-400">
                <p>No expense data to display.</p>
            </div>
          )}
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">Recent Transactions</h2>
          {recentTransactions.length > 0 ? (
            <ul className="divide-y divide-slate-200 dark:divide-slate-700">
              {recentTransactions.map(t => <TransactionItem key={t.id} transaction={t} />)}
            </ul>
          ) : (
             <div className="flex items-center justify-center h-[300px] text-slate-500 dark:text-slate-400">
                <p>No recent transactions.</p>
            </div>
          )}
        </div>
      </div>
       <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">Import/Export Data</h2>
        
        {/* Status Message */}
        {importStatus.type && (
          <div className={`mb-4 p-3 rounded-lg ${
            importStatus.type === 'success' 
              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800' 
              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
          }`}>
            {importStatus.message}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Import Section */}
          <div>
            <h3 className="text-lg font-medium mb-3 text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Import Data
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                  Import from CSV (Transactions only)
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImportCSV}
                  className="hidden"
                  id="csv-import"
                />
                <label
                  htmlFor="csv-import"
                  className="cursor-pointer inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Choose CSV File
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                  Import from JSON (Full backup)
                </label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                  id="json-import"
                />
                <label
                  htmlFor="json-import"
                  className="cursor-pointer inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Database className="w-4 h-4" />
                  Choose JSON File
                </label>
              </div>
            </div>
          </div>
          
          {/* Export Section */}
          <div>
            <h3 className="text-lg font-medium mb-3 text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export Data
            </h3>
            <div className="space-y-3">
              <button 
                onClick={() => exportToCSV(transactions, 'transactions')} 
                className="w-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Export as CSV
              </button>
              <button 
                onClick={() => exportToJSON({transactions, categories}, 'data')} 
                className="w-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors flex items-center gap-2"
              >
                <Database className="w-4 h-4" />
                Export as JSON
              </button>
            </div>
          </div>
        </div>
        
        {/* Help Text */}
        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            <strong>CSV Import:</strong> Import transactions only. Requires columns: type, amount, date. Optional: currency, categoryId, note, receipt.<br/>
            <strong>JSON Import:</strong> Import complete data backup including transactions and categories. Duplicate categories will be skipped.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
