# Backend & Database Architecture for Yogyatha

## 🏗️ **Current State**
- **Frontend**: React with localStorage (temporary solution)
- **Backend**: None (currently frontend-only)
- **Database**: None (using localStorage for demo)

## 🎯 **Required Backend Components**

### **1. Database Schema**

#### **Users Collection**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    age INTEGER,
    gender VARCHAR(10),
    occupation VARCHAR(100),
    state VARCHAR(50),
    category VARCHAR(50),
    net_income VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    role VARCHAR(20) DEFAULT 'user' -- 'user' or 'admin'
);
```

#### **Schemes Collection**
```sql
CREATE TABLE schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    eligibility TEXT,
    benefits TEXT,
    required_documents TEXT[], -- Array of documents
    income_limit VARCHAR(50),
    age_range VARCHAR(50),
    official_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Dynamic filtering criteria
    min_age INTEGER,
    max_age INTEGER,
    max_income DECIMAL(12, 2),
    eligible_states TEXT[], -- Array of states or ['All India']
    eligible_categories TEXT[], -- Array of categories
    gender_specific VARCHAR(10), -- 'male', 'female', 'all'
    occupation_specific TEXT[] -- Array of occupations
);
```

#### **User_Saved_Schemes Collection**
```sql
CREATE TABLE user_saved_schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    scheme_id UUID REFERENCES schemes(id) ON DELETE CASCADE,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, scheme_id) -- Prevent duplicates
);
```

#### **Applications Collection**
```sql
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    scheme_id UUID REFERENCES schemes(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    application_data JSONB, -- Form data
    documents TEXT[], -- Uploaded document paths
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);
```

#### **Notifications Collection**
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **2. API Endpoints**

#### **Authentication Endpoints**
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/profile
PUT  /api/auth/profile
```

#### **Scheme Endpoints**
```
GET  /api/schemes                    # Get all schemes
GET  /api/schemes/:id               # Get specific scheme
GET  /api/schemes/filter            # Dynamic filtering
POST /api/schemes                   # Admin: Create scheme
PUT  /api/schemes/:id              # Admin: Update scheme
DELETE /api/schemes/:id            # Admin: Delete scheme
```

#### **User Endpoints**
```
GET  /api/users                     # Admin: Get all users
GET  /api/users/:id                # Get specific user
PUT  /api/users/:id               # Update user
DELETE /api/users/:id             # Admin: Delete user
```

#### **Saved Schemes Endpoints**
```
GET  /api/users/saved-schemes      # Get user's saved schemes
POST /api/users/saved-schemes      # Save a scheme
DELETE /api/users/saved-schemes/:id # Remove saved scheme
```

#### **Application Endpoints**
```
GET  /api/applications             # Get user's applications
POST /api/applications            # Submit application
GET  /api/applications/:id        # Get application details
PUT  /api/applications/:id       # Update application
```

#### **Notification Endpoints**
```
GET  /api/notifications           # Get user's notifications
PUT  /api/notifications/:id/read # Mark notification as read
POST /api/notifications          # Send notification (admin)
```

### **3. Technology Stack**

#### **Backend Framework Options**
1. **Node.js + Express** (Recommended for this project)
   - JavaScript consistency with frontend
   - Rich ecosystem
   - Easy to learn and maintain

2. **Python + FastAPI**
   - Excellent for data processing
   - Auto API documentation
   - Great for ML integration

3. **Java + Spring Boot**
   - Enterprise-grade
   - Excellent security
   - Scalable

#### **Database Options**
1. **PostgreSQL** (Recommended)
   - Excellent for complex queries
   - JSONB support for flexible data
   - Great for filtering operations

2. **MongoDB**
   - Flexible schema
   - Great for rapid development
   - Good for unstructured data

3. **MySQL**
   - Widely used
   - Good performance
   - Reliable

### **4. Dynamic Filtering Logic**

