import { SendEmailOptions } from '../utils/types.mjs'
import { transporter } from './transporter.mts';

export const sendEmail = async (options: SendEmailOptions): Promise<boolean> => {
  try {
    const info = await transporter.sendMail({
      from: `"Mi Servicio" <${process.env.EMAIL_USER}>`,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    console.log('✅ Correo enviado con éxito. ID:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error al enviar el correo:', error);
    return false;
  }
};