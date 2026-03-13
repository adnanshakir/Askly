import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.GOOGLE_USER,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    clientId: process.env.GOOGLE_CLIENT_ID,
  },
});

transporter.verify()
  .then(() => {
    console.log("Email transporter is ready to send emails");
  })
  .catch((err) => {
    console.log(err);
  });


export async function sendEmail({to, subject, html, text}) {
    const mailOptions = {
        from: process.env.GOOGLE_USER,
        to,
        subject,
        html,
        text
    }

    const details = await transporter.sendMail(mailOptions)

    console.log(details)
}