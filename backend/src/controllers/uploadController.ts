import { Request, Response } from 'express';
import { UploadedFile } from 'express-fileupload';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads/resumes';

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const uploadResume = async (req: Request, res: Response) => {
  try {
    if (!req.files || !req.files.resume) {
      return res.status(400).json({
        success: false,
        error: { message: 'No resume file uploaded' },
      });
    }

    const resumeFile = req.files.resume as UploadedFile;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(resumeFile.mimetype)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid file type. Only PDF and DOC/DOCX are allowed' },
      });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (resumeFile.size > maxSize) {
      return res.status(400).json({
        success: false,
        error: { message: 'File size exceeds 5MB limit' },
      });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(resumeFile.name);
    const filename = `resume_${timestamp}_${randomString}${extension}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    // Save file
    await resumeFile.mv(filepath);

    // Return file URL
    const fileUrl = `/uploads/resumes/${filename}`;

    res.json({
      success: true,
      data: {
        filename,
        url: fileUrl,
        size: resumeFile.size,
        mimeType: resumeFile.mimetype,
      },
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to upload resume' },
    });
  }
};

export const deleteResume = async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;

    const filepath = path.join(UPLOAD_DIR, filename);

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({
        success: false,
        error: { message: 'File not found' },
      });
    }

    fs.unlinkSync(filepath);

    res.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Resume delete error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to delete resume' },
    });
  }
};