#### **Advanced Filtering API**
```javascript
// GET /api/schemes/filter
{
  "age": 25,
  "gender": "male",
  "occupation": "farmer",
  "state": "Karnataka",
  "category": "Agriculture",
  "netIncome": "3to6lakh",
  "page": 1,
  "limit": 10
}
```

#### **Backend Filtering Query (PostgreSQL)**
```sql
SELECT * FROM schemes 
WHERE 
  (min_age IS NULL OR $1 >= min_age) AND
  (max_age IS NULL OR $1 <= max_age) AND
  (max_income IS NULL OR $2 <= max_income) AND
  (eligible_states @> ARRAY['All India'] OR $3 = ANY(eligible_states)) AND
  ($4 = ANY(eligible_categories) OR eligible_categories @> ARRAY['All']) AND
  (gender_specific IS NULL OR gender_specific = 'all' OR $5 = gender_specific) AND
  (occupation_specific IS NULL OR $6 = ANY(occupation_specific))
ORDER BY 
  CASE WHEN state = $3 THEN 1 ELSE 2 END, -- State schemes first
  created_at DESC
LIMIT $7 OFFSET $8;
```

### **5. Enhanced Features with Backend**

#### **Real-time Updates**
- **WebSocket connections** for live notifications
- **Server-sent events** for scheme updates
- **Push notifications** for application status

#### **Advanced Analytics**
- **User behavior tracking**
- **Scheme popularity metrics**
- **Application success rates**
- **Regional scheme effectiveness**

#### **Document Management**
- **File upload service** (AWS S3/Google Cloud)
- **Document verification system**
- **OCR for automatic data extraction**
- **Digital signatures**

#### **AI-Powered Recommendations**
- **Machine learning for scheme matching**
- **Personalized recommendations**
- **Eligibility prediction**
- **Application success probability**

### **6. Security Considerations**

#### **Authentication & Authorization**
- **JWT tokens** for API authentication
- **Role-based access control** (RBAC)
- **Rate limiting** for API endpoints
- **CORS configuration**

#### **Data Protection**
- **Encryption at rest** (database)
- **Encryption in transit** (HTTPS)
- **PII protection** for user data
- **GDPR compliance**

#### **API Security**
- **Input validation** and sanitization
- **SQL injection prevention**
- **XSS protection**
- **CSRF tokens**

### **7. Deployment Architecture**

#### **Development Environment**
```
Frontend (React) → API Gateway → Backend Services → Database
```

#### **Production Environment**
```
Load Balancer → API Gateway → Multiple Backend Instances → Database Cluster
                                    ↓
                              Redis Cache
                                    ↓
                              File Storage (S3)
```

### **8. Implementation Priority**

#### **Phase 1: Core Backend (Week 1-2)**
1. **Database setup** (PostgreSQL)
2. **User authentication** (JWT)
3. **Basic CRUD operations**
4. **Scheme management API**

#### **Phase 2: Advanced Features (Week 3-4)**
1. **Dynamic filtering API**
2. **File upload system**
3. **Application tracking**
4. **Notification system**

#### **Phase 3: Enhanced Features (Week 5-6)**
1. **Real-time updates** (WebSockets)
2. **Analytics dashboard**
3. **AI recommendations**
4. **Advanced security**

### **9. Migration Strategy**

#### **From localStorage to Backend**
1. **Data export** from localStorage
2. **Backend API integration**
3. **Gradual feature migration**
4. **Testing and validation**

#### **Data Migration Script**
```javascript
// Export localStorage data
const users = JSON.parse(localStorage.getItem('registered-users') || '[]');
const savedSchemes = {}; // Extract from localStorage

// Import to backend
users.forEach(user => {
  // POST /api/users
  // Migrate saved schemes
});
```

## 🚀 **Next Steps**

1. **Choose technology stack** (Node.js + PostgreSQL recommended)
2. **Set up development environment**
3. **Create database schema**
4. **Implement core APIs**
5. **Integrate with frontend**
6. **Test and deploy**

This architecture will provide a robust, scalable, and feature-rich backend for the Yogyatha platform!
