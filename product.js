const { MongoClient } = require('mongodb');
const http = require('http');
const url = require('url');

const connectionString = "mongodb+srv://abdi:1%40Abdi6057@companies.jyfn4ka.mongodb.net/";
const client = new MongoClient(connectionString);

async function findStockPrice(searchTerm, searchBy) {
  try {
    await client.connect();
    const db = client.db("companies");
    const collection = db.collection('companies');

    let query = {};
    if (searchBy === 'name') {
      query = { companyName: searchTerm };
    } else if (searchBy === 'ticker') {
      query = { stockTicker: searchTerm };
    } else {
      console.log('Invalid search type.');
      return null;
    }

    const companyData = await collection.findOne(query);
    if (!companyData) {
      console.log('Company not found.');
      return null;
    }

    console.log('Company found:', companyData);

    // Assuming stock price is stored in the companyData as 'stockPrice'
    return companyData.stockPrice;
  } catch (err) {
    console.error("Database error:", err);
    return null;
  } finally {
    await client.close();
  }
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);

  if (req.method === 'GET' && parsedUrl.pathname === '/search') {
    const query = parsedUrl.query.query || '';
    const searchType = parsedUrl.query.searchType || '';

    const stockPrice = await findStockPrice(query, searchType);
    if (stockPrice !== null) {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(`Stock price: ${stockPrice}`);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Stock price not found.');
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Page not found.');
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
