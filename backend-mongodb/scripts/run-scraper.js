const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class ScraperRunner {
  constructor() {
    this.scraperPath = path.join(__dirname, '../scrapers');
    this.logFile = path.join(__dirname, '../logs/scraper.log');
  }

  async runPythonScraper() {
    return new Promise((resolve, reject) => {
      console.log('🐍 Starting Python scraper...');
      
      const process = spawn('python', ['simple_scraper.py'], {
        cwd: this.scraperPath,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        console.log(output.trim());
      });

      process.stderr.on('data', (data) => {
        const error = data.toString();
        stderr += error;
        console.error(error.trim());
      });

      process.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Python scraper completed successfully');
          resolve({ success: true, stdout, stderr });
        } else {
          console.error(`❌ Python scraper failed with code ${code}`);
          resolve({ success: false, stdout, stderr, code });
        }
      });

      process.on('error', (error) => {
        console.error('❌ Failed to start Python scraper:', error);
        reject(error);
      });
    });
  }

  async installDependencies() {
    console.log('📦 Installing Python dependencies...');
    
    return new Promise((resolve, reject) => {
      const process = spawn('pip', ['install', '-r', 'requirements.txt'], {
        cwd: this.scraperPath,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      process.stdout.on('data', (data) => {
        console.log(data.toString());
      });

      process.stderr.on('data', (data) => {
        console.error(data.toString());
      });

      process.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Dependencies installed successfully');
          resolve();
        } else {
          console.log(`⚠️ Dependencies installation failed with code ${code}, proceeding anyway...`);
          resolve(); // Continue even if pip fails
        }
      });
    });
  }

  logScrapingSession(result) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      success: result.success,
      stdout: result.stdout,
      stderr: result.stderr,
      code: result.code
    };

    // Ensure log directory exists
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    // Append to log file
    const logLine = JSON.stringify(logEntry) + '\n';
    fs.appendFileSync(this.logFile, logLine);
  }

  async run() {
    try {
      console.log('🚀 Starting MySchemes scraper process...');
      
      // Install dependencies first
      await this.installDependencies();
      
      // Run the scraper
      const result = await this.runPythonScraper();
      
      // Log the session
      this.logScrapingSession(result);
      
      if (result.success) {
        console.log('🎉 Scraping completed successfully!');
        console.log('📊 Schemes have been updated in the database');
      } else {
        console.log('❌ Scraping failed. Check logs for details.');
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ Critical error in scraper runner:', error);
      return { success: false, error: error.message };
    }
  }
}

// Run if called directly
if (require.main === module) {
  const scraper = new ScraperRunner();
  scraper.run().then(result => {
    process.exit(result.success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = ScraperRunner;
