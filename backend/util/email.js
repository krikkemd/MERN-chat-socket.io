const nodemailer = require('nodemailer');

const sendEmail = async options => {
  // 1) create transporter
  const transport = nodemailer.createTransport({
    // Remove host and port to use gmail, also enable less secure app in gmail.
    // service: 'gmail',
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    // secure: false,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false,
    },
  });

  // 2) define email options
  const mailOptions = {
    from: 'ICT Helpdesk DNK<helpdesk@dnk.nl>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    //   html:
  };
  // 3) actually send the email
  await transport.sendMail(mailOptions);
};

module.exports = sendEmail;
