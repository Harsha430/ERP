# 🏢 Enterprise Resource Planning (ERP) System

A comprehensive, full-stack ERP system built with **Spring Boot** and **React** that manages HR, Finance, and Administrative operations for modern businesses.

![ERP System](https://img.shields.io/badge/ERP-System-blue?style=for-the-badge)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-green?style=for-the-badge&logo=spring)
![React](https://img.shields.io/badge/React-18.x-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?style=for-the-badge&logo=mongodb)

## 🚀 Features Overview

### 👥 Human Resources (HR) Module
- **Employee Management** - Complete employee lifecycle management
- **Department & Position Management** - Organizational structure
- **Attendance Tracking** - Daily attendance with status management
- **Leave Management** - Leave requests, approvals, and balance tracking
- **Payroll System** - Automated payslip generation with finance integration
- **Employee Reports** - Comprehensive HR analytics

### 💰 Finance Module
- **Accounts Management** - Chart of accounts with double-entry bookkeeping
- **Invoice Management** - Customer invoicing and payment tracking
- **Expense Management** - Expense categorization and approval workflow
- **Budget Management** - Budget planning, tracking, and variance analysis
- **Financial Reports** - P&L, Balance Sheet, Cash Flow, and custom reports
- **Transaction Management** - Unified view of all financial transactions
- **Payroll Integration** - Seamless HR-Finance payroll workflow

### 🔐 Administration Module
- **User Management** - Role-based access control
- **Security** - JWT authentication and authorization
- **System Configuration** - Application settings and preferences
- **Audit Trails** - Complete system activity logging

## 🛠️ Technology Stack

### Backend
- **Framework**: Spring Boot 3.x
- **Language**: Java 17
- **Database**: MongoDB
- **Security**: Spring Security with JWT
- **Documentation**: OpenAPI/Swagger
- **Build Tool**: Maven

### Frontend
- **Framework**: React 18.x with TypeScript
- **UI Library**: Tailwind CSS + shadcn/ui
- **State Management**: TanStack Query (React Query)
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Build Tool**: Vite

### Development Tools
- **IDE**: IntelliJ IDEA / VS Code
- **Version Control**: Git
- **API Testing**: Postman
- **Database GUI**: MongoDB Compass

## 📋 Prerequisites

Before running this application, make sure you have:

- **Java 17** or higher
- **Node.js 18** or higher
- **MongoDB** (local or cloud instance)
- **Maven 3.6** or higher
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Harsha430/ERP.git
cd ERP
```

### 2. Backend Setup
```bash
# Navigate to backend directory (if separate) or stay in root
cd backend  # or stay in root if backend is in root

# Configure MongoDB connection
# Edit src/main/resources/application.properties
spring.data.mongodb.uri=mongodb://localhost:27017/erp_db

# Build and run the backend
mvn clean install
mvn spring-boot:run
```

The backend will start on `http://localhost:8081`

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start on `http://localhost:5173`

### 4. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8081/api
- **API Documentation**: http://localhost:8081/swagger-ui.html

## 👤 Default Login Credentials

The system comes with pre-configured user accounts:

### Admin User
- **Username**: `admin@erp.com`
- **Password**: `admin123`
- **Role**: Administrator

### HR User
- **Username**: `hr@erp.com`
- **Password**: `hr123`
- **Role**: HR Manager

### Finance User
- **Username**: `finance@erp.com`
- **Password**: `finance123`
- **Role**: Finance Manager

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
- **Payroll Processing**: Automated salary calculation with tax deductions
- **Performance Tracking**: Employee performance reviews and ratings

### Finance Module Features
- **Double-Entry Bookkeeping**: Automatic journal and ledger entries
- **Invoice Lifecycle**: From creation to payment with aging reports
- **Expense Management**: Multi-level approval with receipt management
- **Budget Planning**: Annual/quarterly budgets with variance analysis
- **Financial Reporting**: Real-time P&L, Balance Sheet, and Cash Flow

### Integration Features
- **HR-Finance Integration**: Payroll automatically creates finance transactions
- **Real-time Synchronization**: Data consistency across modules
- **Audit Trail**: Complete transaction history and user activity logs
- **Role-based Access**: Granular permissions for different user roles

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

## 🔄 Changelog

### Version 1.0.0 (Latest)
- ✅ Complete HR module with employee, attendance, leave, and payroll management
- ✅ Full Finance module with accounts, invoices, expenses, budgets, and reports
- ✅ Admin module with user management and system configuration
- ✅ JWT-based authentication and role-based authorization
- ✅ Modern React frontend with TypeScript and Tailwind CSS
- ✅ Comprehensive API documentation with Swagger
- ✅ Docker support for easy deployment
- ✅ Extensive test coverage

---

**Built with ❤️ for modern businesses**