const crypto = require("crypto");
const pool = require("../config/database");
const NotFoundError = require("../exceptions/NotFoundError");
const redisService = require("../services/redisService");

exports.createCompany = async (req, res, next) => {
  try {
    const { name, location, description } = req.body;
    const id = crypto.randomUUID();
    const userId = req.user.id;

    const result = await pool.query(
      `INSERT INTO companies (id, user_id, name, location, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id, name, location, description`,
      [id, userId, name, location, description],
    );

    return res.status(201).json({ status: "success", data: result.rows[0] });
  } catch (err) {
    return next(err);
  }
};

exports.getCompanies = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, name, location, description, created_at, updated_at
       FROM companies ORDER BY created_at ASC`,
    );
    return res
      .status(200)
      .json({ status: "success", data: { companies: result.rows } });
  } catch (err) {
    return next(err);
  }
};

exports.getCompanyById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cacheKey = `company:${id}`;

    const cached = await redisService.get(cacheKey);
    if (cached) {
      return res
        .status(200)
        .set("X-Data-Source", "cache")
        .json({ status: "success", data: cached });
    }

    const result = await pool.query(
      `SELECT id, name, location, description, created_at, updated_at
       FROM companies WHERE id = $1`,
      [id],
    );
    if (!result.rows.length) {
      throw new NotFoundError("Perusahaan tidak ditemukan");
    }

    const company = result.rows[0];

    await redisService.set(cacheKey, company);

    return res
      .status(200)
      .set("X-Data-Source", "database")
      .json({ status: "success", data: company });
  } catch (err) {
    return next(err);
  }
};

exports.updateCompany = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, location, description } = req.body;

    const result = await pool.query(
      `UPDATE companies
       SET name = $1, location = $2, description = $3, updated_at = current_timestamp
       WHERE id = $4 RETURNING id`,
      [name, location, description, id],
    );
    if (!result.rows.length) {
      throw new NotFoundError("Perusahaan tidak ditemukan");
    }

    await redisService.del(`company:${id}`);

    return res
      .status(200)
      .json({ status: "success", message: "Perusahaan berhasil diperbarui" });
  } catch (err) {
    return next(err);
  }
};

exports.deleteCompany = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM companies WHERE id = $1 RETURNING id",
      [id],
    );
    if (!result.rows.length) {
      throw new NotFoundError("Perusahaan tidak ditemukan");
    }

    await redisService.del(`company:${id}`);

    return res
      .status(200)
      .json({ status: "success", message: "Perusahaan berhasil dihapus" });
  } catch (err) {
    return next(err);
  }
};
