import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt";
import multer from "multer";
import { verifyToken } from "./middleware/AuthMiddleware.js"
import { renameSync, unlinkSync } from "fs"
import path from 'path';
import fs from "fs"
import { fileURLToPath } from 'url';
import setupSocket from "./socket.js";
import http from 'http';
import { type } from "os";
import Message from "./models/Messagemodel.js";
import Channel from "./models/ChannelModel.js"



// Determine the directory name using import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const databaseURL = process.env.DATABASE_URL;

const corsOptions = {
    origin: [process.env.ORIGIN],
    optionsSuccessStatus: 200,
    credentials: true,
}
app.use(cors(corsOptions));

app.use("/uploads/profiles", express.static("uploads/profiles"));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//Database connection 
mongoose.connect(databaseURL).then(() => console.log('MONGOOSE DATABASE CONNECTION SUCCESSFULL')).catch(err => console.log(err.message))
//end

// API creation
app.get("/", (req, res) => {
    res.send("Express App is Running");
});
//end



const server = http.createServer(app);
setupSocket(server);

//Schema creation or UserModel for signup and login
const Users = mongoose.model('Users', {
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    name: {
        type: String,
        required: false,
    },
    image: {
        type: String,
        required: false,
    },
    color: {
        type: Number,
        required: false,
    },
    profileSetup: {
        type: Boolean,
        default: false,
    },
})
//end 

//creating API for registrating the user
app.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        let existingUser = await Users.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, error: "Existing user found with the same email address" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const user = new Users({
            name: username,
            email,
            password: hashedPassword,
            profileSetup: false
        });

        // Save the user to the database
        await user.save();

        // Create a JWT token
        const data = {
            user: {
                id: user.id,
            },
        };

        const token = jwt.sign(data, 'secret_ecom');

        res.json({ success: true, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});
//end

//creating API for user login
app.post('/login', async (req, res) => {
    try {
        // Find user by email
        let user = await Users.findOne({ email: req.body.email });
        if (user) {
            // Compare passwords using bcrypt
            const passCompare = await bcrypt.compare(req.body.password, user.password); // Await the bcrypt comparison
            if (passCompare) {
                const data = {
                    user: {
                        id: user.id,
                        profileSetup: user.profileSetup,
                        email: user.email, // Or use actual profile setup status from user document if available
                    }
                }
                // Generate JWT token
                const token = jwt.sign(data, 'secret_ecom');
                res.cookie('jwt', token, { httpOnly: true, secure: false });
                res.json({ success: true, token, user: data.user }); // Include user object in the response
            } else {
                res.status(401).json({ success: false, errors: "Wrong password" });
            }
        } else {
            res.status(404).json({ success: false, errors: "User not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});
//end

//creating API for UserInfo for Profile setup
app.get('/user-info', verifyToken, (req, res) => {
    try {
        // Assuming you fetch user info based on the user id in the token
        const userData = Users.findById(req.user.id); //Replace with actual logic to get user info
        if (!userData) {
            return res.status(404).send("User given id is not found");
        }
        return res.status(200).json({

            id: userData.id,
            email: userData.email,
            profileSetup: userData.profileSetup,
            username: userData.name,
            image: userData.image,

        })
    } catch (error) {
        console.error({ error });
        return res.status(500).send("Internal server error");
    }
});
//end

//creating API for Updating Profile setup
app.post('/update-profile', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: "Name is required." });
        }

        const userData = await Users.findByIdAndUpdate(
            userId,
            { name, profileSetup: true },
            { new: true, runValidators: true }
        );

        if (!userData) {
            return res.status(404).json({ error: "User not found." });
        }

        return res.status(200).json({
            id: userData.id,
            email: userData.email,
            profileSetup: userData.profileSetup,
            username: userData.name,
            image: userData.image,
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        return res.status(500).json({ error: "Internal server error in updating profile." });
    }
});
//end

//creating api for updating and inserting UserProfile image 
const upload = multer({ dest: "uploads/profiles/" })
app.post('/add-profile-image', verifyToken, upload.single("profile-image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "File is required." });
        }

        const date = Date.now();
        const fileName = `uploads/profiles/${date}-${req.file.originalname}`;

        renameSync(req.file.path, fileName);

        const updatedUser = await Users.findByIdAndUpdate(req.user.id, { image: fileName }, { new: true, runValidators: true });

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found." });
        }

        return res.status(200).json({
            image: updatedUser.image,
        });

    } catch (error) {
        console.error("Error uploading profile image:", error);
        return res.status(500).json({ error: "Internal server error while uploading profile image." });
    }
});
//end

