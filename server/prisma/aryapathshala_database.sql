-- Arya Pathshala MySQL Full Database Dump for Hostinger
-- Generated for: u505758403_aryapathshala

SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------
-- Table structure for users
-- --------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `phone` VARCHAR(191) NULL,
  `password` VARCHAR(191) NOT NULL,
  `role` ENUM('STUDENT', 'TEACHER', 'ADMIN') NOT NULL DEFAULT 'STUDENT',
  `city` VARCHAR(191) NULL,
  `qualification` VARCHAR(191) NULL,
  `avatar` VARCHAR(191) NULL DEFAULT '🕉️',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for courses
-- --------------------------------------------------------
DROP TABLE IF EXISTS `courses`;
CREATE TABLE `courses` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(191) NOT NULL UNIQUE,
  `title` VARCHAR(191) NOT NULL,
  `description` TEXT NOT NULL,
  `category` VARCHAR(191) NOT NULL,
  `level` VARCHAR(191) NOT NULL,
  `duration` VARCHAR(191) NOT NULL,
  `mode` VARCHAR(191) NOT NULL DEFAULT 'ऑनलाइन (सप्ताहांत)',
  `instructor` VARCHAR(191) NOT NULL,
  `studentsCount` INT NOT NULL DEFAULT 0,
  `rating` DOUBLE NOT NULL DEFAULT 4.9,
  `image` VARCHAR(191) NOT NULL,
  `featured` BOOLEAN NOT NULL DEFAULT FALSE,
  `isPublished` BOOLEAN NOT NULL DEFAULT TRUE,
  `syllabus` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for enrollments
-- --------------------------------------------------------
DROP TABLE IF EXISTS `enrollments`;
CREATE TABLE `enrollments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userId` INT NOT NULL,
  `courseId` INT NOT NULL,
  `status` ENUM('ACTIVE', 'COMPLETED', 'PAUSED') NOT NULL DEFAULT 'ACTIVE',
  `progressPercent` INT NOT NULL DEFAULT 0,
  `enrolledAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `enrollments_userId_courseId_key` (`userId`, `courseId`),
  CONSTRAINT `enrollments_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `enrollments_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for library_books
-- --------------------------------------------------------
DROP TABLE IF EXISTS `library_books`;
CREATE TABLE `library_books` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(191) NOT NULL,
  `author` VARCHAR(191) NOT NULL,
  `category` VARCHAR(191) NOT NULL,
  `description` TEXT NOT NULL,
  `coverImage` VARCHAR(191) NOT NULL,
  `pdfUrl` VARCHAR(191) NOT NULL,
  `views` INT NOT NULL DEFAULT 0,
  `downloads` INT NOT NULL DEFAULT 0,
  `isFree` BOOLEAN NOT NULL DEFAULT TRUE,
  `isPublished` BOOLEAN NOT NULL DEFAULT TRUE,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for notices
-- --------------------------------------------------------
DROP TABLE IF EXISTS `notices`;
CREATE TABLE `notices` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(191) NOT NULL,
  `content` TEXT NOT NULL,
  `type` VARCHAR(191) NOT NULL DEFAULT 'सामान्य सूचना',
  `isImportant` BOOLEAN NOT NULL DEFAULT FALSE,
  `isPublished` BOOLEAN NOT NULL DEFAULT TRUE,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for contacts
-- --------------------------------------------------------
DROP TABLE IF EXISTS `contacts`;
CREATE TABLE `contacts` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(191) NULL,
  `city` VARCHAR(191) NULL,
  `message` TEXT NOT NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'NEW',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for live_sessions
-- --------------------------------------------------------
DROP TABLE IF EXISTS `live_sessions`;
CREATE TABLE `live_sessions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `courseId` INT NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `scheduledAt` DATETIME(3) NOT NULL,
  `durationMin` INT NOT NULL DEFAULT 60,
  `meetingLink` VARCHAR(191) NULL,
  `recordingUrl` VARCHAR(191) NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'SCHEDULED',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  CONSTRAINT `live_sessions_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for doubts
-- --------------------------------------------------------
DROP TABLE IF EXISTS `doubts`;
CREATE TABLE `doubts` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userId` INT NOT NULL,
  `courseId` INT NOT NULL,
  `question` TEXT NOT NULL,
  `answer` TEXT NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  CONSTRAINT `doubts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `doubts_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Initial Data: Users (Admin, Teacher, Student)
