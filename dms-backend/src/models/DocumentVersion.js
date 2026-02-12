const mongoose = require("mongoose");

const documentVersionSchema = new mongoose.Schema(
    {
        document: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Document",
            required: true
        },
        versionNumber: {
            type: Number,
            required: true
        },
        filePath: {
            type: String,
            required: true
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("DocumentVersion", documentVersionSchema);