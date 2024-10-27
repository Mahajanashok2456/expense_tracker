
from flask import Flask, render_template, request, redirect, url_for, jsonify
import mysql.connector
from datetime import datetime

app = Flask(__name__)

# Database connection function
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",     # Replace with your MySQL username
        password="2456", # Replace with your MySQL password
        database="expense_tracker"
    )

# Main page route (index) for adding expenses
@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        category = request.form["category"]
        amount = float(request.form["amount"])

        # Connect to the database and insert the expense
        conn = get_db_connection()
        cursor = conn.cursor()

        # Insert a new expense with the current date
        cursor.execute(
            "INSERT INTO expenses (category, amount, date) VALUES (%s, %s, %s)",
            (category, amount, datetime.now().date())
        )

        conn.commit()  # Save the changes to the database
        cursor.close()
        conn.close()

        # Redirect to the home page to clear the form
        return redirect(url_for("index"))

    # Render the index.html template for GET requests
    return render_template("index.html")

# Route for generating the report data for the graph
@app.route("/report")
def report():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT category, SUM(amount) as total_amount FROM expenses GROUP BY category")
    data = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(data)

# Run the application
if __name__ == "__main__":
    app.run(debug=True)
