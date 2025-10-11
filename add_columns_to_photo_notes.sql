ALTER TABLE photo_notes ADD location_lat DECIMAL(10,8) NULL;
ALTER TABLE photo_notes ADD location_lng DECIMAL(11,8) NULL;
ALTER TABLE photo_notes ADD file_name VARCHAR(255) NULL;
ALTER TABLE photo_notes ADD file_size INT NULL;
ALTER TABLE photo_notes ADD mime_type VARCHAR(100) NULL;
ALTER TABLE photo_notes ADD created_by INT NULL;
