const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const Document = require("../models/Document");
const DocumentVersion = require("../models/DocumentVersion");

exports.uploadDocument = async (req, res) => {
    try {
        const { title, tags } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: "File required" });
        }

        const document = await Document.create({
            title,
            fileType: req.file.mimetype,
            tags: tags ? tags.split(",") : [],
            owner: req.user.id,
            allowedUsers: [],
            currentVersion: 1
        });

        await DocumentVersion.create({
            document: document._id,
            versionNumber: 1,
            filePath: req.file.path,
            updatedBy: req.user.id
        });

        res.status(201).json({
            message: "Document uploaded successfully",
            documentId: document._id
        });
    } catch (err) {
        res.status(500).json({ message: "Upload failed" });
    }
};

exports.getDocuments = async (req, res) => {
    try {
        const { search, tags } = req.query;

        let query = {};

        if (req.user.role !== "admin") {
            query = {
                $or: [
                    { owner: req.user.id },
                    { "permissions.user": req.user.id }
                ]
            };
        }

        if (search) {
            query.title = { $regex: search, $options: "i" };
        }

        if (tags) {
            const tagArray = tags.split(",").map(tag => tag.trim().toLowerCase());
            query.tags = { $in: tagArray };
        }

        // const documents = await Document.find(query)
        //     .populate("owner", "name email")
        //     .sort({ createdAt: -1 });

        const documents = await Document.find(query)
            .populate("owner", "name email")
            .populate("permissions.user", "name email")
            .sort({ createdAt: -1 });

        res.json(documents);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch documents" });
    }
};

exports.getDocumentById = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id)
            .populate("owner", "name email");

        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        if (
            req.user.role !== "admin" &&
            document.owner.toString() !== req.user.id &&
            !document.allowedUsers.includes(req.user.id)
        ) {
            return res.status(403).json({ message: "Access denied" });
        }

        res.json(document);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch document" });
    }
};

exports.updateDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        const isOwner = document.owner.toString() === req.user.id;

        const isEditor = document.permissions.some(
            (p) =>
                p.user.toString() === req.user.id &&
                p.access === "edit"
        );

        const isAdmin = req.user.role === "admin";

        if (!isOwner && !isEditor && !isAdmin) {
            return res
                .status(403)
                .json({ message: "Edit permission required" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "File required" });
        }

        const newVersionNumber = document.currentVersion + 1;

        await DocumentVersion.create({
            document: document._id,
            versionNumber: newVersionNumber,
            filePath: req.file.path,
            updatedBy: req.user.id
        });

        document.currentVersion = newVersionNumber;
        await document.save();

        res.json({
            message: "Document updated",
            currentVersion: newVersionNumber
        });
    } catch (err) {
        res.status(500).json({ message: "Update failed" });
    }
};

// exports.shareDocument = async (req, res) => {
//     try {
//         const { userId } = req.body;

//         const document = await Document.findById(req.params.id);

//         if (!document) {
//             return res.status(404).json({ message: "Document not found" });
//         }

//         if (
//             req.user.role !== "admin" &&
//             document.owner.toString() !== req.user.id
//         ) {
//             return res.status(403).json({ message: "Access denied" });
//         }

//         const user = await User.findById(userId);
//         if (!user) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         if (!document.allowedUsers.includes(userId)) {
//             document.allowedUsers.push(userId);
//             await document.save();
//         }

//         res.json({ message: "User granted access" });
//     } catch (err) {
//         res.status(500).json({ message: "Failed to share document" });
//     }
// };

// exports.shareDocument = async (req, res) => {
//     try {
//         const { email } = req.body;

//         const document = await Document.findById(req.params.id);

//         if (!document) {
//             return res.status(404).json({ message: "Document not found" });
//         }

//         if (
//             req.user.role !== "admin" &&
//             document.owner.toString() !== req.user.id
//         ) {
//             return res.status(403).json({ message: "Access denied" });
//         }

//         const user = await User.findOne({ email });

//         if (!user) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         if (!document.allowedUsers.includes(user._id)) {
//             document.allowedUsers.push(user._id);
//             await document.save();
//         }

//         res.json({ message: "Access granted successfully" });

//     } catch (err) {
//         res.status(500).json({ message: "Share failed" });
//     }
// };

exports.shareDocument = async (req, res) => {
    try {
        const { email, access } = req.body;

        if (!["view", "edit"].includes(access)) {
            return res.status(400).json({ message: "Invalid permission type" });
        }

        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        // Only owner or editor can share
        const isOwner = document.owner.toString() === req.user.id;

        const isEditor = document.permissions.some(p =>
            p.user.toString() === req.user.id && p.access === "edit"
        );

        if (!isOwner && !isEditor && req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const existing = document.permissions.find(
            p => p.user.toString() === user._id.toString()
        );

        if (existing) {
            existing.access = access;
        } else {
            document.permissions.push({
                user: user._id,
                access
            });
        }

        await document.save();

        res.json({ message: "Permission updated successfully" });

    } catch (err) {
        res.status(500).json({ message: "Permission update failed" });
    }
};

exports.downloadDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        const isOwner = document.owner.toString() === req.user.id;

        const hasPermission = document.permissions?.some(p =>
            p.user.toString() === req.user.id
        );

        if (!isOwner && !hasPermission && req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied" });
        }

        const version = await DocumentVersion.findOne({
            document: document._id,
            versionNumber: document.currentVersion
        });

        if (!version) {
            return res.status(404).json({ message: "File not found" });
        }

        const absolutePath = version.filePath;

        if (!fs.existsSync(absolutePath)) {
            console.log("File not found at:", absolutePath);
            return res.status(404).json({ message: "File missing on server" });
        }

        res.download(absolutePath);

    } catch (err) {
        console.error("Download error:", err);
        res.status(500).json({ message: "Download failed" });
    }
};

exports.deleteDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        // Only owner can delete
        if (document.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: "Only owner can delete this document" });
        }

        // Find all versions
        const versions = await DocumentVersion.find({
            document: document._id
        });

        // Delete files from disk
        for (const version of versions) {
            const filePath = version.filePath;

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // Delete versions
        await DocumentVersion.deleteMany({
            document: document._id
        });

        // Delete document record
        await Document.findByIdAndDelete(document._id);

        res.json({ message: "Document deleted successfully" });

    } catch (err) {
        console.error("Delete error:", err);
        res.status(500).json({ message: "Delete failed" });
    }
};