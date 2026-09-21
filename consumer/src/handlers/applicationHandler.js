const pool = require("../config/database");
const { sendApplicationNotification } = require("../services/mailService");

const handleApplicationMessage = async (message) => {
  try {
    const { application_id } = message;
    console.log("Processing application:", application_id);

    const query = `
      SELECT
        applications.id AS application_id,
        applications.created_at AS application_date,
        applicant.id AS applicant_id,
        applicant.name AS applicant_name,
        applicant.email AS applicant_email,
        jobs.id AS job_id,
        jobs.title AS job_title,
        companies.id AS company_id,
        companies.name AS company_name,
        owner.id AS owner_id,
        owner.name AS owner_name,
        owner.email AS owner_email
      FROM applications
      JOIN users AS applicant ON applications.user_id = applicant.id
      JOIN jobs ON applications.job_id = jobs.id
      JOIN companies ON jobs.company_id = companies.id
      JOIN users AS owner ON companies.user_id = owner.id
      WHERE applications.id = $1
    `;

    const result = await pool.query(query, [application_id]);

    if (!result.rows.length) {
      console.error(`Application ${application_id} not found or has no owner`);
      return;
    }

    const data = result.rows[0];

    const applicationDate = new Date(data.application_date).toLocaleDateString(
      "id-ID",
      { day: "numeric", month: "long", year: "numeric" },
    );

    await sendApplicationNotification({
      to: data.owner_email,
      applicantName: data.applicant_name,
      applicantEmail: data.applicant_email,
      applicationDate: applicationDate,
      jobTitle: data.job_title,
      companyName: data.company_name,
    });

    console.log(`Email sent to owner: ${data.owner_email}`);
  } catch (err) {
    console.error("Error handling application message:", err);
    throw err;
  }
};

module.exports = { handleApplicationMessage };
