# Campus Connect - School Management System

A comprehensive school management system with real-time assignment management, fee tracking, messaging, and result publishing capabilities.

## 🚀 Features

### Assignment Management System
- **Faculty Features:**
  - Create assignments with file attachments (PDF, JPG, PNG)
  - Set due dates, maximum marks, and detailed descriptions
  - View all assignments with filtering options
  - Track student submissions
  - Grade assignments and provide feedback
  - Real-time notifications for new submissions

- **Student Features:**
  - View all assigned assignments
  - Download assignment files
  - Submit assignments with file uploads
  - Track submission status and grades
  - Real-time updates for new assignments

### Real-time Updates
- **Live Notifications:** Instant notifications for new assignments, messages, and results
- **Fee Management:** Real-time fee status updates and payment tracking
- **Message System:** Direct communication between faculty, students, and administration
- **Result Publishing:** Instant result updates with grades and rankings

### File Management
- **Multi-format Support:** PDF, JPG, PNG file uploads and downloads
- **Firebase Storage Integration:** Secure cloud storage for all files
- **File Preview:** Visual file preview before download
- **Size Validation:** Automatic file size and type validation

### User Roles
- **Admin:** Complete system administration and oversight
- **Faculty:** Assignment creation, grading, and student management
- **Student:** Assignment submission, result viewing, fee tracking
- **Parent:** Child progress monitoring and communication

## 🛠️ Technology Stack

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Backend:** Firebase (Firestore, Storage, Authentication)
- **Real-time:** Firebase Realtime Database
- **Styling:** Custom CSS with responsive design
- **Icons:** Font Awesome 6.0

## 📁 Project Structure

```
CAMPUS CONNECT/
├── index.html                  # Landing page with login
├── faculty-dashboard.html      # Faculty portal
├── student-dashboard.html      # Student portal
├── admin-dashboard.html        # Admin portal
├── parent-dashboard.html       # Parent portal
├── styles.css                  # Main stylesheet
├── dashboard-styles.css        # Dashboard-specific styles
├── main.js                     # Core application logic
├── firebase-config.js          # Firebase configuration
├── assignment-management.js    # Assignment system
├── realtime-updates.js         # Real-time updates
├── demo-data.js               # Sample data initialization
└── module-integration.js      # Module integration system
```

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Firebase project setup (optional for demo)

### Installation
1. Clone or download the project files
2. Open `index.html` in your web browser
3. The system will initialize with demo data automatically

### Demo Credentials
- **Admin:** admin / admin123
- **Faculty:** faculty / faculty123
- **Student:** student / student123
- **Parent:** parent / parent123

## 📱 Usage Guide

### For Faculty
1. **Login** with faculty credentials
2. **Navigate** to Assignments section
3. **Create Assignment:**
   - Click "Create Assignment" button
   - Fill in assignment details
   - Upload files (PDF, JPG, PNG)
   - Set due date and maximum marks
   - Publish assignment
4. **Track Submissions:**
   - View all student submissions
   - Grade assignments
   - Provide feedback

### For Students
1. **Login** with student credentials
2. **View Assignments:**
   - See all assigned work
   - Filter by status (pending, submitted, graded)
   - Download assignment files
3. **Submit Assignments:**
   - Click "Submit" on any pending assignment
   - Upload your work files
   - Add comments if needed
   - Submit before due date
4. **Track Progress:**
   - View submission status
   - Check grades and feedback
   - Monitor fee status
   - Read messages and notifications

### Real-time Features
- **Live Updates:** All changes appear instantly across all user interfaces
- **Notifications:** Toast notifications for important updates
- **Status Tracking:** Real-time status updates for assignments, fees, and messages
- **Auto-refresh:** Data refreshes automatically without page reload

## 🎨 UI/UX Features

### Responsive Design
- Mobile-first approach
- Adaptive layouts for all screen sizes
- Touch-friendly interface elements

### Modern Interface
- Clean, professional design
- Intuitive navigation
- Color-coded status indicators
- Smooth animations and transitions

### Accessibility
- Keyboard navigation support
- Screen reader compatibility
- High contrast color schemes
- Clear typography and spacing

## 🔧 Configuration

### Firebase Setup (Optional)
1. Create a Firebase project
2. Enable Firestore Database
3. Enable Firebase Storage
4. Update `firebase-config.js` with your project credentials

### Customization
- Modify user roles in `main.js`
- Update demo data in `demo-data.js`
- Customize styling in CSS files
- Add new features in respective JavaScript files

## 📊 Database Schema

### Collections
- **assignments:** Assignment details and metadata
- **assignment_submissions:** Student submissions and grades
- **fees:** Fee records and payment status
- **messages:** Communication between users
- **notifications:** System notifications
- **results:** Academic results and grades
- **announcements:** School-wide announcements

### File Storage
- **assignments/:** Faculty-uploaded assignment files
- **submissions/:** Student-submitted work files

## 🔒 Security Features

- **Role-based Access:** Different permissions for each user type
- **File Validation:** Type and size validation for uploads
- **Data Validation:** Input sanitization and validation
- **Secure Storage:** Firebase security rules for data protection

## 🚀 Future Enhancements

- **Mobile App:** Native mobile applications
- **Video Support:** Video assignment submissions
- **Advanced Analytics:** Detailed performance metrics
- **Integration:** Third-party tool integrations
- **Offline Support:** Offline functionality with sync

## 🤝 Contributing

1. Fork the project
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue in the project repository
- Contact the development team
- Check the documentation for common solutions

## 🎯 Key Benefits

- **Seamless Workflow:** Streamlined assignment management process
- **Real-time Communication:** Instant updates and notifications
- **File Management:** Easy upload and download of various file formats
- **User-friendly:** Intuitive interface for all user types
- **Scalable:** Built to handle growing user base
- **Secure:** Robust security measures and data protection

---

**Campus Connect** - Connecting education through technology! 🎓✨


