const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server); // Set up socket.io to listen on the server

// In-memory store for transactions
let transactions = [];

// Handle incoming WebSocket connections
io.on('connection', (socket) => {
  console.log('A client connected to the peer network');

  // Listen for incoming transaction data from clients
  socket.on('transaction', (data) => {
    console.log('Received transaction:', data);

    // Simulate adding the transaction to the "blockchain" (store in memory)
    const transaction = {
      id: Date.now().toString(), // Unique ID (could be a more robust method)
      fromAddress: data.fromAddress,
      toAddress: data.toAddress,
      amount: data.amount,
      timestamp: new Date().toISOString(),
      status: 'pending', // Transaction status (initially pending)
    };

    // Add the transaction to the list
    transactions.push(transaction);

    // Send a confirmation back to the client
    socket.emit('transactionStatus', {
      message: 'Transaction successfully processed',
      data: transaction,
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A client disconnected from the peer network');
  });
});

// Express API Routes

// 1. Get all transactions
app.get('/transactions', (req, res) => {
  res.json(transactions);
});

// 2. Get a specific transaction by ID
app.get('/transaction/:id', (req, res) => {
  const transaction = transactions.find(t => t.id === req.params.id);
  if (transaction) {
    res.json(transaction);
  } else {
    res.status(404).send('Transaction not found');
  }
});

// 3. Update transaction status by ID
app.put('/transaction/:id', (req, res) => {
  const { status } = req.body;
  const transaction = transactions.find(t => t.id === req.params.id);

  if (!transaction) {
    return res.status(404).send('Transaction not found');
  }

  if (status) {
    transaction.status = status;
    res.json(transaction);
  } else {
    res.status(400).send('Invalid status');
  }
});

// Start the HTTP server and WebSocket server
server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});