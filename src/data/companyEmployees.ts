
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
    date_of_joining: "2023-01-15"
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
    date_of_joining: "2022-08-10"
  },
  {
    name: "Sneha Kapoor",
    email: "sneha.kapoor@company.in",
    role: "manager",
    department: "Sales",
    designation: "Sales Manager",
    manager: null,
    salary: 135500,
    date_of_joining: "2022-11-20"
  },
  {
    name: "Amit Gupta",
    email: "amit.gupta@company.in",
    role: "manager",
    department: "Marketing",
    designation: "Marketing Manager",
    manager: null,
    salary: 125000,
    date_of_joining: "2023-03-05"
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
    date_of_joining: "2023-07-12"
  },
  {
    name: "Neha Bhat",
    email: "neha.bhat@company.in",
    role: "employee",
    department: "Engineering",
    designation: "Backend Developer",
    manager: "Rohan Mehta",
    salary: 69500,
    date_of_joining: "2023-05-22"
  },
  {
    name: "Siddharth Joshi",
    email: "siddharth.joshi@company.in",
    role: "employee",
    department: "Engineering",
    designation: "QA Engineer",
    manager: "Rohan Mehta",
    salary: 65000,
    date_of_joining: "2024-01-08"
  },
  {
    name: "Ayesha Khan",
    email: "ayesha.khan@company.in",
    role: "employee",
    department: "Engineering",
    designation: "DevOps Engineer",
    manager: "Rohan Mehta",
    salary: 75000,
    date_of_joining: "2023-09-15"
  },
  {
    name: "Manav Rao",
    email: "manav.rao@company.in",
    role: "employee",
    department: "Engineering",
    designation: "UI/UX Designer",
    manager: "Rohan Mehta",
    salary: 62000,
    date_of_joining: "2024-02-20"
  },
  {
    name: "Tanmay Verma",
    email: "tanmay.verma@company.in",
    role: "employee",
    department: "Engineering",
    designation: "Product Analyst",
    manager: "Rohan Mehta",
    salary: 67000,
    date_of_joining: "2023-12-01"
  },
  {
    name: "Divya Jain",
    email: "divya.jain@company.in",
    role: "employee",
    department: "Engineering",
    designation: "Software Intern",
    manager: "Rohan Mehta",
    salary: 43500,
    date_of_joining: "2024-08-15"
  },
  {
    name: "Rahul Singh",
    email: "rahul.singh@company.in",
    role: "employee",
    department: "Engineering",
    designation: "Full Stack Developer",
    manager: "Rohan Mehta",
    salary: 72000,
    date_of_joining: "2023-04-10"
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
    date_of_joining: "2023-06-18"
  },
  {
    name: "Vivek Malhotra",
    email: "vivek.malhotra@company.in",
    role: "employee",
    department: "Sales",
    designation: "Sales Associate",
    manager: "Sneha Kapoor",
    salary: 52000,
    date_of_joining: "2024-03-25"
  },
  {
    name: "Megha Sinha",
    email: "megha.sinha@company.in",
    role: "employee",
    department: "Sales",
    designation: "Account Executive",
    manager: "Sneha Kapoor",
    salary: 64000,
    date_of_joining: "2023-10-05"
  },
  {
    name: "Yash Patil",
    email: "yash.patil@company.in",
    role: "employee",
    department: "Sales",
    designation: "Sales Analyst",
    manager: "Sneha Kapoor",
    salary: 55000,
    date_of_joining: "2024-01-22"
  },
  {
    name: "Ritika Shah",
    email: "ritika.shah@company.in",
    role: "employee",
    department: "Sales",
    designation: "Client Relationship Manager",
    manager: "Sneha Kapoor",
    salary: 61000,
    date_of_joining: "2023-08-30"
  },
  {
    name: "Arjun Reddy",
    email: "arjun.reddy@company.in",
    role: "employee",
    department: "Sales",
    designation: "Business Development Executive",
    manager: "Sneha Kapoor",
    salary: 59000,
    date_of_joining: "2024-05-12"
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
    date_of_joining: "2023-09-08"
  },
  {
    name: "Karan Sharma",
    email: "karan.sharma@company.in",
    role: "employee",
    department: "Marketing",
    designation: "Content Writer",
    manager: "Amit Gupta",
    salary: 48000,
    date_of_joining: "2024-04-03"
  },
  {
    name: "Anjali Mishra",
    email: "anjali.mishra@company.in",
    role: "employee",
    department: "Marketing",
    designation: "Social Media Manager",
    manager: "Amit Gupta",
    salary: 52000,
    date_of_joining: "2023-11-15"
  },
  {
    name: "Deepak Kumar",
    email: "deepak.kumar@company.in",
    role: "employee",
    department: "Marketing",
    designation: "SEO Specialist",
    manager: "Amit Gupta",
    salary: 50000,
    date_of_joining: "2024-02-28"
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
    date_of_joining: "2022-12-01"
  },
  {
    name: "Rajesh Pandey",
    email: "rajesh.pandey@company.in",
    role: "employee",
    department: "Finance",
    designation: "Accountant",
    manager: "Sunita Yadav",
    salary: 48000,
    date_of_joining: "2023-07-01"
  },
  {
    name: "Kavya Iyer",
    email: "kavya.iyer@company.in",
    role: "employee",
    department: "Finance",
    designation: "Financial Analyst",
    manager: "Sunita Yadav",
    salary: 56000,
    date_of_joining: "2024-01-15"
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
    date_of_joining: "2023-05-10"
  },
  {
    name: "Shweta Jha",
    email: "shweta.jha@company.in",
    role: "employee",
    department: "Operations",
    designation: "Office Administrator",
    manager: null,
    salary: 42000,
    date_of_joining: "2024-03-01"
  }
];
