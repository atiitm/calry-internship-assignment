const express = require('express');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const app = express();
const PORT = 3000;

// File path for JSON data storage
const DATA_FILE = './requests.json';

// Middleware to parse JSON request bodies
app.use(express.json());

// Helper functions to handle file operations safely
const readData = async () => {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return []; // Return an empty array if file not found or invalid JSON
  }
};

const writeData = async (data) => {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing to file:', err);
  }
};

// POST /requests - Add a new service request
app.post('/requests', async (req, res) => {
  const { guestName, roomNumber, requestDetails, priority } = req.body;

  // Create a new request object
  const newRequest = {
    id: uuidv4(),
    guestName,
    roomNumber,
    requestDetails,
    priority: priority || 5, // Default priority if not provided
    status: 'received',
  };

  const requests = await readData();
  requests.push(newRequest);
  await writeData(requests);

  res.status(201).json(newRequest);
});

// GET /requests - Retrieve all requests sorted by priority
app.get('/requests', (req, res) => {
  try {
      const requests = readRequests();

      // Sort requests based on priority (lower numbers indicate higher priority)
      requests.sort((a, b) => a.priority - b.priority);

      res.json(requests);
  } catch (error) {
      res.status(500).json({ message: 'Error retrieving requests', error: error.message });
  }
});

// GET /requests/:id - Retrieve a specific request by ID
app.get('/requests/:id', async (req, res) => {
  const { id } = req.params;
  const requests = await readData();
  const request = requests.find((r) => r.id === id);

  if (request) {
    res.json(request);
  } else {
    res.status(404).json({ message: 'Request not found' });
  }
});

// PUT /requests/:id - Update an existing request
app.put('/requests/:id', async (req, res) => {
  const { id } = req.params;
  const { guestName, roomNumber, requestDetails, priority, status } = req.body;

  const requests = await readData();
  const requestIndex = requests.findIndex((r) => r.id === id);

  if (requestIndex !== -1) {
    requests[requestIndex] = {
      ...requests[requestIndex],
      guestName: guestName || requests[requestIndex].guestName,
      roomNumber: roomNumber || requests[requestIndex].roomNumber,
      requestDetails: requestDetails || requests[requestIndex].requestDetails,
      priority: priority || requests[requestIndex].priority,
      status: status || requests[requestIndex].status,
    };
    await writeData(requests);
    res.json(requests[requestIndex]);
  } else {
    res.status(404).json({ message: 'Request not found' });
  }
});

// DELETE /requests/:id - Delete a completed or canceled request
app.delete('/requests/:id', async (req, res) => {
  const { id } = req.params;
  const requests = await readData();
  const filteredRequests = requests.filter((r) => r.id !== id);

  if (requests.length === filteredRequests.length) {
    res.status(404).json({ message: 'Request not found' });
  } else {
    await writeData(filteredRequests);
    res.status(204).send(); // No content
  }
});

// POST /requests/:id/complete - Mark a request as completed
app.post('/requests/:id/complete', async (req, res) => {
  const { id } = req.params;
  const requests = await readData();
  const requestIndex = requests.findIndex((r) => r.id === id);

  if (requestIndex !== -1) {
    requests[requestIndex].status = 'completed';
    await writeData(requests);
    res.json(requests[requestIndex]);
  } else {
    res.status(404).json({ message: 'Request not found' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
