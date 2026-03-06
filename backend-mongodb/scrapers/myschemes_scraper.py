import sys, json, os, time, re
import warnings

sys.stderr = open(os.devnull, 'w')
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
    chrome_options.add_argument("--log-level=3")
    chrome_options.add_experimental_option('excludeSwitches', ['enable-logging'])

    driver = None
    try:
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        driver.get(url)

        # 1. SMART TITLE WAIT
        # Wait until the invisible tab title updates to contain the scheme name
        wait = WebDriverWait(driver, 15)
        try:
            wait.until(lambda d: len(d.title) > 10 and "|" in d.title)
            name = driver.title.split("|")[0].strip()
        except:
            try:
                name = driver.find_element(By.TAG_NAME, "h1").text.strip()
            except:
                name = "Manual Entry Required"

        time.sleep(2) # Extra buffer for the text to settle

        page_text = driver.execute_script("return document.body.innerText;")

        # 2. SECTION SPLITTER
        headers = ["Benefits", "Eligibility", "Application Process", "Documents Required", "Frequently Asked Questions"]
        pattern = r'(?i)(?:^|\n)(' + '|'.join(headers) + r')\s*\n(.*?)(?=(?:\n(?:' + '|'.join(headers) + r')\s*\n)|$)'
        matches = re.findall(pattern, page_text, re.DOTALL)
        sections = {m[0].strip().lower(): m[1].strip() for m in matches}

        benefits = sections.get("benefits", "")
        eligibility = sections.get("eligibility", "")
        app_process = sections.get("application process", "")
        docs = sections.get("documents required", "")

        if not benefits and not eligibility:
            p_elements = driver.find_elements(By.XPATH, "//p | //li")
            fallback_text = "\n".join([el.text.strip() for el in p_elements if len(el.text.strip()) > 20])
            benefits = "RAW TEXT EXTRACT:\n" + fallback_text[:2000]

        full_description = ""
        if benefits: full_description += f"BENEFITS:\n{benefits}\n\n"
        if eligibility: full_description += f"ELIGIBILITY:\n{eligibility}"

        # 3. TARGETED STATE RADAR
        state_guess = "All India"
        # Only look in Eligibility and Documents so we don't get confused by random cities mentioned in the text
        for state in INDIAN_STATES:
            if state.lower() in eligibility.lower() or state.lower() in docs.lower():
                state_guess = state
                break

        # 4. CATEGORY RADAR
        page_lower = page_text.lower()
        if any(word in page_lower for word in ["student", "degree", "education", "scholarship"]):
            category_guess = "Education"
        elif any(word in page_lower for word in ["farmer", "agriculture", "crop"]):
            category_guess = "Agriculture"
        elif any(word in page_lower for word in ["maternity", "pregnant", "health", "hospital", "disease"]):
            category_guess = "Healthcare"
        elif any(word in page_lower for word in ["pilgrimage", "teerth", "yatra", "temple"]):
            category_guess = "Social Welfare"
        else:
            category_guess = "General"

        # 5. DEEP INCOME DECODER
        income_limit = ""
        # Search BOTH eligibility and documents for income clues
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
            income_limit = "500000" # Standard assumption for tax exemption limits

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