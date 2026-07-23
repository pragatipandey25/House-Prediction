import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, '..', 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `resume-${uniqueSuffix}${ext}`);
  }
});

/**
 * Magic bytes for file validation:
 * PDF: %PDF (25 50 44 46)
 * DOCX: PK (50 4B) — ZIP-based format
 */
const MAGIC_BYTES = {
  pdf: [0x25, 0x50, 0x44, 0x46], // %PDF
  docx: [0x50, 0x4B, 0x03, 0x04], // PK\x03\x04
};

const validateMagicBytes = (buffer) => {
  if (!buffer || buffer.length < 4) return false;

  const header = Array.from(buffer.slice(0, 4));

  // Check PDF
  if (header.every((byte, i) => byte === MAGIC_BYTES.pdf[i])) {
    return 'pdf';
  }

  // Check DOCX (ZIP format)
  if (header.every((byte, i) => byte === MAGIC_BYTES.docx[i])) {
    return 'docx';
  }

  return null;
};

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error('Only PDF and DOCX files are allowed'), false);
  }

  // File extension check
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== '.pdf' && ext !== '.docx') {
    return cb(new Error('Invalid file extension. Only .pdf and .docx are allowed'), false);
  }

  cb(null, true);
};

// Post-upload magic byte validation
const validateFileIntegrity = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const filePath = req.file.path;
  try {
    const buffer = fs.readFileSync(filePath);
    const detectedType = validateMagicBytes(buffer);

    if (!detectedType) {
      // Remove invalid file
      fs.unlinkSync(filePath);
      return res.status(400).json({
        message: 'Invalid file: The uploaded file does not appear to be a valid PDF or DOCX document.',
      });
    }

    // Verify extension matches actual content
    const ext = path.extname(req.file.originalname).toLowerCase().replace('.', '');
    if (detectedType !== ext) {
      fs.unlinkSync(filePath);
      return res.status(400).json({
        message: `File type mismatch: The file appears to be a ${detectedType.toUpperCase()} but has a .${ext} extension.`,
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to validate file integrity.',
    });
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB — consistent with documentation
  },
});

export { upload, validateFileIntegrity };
export default upload;

