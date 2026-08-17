const fs = require("fs");
const { PDFParse } = require("pdf-parse");
const mammoth = require("mammoth");

const extractResumeText = async (filePath, fileType) => {
  try {
    // ==============================
    // PDF
    // ==============================
    if (fileType === "application/pdf") {
      const dataBuffer = fs.readFileSync(filePath);

      const parser = new PDFParse({
        data: dataBuffer,
      });

      const result = await parser.getText();

      await parser.destroy();

      return result.text.trim();
    }

    // ==============================
    // DOCX
    // ==============================
    if (
      fileType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({
        path: filePath,
      });

      return result.value.trim();
    }

    throw new Error("Unsupported resume file type");
  } catch (error) {
    console.error("Resume text extraction error:", error);
    throw error;
  }
};

module.exports = extractResumeText;