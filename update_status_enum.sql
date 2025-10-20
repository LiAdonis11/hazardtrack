ALTER TABLE hazard_reports MODIFY status ENUM('pending','in_progress','verified','resolved','rejected','closed') DEFAULT 'pending';
