
import { EmployeeData } from '@/types/employee';

export const companyEmployeesData: EmployeeData[] = [
  // HR
  {
    name: "Aarti Sharma",
    email: "aarti.sharma@company.in",
    role: "hr",
    department: "Human Resources",
    designation: "HR Administrator",
    manager: null,
    salary: 103500,
    date_of_joining: "2023-01-15",
    bankDetails: {
      bank_name: "State Bank of India",
      account_number: "12345678901",
      ifsc_code: "SBIN0001234",
      pan_number: "ABCDE1234F",
      uan_number: "123456789012",
      aadhaar_number: "123456789012"
    }
  },
  // Managers
  {
    name: "Rohan Mehta",
    email: "rohan.mehta@company.in",
    role: "manager",
    department: "Engineering",
    designation: "Engineering Manager",
    manager: null,
    salary: 135500,
    date_of_joining: "2022-08-10",
    bankDetails: {
      bank_name: "HDFC Bank",
      account_number: "23456789012",
      ifsc_code: "HDFC0002345",
      pan_number: "BCDEF2345G",
      uan_number: "234567890123",
      aadhaar_number: "234567890123"
    }
  },
  {
    name: "Sneha Kapoor",
    email: "sneha.kapoor@company.in",
    role: "manager",
    department: "Sales",
    designation: "Sales Manager",
    manager: null,
    salary: 135500,
    date_of_joining: "2022-11-20",
    bankDetails: {
      bank_name: "ICICI Bank",
      account_number: "34567890123",
      ifsc_code: "ICIC0003456",
      pan_number: "CDEFG3456H",
      uan_number: "345678901234",
      aadhaar_number: "345678901234"
    }
  },
  {
    name: "Amit Gupta",
    email: "amit.gupta@company.in",
    role: "manager",
    department: "Marketing",
    designation: "Marketing Manager",
    manager: null,
    salary: 125000,
    date_of_joining: "2023-03-05",
    bankDetails: {
      bank_name: "Axis Bank",
      account_number: "45678901234",
      ifsc_code: "UTIB0004567",
      pan_number: "DEFGH4567I",
      uan_number: "456789012345",
      aadhaar_number: "456789012345"
    }
  },
  // Engineering Employees
  {
    name: "Kunal Desai",
    email: "kunal.desai@company.in",
    role: "employee",
    department: "Engineering",
    designation: "Frontend Developer",
    manager: "Rohan Mehta",
    salary: 69500,
    date_of_joining: "2023-07-12",
    bankDetails: {
      bank_name: "Punjab National Bank",
      account_number: "56789012345",
      ifsc_code: "PUNB0005678",
      pan_number: "EFGHI5678J",
      uan_number: "567890123456",
      aadhaar_number: "567890123456"
    }
  },
  {
    name: "Neha Bhat",
    email: "neha.bhat@company.in",
    role: "employee",
    department: "Engineering",
    designation: "Backend Developer",
    manager: "Rohan Mehta",
    salary: 69500,
    date_of_joining: "2023-05-22",
    bankDetails: {
      bank_name: "Canara Bank",
      account_number: "67890123456",
      ifsc_code: "CNRB0006789",
      pan_number: "FGHIJ6789K",
      uan_number: "678901234567",
      aadhaar_number: "678901234567"
    }
  },
  {
    name: "Siddharth Joshi",
    email: "siddharth.joshi@company.in",
    role: "employee",
    department: "Engineering",
    designation: "QA Engineer",
    manager: "Rohan Mehta",
    salary: 65000,
    date_of_joining: "2024-01-08",
    bankDetails: {
      bank_name: "Bank of Baroda",
      account_number: "78901234567",
      ifsc_code: "BARB0007890",
      pan_number: "GHIJK7890L",
      uan_number: "789012345678",
      aadhaar_number: "789012345678"
    }
  },
  {
    name: "Ayesha Khan",
    email: "ayesha.khan@company.in",
    role: "employee",
    department: "Engineering",
    designation: "DevOps Engineer",
    manager: "Rohan Mehta",
    salary: 75000,
    date_of_joining: "2023-09-15",
    bankDetails: {
      bank_name: "Union Bank of India",
      account_number: "89012345678",
      ifsc_code: "UBIN0008901",
      pan_number: "HIJKL8901M",
      uan_number: "890123456789",
      aadhaar_number: "890123456789"
    }
  },
  {
    name: "Manav Rao",
    email: "manav.rao@company.in",
    role: "employee",
    department: "Engineering",
    designation: "UI/UX Designer",
    manager: "Rohan Mehta",
    salary: 62000,
    date_of_joining: "2024-02-20",
    bankDetails: {
      bank_name: "Indian Bank",
      account_number: "90123456789",
      ifsc_code: "IDIB0009012",
      pan_number: "IJKLM9012N",
      uan_number: "901234567890",
      aadhaar_number: "901234567890"
    }
  },
  {
    name: "Tanmay Verma",
    email: "tanmay.verma@company.in",
    role: "employee",
    department: "Engineering",
    designation: "Product Analyst",
    manager: "Rohan Mehta",
    salary: 67000,
    date_of_joining: "2023-12-01",
    bankDetails: {
      bank_name: "Central Bank of India",
      account_number: "01234567890",
      ifsc_code: "CBIN0000123",
      pan_number: "JKLMN0123O",
      uan_number: "012345678901",
      aadhaar_number: "012345678901"
    }
  },
  {
    name: "Divya Jain",
    email: "divya.jain@company.in",
    role: "employee",
    department: "Engineering",
    designation: "Software Intern",
    manager: "Rohan Mehta",
    salary: 43500,
    date_of_joining: "2024-08-15",
    bankDetails: {
      bank_name: "Kotak Mahindra Bank",
      account_number: "12345098765",
      ifsc_code: "KKBK0001234",
      pan_number: "KLMNO1234P",
      uan_number: "123450987654",
      aadhaar_number: "123450987654"
    }
  },
  {
    name: "Rahul Singh",
    email: "rahul.singh@company.in",
    role: "employee",
    department: "Engineering",
    designation: "Full Stack Developer",
    manager: "Rohan Mehta",
    salary: 72000,
    date_of_joining: "2023-04-10",
    bankDetails: {
      bank_name: "IndusInd Bank",
      account_number: "23456109876",
      ifsc_code: "INDB0002345",
      pan_number: "LMNOP2345Q",
      uan_number: "234561098765",
      aadhaar_number: "234561098765"
    }
  },
  // Sales Employees
  {
    name: "Priya Nair",
    email: "priya.nair@company.in",
    role: "employee",
    department: "Sales",
    designation: "Sales Executive",
    manager: "Sneha Kapoor",
    salary: 58000,
    date_of_joining: "2023-06-18",
    bankDetails: {
      bank_name: "Federal Bank",
      account_number: "34567210987",
      ifsc_code: "FDRL0003456",
      pan_number: "MNOPQ3456R",
      uan_number: "345672109876",
      aadhaar_number: "345672109876"
    }
  },
  {
    name: "Vivek Malhotra",
    email: "vivek.malhotra@company.in",
    role: "employee",
    department: "Sales",
    designation: "Sales Associate",
    manager: "Sneha Kapoor",
    salary: 52000,
    date_of_joining: "2024-03-25",
    bankDetails: {
      bank_name: "Yes Bank",
      account_number: "45678321098",
      ifsc_code: "YESB0004567",
      pan_number: "NOPQR4567S",
      uan_number: "456783210987",
      aadhaar_number: "456783210987"
    }
  },
  {
    name: "Megha Sinha",
    email: "megha.sinha@company.in",
    role: "employee",
    department: "Sales",
    designation: "Account Executive",
    manager: "Sneha Kapoor",
    salary: 64000,
    date_of_joining: "2023-10-05",
    bankDetails: {
      bank_name: "IDFC First Bank",
      account_number: "56789432109",
      ifsc_code: "IDFB0005678",
      pan_number: "OPQRS5678T",
      uan_number: "567894321098",
      aadhaar_number: "567894321098"
    }
  },
  {
    name: "Yash Patil",
    email: "yash.patil@company.in",
    role: "employee",
    department: "Sales",
    designation: "Sales Analyst",
    manager: "Sneha Kapoor",
    salary: 55000,
    date_of_joining: "2024-01-22",
    bankDetails: {
      bank_name: "Bandhan Bank",
      account_number: "67890543210",
      ifsc_code: "BDBL0006789",
      pan_number: "PQRST6789U",
      uan_number: "678905432109",
      aadhaar_number: "678905432109"
    }
  },
  {
    name: "Ritika Shah",
    email: "ritika.shah@company.in",
    role: "employee",
    department: "Sales",
    designation: "Client Relationship Manager",
    manager: "Sneha Kapoor",
    salary: 61000,
    date_of_joining: "2023-08-30",
    bankDetails: {
      bank_name: "Standard Chartered Bank",
      account_number: "78901654321",
      ifsc_code: "SCBL0007890",
      pan_number: "QRSTU7890V",
      uan_number: "789016543210",
      aadhaar_number: "789016543210"
    }
  },
  {
    name: "Arjun Reddy",
    email: "arjun.reddy@company.in",
    role: "employee",
    department: "Sales",
    designation: "Business Development Executive",
    manager: "Sneha Kapoor",
    salary: 59000,
    date_of_joining: "2024-05-12",
    bankDetails: {
      bank_name: "RBL Bank",
      account_number: "89012765432",
      ifsc_code: "RATN0008901",
      pan_number: "RSTUV8901W",
      uan_number: "890127654321",
      aadhaar_number: "890127654321"
    }
  },
  // Marketing Employees
  {
    name: "Pooja Agarwal",
    email: "pooja.agarwal@company.in",
    role: "employee",
    department: "Marketing",
    designation: "Digital Marketing Specialist",
    manager: "Amit Gupta",
    salary: 54000,
    date_of_joining: "2023-09-08",
    bankDetails: {
      bank_name: "DCB Bank",
      account_number: "90123876543",
      ifsc_code: "DCBL0009012",
      pan_number: "STUVW9012X",
      uan_number: "901238765432",
      aadhaar_number: "901238765432"
    }
  },
  {
    name: "Karan Sharma",
    email: "karan.sharma@company.in",
    role: "employee",
    department: "Marketing",
    designation: "Content Writer",
    manager: "Amit Gupta",
    salary: 48000,
    date_of_joining: "2024-04-03",
    bankDetails: {
      bank_name: "ESAF Small Finance Bank",
      account_number: "01234987654",
      ifsc_code: "ESMF0000123",
      pan_number: "TUVWX0123Y",
      uan_number: "012349876543",
      aadhaar_number: "012349876543"
    }
  },
  {
    name: "Anjali Mishra",
    email: "anjali.mishra@company.in",
    role: "employee",
    department: "Marketing",
    designation: "Social Media Manager",
    manager: "Amit Gupta",
    salary: 52000,
    date_of_joining: "2023-11-15",
    bankDetails: {
      bank_name: "Ujjivan Small Finance Bank",
      account_number: "12345098765",
      ifsc_code: "UJVN0001234",
      pan_number: "UVWXY1234Z",
      uan_number: "123450987654",
      aadhaar_number: "123450987654"
    }
  },
  {
    name: "Deepak Kumar",
    email: "deepak.kumar@company.in",
    role: "employee",
    department: "Marketing",
    designation: "SEO Specialist",
    manager: "Amit Gupta",
    salary: 50000,
    date_of_joining: "2024-02-28",
    bankDetails: {
      bank_name: "Equitas Small Finance Bank",
      account_number: "23456109876",
      ifsc_code: "ESFB0002345",
      pan_number: "VWXYZ2345A",
      uan_number: "234561098765",
      aadhaar_number: "234561098765"
    }
  },
  // Finance Department
  {
    name: "Sunita Yadav",
    email: "sunita.yadav@company.in",
    role: "manager",
    department: "Finance",
    designation: "Finance Manager",
    manager: null,
    salary: 120000,
    date_of_joining: "2022-12-01",
    bankDetails: {
      bank_name: "Bank of India",
      account_number: "34567210987",
      ifsc_code: "BKID0003456",
      pan_number: "WXYZB3456C",
      uan_number: "345672109876",
      aadhaar_number: "345672109876"
    }
  },
  {
    name: "Rajesh Pandey",
    email: "rajesh.pandey@company.in",
    role: "employee",
    department: "Finance",
    designation: "Accountant",
    manager: "Sunita Yadav",
    salary: 48000,
    date_of_joining: "2023-07-01",
    bankDetails: {
      bank_name: "UCO Bank",
      account_number: "45678321098",
      ifsc_code: "UCBA0004567",
      pan_number: "XYZBC4567D",
      uan_number: "456783210987",
      aadhaar_number: "456783210987"
    }
  },
  {
    name: "Kavya Iyer",
    email: "kavya.iyer@company.in",
    role: "employee",
    department: "Finance",
    designation: "Financial Analyst",
    manager: "Sunita Yadav",
    salary: 56000,
    date_of_joining: "2024-01-15",
    bankDetails: {
      bank_name: "Indian Overseas Bank",
      account_number: "56789432109",
      ifsc_code: "IOBA0005678",
      pan_number: "YZBCD5678E",
      uan_number: "567894321098",
      aadhaar_number: "567894321098"
    }
  },
  // Operations
  {
    name: "Manoj Tiwari",
    email: "manoj.tiwari@company.in",
    role: "employee",
    department: "Operations",
    designation: "Operations Executive",
    manager: null,
    salary: 45000,
    date_of_joining: "2023-05-10",
    bankDetails: {
      bank_name: "Allahabad Bank",
      account_number: "67890543210",
      ifsc_code: "ALLA0006789",
      pan_number: "ZBCDE6789F",
      uan_number: "678905432109",
      aadhaar_number: "678905432109"
    }
  },
  {
    name: "Shweta Jha",
    email: "shweta.jha@company.in",
    role: "employee",
    department: "Operations",
    designation: "Office Administrator",
    manager: null,
    salary: 42000,
    date_of_joining: "2024-03-01",
    bankDetails: {
      bank_name: "Syndicate Bank",
      account_number: "78901654321",
      ifsc_code: "SYNB0007890",
      pan_number: "BCDEF7890G",
      uan_number: "789016543210",
      aadhaar_number: "789016543210"
    }
  }
];
