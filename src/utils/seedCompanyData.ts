
import { supabase } from '@/integrations/supabase/client';

interface EmployeeData {
  name: string;
  email: string;
  role: 'hr' | 'manager' | 'employee';
  department: string;
  designation: string;
  manager: string | null;
  salary?: number;
}

const companyData: EmployeeData[] = [
  // HR
  {
    name: "Aarti Sharma",
    email: "aarti.sharma@company.in",
    role: "hr",
    department: "Human Resources",
    designation: "HR Administrator",
    manager: null,
    salary: 103500
  },
  // Managers
  {
    name: "Rohan Mehta",
    email: "rohan.mehta@company.in",
    role: "manager",
    department: "Engineering",
    designation: "Engineering Manager",
    manager: null,
    salary: 135500
  },
  {
    name: "Sneha Kapoor",
    email: "sneha.kapoor@company.in",
    role: "manager",
    department: "Sales",
    designation: "Sales Manager",
    manager: null,
    salary: 135500
  },
  // Engineering Employees
  {
    name: "Kunal Desai",
    email: "kunal.desai@company.in",
    role: "employee",
    department: "Engineering",
    designation: "Frontend Developer",
    manager: "Rohan Mehta",
    salary: 69500
  },
  {
    name: "Neha Bhat",
    email: "neha.bhat@company.in",
    role: "employee",
    department: "Engineering",
    designation: "Backend Developer",
    manager: "Rohan Mehta",
    salary: 69500
  },
  {
    name: "Siddharth Joshi",
    email: "siddharth.joshi@company.in",
    role: "employee",
    department: "Engineering",
    designation: "QA Engineer",
    manager: "Rohan Mehta",
    salary: 69500
  },
  {
    name: "Ayesha Khan",
    email: "ayesha.khan@company.in",
    role: "employee",
    department: "Engineering",
    designation: "DevOps Engineer",
    manager: "Rohan Mehta",
    salary: 69500
  },
  {
    name: "Manav Rao",
    email: "manav.rao@company.in",
    role: "employee",
    department: "Engineering",
    designation: "UI/UX Designer",
    manager: "Rohan Mehta",
    salary: 69500
  },
  {
    name: "Tanmay Verma",
    email: "tanmay.verma@company.in",
    role: "employee",
    department: "Engineering",
    designation: "Product Analyst",
    manager: "Rohan Mehta",
    salary: 69500
  },
  {
    name: "Divya Jain",
    email: "divya.jain@company.in",
    role: "employee",
    department: "Engineering",
    designation: "Software Intern",
    manager: "Rohan Mehta",
    salary: 43500
  },
  // Sales Employees
  {
    name: "Priya Nair",
    email: "priya.nair@company.in",
    role: "employee",
    department: "Sales",
    designation: "Sales Executive",
    manager: "Sneha Kapoor",
    salary: 69500
  },
  {
    name: "Vivek Malhotra",
    email: "vivek.malhotra@company.in",
    role: "employee",
    department: "Sales",
    designation: "Sales Associate",
    manager: "Sneha Kapoor",
    salary: 69500
  },
  {
    name: "Megha Sinha",
    email: "megha.sinha@company.in",
    role: "employee",
    department: "Sales",
    designation: "Account Executive",
    manager: "Sneha Kapoor",
    salary: 69500
  },
  {
    name: "Yash Patil",
    email: "yash.patil@company.in",
    role: "employee",
    department: "Sales",
    designation: "Sales Analyst",
    manager: "Sneha Kapoor",
    salary: 69500
  },
  {
    name: "Ritika Shah",
    email: "ritika.shah@company.in",
    role: "employee",
    department: "Sales",
    designation: "Client Relationship Manager",
    manager: "Sneha Kapoor",
    salary: 69500
  }
];

export async function seedCompanyData() {
  try {
    console.log('Starting to seed company data...');
    
    // Get current user (should be HR)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('No authenticated user found');
    }

    // Check if user has HR role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'hr') {
      throw new Error('Only HR users can seed company data');
    }

    let successCount = 0;
    let errorCount = 0;

    for (const employee of companyData) {
      try {
        // Check if employee profile already exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', employee.email)
          .single();

        if (existingProfile) {
          console.log(`Employee already exists for ${employee.email}, skipping...`);
          continue;
        }

        // Generate a temporary password for the employee
        const tempPassword = Math.random().toString(36).slice(-8) + 'Temp123!';

        // Create employee using the edge function
        const { data, error } = await supabase.functions.invoke('create-employee', {
          body: {
            name: employee.name,
            email: employee.email,
            password: tempPassword,
            role: employee.role,
            department: employee.department,
            designation: employee.designation,
            salary: employee.salary,
            date_of_joining: new Date().toISOString().split('T')[0]
          }
        });

        if (error) {
          console.error(`Error creating employee ${employee.email}:`, error);
          errorCount++;
        } else if (data.error) {
          console.error(`Error creating employee ${employee.email}:`, data.error);
          errorCount++;
        } else {
          console.log(`Successfully created employee ${employee.email}`);
          successCount++;
        }
      } catch (error) {
        console.error(`Error processing ${employee.email}:`, error);
        errorCount++;
      }
    }

    console.log(`Seeding completed: ${successCount} successful, ${errorCount} errors`);
    return { success: successCount, errors: errorCount };
  } catch (error) {
    console.error('Error seeding company data:', error);
    throw error;
  }
}
