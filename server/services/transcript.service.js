const PDFDocument = require('pdfkit');
const { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } = require('docx');
const fs = require('fs');
const path = require('path');

/**
 * Generate PDF transcript
 * @param {Object} visitor { name, mobile, email }
 * @param {Array} chatHistory [{ role, content, timestamp }]
 * @returns {Promise<Buffer>}
 */
exports.generatePDF = (visitor, chatHistory) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));

    // Header
    doc.fontSize(20).text('Zhara AI - Conversation Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text('------------------------------------------------------------', { align: 'center' });
    doc.moveDown();

    // User Details
    doc.fontSize(14).text('User Details:', { underline: true });
    doc.fontSize(12).text(`Name: ${visitor.name}`);
    doc.text(`Mobile: ${visitor.mobile}`);
    doc.text(`Email: ${visitor.email}`);
    doc.text(`Date: ${new Date().toLocaleString()}`);
    doc.moveDown();
    doc.text('------------------------------------------------------------', { align: 'center' });
    doc.moveDown();

    // Chat History
    chatHistory.forEach((chat, index) => {
      const role = chat.role === 'user' ? 'User' : 'Zhara AI';
      doc.fontSize(12).fillColor(chat.role === 'user' ? '#2563eb' : '#475569').text(`${role}:`, { continued: true }).fillColor('black').text(` ${chat.timestamp || ''}`);
      doc.fontSize(11).text(chat.content);
      doc.moveDown(0.5);
    });

    doc.end();
  });
};

/**
 * Generate Word transcript
 * @param {Object} visitor { name, mobile, email }
 * @param {Array} chatHistory [{ role, content, timestamp }]
 * @returns {Promise<Buffer>}
 */
exports.generateWord = async (visitor, chatHistory) => {
  const children = [
    new Paragraph({
      text: "Zhara AI - Conversation Report",
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      text: "------------------------------------------------------------",
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
        children: [
            new TextRun({ text: "User Details:", bold: true, underline: true, size: 28 }),
        ],
    }),
    new Paragraph({ text: `Name: ${visitor.name}` }),
    new Paragraph({ text: `Mobile: ${visitor.mobile}` }),
    new Paragraph({ text: `Email: ${visitor.email}` }),
    new Paragraph({ text: `Date: ${new Date().toLocaleString()}` }),
    new Paragraph({
      text: "------------------------------------------------------------",
      alignment: AlignmentType.CENTER,
    }),
  ];

  chatHistory.forEach((chat) => {
    const role = chat.role === 'user' ? 'User' : 'Zhara AI';
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${role}: `, bold: true, color: chat.role === 'user' ? "2563EB" : "475569" }),
          new TextRun({ text: chat.timestamp || "", size: 16 }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: chat.content }),
        ],
        spacing: { after: 200 },
      })
    );
  });

  const doc = new Document({
    sections: [{
      properties: {},
      children: children,
    }],
  });

  return await Packer.toBuffer(doc);
};
