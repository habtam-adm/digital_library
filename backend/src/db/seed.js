// Seeds Wolkite University colleges, departments, demo accounts and a starter
// catalogue. Safe to run repeatedly.
const bcrypt = require("bcryptjs");
const { pool, query, queryOne } = require("../config/db");
const { gregorianYearToEthiopianYear } = require("../utils/ethiopianDate");

const COLLEGES = [
  {
    code: "CCI",
    name_en: "College of Computing and Informatics",
    name_am: "የኮምፒውቲንግና ኢንፎርማቲክስ ኮሌጅ",
    departments: [
      ["CS", "Computer Science", "ኮምፒውተር ሳይንስ"],
      ["SE", "Software Engineering", "ሶፍትዌር ኢንጅነሪንግ"],
      ["IT", "Information Technology", "ኢንፎርሜሽን ቴክኖሎጂ"],
      ["IS", "Information Systems", "ኢንፎርሜሽን ሲስተምስ"],
    ],
  },
  {
    code: "CET",
    name_en: "College of Engineering and Technology",
    name_am: "የምህንድስናና ቴክኖሎጂ ኮሌጅ",
    departments: [
      ["CIV", "Civil Engineering", "ሲቪል ምህንድስና"],
      ["ELE", "Electrical and Computer Engineering", "ኤሌክትሪካልና ኮምፒውተር ምህንድስና"],
      ["MEC", "Mechanical Engineering", "ሜካኒካል ምህንድስና"],
      ["ARC", "Architecture", "አርክቴክቸር"],
    ],
  },
  {
    code: "CNCS",
    name_en: "College of Natural and Computational Sciences",
    name_am: "የተፈጥሮና ሒሳባዊ ሳይንስ ኮሌጅ",
    departments: [
      ["BIO", "Biology", "ባዮሎጂ"],
      ["CHE", "Chemistry", "ኬሚስትሪ"],
      ["PHY", "Physics", "ፊዚክስ"],
      ["MAT", "Mathematics", "ሒሳብ"],
      ["STA", "Statistics", "ስታስቲክስ"],
    ],
  },
  {
    code: "CBE",
    name_en: "College of Business and Economics",
    name_am: "የቢዝነስና ኢኮኖሚክስ ኮሌጅ",
    departments: [
      ["ACC", "Accounting and Finance", "አካውንቲንግና ፋይናንስ"],
      ["MGT", "Management", "ማኔጅመንት"],
      ["ECO", "Economics", "ኢኮኖሚክስ"],
      ["MKT", "Marketing Management", "ማርኬቲንግ ማኔጅመንት"],
    ],
  },
  {
    code: "CMHS",
    name_en: "College of Medicine and Health Sciences",
    name_am: "የሕክምናና ጤና ሳይንስ ኮሌጅ",
    departments: [
      ["NUR", "Nursing", "ነርሲንግ"],
      ["MID", "Midwifery", "ሚድዋይፈሪ"],
      ["PUB", "Public Health", "የሕዝብ ጤና"],
      ["MED", "Medicine", "ሕክምና"],
    ],
  },
  {
    code: "CANR",
    name_en: "College of Agriculture and Natural Resources",
    name_am: "የግብርናና የተፈጥሮ ሀብት ኮሌጅ",
    departments: [
      ["PLS", "Plant Science", "የእጽዋት ሳይንስ"],
      ["ANS", "Animal Science", "የእንስሳት ሳይንስ"],
      ["NRM", "Natural Resource Management", "የተፈጥሮ ሀብት አስተዳደር"],
    ],
  },
  {
    code: "CSSH",
    name_en: "College of Social Sciences and Humanities",
    name_am: "የማህበራዊ ሳይንስና ሂዩማኒቲስ ኮሌጅ",
    departments: [
      ["ENG", "English Language and Literature", "እንግሊዝኛ ቋንቋና ስነ ጽሁፍ"],
      ["SOC", "Sociology", "ሶሺዮሎጂ"],
      ["GEO", "Geography and Environmental Studies", "ጂኦግራፊና የአካባቢ ጥናት"],
      ["HIS", "History and Heritage Management", "ታሪክና የቅርስ አስተዳደር"],
    ],
  },
  {
    code: "SOL",
    name_en: "School of Law",
    name_am: "የሕግ ትምህርት ቤት",
    departments: [["LAW", "Law", "ሕግ"]],
  },
];

