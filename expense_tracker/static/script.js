
async function generateReport() {
    try {
        // Fetch the report data from the backend
        const response = await fetch('/report');
        if (!response.ok) {
            throw new Error("Failed to fetch report data");
        }
        
        const data = await response.json();

        // Extract categories and amounts from the fetched data
        const categories = data.map(entry => entry.category);
        const amounts = data.map(entry => entry.total_amount);

        // Render the chart on the canvas
        const ctx = document.getElementById('expenseChart').getContext('2d');
        
        // Destroy any previous instance of Chart to prevent overlapping graphs
        if (window.expenseChart && typeof window.expenseChart.destroy === 'function') {
            window.expenseChart.destroy();
        }

        // Create a new chart instance
        window.expenseChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: categories,
                datasets: [{
                    label: 'Total Amount Spent',
                    data: amounts,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    } catch (error) {
        console.error("Error generating report:", error);
        alert("Failed to generate the report. Please check the console for details.");
    }
}
