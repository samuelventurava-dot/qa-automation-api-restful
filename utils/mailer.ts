import nodemailer from 'nodemailer';
import AdmZip from 'adm-zip';
import path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function sendReport() {
    console.log('Comprimiendo el reporte HTML...');
    const zip = new AdmZip();
    zip.addLocalFolder(path.resolve(__dirname, '../playwright-report'));
    const zipBuffer = zip.toBuffer();

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_RECEIVER,
        subject: 'Ejecución Exitosa - QA API Framework',
        text: 'Adjunto encontrarás el reporte detallado de la ejecución de las pruebas automatizadas de la API.',
        attachments: [
            {
                filename: 'playwright-api-report.zip',
                content: zipBuffer
            }
        ]
    };

    console.log('Enviando correo con el reporte adjunto...');
    await transporter.sendMail(mailOptions);
    console.log('Correo enviado exitosamente.');
}

sendReport().catch(console.error);