-- SQL Script to clean up unnecessary image columns in hazard_reports table
-- This script removes image_name, image_size, and image_mime_type columns
-- keeping only the image_path column

USE hazardtrack_dbv2;

-- Remove unnecessary image columns
ALTER TABLE hazard_reports
DROP COLUMN image_name,
DROP COLUMN image_size,
DROP COLUMN image_mime_type;

-- Optional: Update any existing records that might have NULL image_path but have attachments
-- This query will show reports that have attachments but no image_path
SELECT hr.id, hr.report_number, hr.title, ra.file_path
FROM hazard_reports hr
LEFT JOIN report_attachments ra ON hr.id = ra.report_id
WHERE (hr.image_path IS NULL OR hr.image_path = '')
AND ra.file_path IS NOT NULL;

-- If you want to populate image_path from the first attachment for reports that don't have one:
UPDATE hazard_reports hr
JOIN (
    SELECT report_id, MIN(file_path) as first_attachment
    FROM report_attachments
    GROUP BY report_id
) ra ON hr.id = ra.report_id
SET hr.image_path = ra.first_attachment
WHERE hr.image_path IS NULL OR hr.image_path = '';

-- Show the updated structure
SHOW COLUMNS FROM hazard_reports;
