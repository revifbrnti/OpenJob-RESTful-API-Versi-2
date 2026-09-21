const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const pool = require("../config/database");
const NotFoundError = require("../exceptions/NotFoundError");

exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: "failed",
        message: "File is required",
      });
    }

    const userId = req.user.id;
    const id = crypto.randomUUID();

    const result = await pool.query(
      `INSERT INTO documents
       (id, user_id, filename, original_name, mime_type, size)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        id,
        userId,
        req.file.filename,
        req.file.originalname,
        req.file.mimetype,
        req.file.size,
      ],
    );

    return res.status(201).json({
      status: "success",
      data: {
        documentId: result.rows[0].id,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
      },
    });
  } catch (err) {
    return next(err);
  }
};

exports.getDocuments = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, user_id, filename, original_name, mime_type, size, created_at
       FROM documents
       ORDER BY created_at DESC`,
    );

    return res.status(200).json({
      status: "success",
      data: {
        documents: result.rows,
      },
    });
  } catch (err) {
    return next(err);
  }
};

exports.getDocumentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query("SELECT * FROM documents WHERE id = $1", [
      id,
    ]);

    if (!result.rows.length) {
      throw new NotFoundError("Dokumen tidak ditemukan");
    }

    const document = result.rows[0];
    const filePath = path.resolve("uploads", document.filename);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundError("File tidak ditemukan di server");
    }

    res.setHeader("Content-Type", document.mime_type);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${document.original_name}"`,
    );

    return fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    return next(err);
  }
};

exports.deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const check = await pool.query(
      "SELECT id, filename FROM documents WHERE id = $1 AND user_id = $2",
      [id, userId],
    );

    if (!check.rows.length) {
      throw new NotFoundError("Dokumen tidak ditemukan");
    }

    const filePath = path.resolve("uploads", check.rows[0].filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await pool.query("DELETE FROM documents WHERE id = $1 AND user_id = $2", [
      id,
      userId,
    ]);

    return res.status(200).json({
      status: "success",
      message: "Dokumen berhasil dihapus",
    });
  } catch (err) {
    return next(err);
  }
};
