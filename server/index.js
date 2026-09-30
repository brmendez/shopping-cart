const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

const supabase = require('./lib/supabase');


app.use(cors());

app.use(express.json());

const morgan = require('morgan');
app.use(morgan('dev'));

const getProducts = require('./db/products');
const getPaginationParams = require('./lib/pagination');

app.get('/api/products', async (req, res) => {
  const { limit: rawLimit, page: rawPage } = req.query;
  const { limit, page } = getPaginationParams(rawLimit, rawPage);

  try {
    const { products, total } = await getProducts(limit, page);

    res.json({
      products,
      limit,
      total,
      page,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cart/add', (req, res) => {
  // console.log('supabase', supabase);
  const product = req.body;

  console.log(`User added: ${product.title}`);

  // if okay
  // update cart
  const cart = [
    ...product,
  ];

  res.status(201).send(cart);
});

app.listen(PORT, () => console.log(`running at: http://localhost:${PORT}`));
