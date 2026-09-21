const bcrypt = require("bcrypt");
const crypto = require("crypto");
const pool = require("../config/database");
const InvariantError = require("../exceptions/InvariantError");
const NotFoundError = require("../exceptions/NotFoundError");
const redisService = require("../services/redisService");

exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role = "user" } = req.body;

    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);
    if (existing.rows.length) {
      throw new InvariantError("Email sudah terdaftar");
    }

    const id = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (id, name, email, password, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role`,
      [id, name, email, hashedPassword, role],
    );

    return res.status(201).json({
      status: "success",
      data: result.rows[0],
    });
  } catch (err) {
    return next(err);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cacheKey = `user:${id}`;

    const cached = await redisService.get(cacheKey);
    if (cached) {
      return res
        .status(200)
        .set("X-Data-Source", "cache")
        .json({ status: "success", data: cached });
    }

    const result = await pool.query(
      "SELECT id, name, email, role FROM users WHERE id = $1",
      [id],
    );

    if (!result.rows.length) {
      throw new NotFoundError("User tidak ditemukan");
    }

    const user = result.rows[0];

    await redisService.set(cacheKey, user);

    return res
      .status(200)
      .set("X-Data-Source", "database")
      .json({ status: "success", data: user });
  } catch (err) {
    return next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const check = await pool.query("SELECT id FROM users WHERE id = $1", [id]);
    if (!check.rows.length) {
      throw new NotFoundError("User tidak ditemukan");
    }

    const allowedFields = ["name", "email", "password", "role"];
    const updates = [];
    const values = [];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === "password") {
          const hashed = await bcrypt.hash(req.body[field], 10);
          values.push(hashed);
        } else {
          values.push(req.body[field]);
        }
        updates.push(`${field} = $${values.length}`);
      }
    }

    updates.push("updated_at = current_timestamp");
    values.push(id);

    const query = `UPDATE users SET ${updates.join(", ")} WHERE id = $${values.length} RETURNING id`;
    await pool.query(query, values);

    await redisService.del(`user:${id}`);

    return res.status(200).json({
      status: "success",
      message: "User berhasil diperbarui",
    });
  } catch (err) {
    return next(err);
  }
};
