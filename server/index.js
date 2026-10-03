const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

const supabase = require('./lib/supabase');

app.use(cors());

app.use(express.json());

const morgan = require('morgan');
app.use(morgan('dev'));

const { getProducts, getScarceProducts } = require('./db/products');
const getPaginationParams = require('./lib/pagination');
const getNextRestockAt = require('./db/restock');
const {
  addToCart,
  setQuantity,
  removeFromCart,
  getCart,
} = require('./db/cart');
const { checkout, createCheckoutSession } = require('./db/orders');
const { OUT_OF_STOCK, NOT_FOUND, CART_EMPTY } = require('./lib/dbErrorCodes');

app.get('/api/products', async (req, res) => {
  const { limit: rawLimit, page: rawPage } = req.query;
  const { limit, page } = getPaginationParams(rawLimit, rawPage);

  try {
    const [{ products, total }, scarce, nextRestockAt] = await Promise.all([
      getProducts(limit, page),
      getScarceProducts(),
      getNextRestockAt(),
    ]);

    res.json({
      products,
      limit,
      total,
      page,
      nextRestockAt,
      scarce,
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
    if (err.code === NOT_FOUND) return res.status(404).json({ error: err.message });
    if (err.code === OUT_OF_STOCK) return res.status(409).json({ error: err.message });

    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/cart/:cartId', async (req, res) => {
  const { cartId } = req.params;

  if (!UUID_PATTERN.test(cartId)) {
    return res.status(400).json({ error: 'cartId must be a UUID' });
  }

  try {
    const cart = await getCart(cartId);
    res.json({ cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/cart/:cartId/items/:productId', async (req, res) => {
  const { cartId } = req.params;
  const productId = Number(req.params.productId);
  const { quantity } = req.body ?? {};

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
    const cart = await setQuantity(cartId, productId, quantity);
    res.json({ cart });
  } catch (err) {
    if (err.code === NOT_FOUND) return res.status(404).json({ error: err.message });
    if (err.code === OUT_OF_STOCK) return res.status(409).json({ error: err.message });

    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/cart/:cartId/items/:productId', async (req, res) => {
  const { cartId } = req.params;
  const productId = Number(req.params.productId);

  if (!UUID_PATTERN.test(cartId)) {
    return res.status(400).json({ error: 'cartId must be a UUID' });
  }
  if (!Number.isInteger(productId) || productId < 1) {
    return res.status(400).json({ error: 'productId must be a positive integer' });
  }

  try {
    const cart = await removeFromCart(cartId, productId);
    res.json({ cart });
  } catch (err) {
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

app.post('/api/checkout/session', async (req, res) => {
  const { cartId } = req.body ?? {};

  if (!UUID_PATTERN.test(cartId)) {
    return res.status(400).json({ error: 'cartId must be a UUID' });
  }

  try {
    const session = await createCheckoutSession(cartId);
    res.status(201).json(session);
  } catch (err) {
    if (err.code === CART_EMPTY) return res.status(400).json({ error: err.message });
    if (err.code === OUT_OF_STOCK) return res.status(409).json({ error: err.message });

    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`running at: http://localhost:${PORT}`));
