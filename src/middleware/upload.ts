import fs from "node:fs";
import path from "node:path";
import multer from "multer";

const uploadDir = path.join(process.cwd(), "uploads", "cv");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

export const uploadCv = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      cb(new Error("Le CV doit être un fichier PDF."));
      return;
    }
    cb(null, true);
  },
});

const documentDir = path.join(process.cwd(), "uploads", "documents");
fs.mkdirSync(documentDir, { recursive: true });

const documentStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, documentDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const ALLOWED_DOCUMENT_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"];

export const uploadDocument = multer({
  storage: documentStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_DOCUMENT_MIME_TYPES.includes(file.mimetype)) {
      cb(new Error("Le document doit être un fichier PDF, JPG ou PNG."));
      return;
    }
    cb(null, true);
  },
});

const offerDocumentDir = path.join(process.cwd(), "uploads", "offers");
fs.mkdirSync(offerDocumentDir, { recursive: true });

const offerDocumentStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, offerDocumentDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

export const uploadOfferDocument = multer({
  storage: offerDocumentStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      cb(new Error("Le document de l'offre doit être un fichier PDF."));
      return;
    }
    cb(null, true);
  },
});

const posterDir = path.join(process.cwd(), "uploads", "posters");
fs.mkdirSync(posterDir, { recursive: true });

const posterStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, posterDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const ALLOWED_POSTER_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"];

export const uploadPoster = multer({
  storage: posterStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_POSTER_MIME_TYPES.includes(file.mimetype)) {
      cb(new Error("L'affiche doit être un fichier JPG, PNG ou PDF."));
      return;
    }
    cb(null, true);
  },
});
