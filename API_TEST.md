# ERP API Testing

## Test API Endpoints

After starting the Spring Boot application on port 8081, you can test these endpoints:

### Test Connection
```bash
curl -X GET "http://localhost:8081/api/hr/employees/test"
```
Expected response: `"API is working!"`

### HR Endpoints
```bash
# Get all employees
curl -X GET "http://localhost:8081/api/hr/employees"

# Get all attendance records
curl -X GET "http://localhost:8081/api/hr/attendance"

# Get all departments
curl -X GET "http://localhost:8081/api/hr/departments"

# Get all leave requests  
curl -X GET "http://localhost:8081/api/hr/leave-requests"
```

### Finance Endpoints
```bash
# Get all accounts
curl -X GET "http://localhost:8081/api/accounts"

# Get all expenses
curl -X GET "http://localhost:8081/api/expenses"
```

## Security Configuration

The `SecurityConfig.java` has been configured to:
- Disable CSRF protection
- Allow public access to all `/api/**` endpoints
- Disable HTTP Basic authentication
- Disable form login

## CORS Configuration

The `CorsConfig.java` allows:
- Origins: `http://localhost:8080` and `http://localhost:3000`
- Methods: GET, POST, PUT, DELETE, OPTIONS
- All headers
- Credentials enabled

## Issues Fixed

1. **Port Conflict**: Backend moved to port 8081, frontend stays on 8080
2. **CORS**: Added configuration to allow cross-origin requests
3. **Security**: Configured to permit all API endpoints
4. **API Paths**: Updated frontend to use correct backend paths (/hr/ prefix for HR APIs)
5. **Missing Endpoints**: Added getAllAttendance() method to AttendanceController and service