import nodemailer from 'nodemailer';

// E-posta gönderici yapılandırması
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// E-posta doğrulama e-postası gönderme
export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`;
  
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Email Adresinizi Doğrulayın',
    html: `
      <h1>Email Adresinizi Doğrulayın</h1>
      <p>Email adresinizi doğrulamak için aşağıdaki bağlantıya tıklayın:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
      <p>Bu bağlantı 24 saat geçerlidir.</p>
      <p>Eğer bu emaili siz talep etmediyseniz, lütfen dikkate almayın.</p>
    `,
  });
}

// Şifre sıfırlama e-postası gönderme
export async function sendResetPasswordEmail(email: string, resetUrl: string) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Şifre Sıfırlama Talebi',
    html: `
      <h1>Şifre Sıfırlama</h1>
      <p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>Bu bağlantı 24 saat geçerlidir.</p>
      <p>Eğer bu şifre sıfırlama talebini siz oluşturmadıysanız, lütfen bu e-postayı dikkate almayın.</p>
    `,
  });
} 