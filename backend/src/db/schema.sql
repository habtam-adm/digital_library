-- Wolkite University Digital Library - database schema
-- MySQL 8 / MariaDB 10.4+ (XAMPP compatible)

CREATE TABLE IF NOT EXISTS colleges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  name_en VARCHAR(150) NOT NULL,
  name_am VARCHAR(150) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  college_id INT NOT NULL,
  code VARCHAR(20) NOT NULL UNIQUE,
  name_en VARCHAR(150) NOT NULL,
  name_am VARCHAR(150) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_department_college FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student','instructor','librarian','admin') NOT NULL DEFAULT 'student',
  -- Wolkite University ID, e.g. WKU/1234/15
  university_id VARCHAR(40) DEFAULT NULL,
  department_id INT DEFAULT NULL,
  phone VARCHAR(30) DEFAULT NULL,
  is_verified TINYINT(1) NOT NULL DEFAULT 0,
  verification_code VARCHAR(10) DEFAULT NULL,
  reset_code VARCHAR(10) DEFAULT NULL,
  reset_expires_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS resources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  title_am VARCHAR(300) DEFAULT NULL,
  author VARCHAR(255) NOT NULL,
  publisher VARCHAR(200) DEFAULT NULL,
  publication_year SMALLINT DEFAULT NULL,
  -- Ethiopian calendar year of publication (E.C.), kept alongside the Gregorian year
  publication_year_ec SMALLINT DEFAULT NULL,
  isbn VARCHAR(30) DEFAULT NULL,
  language ENUM('en','am','or','ti','other') NOT NULL DEFAULT 'en',
  resource_type ENUM('book','thesis','journal','module','exam','reference') NOT NULL DEFAULT 'book',
  college_id INT DEFAULT NULL,
  department_id INT DEFAULT NULL,
  subject VARCHAR(150) DEFAULT NULL,
  abstract TEXT,
  keywords VARCHAR(300) DEFAULT NULL,
  edition VARCHAR(50) DEFAULT NULL,
  pages INT DEFAULT NULL,
  cover_url VARCHAR(500) DEFAULT NULL,
  file_path VARCHAR(300) DEFAULT NULL,
  file_size INT DEFAULT NULL,
  shelf_location VARCHAR(80) DEFAULT NULL,
  total_copies INT NOT NULL DEFAULT 1,
  available_copies INT NOT NULL DEFAULT 1,
  download_count INT NOT NULL DEFAULT 0,
  view_count INT NOT NULL DEFAULT 0,
  uploaded_by INT DEFAULT NULL,
  is_deleted TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_resource_college FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE SET NULL,
  CONSTRAINT fk_resource_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  CONSTRAINT fk_resource_uploader FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_resource_title (title),
  INDEX idx_resource_author (author),
  INDEX idx_resource_type (resource_type),
  INDEX idx_resource_department (department_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS loans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  resource_id INT NOT NULL,
  borrowed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  due_at DATETIME NOT NULL,
  returned_at DATETIME DEFAULT NULL,
  fine_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  CONSTRAINT fk_loan_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_loan_resource FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
  INDEX idx_loan_user (user_id),
  INDEX idx_loan_open (returned_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
