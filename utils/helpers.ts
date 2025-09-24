
import { Transaction, Category, TransactionType } from '../types';

declare const jspdf: any;
declare const html2canvas: any;


function downloadFile(filename: string, content: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}

export const exportToCSV = (data: Transaction[], filename: string) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(',')).join('\n');
    const csvContent = `${headers}\n${rows}`;
    downloadFile(`${filename}.csv`, csvContent, 'text/csv;charset=utf-8;');
};

export const exportToJSON = (data: {transactions: Transaction[], categories: Category[]}, filename: string) => {
    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(`${filename}.json`, jsonContent, 'application/json;charset=utf-8;');
};

export const exportToPDF = async (element: HTMLElement | null, filename: string) => {
    if (!element) return;
    try {
        const canvas = await html2canvas(element, {
             useCORS: true,
             scale: 2,
             backgroundColor: document.body.classList.contains('dark') ? '#0f172a' : '#f8fafc',
        });
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = jspdf;
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`${filename}.pdf`);
    } catch (error) {
        console.error("Error generating PDF:", error);
    }
};

// Import functions
export const importFromCSV = async (file: File): Promise<{ transactions: Omit<Transaction, 'id'>[], errors: string[] }> => {
    const errors: string[] = [];
    const transactions: Omit<Transaction, 'id'>[] = [];
    
    try {
        const text = await file.text();
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
            errors.push('CSV file must contain a header row and at least one data row');
            return { transactions, errors };
        }
        
        const headers = lines[0].split(',').map(h => h.trim());
        const expectedHeaders = ['type', 'amount', 'currency', 'categoryId', 'date', 'note', 'receipt'];
        
        // Validate headers
        const requiredHeaders = ['type', 'amount', 'date'];
        const missingHeaders = requiredHeaders.filter(h => !headers.some(header => header.toLowerCase().includes(h.toLowerCase())));
        if (missingHeaders.length > 0) {
            errors.push(`Missing required columns: ${missingHeaders.join(', ')}`);
            return { transactions, errors };
        }
        
        // Process data rows
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            
            if (values.length !== headers.length) {
                errors.push(`Row ${i + 1}: Invalid number of columns`);
                continue;
            }
            
            const rowData: any = {};
            headers.forEach((header, index) => {
                rowData[header] = values[index];
            });
            
            // Validate and transform transaction data
            try {
                const transaction: Omit<Transaction, 'id'> = {
                    type: rowData.type === 'income' ? TransactionType.INCOME : TransactionType.EXPENSE,
                    amount: parseFloat(rowData.amount) || 0,
                    currency: rowData.currency || 'USD',
                    categoryId: rowData.categoryId || null,
                    date: new Date(rowData.date).toISOString(),
                    note: rowData.note || '',
                    receipt: rowData.receipt || undefined
                };
                
                // Validate required fields
                if (isNaN(transaction.amount) || transaction.amount <= 0) {
                    errors.push(`Row ${i + 1}: Invalid amount`);
                    continue;
                }
                
                if (!transaction.date || isNaN(new Date(transaction.date).getTime())) {
                    errors.push(`Row ${i + 1}: Invalid date format`);
                    continue;
                }
                
                transactions.push(transaction);
            } catch (error) {
                errors.push(`Row ${i + 1}: Error processing data - ${error}`);
            }
        }
        
    } catch (error) {
        errors.push(`Error reading CSV file: ${error}`);
    }
    
    return { transactions, errors };
};

export const importFromJSON = async (file: File): Promise<{ data: { transactions: Omit<Transaction, 'id'>[], categories: Omit<Category, 'id'>[] }, errors: string[] }> => {
    const errors: string[] = [];
    const data = { transactions: [] as Omit<Transaction, 'id'>[], categories: [] as Omit<Category, 'id'>[] };
    
    try {
        const text = await file.text();
        const jsonData = JSON.parse(text);
        
        // Validate JSON structure
        if (!jsonData || typeof jsonData !== 'object') {
            errors.push('Invalid JSON format');
            return { data, errors };
        }
        
        // Process transactions
        if (jsonData.transactions && Array.isArray(jsonData.transactions)) {
            for (let i = 0; i < jsonData.transactions.length; i++) {
                const t = jsonData.transactions[i];
                try {
                    // Remove id from transaction to let the app generate new ones
                    const { id, ...transactionData } = t;
                    
                    // Validate transaction structure
                    if (!transactionData.type || !transactionData.amount || !transactionData.date) {
                        errors.push(`Transaction ${i + 1}: Missing required fields (type, amount, date)`);
                        continue;
                    }
                    
                    const transaction: Omit<Transaction, 'id'> = {
                        type: transactionData.type,
                        amount: Number(transactionData.amount),
                        currency: transactionData.currency || 'USD',
                        categoryId: transactionData.categoryId || null,
                        date: transactionData.date,
                        note: transactionData.note || '',
                        receipt: transactionData.receipt || undefined
                    };
                    
                    data.transactions.push(transaction);
                } catch (error) {
                    errors.push(`Transaction ${i + 1}: Error processing - ${error}`);
                }
            }
        }
        
        // Process categories
        if (jsonData.categories && Array.isArray(jsonData.categories)) {
            for (let i = 0; i < jsonData.categories.length; i++) {
                const c = jsonData.categories[i];
                try {
                    // Remove id from category to let the app generate new ones
                    const { id, ...categoryData } = c;
                    
                    // Validate category structure
                    if (!categoryData.name) {
                        errors.push(`Category ${i + 1}: Missing required field (name)`);
                        continue;
                    }
                    
                    const category: Omit<Category, 'id'> = {
                        name: categoryData.name,
                        color: categoryData.color || '#64748b',
                        icon: categoryData.icon || 'Shapes',
                        parentId: categoryData.parentId || null
                    };
                    
                    data.categories.push(category);
                } catch (error) {
                    errors.push(`Category ${i + 1}: Error processing - ${error}`);
                }
            }
        }
        
    } catch (error) {
        errors.push(`Error parsing JSON file: ${error}`);
    }
    
    return { data, errors };
};
