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
const { addToCart } = require('./db/cart');
const { checkout } = require('./db/orders');
const {
  OUT_OF_STOCK,
  PRODUCT_NOT_FOUND,
  CART_EMPTY,
} = require('./lib/dbErrorCodes');

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

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

app.post('/api/cart/add', async (req, res) => {
  const { cartId, productId, quantity = 1 } = req.body ?? {};

  if (!UUID_PATTERN.test(cartId)) {
    return res.status(400).json({ error: 'cartId must be a UUID' });
  }
  if (!Number.isInteger(productId) || productId < 1) {
    return res.status(400).json({ error: 'productId must be a positive integer' });
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({ error: 'quantity must be a positive integer' });
  }

  try {
    const cart = await addToCart(cartId, productId, quantity);
    res.status(201).json({ cart });
  } catch (err) {
    if (err.code === PRODUCT_NOT_FOUND) return res.status(404).json({ error: err.message });
    if (err.code === OUT_OF_STOCK) return res.status(409).json({ error: err.message });

    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/checkout', async (req, res) => {
  const { cartId } = req.body ?? {};

  if (!UUID_PATTERN.test(cartId)) {
    return res.status(400).json({ error: 'cartId must be a UUID' });
  }

  try {
    const order = await checkout(cartId);
    res.status(201).json({ order });
  } catch (err) {
    if (err.code === CART_EMPTY) return res.status(400).json({ error: err.message });
    if (err.code === OUT_OF_STOCK) return res.status(409).json({ error: err.message });

    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`running at: http://localhost:${PORT}`));
