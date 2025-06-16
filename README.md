# ✅README.md

# AI-Enhanced HRMS Platform 🚀

## Overview

A comprehensive Human Resource Management System (HRMS) built with modern web technologies and enhanced with AI capabilities. This enterprise-grade platform streamlines HR operations, automates routine tasks, and provides intelligent insights for better decision-making.

### 🎯 Key Features

#### Core HRMS Modules
- **Employee Management** - Complete employee lifecycle from onboarding to offboarding
- **Attendance & Leave Management** - Biometric attendance, leave applications, and approval workflows
- **Payroll Management** - Automated salary calculations, payslip generation, and compliance tracking
- **Performance Management** - Goal setting, 360-degree feedback, and performance reviews
- **Reports & Analytics** - Comprehensive reporting with custom dashboards

#### 🤖 AI-Powered Features
- **Attrition Predictor** - Predict employees likely to leave using behavioral data
- **Smart Feedback Generator** - AI-generated performance review comments
- **Anomaly Detection** - Detect unusual patterns in payroll and attendance
- **HR Chatbot** - Conversational assistant for employee queries
- **Smart Reports** - Natural language summaries of performance trends
- **Resume Parser** - Extract key details from uploaded resumes

### 🏢 Role-Based Dashboards
- **Employee Dashboard** - Personal stats, leave balances, performance metrics
- **Manager Dashboard** - Team oversight, approval workflows, performance tracking
- **HR Dashboard** - Organization-wide analytics, compliance monitoring, strategic insights

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling and development
- **Tailwind CSS** for styling
- **shadcn/ui** for component library
- **React Router DOM** for navigation
- **React Query (TanStack Query)** for data fetching
- **React Hook Form** with Zod validation

### Backend & Database
- **Supabase** for backend-as-a-service
- **PostgreSQL** database with Row Level Security
- **Supabase Edge Functions** for serverless computing
- **Real-time subscriptions** for live updates

### AI & ML Integration
- **Gemini AI** for chatbot and smart feedback generation
- **Hugging Face Transformers** for ML model integration
- **Custom algorithms** for attrition prediction and anomaly detection

### Additional Libraries
- **Lucide React** for icons
- **Recharts** for data visualization
- **Date-fns** for date manipulation
- **Sonner** for toast notifications

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Git

### Local Setup

1. **Clone the repository**
```bash
git clone https://github.com/vaibhavi1224/keka-hrms.git
cd keka-hrms
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Configuration**
Copy the example environment file and configure your settings:
```bash
cp .env.example .env.local
```

Fill in your environment variables (see `.env.example` for required variables).

4. **Start the development server**
```bash
npm run dev
```

5. **Access the application**
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Default Login Credentials
After setting up the database with seed data:
- **HR Admin**: hr@company.com / password123
- **Manager**: manager@company.com / password123
- **Employee**: employee@company.com / password123

## 📱 Live Application

🌐 **Deployed Application**: https://keka-hrms.lovable.app

> Note: Replace with your actual deployment URL after publishing

## 🔧 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Services (Optional - for enhanced features)
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_HUGGING_FACE_TOKEN=your_hugging_face_token

# Application Settings
VITE_APP_ENV=development
VITE_APP_NAME="AI-Enhanced HRMS"
```

## 🏗️ Architecture & Deployment

### Application Architecture
- **Frontend**: React SPA hosted on Lovable/Vercel
- **Backend**: Supabase (Database + Edge Functions)
- **Authentication**: Supabase Auth with Google OAuth
- **File Storage**: Supabase Storage (when needed)
- **Real-time**: WebSocket connections via Supabase

### Scaling Considerations
- **Database**: PostgreSQL with connection pooling
- **Caching**: React Query for client-side caching
- **CDN**: Automatic via deployment platform
- **Edge Functions**: Auto-scaling serverless functions
- **Security**: Row Level Security (RLS) policies

### Deployment Options
1. **Lovable Platform** (Recommended)
   - One-click deployment
   - Automatic SSL certificates
   - Global CDN
   - Custom domain support

2. **Self-Hosting**
   - Build: `npm run build`
   - Deploy `dist/` folder to any static hosting
   - Configure environment variables

## 🗄️ Database Setup

The application uses Supabase with pre-configured:
- **Tables**: Employees, attendance, leave, payroll, performance
- **Security**: Row Level Security policies
- **Functions**: Automated payroll calculation, leave accrual
- **Triggers**: Real-time updates and notifications

### Seed Data
Use the built-in data seeding tools in the HR section to populate:
- Demo employees across departments
- Attendance records
- Performance data
- Payroll structures

## 🔐 Security Features

- **Authentication**: Multi-factor authentication support
- **Authorization**: Role-based access control (RBAC)
- **Data Protection**: Encrypted data transmission
- **Audit Logging**: Complete action tracking
- **Rate Limiting**: API protection
- **Content Security Policy**: XSS protection

## 🧪 AI Model APIs

### Integrated AI Services
1. **Gemini AI** - Powers the HR chatbot and smart feedback generation
2. **Hugging Face Models** - Used for sentiment analysis and text processing
3. **Custom ML Algorithms** - Attrition prediction and anomaly detection

### API Endpoints
- `POST /functions/v1/hr-chatbot` - HR assistant queries
- `POST /functions/v1/smart-feedback-generator` - Performance feedback
- `POST /functions/v1/attrition-predictor` - Employee attrition analysis
- `POST /functions/v1/performance-insights` - Performance analytics

## 📊 Features Showcase

### Dashboard Analytics
- Real-time employee metrics
- Department-wise performance tracking
- Attendance and leave analytics
- Payroll compliance monitoring

### AI Capabilities
- Intelligent employee insights
- Predictive analytics for HR decisions
- Automated response generation
- Pattern recognition in HR data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- 📧 Email: support@yourcompany.com
- 💬 Discord: [Join our community](https://discord.com/channels/1119885301872070706/1280461670979993613)
- 📖 Documentation: [Lovable Docs](https://docs.lovable.dev/)

## 🎯 Roadmap

- [ ] Mobile app development
- [ ] Advanced AI recommendations
- [ ] Integration with external HR tools
- [ ] Multi-language support
- [ ] Advanced reporting capabilities

---

Built with ❤️ using [Lovable](https://lovable.dev) and modern web technologies.
