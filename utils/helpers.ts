
import { Transaction, Category } from '../types';

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