-- --------------------------------------------------------
INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password`, `role`, `city`, `qualification`, `avatar`) VALUES
(1, 'स्वामी धर्मानन्द सरस्वती (Admin)', 'admin@aryapathshala.com', '+91 98765 43210', '$2a$10$3z7i7yMhI92aD1tB80j59.VlM9sA.83Y.ZJ7zH2k7iG9K0wO8e7wS', 'ADMIN', 'हरिद्वार, उत्तराखण्ड', 'आचार्य, दर्शन एवं व्याकरण', '👑'),
(2, 'आचार्य वेदप्रकाश शास्त्री', 'teacher@aryapathshala.com', '+91 98765 43211', '$2a$10$3z7i7yMhI92aD1tB80j59.VlM9sA.83Y.ZJ7zH2k7iG9K0wO8e7wS', 'TEACHER', 'वाराणसी, उत्तर प्रदेश', 'एम.ए. संस्कृत, व्याकरण', '🕉️'),
(3, 'राम शर्मा (विद्यार्थी)', 'student@aryapathshala.com', '+91 98765 43212', '$2a$10$3z7i7yMhI92aD1tB80j59.VlM9sA.83Y.ZJ7zH2k7iG9K0wO8e7wS', 'STUDENT', 'नई दिल्ली', 'बी.ए. संस्कृत द्वितीय वर्ष', '🎓');

-- --------------------------------------------------------
-- Initial Data: Live Courses
-- --------------------------------------------------------
INSERT INTO `courses` (`id`, `slug`, `title`, `description`, `category`, `level`, `duration`, `mode`, `instructor`, `studentsCount`, `rating`, `image`, `featured`, `isPublished`, `syllabus`) VALUES
(1, 'rigveda-bhashya-bhumika', 'ऋग्वेद-भाष्य भूमिका एवं परिचय', 'महर्षि दयानन्द सरस्वती कृत ऋग्वेद-भाष्य भूमिका का गहन अनुशीलन, वेदार्थ प्रक्रिया एवं मन्त्र विचार।', 'वेद अध्ययन (Vedas)', 'मध्यम (Intermediate)', '६ मास (6 Months)', 'ऑनलाइन (सप्ताहांत)', 'आचार्य वेदप्रकाश शास्त्री', 1, 4.95, '/images/Rigveda.jpg', 1, 1, 'प्रस्तावना एवं मंगलाचरण\nप्रथम मण्डल: मूल पाठ एवं अन्वय\nपारम्परिक भाष्य एवं आधुनिक संदर्भ\nअभ्यास प्रश्नमाला एवं स्व-मूल्यांकन'),
(2, 'upanishad-darshan', 'दशोपनिषद् सार एवं चिन्तन', 'ईश, केन, कठ, मुण्डक, माण्डूक्य आदि उपनिषदों का तात्त्विक एवं दार्शनिक अध्ययन।', 'उपनिषद् (Upanishads)', 'उच्च (Advanced)', '४ मास (4 Months)', 'ऑनलाइन (दैनिक)', 'डॉ. विद्याधर आर्य', 1, 4.98, '/images/Upanishad.jpg', 1, 1, 'ईशावास्योपनिषद्\nकेनोपनिषद्\nकठोपनिषद्\nमुण्डकोपनिषद्'),
(3, 'sanskrit-vyakarana-prathama', 'पाणिनीय संस्कृत व्याकरण प्रवेशिका', 'लघुसिद्धान्तकौमुदी आधारित प्रत्याहार, सन्धि, सुबन्त एवं तिङन्त प्रकरणों का सोदाहरण अभ्यास।', 'व्याकरण (Grammar)', 'प्रारम्भिक (Beginner)', '३ मास (3 Months)', 'ऑनलाइन (सांध्य)', 'पण्डित देवदत्त शास्त्री', 1, 4.92, '/images/Vyakarana.jpg', 1, 1, 'माहेश्वर सूत्राणि एवं प्रत्याहार रचना\nअच् सन्धि एवं हल् सन्धि प्रकरण\nसुबन्त पद निर्माण एवं कारक विचार\nतिङन्त धातु रूप एवं लकार प्रयोग'),
(4, 'shrimad-bhagavad-gita', 'श्रीमद्भगवद्गीता तत्त्व-ज्ञान', 'अष्टादश अध्यायों का तात्त्विक, निष्काम कर्मयोग एवं भक्ति योग परक वैज्ञानिक व्याख्यान।', 'दर्शन (Philosophy)', 'मध्यम (Intermediate)', '५ मास (5 Months)', 'ऑनलाइन (सप्ताहांत)', 'स्वामी धर्मानन्द सरस्वती', 0, 4.96, '/images/Gita.jpg', 0, 1, 'अर्जुनविषादयोग एवं सांख्ययोग\nकर्मयोग एवं ज्ञानकर्मसंन्यासयोग\nआत्मसंयमयोग एवं अक्षरब्रह्मयोग\nमोक्षसंन्यासयोग उपसंहार');

-- --------------------------------------------------------
-- Initial Data: Library Books
-- --------------------------------------------------------
INSERT INTO `library_books` (`id`, `title`, `author`, `category`, `description`, `coverImage`, `pdfUrl`, `views`, `downloads`, `isFree`, `isPublished`) VALUES
(1, 'ऋग्वेद संहिता (पदपाठ व अन्वय सहित)', 'महर्षि दयानन्द सरस्वती', 'वेद (Vedas)', 'सम्पूर्ण ऋग्वेद का दयानन्द भाष्य, पदपाठ, स्वर-प्रक्रिया एवं मन्त्रार्थ सहित प्रामाणिक संस्करण।', '/images/Rigveda.jpg', 'https://archive.org/details/rigveda-bhashya', 0, 0, 1, 1),
(2, 'सत्यार्थ प्रकाश (Navin Sanskaran)', 'महर्षि दयानन्द सरस्वती', 'दर्शन (Philosophy)', 'चतुर्दश समुल्लासों में वैदिक दर्शन, समाज व्यवस्था, मत-मतान्तर समीक्षा एवं मानव धर्म का अमूल्य ग्रन्थ।', '/images/Satyarth_Prakash.jpg', 'https://archive.org/details/satyarth-prakash', 0, 0, 1, 1),
(3, 'संस्कार विधि', 'महर्षि दयानन्द सरस्वती', 'कर्मकाण्ड एवं संस्कार', 'गर्भाधान से अन्त्येष्टि पर्यन्त षोडश संस्कारों की प्रामाणिक वैदिक पद्धति एवं मन्त्र संग्रह।', '/images/Sanskar_Vidhi.jpg', 'https://archive.org/details/sanskar-vidhi', 0, 0, 1, 1),
(4, 'लघुसिद्धान्तकौमुदी (हिन्दी व्याख्या)', 'वरदराजाचार्य', 'व्याकरण (Grammar)', 'पाणिनीय अष्टाध्यायी का सुबोध प्रवेश ग्रन्थ, सन्धि, समास एवं कारक सोदाहरण स्पष्ट।', '/images/Vyakarana.jpg', 'https://archive.org/details/laghusiddhantakaumudi', 0, 0, 1, 1),
(5, 'दशोपनिषद् (शंकरभाष्य सहित)', 'ऋषिगण एवं आदि शंकराचार्य', 'उपनिषद् (Upanishads)', 'प्रमुख दस उपनिषदों का मूल पाठ, अन्वय एवं सरल भाष्य।', '/images/Upanishad.jpg', 'https://archive.org/details/ten-principal-upanishads', 0, 0, 1, 1),
(6, 'अष्टाध्यायी सूत्रपाठ', 'महर्षि पाणिनि', 'व्याकरण (Grammar)', 'संस्कृत व्याकरण का मूल संविधान, अष्ट अध्यायों में सूत्रों का प्रामाणिक पाठ।', '/images/Vyakarana.jpg', 'https://archive.org/details/ashtadhyayi-panini', 0, 0, 1, 1);

-- --------------------------------------------------------
-- Initial Data: Notices
-- --------------------------------------------------------
INSERT INTO `notices` (`id`, `title`, `content`, `type`, `isImportant`, `isPublished`) VALUES
(1, 'सत्र 2026-27 वेद एवं संस्कृत डिप्लोमा पञ्जीकरण प्रारम्भ', 'आर्य पाठशाला के समस्त वेद, व्याकरण एवं दर्शन पाठ्यक्रमों में नवीन सत्र हेतु प्रवेश प्रारम्भ हो चुके हैं। इच्छुक शिक्षार्थी पोर्टल पर ऑनलाइन आवेदन कर सकते हैं।', 'नवीन पाठ्यक्रम', 1, 1),
(2, 'यूजीसी नेट (UGC-NET) संस्कृत 25 व 73 कोड विशेष कार्यशाला', 'आगामी नेट-जेआरएफ परीक्षा हेतु निःशुल्क ऑनलाइन प्रश्नोत्तरी एवं विशेष मार्गदर्शन सत्र आगामी रविवार प्रातः 10:00 बजे आयोजित होगा।', 'परीक्षा सूचना', 1, 1),
(3, 'डिजिटल ग्रन्थागार (e-Library) में नवीन ग्रन्थों का संकलन', 'आर्य पाठशाला ग्रन्थागार में महर्षि दयानन्द कृत वेदभाष्य एवं शतपथ ब्राह्मण के दुर्लभ ग्रन्थ PDF प्रारूप में अध्ययन हेतु जोड़े गए हैं।', 'महत्वपूर्ण सूचना', 0, 1);

-- --------------------------------------------------------
-- Initial Data: Student Enrollment
-- --------------------------------------------------------
INSERT INTO `enrollments` (`userId`, `courseId`, `status`, `progressPercent`) VALUES
(3, 1, 'ACTIVE', 35),
(3, 2, 'ACTIVE', 60),
(3, 3, 'ACTIVE', 10);

SET FOREIGN_KEY_CHECKS = 1;
