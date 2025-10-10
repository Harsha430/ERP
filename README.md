# 🏢 Enterprise Resource Planning (ERP) System

> A comprehensive, full-stack ERP system built with **Spring Boot** and **React** that streamlines HR, Finance, and Administrative operations for modern businesses. 

**✨ Key Highlights:** Advanced payroll processing with PDF generation, intelligent email notifications, seamless inter-module integration, and robust financial management with double-entry bookkeeping.

<div align="center">

**🚀 Modern • 🔒 Secure • 📊 Scalable • 💼 Enterprise-Ready**

</div>

<div align="center">

![ERP System](https://img.shields.io/badge/ERP-System-blue?style=for-the-badge&logo=building)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.5-green?style=for-the-badge&logo=spring)
![React](https://img.shields.io/badge/React-18.x-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?style=for-the-badge&logo=mongodb)

![PDF](https://img.shields.io/badge/PDF-Generation-red?style=for-the-badge&logo=adobe)
![Email](https://img.shields.io/badge/Email-Integration-orange?style=for-the-badge&logo=gmail)
![JWT](https://img.shields.io/badge/JWT-Authentication-black?style=for-the-badge&logo=jsonwebtokens)
![Maven](https://img.shields.io/badge/Maven-Build-orange?style=for-the-badge&logo=apachemaven)

[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen.svg?style=for-the-badge)](http://makeapullrequest.com)

</div>

---

## 📋 Table of Contents

- [🚀 Features Overview](#-features-overview)
- [🛠️ Technology Stack](#️-technology-stack)
- [📋 Prerequisites](#-prerequisites)
- [🚀 Quick Start](#-quick-start)
- [👤 Default Login Credentials](#-default-login-credentials)
- [📁 Project Structure](#-project-structure)
- [🔧 Configuration](#-configuration)
- [📊 Key Features in Detail](#-key-features-in-detail)
- [📈 API Documentation](#-api-documentation)
- [🔒 Security Features](#-security-features)
- [🚀 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📞 Support](#-support)

---

## 🚀 Features Overview

<div align="center">

### 🎯 **Three Powerful Modules** • **Seamless Integration** • **Modern UI/UX**

</div>

### 👥 Human Resources (HR) Module

<details>
<summary><strong>🔍 Click to expand HR features</strong></summary>

<br>
- **Employee Management** - Complete employee lifecycle management with CRUD operations
- **Department & Position Management** - Organizational structure with hierarchical management
- **Attendance Tracking** - Daily attendance with status management and overtime calculation
- **Leave Management** - Leave requests, approvals, balance tracking with multiple leave types
- **Advanced Payroll System** - Automated payslip generation with:
  - 📧 **Email Notifications** - Detailed payslip emails with complete salary breakdown
  - 📄 **PDF Generation** - Professional PDF payslips with company branding
  - 🔄 **Duplicate Handling** - Smart duplicate detection and cleanup
  - 💰 **Salary Components** - Basic salary, allowances, deductions, tax calculations
  - 📊 **Attendance Integration** - Pro-rated salary based on working/present days
  - 🏦 **Finance Integration** - Automatic journal entries for payroll transactions
- **Employee Reports** - Comprehensive HR analytics and reporting

</details>

### 💰 Finance Module

<details>
<summary><strong>🔍 Click to expand Finance features</strong></summary>

<br>
- **Advanced Accounts Management** - Chart of accounts with double-entry bookkeeping
  - 🏛️ Account types (Assets, Liabilities, Equity, Revenue, Expenses)
  - 🔄 Automated journal entries with proper debit/credit handling
  - 📊 Real-time account balances and transaction history
- **Invoice Management** - Customer invoicing and payment tracking
- **Expense Management** - Expense categorization and approval workflow
- **Budget Management** - Budget planning, tracking, and variance analysis
- **Financial Reports** - P&L, Balance Sheet, Cash Flow, and custom reports
- **Transaction Management** - Unified view of all financial transactions
- **Payroll Integration** - Seamless HR-Finance payroll workflow with:
  - 💼 Automatic expense entries for salary payments
  - 🧾 Payroll journal entries with proper account mapping
  - 📈 Payroll expense tracking and reporting

</details>

### 🔐 Administration Module

<details>
<summary><strong>🔍 Click to expand Admin features</strong></summary>

<br>
- **Advanced User Management** - Role-based access control with:
  - 👤 User registration and profile management
  - 🔑 Role assignment (Admin, HR, Finance)
  - 📊 User activity monitoring and statistics
  - 🎯 Enhanced dashboard with quick actions and collapsible sections
- **Security** - JWT authentication and authorization
- **System Configuration** - Application settings and preferences
- **Audit Trails** - Complete system activity logging
- **Email System** - Outbox pattern for reliable email delivery:
  - 📧 Template-based email system
  - 🔄 Retry mechanism for failed emails
  - ☠️ Dead letter queue for permanent failures
  - 📊 Email delivery statistics and monitoring

</details>

---

## 🛠️ Technology Stack

<div align="center">

### 🏗️ **Built with Modern Technologies** • **Scalable Architecture** • **Best Practices**

</div>

<table>
<tr>
<td width="50%">

### 🔧 **Backend Stack**
```
🚀 Spring Boot 3.5.5
☕ Java 17
🍃 MongoDB + Spring Data
🔐 Spring Security + JWT
📄 iText PDF 5.5.13.3
📧 Spring Mail + JavaMail
📚 OpenAPI/Swagger
🔨 Maven Build System
```

</td>
<td width="50%">

### 🎨 **Frontend Stack**
```
⚛️ React 18.x + TypeScript 5.x
🎨 Tailwind CSS + shadcn/ui
🔄 TanStack Query (React Query)
🌐 Axios HTTP Client
📊 Recharts Visualization
🎬 Framer Motion Animations
⚡ Vite Build Tool
🎯 Lucide React Icons
```

</td>
</tr>
</table>

### 🔧 **Detailed Technology Breakdown**

<details>
<summary><strong>🖥️ Backend Technologies & Libraries</strong></summary>

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Framework** | Spring Boot | 3.5.5 | Main application framework |
| **Language** | Java | 17 | Programming language |
| **Database** | MongoDB | Latest | NoSQL document database |
| **Security** | Spring Security + JWT | Latest | Authentication & authorization |
| **PDF Generation** | iText PDF | 5.5.13.3 | Professional PDF creation |
| **Email Service** | Spring Mail + JavaMail | Latest | Email notifications |
| **Documentation** | OpenAPI/Swagger | Latest | API documentation |
| **Build Tool** | Maven | 3.6+ | Build & dependency management |
| **Data Layer** | Spring Data MongoDB | Latest | Database abstraction |
| **Validation** | Spring Boot Validation | Latest | Input validation |
| **Monitoring** | Spring Boot Actuator | Latest | Application monitoring |
| **Utilities** | Lombok | Latest | Boilerplate code reduction |

</details>

<details>
<summary><strong>🎨 Frontend Technologies & Libraries</strong></summary>

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Framework** | React | 18.x | UI framework |
| **Language** | TypeScript | 5.x | Type-safe JavaScript |
| **UI Library** | Tailwind CSS + shadcn/ui | Latest | Styling & components |
| **State Management** | TanStack Query | v4 | Server state management |
| **HTTP Client** | Axios | Latest | API communication |
| **Charts** | Recharts | Latest | Data visualization |
| **Animations** | Framer Motion | Latest | UI animations |
| **Build Tool** | Vite | Latest | Fast build system |
| **Icons** | Lucide React | Latest | Icon library |
| **Forms** | React Hook Form | Latest | Form management |
| **Routing** | React Router DOM | Latest | Client-side routing |
| **Components** | Radix UI | Latest | Headless UI primitives |

</details>

<details>
<summary><strong>🛠️ Development & DevOps Tools</strong></summary>

| Category | Tool | Purpose |
|----------|------|---------|
| **IDEs** | IntelliJ IDEA, VS Code | Development environments |
| **Version Control** | Git | Source code management |
| **API Testing** | Postman | API development & testing |
| **Database GUI** | MongoDB Compass | Database administration |
| **Package Management** | Maven (Backend), npm/yarn (Frontend) | Dependency management |
| **Code Quality** | ESLint, Prettier | Code formatting & linting |
| **Type Checking** | TypeScript Compiler | Static type checking |
| **Environment** | Spring Profiles | Configuration management |

</details>

## 📋 Prerequisites

Before running this application, make sure you have:

- **Java 17** or higher
- **Node.js 18** or higher
- **MongoDB** (local or cloud instance)
- **Maven 3.6** or higher
- **Git**

## 🚀 Quick Start

<div align="center">

### ⚡ **Get up and running in minutes!** ⚡

</div>

### 1️⃣ **Clone the Repository**
```bash
git clone https://github.com/Harsha430/ERP.git
cd ERP
```

### 2️⃣ **Backend Setup**
```bash
# 📝 Configure MongoDB connection in application.properties
spring.data.mongodb.uri=mongodb://localhost:27017/erp_db
spring.data.mongodb.database=erp_db

# 🔨 Build and run the backend
mvn clean install
mvn spring-boot:run
```

<div align="center">
🚀 <strong>Backend will start on</strong> <code>http://localhost:8081</code>
</div>

### 3️⃣ **Frontend Setup**
```bash
# 📁 Navigate to frontend directory
cd frontend

# 📦 Install dependencies
npm install

# 🎯 Start development server
npm run dev
```

<div align="center">
🎨 <strong>Frontend will start on</strong> <code>http://localhost:5173</code>
</div>

### 4️⃣ **Access the Application**

<table align="center">
<tr>
<td align="center"><strong>🌐 Frontend</strong></td>
<td align="center"><strong>🔗 Backend API</strong></td>
<td align="center"><strong>📚 API Docs</strong></td>
</tr>
<tr>
<td align="center"><a href="http://localhost:5173">localhost:5173</a></td>
<td align="center"><a href="http://localhost:8081/api">localhost:8081/api</a></td>
<td align="center"><a href="http://localhost:8081/swagger-ui.html">Swagger UI</a></td>
</tr>
</table>

## 👤 Default Login Credentials

<div align="center">

### 🔐 **Pre-configured User Accounts for Quick Testing**

</div>

<table align="center">
<tr>
<th>👑 Role</th>
<th>📧 Username</th>
<th>🔑 Password</th>
<th>🎯 Access Level</th>
</tr>
<tr>
<td><strong>🛡️ Administrator</strong></td>
<td><code>admin@erp.com</code></td>
<td><code>admin123</code></td>
<td>Full system access</td>
</tr>
<tr>
<td><strong>👥 HR Manager</strong></td>
<td><code>hr@erp.com</code></td>
<td><code>hr123</code></td>
<td>HR module + Dashboard</td>
</tr>
<tr>
<td><strong>💰 Finance Manager</strong></td>
<td><code>finance@erp.com</code></td>
<td><code>finance123</code></td>
<td>Finance module + Dashboard</td>
</tr>
</table>

> ⚠️ **Security Note:** Please change these default credentials in production environments!

## 📁 Project Structure

```
ERP/
├── src/main/java/com/intern/erp/          # Backend source code
│   ├── admin/                             # Admin module
│   ├── auth/                              # Authentication
│   ├── config/                            # Configuration classes
│   ├── finance/                           # Finance module
│   │   ├── controller/                    # REST controllers
│   │   ├── model/                         # Entity models
│   │   ├── repository/                    # Data repositories
│   │   └── service/                       # Business logic
│   ├── hr/                                # HR module
│   │   ├── controller/                    # REST controllers
│   │   ├── model/                         # Entity models
│   │   ├── repository/                    # Data repositories
│   │   └── service/                       # Business logic
│   ├── integration/                       # Inter-module integration
│   ├── security/                          # Security configuration
│   └── users/                             # User management
├── frontend/                              # Frontend source code
│   ├── src/
│   │   ├── components/                    # Reusable UI components
│   │   ├── pages/                         # Application pages
│   │   │   ├── admin/                     # Admin pages
│   │   │   ├── finance/                   # Finance pages
│   │   │   └── hr/                        # HR pages
│   │   ├── services/                      # API services
│   │   └── utils/                         # Utility functions
│   └── public/                            # Static assets
└── README.md                              # This file
```

## 🔧 Configuration

### Database Configuration
Edit `src/main/resources/application.properties`:
```properties
# MongoDB Configuration
spring.data.mongodb.uri=mongodb://localhost:27017/erp_db
spring.data.mongodb.database=erp_db

# Server Configuration
server.port=8081

# CORS Configuration
cors.allowed-origins=http://localhost:5173
```

### Frontend Configuration
Edit `frontend/src/services/apiService.ts`:
```typescript
const API_BASE_URL = 'http://localhost:8081/api';
```

## 📊 Key Features in Detail

### HR Module Features
- **Employee Onboarding**: Complete employee registration with document management
- **Attendance System**: Clock in/out with overtime calculation
- **Leave Management**: Multiple leave types with approval workflow
- **Advanced Payroll Processing**: 
  - 💰 Automated salary calculation with tax deductions
  - 📧 **Email Integration**: Detailed payslip emails with complete breakdown
  - 📄 **PDF Payslips**: Professional PDF generation with company branding
  - 🔄 **Smart Duplicate Handling**: Prevents duplicate payslips with cleanup
  - 🏦 **Finance Integration**: Automatic journal entries creation
  - ⚡ **Outbox Pattern**: Reliable email delivery with retry mechanism
  - 📊 **Salary Components**: Basic salary, HRA, transport, medical allowances
  - 💸 **Deductions**: PF, professional tax, income tax (TDS)
  - 📅 **Attendance-based**: Pro-rated salary calculation
- **Performance Tracking**: Employee performance reviews and ratings

### Finance Module Features
- **Advanced Double-Entry Bookkeeping**: 
  - 🏛️ Complete chart of accounts (Assets, Liabilities, Equity, Revenue, Expenses)
  - 📊 Automatic journal and ledger entries
  - ⚖️ Balance validation and integrity checks
- **Invoice Lifecycle**: From creation to payment with aging reports
- **Expense Management**: Multi-level approval with receipt management
- **Budget Planning**: Annual/quarterly budgets with variance analysis
- **Financial Reporting**: Real-time P&L, Balance Sheet, and Cash Flow
- **Payroll-Finance Integration**:
  - 💼 Automatic expense entries for payroll
  - 🧾 Proper journal entries with account mapping
  - 📈 Payroll expense tracking and reporting
  - 🔄 Real-time financial impact of payroll processing

### 🔗 Integration & Advanced Features

<div align="center">

**🚀 Seamless Integration • 🔐 Enterprise Security • 📊 Real-time Analytics**

</div>

#### **💫 Smart Integration**
- **🔄 HR-Finance Integration**: 
  - Automatic journal entries creation from payroll
  - Real-time financial impact tracking
  - Seamless data synchronization between modules
- **📧 Advanced Email System**:
  - Outbox pattern for reliable email delivery
  - Automatic retry mechanism for failed emails
  - Dead letter queue for permanent failures
  - PDF attachment support for payslips
- **🛡️ Data Integrity & Safety**:
  - Smart duplicate detection and cleanup
  - MongoDB safe query operations
  - Complete audit trail with transaction history
  - Data consistency across all modules

#### **🔒 Security & Access Control**
- **Role-based Access**: Granular permissions for different user roles
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configurable cross-origin resource sharing

## 🧪 Testing

### Backend Testing
```bash
# Run unit tests
mvn test

# Run integration tests
mvn verify

# Generate test coverage report
mvn jacoco:report
```

### Frontend Testing
```bash
cd frontend

# Run unit tests
npm test

# Run e2e tests
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

## 📈 API Documentation

The API is fully documented using OpenAPI/Swagger. After starting the backend, visit:
- **Swagger UI**: http://localhost:8081/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8081/v3/api-docs

### Key API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token

#### HR APIs
- `GET /api/hr/employees` - Get all employees
- `POST /api/hr/employees` - Create employee
- `GET /api/hr/payroll` - Get payslips
- `POST /api/hr/payroll/generate/{employeeId}` - Generate payslip

#### Finance APIs
- `GET /api/accounts` - Get chart of accounts
- `GET /api/invoices` - Get all invoices
- `GET /api/expenses` - Get all expenses
- `GET /api/budgets` - Get all budgets
- `GET /api/reports/financial-summary` - Get financial summary

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Authorization**: Granular access control
- **Password Encryption**: BCrypt password hashing
- **CORS Protection**: Configurable cross-origin resource sharing
- **Input Validation**: Comprehensive request validation
- **SQL Injection Prevention**: Parameterized queries and MongoDB

## 🚀 Deployment

### Production Build

#### Backend
```bash
# Create production JAR
mvn clean package -Pprod

# Run production build
java -jar target/erp-0.0.1-SNAPSHOT.jar
```

#### Frontend
```bash
cd frontend

# Create production build
npm run build

# Serve static files (using serve or nginx)
npm install -g serve
serve -s dist -l 3000
```

### Docker Deployment
```bash
# Build Docker images
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow Java coding standards and Spring Boot best practices
- Use TypeScript for all frontend code
- Write unit tests for new features
- Update documentation for API changes
- Follow conventional commit messages

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Authors

- **Harsha** - *Initial work* - [Harsha430](https://github.com/Harsha430)

## 🙏 Acknowledgments

- Spring Boot team for the excellent framework
- React team for the powerful frontend library
- MongoDB team for the flexible database
- shadcn/ui for the beautiful UI components
- All contributors who helped improve this project

## 📞 Support

If you have any questions or need help with setup, please:

1. Check the [Issues](https://github.com/Harsha430/ERP/issues) page
2. Create a new issue with detailed description
3. Contact the maintainers

## � Performance & Scalability

<div align="center">

### ⚡ **Optimized for Performance** • 📈 **Built to Scale** • 🛡️ **Production Ready**

</div>

- **🚀 Fast Loading**: Optimized React components with lazy loading
- **📊 Efficient Queries**: MongoDB aggregation pipelines for complex reports
- **�🔄 Real-time Updates**: Live data synchronization across modules
- **📱 Responsive Design**: Mobile-first approach with Tailwind CSS
- **⚡ Caching**: Query caching with TanStack Query for optimal performance
- **🛡️ Error Handling**: Comprehensive error boundaries and graceful degradation

## 🔄 Recent Updates & Changelog

### 🆕 Version 1.2.0 (Latest) - October 2025
- ✨ **NEW**: Advanced PDF payslip generation with professional branding
- ✨ **NEW**: Email integration with attachment support
- ✨ **NEW**: Smart duplicate payslip detection and cleanup
- ✨ **NEW**: Enhanced admin dashboard with collapsible sections
- ✨ **NEW**: Outbox pattern for reliable email delivery
- 🔧 **IMPROVED**: Payroll-Finance integration with automatic journal entries
- 🔧 **IMPROVED**: Account management with proper double-entry bookkeeping
- 🐛 **FIXED**: Date selection issues in payroll forms
- 🐛 **FIXED**: MongoDB query optimization for better performance

### 🎯 Version 1.1.0 - September 2025
- ✅ Complete HR module with employee, attendance, leave management
- ✅ Full Finance module with accounts, invoices, expenses, budgets
- ✅ Admin module with user management and system configuration
- ✅ JWT-based authentication and role-based authorization
- ✅ Modern React frontend with TypeScript and Tailwind CSS
- ✅ Comprehensive API documentation with Swagger

## 🛣️ Roadmap

### 🎯 Coming Soon (Q4 2025)
- [ ] 📱 Mobile app with React Native
- [ ] 🤖 AI-powered analytics and insights
- [ ] 📊 Advanced reporting with custom dashboards
- [ ] 🔔 Real-time notifications system
- [ ] 📧 Email templates management
- [ ] 🌐 Multi-language support
- [ ] 🔄 Data backup and restore functionality

### 🚀 Future Enhancements (2026)
- [ ] 📈 Business intelligence dashboard
- [ ] 🤝 Third-party integrations (Slack, Teams, etc.)
- [ ] 📱 Progressive Web App (PWA) support
- [ ] 🌍 Multi-tenant architecture
- [ ] 🔐 Advanced security features (2FA, SSO)

---

<div align="center">

## 🌟 **Built with ❤️ for Modern Businesses** 🌟

### 🚀 **Enterprise-Ready** • 🔒 **Secure** • 📱 **Mobile-Friendly** • ⚡ **Fast**

<br>

**If this project helped you, please ⭐ star it on GitHub!**

<br>

[![GitHub stars](https://img.shields.io/github/stars/Harsha430/ERP?style=social)](https://github.com/Harsha430/ERP/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Harsha430/ERP?style=social)](https://github.com/Harsha430/ERP/network/members)
[![GitHub issues](https://img.shields.io/github/issues/Harsha430/ERP)](https://github.com/Harsha430/ERP/issues)

---


*Made with 💼 for businesses, by developers who care about quality.*

</div>