const USERS = [
  {
    full_name: "Library Administrator",
    email: "admin@wku.edu.et",
    password: "Admin@123",
    role: "admin",
    university_id: "WKU/ADM/01",
  },
  {
    full_name: "Tigist Bekele",
    email: "librarian@wku.edu.et",
    password: "Library@123",
    role: "librarian",
    university_id: "WKU/LIB/07",
  },
  {
    full_name: "Dr. Alemu Tadesse",
    email: "instructor@wku.edu.et",
    password: "Teach@123",
    role: "instructor",
    university_id: "WKU/INS/22",
    department_code: "CS",
  },
  {
    full_name: "Hanna Girma",
    email: "student@wku.edu.et",
    password: "Student@123",
    role: "student",
    university_id: "WKU/1234/15",
    department_code: "SE",
  },
];

const RESOURCES = [
  {
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen",
    publisher: "MIT Press",
    publication_year: 2022,
    isbn: "9780262046305",
    resource_type: "book",
    department_code: "CS",
    subject: "Algorithms",
    keywords: "algorithms, data structures, complexity",
    abstract:
      "A comprehensive reference on algorithms, used for the Data Structures and Algorithms course.",
    total_copies: 8,
    shelf_location: "CS-A-12",
  },
  {
    title: "Clean Code: A Handbook of Agile Software Craftsmanship",
    author: "Robert C. Martin",
    publisher: "Prentice Hall",
    publication_year: 2019,
    isbn: "9780132350884",
    resource_type: "book",
    department_code: "SE",
    subject: "Software Engineering",
    keywords: "clean code, refactoring, craftsmanship",
    abstract: "Practices for writing readable and maintainable software.",
    total_copies: 5,
    shelf_location: "SE-B-03",
  },
  {
    title: "Software Engineering Module for Third Year Students",
    title_am: "የሶፍትዌር ኢንጅነሪንግ ሞጁል",
    author: "Wolkite University, Department of Software Engineering",
    publisher: "Wolkite University",
    publication_year: 2024,
    resource_type: "module",
    department_code: "SE",
    subject: "Software Engineering",
    keywords: "module, harmonized curriculum",
    abstract:
      "Harmonised teaching module prepared by the department following the Ministry of Education curriculum.",
    total_copies: 0,
  },
  {
    title:
      "Design and Implementation of an Offline-First Digital Library for Ethiopian Universities",
    author: "Habtamu Admasu",
    publisher: "Wolkite University",
    publication_year: 2025,
    resource_type: "thesis",
    department_code: "SE",
    subject: "Information Systems",
    keywords: "digital library, offline first, low bandwidth, Ethiopia",
    abstract:
      "An undergraduate thesis proposing a low bandwidth digital library architecture for Ethiopian higher education institutions.",
    total_copies: 1,
  },
  {
    title: "Database Systems: The Complete Book",
    author: "Hector Garcia-Molina",
    publisher: "Pearson",
    publication_year: 2013,
    isbn: "9780131873254",
    resource_type: "book",
    department_code: "IS",
    subject: "Databases",
    keywords: "sql, relational model, transactions",
    abstract: "Covers relational design, query processing and transaction management.",
    total_copies: 6,
    shelf_location: "IS-C-08",
  },
  {
    title: "Computer Networks",
    author: "Andrew S. Tanenbaum",
    publisher: "Pearson",
    publication_year: 2021,
    isbn: "9780132126953",
    resource_type: "book",
    department_code: "IT",
    subject: "Networking",
    keywords: "tcp/ip, routing, network security",
    abstract: "Reference text for the Computer Networks course.",
    total_copies: 4,
    shelf_location: "IT-A-02",
  },
  {
    title: "Data Structures and Algorithms Final Exam 2016 E.C.",
    author: "Department of Computer Science",
    publisher: "Wolkite University",
    publication_year: 2024,
    resource_type: "exam",
    department_code: "CS",
    subject: "Algorithms",
    keywords: "past exam, final, DSA",
    abstract: "Past final examination paper with the marking guide.",
    total_copies: 0,
  },
  {
    title: "Structural Analysis",
    author: "R. C. Hibbeler",
    publisher: "Pearson",
    publication_year: 2020,
    isbn: "9780134610672",
    resource_type: "book",
    department_code: "CIV",
    subject: "Structures",
    keywords: "beams, trusses, structural analysis",
    abstract: "Analysis of statically determinate and indeterminate structures.",
    total_copies: 5,
    shelf_location: "CIV-D-11",
  },
  {
    title: "Assessment of Water Supply Coverage in Wolkite Town",
    author: "Selamawit Fikru",
    publisher: "Wolkite University",
    publication_year: 2023,
    resource_type: "thesis",
    department_code: "CIV",
    subject: "Water Resources",
    keywords: "water supply, Gurage zone, urban infrastructure",
    abstract:
      "A study of the potable water supply coverage and distribution losses in Wolkite town.",
    total_copies: 1,
  },
  {
    title: "Fundamentals of Electric Circuits",
    author: "Charles K. Alexander",
    publisher: "McGraw-Hill",
    publication_year: 2017,
    isbn: "9780078028229",
    resource_type: "book",
    department_code: "ELE",
    subject: "Electrical Engineering",
    keywords: "circuits, ac analysis, laplace",
    abstract: "Circuit analysis text used across the engineering programmes.",
    total_copies: 7,
    shelf_location: "ELE-B-05",
  },
  {
    title: "Principles of Accounting",
    title_am: "የሂሳብ አያያዝ መሰረታዊ መርሆች",
    author: "Belverd E. Needles",
    publisher: "Cengage",
    publication_year: 2018,
    isbn: "9781285055817",
    resource_type: "book",
    department_code: "ACC",
    subject: "Accounting",
    keywords: "accounting cycle, financial statements",
    abstract: "Introductory accounting text used in the first year business programme.",
    total_copies: 9,
    shelf_location: "ACC-A-01",
  },
  {
    title: "Ethiopian Economy: Growth and Transformation",
    title_am: "የኢትዮጵያ ኢኮኖሚ፡ እድገትና ሽግግር",
    author: "Alemayehu Geda",
    publisher: "Addis Ababa University Press",
    publication_year: 2021,
    language: "en",
    resource_type: "book",
    department_code: "ECO",
    subject: "Economics",
    keywords: "Ethiopian economy, macroeconomics, development",
    abstract:
      "Analyses the structure and transformation of the Ethiopian economy over recent decades.",
    total_copies: 4,
    shelf_location: "ECO-C-14",
  },
  {
    title: "የኢትዮጵያ ታሪክ ከጥንት እስከ ዘመናዊ ዘመን",
    title_am: "የኢትዮጵያ ታሪክ ከጥንት እስከ ዘመናዊ ዘመን",
    author: "ተክለ ጻድቅ መኩሪያ",
    publisher: "ኩራዝ አሳታሚ ድርጅት",
    publication_year: 2015,
    language: "am",
    resource_type: "book",
    department_code: "HIS",
    subject: "History",
    keywords: "ታሪክ, ኢትዮጵያ, ቅርስ",
    abstract: "የኢትዮጵያን ታሪክ ከጥንት ጀምሮ የሚዳስስ መጽሐፍ።",
    total_copies: 3,
    shelf_location: "HIS-A-09",
  },
  {
    title: "Community Health Nursing in Ethiopia",
    author: "Ministry of Health of Ethiopia",
    publisher: "Federal Ministry of Health",
    publication_year: 2022,
    resource_type: "reference",
    department_code: "NUR",
    subject: "Public Health",
    keywords: "community health, primary care, health extension",
    abstract:
      "National reference material on community health nursing and the health extension programme.",
    total_copies: 6,
    shelf_location: "NUR-B-04",
  },
  {
    title: "Prevalence of Malaria in the Gurage Zone: A Cross-Sectional Study",
    author: "Yonas Mekonnen",
    publisher: "Wolkite University",
    publication_year: 2024,
    resource_type: "thesis",
    department_code: "PUB",
    subject: "Public Health",
    keywords: "malaria, Gurage zone, epidemiology",
    abstract:
      "Cross-sectional study on malaria prevalence and associated factors in the Gurage Zone.",
    total_copies: 1,
  },
  {
    title: "Soil Fertility Management for Enset Production",
    author: "Getachew Wolde",
    publisher: "Wolkite University",
    publication_year: 2023,
    resource_type: "journal",
    department_code: "PLS",
    subject: "Agronomy",
    keywords: "enset, soil fertility, Gurage",
    abstract:
      "Journal article on soil fertility practices for enset, the staple crop of the Gurage zone.",
    total_copies: 0,
  },
  {
    title: "Organic Chemistry",
    author: "Paula Yurkanis Bruice",
    publisher: "Pearson",
    publication_year: 2016,
    isbn: "9780134042282",
    resource_type: "book",
    department_code: "CHE",
    subject: "Chemistry",
    keywords: "organic chemistry, reactions, mechanisms",
    abstract: "Standard organic chemistry text for the natural sciences programme.",
    total_copies: 5,
    shelf_location: "CHE-A-06",
  },
  {
    title: "Calculus for Engineers",
    author: "Donald Trim",
    publisher: "Pearson",
    publication_year: 2019,
    isbn: "9780130850355",
    resource_type: "book",
    department_code: "MAT",
    subject: "Mathematics",
    keywords: "calculus, differential equations",
    abstract: "Applied calculus text for engineering students.",
    total_copies: 10,
    shelf_location: "MAT-A-01",
  },
  {
    title: "The Constitution of the Federal Democratic Republic of Ethiopia",
    title_am: "የኢትዮጵያ ፌዴራላዊ ዲሞክራሲያዊ ሪፐብሊክ ሕገ መንግሥት",
    author: "Federal Negarit Gazeta",
    publisher: "Federal Negarit Gazeta",
    publication_year: 1995,
    language: "am",
    resource_type: "reference",
    department_code: "LAW",
    subject: "Constitutional Law",
    keywords: "ሕገ መንግሥት, ሕግ, ፌዴራሊዝም",
    abstract: "The full text of the Ethiopian federal constitution.",
    total_copies: 4,
    shelf_location: "LAW-A-01",
  },
  {
    title: "Research Methods in Education",
    author: "Louis Cohen",
    publisher: "Routledge",
    publication_year: 2018,
    isbn: "9781138209886",
    resource_type: "book",
    department_code: "ENG",
    subject: "Research Methods",
    keywords: "research design, qualitative, quantitative",
    abstract: "Guide to research design for undergraduate and postgraduate projects.",
    total_copies: 6,
    shelf_location: "ENG-C-02",
  },
];

