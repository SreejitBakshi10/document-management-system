const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        fileType: {
            type: String,
            required: true
        },
        tags: [
            {
                type: String,
                lowercase: true,
                trim: true
            }
        ],
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        permissions: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
                },
                access: {
                    type: String,
                    enum: ["view", "edit"],
                    required: true
                }
            }
        ],
        currentVersion: {
            type: Number,
            default: 1
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Document", documentSchema);