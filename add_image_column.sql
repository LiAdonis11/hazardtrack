-- Add image column to hazard_reports table
ALTER TABLE hazard_reports
ADD COLUMN image_path VARCHAR(500) NULL AFTER description,
ADD COLUMN image_name VARCHAR(255) NULL AFTER image_path,
ADD COLUMN image_size INT NULL AFTER image_name,
ADD COLUMN image_mime_type VARCHAR(100) NULL AFTER image_size;

-- Optional: Add index for better performance when querying images
ALTER TABLE hazard_reports
ADD INDEX idx_image_path (image_path);

-- Update existing records to copy image data from reports table (if needed)
-- This query copies photo_path from reports table to hazard_reports table
UPDATE hazard_reports hr
LEFT JOIN reports r ON hr.id = r.id
SET hr.image_path = r.photo_path
WHERE hr.image_path IS NULL AND r.photo_path IS NOT NULL;

-- Alternative: If you want to copy from report_attachments table instead
-- UPDATE hazard_reports hr
-- LEFT JOIN report_attachments ra ON hr.id = ra.report_id AND ra.is_primary = 1
-- SET hr.image_path = ra.file_path,
--     hr.image_name = ra.file_name,
--     hr.image_size = ra.file_size,
--     hr.image_mime_type = ra.mime_type
-- WHERE hr.image_path IS NULL AND ra.file_path IS NOT NULL;
