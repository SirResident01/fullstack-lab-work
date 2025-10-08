# LABORATORY WORK REPORT #3
## Creating Full-Stack Web Application with Next.js and FastAPI

---

## 1. OBJECTIVE

**Main Goal**: Creating a fully functional web application with modern frontend on Next.js and powerful backend on FastAPI for managing cars and their owners.

**Tasks**:
- Development of modern user interface on React/Next.js
- Frontend integration with REST API
- Implementation of full CRUD operations functionality
- Creation of responsive and intuitive interface
- Ensuring performance and usability

---

## 2. TECHNICAL SPECIFICATION

### 2.1 Technology Stack

**Frontend (Next.js)**:
- **Framework**: Next.js 14.0+ with TypeScript
- **Styling**: Tailwind CSS 3.3+ with responsive design
- **State Management**: React Query for caching and data synchronization
- **Forms**: React Hook Form for form management
- **HTTP Client**: Axios for API requests
- **UI Components**: Custom components with TypeScript

**Backend (FastAPI)**:
- **Framework**: FastAPI with Python 3.11+
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Validation**: Pydantic v2 for data validation
- **CORS**: Configured support for frontend

### 2.2 Functional Requirements

**Core Functionality**:
- ✅ Car management (CRUD operations)
- ✅ Owner management (CRUD operations)
- ✅ Advanced search and filtering
- ✅ Statistics and analytics
- ✅ Responsive interface
- ✅ Real-time data updates

**Additional Features**:
- ✅ Automatic data refresh
- ✅ Caching and query optimization
- ✅ Error handling and loading states
- ✅ Modal windows for forms
- ✅ Delete confirmation

---

## 3. PROJECT ARCHITECTURE

### 3.1 Project Structure

```
fullstack-lab-work/
├── app/                          # Backend (FastAPI)
│   ├── main.py                   # Main application
│   ├── models.py                 # SQLAlchemy models
│   ├── schemas.py                # Pydantic schemas
│   ├── crud.py                   # CRUD operations
│   └── db.py                     # Database connection
├── components/                   # Frontend components
│   ├── cars/                     # Car components
│   ├── owners/                   # Owner components
│   ├── search/                   # Search components
│   └── ui/                       # UI components
├── pages/                        # Next.js pages
│   ├── index.tsx                 # Home page
│   ├── cars/simple.tsx           # Car management
│   ├── owners/simple.tsx         # Owner management
│   └── search/simple.tsx         # Search
├── hooks/                        # React hooks
├── lib/                          # Utilities and API client
├── types/                        # TypeScript types
└── styles/                       # Global styles
```

### 3.2 Architectural Principles

**Frontend**:
- **Component Architecture** with reusable components
- **TypeScript Typing** for type safety
- **Reactive State** with React Query
- **Modularity** with clear separation of concerns

**Backend**:
- **RESTful API** with clear endpoint structure
- **Layered Architecture** (controllers, services, repositories)
- **Data Validation** at all levels
- **Error Handling** with detailed messages

---

## 4. IMPLEMENTED FUNCTIONALITY

### 4.1 Home Page (Dashboard)

**File**: `pages/index.tsx`

**Functionality**:
- 📊 **Real-time Statistics** - displaying overall statistics for cars and owners
- 🔄 **Auto-refresh** - data updates every minute
- 📱 **Responsive Design** - correct display on all devices
- 🎯 **Navigation** - quick access to all system sections

**Key Features**:
```typescript
// Auto-refresh data
useAutoRefresh(60000); // Every minute

// Statistics caching
const { data: carStats } = useQuery(
  'carStatistics',
  () => apiClient.getCarStatistics(),
  {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  }
);
```

### 4.2 Car Management

**File**: `pages/cars/simple.tsx`

**Functionality**:
- ✅ **List View** - displaying all cars with detailed information
- ➕ **Adding** - modal form for creating new car
- ✏️ **Editing** - modal form for data modification
- 🗑️ **Deletion** - with action confirmation
- 🔄 **Synchronization** - automatic updates after changes

**Technical Features**:
```typescript
// Mutations with automatic cache invalidation
const createCarMutation = useMutation(
  (carData: CarCreate) => apiClient.createCar(carData),
  {
    onSuccess: () => {
      queryClient.invalidateQueries('cars');
      queryClient.invalidateQueries('carStatistics');
      queryClient.invalidateQueries('ownerStatistics');
    },
  }
);
```

### 4.3 Owner Management

**File**: `pages/owners/simple.tsx`

**Functionality**:
- ✅ **CRUD Operations** - full set of operations with owners
- 🔗 **Car Relations** - displaying owner's cars
- 📊 **Statistics** - number of cars per owner
- 🔍 **Search** - quick search by name or surname

