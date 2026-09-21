const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT),
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

const sendApplicationNotification = async ({
  to,
  applicantName,
  applicantEmail,
  applicationDate,
  jobTitle,
  companyName,
}) => {
  const mailOptions = {
    from: `"OpenJob Notification" <no-reply@openjob.com>`,
    to: to,
    subject: `Lamaran Baru untuk Posisi ${jobTitle}`,
    html: `
      <h2>Notifikasi Lamaran Baru</h2>
      <p>Anda menerima lamaran baru untuk posisi <strong>${jobTitle}</strong> di <strong>${companyName}</strong>.</p>
      
      <h3>Detail Pelamar:</h3>
      <ul>
        <li><strong>Nama:</strong> ${applicantName}</li>
        <li><strong>Email:</strong> ${applicantEmail}</li>
        <li><strong>Tanggal Lamaran:</strong> ${applicationDate}</li>
      </ul>
      
      <p>Silakan login ke OpenJob untuk melihat detail lamaran.</p>
      <br>
      <p>Salam,<br>OpenJob Team</p>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log("Email sent:", info.messageId);
  return info;
};

module.exports = { sendApplicationNotification };
