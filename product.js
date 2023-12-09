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

// ... (constants and arrays)

const server = http.createServer((req, res) => {
  const path = url.parse(req.url).pathname;

  if (req.method === 'GET' && path === '/search') {
    const { query, searchType } = querystring.parse(url.parse(req.url).query);
    console.log('Received GET request to /search');

    const baseUrl = 'https://www.alphavantage.co/query';
    const apiKey = `apikey=${AV_API_KEY}`;
    let symbol = '';

    if (searchType === 'symbol') {
      symbol = `symbol=${query.toUpperCase()}`;
      console.log('Searching by symbol:', query.toUpperCase());
    } else if (searchType === 'company') {
      const foundCompany = companyData.find(company =>
        company.name.toLowerCase() === query.toLowerCase()
      );
      if (!foundCompany) {
        console.log('Company not found');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end('Company not found.');
      }
      symbol = `symbol=${foundCompany.symbol}`;
      console.log('Searching by company:', foundCompany.name);
    } else {
      console.log('Invalid search type:', searchType);
      res.writeHead(400); // Bad Request
      return res.end('Invalid search type.');
    }

    const apiUrl = `${baseUrl}?function=GLOBAL_QUOTE&${symbol}&${apiKey}`;
    console.log('Sending request to Alpha Vantage API:', apiUrl);

    https.get(apiUrl, apiRes => {
      let apiData = '';
      apiRes.on('data', chunk => { apiData += chunk; });

      apiRes.on('end', () => {
        console.log('Received response from Alpha Vantage API');
        const stockData = JSON.parse(apiData);

        if (stockData['Global Quote']) {
          const { '01. symbol': symbol, '05. price': price } = stockData['Global Quote'];
          console.log('Stock data found:');
          
          // Find the company name associated with the symbol
          const foundCompany = companyData.find(company => company.symbol === symbol);
          
          if (foundCompany) {
            const companyName = foundCompany.name;
            console.log('Company:', companyName, 'Symbol:', symbol, 'Price:', price);
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`<h2>Stock Price</h2><p>Company Name: ${companyName}</p><p>Symbol: ${symbol}</p><p>Price: ${price}</p>`);
          } else {
            console.log('Company not found for symbol:', symbol);
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end('Company not found.');
          }
        } else {
          console.log('No stock data found');
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
    console.log('Invalid request or path:', req.method, path);
    res.writeHead(404);
    res.end('Page not found');
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
