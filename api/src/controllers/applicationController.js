const crypto = require("crypto");
const pool = require("../config/database");
const NotFoundError = require("../exceptions/NotFoundError");
const redisService = require("../services/redisService");
const { publishMessage } = require("../services/rabbitmqService");

const applicationListSelect = `
  SELECT
    applications.id,
    applications.user_id,
    applications.job_id,
    applications.status,
    applications.created_at,
    applications.updated_at,
    users.name AS user_name,
    users.email AS user_email,
    jobs.title AS job_title,
    jobs.company_id,
    jobs.location_city,
    jobs.job_type,
    companies.name AS company_name
  FROM applications
  JOIN users ON applications.user_id = users.id
  JOIN jobs ON applications.job_id = jobs.id
  JOIN companies ON jobs.company_id = companies.id
`;

exports.createApplication = async (req, res, next) => {
  try {
    const { user_id: userId, job_id: jobId, status = "pending" } = req.body;

    const userCheck = await pool.query("SELECT id FROM users WHERE id = $1", [
      userId,
    ]);
    if (!userCheck.rows.length) throw new NotFoundError("User tidak ditemukan");

    const jobCheck = await pool.query("SELECT id FROM jobs WHERE id = $1", [
      jobId,
    ]);
    if (!jobCheck.rows.length)
      throw new NotFoundError("Pekerjaan tidak ditemukan");

    const id = crypto.randomUUID();
    const result = await pool.query(
      `INSERT INTO applications (id, user_id, job_id, status)
       VALUES ($1, $2, $3, $4) RETURNING id, user_id, job_id, status`,
      [id, userId, jobId, status],
    );

    await publishMessage({ application_id: result.rows[0].id });
    await redisService.del(`applications:user:${userId}`);
    await redisService.del(`applications:job:${jobId}`);

    return res.status(201).json({ status: "success", data: result.rows[0] });
  } catch (err) {
    return next(err);
  }
};

exports.getApplications = async (req, res, next) => {
  try {
    const result = await pool.query(
      `${applicationListSelect} ORDER BY applications.created_at ASC`,
    );
    return res
      .status(200)
      .json({ status: "success", data: { applications: result.rows } });
  } catch (err) {
    return next(err);
  }
};

exports.getApplicationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cacheKey = `application:${id}`;

    const cached = await redisService.get(cacheKey);
    if (cached) {
      return res
        .status(200)
        .set("X-Data-Source", "cache")
        .json({ status: "success", data: cached });
    }

    const result = await pool.query(
      `${applicationListSelect} WHERE applications.id = $1`,
      [id],
    );
    if (!result.rows.length) throw new NotFoundError("Lamaran tidak ditemukan");

    const application = result.rows[0];
    await redisService.set(cacheKey, application);

    return res
      .status(200)
      .set("X-Data-Source", "database")
      .json({ status: "success", data: application });
  } catch (err) {
    return next(err);
  }
};

exports.getApplicationsByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const cacheKey = `applications:user:${userId}`;

    const cached = await redisService.get(cacheKey);
    if (cached) {
      return res
        .status(200)
        .set("X-Data-Source", "cache")
        .json({ status: "success", data: { applications: cached } });
    }

    const result = await pool.query(
      `${applicationListSelect}
       WHERE applications.user_id = $1
       ORDER BY applications.created_at ASC`,
      [userId],
    );

    await redisService.set(cacheKey, result.rows);

    return res
      .status(200)
      .set("X-Data-Source", "database")
      .json({ status: "success", data: { applications: result.rows } });
  } catch (err) {
    return next(err);
  }
};

exports.getApplicationsByJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const cacheKey = `applications:job:${jobId}`;

    const cached = await redisService.get(cacheKey);
    if (cached) {
      return res
        .status(200)
        .set("X-Data-Source", "cache")
        .json({ status: "success", data: { applications: cached } });
    }

    const result = await pool.query(
      `${applicationListSelect}
       WHERE applications.job_id = $1
       ORDER BY applications.created_at ASC`,
      [jobId],
    );

    await redisService.set(cacheKey, result.rows);

    return res
      .status(200)
      .set("X-Data-Source", "database")
      .json({ status: "success", data: { applications: result.rows } });
  } catch (err) {
    return next(err);
  }
};

exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await pool.query(
      "SELECT user_id, job_id FROM applications WHERE id = $1",
      [id],
    );
    if (!existing.rows.length)
      throw new NotFoundError("Lamaran tidak ditemukan");

    await pool.query(
      `UPDATE applications SET status = $1, updated_at = current_timestamp
       WHERE id = $2 RETURNING id`,
      [req.body.status, id],
    );

    await redisService.del(`application:${id}`);
    await redisService.del(`applications:user:${existing.rows[0].user_id}`);
    await redisService.del(`applications:job:${existing.rows[0].job_id}`);

    return res.status(200).json({
      status: "success",
      message: "Status lamaran berhasil diperbarui",
    });
  } catch (err) {
    return next(err);
  }
};

exports.deleteApplication = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await pool.query(
      "SELECT user_id, job_id FROM applications WHERE id = $1",
      [id],
    );
    if (!existing.rows.length)
      throw new NotFoundError("Lamaran tidak ditemukan");

    await pool.query("DELETE FROM applications WHERE id = $1", [id]);

    await redisService.del(`application:${id}`);
    await redisService.del(`applications:user:${existing.rows[0].user_id}`);
    await redisService.del(`applications:job:${existing.rows[0].job_id}`);

    return res.status(200).json({
      status: "success",
      message: "Lamaran berhasil dihapus",
    });
  } catch (err) {
    return next(err);
  }
};
