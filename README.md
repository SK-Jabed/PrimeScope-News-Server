# PrimeScope News Server 🚀

Welcome to the server-side of **PrimeScope News**, an innovative newspaper platform that combines technology and journalism to deliver a seamless news consumption experience. This server handles data management, user authentication, premium features, and administrative functionalities.

---

## 📄 

## 📝 **Project Overview**
PrimeScope News is an innovative news aggregation platform designed for dynamic content delivery, premium subscription options, and intuitive user experiences. The server ensures robust backend support for CRUD operations, user management, article management and premium subscription services. 

This platform is tailored to meet the needs of both news readers and content creators, making it a comprehensive solution for digital journalism.

---

## 📖 


## 💡 **Purpose**
The primary goal of PrimeScope News is to revolutionize news consumption through:
- Delivering trending news content in real-time.
- Offering premium subscription-based content access.
- Enabling user-generated articles with an efficient approval system.
- Providing powerful tools for admins to oversee platform activities.
- Aggregates trending articles.
- Allows user-generated content.
- Provides premium features for subscribed users.
- Supports an admin dashboard for content and user management.
1. Offer readers a centralized platform to access trending news and premium articles.
2. Empower content creators to publish and share articles seamlessly.
3. Provide admins with powerful tools to manage content and users efficiently.

With a focus on scalability and responsiveness, this project ensures seamless performance and a superior user experience.

---


## 🔑 **Admin Information**
- **Username:** admin@example.com
- **Password:** admin123

---

## 🌐 Live Site

