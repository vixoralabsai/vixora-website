import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';
import { Certificate } from '../src/data/academyPortalData.js';

/**
 * Generates a high-resolution, print-ready PDF certificate buffer for a given Certificate record.
 * Layout: Landscape A4 (841.89 pt x 595.28 pt)
 * Includes official Vixora Academy branding, Dean Sarumi Hammad signature,
 * cryptographic SHA-256 hash, competencies, capstone score, and verification URL.
 */
export async function generateCertificatePdfBuffer(cert: Certificate): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margins: { top: 28, bottom: 28, left: 32, right: 32 },
        info: {
          Title: `Vixora Academy Certificate - ${cert.studentName} (${cert.id})`,
          Author: 'Vixora Academy Global Directorate',
          Subject: `Conferral of Certification in ${cert.courseTitle}`,
          Keywords: 'Vixora Academy, Certification, AI, Cloud, Automation, Sarumi Hammad',
          Creator: 'Vixora Academy Automated Credential Dispatcher'
        }
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      const pageWidth = 841.89;
      const pageHeight = 595.28;

      // 1. Background fill
      doc.rect(0, 0, pageWidth, pageHeight).fill('#FCFCFF');

      // 2. Decorative Outer Border (Navy #000048)
      doc
        .rect(20, 20, pageWidth - 40, pageHeight - 40)
        .lineWidth(3)
        .stroke('#000048');

      // 3. Inner Decorative Border (Vixora Purple #7000F8)
      doc
        .rect(26, 26, pageWidth - 52, pageHeight - 52)
        .lineWidth(1)
        .stroke('#7000F8');

      // Thin accent border
      doc
        .rect(29, 29, pageWidth - 58, pageHeight - 58)
        .lineWidth(0.5)
        .stroke('#E5E5F0');

      // Corner ornamental corner blocks
      const cornerSize = 14;
      // Top-left
      doc.rect(20, 20, cornerSize, cornerSize).fill('#000048');
      doc.rect(23, 23, cornerSize - 6, cornerSize - 6).fill('#7000F8');
      // Top-right
      doc.rect(pageWidth - 20 - cornerSize, 20, cornerSize, cornerSize).fill('#000048');
      doc.rect(pageWidth - 20 - cornerSize + 3, 23, cornerSize - 6, cornerSize - 6).fill('#7000F8');
      // Bottom-left
      doc.rect(20, pageHeight - 20 - cornerSize, cornerSize, cornerSize).fill('#000048');
      doc.rect(23, pageHeight - 20 - cornerSize + 3, cornerSize - 6, cornerSize - 6).fill('#7000F8');
      // Bottom-right
      doc.rect(pageWidth - 20 - cornerSize, pageHeight - 20 - cornerSize, cornerSize, cornerSize).fill('#000048');
      doc.rect(pageWidth - 20 - cornerSize + 3, pageHeight - 20 - cornerSize + 3, cornerSize - 6, cornerSize - 6).fill('#7000F8');

      // 4. Logo / Top Crest
      const logoPathJpg = path.join(process.cwd(), 'public', 'images', 'vixora-academy-logo.jpg');
      const logoPathPng = path.join(process.cwd(), 'public', 'images', 'vixora-academy-logo.png');
      const resolvedLogo = fs.existsSync(logoPathJpg)
        ? logoPathJpg
        : fs.existsSync(logoPathPng)
        ? logoPathPng
        : null;

      let topY = 40;
      if (resolvedLogo) {
        try {
          doc.image(resolvedLogo, (pageWidth - 140) / 2, topY, { width: 140 });
          topY += 48;
        } catch (imgErr) {
          topY += 10;
        }
      } else {
        topY += 10;
      }

      // 5. Header Titles
      doc
        .font('Helvetica-Bold')
        .fontSize(20)
        .fillColor('#000048')
        .text('VIXORA ACADEMY', 40, topY, { align: 'center', characterSpacing: 2 });

      doc
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .fillColor('#7000F8')
        .text('LEARN. APPLY. EARN. • GLOBAL CREDENTIAL DIRECTORY', 40, topY + 24, {
          align: 'center',
          characterSpacing: 1.5
        });

      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor('#5F6078')
        .text('academy.vixoradigitalhub.com • Official Academic Directorate', 40, topY + 36, {
          align: 'center'
        });

      // 6. Presentation Statement
      const statementY = topY + 54;
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor('#5F6078')
        .text('THIS IS TO OFFICIALLY CERTIFY THAT', 40, statementY, {
          align: 'center',
          characterSpacing: 2
        });

      // 7. Student Name
      const nameY = statementY + 16;
      doc
        .font('Helvetica-Bold')
        .fontSize(26)
        .fillColor('#000048')
        .text(cert.studentName, 40, nameY, { align: 'center' });

      // Subtle underline beneath student name
      const textWidth = doc.widthOfString(cert.studentName);
      const lineStartX = Math.max(120, (pageWidth - textWidth) / 2 - 20);
      const lineEndX = Math.min(pageWidth - 120, (pageWidth + textWidth) / 2 + 20);
      doc
        .moveTo(lineStartX, nameY + 32)
        .lineTo(lineEndX, nameY + 32)
        .lineWidth(1.5)
        .stroke('#7000F8');

      // 8. Fulfillments narrative
      const narrY = nameY + 40;
      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#480878')
        .text(
          'has demonstrated executive excellence, fulfilling all prescribed rigorous curriculum standards, examinations, and the production capstone for conferral of the professional credential in:',
          80,
          narrY,
          { align: 'center', width: pageWidth - 160 }
        );

      // 9. Course Title & Specialization
      const courseY = narrY + 26;
      doc
        .font('Helvetica-Bold')
        .fontSize(18)
        .fillColor('#000048')
        .text(cert.courseTitle, 60, courseY, { align: 'center' });

      doc
        .font('Helvetica-Oblique')
        .fontSize(11)
        .fillColor('#480878')
        .text(`Specialization: ${cert.specialization}`, 60, courseY + 22, { align: 'center' });

      // Badge & Honors Ribbon
      const honorsY = courseY + 38;
      const honorsText = `Grade: ${cert.grade}  |  Honors: ${cert.honors || 'Distinction'}  |  Track: ${cert.trackBadge}`;
      doc
        .font('Helvetica-Bold')
        .fontSize(9)
        .fillColor('#7000F8')
        .text(honorsText, 60, honorsY, { align: 'center' });

      // 10. Capstone Defense
      const capstoneY = honorsY + 16;
      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor('#5F6078')
        .text(
          `Production Capstone Defense: "${cert.capstoneTitle}" (Score: ${cert.capstoneScore})`,
          80,
          capstoneY,
          { align: 'center', width: pageWidth - 160 }
        );

      // 11. Signatures & Official Seal (Bottom Section)
      const sigY = 460;

      // Instructor Signature (Left)
      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor('#000048')
        .text(cert.instructorName, 70, sigY + 14, { width: 220, align: 'center' });
      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor('#5F6078')
        .text(cert.instructorTitle, 70, sigY + 28, { width: 220, align: 'center' });
      // Line above instructor
      doc
        .moveTo(85, sigY + 8)
        .lineTo(275, sigY + 8)
        .lineWidth(1)
        .stroke('#7000F8');

      // Center Official Seal & Credential ID
      const sealCenterX = pageWidth / 2;
      // Draw circular seal
      doc
        .circle(sealCenterX, sigY + 16, 32)
        .lineWidth(2)
        .stroke('#480878');
      doc
        .circle(sealCenterX, sigY + 16, 29)
        .lineWidth(0.75)
        .stroke('#7000F8');

      doc
        .font('Helvetica-Bold')
        .fontSize(7)
        .fillColor('#480878')
        .text('VIXORA ACADEMY', sealCenterX - 35, sigY + 2, { width: 70, align: 'center' });
      doc
        .font('Helvetica-Bold')
        .fontSize(8)
        .fillColor('#000048')
        .text('OFFICIAL SEAL', sealCenterX - 35, sigY + 11, { width: 70, align: 'center' });
      doc
        .font('Helvetica')
        .fontSize(6)
        .fillColor('#7000F8')
        .text('VERIFIED 2026', sealCenterX - 35, sigY + 21, { width: 70, align: 'center' });

      // ID & Issue Date directly below seal
      doc
        .font('Helvetica-Bold')
        .fontSize(8)
        .fillColor('#000048')
        .text(`ID: ${cert.id}`, sealCenterX - 75, sigY + 52, { width: 150, align: 'center' });
      doc
        .font('Helvetica')
        .fontSize(7.5)
        .fillColor('#5F6078')
        .text(`Issued: ${cert.issueDate}`, sealCenterX - 75, sigY + 62, { width: 150, align: 'center' });

      // Dean Signature (Right) - Sarumi Hammad
      const deanX = pageWidth - 290;
      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor('#000048')
        .text(cert.directorName || 'Sarumi Hammad', deanX, sigY + 14, { width: 220, align: 'center' });
      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor('#5F6078')
        .text(cert.directorTitle || 'Dean, Vixora Academy', deanX, sigY + 28, { width: 220, align: 'center' });
      // Line above Dean
      doc
        .moveTo(deanX + 15, sigY + 8)
        .lineTo(deanX + 205, sigY + 8)
        .lineWidth(1)
        .stroke('#7000F8');

      // 12. Tamper-Proof Cryptographic Footnote & QR/Verification Info
      const footY = pageHeight - 44;
      doc
        .font('Helvetica')
        .fontSize(7)
        .fillColor('#5F6078')
        .text(
          `Tamper-Proof Verification URL: ${cert.verificationUrl}  •  SHA-256 Ledger: ${cert.credentialHash}`,
          40,
          footY,
          { align: 'center', width: pageWidth - 80 }
        );

      doc
        .font('Helvetica-Bold')
        .fontSize(6.5)
        .fillColor('#7000F8')
        .text(
          'CRYPTOGRAPHICALLY CONFERRED BY VIXORA ACADEMY GLOBAL DIRECTORATE • ALL RIGHTS RESERVED',
          40,
          footY + 10,
          { align: 'center', characterSpacing: 1 }
        );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