### 4.4 Advanced Search

**File**: `pages/search/simple.tsx`

**Functionality**:
- 🔍 **Multiple Filters** - search by brand, color, year, price
- 📊 **Sorting** - by various fields in ascending/descending order
- 📄 **Pagination** - for large data volumes
- ⚡ **Performance** - optimized API queries

---

## 5. COMPONENT ARCHITECTURE

### 5.1 UI Components

**Base Components** (`components/ui/`):
- `Button.tsx` - Universal button with style variants
- `Card.tsx` - Card for content display
- `Modal.tsx` - Modal window for forms
- `LoadingSpinner.tsx` - Loading indicator
- `Badge.tsx` - Badge for labels

**Specialized Components**:
- `CarCard.tsx` - Car card with actions
- `OwnerCard.tsx` - Owner card
- `SearchFilters.tsx` - Search filters

### 5.2 State Management Hooks

**Files in `hooks/`**:
- `useDataRefresh.ts` - Automatic data refresh
- `useAutoRefresh.ts` - Periodic updates
- `usePersistedState.ts` - State persistence in localStorage
- `useSearchState.ts` - Search state management

---

## 6. API INTEGRATION

### 6.1 API Client

**File**: `lib/api.ts`

**Functionality**:
- 🔗 **Centralized Client** - single point for all API requests
- 📝 **Logging** - detailed logging of requests and responses
- ⚡ **Timeouts** - request timeout configuration
- 🔄 **Interceptors** - request and response handling

```typescript
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000',
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
```

### 6.2 API Typing

**File**: `types/api.ts`

**Structure**:
- **CarCreate, CarUpdate, CarResponse** - car types
- **OwnerCreate, OwnerUpdate, OwnerResponse** - owner types
- **CarQuery, OwnerQuery** - search query types
- **StatusResponse, MessageResponse** - utility types

---

## 7. STYLING AND DESIGN

### 7.1 Tailwind CSS

**Configuration**:
- **Responsive Design** - mobile-first approach
- **Color Scheme** - custom colors for branding
- **Components** - reusable styles
- **Themes** - light/dark theme support

### 7.2 UI/UX Features

**Design System**:
- 🎨 **Modern Interface** - clean and intuitive design
- 📱 **Mobile Adaptation** - correct operation on all devices
- ⚡ **Smooth Animations** - fluid transitions and hover effects
- 🎯 **Clear Navigation** - logical menu structure

**Emoji Icons**:
- 🚗 - Cars
- 👥 - Owners
- 🔍 - Search
- 📊 - Statistics
- ➕ - Add
- ✏️ - Edit
- 🗑️ - Delete

---

## 8. PERFORMANCE AND OPTIMIZATION

### 8.1 React Query

**Caching**:
```typescript
// Cache configuration
const { data: cars } = useQuery(
  'cars',
  () => apiClient.getCars(0, 100),
  {
    keepPreviousData: true, // Keep previous data
    staleTime: 5 * 60 * 1000, // 5 minutes until stale
    cacheTime: 10 * 60 * 1000, // 10 minutes in cache
  }
);
```

**Cache Invalidation**:
```typescript
// Automatic cache invalidation after mutations
const createCarMutation = useMutation(
  (carData: CarCreate) => apiClient.createCar(carData),
  {
    onSuccess: () => {
      queryClient.invalidateQueries('cars');
      queryClient.invalidateQueries('carStatistics');
    },
  }
);
```

### 8.2 Query Optimization

**Lazy Loading**:
- Components loaded on demand
- Data cached for reuse
- Minimized API requests

**Pagination**:
- Limited records per page
- `skip` and `limit` parameters for API
- Optimization for large data volumes

---

## 9. ERROR HANDLING

### 9.1 Loading States

**Indicators**:
```typescript
{carsLoading ? (
  <div className="flex justify-center py-12">
    <LoadingSpinner size="lg" />
  </div>
) : carsError ? (
  <Card>
    <CardBody className="text-center py-12">
      <div className="text-red-600 mb-4">Data loading error</div>
      <Button onClick={() => queryClient.invalidateQueries('cars')}>
        Try Again
      </Button>
    </CardBody>
  </Card>
) : (
  // Data display
)}
```

### 9.2 Form Validation

**Client-side Validation**:
- Required fields marked with `required` attribute
- Field types checked (number, text, email)
- Visual feedback for user

**Server-side Validation**:
- Pydantic schemas for data validation
- Detailed error messages
- HTTP status codes for different error types

---

## 10. TESTING AND DEBUGGING

### 10.1 Development Tools

**Next.js DevTools**:
- Hot Reload for fast development
- Real-time TypeScript checks
- ESLint for code quality

**React Query DevTools**:
- Cache state monitoring
- Request and mutation tracking
- Performance analysis

