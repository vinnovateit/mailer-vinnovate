# Gmail Bulk Mailer

A small desktop app that sends the HTML email in `mail_content.html` to every recipient listed in an Excel file.

## Before you start

Install Python 3, then install the required packages from this project folder:

```powershell
python -m pip install pandas openpyxl python-dotenv
```

`tkinter` is included with most standard Python installations. If the app does not open, reinstall Python and ensure the optional Tcl/Tk component is selected.

## Set up Gmail credentials

This program sends through Gmail's SMTP server. Do **not** put your usual Google account password in the environment file. Use a Google **App Password** instead.

1. Enable 2-Step Verification for the Gmail/Google account that will send the emails: <https://myaccount.google.com/security>.
2. Open the App Passwords page: <https://myaccount.google.com/apppasswords>.
3. Create an app password (for example, name it `Bulk Mailer`).
4. Google will show a 16-character password. Copy it; it is shown only once.

If the App Passwords page is unavailable, 2-Step Verification may not be enabled, or the Google account administrator may have disabled app passwords.

## Create the `.env` file

In the project folder, create a file named `.env` (no filename before the dot). You can copy `.env.example` and replace its values:

```env
EMAIL=youraddress@gmail.com
EMAIL_PASSWORD=your_16_character_google_app_password
```

- `EMAIL` is the Gmail address that appears as the sender.
- `EMAIL_PASSWORD` is the App Password from the previous section. Spaces are optional; either format normally works.

The `.env` file is already ignored by Git, so keep it private and never share or commit it.

## Prepare recipients

Create an Excel file (`.xlsx` or `.xls`) with a column whose header is exactly `Email`.

| Email |
| --- |
| person1@example.com |
| person2@example.com |

Blank cells are skipped. The program will show an error if the `Email` column is missing.

## Customize the email

- Edit `mail_content.html` to change the email design and message.
- Edit the `msg["Subject"]` value in `main.py` to set the email subject. It currently says `add mail subject`.

## Run the app

From the project folder, run:

```powershell
python main.py
```

Click **Browse**, select the recipient Excel file, and the app will send the email to each address in its `Email` column. The terminal prints each successful recipient, and the app displays a final total when it is done.

## Notes

- Test with your own email address before sending to a full list.
- Gmail may limit or temporarily block high-volume sending. Use this only for recipients who have agreed to receive the message.
- Keep the `.env`, `main.py`, and `mail_content.html` files together in the project folder when running the program.
