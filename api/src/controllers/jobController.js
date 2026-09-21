const crypto = require("crypto");
const pool = require("../config/database");
const NotFoundError = require("../exceptions/NotFoundError");

const jobSelect = `
  SELECT
    jobs.id,
    jobs.company_id,
    jobs.category_id,
    jobs.title,
    jobs.description,
    jobs.job_type,
    jobs.location_city,
    jobs.salary_min,
    jobs.salary_max,
    jobs.status,
    jobs.created_at,
    companies.name AS company_name,
    categories.name AS category_name
  FROM jobs
  JOIN companies ON jobs.company_id = companies.id
  JOIN categories ON jobs.category_id = categories.id
`;

exports.createJob = async (req, res, next) => {
  try {
    const {
      company_id: companyId,
      category_id: categoryId,
      title,
      description,
      job_type: jobType = null,
      experience_level: experienceLevel = null,
      location_type: locationType = null,
      location_city: locationCity = null,
      salary_min: salaryMin = null,
      salary_max: salaryMax = null,
      is_salary_visible: isSalaryVisible = true,
      status = "open",
    } = req.body;

    const companyCheck = await pool.query(
      "SELECT id FROM companies WHERE id = $1",
      [companyId],
    );
    if (!companyCheck.rows.length) {
      throw new NotFoundError("Perusahaan tidak ditemukan");
    }

    const categoryCheck = await pool.query(
      "SELECT id FROM categories WHERE id = $1",
      [categoryId],
    );
    if (!categoryCheck.rows.length) {
      throw new NotFoundError("Kategori tidak ditemukan");
    }

    const id = crypto.randomUUID();
    const result = await pool.query(
      `INSERT INTO jobs
       (id, company_id, category_id, title, description, job_type,
        experience_level, location_type, location_city, salary_min,
        salary_max, is_salary_visible, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING id`,
      [
        id,
        companyId,
        categoryId,
        title,
        description,
        jobType,
        experienceLevel,
        locationType,
        locationCity,
        salaryMin,
        salaryMax,
        isSalaryVisible,
        status,
      ],
    );

    return res
      .status(201)
      .json({ status: "success", data: { id: result.rows[0].id } });
  } catch (err) {
    return next(err);
  }
};

exports.getJobs = async (req, res, next) => {
  try {
    const { title, "company-name": companyName } = req.query;
    let query = jobSelect;
    const conditions = [];
    const values = [];

    if (title && title.trim() !== "") {
      values.push(`%${title}%`);
      conditions.push(`jobs.title ILIKE $${values.length}`);
    }
    if (companyName && companyName.trim() !== "") {
      values.push(`%${companyName}%`);
      conditions.push(`companies.name ILIKE $${values.length}`);
    }
    if (conditions.length) query += ` WHERE ${conditions.join(" AND ")}`;
    query += " ORDER BY jobs.created_at ASC";

    const result = await pool.query(query, values);
    return res
      .status(200)
      .json({ status: "success", data: { jobs: result.rows } });
  } catch (err) {
    return next(err);
  }
};

exports.getJobById = async (req, res, next) => {
  try {
    const result = await pool.query(`${jobSelect} WHERE jobs.id = $1`, [
      req.params.id,
    ]);
    if (!result.rows.length) {
      throw new NotFoundError("Pekerjaan tidak ditemukan");
    }
    return res.status(200).json({ status: "success", data: result.rows[0] });
  } catch (err) {
    return next(err);
  }
};

exports.getJobsByCompany = async (req, res, next) => {
  try {
    const result = await pool.query(
      `${jobSelect} WHERE jobs.company_id = $1 ORDER BY jobs.created_at ASC`,
      [req.params.companyId],
    );
    return res
      .status(200)
      .json({ status: "success", data: { jobs: result.rows } });
  } catch (err) {
    return next(err);
  }
};

exports.getJobsByCategory = async (req, res, next) => {
  try {
    const result = await pool.query(
      `${jobSelect} WHERE jobs.category_id = $1 ORDER BY jobs.created_at ASC`,
      [req.params.categoryId],
    );
    return res
      .status(200)
      .json({ status: "success", data: { jobs: result.rows } });
  } catch (err) {
    return next(err);
  }
};

exports.updateJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    const jobCheck = await pool.query("SELECT id FROM jobs WHERE id = $1", [
      id,
    ]);
    if (!jobCheck.rows.length) {
      throw new NotFoundError("Pekerjaan tidak ditemukan");
    }

    if (req.body.company_id !== undefined) {
      const companyCheck = await pool.query(
        "SELECT id FROM companies WHERE id = $1",
        [req.body.company_id],
      );
      if (!companyCheck.rows.length) {
        throw new NotFoundError("Perusahaan tidak ditemukan");
      }
    }

    if (req.body.category_id !== undefined) {
      const categoryCheck = await pool.query(
        "SELECT id FROM categories WHERE id = $1",
        [req.body.category_id],
      );
      if (!categoryCheck.rows.length) {
        throw new NotFoundError("Kategori tidak ditemukan");
      }
    }

    const allowedFields = [
      "company_id",
      "category_id",
      "title",
      "description",
      "job_type",
      "experience_level",
      "location_type",
      "location_city",
      "salary_min",
      "salary_max",
      "is_salary_visible",
      "status",
    ];

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
    const query = `UPDATE jobs SET ${updates.join(
      ", ",
    )} WHERE id = $${values.length} RETURNING id`;
    await pool.query(query, values);

    return res.status(200).json({
      status: "success",
      message: "Pekerjaan berhasil diperbarui",
    });
  } catch (err) {
    return next(err);
  }
};

exports.deleteJob = async (req, res, next) => {
  try {
    const result = await pool.query(
      "DELETE FROM jobs WHERE id = $1 RETURNING id",
      [req.params.id],
    );
    if (!result.rows.length) {
      throw new NotFoundError("Pekerjaan tidak ditemukan");
    }
    return res
      .status(200)
      .json({ status: "success", message: "Pekerjaan berhasil dihapus" });
  } catch (err) {
    return next(err);
  }
};
