const crypto = require("crypto");
const pool = require("../config/database");
const NotFoundError = require("../exceptions/NotFoundError");

exports.createCategory = async (req, res, next) => {
  try {
    const id = crypto.randomUUID();
    const result = await pool.query(
      "INSERT INTO categories (id, name) VALUES ($1, $2) RETURNING id, name",
      [id, req.body.name],
    );
    return res.status(201).json({ status: "success", data: result.rows[0] });
  } catch (err) {
    return next(err);
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT id, name, created_at, updated_at FROM categories ORDER BY created_at ASC",
    );
    return res
      .status(200)
      .json({ status: "success", data: { categories: result.rows } });
  } catch (err) {
    return next(err);
  }
};

exports.getCategoryById = async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT id, name, created_at, updated_at FROM categories WHERE id = $1",
      [req.params.id],
    );
    if (!result.rows.length)
      throw new NotFoundError("Kategori tidak ditemukan");
    return res.status(200).json({ status: "success", data: result.rows[0] });
  } catch (err) {
    return next(err);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const check = await pool.query("SELECT id FROM categories WHERE id = $1", [
      id,
    ]);
    if (!check.rows.length) {
      throw new NotFoundError("Kategori tidak ditemukan");
    }

    const allowedFields = ["name"];
    const updates = [];
    const values = [];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        values.push(req.body[field]);
        updates.push(`${field} = $${values.length}`);
      }
    }

    updates.push("updated_at = current_timestamp");
    values.push(id);

    const query = `UPDATE categories SET ${updates.join(", ")} WHERE id = $${values.length} RETURNING id`;
    await pool.query(query, values);

    return res.status(200).json({
      status: "success",
      message: "Kategori berhasil diperbarui",
    });
  } catch (err) {
    return next(err);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const result = await pool.query(
      "DELETE FROM categories WHERE id = $1 RETURNING id",
      [req.params.id],
    );
    if (!result.rows.length)
      throw new NotFoundError("Kategori tidak ditemukan");
    return res
      .status(200)
      .json({ status: "success", message: "Kategori berhasil dihapus" });
  } catch (err) {
    return next(err);
  }
};
