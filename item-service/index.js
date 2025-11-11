// --- ITEM-SERVICE/INDEX.JS (FINAL CLEANED CODE) ---
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { auth, admin } = require('./middleware/auth'); // middleware
const Item = require('./models/Item');
const User = require('./models/User'); 
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();
app.use(cors());
app.use(express.json());

const port = 5002; 

// Database Connection
mongoose.connect(process.env.mongoURI, { /* options */ })
  .then(() => console.log('Item-Service: MongoDB Connected!'))
  .catch(err => console.error(err));

// --- (NEW) CLOUDINARY & MULTER CONFIG ---

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer to use Cloudinary for storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'lost-and-found', // A folder name in Cloudinary
    allowed_formats: ['jpeg', 'png', 'jpg']
  }
});

// This 'upload' variable now sends files to Cloudinary
const upload = multer({ storage: storage });
// ----------------------------------------


// ===================================
//      ITEM ROUTES
// ===================================

// @route   POST /api/items/report
// @desc    Report a new lost or found item
// @access  Private (Needs a token)
app.post('/api/items/report', auth, upload.single('itemImage'), async (req, res) => {
  try {
    const { itemName, category, location, description, itemType } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role; 

    const newItem = new Item({
      itemName,
      category,
      location,
      description,
      itemType, 
      user: userId,
      status: 'Pending'
    });

    if (userRole === 'admin') {
      newItem.status = 'Approved';
      console.log('Admin reported an item. Auto-approving.');
    }

    if (req.file) {
      newItem.image = req.file.path; 
    }

    const savedItem = await newItem.save();
    res.status(201).json(savedItem);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// @route   GET /api/items/all
// @desc    Get all APPROVED items
// @access  Private (Needs a token)
app.get('/api/items/all', auth, async (req, res) => {
  try {
    const items = await Item.find({ 
      status: 'Approved' 
    })
    .sort({ date: -1 }); 

    res.json(items);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// ===================================
//      USER'S OWN REPORTS
// ===================================

// @route   GET /api/items/my-reports
// @desc    Get all items reported by the logged-in user
// @access  Private
app.get('/api/items/my-reports', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const myItems = await Item.find({ user: userId }).sort({ date: -1 });
    res.json(myItems);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// ===================================
//      ADMIN ROUTES
// ===================================

// @route   GET /api/admin/pending-items
// @desc    Get all items with "Pending" status
// @access  Admin Only
app.get('/api/admin/pending-items', [auth, admin], async (req, res) => {
  try {
    const pendingItems = await Item.find({ status: 'Pending' })
      .sort({ date: -1 })
      .populate('user', 'name email'); 

    res.json(pendingItems);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/admin/approve-item/:id
// @desc    Approve an item
// @access  Admin Only
app.put('/api/admin/approve-item/:id', [auth, admin], async (req, res) => {
  try {
    let item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ msg: 'Item not found' });
    }
    item.status = 'Approved';
    await item.save();
    res.json({ msg: 'Item approved successfully', item });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/admin/claim-item/:id
// @desc    Mark an item as "Claimed"
// @access  Admin Only
app.put('/api/admin/claim-item/:id', [auth, admin], async (req, res) => {
  try {
    let item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ msg: 'Item not found' });
    }
    item.status = 'Claimed';
    await item.save();
    res.json({ msg: 'Item marked as Claimed', item });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- Server Start ---
app.listen(port, () => {
  console.log(`Item-Service (Microservice 2) running on http://localhost:${port}`);
});