### 10.2 Logging

**API Logging**:
```typescript
// Request interceptor
this.client.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  }
);

// Response interceptor
this.client.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  }
);
```

---

## 11. RESULTS AND ACHIEVEMENTS

### 11.1 Implemented Functionality

**✅ Full CRUD for Cars**:
- Create, Read, Update, Delete
- Data validation on client and server
- Relations with owners

**✅ Full CRUD for Owners**:
- Owner management
- Cascade deletion of cars
- Owner statistics

**✅ Advanced Search**:
- Multiple filters
- Result sorting
- Data pagination

**✅ Modern UI/UX**:
- Responsive design
- Intuitive navigation
- Smooth animations

### 11.2 Technical Achievements

**Architecture**:
- ✅ Modular project structure
- ✅ TypeScript typing
- ✅ React component architecture
- ✅ RESTful API with FastAPI

**Performance**:
- ✅ React Query caching
- ✅ Optimized queries
- ✅ Lazy component loading
- ✅ Automatic data updates

**Code Quality**:
- ✅ ESLint for code checking
- ✅ TypeScript for type safety
- ✅ Modular components
- ✅ Reusable utilities

---

## 12. EXPANSION POSSIBILITIES

### 12.1 Planned Improvements

**Functionality**:
- 🔐 **Authentication** - login and registration system
- 📊 **Advanced Analytics** - charts and diagrams
- 📱 **PWA** - offline mode support
- 🌐 **Internationalization** - multi-language support

**Technical Improvements**:
- 🧪 **Testing** - unit and integration tests
- 🚀 **CI/CD** - deployment automation
- 📈 **Monitoring** - performance tracking
- 🔒 **Security** - attack protection

### 12.2 Scaling

**Architectural Solutions**:
- Microservice architecture
- Docker containerization
- Load balancing
- Database-level caching

---

## 13. CONCLUSION

### 13.1 Achieved Goals

**Main Goals Completed**:
- ✅ Created fully functional web application
- ✅ Implemented modern user interface
- ✅ Ensured frontend and backend integration
- ✅ Achieved high performance
- ✅ Created convenient and intuitive interface

### 13.2 Technical Skills

**Acquired Competencies**:
- 🎯 **Next.js** - modern React framework
- 🎨 **Tailwind CSS** - utility-first CSS framework
- 🔄 **React Query** - server state management
- 📱 **Responsive Design** - mobile development
- 🔧 **TypeScript** - typed development
- ⚡ **Optimization** - application performance

### 13.3 Practical Value

**Result**:
Created a fully functional car management system demonstrating modern web development approaches. The application is ready for real-world use and can serve as a foundation for more complex projects.

**Key Features**:
- 🚀 **Modern Technologies** - current development stack
- 📱 **Mobile Adaptation** - operation on all devices
- ⚡ **High Performance** - optimized queries
- 🎨 **Convenient Interface** - intuitive navigation
- 🔧 **Quality Code** - typing and modularity

---

## 14. APPENDICES

### 14.1 File Structure

```
fullstack-lab-work/
├── app/                    # Backend (FastAPI)
│   ├── main.py            # 325 lines - main application
│   ├── models.py          # 29 lines - SQLAlchemy models
│   ├── schemas.py         # Pydantic schemas
│   ├── crud.py            # 312 lines - CRUD operations
│   └── db.py              # Database connection
├── components/            # Frontend components
│   ├── cars/              # Car components
│   ├── owners/            # Owner components
│   ├── search/            # Search components
│   └── ui/                # UI components
├── pages/                 # Next.js pages
│   ├── index.tsx          # 272 lines - home page
│   ├── cars/simple.tsx    # 530 lines - car management
│   ├── owners/simple.tsx  # Owner management
│   └── search/simple.tsx  # Search
├── hooks/                 # React hooks
├── lib/                   # Utilities and API client
│   └── api.ts             # 185 lines - API client
├── types/                 # TypeScript types
└── styles/                # Global styles
```

### 14.2 Code Statistics

**Total Volume**:
- **Backend**: ~800 lines of Python code
- **Frontend**: ~1500 lines of TypeScript/React code
- **Components**: 15+ reusable components
- **Pages**: 6 main application pages

**Code Quality**:
- ✅ TypeScript typing
- ✅ ESLint checks
- ✅ Modular architecture
- ✅ Documented code

### 14.3 Project Launch

**Backend**:
```bash
# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```

**Frontend**:
```bash
# Install dependencies
npm install

# Start Next.js in development mode
npm run dev
```

**Access**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

**Laboratory Work #3 Successfully Completed! 🎉**

Created a modern full-stack web application using Next.js and FastAPI, demonstrating advanced web development approaches and ready for real-world use.



