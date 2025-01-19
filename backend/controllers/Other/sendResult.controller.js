const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');

const sendResultEmail = async (req, res) => {
    const { studentDetails, marks } = req.body;

    // Validate input
    if (
        !studentDetails ||
        typeof studentDetails !== "object" ||
        !marks ||
        typeof marks !== "object" ||
        Object.keys(studentDetails).length === 0 ||
        Object.keys(marks).length === 0
    ) {
        return res.status(400).json({ success: false, message: "Invalid or incomplete data provided." });
    }

    try {
        // Generate PDF
        const pdfPath = path.join(__dirname, `../../media/result_${studentDetails.enrollmentNo}.pdf`);
        const pdfDoc = new PDFDocument();
        pdfDoc.pipe(fs.createWriteStream(pdfPath));

        pdfDoc.fontSize(20).text("Student Result", { align: "center" });
        pdfDoc.text("\n");
        pdfDoc.fontSize(14).text(`Name: ${studentDetails.firstName} ${studentDetails.middleName} ${studentDetails.lastName}`);
        pdfDoc.text(`Enrollment No: ${studentDetails.enrollmentNo}`);
        pdfDoc.text(`Branch: ${studentDetails.branch}`);
        pdfDoc.text(`Semester: ${studentDetails.semester}`);
        pdfDoc.text("\nInternal Marks:");
        Object.entries(marks.internal || {}).forEach(([subject, mark]) => {
            pdfDoc.text(`${subject}: ${mark}`);
        });
        pdfDoc.text("\nExternal Marks:");
        Object.entries(marks.external || {}).forEach(([subject, mark]) => {
            pdfDoc.text(`${subject}: ${mark}`);
        });

        pdfDoc.end();

        // Configure Nodemailer
        const transporter = nodemailer.createTransport({
            service: "gmail",
            port: 465,
            secure: true,
            logger: true,
            debug: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: true
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: studentDetails.parentEmail || studentDetails.email,
            subject: "Student Result",
            text: "Please find attached the result of the student.",
            attachments: [
                {
                    filename: `result_${studentDetails.enrollmentNo}.pdf`,
                    path: pdfPath,
                },
            ],
        };

        // Send Email
        await transporter.sendMail(mailOptions);

        // Delete the PDF after sending
        fs.unlinkSync(pdfPath);

        res.json({ success: true, message: "Result email sent successfully." });
    } catch (error) {
        console.error("Error in sendResultEmail:", error.message);
        res.status(500).json({ success: false, message: "Error sending result email." });
    }
};

module.exports = { sendResultEmail }