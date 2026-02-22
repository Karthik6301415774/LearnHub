LearnHub: – Your Center for Skill Enhancement

LearnHub is an Online Learning Platform (OLP) designed to provide flexible, accessible, and interactive learning experiences for students and professionals. The platform allows users to enroll in courses, track progress, interact with instructors, and earn certifications.

Features:
For Students:

User Registration & Login

Browse Courses by Category, Name, and Difficulty

Enroll in Free & Paid Courses

Self-Paced Learning

Track Learning Progress

Participate in Discussion Forums & Webinars

Download Course Completion Certificates

For Instructors:

Create and Upload Courses

Add Modules & Assignments

Monitor Student Enrollments

Manage Course Content

For Admin:

Manage Users & Courses

Monitor Platform Activity

Handle Issues & Maintain System Integrity

Technical Architecture:

The LearnHub application follows a Client-Server Architecture.

🔹 Frontend (Client Side):

React.js

Bootstrap

Material UI

Axios (for REST API communication)

🔹 Backend (Server Side):

Node.js

Express.js

MongoDB (Database)

🔹 Architecture Flow:

User interacts with the frontend (React UI).

Axios sends HTTP requests to backend REST APIs.

Express.js processes the request.

MongoDB stores/retrieves data.

Response is sent back to frontend.
Project Structure:
LearnHub/
│
├── client/                 # Frontend (React)
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/                 # Backend (Node + Express)
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   └── server.js
│
└── README.md

 Installation & Setup Guide (VS Code):
1️⃣ Clone the Repository
git clone https://github.com/your-username/learnhub.git
cd learnhub
2️⃣ Open in VS Code
code .
3️⃣ Setup Backend
cd server
npm install

Create a .env file inside the server folder:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

Run the backend server:

npm start

Backend runs on:

http://localhost:5000
4️⃣ Setup Frontend

Open new terminal:

cd client
npm install
npm start

Frontend runs on:

http://localhost:3000

Database:

We use MongoDB for:

User Authentication Data

Course Details

Enrollment Records

Certification Data

Payment Information

Payment Integration:

Supports Paid Courses

Secure Payment Processing

Access to Premium Content After Purchase

Certification:

Automatic certificate generation after:

Completing all modules

Passing final assessment

Downloadable Digital Certificate

Future Enhancements:

AI-Based Course Recommendations

Real-Time Chat System

Mobile Application

Role-Based Dashboard

Advanced Analytics

Use Case Scenario:

Sarah registers → Browses Web Development course → Enrolls → Learns at her own pace → Interacts in forums → Completes final exam → Downloads certificate → Purchases advanced course.

Meanwhile:

Instructor uploads new content

Admin monitors the platform

Security Features:

JWT Authentication

Password Encryption

Secure REST APIs

Role-Based Access Control

Developed By:

Karthik C
B.Tech – Artificial Intelligence
SVCET College, Chittoor

Conclusion:

LearnHub provides a complete online learning ecosystem with:

Flexible Learning

Instructor Management

Certification:

Paid & Free Course Model

Secure and Scalable Architecture
