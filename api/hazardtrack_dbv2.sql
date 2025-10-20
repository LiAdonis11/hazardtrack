-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Oct 09, 2025 at 04:07 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `hazardtrack_dbv2`
--

-- --------------------------------------------------------

--
-- Table structure for table `assignments`
--

CREATE TABLE `assignments` (
  `id` int(11) NOT NULL,
  `report_id` int(11) NOT NULL,
  `assigned_to` int(11) NOT NULL,
  `assigned_by` int(11) NOT NULL,
  `team_type` enum('fire_team','rescue_team','inspection_team') NOT NULL,
  `status` enum('assigned','accepted','in_progress','completed','cancelled') DEFAULT 'assigned',
  `priority` enum('low','medium','high','emergency') DEFAULT 'medium',
  `notes` text DEFAULT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `completed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `assignment_history`
--

CREATE TABLE `assignment_history` (
  `id` int(11) NOT NULL,
  `assignment_id` int(11) NOT NULL,
  `old_status` enum('assigned','accepted','in_progress','completed','cancelled') DEFAULT NULL,
  `new_status` enum('assigned','accepted','in_progress','completed','cancelled') DEFAULT NULL,
  `changed_by` int(11) NOT NULL,
  `change_reason` text DEFAULT NULL,
  `changed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `color` varchar(7) DEFAULT '#FF6B6B',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`, `color`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Electrical', 'Exposed wiring, overloaded outlets, faulty breakers', '#FFC107', 1, '2025-08-18 13:26:40', '2025-08-18 13:26:40'),
(2, 'LPG Refill', 'Illegal refilling or unsafe LPG storage', '#FF7043', 1, '2025-08-18 13:26:40', '2025-08-18 13:26:40'),
(3, 'Blocked Exit', 'Obstructed fire exits or pathways', '#8D6E63', 1, '2025-08-18 13:26:40', '2025-08-18 13:26:40'),
(4, 'Flammable Items', 'Improper storage of flammable materials', '#E57373', 1, '2025-08-18 13:26:40', '2025-08-18 13:26:40'),
(5, 'Other', 'Other hazard types not listed', '#9E9E9E', 1, '2025-08-18 13:26:40', '2025-08-18 13:26:40'),
(6, 'Fire Hazard', 'Any situation that could lead to fire', '#FF6B6B', 1, '2025-08-19 03:40:25', '2025-08-19 03:40:25'),
(7, 'Structural Damage', 'Buildings or infrastructure at risk of collapse', '#FF6B6B', 1, '2025-08-19 03:40:25', '2025-08-19 03:40:25'),
(8, 'Chemical Spill', 'Dangerous chemical substances', '#FF6B6B', 1, '2025-08-19 03:40:25', '2025-08-19 03:40:25'),
(9, 'Electrical Hazard', 'Exposed wires or electrical malfunctions', '#FF6B6B', 1, '2025-08-19 03:40:25', '2025-08-19 03:40:25'),
(10, 'Flooding', 'Water accumulation or drainage issues', '#FF6B6B', 1, '2025-08-19 03:40:25', '2025-08-19 03:40:25'),
(11, 'Gas Leak', 'Natural gas or other gas leaks', '#FF6B6B', 1, '2025-08-19 03:40:25', '2025-08-19 03:40:25'),
(12, 'Tripping Hazard', 'Uneven surfaces or obstacles in walkways', '#FFA726', 1, '2025-08-26 23:31:34', '2025-08-26 23:31:34'),
(13, 'Water Leak', 'Leaking pipes or water damage', '#4FC3F7', 1, '2025-08-26 23:31:34', '2025-08-26 23:31:34'),
(14, 'Slippery Surface', 'Wet or oily floors without warning signs', '#4DD0E1', 1, '2025-08-26 23:31:34', '2025-08-26 23:31:34'),
(15, 'Poor Lighting', 'Inadequate lighting in public areas', '#FFD54F', 1, '2025-08-26 23:31:34', '2025-08-26 23:31:34'),
(16, 'Unsafe Equipment', 'Faulty or poorly maintained machinery', '#FF8A65', 1, '2025-08-26 23:31:34', '2025-08-26 23:31:34');

-- --------------------------------------------------------

--
-- Table structure for table `hazard_categories`
--

CREATE TABLE `hazard_categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `hazard_categories`
--

INSERT INTO `hazard_categories` (`id`, `name`, `description`, `active`, `created_at`) VALUES
(1, 'Fire', 'Fire-related incidents and emergencies', 1, '2025-09-24 17:55:05'),
(2, 'Flood', 'Flooding and water-related hazards', 1, '2025-09-24 17:55:05'),
(3, 'Earthquake', 'Earthquake and seismic activities', 1, '2025-09-24 17:55:05'),
(4, 'Accident', 'Traffic accidents and collisions', 1, '2025-09-24 17:55:05'),
(5, 'Other', 'Other types of hazards', 1, '2025-09-24 17:55:05');

-- --------------------------------------------------------

--
-- Table structure for table `hazard_reports`
--

CREATE TABLE `hazard_reports` (
  `id` int(11) NOT NULL,
  `report_number` varchar(40) NOT NULL,
  `user_id` int(11) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `title` varchar(200) NOT NULL,
  `description` text NOT NULL,
  `image_path` varchar(500) DEFAULT NULL,
  `location_address` varchar(255) DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `severity` enum('low','medium','high','critical') DEFAULT 'medium',
  `priority` enum('low','medium','high','emergency') DEFAULT 'medium',
  `status` enum('pending','in_progress','resolved','rejected','closed') DEFAULT 'pending',
  `admin_notes` text DEFAULT NULL,
  `assigned_inspector_id` int(11) DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `resolution_notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `hazard_reports`
--

INSERT INTO `hazard_reports` (`id`, `report_number`, `user_id`, `category_id`, `title`, `description`, `image_path`, `location_address`, `latitude`, `longitude`, `phone`, `severity`, `priority`, `status`, `admin_notes`, `assigned_inspector_id`, `rejection_reason`, `resolution_notes`, `created_at`, `updated_at`) VALUES
(144, 'HZ-2025-0141', 7, 1, 'ad', 'sd', NULL, NULL, 15.13666150, 120.58546740, '0911111111111', 'medium', 'medium', '', NULL, NULL, NULL, NULL, '2025-09-30 00:26:08', '2025-10-09 10:25:08'),
(145, 'HZ-2025-0142', 7, 1, 'asdad', 'add', NULL, NULL, 16.93845920, 120.43730020, '0911111111111', 'medium', 'medium', '', 'Status updated to in_progress by BFP personnel.', NULL, NULL, NULL, '2025-09-30 01:13:31', '2025-10-09 10:25:08'),
(146, 'HZ-2025-0143', 7, 1, 'asdadasdadad', 'add', NULL, NULL, 16.93845920, 120.43730020, '0911111111111', 'medium', 'medium', '', NULL, NULL, NULL, NULL, '2025-09-30 01:13:54', '2025-10-09 10:25:08'),
(147, 'HZ-2025-0144', 7, 1, 'asdadasdadad', 'add', NULL, NULL, 16.93845920, 120.43730020, '0911111111111', 'medium', 'medium', '', 'Status updated to in_progress by BFP personnel.', NULL, NULL, NULL, '2025-09-30 01:18:42', '2025-10-09 10:25:08'),
(148, 'HZ-2025-0145', 7, 1, 'asdadasdadad', 'add', NULL, NULL, 16.93845920, 120.43730020, '0911111111111', 'medium', 'medium', '', NULL, NULL, NULL, NULL, '2025-09-30 01:19:23', '2025-10-09 10:25:08'),
(149, 'HZ-2025-0146', 7, 1, 'sds', 'sdsd', NULL, NULL, 16.93845920, 120.43730020, '0911111111111', 'medium', 'medium', '', NULL, NULL, NULL, NULL, '2025-09-30 01:28:34', '2025-10-09 10:25:08'),
(150, 'HZ-2025-0147', 7, 1, 'asasda', 'asad', 'uploads/68db340c037a6_report.jpg', NULL, 15.13666150, 120.58546740, '0911111111111', 'medium', 'medium', '', NULL, NULL, NULL, NULL, '2025-09-30 01:36:12', '2025-10-09 10:25:08'),
(151, 'HZ-2025-0148', 7, 1, 'asasda', 'asad', 'uploads/68db3410e70e8_report.jpg', NULL, 15.13666150, 120.58546740, '0911111111111', 'medium', 'medium', '', NULL, NULL, NULL, NULL, '2025-09-30 01:36:16', '2025-10-09 10:25:08'),
(152, 'HZ-2025-0149', 7, 1, 'sdsd000', 'sdsd', 'uploads/68db376365591_report.jpg', 'brgy. sawat', 15.13666150, 120.58546740, '09062852958', 'medium', 'medium', '', NULL, NULL, NULL, NULL, '2025-09-30 01:50:27', '2025-10-09 10:25:08'),
(153, 'HZ-2025-0010', 7, 1, 'Test..', 'Hsjs', NULL, 'Jais', 16.93928390, 120.43766760, '9563122594', 'medium', 'low', '', '', NULL, NULL, NULL, '2025-10-01 21:42:13', '2025-10-09 10:25:08'),
(155, 'HZ-2025-0012', 7, 5, 'Test1', 'Test1', 'uploads/68e64fb65d23c_report.jpg', 'Sawat', 16.93848110, 120.43730590, '9563122594', 'medium', 'medium', '', NULL, NULL, NULL, NULL, '2025-10-08 11:49:10', '2025-10-09 10:25:08'),
(162, 'HZ-2025-0150', 7, 5, 'Test Report After Fix', 'Testing report submission after fixing API URL and report number generation', NULL, 'Test Address, Tagudin, Ilocos Sur', NULL, NULL, NULL, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-10-09 13:33:43', '2025-10-09 13:33:43'),
(163, 'HZ-2025-0151', 7, 5, '187 mobstaz', 'We don\'t die we multiply.', 'uploads/68e7ba0c3128c_report.jpg', '187, Mobstaz, Tagudin, Ilocos Sur', 16.93846410, 120.43728840, '0911111111111', 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-10-09 13:35:08', '2025-10-09 13:35:08'),
(164, 'HZ-2025-0152', 7, 1, 'Electrical Hazard', 'Jsja', 'uploads/68e7beee6adac_report.jpg', 'Haiahs, Haia, Tagudin, Ilocos Sur', NULL, NULL, '0911111111111', 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-10-09 13:55:58', '2025-10-09 13:55:58');

-- --------------------------------------------------------

--
-- Table structure for table `inspector_assignments`
--

CREATE TABLE `inspector_assignments` (
  `id` int(11) NOT NULL,
  `report_id` int(11) NOT NULL,
  `inspector_id` int(11) NOT NULL,
  `assigned_by` int(11) NOT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `is_completed` tinyint(1) DEFAULT 0,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `completed_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inspector_availability`
--

CREATE TABLE `inspector_availability` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `team_type` enum('fire_team','rescue_team','inspection_team') NOT NULL,
  `is_available` tinyint(1) DEFAULT 1,
  `current_assignments` int(11) DEFAULT 0,
  `max_assignments` int(11) DEFAULT 5,
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `inspector_availability`
--

INSERT INTO `inspector_availability` (`id`, `user_id`, `team_type`, `is_available`, `current_assignments`, `max_assignments`, `last_updated`) VALUES
(1, 2, 'fire_team', 1, 1, 5, '2025-09-02 21:47:33'),
(2, 12, 'fire_team', 1, 1, 5, '2025-09-02 22:21:03'),
(3, 2, 'rescue_team', 1, 1, 5, '2025-09-02 22:07:30'),
(4, 2, 'inspection_team', 1, 1, 5, '2025-09-02 22:07:48');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `report_id` int(11) DEFAULT NULL,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `report_id`, `sender_id`, `receiver_id`, `content`, `is_read`, `created_at`) VALUES
(1, NULL, 4, 3, 'Please check the loose wires ASAP.', 0, '2025-08-26 04:47:38'),
(2, NULL, 3, 4, 'Inspection scheduled for tomorrow.', 1, '2025-08-26 04:47:38'),
(3, NULL, 4, 2, 'The LPG tanks seem dangerous.', 0, '2025-08-26 04:47:38'),
(4, NULL, 13, 15, 'The slippery floor caused someone to fall yesterday morning.', 1, '2025-08-25 23:31:35'),
(5, NULL, 15, 13, 'We will install warning signs temporarily while we find a permanent solution.', 1, '2025-08-26 01:31:35'),
(6, NULL, 3, 4, 'The water leak has been fixed. Please confirm if the issue is resolved.', 0, '2025-08-24 23:31:35'),
(7, NULL, 16, 13, 'I inspected the site and marked the hazardous areas with caution tape.', 1, '2025-08-26 23:31:35');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `body` text NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `title`, `body`, `is_read`, `created_at`) VALUES
(1, 7, 'Inspector Dispatched', 'An inspector has been dispatched to verify your report.', 0, '2025-10-03 11:29:42'),
(2, 7, 'Report Acknowledged', 'Your report has been acknowledged by BFP.', 0, '2025-10-03 11:29:50'),
(3, 7, 'Report Acknowledged', 'Your report has been acknowledged by BFP.', 0, '2025-10-03 19:56:00'),
(4, 7, 'Report Acknowledged', 'Your report has been acknowledged by BFP.', 0, '2025-10-03 19:56:01'),
(5, 7, 'Report Acknowledged', 'Your report has been acknowledged by BFP.', 0, '2025-10-07 00:17:39'),
(6, 7, 'Report Resolved', 'Your report has been resolved.', 0, '2025-10-07 00:17:40'),
(7, 7, 'Report Resolved', 'Your report has been resolved.', 0, '2025-10-07 00:17:40'),
(8, 7, 'Report Acknowledged', 'Your report has been acknowledged by BFP.', 0, '2025-10-07 00:22:22'),
(9, 7, 'Report Resolved', 'Your report has been resolved.', 0, '2025-10-07 00:22:23'),
(10, 7, 'Report Acknowledged', 'Your report has been acknowledged by BFP.', 0, '2025-10-07 14:00:26');

-- --------------------------------------------------------

--
-- Table structure for table `notification_rules`
--

CREATE TABLE `notification_rules` (
  `id` int(11) NOT NULL,
  `trigger_event` varchar(100) NOT NULL,
  `recipients` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`recipients`)),
  `message` text NOT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notification_rules`
--

INSERT INTO `notification_rules` (`id`, `trigger_event`, `recipients`, `message`, `active`, `created_at`) VALUES
(1, 'new_report', '[\"admin@example.com\"]', 'New hazard report submitted', 1, '2025-09-24 17:55:05'),
(2, 'emergency_report', '[\"admin@example.com\", \"bfp@example.com\"]', 'Emergency report requires immediate attention', 1, '2025-09-24 17:55:05'),
(3, 'overdue_report', '[\"admin@example.com\"]', 'Report is overdue for response', 1, '2025-09-24 17:55:05');

-- --------------------------------------------------------

--
-- Table structure for table `photo_notes`
--

CREATE TABLE `photo_notes` (
  `id` int(11) NOT NULL,
  `report_id` int(11) NOT NULL,
  `type` enum('photo','note') NOT NULL,
  `content` text NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `location_lat` decimal(10,8) DEFAULT NULL,
  `location_lng` decimal(11,8) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `photo_notes`
--

INSERT INTO `photo_notes` (`id`, `report_id`, `type`, `content`, `timestamp`, `location_lat`, `location_lng`, `file_name`, `file_size`, `mime_type`, `created_by`) VALUES
(1, 1, 'photo', 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', '2025-09-03 11:40:24', NULL, NULL, NULL, NULL, NULL, NULL),
(2, 1, 'note', 'This is a test note for the photo notes feature.', '2025-09-03 11:40:24', NULL, NULL, NULL, NULL, NULL, NULL),
(3, 1, 'photo', 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', '2025-09-03 12:05:25', NULL, NULL, NULL, NULL, NULL, NULL),
(4, 1, 'photo', 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', '2025-09-03 13:21:15', NULL, NULL, NULL, NULL, NULL, NULL),
(5, 1, 'photo', 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', '2025-09-03 13:25:21', NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `priority_levels`
--

CREATE TABLE `priority_levels` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `level` int(11) NOT NULL,
  `response_time` int(11) NOT NULL COMMENT 'Response time in hours',
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `priority_levels`
--

INSERT INTO `priority_levels` (`id`, `name`, `level`, `response_time`, `description`, `created_at`) VALUES
(1, 'emergency', 1, 1, 'Critical emergency requiring immediate response', '2025-09-24 17:55:05'),
(2, 'high', 2, 4, 'High priority incident requiring urgent attention', '2025-09-24 17:55:05'),
(3, 'medium', 3, 24, 'Medium priority incident requiring timely response', '2025-09-24 17:55:05'),
(4, 'low', 4, 72, 'Low priority incident for routine handling', '2025-09-24 17:55:05');

-- --------------------------------------------------------

--
-- Table structure for table `reports`
--

CREATE TABLE `reports` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `photo_path` varchar(255) DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `status` enum('pending','verified','resolved') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_unsure` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `reports`
--

INSERT INTO `reports` (`id`, `user_id`, `category_id`, `title`, `description`, `photo_path`, `latitude`, `longitude`, `status`, `created_at`, `updated_at`, `is_unsure`) VALUES
(1, 4, 1, 'Exposed Electrical Wires', 'Wires hanging near the sidewalk.', 'uploads/wires1.jpg', 16.93330000, 120.45000000, 'pending', '2025-08-26 04:47:38', '2025-08-26 04:47:38', 0),
(2, 4, 2, 'LPG Storage Issue', 'Too many LPG tanks near school.', 'uploads/lpg1.jpg', 16.93200000, 120.45100000, 'verified', '2025-08-26 04:47:38', '2025-08-26 04:47:38', 0),
(3, 13, 14, 'Slippery Market Floor', 'The entrance to the public market becomes very slippery when wet.', 'uploads/market_floor.jpg', 16.93500000, 120.44800000, 'verified', '2025-08-23 23:31:35', '2025-08-23 23:31:35', 0),
(4, 14, 15, 'Poorly Lit Alley', 'The alley beside the school has very poor lighting at night.', 'uploads/dark_alley.jpg', 16.93450000, 120.44950000, 'pending', '2025-08-24 23:31:35', '2025-08-24 23:31:35', 0),
(5, 4, 13, 'Water Leak in Hall', 'There\'s a persistent water leak from the ceiling of our multi-purpose hall.', 'uploads/water_leak.jpg', 16.93380000, 120.45050000, 'resolved', '2025-08-21 23:31:35', '2025-08-24 23:31:35', 0);

-- --------------------------------------------------------

--
-- Table structure for table `report_attachments`
--

CREATE TABLE `report_attachments` (
  `id` int(11) NOT NULL,
  `report_id` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `mime_type` varchar(120) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `report_attachments`
--

INSERT INTO `report_attachments` (`id`, `report_id`, `file_name`, `file_path`, `mime_type`, `file_size`, `is_primary`, `created_at`) VALUES
(14, 150, '68db340c037a6_report.jpg', 'uploads/68db340c037a6_report.jpg', 'image/jpeg', 157556, 1, '2025-09-30 01:36:12'),
(15, 151, '68db3410e70e8_report.jpg', 'uploads/68db3410e70e8_report.jpg', 'image/jpeg', 157556, 1, '2025-09-30 01:36:16'),
(16, 152, '68db376365591_report.jpg', 'uploads/68db376365591_report.jpg', 'image/jpeg', 159863, 1, '2025-09-30 01:50:27'),
(17, 155, '68e64fb65d23c_report.jpg', 'uploads/68e64fb65d23c_report.jpg', 'image/jpeg', 133074, 1, '2025-10-08 11:49:10'),
(18, 163, '68e7ba0c3128c_report.jpg', 'uploads/68e7ba0c3128c_report.jpg', 'image/jpeg', 45413, 1, '2025-10-09 13:35:08'),
(19, 164, '68e7beee6adac_report.jpg', 'uploads/68e7beee6adac_report.jpg', 'image/jpeg', 60150, 1, '2025-10-09 13:55:58');

-- --------------------------------------------------------

--
-- Table structure for table `status_history`
--

CREATE TABLE `status_history` (
  `id` int(11) NOT NULL,
  `report_id` int(11) NOT NULL,
  `old_status` varchar(40) DEFAULT NULL,
  `new_status` varchar(40) NOT NULL,
  `changed_by` int(11) NOT NULL,
  `change_note` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `status_history`
--

INSERT INTO `status_history` (`id`, `report_id`, `old_status`, `new_status`, `changed_by`, `change_note`, `created_at`) VALUES
(47, 147, 'pending', 'verified', 47, '0', '2025-10-03 11:29:40'),
(48, 147, '', 'pending_inspection', 47, '0', '2025-10-03 11:29:42'),
(49, 147, '', 'rejected', 47, '0', '2025-10-03 11:29:47'),
(50, 147, 'rejected', 'in_progress', 47, '0', '2025-10-03 11:29:49'),
(51, 145, 'pending', 'in_progress', 47, '0', '2025-10-03 19:55:59'),
(52, 145, 'in_progress', 'in_progress', 47, '0', '2025-10-03 19:56:00'),
(53, 153, 'pending', 'verified_false', 47, '0', '2025-10-07 00:16:15'),
(54, 153, '', 'verified_valid', 47, '0', '2025-10-07 00:17:30'),
(55, 153, '', 'verified_valid', 47, '0', '2025-10-07 00:17:35'),
(56, 153, '', 'verified_false', 47, '0', '2025-10-07 00:17:36'),
(57, 153, '', 'pending', 47, '0', '2025-10-07 00:17:36'),
(58, 153, 'pending', 'in_progress', 47, '0', '2025-10-07 00:17:37'),
(59, 153, 'in_progress', 'resolved', 47, '0', '2025-10-07 00:17:38'),
(60, 153, 'resolved', 'resolved', 47, '0', '2025-10-07 00:17:39'),
(61, 153, 'resolved', 'verified_valid', 47, '0', '2025-10-07 00:17:39'),
(62, 153, '', 'verified_false', 47, '0', '2025-10-07 00:17:40'),
(63, 153, '', 'verified_valid', 47, '0', '2025-10-07 00:21:54'),
(64, 153, '', 'verified_valid', 47, '0', '2025-10-07 00:22:11'),
(65, 153, '', 'verified_false', 47, '0', '2025-10-07 00:22:12'),
(66, 153, '', 'pending', 47, '0', '2025-10-07 00:22:15'),
(67, 153, 'pending', 'in_progress', 47, '0', '2025-10-07 00:22:21'),
(68, 153, 'in_progress', 'resolved', 47, '0', '2025-10-07 00:22:22');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `fullname` varchar(120) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `role` enum('resident','admin','inspector') DEFAULT 'resident',
  `is_active` tinyint(1) DEFAULT 1,
  `last_login` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `push_token` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `fullname`, `email`, `password`, `phone`, `address`, `role`, `is_active`, `last_login`, `created_at`, `updated_at`, `push_token`) VALUES
(1, 'System Admin', 'admin@hazardtrack.com', 'newpassword', '09123456789', NULL, 'admin', 1, NULL, '2025-08-18 13:26:40', '2025-08-21 21:01:11', NULL),
(2, 'BFP Officer', 'bfp@hazardtrack.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '09111111111', NULL, 'inspector', 1, NULL, '2025-08-18 13:26:40', '2025-09-25 11:13:41', NULL),
(3, 'Inspector One', 'inspector@hazardtrack.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '09999999999', NULL, 'inspector', 1, NULL, '2025-08-18 13:26:40', '2025-08-18 13:26:40', NULL),
(4, 'Juan Dela Cruz', 'juan@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '09222222222', NULL, 'resident', 1, NULL, '2025-08-18 13:26:40', '2025-08-18 13:26:40', NULL),
(5, 'Test User', 'test@example.com', '$2y$10$mLfB4LDZjA0.hYS/NbDJYuPXAa9sKZDEmWoDUHwnrShaXXnc.Tgr6', '', '', 'resident', 1, NULL, '2025-08-19 04:14:52', '2025-08-19 04:14:52', NULL),
(6, 'Juan Dela Cruz', 'juan@test.com', '$2y$10$rx3dFEXdLFXkHA332uUuNeDG7URx5ExVtW/Mqdl48UM626C6Td6DG', '09123456789', 'Tagudin', 'resident', 1, NULL, '2025-08-19 22:15:18', '2025-08-19 22:15:18', NULL),
(7, 'test1', 'test1@gmail.com', '$2y$10$RmyTT7A.iYemBkDh84Ltl.Iw52XQVrZPpuiT9YAVxY25pZ4orwVF2', '0911111111111', 'sawat tagudin ilocos sur', 'resident', 1, NULL, '2025-08-19 23:41:15', '2025-10-09 10:30:50', 'ExponentPushToken[hxirD0DN-WKk3iXpefy5uE]'),
(8, 'test2', 'test2@gmail.com', '$2y$10$C1tYtJ3.zmaEuLmvAoAl5OgM3/LOjc1bi7GOX5oM.4il2zOW6EJ7C', '09222222222', 'sawat tagudin ilocos sur', 'resident', 1, NULL, '2025-08-19 23:42:37', '2025-08-19 23:42:37', NULL),
(9, 'test1admin', 'test1admin@gmail.com', 'test1admin', '09111111111', 'sawat', 'admin', 1, NULL, '2025-08-21 20:33:42', '2025-08-21 20:33:42', NULL),
(10, 'test2admin', 'test2admin@gmail.com', 'test2admin12345', '09111111111', 'sawat', 'resident', 1, NULL, '2025-08-21 20:51:17', '2025-08-21 20:51:17', NULL),
(11, 'Admin User', 'admin@example.com', '$2y$10$9.Ju/SB9F59eoLzkgSuTs.QLjUmOd1c09zuzYML6egdIizDUB9vGu', '1234567890', 'Admin Address', 'admin', 1, NULL, '2025-08-21 21:21:46', '2025-08-21 21:21:46', NULL),
(12, 'BFP Test Officer', 'bfp_test@example.com', '$2y$10$DjG2Xv.RGOkgMZMBQZBURuQN/KNa7o9HJ15HLnYR35gXtzmVB3N8a', '09123456789', 'BFP Station 1', 'inspector', 1, NULL, '2025-08-21 23:02:44', '2025-09-25 11:13:41', NULL),
(13, 'Maria Santos', 'maria@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '09333333333', 'Brgy. ABC, Tagudin, Ilocos Sur', 'resident', 1, NULL, '2025-08-26 23:31:34', '2025-08-26 23:31:34', NULL),
(14, 'Pedro Reyes', 'pedro@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '09444444444', 'Poblacion, Tagudin, Ilocos Sur', 'resident', 1, NULL, '2025-08-26 23:31:34', '2025-08-26 23:31:34', NULL),
(15, 'BFP Inspector 2', 'inspector2@hazardtrack.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '09555555555', NULL, 'inspector', 1, NULL, '2025-08-26 23:31:34', '2025-08-26 23:31:34', NULL),
(16, 'BFP Inspector 3', 'inspector3@hazardtrack.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '09666666666', NULL, 'inspector', 1, NULL, '2025-08-26 23:31:34', '2025-08-26 23:31:34', NULL),
(17, 'Test User', 'testuser@example.com', '$2y$10$sIKyHPGxtvy7Xum.1d585Oel3xhHgXF/g.P2yeBw56PtbWRXiMxUq', '09123456789', 'Test Address', 'resident', 1, NULL, '2025-08-28 22:18:23', '2025-08-28 22:18:23', NULL),
(18, 'New Test User', 'newtestuser@example.com', '$2y$10$OC7iTmfUb2h1ZxRZxpmftuRTDUVongdIknfMa3kPIkDeK8wDJgIxi', '09123456789', 'Test Address', 'resident', 1, NULL, '2025-09-02 22:16:35', '2025-09-02 22:16:35', NULL),
(19, 'Test Resident', 'testresident@example.com', '$2y$10$T.Be7DgEIyWN2dxaAR62f.eIRfCRxzjZE3hjWfXfl77Yn9v9X1IkG', '09123456789', 'Test Address', 'resident', 1, NULL, '2025-09-03 08:09:02', '2025-09-03 08:09:02', NULL),
(20, 'New Test User', 'newtest@example.com', '$2y$10$4cNjFJ0FsLbbk7uZC80jTOftOEN9I.eqd6gMH1HNso..iJKjcgjju', '', '', 'resident', 1, NULL, '2025-09-03 09:13:57', '2025-09-03 09:13:57', NULL),
(21, 'LEE ADONIS LUCERO', 'li@gmail.com', '$2y$10$HqppN.Z1Iyu7A4UMbR31H.zN5J8anEDb3w62c7Gaj9S6ebqcloTmm', '09062852958', 'sawat tagudin ilocos sur', 'resident', 1, NULL, '2025-09-03 09:15:46', '2025-09-03 09:15:46', NULL),
(22, 'test3', 'test3@gmail.com', '$2y$10$aWMR2jAPWmSVjDfVhbCJAuakJCKgVnM4EPHV7v.ssbtGCCfg6k0Jm', '09062852958', 'sawat tagudin ilocos sur', 'resident', 1, NULL, '2025-09-03 09:19:13', '2025-09-03 09:19:13', NULL),
(23, 'test4', 'test4@gmail.com', '$2y$10$CFXskFoyr/WT6RJ3YJUWSuT6Io5AdSn08z/11iBuzdqoKDcT0xsWu', '09062852958', 'sawat tagudin ilocos sur', 'resident', 1, NULL, '2025-09-03 09:21:11', '2025-09-03 09:21:11', NULL),
(24, 'BFP Mobile Officer', 'bfpmobile@hazardtrack.com', '$2y$10$M6492hjR3HykuX5Y1iYtZ.a/tQZ0uHcUWHBUfzyokGeuewbC4xwl.', '09123456789', 'BFP Station, Tagudin, Ilocos Sur', 'inspector', 1, NULL, '2025-09-04 02:36:59', '2025-09-25 11:13:41', NULL),
(25, 'BFP Mobile Officer', 'bfp_mobile@hazardtrack.com', '$2y$10$Ajzb4ZTpRqGMeEr3Gt2SJe4zprkna01JaESTP7akhB7Pcvu6fe2Oa', '09123456789', 'BFP Station, Tagudin, Ilocos Sur', 'inspector', 1, NULL, '2025-09-04 02:39:37', '2025-09-25 11:13:41', NULL),
(26, 'LEE ADONIS LUCERO1', 'liadonis@gmail.com', '$2y$10$D.2vaG3CYCa3M2iMNwPAO.aorA10MGtAm6DaRDBrrPpPG5Tw4tDWi', '09000000000', 'sawat tagudin ilocos sur', 'resident', 1, NULL, '2025-09-04 03:27:05', '2025-09-04 03:27:05', NULL),
(27, 'LEE ADONIS LUCERO', 'liadonis1@gmail.com', '$2y$10$bzfRAqpxpu.ovDGkAafguOF/Ez9V5pfCa36hJ4aCmsQsL7Sjo0STu', '09000000000', 'sawat tagudin ilocos sur', 'resident', 1, NULL, '2025-09-04 04:09:34', '2025-09-04 04:09:34', NULL),
(28, 'Juan Dela Cruz', 'bfp@example.com', 'bfp123', '09123456789', 'Tagudin, Ilocos Sur', '', 1, NULL, '2025-09-04 09:22:49', '2025-09-04 09:22:49', NULL),
(29, 'BFP Personnel', 'bfp@bfp.com', '$2y$10$KytoyOYXrJ4/la.hLd2vou558BBPRmutO1FV2pTX7TrXYgjPckGbS', NULL, NULL, 'inspector', 1, NULL, '2025-09-04 21:51:59', '2025-09-25 11:13:41', NULL),
(30, 'Resident One', 'resident1@example.com', '$2y$10$hmRtFqQ3m2UVkMyGVTycN.ibL7AQ/QXht.gOZO9iTUKnNYjDoEm7S', '09123456781', 'Tagudin, Ilocos Sur', 'resident', 1, NULL, '2025-09-09 05:03:19', '2025-09-09 05:03:19', NULL),
(31, 'Resident Two', 'resident2@example.com', '$2y$10$SSYfaeHpAbo2d3g0Tvr6WeFrAYuINOpP/QikHccRyucxt1/gTASau', '09123456782', 'Tagudin, Ilocos Sur', 'resident', 1, NULL, '2025-09-09 05:03:19', '2025-09-09 05:03:19', NULL),
(32, 'Resident Three', 'resident3@example.com', '$2y$10$TRHdhn3naQXpr12A7oa5CeG1IWJDdrjNj/Z6LZgM89bLRSG/q4b9y', '09123456783', 'Tagudin, Ilocos Sur', 'resident', 1, NULL, '2025-09-09 05:03:19', '2025-09-09 05:03:19', NULL),
(33, 'First Admin', 'firstadmin@example.com', '$2y$10$oivyI8RVWtfiHOXXCXqSnu2s2Tst4Ir64wvWSMyXjyLK/tBqlNd4m', '', '', 'admin', 1, NULL, '2025-09-09 05:03:19', '2025-09-09 05:03:19', NULL),
(34, 'Second Admin', 'secondadmin@example.com', '$2y$10$o6u/mXuaPp65VllIGSsVMO3WXQlOdOeE35XffnbOoCgPmQ32s8hHy', '', '', 'admin', 1, NULL, '2025-09-09 05:03:19', '2025-09-09 05:03:19', NULL),
(35, 'BFP Inspector 1', 'mobilebfp1@example.com', '$2y$10$mvyqtV/FyuWUnqSjb7Y16.0CcWqVPzVOGIhbfVyAKtxdtnEVnA1Ga', '09123456701', 'Tagudin, Ilocos Sur', 'inspector', 1, NULL, '2025-09-09 05:03:19', '2025-09-25 11:13:41', NULL),
(36, 'BFP Inspector 2', 'mobilebfp2@example.com', '$2y$10$y9d.ebukHzCn0p9YXal6zuGSHtcQR9XsiRIicp0mmSV8aIWk2ZMIO', '09123456702', 'Tagudin, Ilocos Sur', 'inspector', 1, NULL, '2025-09-09 05:03:19', '2025-09-25 11:13:41', NULL),
(37, 'BFP Inspector 3', 'mobilebfp3@example.com', '$2y$10$4KMHg9E5kWw.LJcqJpzfTOT96suB6b4l4XECLlKk...thiJXl3m.G', '09123456703', 'Tagudin, Ilocos Sur', 'inspector', 1, NULL, '2025-09-09 05:03:19', '2025-09-25 11:13:41', NULL),
(38, 'BFP Inspector 4', 'mobilebfp4@example.com', '$2y$10$sqfEWiIx9MV1zQT/AsxgjOWVGo5BMguOT/g6TxgHODk56Dlis.Jhu', '09123456704', 'Tagudin, Ilocos Sur', 'inspector', 1, NULL, '2025-09-09 05:03:19', '2025-09-25 11:13:41', NULL),
(39, 'BFP Inspector 5', 'mobilebfp5@example.com', '$2y$10$5Q9V5ilQ2w4/gDSvXnSR0e7SCWN1lg0sfh9cuACwEzKn2JjWHJ/ka', '09123456705', 'Tagudin, Ilocos Sur', 'inspector', 1, NULL, '2025-09-09 05:03:19', '2025-09-25 11:13:41', NULL),
(40, 'BFP Inspector 6', 'mobilebfp6@example.com', '$2y$10$/NnGn70TSTIFWM8sckILqulpEkiSDNvBHNU0Bzx/wxVDPQMJKicGK', '09123456706', 'Tagudin, Ilocos Sur', 'inspector', 1, NULL, '2025-09-09 05:03:19', '2025-09-25 11:13:41', NULL),
(41, 'BFP Inspector 7', 'mobilebfp7@example.com', '$2y$10$BmsDJyj57.moSp3DfRZ5CO7VhBhisge35F8SMVos6Ql.qowK1UgQS', '09123456707', 'Tagudin, Ilocos Sur', 'inspector', 1, NULL, '2025-09-09 05:03:20', '2025-09-25 11:13:41', NULL),
(42, 'BFP Inspector 8', 'mobilebfp8@example.com', '$2y$10$jARg1E/xDYh5m0aoqmuG4ONsSznvJZkTJ1a1MhP6qM0fMxFFo/7eO', '09123456708', 'Tagudin, Ilocos Sur', 'inspector', 1, NULL, '2025-09-09 05:03:20', '2025-09-25 11:13:41', NULL),
(43, 'BFP Inspector 9', 'mobilebfp9@example.com', '$2y$10$LxfFzGTHZ5NWTBlvU0GgRuGsapXfyUyoXjECBkwg/lAc8hSiqEOp.', '09123456709', 'Tagudin, Ilocos Sur', 'inspector', 1, NULL, '2025-09-09 05:03:20', '2025-09-25 11:13:41', NULL),
(44, 'BFP Inspector 10', 'mobilebfp10@example.com', '$2y$10$BU8/bBLPKCQyRMwUUybsjOI4eYk/FZlkVk7mrEtUfIguRIEKL4xPC', '09123456710', 'Tagudin, Ilocos Sur', 'inspector', 1, NULL, '2025-09-09 05:03:20', '2025-09-25 11:13:41', NULL),
(45, 'Test Registration User', 'testregistration@example.com', '$2y$10$G5XYy1R/bu1FvwWcbGdwueVFYLcg3tVjn6eXLuAvyuuGbj/6Xbknm', NULL, NULL, 'resident', 1, NULL, '2025-09-09 05:06:33', '2025-09-09 05:06:33', NULL),
(46, 'test', 'testlogin@gmail.com', '$2y$10$iiuvhKIhju3Ce64fbkmY7O8P2Zl1yo.V15IT32ySN14WyWuF4MSMi', NULL, NULL, 'resident', 1, NULL, '2025-09-25 10:03:10', '2025-09-25 10:03:10', NULL),
(47, 'Test BFP Mobile', 'testbfp@mobile.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '09123456789', 'BFP Station, Tagudin', 'inspector', 1, NULL, '2025-09-29 11:07:12', '2025-09-29 11:09:53', NULL);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_report_list`
-- (See below for the actual view)
--
CREATE TABLE `v_report_list` (
`id` int(11)
,`report_number` varchar(40)
,`title` varchar(200)
,`status` enum('pending','in_progress','resolved','rejected','closed')
,`severity` enum('low','medium','high','critical')
,`priority` enum('low','medium','high','emergency')
,`created_at` timestamp
,`reporter_name` varchar(120)
,`reporter_email` varchar(255)
,`category_name` varchar(100)
);

-- --------------------------------------------------------

--
-- Structure for view `v_report_list`
--
DROP TABLE IF EXISTS `v_report_list`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_report_list`  AS SELECT `hr`.`id` AS `id`, `hr`.`report_number` AS `report_number`, `hr`.`title` AS `title`, `hr`.`status` AS `status`, `hr`.`severity` AS `severity`, `hr`.`priority` AS `priority`, `hr`.`created_at` AS `created_at`, `u`.`fullname` AS `reporter_name`, `u`.`email` AS `reporter_email`, `c`.`name` AS `category_name` FROM ((`hazard_reports` `hr` left join `users` `u` on(`u`.`id` = `hr`.`user_id`)) left join `categories` `c` on(`c`.`id` = `hr`.`category_id`)) ORDER BY `hr`.`created_at` DESC ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `assignments`
--
ALTER TABLE `assignments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_assignment` (`report_id`,`assigned_to`,`team_type`),
  ADD KEY `assigned_to` (`assigned_to`),
  ADD KEY `assigned_by` (`assigned_by`);

--
-- Indexes for table `assignment_history`
--
ALTER TABLE `assignment_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `assignment_id` (`assignment_id`),
  ADD KEY `changed_by` (`changed_by`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `idx_active` (`is_active`);

--
-- Indexes for table `hazard_categories`
--
ALTER TABLE `hazard_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `hazard_reports`
--
ALTER TABLE `hazard_reports`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `report_number` (`report_number`),
  ADD KEY `assigned_inspector_id` (`assigned_inspector_id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_category` (`category_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_severity` (`severity`),
  ADD KEY `idx_loc` (`latitude`,`longitude`),
  ADD KEY `idx_created` (`created_at`),
  ADD KEY `idx_image_path` (`image_path`);

--
-- Indexes for table `inspector_assignments`
--
ALTER TABLE `inspector_assignments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_assignment` (`report_id`,`inspector_id`),
  ADD KEY `assigned_by` (`assigned_by`),
  ADD KEY `idx_inspector` (`inspector_id`),
  ADD KEY `idx_completed` (`is_completed`);

--
-- Indexes for table `inspector_availability`
--
ALTER TABLE `inspector_availability`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_team` (`user_id`,`team_type`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sender_id` (`sender_id`),
  ADD KEY `idx_receiver_read` (`receiver_id`,`is_read`),
  ADD KEY `idx_report` (`report_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `notification_rules`
--
ALTER TABLE `notification_rules`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `photo_notes`
--
ALTER TABLE `photo_notes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `report_id` (`report_id`);

--
-- Indexes for table `priority_levels`
--
ALTER TABLE `priority_levels`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `report_attachments`
--
ALTER TABLE `report_attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_report` (`report_id`),
  ADD KEY `idx_primary` (`is_primary`);

--
-- Indexes for table `status_history`
--
ALTER TABLE `status_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_report` (`report_id`),
  ADD KEY `idx_changed_by` (`changed_by`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_active` (`is_active`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `assignments`
--
ALTER TABLE `assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `assignment_history`
--
ALTER TABLE `assignment_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `hazard_categories`
--
ALTER TABLE `hazard_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `hazard_reports`
--
ALTER TABLE `hazard_reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=165;

--
-- AUTO_INCREMENT for table `inspector_assignments`
--
ALTER TABLE `inspector_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `inspector_availability`
--
ALTER TABLE `inspector_availability`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `notification_rules`
--
ALTER TABLE `notification_rules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `photo_notes`
--
ALTER TABLE `photo_notes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1000;

--
-- AUTO_INCREMENT for table `priority_levels`
--
ALTER TABLE `priority_levels`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `reports`
--
ALTER TABLE `reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `report_attachments`
--
ALTER TABLE `report_attachments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `status_history`
--
ALTER TABLE `status_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=74;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `assignments`
--
ALTER TABLE `assignments`
  ADD CONSTRAINT `assignments_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `hazard_reports` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `assignments_ibfk_2` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `assignments_ibfk_3` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `assignment_history`
--
ALTER TABLE `assignment_history`
  ADD CONSTRAINT `assignment_history_ibfk_1` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `assignment_history_ibfk_2` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `hazard_reports`
--
ALTER TABLE `hazard_reports`
  ADD CONSTRAINT `hazard_reports_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `hazard_reports_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `hazard_reports_ibfk_3` FOREIGN KEY (`assigned_inspector_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `inspector_assignments`
--
ALTER TABLE `inspector_assignments`
  ADD CONSTRAINT `inspector_assignments_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `hazard_reports` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `inspector_assignments_ibfk_2` FOREIGN KEY (`inspector_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `inspector_assignments_ibfk_3` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `inspector_availability`
--
ALTER TABLE `inspector_availability`
  ADD CONSTRAINT `inspector_availability_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `hazard_reports` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_3` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `photo_notes`
--
ALTER TABLE `photo_notes`
  ADD CONSTRAINT `photo_notes_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `reports` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reports`
--
ALTER TABLE `reports`
  ADD CONSTRAINT `reports_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reports_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `report_attachments`
--
ALTER TABLE `report_attachments`
  ADD CONSTRAINT `report_attachments_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `hazard_reports` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `status_history`
--
ALTER TABLE `status_history`
  ADD CONSTRAINT `status_history_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `hazard_reports` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `status_history_ibfk_2` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
