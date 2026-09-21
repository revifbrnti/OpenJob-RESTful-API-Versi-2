const bcrypt = require("bcrypt");
const crypto = require("crypto");
const pool = require("../config/database");
const TokenManager = require("../utils/tokenManager");
const AuthenticationError = require("../exceptions/AuthenticationError");
const InvariantError = require("../exceptions/InvariantError");

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query(
      "SELECT id, password FROM users WHERE email = $1",
      [email],
    );

    if (!result.rows.length) {
      throw new AuthenticationError("Kredensial yang Anda berikan salah");
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new AuthenticationError("Kredensial yang Anda berikan salah");
    }

    const accessToken = TokenManager.generateAccessToken({ id: user.id });
    const refreshToken = TokenManager.generateRefreshToken({ id: user.id });

    await pool.query(
      "INSERT INTO authentications (token, user_id) VALUES ($1, $2)",
      [refreshToken, user.id],
    );

    return res.status(200).json({
      status: "success",
      data: { accessToken, refreshToken },
    });
  } catch (err) {
    return next(err);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const payload = TokenManager.verifyRefreshToken(refreshToken);

    const result = await pool.query(
      "SELECT token, user_id FROM authentications WHERE token = $1",
      [refreshToken],
    );

    if (!result.rows.length || result.rows[0].user_id !== payload.id) {
      throw new InvariantError("Refresh token tidak ditemukan di database");
    }

    const accessToken = TokenManager.generateAccessToken({ id: payload.id });

    return res.status(200).json({
      status: "success",
      data: { accessToken },
    });
  } catch (err) {
    return next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const payload = TokenManager.verifyRefreshToken(refreshToken);
    const result = await pool.query(
      "DELETE FROM authentications WHERE token = $1 AND user_id = $2 RETURNING token",
      [refreshToken, payload.id],
    );

    if (!result.rows.length) {
      throw new InvariantError("Refresh token tidak ditemukan di database");
    }

    return res.status(200).json({
      status: "success",
      message: "Refresh token berhasil dihapus",
    });
  } catch (err) {
    return next(err);
  }
};
