# LearnHub
# LearnHub – Online Learning Platform

Full Stack MERN Application
Version 1.0 | February 2026

LearnHub is a comprehensive full-stack Online Learning Platform (OLP) developed using the MERN stack — MongoDB, Express.js, React.js, and Node.js 

The platform bridges educators and learners by providing a scalable, feature-rich environment for course creation, management, and consumption.

## 🚀 Technology Stack
**Frontend**

* React.js
* Vite
* Bootstrap 5
* Material UI (MUI)
* Ant Design (Antd)
* MDB React UI Kit
* Axios

**Backend**

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* bcryptjs
* Multer
* dotenv
* cors

## User Roles

LearnHub implements Role-Based Access Control (RBAC) with three roles 

### Teacher

* Create, edit, delete courses
* Add/remove course sections
* View enrollment statistics
* Access Teacher Dashboard

### Student

* Browse and search courses
* Enroll in free/paid courses
* Track progress
* Download certificate
* Access Student Dashboard

### Admin

* Manage all users
* Manage all courses
* View enrollment records
* Access Admin Panel

## 📂 Project Structure

The project is divided into two main directories:

* `frontend/`
* `backend/`


## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```
git clone <repository-url>
cd learnhub
```

### 2️⃣ Install Frontend Dependencies

```
cd frontend
npm install
```

### 3️⃣ Install Backend Dependencies

```
cd backend
npm install
```

### 4️⃣ Configure Environment Variables

Create a `.env` file inside the backend folder:

```
MONGO_URI=mongodb://localhost:27017/learnhub
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
```

### 5️⃣ Start Development Servers

Backend:

```
cd backend
npm start
```

Frontend:

```
cd frontend
npm run dev
```

Application URLs:

* Frontend: [http://localhost:5172](http://localhost:5172)
* Backend: [http://localhost:5000](http://localhost:5000)

## 🔐 Authentication

* JWT-based authentication
* Role-based route protection
* bcrypt password hashing
* Protected API endpoints

## 📡 API Endpoints

### Authentication APIs

* POST `/api/auth/register`
* POST `/api/auth/login`
* GET `/api/auth/profile`
* PUT `/api/auth/profile`

### Course APIs

* GET `/api/courses`
* GET `/api/courses/:id`
* POST `/api/courses`
* PUT `/api/courses/:id`
* DELETE `/api/courses/:id`

### Enrollment APIs

* POST `/api/enrollments/:courseId`
* GET `/api/enrollments/my-courses`
* GET `/api/enrollments/all`
* PUT `/api/enrollments/:courseId/progress`
* GET `/api/enrollments/:courseId/certificate


## UI Screens

* **Figure 3: LearnHub Landing Page**
<img width="1920" height="1008" alt="Screenshot 2026-02-23 143024" src="https://github.com/user-attachments/assets/19711310-b88f-41e8-a4a7-37e70e7b54c3" />

* **Figure 4: User Registration Page**
* <img width="1920" height="1008" alt="Screenshot 2026-02-22 183707" src="https://github.com/user-attachments/assets/24c285f2-bd6a-4020-9c20-52a855652838" />

* **Figure 5: User Login Page**
* <img width="1920" height="1008" alt="Screenshot 2026-02-22 183731" src="https://github.com/user-attachments/assets/080c34e7-f2ee-4f3a-8e0b-bbdf9a0a8504" />

* **Figure 6: Teacher Dashboard**
* <img width="1920" height="1008" alt="Screenshot 2026-02-22 183445" src="https://github.com/user-attachments/assets/cae4aaf3-30cd-4ad2-9cef-175a75d1248a" />


* **Figure 7: Student Dashboard**
* <img width="1920" height="1008" alt="image" src="https://github.com/user-attachments/assets/314d0a74-6747-4afe-a1de-4925a48ad37a" />
* 
* **Figure 8: Course Detail Page**
* <img width="1920" height="1008" alt="Screenshot 2026-02-23 095107" src="https://github.com/user-attachments/assets/36814cba-95cb-482b-b721-2d42436ae75f" />


* **Figure 9: Certificate of Completion**
* <img width="1920" height="1008" alt="image" src="https://github.com/user-attachments/assets/bb94e613-5048-493a-866a-e7d4491e5605" />


## 🧪 Testing

All major functionalities were manually tested including:

* User Registration
* Login & JWT Protection
* Course Creation/Update/Delete
* Student Enrollment
* Progress Tracking
* Certificate Download
* Role-Based Access
* Password Hashing

## ⚠️ Known Issues

* Minor CSS alignment issues on small mobile screens
* No pagination on course listing
* Large file uploads may timeout

## 🔮 Future Enhancements

* Payment Gateway Integration (Stripe/Razorpay)
* Video Streaming Support
* Automated Certificate PDF Generation
* AI-Based Course Recommendations
* Cloud Deployment
* Real-Time Notifications
* Discussion Forums
* Mobile App (React Native)
* Database Indexing & Optimization
* Automated Testing

#  Conclusion

LearnHub demonstrates the power of the MERN stack in building a full-featured, scalable online learning platform covering authentication, course management, enrollment tracking, and certificate generation 

