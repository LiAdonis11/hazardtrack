-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Sep 29, 2025 at 03:37 PM
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

--
-- Dumping data for table `assignments`
--

INSERT INTO `assignments` (`id`, `report_id`, `assigned_to`, `assigned_by`, `team_type`, `status`, `priority`, `notes`, `assigned_at`, `updated_at`, `completed_at`) VALUES
(2, 59, 2, 11, 'fire_team', 'assigned', 'high', 'Urgent fire response needed', '2025-09-02 21:47:33', '2025-09-02 21:47:33', NULL),
(3, 59, 12, 11, 'fire_team', 'completed', 'high', 'Test assignment', '2025-09-02 22:06:26', '2025-09-02 22:13:32', '2025-09-02 22:13:32'),
(4, 59, 2, 11, 'rescue_team', 'assigned', 'emergency', 'Emergency rescue assignment', '2025-09-02 22:07:30', '2025-09-02 22:07:30', NULL),
(5, 59, 2, 11, 'inspection_team', 'assigned', 'low', 'Low priority inspection', '2025-09-02 22:07:48', '2025-09-02 22:07:48', NULL),
(6, 60, 12, 18, 'fire_team', 'assigned', 'high', 'Urgent electrical hazard', '2025-09-02 22:21:03', '2025-09-02 22:21:03', NULL);

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

--
-- Dumping data for table `assignment_history`
--

INSERT INTO `assignment_history` (`id`, `assignment_id`, `old_status`, `new_status`, `changed_by`, `change_reason`, `changed_at`) VALUES
(1, 2, NULL, 'assigned', 11, 'Initial assignment', '2025-09-02 21:47:33'),
(2, 3, NULL, 'assigned', 11, 'Initial assignment', '2025-09-02 22:06:26'),
(3, 4, NULL, 'assigned', 11, 'Initial assignment', '2025-09-02 22:07:30'),
(4, 5, NULL, 'assigned', 11, 'Initial assignment', '2025-09-02 22:07:48'),
(5, 3, 'assigned', 'accepted', 12, 'Accepting the fire team assignment', '2025-09-02 22:13:03'),
(6, 3, 'accepted', 'in_progress', 12, 'Starting work on the fire hazard inspection', '2025-09-02 22:13:19'),
(7, 3, 'in_progress', 'completed', 12, 'Fire hazard inspection completed successfully', '2025-09-02 22:13:32'),
(8, 6, NULL, 'assigned', 18, 'Initial assignment', '2025-09-02 22:21:03');

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

