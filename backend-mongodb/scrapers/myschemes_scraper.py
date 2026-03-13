import sys, json, os, time, re
import warnings
import glob

os.environ['WDM_LOG_LEVEL'] = '0'
warnings.filterwarnings("ignore")

try:
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.chrome.service import Service
    from webdriver_manager.chrome import ChromeDriverManager
except ImportError:
    print(json.dumps({"error": "Missing libraries."}))
    sys.exit(1)

INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Delhi", "Jammu and Kashmir", "Puducherry", "Chandigarh"
]

def scrape(url):

    chrome_options = Options()
    chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage") # 🛡️ CRITICAL LINUX SHIELD
    chrome_options.add_argument("--log-level=3")
    chrome_options.add_experimental_option('excludeSwitches', ['enable-logging'])

    # 1. Locate the smuggled Chrome car (Cloud Mode)
    chrome_paths = glob.glob(os.path.join(os.getcwd(), 'chrome', '**', 'chrome-linux64', 'chrome'), recursive=True)
    if chrome_paths:
        chrome_options.binary_location = chrome_paths[0]

    # 2. Locate the smuggled matching steering wheel (ChromeDriver)
    driver_paths = glob.glob(os.path.join(os.getcwd(), 'chromedriver', '**', 'chromedriver-linux64', 'chromedriver'), recursive=True)

    driver = None
    try:
        # If we are on Render, use the smuggled driver. If on local Windows, use standard webdriver-manager!
        if driver_paths:
            service = Service(executable_path=driver_paths[0]) #cloud mode
        else:
            service = Service(ChromeDriverManager().install()) #local mode
            
        driver = webdriver.Chrome(service=service, options=chrome_options)
        
        driver.get(url)

        # 1. THE TACTICAL PAUSE (Beat the Ghost DOM)
        # Force the sniper to hold its breath for 4 seconds so the React page fully loads
        time.sleep(4) 

        try:
            name = driver.find_element(By.TAG_NAME, "h1").text.strip()
            if not name: name = driver.title.split("|")[0].strip()
        except:
            name = "Manual Entry Required"

        page_text = driver.execute_script("return document.body.innerText;")

        # 2. THERMAL FUZZY SPLITTER (Beat the Dirty Formatting)
        headers = ["Benefits", "Eligibility", "Exclusions", "Application Process", "Documents Required", "Frequently Asked Questions"]
        sections = {h.lower(): [] for h in headers}
        current_section = None
        
        for line in page_text.split('\n'):
            clean_line = line.strip()
            # Ignore empty lines or UI tabs
            if not clean_line or clean_line.lower() in ["details", "check eligibility"]:
                continue
                
            # Fuzzy Match: If the line is short (under 50 chars) and CONTAINS our header word
            matched_header = None
            if len(clean_line) < 50: 
                for h in headers:
                    if h.lower() in clean_line.lower():
                        matched_header = h
                        break
            
            if matched_header:
                current_section = matched_header.lower()
            elif current_section:
                # If we are inside a section, capture the intel
                sections[current_section].append(clean_line)

        benefits = "\n".join(sections["benefits"])
        eligibility = "\n".join(sections["eligibility"])
        app_process = "\n".join(sections["application process"])
        docs = "\n".join(sections["documents required"])

        full_description = ""
        if benefits: full_description += f"BENEFITS:\n{benefits}\n\n"
        if eligibility: full_description += f"ELIGIBILITY:\n{eligibility}"

        # 3. TARGETED STATE RADAR
        state_guess = "All India"
        for state in INDIAN_STATES:
            if state.lower() in eligibility.lower() or state.lower() in docs.lower():
                state_guess = state
                break

        # 4. CATEGORY RADAR
        page_lower = page_text.lower()
        if any(word in page_lower for word in ["student", "degree", "education", "scholarship"]):
            category_guess = "Education"
        elif any(word in page_lower for word in ["farmer", "agriculture", "crop", "irrigation"]):
            category_guess = "Agriculture"
        elif any(word in page_lower for word in ["maternity", "pregnant", "health", "hospital", "disease"]):
            category_guess = "Healthcare"
        elif any(word in page_lower for word in ["pilgrimage", "teerth", "yatra", "temple"]):
            category_guess = "Social Welfare"
        elif any(word in page_lower for word in ["energy", "solar", "electricity"]):
            category_guess = "Infrastructure"
        else:
            category_guess = "General"

        # 5. DEEP INCOME DECODER
        income_limit = ""
        search_area = eligibility.lower() + " " + docs.lower() + " " + benefits.lower()

        num_match = re.search(r'(?:₹|rs\.?)\s*([0-9,]+)', search_area)
        lakh_match = re.search(r'([0-9.]+)\s*lakh', search_area)

        if num_match:
            income_limit = num_match.group(1).replace(',', '')
        elif lakh_match:
            income_limit = str(int(float(lakh_match.group(1)) * 100000))
        elif "ews" in search_area or "economically weaker" in search_area:
            income_limit = "800000"
        elif "bpl" in search_area or "below poverty line" in search_area:
            income_limit = "100000"
        elif "income taxpayer" in search_area or "pay income tax" in search_area:
            income_limit = "500000"

        scheme_data = {
            "name": name,
            "link": url,
            "category": category_guess,
            "state": state_guess,
            "minAge": 18,
            "maxAge": 60,
            "incomeLimit": income_limit,
            "description": full_description.strip(),
            "requiredDocs": docs,
            "applicationSteps": app_process
        }

        print(json.dumps(scheme_data))

    except Exception as e:
        print(json.dumps({"error": str(e)}))
    finally:
        if driver: driver.quit()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        scrape(sys.argv[1])
    else:
        print(json.dumps({"error": "No URL provided"}))