Check out the live demo here: [PrimeScope News Live Site](https://b10-assignment-11-753d2.web.app/)

---


## 🌟 Features

## ✨ **Features**
- RESTful API design for smooth client-server interaction.
- Secure data storage and retrieval using MongoDB.
- Protected routes for authorized access to sensitive operations.
- Multi-criteria article filtering and search functionality.
- Subscription plans to access premium articles.
- Admin tools for managing publishers, articles, and users.
- Real-time notifications for successful operations.

- Dynamic role management for admins and users.
- Real-time trending news updates based on article views.
- Clean and maintainable code with modular architecture.
- Middleware for validating and sanitizing data inputs.
- Fully responsive design for mobile, tablet, and desktop users.
- Token-based authentication for secure access.
- Secure JWT-based authentication for private routes.
- Protected routes with JWT and local storage.
- Multi-filter and search for articles.
- Dynamic charts for admin dashboard.
- File upload via imgbb/Cloudinary.
- View count-based trending news.
- Pagination for admin content management.
- Advanced search and filter options for articles.
- Fully functional admin dashboard with data visualization.
- Premium subscription plans with customizable durations.
- Notifications for CRUD operations and authentication.
---

---

## ✨ **Features at a Glance**

---


---

## ⚙️ **Key Functionalities**
1. Email/Password authentication with JWT for protected routes.
2. Role-based access for Admin and Users.
3. CRUD operations for articles and publishers.
4. Dynamic statistics and charts for data visualization.
5. Premium subscription system.
6. Trending news feature based on view count.
- Secure authentication using JWT for private routes.
- Role-based access control for users and admins.
- Real-time view count updates for articles to highlight trending news.
- File uploads for article images via imgbb or Cloudinary.
- Dynamic data visualization using charts in the admin dashboard.
- Premium subscription management with limited-time access.
---


## 🔑 Key Functionalities
- **Item Management**  
  - Create, update, delete, and fetch items.  
  - Filter items based on their Date.  

- **User Management**  
  - Manage user data and authentication-related operations.
  - Maintain a user database with secure data handling. 

- **Database management**
  - Database integration with MongoDB for efficient storage.
  - Record and fetch lost and found items efficiently. 

- **API-First Design**  
  - RESTful API endpoints for seamless integration with the client side.
  - Optimized database queries for efficient searches.
 
---


## 🛠️ **Technologies Used**
- **Backend Framework:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** Firebase Auth & JWT
- **Hosting:** Render/Heroku, Vercel
- **Environment Management**: dotenv
- **Cross-Origin Resource Sharing**: cors
- **Backend Framework:** Node.js, Express.js  
- **Database:** MongoDB with Mongoose ORM  
- **Authentication:** Firebase and JSON Web Token (JWT)  
- **Hosting:** Render/Heroku  
- **File Uploads:** imgbb or Cloudinary  

- **Backend:** Node.js, Express.js  
- **Database:** MongoDB with Mongoose  
- **Authentication:** Firebase Auth, JWT  
- **Visualization:** React Google Charts  
- **Hosting:** Render/Heroku  
- **Others:** imgbb/Cloudinary for image uploads  
---
---


## 📦 NPM Packages Used
- `dotenv`: For environment variable management.
- `express`: For backend data management
- `cors`: Handling Cross-Origin Requests.
- `jsonwebtoken`: For user authentication.
- `express-validator`: Validating incoming requests.

## 📦 **NPM Packages Used**
- `express`
- `mongoose`
- `jsonwebtoken`
- `cors`
- `dotenv`
- `bcryptjs`
- `multer`
- `imgbb-uploader`
- `react-google-charts`
- `tanstack-query`

---

## 📦 **NPM Packages Used**
- `express` - Web application framework  
- `mongoose` - MongoDB ORM  
- `jsonwebtoken` - Token-based authentication  
- `dotenv` - Environment variable management  
- `bcryptjs` - Password hashing  
- `cors` - Cross-Origin Resource Sharing  
- `multer` - File upload handling  
- `imgbb-uploader` - Image hosting integration  
- `react-google-charts` - Data visualization  

---


---

## 🗂️ **API Overview**
PrimeScope News provides a robust RESTful API to manage users, articles, and subscriptions.

---

## 📍 **API Endpoints**

### **User**
- `POST /api/register` - Register a new user.
- `POST /api/login` - User login with JWT token generation.
- `GET /api/users` - Get all users (Admin only).
- `PATCH /api/users/:id` - Update user role or information.

### **Articles**
- `POST /api/articles` - Add a new article.
- `GET /api/articles` - Fetch all approved articles.
- `GET /api/articles/:id` - Fetch single article details.
- `PATCH /api/articles/:id` - Approve, decline, or update articles (Admin only).

### **Publishers**
- `POST /api/publishers` - Add a new publisher (Admin only).
- `GET /api/publishers` - Get all publishers.

---

---

## 📍 **API Endpoints**

### **Authentication**
- `POST /api/register` - Register a new user.  
- `POST /api/login` - Authenticate user and issue JWT.  

### **Users**
- `GET /api/users` - Fetch all users (Admin-only).  
- `PATCH /api/users/:id` - Update user roles or details.  

### **Articles**
- `GET /api/articles` - Retrieve all approved articles.  
- `POST /api/articles` - Add a new article.  
- `PATCH /api/articles/:id` - Approve, decline, or mark articles as premium (Admin-only).  
- `PUT /api/articles/:id/views` - Increment article view count.  

### **Publishers**
- `POST /api/publishers` - Add a publisher (Admin-only).  
- `GET /api/publishers` - Fetch all publishers.  

---


## 🔍 **API Documentation**
- **Authentication:**
  - `POST /api/register` - Register a user.
  - `POST /api/login` - User login with JWT issuance.

- **Articles:**
  - `POST /api/articles` - Submit a new article.
  - `GET /api/articles` - Fetch all approved articles.
  - `PATCH /api/articles/:id` - Update or approve articles (Admin-only).

- **Publishers:**
  - `POST /api/publishers` - Add a new publisher (Admin-only).
  - `GET /api/publishers` - Retrieve publishers list.

---

## 💡 API Endpoints
| Method | Endpoint             | Description                       |
|--------|----------------------|-----------------------------------|
| POST   | `/auth/register`     | Register a new user               |
| POST   | `/auth/login`        | User authentication               |
| GET    | `/items`             | Get all lost/found items          |
| POST   | `/items`             | Post a new lost/found item        |
| PUT    | `/items/:id`         | Update an existing item           |
| DELETE | `/items/:id`         | Delete an item                    |

---

🛡️
---

## 🔍 **Additional Points**
- Environment variables are used to hide sensitive information like Firebase config and MongoDB credentials.
- Fully responsive UI, including the dashboard and all pages.
- Real-time notifications for CRUD operations.

---
## 📜 Additional Points
- **Scalability**: Designed to handle large amounts of data efficiently.
- **Real-time Notifications**: Using Firebase for live updates.
- **Security Features**: Data sanitization and HTTPS support.

---

---

## 🧮 **Dynamic Features**
- **Trending Articles:** Articles with the highest view count are highlighted dynamically.  
- **Statistics:** Real-time user and article statistics using charts.  
- **Subscription Plans:** Premium content access for subscribed users.  

---


## 🔧 Installation and Usage

1. **Clone the Repository**  
   ```bash
   git clone https://github.com/your-username/fundsphere-server.git
   cd fundsphere-server



---

## 📋 **Installation Steps**
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/primescope-news-server.git


   ## 📋 **Installation**

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/primescope-news-server.git

   ---

## 📥 **Installation**

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/primescope-news-server.git