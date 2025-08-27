
import React, { useState, FC } from 'react';
import { useAppContext } from '../context/AppContext';
import { Category } from '../types';
import Modal from './ui/Modal';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import DynamicIcon from './ui/DynamicIcon';

const COLORS = [ '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#ec4899' ];
const ICONS = [ 'ShoppingCart', 'Car', 'Ticket', 'Landmark', 'Home', 'GraduationCap', 'HeartPulse', 'Utensils', 'Gift', 'Plane', 'FileText', 'Shapes' ];

const CategoryForm: FC<{ category?: Category; onClose: () => void; }> = ({ category, onClose }) => {
    const { addCategory, updateCategory } = useAppContext();
    const isEditing = !!category;

    const [name, setName] = useState(category?.name || '');
    const [color, setColor] = useState(category?.color || COLORS[0]);
    const [icon, setIcon] = useState(category?.icon || ICONS[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const categoryData = { name, color, icon, parentId: category?.parentId || null };

        if (isEditing) {
            updateCategory({ ...categoryData, id: category.id });
        } else {
            addCategory(categoryData);
        }
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{isEditing ? 'Edit' : 'New'} Category</h2>
             <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Category Name</label>
                <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Color</label>
                <div className="flex flex-wrap gap-2">
                    {COLORS.map(c => <button type="button" key={c} onClick={() => setColor(c)} style={{ backgroundColor: c }} className={`w-8 h-8 rounded-full transition-transform transform hover:scale-110 ${color === c ? 'ring-2 ring-offset-2 ring-sky-500 dark:ring-offset-slate-900' : ''}`}></button>)}
                </div>
            </div>
             <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Icon</label>
                <div className="grid grid-cols-6 gap-2">
                    {ICONS.map(i => (
                        <button type="button" key={i} onClick={() => setIcon(i)} className={`p-3 rounded-lg flex items-center justify-center transition-colors ${icon === i ? 'bg-sky-100 dark:bg-sky-900 text-sky-600' : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                           <DynamicIcon name={i} className="w-6 h-6" />
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-md bg-sky-500 text-white hover:bg-sky-600">{isEditing ? 'Save Changes' : 'Add Category'}</button>
            </div>
        </form>
    );
};

const CategoryManager: React.FC = () => {
    const { categories, deleteCategory } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingCategory(undefined);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure? Deleting this category will reassign its transactions to "Uncategorized".')) {
            deleteCategory(id);
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Categories</h1>
                <button onClick={handleAddNew} className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 flex items-center gap-2 transition-colors">
                    <PlusCircle className="w-5 h-5" /> New Category
                </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {categories.map(c => (
                    <div key={c.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center">
                         <div className="p-3 rounded-full mb-2" style={{ backgroundColor: `${c.color}20` }}>
                             <DynamicIcon name={c.icon} style={{ color: c.color }} className="w-8 h-8" />
                         </div>
                        <p className="font-semibold text-slate-800 dark:text-slate-100">{c.name}</p>
                         <div className="mt-4 flex gap-2">
                             <button onClick={() => handleEdit(c)} className="text-sky-600 hover:text-sky-800"><Edit size={18}/></button>
                             {c.id !== 'uncategorized' && <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:text-red-800"><Trash2 size={18}/></button>}
                         </div>
                    </div>
                ))}
            </div>
             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <CategoryForm category={editingCategory} onClose={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default CategoryManager;
