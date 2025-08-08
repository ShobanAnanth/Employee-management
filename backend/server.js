const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection string - REPLACE THIS WITH YOUR ACTUAL CONNECTION STRING
const MONGODB_URI = 'mongodb://localhost:27017'; // For local MongoDB
// For MongoDB Atlas, use: 'mongodb+srv://username:password@cluster.mongodb.net/databasename'
// Example Atlas: 'mongodb+srv://john:mypassword@cluster0.ab1cd.mongodb.net/employeeManagement'

const DATABASE_NAME = 'employeeManagement';
const COLLECTION_NAME = 'employees';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname))); // Serve static files

let db;

// Connect to MongoDB
async function connectToDatabase() {
    try {
        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        db = client.db(DATABASE_NAME);
        console.log('Connected to MongoDB successfully');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
}

// API Routes

// Get all employees
app.get('/api/employees', async (req, res) => {
    try {
        const employees = await db.collection(COLLECTION_NAME).find({}).toArray();
        res.json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ error: 'Failed to fetch employees' });
    }
});

// Add a new employee
app.post('/api/employees', async (req, res) => {
    try {
        const { firstName, lastName, dateOfBirth, location, department, salary } = req.body;
        
        // Validate required fields
        if (!firstName || !lastName || !dateOfBirth || !location || !department || !salary) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        const newEmployee = {
            firstName,
            lastName,
            dateOfBirth,
            location,
            department,
            salary: parseFloat(salary),
            createdAt: new Date()
        };
        
        const result = await db.collection(COLLECTION_NAME).insertOne(newEmployee);
        
        // Return the created employee with its ID
        const createdEmployee = { ...newEmployee, _id: result.insertedId };
        res.status(201).json(createdEmployee);
    } catch (error) {
        console.error('Error adding employee:', error);
        res.status(500).json({ error: 'Failed to add employee' });
    }
});

// Delete an employee by first and last name
app.delete('/api/employees', async (req, res) => {
    try {
        const { firstName, lastName } = req.body;
        
        if (!firstName || !lastName) {
            return res.status(400).json({ error: 'First name and last name are required' });
        }
        
        // Case-insensitive search
        const result = await db.collection(COLLECTION_NAME).findOneAndDelete({
            firstName: { $regex: new RegExp(`^${firstName}$`, 'i') },
            lastName: { $regex: new RegExp(`^${lastName}$`, 'i') }
        });
        
        if (result.value) {
            res.json({ message: 'Employee deleted successfully', employee: result.value });
        } else {
            res.status(404).json({ error: 'Employee not found' });
        }
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ error: 'Failed to delete employee' });
    }
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server and connect to database
async function startServer() {
    await connectToDatabase();
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

startServer();