-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:8889
-- Generation Time: Jan 20, 2026 at 06:32 PM
-- Server version: 8.0.44
-- PHP Version: 8.3.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `optic_saas`
--

-- --------------------------------------------------------

--
-- Table structure for table `bank_infos`
--

CREATE TABLE `bank_infos` (
  `id` bigint UNSIGNED NOT NULL,
  `bank_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `iban` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `swift` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rib` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bank_infos`
--

INSERT INTO `bank_infos` (`id`, `bank_name`, `account_name`, `iban`, `swift`, `rib`, `created_at`, `updated_at`) VALUES
(1, 'Banque NationaleEE', 'OR AXON OPTIC SARL', 'MA00 0000 0000 0000 0000 0000 000', 'BNMAMAMC', '456789', '2026-01-14 02:57:14', '2026-01-14 02:57:29');

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('laravel-cache-5c785c036466adea360111aa28563bfd556b5fba', 'i:1;', 1768849490),
('laravel-cache-5c785c036466adea360111aa28563bfd556b5fba:timer', 'i:1768849490;', 1768849490);

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` bigint UNSIGNED NOT NULL,
  `store_id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `label` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `store_id`, `name`, `label`, `is_default`, `created_at`, `updated_at`) VALUES
(1, 2, 'montures', 'Montures', 1, '2026-01-14 06:29:25', '2026-01-14 06:29:25'),
(2, 2, 'lentilles', 'Lentilles de contact', 1, '2026-01-14 06:29:25', '2026-01-14 06:29:25'),
(3, 2, 'accessoires', 'Accessoires', 1, '2026-01-14 06:29:25', '2026-01-14 06:29:25'),
(4, 2, 'solaires', 'Solaires', 1, '2026-01-14 06:29:25', '2026-01-14 06:29:25'),
(5, 2, 'divers', 'Divers', 1, '2026-01-14 06:29:25', '2026-01-14 06:29:25'),
(6, 1, 'montures', 'Montures', 1, '2026-01-14 06:39:45', '2026-01-14 06:39:45'),
(7, 1, 'lentilles', 'Lentilles de contact', 1, '2026-01-14 06:39:45', '2026-01-14 06:39:45'),
(8, 1, 'accessoires', 'Accessoires', 1, '2026-01-14 06:39:45', '2026-01-14 06:39:45'),
(9, 1, 'solaires', 'Solaires', 1, '2026-01-14 06:39:45', '2026-01-14 06:39:45'),
(10, 1, 'divers', 'Divers', 1, '2026-01-14 06:39:45', '2026-01-14 06:39:45'),
(11, 3, 'montures', 'Montures', 1, '2026-01-19 18:30:14', '2026-01-19 18:30:14'),
(12, 3, 'lentilles', 'Lentilles de contact', 1, '2026-01-19 18:30:14', '2026-01-19 18:30:14'),
(13, 3, 'accessoires', 'Accessoires', 1, '2026-01-19 18:30:14', '2026-01-19 18:30:14'),
(14, 3, 'solaires', 'Solaires', 1, '2026-01-19 18:30:14', '2026-01-19 18:30:14'),
(15, 3, 'divers', 'Divers', 1, '2026-01-19 18:30:14', '2026-01-19 18:30:14');

-- --------------------------------------------------------

--
-- Table structure for table `clients`
--

CREATE TABLE `clients` (
  `id` bigint UNSIGNED NOT NULL,
  `first_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `owner_id` bigint UNSIGNED DEFAULT NULL,
  `store_id` bigint UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `clients`
--

INSERT INTO `clients` (`id`, `first_name`, `last_name`, `email`, `phone`, `address`, `date_of_birth`, `notes`, `created_at`, `updated_at`, `owner_id`, `store_id`) VALUES
(1, 'Othmanee', 'MAKROUM', 'othmanemakmak15@gmail.com', '0649373307', 'hay alaouyine, av prince mly rachid, imm 14, apt 6, Téemara', '2025-10-11', 'fghj', '2026-01-14 05:26:51', '2026-01-14 05:27:04', 4, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `contact_messages`
--

CREATE TABLE `contact_messages` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `contact_messages`
--

INSERT INTO `contact_messages` (`id`, `name`, `email`, `subject`, `message`, `read_at`, `created_at`, `updated_at`) VALUES
(1, 'Othmane MAKROUM', 'othmanemakmak15@gmail.com', 'ezf', ',jb;,n', NULL, '2026-01-19 16:20:26', '2026-01-19 16:20:26'),
(2, 'Othmane MAKROUM', 'othmanemakmak15@gmail.com', 'hgjn', 'xcvbscx', NULL, '2026-01-19 16:23:28', '2026-01-19 16:23:28'),
(3, 'Othmane MAKROUM', 'othmane.makroum23@gmail.com', 'hgjn', 'dsvdsvfdwfv', NULL, '2026-01-19 16:28:01', '2026-01-19 16:28:01'),
(4, 'Othmane MAKROUM', 'othmane.makroum23@gmail.com', 'nbh,', 'dxfgchvj', NULL, '2026-01-19 16:31:49', '2026-01-19 16:31:49'),
(5, 'Othmane MAKROUM', 'othmanemakmak15@gmail.com', 'hgjn', 'bfcbv', NULL, '2026-01-19 16:32:15', '2026-01-19 16:32:15'),
(6, 'OTHMANE MAKROUM', 'othmane.makroum23@gmail.com', 'qsx', 'qsxsqxs', NULL, '2026-01-19 16:40:47', '2026-01-19 16:40:47'),
(7, 'OTHMANE MAKROUM', 'othmane.makroum23@gmail.com', 'fgh', 'gfhbjn bh', NULL, '2026-01-19 16:44:20', '2026-01-19 16:44:20'),
(8, 'OTHMANE MAKROUM', 'othmane.makroum23@gmail.com', 'dfgh', 'dfbgnhbj', '2026-01-19 17:47:22', '2026-01-19 16:52:27', '2026-01-19 17:47:22');

-- --------------------------------------------------------

--
-- Table structure for table `delivery_notes`
--

CREATE TABLE `delivery_notes` (
  `id` bigint UNSIGNED NOT NULL,
  `store_id` bigint UNSIGNED NOT NULL,
  `reference` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `purchase_order_id` bigint UNSIGNED DEFAULT NULL,
  `purchase_order_ref` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `supplier_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `supplier_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `items` json DEFAULT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `validated_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `id` bigint UNSIGNED NOT NULL,
  `invoice_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `client_id` bigint UNSIGNED DEFAULT NULL,
  `store_id` bigint UNSIGNED NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `discount_total` decimal(10,2) NOT NULL DEFAULT '0.00',
  `tax_rate` decimal(5,2) NOT NULL DEFAULT '0.00',
  `tax_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total` decimal(10,2) NOT NULL,
  `amount_paid` decimal(10,2) NOT NULL DEFAULT '0.00',
  `amount_due` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` bigint UNSIGNED NOT NULL,
  `validated_at` timestamp NULL DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `invoices`
--

INSERT INTO `invoices` (`id`, `invoice_number`, `client_id`, `store_id`, `subtotal`, `discount_total`, `tax_rate`, `tax_amount`, `total`, `amount_paid`, `amount_due`, `status`, `notes`, `created_by`, `validated_at`, `paid_at`, `created_at`, `updated_at`) VALUES
(1, 'GHB-260114-6614', 1, 2, 3.36, 0.00, 0.00, 0.00, 3.36, 0.00, 3.36, 'pending', 'ghj', 4, '2026-01-14 07:07:29', NULL, '2026-01-14 07:07:29', '2026-01-14 07:07:29'),
(2, 'GHB-260114-0024', 1, 2, 199.28, 0.00, 20.00, 39.86, 239.14, 239.00, 0.14, 'partial', NULL, 4, '2026-01-14 07:32:27', NULL, '2026-01-14 07:32:27', '2026-01-14 07:32:27'),
(3, 'GHB-260115-7501', 1, 2, 98.85, 0.00, 0.00, 0.00, 98.85, 98.85, 0.00, 'paid', NULL, 4, '2026-01-15 21:51:08', '2026-01-15 21:51:08', '2026-01-15 21:51:08', '2026-01-15 21:51:08');

-- --------------------------------------------------------

--
-- Table structure for table `invoice_items`
--

CREATE TABLE `invoice_items` (
  `id` bigint UNSIGNED NOT NULL,
  `invoice_id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED DEFAULT NULL,
  `product_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_reference` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `discount` decimal(5,2) NOT NULL DEFAULT '0.00',
  `total` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `invoice_items`
--

INSERT INTO `invoice_items` (`id`, `invoice_id`, `product_id`, `product_name`, `product_reference`, `quantity`, `unit_price`, `discount`, `total`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'fgh', 'ujibh', 12, 0.28, 0.00, 3.36, '2026-01-14 07:07:29', '2026-01-14 07:07:29'),
(2, 2, 2, 'xsqxxq', 'dsx', 1, 199.00, 0.00, 199.00, '2026-01-14 07:32:27', '2026-01-14 07:32:27'),
(3, 2, 1, 'fgh', 'ujibh', 1, 0.28, 0.00, 0.28, '2026-01-14 07:32:27', '2026-01-14 07:32:27'),
(4, 3, NULL, 'Verres Progressifs (Anti-reflets, Photochromique, Polarisé)', 'VRR-GHJ', 1, 98.85, 0.00, 98.85, '2026-01-15 21:51:08', '2026-01-15 21:51:08');

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint UNSIGNED NOT NULL,
  `reserved_at` int UNSIGNED DEFAULT NULL,
  `available_at` int UNSIGNED NOT NULL,
  `created_at` int UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int UNSIGNED NOT NULL,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_01_14_003354_create_personal_access_tokens_table', 1),
(5, '2026_01_14_004215_create_stores_table', 1),
(6, '2026_01_14_004217_create_categories_table', 1),
(7, '2026_01_14_004219_create_products_table', 1),
(8, '2026_01_14_004222_create_clients_table', 1),
(9, '2026_01_14_004223_create_invoices_table', 1),
(10, '2026_01_14_004223_create_prescriptions_table', 1),
(11, '2026_01_14_004224_create_invoice_items_table', 1),
(12, '2026_01_14_004225_create_payments_table', 1),
(13, '2026_01_14_004226_create_payment_requests_table', 1),
(14, '2026_01_14_004226_create_stock_movements_table', 1),
(15, '2026_01_14_004226_create_store_settings_table', 1),
(16, '2026_01_14_004226_create_subscriptions_table', 1),
(17, '2026_01_14_004229_create_store_user_table', 1),
(18, '2026_01_14_035228_create_bank_infos_table', 2),
(19, '2026_01_14_040251_create_pricing_configs_table', 3),
(20, '2026_01_14_041745_create_subscription_offers_table', 3),
(21, '2026_01_14_041813_add_plan_key_to_payment_requests_table', 3),
(22, '2026_01_14_043125_add_type_label_to_subscription_offers_table', 4),
(23, '2026_01_14_004230_update_clients_table_for_owner', 5),
(24, '2026_01_14_004231_create_workshop_orders_table', 6),
(25, '2026_01_14_004232_create_purchase_orders_table', 6),
(26, '2026_01_15_000000_add_last_store_id_to_users_table', 6),
(27, '2026_01_15_010000_create_suppliers_table', 7),
(28, '2026_01_15_010100_create_delivery_notes_table', 7),
(29, '2026_01_15_020000_add_status_dates_to_workshop_orders_table', 8),
(30, '2026_01_15_030000_make_invoice_client_id_nullable', 9),
(31, '2026_01_15_040000_create_contact_messages_table', 9),
(32, '2026_01_15_040100_create_notifications_table', 9);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `link` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `data` json DEFAULT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `link`, `data`, `read_at`, `created_at`, `updated_at`) VALUES
(1, 1, 'payment_request', 'Nouvelle demande de paiement', 'Othmane MAKROUM a soumis une demande de paiement.', '/abonnement', '{\"payment_request_id\": 6}', NULL, '2026-01-19 18:04:52', '2026-01-19 18:04:52');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` bigint UNSIGNED NOT NULL,
  `invoice_id` bigint UNSIGNED NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `method` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` date NOT NULL,
  `reference` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `invoice_id`, `amount`, `method`, `date`, `reference`, `notes`, `created_at`, `updated_at`) VALUES
(1, 2, 239.00, 'cash', '2026-01-14', NULL, NULL, '2026-01-14 07:32:27', '2026-01-14 07:32:27'),
(2, 3, 98.85, 'cash', '2026-01-15', NULL, NULL, '2026-01-15 21:51:08', '2026-01-15 21:51:08');

-- --------------------------------------------------------

--
-- Table structure for table `payment_requests`
--

CREATE TABLE `payment_requests` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `user_email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `months_requested` int UNSIGNED NOT NULL,
  `plan_key` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stores_count` int UNSIGNED DEFAULT NULL,
  `screenshot` longtext COLLATE utf8mb4_unicode_ci,
  `submitted_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `processed_at` timestamp NULL DEFAULT NULL,
  `processed_by` bigint UNSIGNED DEFAULT NULL,
  `rejection_reason` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payment_requests`
--

INSERT INTO `payment_requests` (`id`, `user_id`, `user_email`, `user_name`, `amount`, `months_requested`, `plan_key`, `stores_count`, `screenshot`, `submitted_at`, `status`, `processed_at`, `processed_by`, `rejection_reason`, `created_at`, `updated_at`) VALUES
(2, 4, 'admin3@optic.local', 'admin admin', 700.00, 1, NULL, NULL, 'data:image/jpeg;base64,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', '2026-01-14 02:34:26', 'approved', '2026-01-14 02:34:48', 1, NULL, '2026-01-14 02:34:26', '2026-01-14 02:34:48'),
(3, 5, 'admin4@optic.local', 'admin admin', 3570.00, 6, NULL, NULL, 'data:image/jpeg;base64,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', '2026-01-14 02:39:26', 'approved', '2026-01-14 02:40:25', 1, NULL, '2026-01-14 02:39:26', '2026-01-14 02:40:25'),
(5, 6, 'admin5@optic.local', 'admin5 admin5', 0.00, 6, NULL, NULL, 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCARAAyADASIAAhEBAxEB/8QAGwABAQACAwEAAAAAAAAAAAAAAAEFBgIEBwP/xABKEAEAAQMDAQMGCQcJCAMBAAAAAQIDBAURMRITIVQGFkFRYZMUFSIycZKh0uEHNTZzscHCQkRFcoGCg5HRIzRDU3Sy8PEkM1WU/8QAGgEBAAMBAQEAAAAAAAAAAAAAAAIDBAEFBv/EACkRAQABAgQGAgIDAQAAAAAAAAABAgMRE1FSBBIUIZGhMoExM0Gx8OH/2gAMAwEAAhEDEQA/AN9AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAfHMmYxbkxMx3eh9nwzv90ufQDrxRTVO0RVM/wBaf9VqtRT86mqP70/6vpZvW7cd9NU1esv36LlG0Uzv65W4d/wh9vlZpq7ars6piYpidpmZiXat3Ir3jviqOaZ9Do1U0VTvVRTM+2HVy8m7gTF7EwasquaZibdudpnvjv4lGqnDu7Es2NTyfK/NxIonJ0C/aiuemnru7bz6vmu3ja/qd7ItW6/J/JtUV1RE3JrnamJnn5qCTYQAAfDMyrWFi3Mm/MxbtxvVMRv3A+4+OLkW8vFtZFmZm3dpiqmZjbul1NU1jH0yvHt3d668i5FummnbeN55+gGREUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABYRaeQUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB18/8A3O79DsOvnxM4V2KaZqnbiI3mQY+9fos0zVXO0OhVq09XybcdPtl8cqjLyLs1TjX+n0R2VX+jng6Vfybn+1ortW45mqmYmfo3U3L1yasKIwhmnnmcIh38XLt36OuuqLVMTtNVc7R/m7tGfg26otxlWd5jfftIa35czRY0OjFtWa4oi7TM19MxTxPp9MvPl0VVTGEr6Ywju9D8tcrHu2cDsr9qvbIiZ6a4nZmdR1vE0/TbmTF61dqop+TRTXEzVPoh5GCT0Ki7rGTjRl/HWJZuVR1U4+9O0R6pl28Xypt3NAv5l3s4ybETTNrqj5VUcbex5kA9Ax72q5WDTnRr2PRcrp64x9qYiPZ611jPv6h5LTcrybONeime2s9UTNfHDz4B6b5M3It6Lboy9Ss1U3LVMW6IqimbUbcMFrem4GBn6bfxs2rIrqyKYrmu9Fe0RMNPAe0fD8Pxdj3kHw/D8XY95DxcB7R8Pw/F2PeQfD8Pxdj3kPFwHtHw/D8XY95B8Pw/F2PeQ8XAe0fD8Pxdj3kHw/D8XY95DxcB7R8Pw/F2PeQ+lq/Zv79jdt3OnnoqidnibePya/0l/hfxg3kAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABaeUWnkFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJ4CeAcQAaz+UD9Ho/X0/sl5o9L/KB+j0fr6f2S80B2NPwr2o5lvFx4iblydqd52gzsO/p+Xcxsmjpu252mGS8jv0mw/60/sl3tQ28oNLu5FPfqGnzMXY9Ny1v3VfTAMDm4F/BpsVXoiIv24uUbTv3S7uL5OZl/GpyLtVnGtV/Nm9XFPV9EMlqlqi/m6BaufMrsW4nf1bsf5WZFy9r+VRXM9Fmvs6KfRTEdwOtqWjZmmU0V36KarVfzblurqpn+2HxnT78aZGobU9hNzs99+/f6GZ0KurI8ndYxr09Vm3ai7Rv/JqifQ41foHT/1n7pBiNO0+/qWRNjGima4pmrvnbuiN5WzpuRf0+/m24pm1YmIr7++N/YyvkV+eqv1Fz/tcfJO/TVn3tPuztazrc2u/0VeiQYjBw72fmW8XHp6rlydqYl28LRMvNzb+LZm312N+uZriIjaduWS8nrU6XGqalep2qwqJtURP/Mqnb/z6TyQppvVanTduxbivGnquVRvt38g+Hmpnf8/D9/Swt23Nq9XbqmJmiqaZmJ3juZidH0vb9ILHuK3U0LAnUdYx8aI3pmrer+rHfIGfouZp+Hj5WRbim3fj5O07zH0+p8dP0+/qN2u3jxTNVFE1zvO3dDcMm1m6vhazj38S/bptzF7Fmu3MR8nu2jf2R9rDeRv5wyv+lufsBr9FM11xTHMztDsajg3tNzbmJkxEXaNt9p3jviJ/e+WP/vFr+vH7WZ8tv0py/ot/9lIME3j8mv8ASX+F/G0dvH5Nf6S/wv4wbyAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAtPKLTyCgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAE8BPAOIANZ/KB+j0fr6f2S80el/lA/R6P19P7JeaAyfk5mWMDXMbJyapptW5mapiJnbu9j56fqVenavGZZ74iueqmeK6Z5if7HQAbB5Taph5Wdh3dLqmKLFuIpiaZjpmJ3iO99cy5o+vVxl3syrAzKoiLtFVuaqapj0xMNaAZ3Mz8HB0q5pulXK7035ib+RVT09URxTEepx0jUMOrS8jStSrrtWblUXLd6mnq6Ko9nqYQBsmPk6XoNjIuYeZVm5l63Nuja3NFNETzPfzLXrF2uxft3rc7V26oqpn2w4ANl8ptaws3Ct2NO6o7a7ORkxMTHy9ojb2+l1fJrMw8WvMt51+bNF+zNuK4omrafohhAGc+L/J7/wDdu/8A8dX+qaXnYmlWdRuWb9VWTVHZY1UUzE9O/wA72dzCAMzo/lBm4mq497Jzci7Ypr2uU13Kqomme6e5cPUsbSvKO7kYu93CqqqpiNtpmir0d/q3+xhQGx2sfyesZlOZ8Z3LlqivrpsRZmKpmO+ImWH1bPq1PU7+ZXT0zdq3in1RxEf5RDqADePya/0l/hfxtHbx+TX+kv8AC/jBvIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC08otPIKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAATwE8A4gAw/lPpV/WdLjFx67dFfaRXvcmYjaN/VE+tqPmBqniMP69X3XowDznzA1TxGH9er7p5gap4jD+vV916MA858wNU8Rh/Xq+6eYGqeIw/r1fdejAPOfMDVPEYf16vunmBqniMP69X3XowDznzA1TxGH9er7p5gap4jD+vV916MA858wNU8Rh/Xq+6eYGqeIw/r1fdejAPOfMDVPEYf16vunmBqniMP69X3XowDznzA1TxGH9er7p5gap4jD+vV916MA858wNU8Rh/Xq+6eYGqeIw/r1fdejAPOfMDVPEYf16vutj8kfJ/K0L4X8KuWa+26Ons5mdturffeI9bYwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABaeUWnkFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJ4CeAcQAdLVc/wCLcTt+z7T5UU9PVsw3nbHgp97+DueVf5pj9ZT+9pqi5XMThD1eE4a1ct81Ud2zedseCn3v4HnbHgp97+DWRXmVatfRWNvuWzedseCn3v4HnbHgp97+DWQzKtTorG33LZvO2PBT738DztjwU+9/BrIZlWp0Vjb7ls3nbHgp97+B52x4Kfe/g1kMyrU6Kxt9y2bztjwU+9/A87Y8FPvfwayGZVqdFY2+5bN52x4Kfe/gedseCn3v4NZDMq1Oisbfctm87Y8FPvfwPO2PBT738GshmVanRWNvuWzedseCn3v4HnbHgp97+DWQzKtTorG33LZvO2PBT738GT0fV41XttrHZdl0/wArffff2exozZvI3+ef3P4k6K6pqwln4nhbVu1NVMd/+tmAaHjgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC08otPIKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAATwE8A4gAwvlX+aY/WU/vaa3Lyr/NMfrKf3tNZbvye5wH6fsH3xIxpvf8Ay5uRa2/4fO7tWrWnXNTs0U3a6MXbeuq7tE79/d+xCIxa6q+X+H2wtLt16dfyciZivs5qtUb98xHpdXBxbNyxeycqquLVraNqOaplm7Fqm/XnXJzcaqK7PTTTRM7W6fR6OGCsZVzAu3aLVVu7RV8mqKqeqiuPoTmIjBnorqr5oie/Z9MjT6e3x4xq6qrWRT1UzXG00xv37upkdnF6qLO/ZxO0b+llKLl7Lm3N2qmm9k/7K3ERtFFHp2j7P83zv4eHXj5NWLN6mvGmOrtNtqo327vU5MaJ03JicKv9/vwxYCDQAAAAAAAANm8jf55/c/iay2byN/nn9z+JO38oZeN/RV9f22YBrfPgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC08otPIKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAATwE8A4gAwvlX+aY/WU/vaa3Lyr/NMfrKf3tNZbvye5wH6fsAVtz7Y+Tdx6btNuYiLtPTVvHofEAwiO763cm5cvU3d+maYiKen+TEcbPvk6nk5NrsrlVPTM71dNMR1fT63THcZR5Ke3b8ADiQAAAAAAAA2byN/nn9z+JrLZvI3+ef3P4k7fyhl439FX1/bZgGt8+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALTyi08goAAAAAAAAAAAAAAAAAAAAAAAAAAAAABPATwDiAD45ONZyrfZ37cXKN99p9bq/Eum+Eo+1kByYiU6bldMYRLH/ABLpvhKPtPiXTfCUfayA5yxolm3N0+WP+JdN8JR9p8S6b4Sj7WQDljQzbm6fLH/Eum+Eo+0+JdN8JR9rIByxoZtzdPlj/iXTfCUfafEum+Eo+1kA5Y0M25unyx/xLpvhKPtPiXTfCUfayAcsaGbc3T5Y/wCJdN8JR9p8S6b4Sj7WQDljQzbm6fLH/Eum+Eo+0+JdN8JR9rIByxoZtzdPlj/iXTfCUfafEum+Eo+1kA5Y0M25unyx/wAS6b4Sj7XYxcLGw+r4Napt9e3Vt6dv/bsBhEOTcrqjCZkASVgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC08otPIKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAATwE8A4gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALTyi08goAAAAAAAAAAAAAAAAAAAAAAAAAAAAABPATwDiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAtPKLTyCgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAE8BPAOIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC08otPIKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAATwE8A4gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALTyi08goAAAAAAAAAAAAAAAAAAAAAAAAAAAAABPATwDiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAtPKLTyCgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAE8BPAOIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC08otPIKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAATwE8A4gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALTyi08goAAAAAAAAAAAAAAAAAAAAAAAAAAAAABPATwDiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAtPKLTyCgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAE8BPAOIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC08otPIKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAATwE8A4gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALTyi08goAAAAAAAAAAAAAAAAAAAAAAAAAAAAABPATwDiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAtPKLTyCgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAE8BPAOIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC08otPIKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAATwE8A4gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALTyi08goAAAAAAAAAAAAAAAAAAAAAAAAAAAAABPATwDiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAtPKLTyCgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAE8BPAOIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC08otPIKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAATwE8A4gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALTyi08goAAAAAAAAAAAAAAAAAAAAAAAAAAAAABPATwDiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAtPKLTyCgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAE8BPAOIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC08otPIKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAATwE8A4gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALTyi08goAAAAAAAAAAAAAAAAAAAAAAAAAAAAABPATwDiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAtPKLTyCgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAE8BPAOIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC08otPIKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAATwE8A4gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALTyi08goAAAAAAAAAAAAAAAAAAAAAAAAAAAAABPATwDiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAtPKLTyCgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAE8BPAOIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC08otPIKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAATwE8A4gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALTyi08goAAAAAAAAAAAAAAAAAAAAAAAAAAAAABPATwDiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAtPKLTyCgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAE8BPAOIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC08otPIKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAATwE8A4gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALTyi08goAAAAAAAAAAAAAAAAAAAAAAAAAAAAABPATwDiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA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', '2026-01-14 03:40:34', 'approved', '2026-01-14 03:41:07', 1, NULL, '2026-01-14 03:40:34', '2026-01-14 03:41:07'),
(6, 10, 'othmanemakmak15@gmail.com', 'Othmane MAKROUM', 8640.00, 12, NULL, NULL, 'data:image/jpeg;base64,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', '2026-01-19 18:04:52', 'approved', '2026-01-19 18:05:05', 1, NULL, '2026-01-19 18:04:52', '2026-01-19 18:05:05');

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint UNSIGNED NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `prescriptions`
--

CREATE TABLE `prescriptions` (
  `id` bigint UNSIGNED NOT NULL,
  `client_id` bigint UNSIGNED NOT NULL,
  `date` date NOT NULL,
  `prescriber` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `od_sphere` decimal(6,2) DEFAULT NULL,
  `od_cylinder` decimal(6,2) DEFAULT NULL,
  `od_axis` smallint UNSIGNED DEFAULT NULL,
  `od_addition` decimal(6,2) DEFAULT NULL,
  `od_pd` decimal(6,2) DEFAULT NULL,
  `og_sphere` decimal(6,2) DEFAULT NULL,
  `og_cylinder` decimal(6,2) DEFAULT NULL,
  `og_axis` smallint UNSIGNED DEFAULT NULL,
  `og_addition` decimal(6,2) DEFAULT NULL,
  `og_pd` decimal(6,2) DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `prescriptions`
--

INSERT INTO `prescriptions` (`id`, `client_id`, `date`, `prescriber`, `expiry_date`, `od_sphere`, `od_cylinder`, `od_axis`, `od_addition`, `od_pd`, `og_sphere`, `og_cylinder`, `og_axis`, `og_addition`, `og_pd`, `notes`, `created_at`, `updated_at`) VALUES
(1, 1, '2026-01-07', 'fghj', '2026-01-23', 0.50, 0.25, 5, 0.50, 0.50, 0.25, 0.25, 11, 0.50, 0.50, 'fghj', '2026-01-14 05:45:53', '2026-01-14 05:45:53');

-- --------------------------------------------------------

--
-- Table structure for table `pricing_configs`
--

CREATE TABLE `pricing_configs` (
  `id` bigint UNSIGNED NOT NULL,
  `monthly_price` decimal(10,2) NOT NULL,
  `price_per_store` decimal(10,2) NOT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DH',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` bigint UNSIGNED NOT NULL,
  `store_id` bigint UNSIGNED NOT NULL,
  `category_id` bigint UNSIGNED DEFAULT NULL,
  `reference` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `brand` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `purchase_price` decimal(10,2) NOT NULL,
  `selling_price` decimal(10,2) NOT NULL,
  `current_stock` int NOT NULL DEFAULT '0',
  `minimum_stock` int NOT NULL DEFAULT '0',
  `lens_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sphere` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cylinder` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `axis` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `addition` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `base_curve` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `diameter` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `store_id`, `category_id`, `reference`, `name`, `brand`, `description`, `purchase_price`, `selling_price`, `current_stock`, `minimum_stock`, `lens_type`, `sphere`, `cylinder`, `axis`, `addition`, `base_curve`, `diameter`, `created_at`, `updated_at`) VALUES
(1, 2, 4, 'ujibh', 'fgh', 'guyi', 'vbn', 0.07, 0.28, 0, 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-14 06:40:13', '2026-01-14 07:32:27'),
(2, 2, 5, 'dsx', 'xsqxxq', 'sxqxsqsx', 'hjdsx', 105.01, 199.00, 9998, 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-14 07:11:57', '2026-01-14 07:32:27');

-- --------------------------------------------------------

--
-- Table structure for table `purchase_orders`
--

CREATE TABLE `purchase_orders` (
  `id` bigint UNSIGNED NOT NULL,
  `store_id` bigint UNSIGNED NOT NULL,
  `reference` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `supplier_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `supplier_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'product',
  `total_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `invoice_id` bigint UNSIGNED DEFAULT NULL,
  `invoice_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `client_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lens_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lens_treatments` json DEFAULT NULL,
  `lens_parameters` json DEFAULT NULL,
  `items` json DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `expected_date` timestamp NULL DEFAULT NULL,
  `received_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `purchase_orders`
--

INSERT INTO `purchase_orders` (`id`, `store_id`, `reference`, `supplier_name`, `supplier_id`, `status`, `type`, `total_amount`, `invoice_id`, `invoice_number`, `client_name`, `lens_type`, `lens_treatments`, `lens_parameters`, `items`, `notes`, `expected_date`, `received_at`, `created_at`, `updated_at`) VALUES
(1, 2, 'BC-2601-4312', 'ghjk', '2', 'sent', 'product', 9007.00, NULL, NULL, NULL, NULL, NULL, NULL, '[{\"quantity\": 100, \"product_id\": \"1\", \"unit_price\": 90.07, \"product_name\": \"fgh\", \"product_reference\": \"ujibh\", \"received_quantity\": 0}]', 'hjnk', '2026-01-09 23:00:00', NULL, '2026-01-15 21:44:28', '2026-01-15 21:44:28'),
(2, 2, 'BC-VRR-2601-7214', 'ghjk', '2', 'sent', 'lens', 90.00, 3, 'GHB-260115-7501', 'Othmanee MAKROUM', 'progressif', '[\"antireflet\", \"photochromique\", \"polarise\"]', '{\"odPd\": 1, \"ogPd\": 3.5, \"odAxis\": 2, \"ogAxis\": 3, \"odSphere\": 2.75, \"ogSphere\": -6.25, \"odAddition\": 0.5, \"odCylinder\": 0.5, \"ogAddition\": 0.75, \"ogCylinder\": 1}', '[]', 'hjkn', NULL, NULL, '2026-01-15 21:51:08', '2026-01-15 21:51:08');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('2DXUhO5u4bfYtxVwGrU65QqXCLd2PwlJdF5mg4yK', NULL, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiVzRiOUdmcFhlYm5TSEVCMjE1c2lVNmNMakdhdlo5dXVoS1RraEQ5UiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mjg6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9hcGkvbWUiO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768922297),
('BrFJzlHHwq7VCmQZRuOXc1t89GEcEtINDixWwoAF', 1, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'YTo1OntzOjY6Il90b2tlbiI7czo0MDoidU5wU2JhVW42ek8xaVdpcGNrYTZxY1M4R3RNS1FqV3p0SGpnUzc1NSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mjg6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9hcGkvbWUiO3M6NToicm91dGUiO3M6Mjc6ImdlbmVyYXRlZDo6c1JwNHdwcThkVkhBUktEcCI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fXM6NTA6ImxvZ2luX3dlYl81OWJhMzZhZGRjMmIyZjk0MDE1ODBmMDE0YzdmNThlYTRlMzA5ODlkIjtpOjE7czoxNzoicGFzc3dvcmRfaGFzaF93ZWIiO3M6NjQ6IjllOTU2MDlmZDVmZjE2MDNiZTRjY2QzMWU2NzkwYjJjMTY0YjIyNTFhZjBiOWU5MjM3YWM3YTA2MmIxYjk0NzkiO30=', 1768931676),
('pbfL23BT1UDLvOsjPoREo7qJERGhHPr9prZIfr0P', NULL, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoialpEZUU0eHVFcHhVRzRxWkd6TTVRbW1ONmRCenlrdTFyMndFd2ozaSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mjg6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9hcGkvbWUiO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768922297),
('wYbC2osiKoI1JC44o1LgW7LdFO0r1G1IKuLnQ51S', NULL, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiODROZWRMQXkzTmVaNDZSSkNPU0NsWGFWR05kWnYzUHBEeGJmMWhwTCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mjg6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9hcGkvbWUiO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768922297);

-- --------------------------------------------------------

--
-- Table structure for table `stock_movements`
--

CREATE TABLE `stock_movements` (
  `id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL,
  `previous_stock` int NOT NULL,
  `new_stock` int NOT NULL,
  `reason` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `from_store_id` bigint UNSIGNED DEFAULT NULL,
  `to_store_id` bigint UNSIGNED DEFAULT NULL,
  `reference` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stock_movements`
--

INSERT INTO `stock_movements` (`id`, `product_id`, `type`, `quantity`, `previous_stock`, `new_stock`, `reason`, `from_store_id`, `to_store_id`, `reference`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 1, 'sortie', 12, 13, 1, 'Vente', 2, NULL, 'GHB-260114-6614', 4, '2026-01-14 08:07:29', NULL),
(2, 2, 'sortie', 1, 9999, 9998, 'Vente', 2, NULL, 'GHB-260114-0024', 4, '2026-01-14 08:32:27', NULL),
(3, 1, 'sortie', 1, 1, 0, 'Vente', 2, NULL, 'GHB-260114-0024', 4, '2026-01-14 08:32:27', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `stores`
--

CREATE TABLE `stores` (
  `id` bigint UNSIGNED NOT NULL,
  `owner_id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tax_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `invoice_prefix` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stores`
--

INSERT INTO `stores` (`id`, `owner_id`, `name`, `address`, `city`, `phone`, `email`, `tax_id`, `invoice_prefix`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 4, 'othy', 'hjkjnl', 'Temara', '+213649373307', 'othmanethemonster@gmail.com', '3456789', 'GHB', 1, '2026-01-14 05:00:55', '2026-01-14 05:00:55'),
(2, 4, 'OMAR EL MOKHTAR EL BOUSSOUNI', 'RES EL BOUSTANE IMM B 01 APPT 01 HARHOURA TEMARA', 'RABAT', '+212661914273', 'othmanethemonster99@gmail.com', '3456789', 'GHB', 1, '2026-01-14 05:02:12', '2026-01-14 05:16:29'),
(3, 10, 'Othmane MAKROUM', 'hay alaouyine, av prince mly rachid, imm 14, apt 6, Téemara', 'Temara', '+212649373307', 'othmanemakmak15@gmail.com', 'zxdzx', 'ZX', 1, '2026-01-19 18:15:14', '2026-01-19 18:15:14'),
(4, 10, 'Othmane MAKROUM', 'hay alaouyine, av prince mly rachid, imm 14, apt 6, Téemara', 'Temara', '+212649373307', 'othmanethemonster@gmail.com', 'zxz', 'ZXZX', 1, '2026-01-19 18:15:29', '2026-01-19 18:15:29'),
(7, 10, 'Othmane MAKROUM', 'hay alaouyine, av prince mly rachid, imm 14, apt 6, Téemara', 'Temara', '+212649373307', 'othmanemakmak15@gmail.com', 'fgcnvhn', 'VBN', 1, '2026-01-19 18:22:46', '2026-01-19 18:22:46');

-- --------------------------------------------------------

--
-- Table structure for table `store_settings`
--

CREATE TABLE `store_settings` (
  `id` bigint UNSIGNED NOT NULL,
  `store_id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtitle` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo` longtext COLLATE utf8mb4_unicode_ci,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ice` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rc` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `patente` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cnss` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rib` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `footer_text` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `primary_color` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `currency` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `store_settings`
--

INSERT INTO `store_settings` (`id`, `store_id`, `name`, `subtitle`, `logo`, `address`, `city`, `phone`, `email`, `website`, `ice`, `rc`, `patente`, `cnss`, `rib`, `footer_text`, `primary_color`, `currency`, `created_at`, `updated_at`) VALUES
(1, 2, 'OMAR EL MOKHTAR EL BOUSSOUNI', NULL, NULL, 'RES EL BOUSTANE IMM B 01 APPT 01 HARHOURA TEMARA', 'RABAT', '+212661914273', 'othmanethemonster99@gmail.com', NULL, NULL, NULL, NULL, NULL, NULL, 'Merci pour votre confiance !', '#2563eb', 'DH', '2026-01-16 01:06:51', '2026-01-16 01:06:51'),
(2, 3, 'Othmane MAKROUM', NULL, NULL, 'hay alaouyine, av prince mly rachid, imm 14, apt 6, Téemara', 'Temara', '+212649373307', 'othmanemakmak15@gmail.com', NULL, NULL, NULL, NULL, NULL, NULL, 'Merci pour votre confiance !', '#2563eb', 'DH', '2026-01-19 18:20:04', '2026-01-19 18:20:04');

-- --------------------------------------------------------

--
-- Table structure for table `store_user`
--

CREATE TABLE `store_user` (
  `id` bigint UNSIGNED NOT NULL,
  `store_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `store_user`
--

INSERT INTO `store_user` (`id`, `store_id`, `user_id`, `created_at`, `updated_at`) VALUES
(1, 1, 4, NULL, NULL),
(2, 2, 4, NULL, NULL),
(3, 2, 7, NULL, NULL),
(5, 3, 10, NULL, NULL),
(6, 4, 10, NULL, NULL),
(9, 7, 10, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `subscriptions`
--

CREATE TABLE `subscriptions` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `start_date` date NOT NULL,
  `expiry_date` date NOT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `subscriptions`
--

INSERT INTO `subscriptions` (`id`, `user_id`, `start_date`, `expiry_date`, `status`, `created_at`, `updated_at`) VALUES
(2, 4, '2026-01-14', '2026-02-14', 'active', '2026-01-14 02:34:48', '2026-01-14 02:34:48'),
(3, 5, '2026-01-14', '2026-07-14', 'active', '2026-01-14 02:40:25', '2026-01-14 02:40:25'),
(4, 6, '2026-01-14', '2026-07-14', 'active', '2026-01-14 03:41:07', '2026-01-14 03:41:07'),
(5, 10, '2026-01-19', '2027-01-19', 'active', '2026-01-19 18:05:05', '2026-01-19 18:05:05');

-- --------------------------------------------------------

--
-- Table structure for table `subscription_offers`
--

CREATE TABLE `subscription_offers` (
  `id` bigint UNSIGNED NOT NULL,
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `label` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `store_limit` int UNSIGNED DEFAULT NULL,
  `monthly_price` decimal(10,2) DEFAULT NULL,
  `is_custom` tinyint(1) NOT NULL DEFAULT '0',
  `type_label` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Standard',
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DH',
  `sort_order` int UNSIGNED NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `subscription_offers`
--

INSERT INTO `subscription_offers` (`id`, `key`, `label`, `store_limit`, `monthly_price`, `is_custom`, `type_label`, `currency`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'one_store', '1 magasin', 1, 500.00, 0, 'Standard', 'DH', 1, '2026-01-14 03:30:15', '2026-01-14 03:30:15'),
(2, 'two_stores', '2 magasins', 2, 900.00, 0, 'Premium', 'DH', 2, '2026-01-14 03:30:15', '2026-01-14 03:33:29'),
(3, 'custom', 'Premium', 3, 0.00, 1, 'Sur-devis', 'DH', 3, '2026-01-14 03:30:15', '2026-01-14 03:33:36');

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` bigint UNSIGNED NOT NULL,
  `store_id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tax_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`id`, `store_id`, `name`, `contact_name`, `email`, `phone`, `address`, `city`, `tax_id`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'GYUu', 'othy', 'othmanemakmak15@gmail.com', '0649373307', 'hjkjnl', 'Temara', '3456789', 'CFGHB', 1, '2026-01-15 21:33:04', '2026-01-15 21:33:16'),
(2, 2, 'ghjk', 'MAKROUM', 'othmanemakmak15@gmail.com', '0649373307', 'hay alaouyine, av prince mly rachid, imm 14, apt 6, Téemara', 'Temara', 'hgjj', 'hbkjj;n', 1, '2026-01-15 21:39:56', '2026-01-15 21:39:56');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `first_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `permissions` json DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `is_pending_approval` tinyint(1) NOT NULL DEFAULT '0',
  `last_login_at` timestamp NULL DEFAULT NULL,
  `owner_id` bigint UNSIGNED DEFAULT NULL,
  `max_stores` int UNSIGNED DEFAULT NULL,
  `last_store_id` bigint UNSIGNED DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `first_name`, `last_name`, `email`, `phone`, `role`, `permissions`, `is_active`, `is_pending_approval`, `last_login_at`, `owner_id`, `max_stores`, `last_store_id`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Super Admin', 'Super', 'Admin', 'superadmin@optic.local', '0708517370', 'super_admin', NULL, 1, 0, NULL, NULL, NULL, NULL, NULL, '$2y$12$UTBRIYm2Jw/zLy1yv3i19uELc4Ktlv6tKLFfad9.vokv1xw6o9vbm', NULL, '2026-01-13 23:52:44', '2026-01-20 15:58:46'),
(4, 'admin admin', 'admin', 'admin', 'admin3@optic.local', '00000000000', 'admin', NULL, 1, 0, NULL, NULL, NULL, 2, NULL, '$2y$12$urmYh0Dbc9zVBZpb2fmuYewAiTsgKb39nDW02I6RZyDI2r2S1DWoa', NULL, '2026-01-14 02:33:50', '2026-01-15 21:39:39'),
(5, 'admin admin', 'admin', 'admin', 'admin4@optic.local', '00000000000', 'admin', NULL, 1, 0, NULL, NULL, NULL, NULL, NULL, '$2y$12$8jPUbOQd839XYyx67wRrj.HgvNzK3hH/zWCuV8VjQUOM2G71h6SHK', NULL, '2026-01-14 02:38:50', '2026-01-14 02:40:25'),
(6, 'admin5 admin5', 'admin5', 'admin5', 'admin5@optic.local', '567898765', 'admin', NULL, 1, 0, NULL, NULL, 3, NULL, NULL, '$2y$12$6waXKKyAvA9cEWRwjwzUWe1nzjBtCDs7wwrJ4hBj5JZraqWlgEWPy', NULL, '2026-01-14 03:38:33', '2026-01-14 03:38:33'),
(7, 'Othmane MAKROUM', 'Othmane', 'MAKROUM', 'user@opti.local', '+212649373307', 'manager', '{\"stock\": {\"edit\": false, \"view\": false, \"create\": false, \"delete\": false, \"export\": false, \"validate\": false}, \"ventes\": {\"edit\": false, \"view\": false, \"create\": false, \"delete\": false, \"export\": false, \"validate\": false}, \"atelier\": {\"edit\": false, \"view\": false, \"create\": false, \"delete\": false, \"export\": false, \"validate\": false}, \"clients\": {\"edit\": false, \"view\": false, \"create\": false, \"delete\": false, \"export\": false, \"validate\": false}, \"factures\": {\"edit\": false, \"view\": false, \"create\": false, \"delete\": false, \"export\": false, \"validate\": false}, \"rapports\": {\"edit\": false, \"view\": false, \"create\": false, \"delete\": false, \"export\": false, \"validate\": false}, \"paiements\": {\"edit\": false, \"view\": false, \"create\": false, \"delete\": false, \"export\": false, \"validate\": false}, \"abonnement\": {\"edit\": false, \"view\": true, \"create\": true, \"delete\": false, \"export\": false, \"validate\": false}, \"parametres\": {\"edit\": false, \"view\": true, \"create\": false, \"delete\": false, \"export\": false, \"validate\": false}, \"fournisseurs\": {\"edit\": false, \"view\": false, \"create\": false, \"delete\": false, \"export\": false, \"validate\": false}, \"utilisateurs\": {\"edit\": false, \"view\": true, \"create\": false, \"delete\": false, \"export\": false, \"validate\": false}, \"bons_commande\": {\"edit\": false, \"view\": false, \"create\": false, \"delete\": false, \"export\": false, \"validate\": false}, \"prescriptions\": {\"edit\": false, \"view\": false, \"create\": false, \"delete\": false, \"export\": false, \"validate\": false}, \"bons_livraison\": {\"edit\": false, \"view\": false, \"create\": false, \"delete\": false, \"export\": false, \"validate\": false}}', 1, 0, NULL, 4, NULL, 2, NULL, '$2y$12$qH7BGDyJ85TtWC9YAnXpuuw6qT4wk00WSg5mSyQNy7i3fQWg6nbc6', NULL, '2026-01-15 22:11:39', '2026-01-16 01:04:00'),
(8, 'Othmane MAKROUM', 'Othmane', 'MAKROUM', 'othmanethemonster@gmail.com', '0649373307', 'admin', NULL, 1, 0, NULL, NULL, NULL, NULL, '2026-01-19 17:50:01', '$2y$12$FLTRgwiVdDXmCiC5N2AYju4Yt8nFYYtqTF70Z4SEI8m0UztJw78TO', NULL, '2026-01-19 17:49:02', '2026-01-19 17:54:23'),
(10, 'Othmane MAKROUM', 'Othmane', 'MAKROUM', 'othmanemakmak15@gmail.com', '0649373307', 'admin', NULL, 1, 0, NULL, NULL, 3, 3, '2026-01-19 18:03:50', '$2y$12$US/vNq0ei7K1hX2X7oZV3eRovEqt1R6Fq1XHT2kodjwKM7IJJthSm', NULL, '2026-01-19 18:03:32', '2026-01-20 15:56:55');

-- --------------------------------------------------------

--
-- Table structure for table `workshop_orders`
--

CREATE TABLE `workshop_orders` (
  `id` bigint UNSIGNED NOT NULL,
  `store_id` bigint UNSIGNED NOT NULL,
  `invoice_id` bigint UNSIGNED DEFAULT NULL,
  `invoice_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `client_id` bigint UNSIGNED DEFAULT NULL,
  `client_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `purchase_order_id` bigint UNSIGNED DEFAULT NULL,
  `purchase_order_ref` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'en_attente_verres',
  `priority` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'normal',
  `lens_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lens_treatments` json DEFAULT NULL,
  `lens_parameters` json DEFAULT NULL,
  `lens_supplier` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lens_supplier_order_ref` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lens_supplier_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lens_purchase_price` decimal(10,2) DEFAULT NULL,
  `lens_selling_price` decimal(10,2) DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `lens_received_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `delivered_at` timestamp NULL DEFAULT NULL,
  `expected_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `workshop_orders`
--

INSERT INTO `workshop_orders` (`id`, `store_id`, `invoice_id`, `invoice_number`, `client_id`, `client_name`, `purchase_order_id`, `purchase_order_ref`, `order_number`, `status`, `priority`, `lens_type`, `lens_treatments`, `lens_parameters`, `lens_supplier`, `lens_supplier_order_ref`, `lens_supplier_id`, `lens_purchase_price`, `lens_selling_price`, `notes`, `lens_received_at`, `completed_at`, `delivered_at`, `expected_date`, `created_at`, `updated_at`) VALUES
(1, 2, 3, 'GHB-260115-7501', 1, 'Othmanee MAKROUM', 2, 'BC-VRR-2601-7214', 'AT-2601-8410', 'verres_recus', 'urgent', 'progressif', '[\"antireflet\", \"photochromique\", \"polarise\"]', '{\"odPd\": 1, \"ogPd\": 3.5, \"odAxis\": 2, \"ogAxis\": 3, \"odSphere\": 2.75, \"ogSphere\": -6.25, \"odAddition\": 0.5, \"odCylinder\": 0.5, \"ogAddition\": 0.75, \"ogCylinder\": 1}', 'ghjk', 'ghbjk', '2', 90.00, 98.85, 'hjkn', '2026-01-15 21:51:22', NULL, NULL, NULL, '2026-01-15 21:51:08', '2026-01-15 21:51:22');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bank_infos`
--
ALTER TABLE `bank_infos`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `categories_store_id_name_unique` (`store_id`,`name`);

--
-- Indexes for table `clients`
--
ALTER TABLE `clients`
  ADD PRIMARY KEY (`id`),
  ADD KEY `clients_owner_id_foreign` (`owner_id`),
  ADD KEY `clients_store_id_foreign` (`store_id`);

--
-- Indexes for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `delivery_notes`
--
ALTER TABLE `delivery_notes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `delivery_notes_store_id_foreign` (`store_id`),
  ADD KEY `delivery_notes_purchase_order_id_foreign` (`purchase_order_id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `invoices_store_id_invoice_number_unique` (`store_id`,`invoice_number`),
  ADD KEY `invoices_client_id_foreign` (`client_id`),
  ADD KEY `invoices_created_by_foreign` (`created_by`);

--
-- Indexes for table `invoice_items`
--
ALTER TABLE `invoice_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `invoice_items_invoice_id_foreign` (`invoice_id`),
  ADD KEY `invoice_items_product_id_foreign` (`product_id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_user_id_foreign` (`user_id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `payments_invoice_id_foreign` (`invoice_id`);

--
-- Indexes for table `payment_requests`
--
ALTER TABLE `payment_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `payment_requests_user_id_foreign` (`user_id`),
  ADD KEY `payment_requests_processed_by_foreign` (`processed_by`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indexes for table `prescriptions`
--
ALTER TABLE `prescriptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `prescriptions_client_id_foreign` (`client_id`);

--
-- Indexes for table `pricing_configs`
--
ALTER TABLE `pricing_configs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `products_store_id_reference_unique` (`store_id`,`reference`),
  ADD KEY `products_category_id_foreign` (`category_id`);

--
-- Indexes for table `purchase_orders`
--
ALTER TABLE `purchase_orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `purchase_orders_store_id_foreign` (`store_id`),
  ADD KEY `purchase_orders_invoice_id_foreign` (`invoice_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `stock_movements_product_id_foreign` (`product_id`),
  ADD KEY `stock_movements_from_store_id_foreign` (`from_store_id`),
  ADD KEY `stock_movements_to_store_id_foreign` (`to_store_id`),
  ADD KEY `stock_movements_created_by_foreign` (`created_by`);

--
-- Indexes for table `stores`
--
ALTER TABLE `stores`
  ADD PRIMARY KEY (`id`),
  ADD KEY `stores_owner_id_foreign` (`owner_id`);

--
-- Indexes for table `store_settings`
--
ALTER TABLE `store_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `store_settings_store_id_unique` (`store_id`);

--
-- Indexes for table `store_user`
--
ALTER TABLE `store_user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `store_user_store_id_user_id_unique` (`store_id`,`user_id`),
  ADD KEY `store_user_user_id_foreign` (`user_id`);

--
-- Indexes for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `subscriptions_user_id_foreign` (`user_id`);

--
-- Indexes for table `subscription_offers`
--
ALTER TABLE `subscription_offers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `subscription_offers_key_unique` (`key`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `suppliers_store_id_foreign` (`store_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD KEY `users_owner_id_foreign` (`owner_id`),
  ADD KEY `users_last_store_id_foreign` (`last_store_id`);

--
-- Indexes for table `workshop_orders`
--
ALTER TABLE `workshop_orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `workshop_orders_store_id_foreign` (`store_id`),
  ADD KEY `workshop_orders_invoice_id_foreign` (`invoice_id`),
  ADD KEY `workshop_orders_client_id_foreign` (`client_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bank_infos`
--
ALTER TABLE `bank_infos`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `clients`
--
ALTER TABLE `clients`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `contact_messages`
--
ALTER TABLE `contact_messages`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `delivery_notes`
--
ALTER TABLE `delivery_notes`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `invoices`
--
ALTER TABLE `invoices`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `invoice_items`
--
ALTER TABLE `invoice_items`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `payment_requests`
--
ALTER TABLE `payment_requests`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `prescriptions`
--
ALTER TABLE `prescriptions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `pricing_configs`
--
ALTER TABLE `pricing_configs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `purchase_orders`
--
ALTER TABLE `purchase_orders`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `stock_movements`
--
ALTER TABLE `stock_movements`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `stores`
--
ALTER TABLE `stores`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `store_settings`
--
ALTER TABLE `store_settings`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `store_user`
--
ALTER TABLE `store_user`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `subscriptions`
--
ALTER TABLE `subscriptions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `subscription_offers`
--
ALTER TABLE `subscription_offers`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `workshop_orders`
--
ALTER TABLE `workshop_orders`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_store_id_foreign` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `clients`
--
ALTER TABLE `clients`
  ADD CONSTRAINT `clients_owner_id_foreign` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `clients_store_id_foreign` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `delivery_notes`
--
ALTER TABLE `delivery_notes`
  ADD CONSTRAINT `delivery_notes_purchase_order_id_foreign` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `delivery_notes_store_id_foreign` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `invoices_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `invoices_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `invoices_store_id_foreign` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `invoice_items`
--
ALTER TABLE `invoice_items`
  ADD CONSTRAINT `invoice_items_invoice_id_foreign` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `invoice_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_invoice_id_foreign` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payment_requests`
--
ALTER TABLE `payment_requests`
  ADD CONSTRAINT `payment_requests_processed_by_foreign` FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `payment_requests_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `prescriptions`
--
ALTER TABLE `prescriptions`
  ADD CONSTRAINT `prescriptions_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `products_store_id_foreign` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `purchase_orders`
--
ALTER TABLE `purchase_orders`
  ADD CONSTRAINT `purchase_orders_invoice_id_foreign` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `purchase_orders_store_id_foreign` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD CONSTRAINT `stock_movements_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `stock_movements_from_store_id_foreign` FOREIGN KEY (`from_store_id`) REFERENCES `stores` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `stock_movements_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `stock_movements_to_store_id_foreign` FOREIGN KEY (`to_store_id`) REFERENCES `stores` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `stores`
--
ALTER TABLE `stores`
  ADD CONSTRAINT `stores_owner_id_foreign` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `store_settings`
--
ALTER TABLE `store_settings`
  ADD CONSTRAINT `store_settings_store_id_foreign` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `store_user`
--
ALTER TABLE `store_user`
  ADD CONSTRAINT `store_user_store_id_foreign` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `store_user_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD CONSTRAINT `subscriptions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD CONSTRAINT `suppliers_store_id_foreign` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_last_store_id_foreign` FOREIGN KEY (`last_store_id`) REFERENCES `stores` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `users_owner_id_foreign` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `workshop_orders`
--
ALTER TABLE `workshop_orders`
  ADD CONSTRAINT `workshop_orders_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `workshop_orders_invoice_id_foreign` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `workshop_orders_store_id_foreign` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