INSERT INTO `hazard_reports` (`id`, `report_number`, `user_id`, `category_id`, `title`, `description`, `image_path`, `location_address`, `latitude`, `longitude`, `severity`, `priority`, `status`, `admin_notes`, `assigned_inspector_id`, `rejection_reason`, `resolution_notes`, `created_at`, `updated_at`) VALUES
(1, 'HZ-2025-0001', 4, 1, 'Loose Wires at Sari-Sari Store', 'Exposed electrical wiring near the cashier.', 'uploads/wires1.jpg', 'Brgy. XYZ, Tagudin, Ilocos Sur', 16.93330000, 120.45000000, 'high', 'high', 'in_progress', NULL, NULL, NULL, NULL, '2025-08-18 13:26:40', '2025-09-04 23:18:24'),
(2, 'HZ-2025-0002', 4, 2, 'Suspected LPG Refilling', 'Unlabeled LPG tanks at back alley.', 'uploads/lpg1.jpg', 'Poblacion, Tagudin, Ilocos Sur', 16.93010000, 120.45220000, 'critical', 'emergency', 'in_progress', NULL, 3, NULL, NULL, '2025-08-18 13:26:40', '2025-09-04 23:18:24'),
(3, 'HZ-2025-0003', 13, 14, 'Slippery Floor at Market Entrance', 'Water accumulation makes the floor very slippery, especially in the morning.', 'uploads/market_floor.jpg', 'Public Market, Tagudin, Ilocos Sur', 16.93500000, 120.44800000, 'medium', 'medium', 'in_progress', NULL, 15, NULL, NULL, '2025-08-23 23:31:34', '2025-09-03 00:46:28'),
(4, 'HZ-2025-0004', 14, 15, 'Dark Alley Near School', 'Poor lighting in the alley beside Tagudin National High School poses safety risks at night.', 'uploads/dark_alley.jpg', 'Near TNHS, Tagudin, Ilocos Sur', 16.93450000, 120.44950000, 'high', 'high', 'pending', NULL, NULL, NULL, NULL, '2025-08-24 23:31:34', '2025-09-04 23:18:24'),
(5, 'HZ-2025-0005', 4, 13, 'Water Leak in Multi-Purpose Hall', 'Continuous water leak from the ceiling of the barangay multi-purpose hall.', 'uploads/water_leak.jpg', 'Brgy. XYZ Multi-Purpose Hall, Tagudin, Ilocos Sur', 16.93380000, 120.45050000, 'medium', 'medium', 'resolved', NULL, 3, NULL, 'Plumber was called and fixed the leaking pipe. Area has been dried.', '2025-08-21 23:31:34', '2025-09-03 00:46:28'),
(6, 'HZ-2025-0006', 13, 12, 'Uneven Pavement on Main Road', 'Several cracked and uneven pavement tiles on the sidewalk along the national highway.', NULL, 'National Highway, Tagudin, Ilocos Sur', 16.93250000, 120.44780000, 'low', 'low', 'in_progress', NULL, 16, NULL, NULL, '2025-08-25 23:31:34', '2025-09-04 23:18:24'),
(7, 'HZ-2025-0007', 14, 4, 'Flammable Materials Storage', 'Improper storage of gasoline containers near residential area.', NULL, 'Purok 2, Brgy. ABC, Tagudin, Ilocos Sur', 16.93620000, 120.45120000, 'critical', 'emergency', 'pending', NULL, NULL, NULL, NULL, '2025-08-26 23:31:34', '2025-09-04 23:18:24'),
(8, 'HZ-2024-0001', 1, 1, 'Test Hazard with Location', 'This is a test hazard with location data', NULL, '123 Test Street, Test City', 14.59950000, 120.98420000, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-08-26 23:44:40', '2025-08-26 23:44:40'),
(9, 'HZ-2025-0009', 1, 1, 'Complete Test Hazard with Location', 'This is a complete test with location data', NULL, '456 Test Avenue, Test City', 14.60000000, 120.98500000, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-08-26 23:48:13', '2025-08-26 23:48:13'),
(10, 'HZ-2025-0010', 4, 1, 'Test Electrical Hazard', 'Exposed wires found near the main road', NULL, '123 Test Street, Tagudin', 16.93330000, 120.45000000, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-08-28 07:04:06', '2025-08-28 07:04:06'),
(11, 'HZ-2025-0011', 7, 1, 'Test Hazard', 'This is a test hazard report.', NULL, 'Test Location', 16.93330000, 120.45000000, 'medium', 'medium', 'resolved', NULL, NULL, NULL, NULL, '2025-08-28 22:39:56', '2025-09-01 23:48:33'),
(12, 'HZ-2025-0012', 7, 13, 'asas', 'sas', NULL, 'as', 15.19396200, 120.55093580, 'medium', 'medium', '', NULL, NULL, NULL, NULL, '2025-08-29 09:54:29', '2025-09-01 23:48:40'),
(13, 'HZ-2025-0013', 7, 13, 'asas', 'sas', NULL, 'as', 15.19396200, 120.55093580, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-08-29 09:54:30', '2025-08-29 09:54:30'),
(14, 'HZ-2025-0014', 7, 13, 'asas', 'sas', NULL, 'as', 15.19396200, 120.55093580, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-08-29 09:54:31', '2025-08-29 09:54:31'),
(15, 'HZ-2025-0015', 7, 13, 'asas', 'sas', NULL, 'as', 15.19396200, 120.55093580, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-08-29 09:54:31', '2025-08-29 09:54:31'),
(16, 'HZ-2025-0016', 7, 13, 'asas', 'sas', NULL, 'as', 15.19396200, 120.55093580, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-08-29 09:54:31', '2025-08-29 09:54:31'),
(17, 'HZ-2025-0017', 7, 13, 'asas', 'sas', NULL, 'as', 15.19396200, 120.55093580, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-08-29 09:54:31', '2025-08-29 09:54:31'),
(18, 'HZ-2025-0018', 7, 13, 'asas', 'sas', NULL, 'as', 15.19396200, 120.55093580, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-08-29 09:54:32', '2025-08-29 09:54:32'),
(19, 'HZ-2025-0019', 7, 13, 'asas', 'sas', NULL, 'as', 15.19396200, 120.55093580, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-08-29 09:54:32', '2025-08-29 09:54:32'),
(20, 'HZ-2025-0020', 7, 13, 'asas', 'sas', NULL, 'as', 15.19396200, 120.55093580, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-08-29 09:54:32', '2025-08-29 09:54:32'),
(21, 'HZ-2025-0021', 7, 13, 'asas', 'sas', NULL, 'as', 15.19396200, 120.55093580, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-08-29 09:54:33', '2025-08-29 09:54:33'),
(22, 'HZ-2025-0022', 7, 13, 'asas', 'sas', NULL, 'as', 15.19396200, 120.55093580, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-08-29 09:54:33', '2025-08-29 09:54:33'),
(23, 'HZ-2025-0023', 7, 13, 'asas', 'sas', NULL, 'as', 15.19396200, 120.55093580, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-08-29 09:54:33', '2025-08-29 09:54:33'),
(24, 'HZ-2025-0024', 7, 13, 'asas', 'sas', NULL, 'as', 15.19396200, 120.55093580, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-08-29 09:54:33', '2025-08-29 09:54:33'),
(25, 'HZ-2025-0025', 7, 13, 'asas', 'sas', NULL, 'as', 15.19396200, 120.55093580, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-08-29 09:54:33', '2025-08-29 09:54:33'),
(26, 'HZ-2025-0026', 7, 13, 'asas', 'sas', NULL, 'as', 15.19396200, 120.55093580, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-08-29 09:54:34', '2025-08-29 09:54:34'),
(27, 'HZ-2025-0027', 7, 13, 'asas', 'sas', NULL, 'as', 15.19396200, 120.55093580, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-08-29 09:54:34', '2025-08-29 09:54:34'),
(28, 'HZ-2025-0028', 7, 13, 'asas', 'sas', NULL, 'as', 15.19396200, 120.55093580, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-08-29 09:54:34', '2025-08-29 09:54:34'),
(29, 'HZ-2025-0029', 7, 13, 'asas', 'sas', NULL, 'as', 15.19396200, 120.55093580, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-08-29 09:54:44', '2025-08-29 09:54:44'),
(30, 'HZ-2025-0030', 7, 13, 'asas', 'sas', NULL, 'as', 15.19396200, 120.55093580, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-08-29 09:54:44', '2025-08-29 09:54:44'),
(31, 'HZ-2025-0031', 7, 13, 'asas', 'sas', NULL, 'as', 15.19396200, 120.55093580, 'medium', 'medium', '', NULL, NULL, NULL, NULL, '2025-08-29 09:54:45', '2025-09-01 23:50:19'),
(32, 'HZ-2025-0032', 7, 13, 'asas', 'sas', NULL, 'as', 15.19396200, 120.55093580, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-08-29 09:54:45', '2025-08-29 09:54:45'),
(33, 'HZ-2025-0033', 7, 13, 'asas', 'sas', NULL, 'as', 15.19396200, 120.55093580, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-08-29 09:54:45', '2025-08-29 09:54:45'),
(34, 'HZ-2025-0034', 7, 13, 'asas', 'sas', NULL, 'as', 15.19396200, 120.55093580, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-08-29 09:54:46', '2025-08-29 09:54:46'),
(35, 'HZ-2025-0035', 7, 13, 'asas', 'sas', NULL, 'as', 15.19396200, 120.55093580, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-08-29 09:54:46', '2025-08-29 09:54:46'),
(36, 'HZ-2025-0036', 7, 13, 'asas', 'sas', NULL, 'as', 15.19396200, 120.55093580, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-08-29 09:54:46', '2025-08-29 09:54:46'),
(37, 'HZ-2025-0037', 7, 13, 'asas', 'sas', NULL, 'as', 15.19396200, 120.55093580, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-08-29 09:54:47', '2025-08-29 09:54:47'),
(38, 'HZ-2025-0038', 7, 13, 'asas', 'sas', NULL, 'as', 15.19396200, 120.55093580, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-08-29 09:54:47', '2025-08-29 09:54:47'),
(39, 'HZ-2025-0039', 7, 13, 'asas', 'sas', NULL, 'as', 15.19396200, 120.55093580, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-08-29 11:05:28', '2025-08-29 11:05:28'),
(40, 'HZ-2025-0040', 7, 13, 'sas', 'asas', NULL, 'asa', 15.19396200, 120.55093580, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-08-29 11:06:52', '2025-08-29 11:06:52'),
(41, 'HZ-2025-0041', 7, 13, 'sas', 'asas', NULL, 'asa', 15.19396200, 120.55093580, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-08-29 11:06:53', '2025-08-29 11:06:53'),
(42, 'HZ-2025-0042', 7, 9, 'asas', 'asas', NULL, 'as', 15.19396200, 120.55093580, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-08-29 12:07:46', '2025-08-29 12:07:46'),
(43, 'HZ-2025-0043', 7, 9, 'asas', 'asas', NULL, 'as', 15.19396200, 120.55093580, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-08-29 12:07:57', '2025-08-29 12:07:57'),
(44, 'HZ-2025-0044', 7, 9, 'asas', 'asas', NULL, 'as', 15.19396200, 120.55093580, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-08-29 12:08:36', '2025-08-29 12:08:36'),
(45, 'HZ-2025-0045', 7, 9, 'asas', 'asas', NULL, 'as', 15.19396200, 120.55093580, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-08-29 12:23:52', '2025-08-29 12:23:52'),
(46, 'HZ-2025-0046', 7, 9, 'asas', 'asas', NULL, 'as', 15.19396200, 120.55093580, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-08-29 12:23:52', '2025-08-29 12:23:52'),
(47, 'HZ-2025-0047', 7, 9, 'asas', 'asas', NULL, 'as', 15.19396200, 120.55093580, 'medium', 'medium', 'resolved', NULL, NULL, NULL, NULL, '2025-08-29 12:23:53', '2025-09-01 23:47:28'),
(48, 'HZ-2025-0048', 7, 9, 'asas', 'asas', NULL, 'as', 15.19396200, 120.55093580, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-08-29 12:23:53', '2025-08-29 12:23:53'),
(49, 'HZ-2025-0049', 7, 9, 'asas', 'asas', NULL, 'as', 15.19396200, 120.55093580, 'medium', 'medium', '', NULL, NULL, NULL, NULL, '2025-08-29 12:28:08', '2025-09-01 23:47:31'),
(50, 'HZ-2025-0050', 7, 9, 'asas', 'asas', NULL, 'as', 15.19396200, 120.55093580, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-08-29 12:28:12', '2025-08-29 12:28:12'),
(51, 'HZ-2025-0051', 7, 9, 'asasasas', 'asas', NULL, 'as', 15.19396200, 120.55093580, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-08-29 12:28:38', '2025-08-29 12:28:38'),
(52, 'HZ-2025-0052', 7, 9, 'asasasas', 'asas', NULL, 'as', 15.19396200, 120.55093580, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-08-29 12:28:43', '2025-08-29 12:28:43'),
(53, 'HZ-2025-0053', 7, 14, 'sdsd', 'sdsdsd', NULL, 'sdsd', 15.13666150, 120.58546740, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-08-31 23:48:00', '2025-08-31 23:48:00'),
(54, 'HZ-2025-0054', 7, 12, 'qwqqqq', 'qqqqqqqqq', NULL, 'qwqqqqqqqqqq', 15.13666150, 120.58546740, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-08-31 23:50:00', '2025-08-31 23:50:00'),
(55, 'HZ-2025-0055', 7, 6, '🚨 EMERGENCY: Structural Collapse', 'Emergency reported via panic button: structural', NULL, NULL, NULL, NULL, 'medium', 'medium', 'resolved', NULL, NULL, NULL, NULL, '2025-09-01 00:20:07', '2025-09-01 23:47:19'),
(56, 'HZ-2025-0056', 7, 6, '🚨 EMERGENCY: Medical Emergency', 'Emergency reported via panic button: medical', NULL, NULL, NULL, NULL, 'medium', 'medium', 'rejected', NULL, NULL, NULL, NULL, '2025-09-01 00:20:08', '2025-09-01 23:47:15'),
(57, 'HZ-2025-0057', 7, 6, '🚨 EMERGENCY: Gas Leak', 'Emergency reported via panic button: gas', NULL, NULL, NULL, NULL, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-09-01 00:20:10', '2025-09-01 00:20:10'),
(58, 'HZ-2025-0058', 7, 6, '🚨 EMERGENCY: Active Fire', 'Emergency reported via panic button: fire', NULL, NULL, NULL, NULL, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-09-01 00:20:11', '2025-09-01 00:20:11'),
(59, 'HZ-2025-0059', 7, 1, 'Test Report', 'This is a test hazard report', NULL, 'Test Location', 14.59950000, 120.98420000, 'medium', 'medium', 'resolved', NULL, NULL, NULL, NULL, '2025-09-02 21:39:14', '2025-09-02 22:13:32'),
(60, 'HZ-2025-0060', 18, 1, 'Test Hazard Report', 'This is a test hazard report for testing purposes', NULL, NULL, 14.59950000, 120.98420000, 'medium', 'medium', 'in_progress', NULL, NULL, NULL, NULL, '2025-09-02 22:19:39', '2025-09-02 22:20:31'),
(61, 'HZ-2025-0061', 7, 2, 'report1', 'report1', NULL, 'Location: 15.136662, 120.585467', 15.13666150, 120.58546740, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-09-02 22:41:42', '2025-09-02 22:41:42'),
(62, 'HZ-2025-0062', 7, 2, 'basta', 'basta', NULL, 'Location: 15.136662, 120.585467', 15.13666150, 120.58546740, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-09-02 23:05:50', '2025-09-02 23:05:50'),
(63, 'HZ-2025-0063', 7, 2, 'basta', 'basta', NULL, 'Location: 15.136662, 120.585467', 15.13666150, 120.58546740, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-09-02 23:05:58', '2025-09-02 23:05:58'),
(64, 'HZ-2025-0064', 7, 2, 'basta', 'basta', NULL, 'Location: 15.136662, 120.585467', 15.13666150, 120.58546740, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-09-02 23:06:19', '2025-09-02 23:06:19'),
(65, 'HZ-2025-0065', 7, 2, 'basta', 'basta', NULL, 'Location: 15.136662, 120.585467', 15.13666150, 120.58546740, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-09-02 23:06:24', '2025-09-02 23:06:24'),
(66, 'HZ-2025-0066', 7, 4, 'basta ulet', 'dadad', NULL, 'Location: 15.136662, 120.585467', 15.13666150, 120.58546740, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-09-02 23:10:47', '2025-09-02 23:10:47'),
(67, 'HZ-2025-0067', 7, 4, 'basta ulet', 'dadad', NULL, 'Location: 15.136662, 120.585467', 15.13666150, 120.58546740, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-09-02 23:11:01', '2025-09-02 23:11:01'),
(68, 'HZ-2025-0068', 7, 4, 'basta ulet', 'dadad', NULL, 'Location: 15.136662, 120.585467', 15.13666150, 120.58546740, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-09-02 23:13:13', '2025-09-02 23:13:13'),
(69, 'HZ-2025-0069', 7, 4, 'basta ulet', 'dadad', NULL, 'Location: 15.136662, 120.585467', 15.13666150, 120.58546740, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-09-02 23:13:21', '2025-09-02 23:13:21'),
(70, 'HZ-2025-0070', 7, 6, '🚨 EMERGENCY: Active Fire', 'Emergency reported via panic button: fire', NULL, NULL, NULL, NULL, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-09-02 23:13:29', '2025-09-02 23:13:29'),
(71, 'HZ-2025-0071', 7, 6, '🚨 EMERGENCY: Gas Leak', 'Emergency reported via panic button: gas', NULL, NULL, NULL, NULL, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-09-02 23:13:30', '2025-09-02 23:13:30'),
(72, 'HZ-2025-0072', 7, 6, '🚨 EMERGENCY: Medical Emergency', 'Emergency reported via panic button: medical', NULL, NULL, NULL, NULL, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-09-02 23:13:30', '2025-09-02 23:13:30'),
(73, 'HZ-2025-0073', 7, 6, '🚨 EMERGENCY: Structural Collapse', 'Emergency reported via panic button: structural', NULL, NULL, NULL, NULL, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-09-02 23:13:31', '2025-09-02 23:13:31'),
(74, 'HZ-2025-0074', 7, 6, '🚨 EMERGENCY: Structural Collapse', 'Emergency reported via panic button: structural', NULL, NULL, NULL, NULL, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-09-02 23:13:31', '2025-09-02 23:13:31'),
(75, 'HZ-2025-0075', 7, 6, '🚨 EMERGENCY: Active Fire', 'Emergency reported via panic button: fire', NULL, NULL, NULL, NULL, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-09-02 23:13:33', '2025-09-02 23:13:33'),
(76, 'HZ-2025-0076', 7, 6, '🚨 EMERGENCY: Active Fire', 'Emergency reported via panic button: fire', NULL, NULL, NULL, NULL, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-09-02 23:13:34', '2025-09-02 23:13:34'),
(77, 'HZ-2025-0077', 7, 6, '🚨 EMERGENCY: Gas Leak', 'Emergency reported via panic button: gas', NULL, NULL, NULL, NULL, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-09-02 23:13:35', '2025-09-02 23:13:35'),
(78, 'HZ-2025-0078', 7, 6, '🚨 EMERGENCY: Medical Emergency', 'Emergency reported via panic button: medical', NULL, NULL, NULL, NULL, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-09-02 23:13:35', '2025-09-02 23:13:35'),
(79, 'HZ-2025-0079', 7, 6, '🚨 EMERGENCY: Structural Collapse', 'Emergency reported via panic button: structural', NULL, NULL, NULL, NULL, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-09-02 23:13:36', '2025-09-02 23:13:36'),
(80, 'HZ-2025-0080', 7, 6, '🚨 EMERGENCY: Active Fire', 'Emergency reported via panic button: fire', NULL, NULL, NULL, NULL, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-09-02 23:13:39', '2025-09-02 23:13:39'),
(81, 'HZ-2025-0081', 7, 6, '🚨 EMERGENCY: Gas Leak', 'Emergency reported via panic button: gas', NULL, NULL, NULL, NULL, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-09-02 23:13:39', '2025-09-02 23:13:39'),
(82, 'HZ-2025-0082', 7, 6, '🚨 EMERGENCY: Medical Emergency', 'Emergency reported via panic button: medical', NULL, NULL, NULL, NULL, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-09-02 23:13:40', '2025-09-02 23:13:40'),
(83, 'HZ-2025-0083', 7, 6, '🚨 EMERGENCY: Structural Collapse', 'Emergency reported via panic button: structural', NULL, NULL, NULL, NULL, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-09-02 23:13:40', '2025-09-02 23:13:40'),
(84, 'HZ-2025-0084', 7, 3, 'asa', 'sasasas', NULL, 'Location: 15.136662, 120.585467', 15.13666150, 120.58546740, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-09-03 00:40:49', '2025-09-03 00:40:49'),
(85, 'HZ-2025-0085', 7, 3, 'asa', 'sasasas', NULL, 'Location: 15.136662, 120.585467', 15.13666150, 120.58546740, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-09-03 00:48:54', '2025-09-03 00:48:54'),
(86, 'HZ-2025-0086', 7, 3, 'asa', 'sasasas', NULL, 'Location: 15.136662, 120.585467', 15.13666150, 120.58546740, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-09-03 00:49:08', '2025-09-03 00:49:08'),
(87, 'HZ-2025-0087', 7, 3, 'sjsjsjs', 'lslslsls', NULL, 'Location: 15.482772, 120.712002', 15.48277220, 120.71200230, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-09-03 01:20:35', '2025-09-03 01:20:35'),
(88, 'HZ-2025-0088', 7, 3, 'sjsjsjs', 'lslslsls', NULL, 'Location: 15.482772, 120.712002', 15.48277220, 120.71200230, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-09-03 01:26:02', '2025-09-03 05:38:42'),
(89, 'HZ-2025-0089', 7, 2, 'hener', 'hener', NULL, 'Location: 15.136662, 120.585467', 15.13666150, 120.58546740, 'medium', 'medium', 'in_progress', NULL, NULL, NULL, NULL, '2025-09-03 05:34:10', '2025-09-03 05:39:21'),
(90, 'HZ-2025-0090', 7, 2, 'dads', 'adad', NULL, 'Location: 15.136662, 120.585467', 15.13666150, 120.58546740, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-09-03 07:42:04', '2025-09-03 07:42:04'),
(91, 'HZ-2025-0091', 7, 2, 'dads', 'adad', NULL, 'Location: 15.136662, 120.585467', 15.13666150, 120.58546740, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-09-03 07:49:06', '2025-09-03 07:49:06'),
(92, 'HZ-2025-0092', 7, 2, 'dads', 'adad', NULL, 'Location: 15.136662, 120.585467', 15.13666150, 120.58546740, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-09-03 07:49:19', '2025-09-03 07:49:19'),
(93, 'HZ-2025-0093', 7, 2, 'dads', 'adad', NULL, 'Location: 15.136662, 120.585467', 15.13666150, 120.58546740, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-09-03 07:55:19', '2025-09-03 07:55:19'),
(94, 'HZ-2025-0094', 7, 2, 'dads', 'adad', NULL, 'Location: 15.136662, 120.585467', 15.13666150, 120.58546740, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-09-03 07:55:25', '2025-09-03 07:55:25'),
(95, 'HZ-2025-0095', 7, 2, 'dads', 'adad', NULL, 'Location: 15.136662, 120.585467', 15.13666150, 120.58546740, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-09-03 07:55:28', '2025-09-03 07:55:28'),
(96, 'HZ-2025-0096', 23, 2, 'asaa', 'asas', NULL, 'Location: 15.136662, 120.585467', 15.13666150, 120.58546740, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-09-03 09:22:33', '2025-09-03 09:22:33'),
(97, 'HZ-2025-0097', 23, 2, 'asaa', 'asas', NULL, 'Location: 15.136662, 120.585467', 15.13666150, 120.58546740, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-09-03 11:29:15', '2025-09-03 11:29:15'),
(98, 'HZ-2025-0098', 23, 3, 'sdsdsd', 'dsdsd', NULL, 'Location: 15.136662, 120.585467', 15.13666150, 120.58546740, 'medium', 'medium', 'in_progress', 'Status updated to in_progress by admin', NULL, NULL, NULL, '2025-09-03 12:17:28', '2025-09-05 08:42:31'),
(99, 'HZ-2025-0099', 23, 3, 'sdsdsd', 'dsdsd', NULL, 'Location: 15.136662, 120.585467', 15.13666150, 120.58546740, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-09-03 12:25:41', '2025-09-03 12:25:41'),
(100, 'HZ-2025-0100', 23, 2, 'asa', 'asas', NULL, 'Location: 15.136662, 120.585467', 15.13666150, 120.58546740, 'medium', 'medium', 'in_progress', 'Status updated to in_progress by admin', NULL, NULL, NULL, '2025-09-03 12:37:28', '2025-09-05 06:04:17'),
(101, 'HZ-2025-0101', 23, 3, 'hhhhh', 'kkkk', NULL, 'Location: 15.136662, 120.585467', 15.13666150, 120.58546740, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-09-03 12:40:48', '2025-09-03 12:40:48'),
(102, 'HZ-2025-0102', 23, 3, 'hhhhh', 'kkkk', NULL, 'Location: 15.136662, 120.585467', 15.13666150, 120.58546740, 'medium', 'medium', 'in_progress', NULL, NULL, NULL, NULL, '2025-09-03 12:41:46', '2025-09-03 22:51:11'),
(103, 'HZ-2025-0103', 23, 3, 'hhhhh', 'kkkk', NULL, 'Location: 15.136662, 120.585467', 15.13666150, 120.58546740, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-09-03 13:12:36', '2025-09-03 13:12:36'),
(104, 'HZ-2025-0104', 23, 4, 'asas', 'asas', NULL, 'Location: 15.136662, 120.585467', 15.13666150, 120.58546740, 'medium', 'medium', 'in_progress', '', NULL, NULL, NULL, '2025-09-03 13:17:44', '2025-09-04 01:50:59'),
(105, 'HZ-2025-0105', 23, 3, 'asdas', 'ddada', NULL, 'Location: 15.136662, 120.585467', 15.13666150, 120.58546740, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-09-03 13:32:11', '2025-09-03 13:32:11'),
(106, 'HZ-2025-0106', 23, 3, 'asdas', 'ddada', NULL, 'Location: 15.136662, 120.585467', 15.13666150, 120.58546740, 'medium', 'medium', 'rejected', NULL, NULL, NULL, NULL, '2025-09-03 13:39:44', '2025-09-04 00:00:48'),
(107, 'HZ-2025-0107', 23, 3, 'asdas', 'ddada', NULL, 'Location: 15.136662, 120.585467', 15.13666150, 120.58546740, 'medium', 'medium', 'closed', '', NULL, NULL, NULL, '2025-09-03 13:39:54', '2025-09-04 02:04:59'),
(108, 'HZ-2025-0108', 23, 1, 'new', 'ew', NULL, 'Location: 15.136662, 120.585467', 15.13666150, 120.58546740, 'medium', 'medium', 'resolved', 'qwerwerwrwer', NULL, NULL, NULL, '2025-09-04 00:03:01', '2025-09-04 02:32:51'),
(109, 'HZ-2025-0109', 23, 4, 'sample', 'sample', NULL, 'Location: 15.482772, 120.712002', 15.48277220, 120.71200230, 'medium', 'medium', 'in_progress', 'hahahha', NULL, NULL, NULL, '2025-09-04 03:15:42', '2025-09-04 03:19:34'),
(110, 'HZ-2025-0110', 30, 6, 'Test Hazard Report', 'This is a test hazard report for API testing', NULL, 'Tagudin, Ilocos Sur', 16.61670000, 120.31670000, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-09-09 05:13:16', '2025-09-09 05:13:16'),
(111, 'HZ-2025-0111', 30, 6, 'Test Hazard Report', 'This is a test hazard report for API testing', NULL, 'Tagudin, Ilocos Sur', 16.61670000, 120.31670000, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-09-09 05:18:19', '2025-09-09 05:18:19'),
(112, 'HZ-2025-0112', 30, 6, 'Test Fire Hazard Report', 'Testing hazard report submission with GPS and categorization', NULL, 'Tagudin, Ilocos Sur', 16.61670000, 120.31670000, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-09-09 05:21:24', '2025-09-09 05:21:24'),
(113, 'HZ-2025-0113', 30, 6, 'Test Fire Hazard Report', 'Testing hazard report submission with GPS and categorization', NULL, 'Tagudin, Ilocos Sur', 16.61670000, 120.31670000, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-09-09 05:22:44', '2025-09-09 05:22:44'),
(114, 'HZ-2025-0114', 46, 1, 'hazard1', 'basta', NULL, 'Location: 15.136662, 120.585467', 15.13666150, 120.58546740, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-09-25 10:04:09', '2025-09-25 10:04:09'),
(115, 'HZ-2025-0115', 7, 12, 'kkkkk', 'kkkk', NULL, '', 14.82056750, 121.10229420, 'medium', 'medium', 'pending', NULL, NULL, NULL, NULL, '2025-09-29 12:36:22', '2025-09-29 12:36:22');

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

--
-- Dumping data for table `inspector_assignments`
--

INSERT INTO `inspector_assignments` (`id`, `report_id`, `inspector_id`, `assigned_by`, `notes`, `is_completed`, `assigned_at`, `completed_at`) VALUES
(1, 1, 3, 2, 'Inspect electrical wiring issue.', 0, '2025-08-26 04:47:38', NULL),
(2, 2, 3, 2, 'Check LPG refilling site safety.', 1, '2025-08-26 04:47:38', '2025-08-26 12:47:38'),
(3, 3, 15, 2, 'Check the slippery floor issue at market entrance.', 0, '2025-08-24 23:31:35', NULL),
(4, 5, 3, 2, 'Inspect water leak at multi-purpose hall.', 1, '2025-08-22 23:31:35', '2025-08-24 07:31:35'),
(5, 6, 16, 2, 'Assess the uneven pavement on the national highway.', 0, '2025-08-25 23:31:35', NULL);

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
(1, 1, 4, 3, 'Please check the loose wires ASAP.', 0, '2025-08-26 04:47:38'),
(2, 1, 3, 4, 'Inspection scheduled for tomorrow.', 1, '2025-08-26 04:47:38'),
(3, 2, 4, 2, 'The LPG tanks seem dangerous.', 0, '2025-08-26 04:47:38'),
(4, 3, 13, 15, 'The slippery floor caused someone to fall yesterday morning.', 1, '2025-08-25 23:31:35'),
(5, 3, 15, 13, 'We will install warning signs temporarily while we find a permanent solution.', 1, '2025-08-26 01:31:35'),
(6, 5, 3, 4, 'The water leak has been fixed. Please confirm if the issue is resolved.', 0, '2025-08-24 23:31:35'),
(7, 6, 16, 13, 'I inspected the site and marked the hazardous areas with caution tape.', 1, '2025-08-26 23:31:35');

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
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `photo_notes`
--

INSERT INTO `photo_notes` (`id`, `report_id`, `type`, `content`, `timestamp`) VALUES
(1, 1, 'photo', 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', '2025-09-03 11:40:24'),
(2, 1, 'note', 'This is a test note for the photo notes feature.', '2025-09-03 11:40:24'),
(3, 1, 'photo', 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', '2025-09-03 12:05:25'),
(4, 1, 'photo', 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', '2025-09-03 13:21:15'),
(5, 1, 'photo', 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', '2025-09-03 13:25:21');

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
(1, 1, 'wires_photo.jpg', 'uploads/wires_photo.jpg', 'image/jpeg', 204800, 1, '2025-08-26 04:47:38'),
(2, 2, 'lpg_photo.jpg', 'uploads/lpg_photo.jpg', 'image/jpeg', 300000, 1, '2025-08-26 04:47:38'),
(3, 3, 'market_floor.jpg', 'uploads/market_floor.jpg', 'image/jpeg', 250000, 1, '2025-08-23 23:31:35'),
(4, 4, 'dark_alley.jpg', 'uploads/dark_alley.jpg', 'image/jpeg', 280000, 1, '2025-08-24 23:31:35'),
(5, 5, 'water_leak.jpg', 'uploads/water_leak.jpg', 'image/jpeg', 220000, 1, '2025-08-21 23:31:35'),
(6, 5, 'leak_closeup.jpg', 'uploads/leak_closeup.jpg', 'image/jpeg', 190000, 0, '2025-08-21 23:31:35');

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
(1, 1, 'pending', 'in_progress', 2, 'Assigned inspector to check the site.', '2025-08-26 04:47:38'),
(2, 2, 'in_progress', 'resolved', 3, 'Hazard removed, site is safe now.', '2025-08-26 04:47:38'),
(3, 3, 'pending', 'in_progress', 2, 'Assigned to Inspector 2 for assessment.', '2025-08-24 23:31:35'),
(4, 4, 'pending', 'pending', 13, 'Report submitted by resident.', '2025-08-24 23:31:35'),
(5, 5, 'pending', 'in_progress', 2, 'Assigned to Inspector One for water leak issue.', '2025-08-22 23:31:35'),
(6, 5, 'in_progress', 'resolved', 3, 'Water leak fixed and area cleaned.', '2025-08-23 23:31:35'),
(7, 6, 'pending', 'in_progress', 2, 'Assigned to Inspector 3 for pavement assessment.', '2025-08-25 23:31:35'),
(8, 1, 'in_progress', 'in_progress', 11, 'Status updated via API test', '2025-09-01 23:46:50'),
(9, 56, '', 'verified', 11, 'Status updated to verified by admin', '2025-09-01 23:47:06'),
(10, 56, 'resolved', 'resolved', 11, 'Status updated to resolved by admin', '2025-09-01 23:47:13'),
(11, 56, 'rejected', 'rejected', 11, 'Status updated to rejected by admin', '2025-09-01 23:47:15'),
(12, 55, 'resolved', 'resolved', 11, 'Status updated to resolved by admin', '2025-09-01 23:47:19'),
(13, 49, '', 'verified', 11, 'Status updated to verified by admin', '2025-09-01 23:47:23'),
(14, 49, '', 'verified', 11, 'Status updated to verified by admin', '2025-09-01 23:47:26'),
(15, 47, 'resolved', 'resolved', 11, 'Status updated to resolved by admin', '2025-09-01 23:47:28'),
(16, 49, '', 'verified', 11, 'Status updated to verified by admin', '2025-09-01 23:47:31'),
(17, 11, '', 'verified', 11, 'Status updated to verified by admin', '2025-09-01 23:48:31'),
(18, 11, 'resolved', 'resolved', 11, 'Status updated to resolved by admin', '2025-09-01 23:48:33'),
(19, 12, '', 'verified', 11, 'Status updated to verified by admin', '2025-09-01 23:48:40'),
(20, 31, 'in_progress', 'in_progress', 11, 'Status updated to in_progress by admin', '2025-09-01 23:50:16'),
(21, 31, '', 'verified', 11, 'Status updated to verified by admin', '2025-09-01 23:50:19'),
(22, 60, 'in_progress', 'in_progress', 18, NULL, '2025-09-02 22:20:31'),
(23, 88, 'in_progress', 'in_progress', 11, 'Status updated to in_progress by admin', '2025-09-03 05:38:31'),
(24, 88, 'pending', 'pending', 11, 'Status updated to pending by admin', '2025-09-03 05:38:42'),
(25, 89, 'in_progress', 'in_progress', 11, 'Status updated to in_progress by admin', '2025-09-03 05:39:21'),
(26, 102, 'in_progress', 'in_progress', 11, NULL, '2025-09-03 22:51:11'),
(27, 107, 'rejected', 'rejected', 11, NULL, '2025-09-03 23:59:35'),
(28, 107, 'resolved', 'resolved', 11, NULL, '2025-09-03 23:59:37'),
(29, 107, 'rejected', 'rejected', 11, NULL, '2025-09-03 23:59:39'),
(30, 106, 'rejected', 'rejected', 11, NULL, '2025-09-04 00:00:48'),
(31, 108, 'rejected', 'rejected', 11, NULL, '2025-09-04 00:03:15'),
(32, 104, 'in_progress', 'in_progress', 11, '', '2025-09-04 01:50:59'),
(33, 108, 'in_progress', 'in_progress', 11, '', '2025-09-04 01:52:06'),
(34, 108, 'closed', 'closed', 11, 'asas', '2025-09-04 01:54:58'),
(35, 108, 'resolved', 'resolved', 11, 'dfdfd', '2025-09-04 01:59:53'),
(36, 108, '', 'verified', 11, 'scscsd', '2025-09-04 02:00:32'),
(37, 108, 'in_progress', 'in_progress', 11, 'gfgfg', '2025-09-04 02:01:50'),
(38, 108, '', 'verified', 11, '', '2025-09-04 02:02:58'),
(39, 108, 'in_progress', 'in_progress', 11, 'jjhhhhhh', '2025-09-04 02:03:05'),
(40, 107, 'resolved', 'resolved', 11, '', '2025-09-04 02:04:43'),
(41, 107, 'closed', 'closed', 11, '', '2025-09-04 02:04:59'),
(42, 108, 'resolved', 'resolved', 11, 'qwerwerwrwer', '2025-09-04 02:32:51'),
(43, 109, 'in_progress', 'in_progress', 11, 'hahahha', '2025-09-04 03:19:34'),
(44, 100, '', 'verified', 11, 'Status updated to verified by admin', '2025-09-05 06:04:15'),
(45, 100, 'in_progress', 'in_progress', 11, 'Status updated to in_progress by admin', '2025-09-05 06:04:17'),
(46, 98, 'in_progress', 'in_progress', 11, 'Status updated to in_progress by admin', '2025-09-05 08:42:31');

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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `fullname`, `email`, `password`, `phone`, `address`, `role`, `is_active`, `last_login`, `created_at`, `updated_at`) VALUES
(1, 'System Admin', 'admin@hazardtrack.com', 'newpassword', '09123456789', NULL, 'admin', 1, NULL, '2025-08-18 13:26:40', '2025-08-21 21:01:11'),
(2, 'BFP Officer', 'bfp@hazardtrack.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '09111111111', NULL, 'inspector', 1, NULL, '2025-08-18 13:26:40', '2025-09-25 11:13:41'),
(3, 'Inspector One', 'inspector@hazardtrack.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '09999999999', NULL, 'inspector', 1, NULL, '2025-08-18 13:26:40', '2025-08-18 13:26:40'),
(4, 'Juan Dela Cruz', 'juan@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '09222222222', NULL, 'resident', 1, NULL, '2025-08-18 13:26:40', '2025-08-18 13:26:40'),
(5, 'Test User', 'test@example.com', '$2y$10$mLfB4LDZjA0.hYS/NbDJYuPXAa9sKZDEmWoDUHwnrShaXXnc.Tgr6', '', '', 'resident', 1, NULL, '2025-08-19 04:14:52', '2025-08-19 04:14:52'),
(6, 'Juan Dela Cruz', 'juan@test.com', '$2y$10$rx3dFEXdLFXkHA332uUuNeDG7URx5ExVtW/Mqdl48UM626C6Td6DG', '09123456789', 'Tagudin', 'resident', 1, NULL, '2025-08-19 22:15:18', '2025-08-19 22:15:18'),
(7, 'test1', 'test1@gmail.com', '$2y$10$mrcTsIbe7LP6MJeAVfAYs.278OEynzMjFQcGYD.dwy/rd7oNVqSsO', '0911111111111', 'sawat tagudin ilocos sur', 'resident', 1, NULL, '2025-08-19 23:41:15', '2025-08-19 23:41:15'),
(8, 'test2', 'test2@gmail.com', '$2y$10$C1tYtJ3.zmaEuLmvAoAl5OgM3/LOjc1bi7GOX5oM.4il2zOW6EJ7C', '09222222222', 'sawat tagudin ilocos sur', 'resident', 1, NULL, '2025-08-19 23:42:37', '2025-08-19 23:42:37'),
(9, 'test1admin', 'test1admin@gmail.com', 'test1admin', '09111111111', 'sawat', 'admin', 1, NULL, '2025-08-21 20:33:42', '2025-08-21 20:33:42'),
(10, 'test2admin', 'test2admin@gmail.com', 'test2admin12345', '09111111111', 'sawat', 'resident', 1, NULL, '2025-08-21 20:51:17', '2025-08-21 20:51:17'),
(11, 'Admin User', 'admin@example.com', '$2y$10$9.Ju/SB9F59eoLzkgSuTs.QLjUmOd1c09zuzYML6egdIizDUB9vGu', '1234567890', 'Admin Address', 'admin', 1, NULL, '2025-08-21 21:21:46', '2025-08-21 21:21:46'),
(12, 'BFP Test Officer', 'bfp_test@example.com', '$2y$10$DjG2Xv.RGOkgMZMBQZBURuQN/KNa7o9HJ15HLnYR35gXtzmVB3N8a', '09123456789', 'BFP Station 1', 'inspector', 1, NULL, '2025-08-21 23:02:44', '2025-09-25 11:13:41'),
(13, 'Maria Santos', 'maria@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '09333333333', 'Brgy. ABC, Tagudin, Ilocos Sur', 'resident', 1, NULL, '2025-08-26 23:31:34', '2025-08-26 23:31:34'),
(14, 'Pedro Reyes', 'pedro@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '09444444444', 'Poblacion, Tagudin, Ilocos Sur', 'resident', 1, NULL, '2025-08-26 23:31:34', '2025-08-26 23:31:34'),
(15, 'BFP Inspector 2', 'inspector2@hazardtrack.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '09555555555', NULL, 'inspector', 1, NULL, '2025-08-26 23:31:34', '2025-08-26 23:31:34'),
(16, 'BFP Inspector 3', 'inspector3@hazardtrack.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '09666666666', NULL, 'inspector', 1, NULL, '2025-08-26 23:31:34', '2025-08-26 23:31:34'),
(17, 'Test User', 'testuser@example.com', '$2y$10$sIKyHPGxtvy7Xum.1d585Oel3xhHgXF/g.P2yeBw56PtbWRXiMxUq', '09123456789', 'Test Address', 'resident', 1, NULL, '2025-08-28 22:18:23', '2025-08-28 22:18:23'),
(18, 'New Test User', 'newtestuser@example.com', '$2y$10$OC7iTmfUb2h1ZxRZxpmftuRTDUVongdIknfMa3kPIkDeK8wDJgIxi', '09123456789', 'Test Address', 'resident', 1, NULL, '2025-09-02 22:16:35', '2025-09-02 22:16:35'),
(19, 'Test Resident', 'testresident@example.com', '$2y$10$T.Be7DgEIyWN2dxaAR62f.eIRfCRxzjZE3hjWfXfl77Yn9v9X1IkG', '09123456789', 'Test Address', 'resident', 1, NULL, '2025-09-03 08:09:02', '2025-09-03 08:09:02'),
(20, 'New Test User', 'newtest@example.com', '$2y$10$4cNjFJ0FsLbbk7uZC80jTOftOEN9I.eqd6gMH1HNso..iJKjcgjju', '', '', 'resident', 1, NULL, '2025-09-03 09:13:57', '2025-09-03 09:13:57'),
(21, 'LEE ADONIS LUCERO', 'li@gmail.com', '$2y$10$HqppN.Z1Iyu7A4UMbR31H.zN5J8anEDb3w62c7Gaj9S6ebqcloTmm', '09062852958', 'sawat tagudin ilocos sur', 'resident', 1, NULL, '2025-09-03 09:15:46', '2025-09-03 09:15:46'),
(22, 'test3', 'test3@gmail.com', '$2y$10$aWMR2jAPWmSVjDfVhbCJAuakJCKgVnM4EPHV7v.ssbtGCCfg6k0Jm', '09062852958', 'sawat tagudin ilocos sur', 'resident', 1, NULL, '2025-09-03 09:19:13', '2025-09-03 09:19:13'),
(23, 'test4', 'test4@gmail.com', '$2y$10$CFXskFoyr/WT6RJ3YJUWSuT6Io5AdSn08z/11iBuzdqoKDcT0xsWu', '09062852958', 'sawat tagudin ilocos sur', 'resident', 1, NULL, '2025-09-03 09:21:11', '2025-09-03 09:21:11'),
(24, 'BFP Mobile Officer', 'bfpmobile@hazardtrack.com', '$2y$10$M6492hjR3HykuX5Y1iYtZ.a/tQZ0uHcUWHBUfzyokGeuewbC4xwl.', '09123456789', 'BFP Station, Tagudin, Ilocos Sur', 'inspector', 1, NULL, '2025-09-04 02:36:59', '2025-09-25 11:13:41'),
(25, 'BFP Mobile Officer', 'bfp_mobile@hazardtrack.com', '$2y$10$Ajzb4ZTpRqGMeEr3Gt2SJe4zprkna01JaESTP7akhB7Pcvu6fe2Oa', '09123456789', 'BFP Station, Tagudin, Ilocos Sur', 'inspector', 1, NULL, '2025-09-04 02:39:37', '2025-09-25 11:13:41'),
(26, 'LEE ADONIS LUCERO1', 'liadonis@gmail.com', '$2y$10$D.2vaG3CYCa3M2iMNwPAO.aorA10MGtAm6DaRDBrrPpPG5Tw4tDWi', '09000000000', 'sawat tagudin ilocos sur', 'resident', 1, NULL, '2025-09-04 03:27:05', '2025-09-04 03:27:05'),
(27, 'LEE ADONIS LUCERO', 'liadonis1@gmail.com', '$2y$10$bzfRAqpxpu.ovDGkAafguOF/Ez9V5pfCa36hJ4aCmsQsL7Sjo0STu', '09000000000', 'sawat tagudin ilocos sur', 'resident', 1, NULL, '2025-09-04 04:09:34', '2025-09-04 04:09:34'),
(28, 'Juan Dela Cruz', 'bfp@example.com', 'bfp123', '09123456789', 'Tagudin, Ilocos Sur', '', 1, NULL, '2025-09-04 09:22:49', '2025-09-04 09:22:49'),
(29, 'BFP Personnel', 'bfp@bfp.com', '$2y$10$KytoyOYXrJ4/la.hLd2vou558BBPRmutO1FV2pTX7TrXYgjPckGbS', NULL, NULL, 'inspector', 1, NULL, '2025-09-04 21:51:59', '2025-09-25 11:13:41'),
(30, 'Resident One', 'resident1@example.com', '$2y$10$hmRtFqQ3m2UVkMyGVTycN.ibL7AQ/QXht.gOZO9iTUKnNYjDoEm7S', '09123456781', 'Tagudin, Ilocos Sur', 'resident', 1, NULL, '2025-09-09 05:03:19', '2025-09-09 05:03:19'),
(31, 'Resident Two', 'resident2@example.com', '$2y$10$SSYfaeHpAbo2d3g0Tvr6WeFrAYuINOpP/QikHccRyucxt1/gTASau', '09123456782', 'Tagudin, Ilocos Sur', 'resident', 1, NULL, '2025-09-09 05:03:19', '2025-09-09 05:03:19'),
(32, 'Resident Three', 'resident3@example.com', '$2y$10$TRHdhn3naQXpr12A7oa5CeG1IWJDdrjNj/Z6LZgM89bLRSG/q4b9y', '09123456783', 'Tagudin, Ilocos Sur', 'resident', 1, NULL, '2025-09-09 05:03:19', '2025-09-09 05:03:19'),
(33, 'First Admin', 'firstadmin@example.com', '$2y$10$oivyI8RVWtfiHOXXCXqSnu2s2Tst4Ir64wvWSMyXjyLK/tBqlNd4m', '', '', 'admin', 1, NULL, '2025-09-09 05:03:19', '2025-09-09 05:03:19'),
(34, 'Second Admin', 'secondadmin@example.com', '$2y$10$o6u/mXuaPp65VllIGSsVMO3WXQlOdOeE35XffnbOoCgPmQ32s8hHy', '', '', 'admin', 1, NULL, '2025-09-09 05:03:19', '2025-09-09 05:03:19'),
(35, 'BFP Inspector 1', 'mobilebfp1@example.com', '$2y$10$mvyqtV/FyuWUnqSjb7Y16.0CcWqVPzVOGIhbfVyAKtxdtnEVnA1Ga', '09123456701', 'Tagudin, Ilocos Sur', 'inspector', 1, NULL, '2025-09-09 05:03:19', '2025-09-25 11:13:41'),
(36, 'BFP Inspector 2', 'mobilebfp2@example.com', '$2y$10$y9d.ebukHzCn0p9YXal6zuGSHtcQR9XsiRIicp0mmSV8aIWk2ZMIO', '09123456702', 'Tagudin, Ilocos Sur', 'inspector', 1, NULL, '2025-09-09 05:03:19', '2025-09-25 11:13:41'),
(37, 'BFP Inspector 3', 'mobilebfp3@example.com', '$2y$10$4KMHg9E5kWw.LJcqJpzfTOT96suB6b4l4XECLlKk...thiJXl3m.G', '09123456703', 'Tagudin, Ilocos Sur', 'inspector', 1, NULL, '2025-09-09 05:03:19', '2025-09-25 11:13:41'),
(38, 'BFP Inspector 4', 'mobilebfp4@example.com', '$2y$10$sqfEWiIx9MV1zQT/AsxgjOWVGo5BMguOT/g6TxgHODk56Dlis.Jhu', '09123456704', 'Tagudin, Ilocos Sur', 'inspector', 1, NULL, '2025-09-09 05:03:19', '2025-09-25 11:13:41'),
(39, 'BFP Inspector 5', 'mobilebfp5@example.com', '$2y$10$5Q9V5ilQ2w4/gDSvXnSR0e7SCWN1lg0sfh9cuACwEzKn2JjWHJ/ka', '09123456705', 'Tagudin, Ilocos Sur', 'inspector', 1, NULL, '2025-09-09 05:03:19', '2025-09-25 11:13:41'),
(40, 'BFP Inspector 6', 'mobilebfp6@example.com', '$2y$10$/NnGn70TSTIFWM8sckILqulpEkiSDNvBHNU0Bzx/wxVDPQMJKicGK', '09123456706', 'Tagudin, Ilocos Sur', 'inspector', 1, NULL, '2025-09-09 05:03:19', '2025-09-25 11:13:41'),
(41, 'BFP Inspector 7', 'mobilebfp7@example.com', '$2y$10$BmsDJyj57.moSp3DfRZ5CO7VhBhisge35F8SMVos6Ql.qowK1UgQS', '09123456707', 'Tagudin, Ilocos Sur', 'inspector', 1, NULL, '2025-09-09 05:03:20', '2025-09-25 11:13:41'),
(42, 'BFP Inspector 8', 'mobilebfp8@example.com', '$2y$10$jARg1E/xDYh5m0aoqmuG4ONsSznvJZkTJ1a1MhP6qM0fMxFFo/7eO', '09123456708', 'Tagudin, Ilocos Sur', 'inspector', 1, NULL, '2025-09-09 05:03:20', '2025-09-25 11:13:41'),
(43, 'BFP Inspector 9', 'mobilebfp9@example.com', '$2y$10$LxfFzGTHZ5NWTBlvU0GgRuGsapXfyUyoXjECBkwg/lAc8hSiqEOp.', '09123456709', 'Tagudin, Ilocos Sur', 'inspector', 1, NULL, '2025-09-09 05:03:20', '2025-09-25 11:13:41'),
(44, 'BFP Inspector 10', 'mobilebfp10@example.com', '$2y$10$BU8/bBLPKCQyRMwUUybsjOI4eYk/FZlkVk7mrEtUfIguRIEKL4xPC', '09123456710', 'Tagudin, Ilocos Sur', 'inspector', 1, NULL, '2025-09-09 05:03:20', '2025-09-25 11:13:41'),
(45, 'Test Registration User', 'testregistration@example.com', '$2y$10$G5XYy1R/bu1FvwWcbGdwueVFYLcg3tVjn6eXLuAvyuuGbj/6Xbknm', NULL, NULL, 'resident', 1, NULL, '2025-09-09 05:06:33', '2025-09-09 05:06:33'),
(46, 'test', 'testlogin@gmail.com', '$2y$10$iiuvhKIhju3Ce64fbkmY7O8P2Zl1yo.V15IT32ySN14WyWuF4MSMi', NULL, NULL, 'resident', 1, NULL, '2025-09-25 10:03:10', '2025-09-25 10:03:10'),
(47, 'Test BFP Mobile', 'testbfp@mobile.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '09123456789', 'BFP Station, Tagudin', 'inspector', 1, NULL, '2025-09-29 11:07:12', '2025-09-29 11:09:53');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=116;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notification_rules`
--
ALTER TABLE `notification_rules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `photo_notes`
--
ALTER TABLE `photo_notes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `status_history`
--
ALTER TABLE `status_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

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