async function seedColleges() {
  const departmentIds = {};
  for (const college of COLLEGES) {
    await query(
      `INSERT INTO colleges (code, name_en, name_am) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE name_en = VALUES(name_en), name_am = VALUES(name_am)`,
      [college.code, college.name_en, college.name_am],
    );
    const { id: collegeId } = await queryOne("SELECT id FROM colleges WHERE code = ?", [
      college.code,
    ]);
    for (const [code, nameEn, nameAm] of college.departments) {
      await query(
        `INSERT INTO departments (college_id, code, name_en, name_am) VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name_en = VALUES(name_en), name_am = VALUES(name_am),
                                 college_id = VALUES(college_id)`,
        [collegeId, code, nameEn, nameAm],
      );
      const department = await queryOne("SELECT id FROM departments WHERE code = ?", [
        code,
      ]);
      departmentIds[code] = { id: department.id, collegeId };
    }
  }
  return departmentIds;
}

async function seedUsers(departmentIds) {
  for (const user of USERS) {
    const hash = await bcrypt.hash(user.password, 10);
    const department = user.department_code ? departmentIds[user.department_code] : null;
    await query(
      `INSERT INTO users (full_name, email, password_hash, role, university_id, department_id, is_verified)
       VALUES (?, ?, ?, ?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), role = VALUES(role),
                               password_hash = VALUES(password_hash), is_verified = 1`,
      [
        user.full_name,
        user.email,
        hash,
        user.role,
        user.university_id,
        department ? department.id : null,
      ],
    );
  }
}

