import tkinter as tk
from tkinter import filedialog, messagebox
import pandas as pd
import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from dotenv import load_dotenv

def send_emails(excel_path):
    try:
        # Load environment variables
        load_dotenv()
        sender_email = os.getenv("EMAIL")
        sender_password = os.getenv("EMAIL_PASSWORD")
        
        if not sender_email or not sender_password:
            messagebox.showerror("Error", "Email credentials not found in .env file")
            return
        
        # Read the Excel file
        df = pd.read_excel(excel_path)
        
        if "Email" not in df.columns:
            messagebox.showerror("Error", "No 'EmailId' column found in the Excel sheet.")
            return
        
        # Read the HTML content
        html_file = "mail_content.html" #!!TEMPLATE HTML 
        if not os.path.exists(html_file):
            messagebox.showerror("Error", "HTML file not found in the script directory.")
            return
        
        with open(html_file, "r", encoding="utf-8") as file:
            html_content = file.read()
        
        # SMTP server setup (Gmail example)
        smtp_server = "smtp.gmail.com"
        smtp_port = 587
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(sender_email, sender_password)
        
        # Send email to each recipient
        email_count = 0
        for email in df["Email"].dropna():
            msg = MIMEMultipart()
            msg["From"] = sender_email
            msg["To"] = email
            msg["Subject"] = "add mail subject" #!!EDIT MAIL SUBJECT HERE !!
            msg.attach(MIMEText(html_content, "html"))
            
            server.sendmail(sender_email, email, msg.as_string())
            
            # Print email ID to terminal
            print(f"Email sent to: {email}")
            
            # Increment counter
            email_count += 1
        
        server.quit()
        messagebox.showinfo("Success", f"{email_count} emails sent successfully!")
    except Exception as e:
        messagebox.showerror("Error", str(e))

# GUI for file selection
def select_file():
    file_path = filedialog.askopenfilename(filetypes=[("Excel Files", "*.xlsx;*.xls")])
    if file_path:
        send_emails(file_path)

# Create tkinter window
root = tk.Tk()
root.title("Email Sender")
root.geometry("400x200")

label = tk.Label(root, text="Select Excel file containing Email IDs")
label.pack(pady=10)

button = tk.Button(root, text="Browse", command=select_file)
button.pack(pady=20)

root.mainloop()