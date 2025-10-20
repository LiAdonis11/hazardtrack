-- Add priority column to hazard_reports table
ALTER TABLE hazard_reports ADD COLUMN priority ENUM('low','medium','high','emergency') DEFAULT 'medium' AFTER severity;

-- Update existing data to map severity to priority
UPDATE hazard_reports SET priority =
CASE
  WHEN severity = 'low' THEN 'low'
  WHEN severity = 'medium' THEN 'medium'
  WHEN severity = 'high' THEN 'high'
  WHEN severity = 'critical' THEN 'emergency'
END;

-- Update the view to include priority
DROP VIEW IF EXISTS v_report_list;
CREATE VIEW v_report_list AS
SELECT
  hr.id,
  hr.report_number,
  hr.title,
  hr.status,
  hr.severity,
  hr.priority,
  hr.created_at,
  u.fullname AS reporter_name,
  u.email AS reporter_email,
  c.name AS category_name
FROM hazard_reports hr
LEFT JOIN users u ON u.id = hr.user_id
LEFT JOIN categories c ON c.id = hr.category_id
ORDER BY hr.created_at DESC;
