import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import User from '../databaseSchemas/userSchema.mjs';
import Image from '../databaseSchemas/imageSchema.mjs'; // Renamed to Image
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = 'sPz}Plds`zo@<|bF2q-YZ7Oz]V:R>,Gi?MperRk.n$G%{<(L1DLGT8l4Je-x9.^';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads/');
        fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Register route
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        
        res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
        console.error('Error occurred:', error);
        if (error.code === 11000) {
            res.status(400).json({ error: 'Username already exists.' });
        } else {
            res.status(500).json({ error: 'An error occurred while registering the user.' });
        }
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ error: 'Invalid username or password.' });
        }
        
        // Compare the provided password with the hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid username or password.' });
        }
        
        // Generate a JWT token
        const token = jwt.sign(
            { id: user._id, username: user.username },
            JWT_SECRET,
            { expiresIn: '1h' } // Token expires in 1 hour
        );
        
        res.json({ message: 'Login successful.', token });
    } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).json({ error: 'An error occurred while logging in.' });
    }
});

// Image upload route
router.post('/images', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded.' });
        }

        const { title, description } = req.body;
        const imageUrl = `/uploads/${req.file.filename}`;

        const newImage = new Image({ title, image: imageUrl, description });

        await newImage.save();

        res.status(201).json({ message: 'Image uploaded and saved successfully', image: newImage });
    } catch (error) {
        console.error('Error occurred:', error);
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Title or description already exists.' });
        }
        res.status(500).json({ error: 'An error occurred while uploading the image.' });
    }
});

// Fetch images route
router.get('/images-render', async (req, res) => {
    try {
        const images = await Image.find();
        res.json(images);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

export default router;