async function seedResources(departmentIds) {
  const librarian = await queryOne("SELECT id FROM users WHERE email = ?", [
    "librarian@wku.edu.et",
  ]);
  for (const resource of RESOURCES) {
    const existing = await queryOne(
      "SELECT id FROM resources WHERE title = ? AND author = ?",
      [resource.title, resource.author],
    );
    if (existing) continue;

    const department = departmentIds[resource.department_code];
    const copies = resource.total_copies ?? 1;
    await query(
      `INSERT INTO resources
        (title, title_am, author, publisher, publication_year, publication_year_ec, isbn,
         language, resource_type, college_id, department_id, subject, abstract, keywords,
         shelf_location, total_copies, available_copies, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        resource.title,
        resource.title_am || null,
        resource.author,
        resource.publisher || null,
        resource.publication_year || null,
        resource.publication_year
          ? gregorianYearToEthiopianYear(resource.publication_year)
          : null,
        resource.isbn || null,
        resource.language || "en",
        resource.resource_type,
        department ? department.collegeId : null,
        department ? department.id : null,
        resource.subject || null,
        resource.abstract || null,
        resource.keywords || null,
        resource.shelf_location || null,
        copies,
        copies,
        librarian ? librarian.id : null,
      ],
    );
  }
}

async function seed() {
  const departmentIds = await seedColleges();
  await seedUsers(departmentIds);
  await seedResources(departmentIds);

  const counts = await queryOne(
    `SELECT (SELECT COUNT(*) FROM colleges) AS colleges,
            (SELECT COUNT(*) FROM departments) AS departments,
            (SELECT COUNT(*) FROM users) AS users,
            (SELECT COUNT(*) FROM resources) AS resources`,
  );
  console.log("Seeded:", counts);
  await pool.end();
}

seed().catch(async (err) => {
  console.error("Seeding failed:", err.message);
  await pool.end();
  process.exit(1);
});
