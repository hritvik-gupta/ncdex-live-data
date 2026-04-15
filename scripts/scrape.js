const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const SOURCE_URL = 'https://ncdex.com/market-watch/live_quotes';
const outFile = path.join(__dirname, '..', 'data', 'live_quotes.json');
const lastRunFile = path.join(__dirname, '..', 'data', 'last_run.txt');

function clean(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/123 Safari/537.36'
  });

  try {
    await page.goto(SOURCE_URL, { waitUntil: 'networkidle', timeout: 90000 });

    // Give the page a little time in case table renders after load.
    await page.waitForTimeout(5000);

    const rows = await page.evaluate(() => {
      const clean = (text) => (text || '').replace(/\s+/g, ' ').trim();
      const tables = Array.from(document.querySelectorAll('table'));
      let best = [];

      for (const table of tables) {
        const headerCells = Array.from(table.querySelectorAll('tr:first-child th, tr:first-child td'))
          .map(el => clean(el.innerText).toLowerCase());

        const headerText = headerCells.join(' | ');
        const looksLikeQuotes =
          headerText.includes('expiry') &&
          (
            headerText.includes('ltp') ||
            headerText.includes('last') ||
            headerText.includes('close')
          );

        if (!looksLikeQuotes) continue;

        const parsed = Array.from(table.querySelectorAll('tr'))
          .slice(1)
          .map(tr => {
            const cells = Array.from(tr.querySelectorAll('th, td')).map(td => clean(td.innerText));
            if (cells.length < 5) return null;
            return {
              commodity: cells[0] || '',
              expiry: cells[1] || '',
              ltp: cells[2] || '',
              bid: cells[3] || '',
              ask: cells[4] || '',
              open: cells[5] || '',
              high: cells[6] || '',
              low: cells[7] || '',
              close: cells[8] || '',
              change: cells[9] || ''
            };
          })
          .filter(Boolean)
          .filter(row => row.commodity);

        if (parsed.length > best.length) best = parsed;
      }

      return best;
    });

    if (!rows.length) {
      throw new Error('No quote rows found. The source page structure may have changed.');
    }

    const payload = {
      ok: true,
      updated_at: new Date().toISOString(),
      row_count: rows.length,
      items: rows,
      meta: {
        mode: 'github-actions-playwright',
        source_url: SOURCE_URL
      }
    };

    fs.writeFileSync(outFile, JSON.stringify(payload, null, 2), 'utf8');
    fs.writeFileSync(lastRunFile, new Date().toISOString(), 'utf8');
    console.log(`Saved ${rows.length} rows`);
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
