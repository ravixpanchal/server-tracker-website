import smtplib
from email.mime.text import MIMEText

EMAIL_SENDER = "ravi.panchal.kaithi@example.com"
EMAIL_PASSWORD = "2318947681470381"  # App password from Google
EMAIL_RECEIVER = "ravi.panchal_btech23@gsv.ac.in"

msg = MIMEText("Test email from Python script.")
msg['Subject'] = "Test Email"
msg['From'] = EMAIL_SENDER
msg['To'] = EMAIL_RECEIVER

try:
    with smtplib.SMTP('smtp.gmail.com', 587) as smtp:
        smtp.starttls()
        smtp.login(EMAIL_SENDER, EMAIL_PASSWORD)
        smtp.send_message(msg)
        print("✅ Test email sent.")
except Exception as e:
    print(f"❌ Failed to send email: {e}")
