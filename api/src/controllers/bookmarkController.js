const crypto = require("crypto");
const pool = require("../config/database");
const NotFoundError = require("../exceptions/NotFoundError");
const redisService = require("../services/redisService");

const bookmarkListSelect = `
  SELECT
    bookmarks.id,
    bookmarks.user_id,
    bookmarks.job_id,
    bookmarks.created_at,
    jobs.id AS job_detail_id,
    jobs.company_id,
    jobs.category_id,
    jobs.title,
    jobs.description,
    jobs.job_type,
    jobs.experience_level,
    jobs.location_type,
    jobs.location_city,
    jobs.salary_min,
    jobs.salary_max,
    jobs.is_salary_visible,
    jobs.status,
    companies.name AS company_name
  FROM bookmarks
  JOIN jobs ON bookmarks.job_id = jobs.id
  JOIN companies ON jobs.company_id = companies.id
`;

exports.createBookmark = async (req, res, next) => {
  try {
    const jobId = req.params.jobId;
    const userId = req.user.id;

    const jobCheck = await pool.query("SELECT id FROM jobs WHERE id = $1", [
      jobId,
    ]);
    if (!jobCheck.rows.length)
      throw new NotFoundError("Pekerjaan tidak ditemukan");

    const id = crypto.randomUUID();
    const result = await pool.query(
      `INSERT INTO bookmarks (id, user_id, job_id)
       VALUES ($1, $2, $3) RETURNING id, user_id, job_id, created_at`,
      [id, userId, jobId],
    );

    await redisService.del(`bookmarks:user:${userId}`);

    return res.status(201).json({ status: "success", data: result.rows[0] });
  } catch (err) {
    return next(err);
  }
};

exports.getUserBookmarks = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cacheKey = `bookmarks:user:${userId}`;

    const cached = await redisService.get(cacheKey);
    if (cached) {
      return res
        .status(200)
        .set("X-Data-Source", "cache")
        .json({ status: "success", data: { bookmarks: cached } });
    }

    const result = await pool.query(
      `${bookmarkListSelect}
       WHERE bookmarks.user_id = $1
       ORDER BY bookmarks.created_at ASC`,
      [userId],
    );

    await redisService.set(cacheKey, result.rows);

    return res
      .status(200)
      .set("X-Data-Source", "database")
      .json({ status: "success", data: { bookmarks: result.rows } });
  } catch (err) {
    return next(err);
  }
};

exports.getBookmarkDetail = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, user_id, job_id, created_at
       FROM bookmarks WHERE id = $1 AND job_id = $2 AND user_id = $3`,
      [req.params.id, req.params.jobId, req.user.id],
    );
    if (!result.rows.length)
      throw new NotFoundError("Bookmark tidak ditemukan");
    return res.status(200).json({ status: "success", data: result.rows[0] });
  } catch (err) {
    return next(err);
  }
};

exports.deleteBookmark = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `DELETE FROM bookmarks
       WHERE job_id = $1 AND user_id = $2 RETURNING id`,
      [req.params.jobId, userId],
    );
    if (!result.rows.length)
      throw new NotFoundError("Bookmark tidak ditemukan");

    await redisService.del(`bookmarks:user:${userId}`);

    return res
      .status(200)
      .json({ status: "success", message: "Bookmark berhasil dihapus" });
  } catch (err) {
    return next(err);
  }
};
