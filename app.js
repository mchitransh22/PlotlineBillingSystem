// PLotline Billing System
//Mohil Chitransh - JIIT , Noida
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

let users = [];
let products = [
  { id: 1, name: 'Mouse', price: 500 },
  { id: 2, name: 'Monitor', price: 4500 },
  { id: 3, name: 'Keyboard', price: 800 },
  { id: 4, name: 'Intel CPU', price: 8500 },
  { id: 5, name: 'Webcamera', price: 1500 },
  { id: 6, name: 'Headphone with Mic', price: 4500 },

];
let services = [
  { id: 1, name: 'AntiVirus', price: 2000 },
  { id: 2, name: 'AntiMalware', price: 8500 },
];

let cart = {}; 

// Function to calculate tax for products based on price range
function calculateProductTax(price) {
    
  if (price > 1000 && price <= 5000) {
    return (price * 0.12)+200;
  } else if (price > 5000) {
    return (price * 0.18)+200;
  } else {
    return price+200;
  }
}

// Function to calculate tax for services based on price range
function calculateServiceTax(price) {

  if (price > 1000 && price <= 8000) {
    return (price * 0.10)+100;
  } else if (price > 8000) {
    return (price * 0.15)+100;
  } else {
    return price+100;
  }
}

// API endpoints

// Create an account
app.post('/api/users', (req, res) => {
  const user = req.body;
  users.push(user);
  res.json(user);
});

// Fetch all products and services
app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/services', (req, res) => {
  res.json(services);
});

// Add a product or service to the cart
app.post('/api/cart', (req, res) => {
  const { userId, itemId, itemType, quantity } = req.body;
  const item = itemType === 'product' ? products.find(p => p.id === itemId) : services.find(s => s.id === itemId);

  if (!item) {
    return res.status(404).json({ error: 'Item not found.' });
  }

  if (!cart[userId]) {
    cart[userId] = [];
  }

  cart[userId].push({ item, quantity });
  res.json({ message: 'Item added to cart.' });
});

// Remove a product or service from the cart
app.delete('/api/cart/:itemId', (req, res) => {
  const { userId, itemId } = req.params;

  if (!cart[userId]) {
    return res.status(404).json({ error: 'Cart not found for the user.' });
  }

  cart[userId] = cart[userId].filter(item => item.item.id !== parseInt(itemId));
  res.json({ message: 'Item removed from cart.' });
});

// Clear the cart
app.delete('/api/cart', (req, res) => {
  const { userId } = req.body;
  cart[userId] = [];
  res.json({ message: 'Cart cleared.' });
});


// View detailed bill with grand total
app.get('/api/cart/total', (req, res) => {
    const { userId } = req.query;
  
    if (!cart[userId]) {
      return res.status(404).json({ error: 'Cart not found for the user.' });
    }
  
    const cartItems = cart[userId];
    let detailedBill = [];
    let grandTotal = 0;
  
    cartItems.forEach(item => {
      const { id, name, price } = item.item;
      const quantity = item.quantity;
      let tax;
      let total;
  
      if (item.itemType === 'product') {
        tax = calculateProductTax(price);
      } else {
        tax = calculateServiceTax(price);
      }
  
      total = price * quantity + tax;
      grandTotal += total;
  
      detailedBill.push({ id, name, price, quantity, tax, total });
    });
  
    res.json({ detailedBill, grandTotal });
  });
  

let orders = [];

// API endpoint to place the final order
app.post('/api/orders', (req, res) => {
  const { userId } = req.body;

  if (!cart[userId]) {
    return res.status(404).json({ error: 'Cart not found for the user.' });
  }

  const cartItems = cart[userId];

  if (cartItems.length === 0) {
    return res.status(400).json({ error: 'Cart is empty. Cannot place an empty order.' });
  }

  // Calculate the grand total
  let grandTotal = 0;
  cartItems.forEach(item => {
    const { price } = item.item;
    const quantity = item.quantity;
    let tax;

    if (item.itemType === 'product') {
      tax = calculateProductTax(price);
    } else {
      tax = calculateServiceTax(price);
    }

    grandTotal += (price * quantity + tax);
  });

  const order = {
    userId,
    items: cartItems,
    total: grandTotal,
    date: new Date().toISOString()
  };

  orders.push(order);

  cart[userId] = [];

  res.json({ message: 'Order placed successfully.', order });
});



// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