//creating api for Deleting Profile image 
app.delete('/remove-profile-image', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // Find the user by ID
        const user = await Users.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        // Check if the user has an image
        if (user.image) {
            // Construct the image file path
            const imagePath = path.join(__dirname, 'uploads/profiles', path.basename(user.image));

            // Check if the file exists and remove it
            if (fs.existsSync(imagePath)) {
                unlinkSync(imagePath);
            } else {
                return res.status(404).json({ error: "Image file not found on server." });
            }

            // Update the user document to remove the image reference
            user.image = null;
            await user.save();

            return res.status(200).json({ message: "Profile image removed successfully." });
        } else {
            return res.status(400).json({ error: "No profile image to remove." });
        }
    } catch (error) {
        console.error("Error removing profile image:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});
//end

//Creating Logout Api
app.post('/logout', verifyToken, async (req, res) => {
    try {
        res.clearCookie('jwt'); // Clear the JWT cookie
        return res.status(200).json({ message: "Logged out successfully." });
    } catch (error) {
        console.error("Error in logout:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});
//end

//creating api for getting contacts details 
app.post('/getting-Contacts', verifyToken, async (req, res) => {
    try {
        const { searchTerm } = req.body;
        if (searchTerm === undefined || searchTerm === null) {
            return res.status(400).send('Search Term is required.');
        }
        const sanitizedSearchTerm = searchTerm.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );

        const regex = new RegExp(sanitizedSearchTerm, "i");

        const contacts = await Users.find({
            $and: [
                { _id: { $ne: req.userId } },
                { $or: [{ username: regex }, { email: regex }] }
            ]
        });

        return res.status(200).json({ contacts });

    } catch (error) {
        console.error("Error in getting contacts:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});
//end

//creating api for getting contacts list 
app.get('/getting-Contacts-list', verifyToken, async (req, res) => {
    try {
        let userId = req.user.id; // Get the user ID from the verified token
        console.log('Received userId:', userId); // Log userId
        userId = new mongoose.Types.ObjectId(userId);

        // Aggregation pipeline
        const contacts = await Message.aggregate([
            {
                $match: {
                    $or: [{ sender: userId }, { recipient: userId }],
                },
            },
            {
                $sort: {
                    timestamp: -1
                },
            },
            {
                $group: {
                    _id: {
                        $cond: {
                            if: { $eq: ["$sender", userId] },
                            then: "$recipient",
                            else: "$sender",
                        },
                    },
                    lastMessageTime: { $first: "$timestamp" },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: 'contactinfo',
                },
            },
            {
                $unwind: '$contactinfo'
            },
            {
                $project: {
                    _id: 1,
                    lastMessageTime: 1,
                    username: '$contactinfo.username', // Use $ to reference the field
                    email: '$contactinfo.email', // Use $ to reference the field
                    image: '$contactinfo.image',
                },
            },
            {
                $sort: { lastMessageTime: -1 },
            },
        ]);

        console.log('Aggregated contacts:', contacts); // Log contacts

        return res.status(200).json({ contacts });

    } catch (error) {
        console.error("Error in getting contacts:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});
//end

//creating api for Retriving Messages (restore)
app.post('/get-messages', verifyToken, async (req, res) => {
    const { id } = req.body; // Extract chat ID from request body

    // Log received data
    console.log("Request Body:", req.body); // Log the request body
    console.log("User ID from Token:", req.user.id); // Log user ID from the token

    // Check if `id` is present
    if (!id) {
        return res.status(400).json({ error: 'Chat ID is required' });
    }

    try {
        // Fetch messages logic here
        const messages = await Message.find({
            $or: [
                { sender: req.user.id, recipient: id },
                { sender: id, recipient: req.user.id }
            ]
        }).sort({ timestamp: 1 }); // Sort by timestamp to get messages in chronological order

        res.status(200).json({ messages });
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
//end

// app.listen(port, (error) => {
//     if (!error) {
//         console.log(`Server is running http://localhost:${port}`);
//     } else {
//         console.log("Erorr: " + error);
//     }
// })
// setupSocket(server);

//Adding Attachement Files 
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/files/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const date = Date.now();
        const ext = path.extname(file.originalname);
        cb(null, `${date}-${file.originalname}`);
    }
});
const uploadFILE = multer({ storage });
app.post('/add-attachment-files', verifyToken, uploadFILE.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "File is required." });
        }

        // Construct the file URL
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/files/${req.file.filename}`;

        const updatedUser = await Users.findByIdAndUpdate(req.user.id, { image: req.file.filename }, { new: true, runValidators: true });

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found." });
        }

        return res.status(200).json({
            image: updatedUser.image,
            fileUrl: fileUrl // Return the file URL
        });

    } catch (error) {
        console.error("Error uploading profile image:", error);
        return res.status(500).json({ error: "Internal server error while uploading profile image." });
    }
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
//end

//get channel contact models
app.get('/gettingALLcontact-channel', verifyToken, async (req, res) => {
    try {
        const users = await Users.find({ _id: { $ne: req.userId } },
            "username _id email"
        );

        const contacts = users.map((user) => ({
            label: user.username ? user.username : user.email,
            value:user._id,
        }))
        
        return res.status(200).json({ contacts });

    } catch (error) {
        console.error("Error in gettingALLcontact-channel:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});
//end

//creating chanels api
app.post('/create-channel', verifyToken, async (req, res) => {
    try {
        const { name, member } = req.body;
        const userId = req.user.id;
        const admin = await Users.findById(userId);

        if (!admin) {
            return res.status(400).json({ error: "Admin user not found." });
        }

        const validMembers = await Users.find({ _id: { $in: member } });
        if (validMembers.length !== member.length) {
            return res.status(400).json({ error: "Some members are not valid users." });
        }

        const newChannel = new Channel({
            name,
            members: member,
            admin: userId,
        });
        await newChannel.save();

        return res.status(201).json({ channel: newChannel });
    } catch (error) {
        console.error("Error creating channel:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});
//end 

//getting channel after refresh (restore)
app.get('/getUser-channel', verifyToken, async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id); // Corrected to req.user.id
        const channels = await Channel.find({
            $or: [{ admin: userId }, { members: userId }]
        }).sort({ updatedAt: -1 });

        return res.status(200).json({ channels });
    } catch (error) {
        console.error("Error fetching channels:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});
//end


server.listen(port, (error) => {
    if (!error) {
        console.log(`Server is running http://localhost:${port}`);
    } else {
            console.log("Error: " + error);
        }
});
