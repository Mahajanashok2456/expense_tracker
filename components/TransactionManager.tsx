
import React, { useState, useMemo, FC } from 'react';
import { useAppContext } from '../context/AppContext';
import { Transaction, TransactionType, Category } from '../types';
import Modal from './ui/Modal';
import { PlusCircle, Edit, Trash2, Paperclip } from 'lucide-react';
import DynamicIcon from './ui/DynamicIcon';

const TransactionForm: FC<{ transaction?: Transaction; onClose: () => void; }> = ({ transaction, onClose }) => {
    const { categories, addTransaction, updateTransaction } = useAppContext();
    const isEditing = !!transaction;

    const [amount, setAmount] = useState(transaction?.amount.toString() || '');
    const [categoryId, setCategoryId] = useState(transaction?.categoryId || '');
    const [date, setDate] = useState(transaction?.date ? transaction.date.split('T')[0] : new Date().toISOString().split('T')[0]);
    const [note, setNote] = useState(transaction?.note || '');
    const [type, setType] = useState<TransactionType>(transaction?.type || TransactionType.EXPENSE);
    const [receipt, setReceipt] = useState(transaction?.receipt || '');

    const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setReceipt(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const transactionData = {
            amount: parseFloat(amount),
            categoryId: categoryId || null,
            date: new Date(date).toISOString(),
            note,
            type,
            currency: 'USD',
            receipt: receipt || undefined,
        };

        if (isEditing) {
            updateTransaction({ ...transactionData, id: transaction.id });
        } else {
            addTransaction(transactionData);
        }
        onClose();
    };

    const expenseCategories = categories.filter(c => c.name !== 'Salary');
    const incomeCategories = categories.filter(c => c.name === 'Salary');

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{isEditing ? 'Edit' : 'New'} Transaction</h2>
            <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Type</label>
                <div className="flex gap-2">
                    <button type="button" onClick={() => setType(TransactionType.EXPENSE)} className={`w-full py-2 rounded-md ${type === TransactionType.EXPENSE ? 'bg-red-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>Expense</button>
                    <button type="button" onClick={() => setType(TransactionType.INCOME)} className={`w-full py-2 rounded-md ${type === TransactionType.INCOME ? 'bg-green-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>Income</button>
                </div>
            </div>
            <div>
                <label htmlFor="amount" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Amount</label>
                <input id="amount" type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900" />
            </div>
            <div>
                <label htmlFor="category" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Category</label>
                <select id="category" value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900">
                    <option value="">Select a category</option>
                    {(type === TransactionType.EXPENSE ? expenseCategories : incomeCategories).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="date" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Date</label>
                <input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900" />
            </div>
             <div>
                <label htmlFor="note" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Note</label>
                <textarea id="note" value={note} onChange={e => setNote(e.target.value)} rows={3} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900"></textarea>
            </div>
            <div>
                <label htmlFor="receipt" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Receipt</label>
                <input id="receipt" type="file" accept="image/*" onChange={handleReceiptUpload} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100" />
                {receipt && (
                    <div className="mt-2">
                        <img src={receipt} alt="Receipt preview" className="max-h-32 rounded" />
                        <button type="button" onClick={() => setReceipt('')} className="text-xs text-red-500 hover:underline mt-1">Remove</button>
                    </div>
                )}
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-md bg-sky-500 text-white hover:bg-sky-600">{isEditing ? 'Save Changes' : 'Add Transaction'}</button>
            </div>
        </form>
    );
};

const TransactionManager: React.FC = () => {
    const { transactions, deleteTransaction, getCategoryById, categories } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleEdit = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingTransaction(undefined);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            deleteTransaction(id);
        }
    };

    const filteredTransactions = useMemo(() => {
        return [...transactions]
            .filter(t => {
                const transactionDateStr = t.date.split('T')[0];
                if (startDate && transactionDateStr < startDate) return false;
                if (endDate && transactionDateStr > endDate) return false;
                if (filterCategory !== 'all' && t.categoryId !== filterCategory) return false;
                if (searchQuery && !t.note.toLowerCase().includes(searchQuery.toLowerCase())) return false;
                return true;
            })
            .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, filterCategory, searchQuery, startDate, endDate]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Transactions</h1>
                <button onClick={handleAddNew} className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 flex items-center gap-2 transition-colors">
                    <PlusCircle className="w-5 h-5" /> New Transaction
                </button>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 p-4 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <input
                    type="text"
                    placeholder="Search notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900"
                />
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900"
                >
                    <option value="all">All Categories</option>
                    {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900"
                />
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900"
                />
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                            <tr>
                                <th scope="col" className="px-6 py-3">Category</th>
                                <th scope="col" className="px-6 py-3">Date</th>
                                <th scope="col" className="px-6 py-3">Note</th>
                                <th scope="col" className="px-6 py-3 text-right">Amount</th>
                                <th scope="col" className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.map(t => {
                                const category = getCategoryById(t.categoryId);
                                const isIncome = t.type === TransactionType.INCOME;
                                return (
                                <tr key={t.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <DynamicIcon name={category?.icon || 'Shapes'} style={{color: category?.color}} className="w-5 h-5"/>
                                            {category?.name || 'Uncategorized'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{new Date(t.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 max-w-xs">
                                            <span className="truncate">{t.note || '-'}</span>
                                            {t.receipt && (
                                                <a href={t.receipt} target="_blank" rel="noopener noreferrer" aria-label="View receipt">
                                                    <Paperclip className="w-4 h-4 text-slate-400 hover:text-sky-500 flex-shrink-0" />
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                    <td className={`px-6 py-4 text-right font-semibold ${isIncome ? 'text-green-500' : 'text-red-500'}`}>
                                        {isIncome ? '+' : '-'} {new Intl.NumberFormat('en-US', { style: 'currency', currency: t.currency || 'USD' }).format(t.amount)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleEdit(t)} className="text-sky-600 hover:text-sky-800"><Edit size={18}/></button>
                                            <button onClick={() => handleDelete(t.id)} className="text-red-600 hover:text-red-800"><Trash2 size={18}/></button>
                                        </div>
                                    </td>
                                </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
                 {filteredTransactions.length === 0 && <p className="text-center p-8 text-slate-500">No transactions found.</p>}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <TransactionForm transaction={editingTransaction} onClose={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default TransactionManager;
