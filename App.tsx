
import React, { useState } from 'react';
import { LayoutDashboard, List, Shapes, Github } from 'lucide-react';
import Dashboard from './components/Dashboard';
import TransactionManager from './components/TransactionManager';
import CategoryManager from './components/CategoryManager';

type View = 'dashboard' | 'transactions' | 'categories';

const App: React.FC = () => {
  const [view, setView] = useState<View>('dashboard');

  const renderView = () => {
    switch (view) {
      case 'transactions':
        return <TransactionManager />;
      case 'categories':
        return <CategoryManager />;
      case 'dashboard':
      default:
        return <Dashboard />;
    }
  };

  const NavItem = ({ icon: Icon, label, active, onClick }: { icon: React.ElementType, label: string, active: boolean, onClick: () => void }) => (
    <li>
      <button
        onClick={onClick}
        className={`flex items-center p-2 text-base font-normal rounded-lg transition-all duration-200 ${
          active ? 'bg-sky-100 dark:bg-sky-900 text-sky-600 dark:text-sky-300' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
        }`}
      >
        <Icon className="w-6 h-6" />
        <span className="ml-3">{label}</span>
      </button>
    </li>
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <aside className="w-64 flex-shrink-0" aria-label="Sidebar">
        <div className="overflow-y-auto py-4 px-3 h-full bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
          <div className="flex items-center pl-2.5 mb-5">
            <svg className="w-8 h-8 mr-2 text-sky-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path><path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path><path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
            <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Zenith</span>
          </div>
          <ul className="space-y-2 flex-grow">
            <NavItem icon={LayoutDashboard} label="Dashboard" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
            <NavItem icon={List} label="Transactions" active={view === 'transactions'} onClick={() => setView('transactions')} />
            <NavItem icon={Shapes} label="Categories" active={view === 'categories'} onClick={() => setView('categories')} />
          </ul>
           <div className="p-4 mt-4 bg-slate-100 dark:bg-slate-700 rounded-lg text-center text-sm text-slate-500 dark:text-slate-400">
             <p>This is a client-side application. All your data is stored securely in your browser's local storage.</p>
           </div>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
        {renderView()}
      </main>
    </div>
  );
};

export default App;
