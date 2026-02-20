const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendAlertEmail = async (to, cropName) => {
  try {
    await transporter.sendMail({
      from: `"AgroVision" <${process.env.EMAIL_USER}>`,
      to,
      subject: "🚨 Alerta Crítica en tu Cultivo",
      html: `
        <h2>Alerta Detectada</h2>
        <p>Se detectó un estado crítico en el cultivo:</p>
        <strong>${cropName}</strong>
        <p>Revisa tu panel de AgroVision para más detalles.</p>
      `,
    });

    console.log("📧 Email enviado correctamente");
  } catch (error) {
    console.error("Error enviando email:", error);
  }
};
