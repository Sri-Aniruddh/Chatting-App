import mongoose from "mongoose";

const channelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    members: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true,
        },
    ],
    admin: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    messages: [{
        type: mongoose.Schema.ObjectId,
        ref: "Message",
        required: false, // Messages are optional initially
    }],
    createdAt: {
        type: Date,
        default: Date.now, // Automatically sets the date when the document is created
    },
    updatedAt: {
        type: Date,
        default: Date.now, // Automatically sets the date when the document is created
    },
});

// Middleware to update the `updatedAt` field before saving
channelSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

// Middleware to update the `updatedAt` field before findOneAndUpdate
channelSchema.pre("findOneAndUpdate", function (next) {
    this.set({ updatedAt: Date.now() });
    next();
});

const Channel = mongoose.model("Channel", channelSchema);

export default Channel;
