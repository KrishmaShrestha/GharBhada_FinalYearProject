const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1) Create a transporter
    // Note: In production, use your actual SMTP details
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
        port: process.env.EMAIL_PORT || 2525,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // 2) Define the email options
    const mailOptions = {
        from: `GharBhada Support <${process.env.EMAIL_FROM || 'support@gharbhada.com'}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html
    };

    // 3) Actually send the email
    try {
        await transporter.sendMail(mailOptions);
        console.log('📧 Password reset email sent successfully to:', options.email);
    } catch (error) {
        console.log('\n' + '='.repeat(60));
        console.log('🔴 GHARBHADA DEVELOPMENT: PASSWORD RESET LINK 🔴');
        console.log('='.repeat(60));
        const resetLink = options.message.match(/http[^\s]+/)[0];
        console.error('❌ Email failed to send (SMTP not configured).');
        console.log('\n👉 COPY THIS LINK INTO YOUR BROWSER:');
        console.log(`\x1b[36m%s\x1b[0m`, resetLink); // Cyan color
        console.log('\n' + '='.repeat(60) + '\n');

        // If in development mode, don't throw error to the frontend 
        if (process.env.NODE_ENV === 'development') {
            return;
        }
        throw error;
    }
};

module.exports = sendEmail;
