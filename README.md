# PrimeScope News Server 🚀

Welcome to the server-side of **PrimeScope News**, an innovative newspaper platform that combines technology and journalism to deliver a seamless news consumption experience. This server handles data management, user authentication, premium features, and administrative functionalities.

---

## 📝 **Project Overview**
PrimeScope News is an innovative news aggregation platform designed for dynamic content delivery, premium subscription options, and intuitive user experiences. The server ensures robust backend support for CRUD operations, user management, article management and premium subscription services. 

This platform is tailored to meet the needs of both news readers and content creators, making it a comprehensive solution for digital journalism.

---

## 💡 **Purpose**
The primary goal of PrimeScope News is to revolutionize news consumption through:
- Delivering trending news content in real-time.
- Enabling user-generated articles with an efficient approval system.
- Offering premium subscription-based content access.
- Providing powerful tools for admins to oversee platform activities.
- Provides premium features for subscribed users.
- Supports an admin dashboard for content and user management.
- Offer readers a centralized platform to access trending news and premium articles.
- Provide admins with powerful tools to manage content and users efficiently.
- Empower content creators to publish and share articles seamlessly.

---

## 🛡️ **Admin Information**
- **Username:** ironman@gmail.com  
- **Password:** 123456Aa@ 

---

## 🌐 **Live Site**
Check out the live demo here: [PrimeScope News Live Site](https://b10-assignment-12.web.app/)

---

## ✨ **Features**
- RESTful API design for smooth client-server interaction.
- Secure data storage and retrieval using MongoDB.
- Protected routes for authorized access to sensitive operations.
- Multi-criteria article filtering and search functionality.
- Premium subscription plans with customizable durations.
- Admin tools for managing publishers, articles, and users.
- Real-time notifications for successful operations.
- Dynamic role management for admins and users.
- Middleware for validating and sanitizing data inputs.
- Protected routes with JWT and local storage.
- View count-based trending news.
- Pagination for admin content management.
- Advanced search and filter options for articles.
- Fully functional admin dashboard with data visualization.
- Notifications for CRUD operations and authentication.

---

## 🔑 **Key Functionalities**
1. Email/Password authentication with JWT for protected routes.
2. Role-based access for Admin and Users.
3. CRUD operations for articles and publishers.
4. Dynamic statistics and charts for data visualization.
5. Premium subscription system.
6. Trending news feature based on view count.
7. Role-based access control for users and admins.
8. Real-time view count updates for articles to highlight trending news.

---

## 🛠️ **Technologies Used**
- **Backend Framework:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** Firebase Auth & JWT
- **Environment Management**: dotenv
- **Cross-Origin Resource Sharing**: cors
- **Visualization:** React Google Charts  
- **File Uploads:** imgbb or Cloudinary  
- **Hosting:** Vercel

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

### **Authentication**
- `POST /api/register` - Register a new user.  
- `POST /api/login` - Authenticate user and issue JWT.
  
---

## 📜 **Additional Points**
- **Scalability**: Designed to handle large amounts of data efficiently.
- **Real-time Notifications**: Using Firebase for live updates.
- **Security Features**: Data sanitization and HTTPS support.

---

## 🧮 **Dynamic Features**
- **Trending Articles:** Articles with the highest view count are highlighted dynamically.  
- **Statistics:** Real-time user and article statistics using charts.  
- **Subscription Plans:** Premium content access for subscribed users.  

---


## 🔧 Installation and Usage

1. **Clone the Repository**  
   ```bash
   git clone https://github.com/Programming-Hero-Web-Course4/b10a12-server-side-SK-Jabed.git
