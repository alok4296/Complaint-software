# Complaint Management Portal

A complete college-level web application for tracking academic and campus complaints using Node.js, Express.js, MongoDB, and JWT authentication.

## 1. Overview
This project demonstrates a realistic complaint management system for a college campus. It includes separate dashboards for students, staff, and administrators. Students can submit issues and view updates, while staff can resolve and update assigned complaints, and admins can manage the overall system with categories, departments, and reporting.

## 2. Features
- User registration and login with JWT
- Role-based access: student, staff, admin
- Complaint submission with title, category, department, priority, location, description, and file upload
- Complaint history tracking
- Admin assignment and status changes
- Staff resolution updates and evidence upload
- Notification system
- Feedback after resolution
- Dashboard cards and chart support
- Responsive front-end pages

## 3. Tech Stack
- Frontend: HTML, CSS, Bootstrap 5, Vanilla JavaScript
- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose
- Authentication: JWT + bcryptjs
- File Uploads: Multer
- Environment Variables: dotenv
- CORS enabled

## 4. Project Structure
```text
complaint-management-portal/
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── student-dashboard.html
│   ├── submit-complaint.html
│   ├── my-complaints.html
│   ├── complaint-details.html
│   ├── admin-dashboard.html
│   ├── manage-users.html
│   ├── manage-categories.html
│   ├── css/
│   └── js/
├── backend/
│   ├── server.js
│   ├── seed.js
│   ├── initDemoData.js
│   ├── config/
│   ├── models/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   └── uploads/
├── .env
├── .gitignore
├── package.json
├── README.md
└── package-lock.json
```

## 5. Installation
1. Open the project folder.
2. Run:
```bash
npm install
```
3. Ensure MongoDB is available or use the built-in fallback in-memory database for demo mode.

## 6. MongoDB Setup
For a local database, update the `.env` file:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/complaint-management-portal
```
If MongoDB is not running, the app falls back to an in-memory local database so the project still works in lab/demo environments.

## 7. Environment Variables
File: `.env`
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/complaint-management-portal
JWT_SECRET=college-complaint-management-secret-key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5500
UPLOAD_PATH=backend/uploads
MAX_FILE_SIZE=5242880
```

## 8. How to Run the Backend
```bash
npm start
```
Or for development:
```bash
npm run dev
```

## 9. How to Run the Frontend
Open the HTML files directly from the `frontend` folder in a browser, or use a local static server:
```bash
npx serve frontend
```
Then open the URL shown by the server, usually:
```text
http://localhost:3000
```

## 10. Default Demo Accounts
The app seeds demo users automatically when the database is empty.

- Admin: admin@college.edu / Admin@123
- Staff: staff1@college.edu / Staff@123
- Student: student1@college.edu / Student@123

## 11. API Overview
### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/users/profile`

### Complaints
- `POST /api/complaints`
- `GET /api/complaints/my`
- `GET /api/complaints/:id`
- `PUT /api/complaints/:id`
- `POST /api/complaints/:id/reopen`

### Admin
- `GET /api/admin/complaints`
- `PUT /api/admin/complaints/:id/assign`
- `PUT /api/admin/complaints/:id/status`
- `GET /api/admin/stats`

### Data Management
- `GET /api/categories`
- `POST /api/categories`
- `PUT /api/categories/:id`
- `DELETE /api/categories/:id`
- `GET /api/departments`
- `POST /api/departments`

### Notifications and Feedback
- `GET /api/notifications`
- `PUT /api/notifications/:id/read`
- `POST /api/feedback`

## 12. Future Enhancements
- Full staff assignment UI and complaint editing forms
- Admin report export to PDF/Excel
- Email notifications
- Deeper dashboard analytics and chart filters
- Search by date and complaint status

## 13. Viva Demonstration Checklist
Before presenting the project, verify the following:
1. Student registration works.
2. Student login works.
3. Complaint submission is saved to the database.
4. Student can view complaint details.
5. Admin can see all complaints.
6. Admin can assign staff.
7. Staff can update complaint status.
8. Student sees updated status.
9. Feedback can be submitted after resolution.
10. Unauthorized access is blocked.

## 14. Notes
This project is intentionally built in a simple, readable way so it can be explained easily in a college viva. It follows the MVC-style backend structure, uses real database models, and demonstrates login, route protection, file upload, and CRUD operations in a working project.
