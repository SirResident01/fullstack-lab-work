# API Testing Suite for Car Management System

This directory contains comprehensive testing tools for the Car Management System API.

## Test Files

### 1. `test_api_endpoints.py` - Comprehensive API Testing
**Purpose**: Tests all API endpoints with authentication and authorization
**Features**:
- Authentication flow testing (registration, login)
- CRUD operations for cars and owners
- Role-based access control testing
- Admin endpoint testing
- Search and filter functionality
- Error handling validation

**Usage**:
```bash
python test_api_endpoints.py
python test_api_endpoints.py http://localhost:8000
```

### 2. `test_detailed_api.py` - Detailed API Analysis
**Purpose**: In-depth testing with detailed response analysis
**Features**:
- Server health and connectivity tests
- Complete CRUD operation flows
- Analytics endpoint testing
- Admin functionality testing
- Performance testing
- Error handling and edge cases

**Usage**:
```bash
python test_detailed_api.py
python test_detailed_api.py http://localhost:8000
```

### 3. `test_quick.py` - Quick API Validation
**Purpose**: Fast testing of essential endpoints
**Features**:
- Basic connectivity tests
- Authentication flow
- Protected endpoint validation
- Error handling checks

**Usage**:
```bash
python test_quick.py
python test_quick.py http://localhost:8000
```

## Prerequisites

1. **Server Running**: Make sure the FastAPI server is running on `http://localhost:8000`
2. **Python Dependencies**: Install required packages:
   ```bash
   pip install requests
   ```
3. **Database**: Ensure the database is set up and accessible

## Test Categories

### 🔐 Authentication Tests
- User registration (USER role)
- Admin registration (ADMIN role)
- Login with valid credentials
- Login with invalid credentials
- Token validation

### 🚗 Car Management Tests
- GET /cars (authorized/unauthorized)
- POST /cars (admin only)
- PUT /cars/{id} (admin only)
- DELETE /cars/{id} (admin only)
- Car filtering and search

### 👥 Owner Management Tests
- GET /owners (authorized/unauthorized)
- POST /owners (admin only)
- PUT /owners/{id} (admin only)
- DELETE /owners/{id} (admin only)
- Owner search functionality

### 🛡️ Admin Endpoints Tests
- GET /admin/users (admin only)
- GET /admin/users/{id} (admin only)
- PUT /admin/users/{id} (admin only)
- DELETE /admin/users/{id} (admin only)

### 📊 Analytics Tests
- GET /analytics/overview (authenticated users)
- GET /analytics/cars-by-year (authenticated users)
- GET /analytics/owners-stats (authenticated users)

### ⚙️ System Settings Tests
- GET /settings (admin only)
- PUT /settings (admin only)
- GET /settings/backup (admin only)
- GET /settings/logs (admin only)

### 🔍 Search and Filter Tests
- POST /owners/search (authenticated users)
- GET /cars with filters (authenticated users)

### ❌ Error Handling Tests
- Invalid endpoints (404)
- Invalid HTTP methods (405)
- Malformed JSON (400/422)
- Unauthorized access (401)
- Insufficient permissions (403)

## Test Results

### Success Indicators
- ✅ **PASS**: Test completed successfully
- ❌ **FAIL**: Test failed with error details

### Test Summary
Each test suite provides:
- Total number of tests
- Number of passed tests
- Number of failed tests
- Success rate percentage
- Detailed error messages for failed tests

## Running Tests

### 1. Quick Test (Recommended for basic validation)
```bash
python test_quick.py
```

### 2. Comprehensive Test (Full API coverage)
```bash
python test_api_endpoints.py
```

### 3. Detailed Test (In-depth analysis)
```bash
python test_detailed_api.py
```

### 4. Custom Server URL
```bash
python test_api_endpoints.py http://your-server:8000
```

## Expected Results

### ✅ All Tests Should Pass When:
- Server is running on the specified port
- Database is accessible and properly configured
- All API endpoints are implemented
- Authentication system is working
- Role-based access control is properly configured

### ❌ Tests May Fail When:
- Server is not running
- Database connection issues
- Missing API endpoints
- Authentication system not working
- Incorrect role permissions
- Network connectivity issues

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure server is running on the correct port
   - Check if the server URL is correct

2. **Authentication Failures**
   - Verify user registration is working
   - Check if JWT tokens are being generated correctly

3. **Permission Denied (403)**
   - Ensure role-based access control is properly configured
   - Check if the user has the correct role for the endpoint

4. **Database Errors**
   - Verify database connection
   - Check if all required tables exist
   - Ensure database migrations are applied

### Debug Mode
For detailed debugging, modify the test files to include:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Test Data

The tests create temporary data:
- Test users (testuser, testadmin)
- Test cars and owners
- Test analytics data

**Note**: Test data is cleaned up after tests complete, but some data may remain in the database.

## Contributing

To add new tests:
1. Follow the existing test structure
2. Add proper error handling
3. Include detailed logging
4. Update this README with new test descriptions

## Security Notes

- Tests use temporary credentials
- No sensitive data is logged
- Test data is isolated from production
- All test endpoints are properly secured

---

**Total Test Coverage**: 50+ test cases across all API endpoints
**Test Categories**: 8 major categories
**Authentication**: JWT-based with role validation
**Authorization**: Role-based access control (ADMIN/USER)

