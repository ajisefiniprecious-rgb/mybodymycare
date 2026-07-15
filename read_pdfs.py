import PyPDF2
import glob
import os

files = glob.glob(r"C:\Users\HP\Downloads\PROJECT*pdf")
files += glob.glob(r"C:\Users\HP\Downloads\GYM*pdf")
files += glob.glob(r"C:\Users\HP\Downloads\MyBody*pdf")

for f in files:
    print(f"=== FILE: {os.path.basename(f)} ===")
    try:
        reader = PyPDF2.PdfReader(f)
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            if text:
                print(f"--- Page {i+1} ---")
                print(text)
    except Exception as e:
        print(f"Error: {e}")
    print("\n\n")
