const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const QRCode = require('qrcode');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const GENERATED_DIR = path.join(__dirname, '..', 'generated');

// Ensure generated directory exists
if (!fs.existsSync(GENERATED_DIR)) {
  fs.mkdirSync(GENERATED_DIR, { recursive: true });
}

/**
 * Generate a unique certificate ID
 */
function generateCertificateId() {
  const prefix = 'CERT';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Calculate SHA-256 hash of certificate data
 */
function calculateHash(data) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(data))
    .digest('hex');
}

/**
 * Generate a QR code as a PNG buffer
 */
async function generateQRCode(data) {
  return QRCode.toBuffer(data, {
    width: 120,
    margin: 1,
    color: { dark: '#1a365d', light: '#ffffff' }
  });
}

/**
 * Generate a professional PDF certificate
 */
async function generateCertificatePDF({ certificateId, participantName, eventTitle, eventDate, organizer }) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]); // A4 Landscape
  const { width, height } = page.getSize();

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // ── Background ──
  page.drawRectangle({
    x: 0, y: 0, width, height,
    color: rgb(0.98, 0.98, 1)
  });

  // ── Blue header bar ──
  page.drawRectangle({
    x: 0, y: height - 80, width, height: 80,
    color: rgb(0.102, 0.212, 0.365)
  });

  // ── Gold accent line ──
  page.drawRectangle({
    x: 0, y: height - 84, width, height: 4,
    color: rgb(0.855, 0.647, 0.125)
  });

  // ── Border frame ──
  page.drawRectangle({
    x: 20, y: 20, width: width - 40, height: height - 40,
    borderColor: rgb(0.102, 0.212, 0.365),
    borderWidth: 2,
    color: rgb(1, 1, 1),
    opacity: 0
  });

  // ── Inner border ──
  page.drawRectangle({
    x: 28, y: 28, width: width - 56, height: height - 56,
    borderColor: rgb(0.855, 0.647, 0.125),
    borderWidth: 1,
    color: rgb(1, 1, 1),
    opacity: 0
  });

  // ── Header text ──
  const headerText = 'CERTIFICATE OF ACHIEVEMENT';
  const headerWidth = fontBold.widthOfTextAtSize(headerText, 18);
  page.drawText(headerText, {
    x: (width - headerWidth) / 2,
    y: height - 55,
    size: 18,
    font: fontBold,
    color: rgb(1, 1, 1)
  });

  // ── "This is to certify that" ──
  const certifyText = 'This is to certify that';
  const certifyWidth = fontItalic.widthOfTextAtSize(certifyText, 14);
  page.drawText(certifyText, {
    x: (width - certifyWidth) / 2,
    y: height - 160,
    size: 14,
    font: fontItalic,
    color: rgb(0.4, 0.4, 0.4)
  });

  // ── Participant Name ──
  const nameSize = participantName.length > 25 ? 28 : 36;
  const nameWidth = fontBold.widthOfTextAtSize(participantName, nameSize);
  page.drawText(participantName, {
    x: (width - nameWidth) / 2,
    y: height - 210,
    size: nameSize,
    font: fontBold,
    color: rgb(0.102, 0.212, 0.365)
  });

  // ── Gold underline for name ──
  page.drawRectangle({
    x: (width - nameWidth) / 2 - 20,
    y: height - 218,
    width: nameWidth + 40,
    height: 2,
    color: rgb(0.855, 0.647, 0.125)
  });

  // ── "has successfully participated in" ──
  const partText = 'has successfully participated in';
  const partWidth = fontRegular.widthOfTextAtSize(partText, 13);
  page.drawText(partText, {
    x: (width - partWidth) / 2,
    y: height - 260,
    size: 13,
    font: fontRegular,
    color: rgb(0.4, 0.4, 0.4)
  });

  // ── Event Title ──
  const eventSize = eventTitle.length > 30 ? 20 : 24;
  const eventWidth = fontBold.widthOfTextAtSize(eventTitle, eventSize);
  page.drawText(eventTitle, {
    x: (width - eventWidth) / 2,
    y: height - 300,
    size: eventSize,
    font: fontBold,
    color: rgb(0.2, 0.2, 0.2)
  });

  // ── Date ──
  const dateStr = `Date: ${new Date(eventDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`;
  const dateWidth = fontRegular.widthOfTextAtSize(dateStr, 12);
  page.drawText(dateStr, {
    x: (width - dateWidth) / 2,
    y: height - 340,
    size: 12,
    font: fontRegular,
    color: rgb(0.35, 0.35, 0.35)
  });

  // ── Organizer ──
  const orgText = `Organized by: ${organizer}`;
  const orgWidth = fontRegular.widthOfTextAtSize(orgText, 12);
  page.drawText(orgText, {
    x: (width - orgWidth) / 2,
    y: height - 362,
    size: 12,
    font: fontRegular,
    color: rgb(0.35, 0.35, 0.35)
  });

  // ── Certificate ID ──
  const idText = `Certificate ID: ${certificateId}`;
  const idWidth = fontRegular.widthOfTextAtSize(idText, 9);
  page.drawText(idText, {
    x: (width - idWidth) / 2,
    y: 60,
    size: 9,
    font: fontRegular,
    color: rgb(0.5, 0.5, 0.5)
  });

  // ── Blockchain verified badge ──
  const badgeText = '* Blockchain Verified';
  const badgeWidth = fontBold.widthOfTextAtSize(badgeText, 9);
  page.drawText(badgeText, {
    x: (width - badgeWidth) / 2,
    y: 44,
    size: 9,
    font: fontBold,
    color: rgb(0.102, 0.212, 0.365)
  });

  // ── QR Code ──
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify?id=${certificateId}`;
  const qrBuffer = await generateQRCode(verificationUrl);
  const qrImage = await pdfDoc.embedPng(qrBuffer);
  page.drawImage(qrImage, {
    x: width - 150,
    y: 40,
    width: 90,
    height: 90
  });

  // ── QR label ──
  page.drawText('Scan to verify', {
    x: width - 146,
    y: 32,
    size: 8,
    font: fontRegular,
    color: rgb(0.5, 0.5, 0.5)
  });

  // ── Bottom gold bar ──
  page.drawRectangle({
    x: 0, y: 0, width, height: 6,
    color: rgb(0.855, 0.647, 0.125)
  });

  // Save PDF
  const pdfBytes = await pdfDoc.save();
  const fileName = `${certificateId}.pdf`;
  const filePath = path.join(GENERATED_DIR, fileName);
  fs.writeFileSync(filePath, pdfBytes);

  return { filePath, fileName, pdfBytes };
}

module.exports = {
  generateCertificateId,
  calculateHash,
  generateCertificatePDF,
  generateQRCode
};
