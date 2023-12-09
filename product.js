const http = require('http');
const url = require('url');
const querystring = require('querystring');
const https = require('https');

const AV_API_KEY = 'TIQMR6SXAOEQV784'; // Replace with your Alpha Vantage API key

const companyData = [
  { name: '1-800-Flowers.Com Inc.', symbol: 'FLWS' },
  { name: 'Harry and David', symbol: 'FLWS' },
  { name: 'Abercrombie & Fitch Co.', symbol: 'ANF' },
  { name: 'Activision Blizzard', symbol: 'ATVI' },
  { name: 'Activision', symbol: 'ATVI' },
  { name: 'Blizzard', symbol: 'ATVI' },
  { name: 'Adidas', symbol: 'ADDDF' },
  { name: 'Alphabet Inc.', symbol: 'GOOG' },
  { name: 'Google', symbol: 'GOOG' },
  { name: 'Whole Foods', symbol: 'AMZN' },
  { name: 'Amazon', symbol: 'AMZN' },
  { name: 'American Eagle Outfitter', symbol: 'AEO' },
  { name: 'Apple Inc.', symbol: 'AAPL' }
];

const server = http.createServer((req, res) => {
  const path = url.parse(req.url).pathname;

  if (req.method === 'GET' && path === '/search') {
    const { query, searchType } = querystring.parse(url.parse(req.url).query);
    const baseUrl = 'https://www.alphavantage.co/query';
    const apiKey = `apikey=${AV_API_KEY}`;
    let symbol = '';

    if (searchType === 'symbol') {
      symbol = `symbol=${query.toUpperCase()}`;
    } else if (searchType === 'company') {
      const foundCompany = companyData.find(company =>
        company.name.toLowerCase() === query.toLowerCase()
      );
      if (!foundCompany) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end('Company not found.');
      }
      symbol = `symbol=${foundCompany.symbol}`;
    }

    const apiUrl = `${baseUrl}?function=GLOBAL_QUOTE&${symbol}&${apiKey}`;

    https.get(apiUrl, apiRes => {
      let apiData = '';
      apiRes.on('data', chunk => { apiData += chunk; });

      apiRes.on('end', () => {
        const stockData = JSON.parse(apiData);

        if (stockData['Global Quote']) {
          const { '01. symbol': symbol, '05. price': price } = stockData['Global Quote'];
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`<h2>Stock Price</h2><p>Symbol: ${symbol}</p><p>Price: ${price}</p>`);
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end('No stock data found.');
        }
      });
    }).on('error', err => {
      console.error('Error fetching data from Alpha Vantage:', err);
      res.writeHead(500);
      res.end('Error fetching data from Alpha Vantage');
    });
  } else {
    res.writeHead(404);
    res.end('Page not found');
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
