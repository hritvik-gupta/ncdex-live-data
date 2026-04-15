NCDEX GitHub Actions + Playwright setup

What this gives you
- A GitHub Actions workflow that runs once a day
- A Playwright scraper that opens the NCDEX page in a browser
- A JSON output file: data/live_quotes.json
- A simple website page that reads the JSON and shows the table

Recommended workflow
1. Create a new GitHub repo
2. Upload all files from this ZIP into the repo
3. Push to GitHub
4. Open GitHub -> Actions tab
5. Enable Actions if asked
6. Run the workflow once manually using "Run workflow"
7. After it finishes, download data/live_quotes.json from the repo
8. Upload site/index.html and data/live_quotes.json to Hostinger

Daily schedule
- Current cron: 11:30 UTC every day
- That is 5:00 PM IST daily

If you want a different time
- Edit: .github/workflows/update.yml
- Change the cron line

Important note
- This setup saves the JSON into your GitHub repo.
- Hostinger will not pull it automatically unless you add a sync step.
- The easy method is:
  GitHub creates the JSON -> you upload the JSON to your hosting when needed

If you want full automation later
- Use GitHub Pages
- or add a deploy step to upload the JSON somewhere public

Files
- .github/workflows/update.yml -> daily automation
- scripts/scrape.js -> Playwright scraper
- data/live_quotes.json -> sample placeholder file
- site/index.html -> page for Hostinger
