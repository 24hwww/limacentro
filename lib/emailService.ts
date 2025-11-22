import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const emailService = {
    async sendEmail(to: string, subject: string, html: string) {
        try {
            const info = await transporter.sendMail({
                from: `"LimaCentro" <${process.env.SMTP_USER}>`, // sender address
                to, // list of receivers
                subject, // Subject line
                html, // html body
            });

            console.log("Message sent: %s", info.messageId);
            return info;
        } catch (error) {
            console.error("Error sending email:", error);
            // Don't throw error to prevent blocking the main flow, but log it
        }
    },

    async notifyAdminNewBusiness(businessName: string) {
        const adminEmail = process.env.ADMIN_EMAIL;
        if (!adminEmail) return;

        await this.sendEmail(
            adminEmail,
            'Nuevo Negocio Pendiente de Aprobación',
            `<p>El negocio <strong>${businessName}</strong> se ha registrado y espera aprobación.</p>
       <p><a href="${process.env.NEXTAUTH_URL}/admin">Ir al Panel de Administración</a></p>`
        );
    },

    async notifyUserBusinessApproved(userEmail: string, businessName: string) {
        await this.sendEmail(
            userEmail,
            'Tu negocio ha sido aprobado',
            `<p>¡Felicidades! Tu negocio <strong>${businessName}</strong> ha sido aprobado y ya es visible en LimaCentro.</p>
       <p><a href="${process.env.NEXTAUTH_URL}">Ver en LimaCentro</a></p>`
        );
    }
};
