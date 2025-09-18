# JobHub - Full-Stack Job Portal Application

A comprehensive job portal application built with the MERN stack, featuring role-based authentication, real-time chat, and advanced job matching.

## 🚀 Features

### Core Features
- **Role-based Authentication**: Job Seekers, Employers, and Admins with JWT-based authentication
- **Advanced Job Search**: Filter by location, type, category, experience level, and salary
- **Job Categories**: 
  - Skilled positions
  - Non-skilled jobs with training provided
  - Deferred-hire positions (start after 3-6 months)
- **Application Tracking**: Complete application lifecycle management
- **Real-time Chat**: Direct communication between employers and job seekers
- **File Upload**: Resume and company logo upload with cloud storage
- **Email Notifications**: Application updates and important notifications
- **Admin Panel**: User moderation, analytics, and system management

### Technical Features
- **Modern Frontend**: Next.js 13+ with App Router, TypeScript, and Tailwind CSS
- **Component Library**: shadcn/ui for consistent, accessible UI components
- **State Management**: React Query for server state management
- **Form Handling**: react-hook-form with zod validation
- **Real-time Communication**: Socket.io for instant messaging
- **File Storage**: Cloudinary integration for media uploads
- **Database**: MongoDB with Mongoose ODM
- **API**: RESTful API with Express.js and comprehensive error handling

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 13+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **State Management**: TanStack React Query
- **Forms**: react-hook-form + zod
- **Real-time**: Socket.io Client

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcryptjs
- **File Upload**: Multer + Cloudinary
- **Email**: Nodemailer
- **Real-time**: Socket.io
- **Validation**: express-validator

## 📋 Prerequisites

- Node.js (v18+ recommended)
- MongoDB (local or cloud instance)
- Git

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone <repository-url>
cd jobhub
```

### 2. Install Dependencies

#### Frontend Dependencies
```bash
npm install
```

#### Backend Dependencies
```bash
cd server
npm install
cd ..
```

### 3. Environment Setup

#### Frontend Environment (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

#### Backend Environment (server/.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/jobhub
JWT_SECRET=your-super-secret-jwt-key-here
FRONTEND_URL=http://localhost:3000
```

### 4. Database Setup

Make sure MongoDB is running locally or update the MONGODB_URI with your cloud database connection string.

### 5. Start Development Servers

#### Start Backend (Terminal 1)
```bash
cd server
npm run dev
```

#### Start Frontend (Terminal 2)
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📁 Project Structure

```
jobhub/
├── app/                    # Next.js App Router pages
├── components/             # React components
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Layout components
│   └── landing/           # Landing page components
├── contexts/              # React contexts
├── lib/                   # Utility libraries
│   └── api/               # API client functions
├── middleware.ts          # Next.js middleware
├── server/                # Backend application
│   ├── src/
│   │   ├── config/        # Database and app configuration
│   │   ├── controllers/   # Request handlers
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # API routes
│   │   ├── sockets/       # Socket.io handlers
│   │   └── utils/         # Utility functions
│   └── package.json
└── package.json
```

## 🔐 Authentication & Authorization

### User Roles
- **Job Seeker**: Search jobs, apply, manage applications, chat with employers
- **Employer**: Post jobs, manage applications, chat with candidates
- **Admin**: System administration, user management, analytics

### Protected Routes
- `/seeker/*` - Job seeker dashboard and features
- `/employer/*` - Employer dashboard and features  
- `/admin/*` - Admin panel
- `/chat/*` - Real-time messaging

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build the application:
```bash
npm run build
```

2. Deploy to your preferred platform with environment variables set.

### Backend (Railway/Heroku/DigitalOcean)
1. Set production environment variables
2. Build the application:
```bash
cd server
npm run build
```

3. Deploy with the start command:
```bash
npm start
```

## 🔧 Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run type-check` - Run TypeScript compiler

### Backend
- `npm run dev` - Start development server with nodemon
- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run test` - Run tests
- `npm run lint` - Run ESLint

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework for production
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful and accessible UI components
- [TanStack Query](https://tanstack.com/query) - Powerful data synchronization
- [Express.js](https://expressjs.com/) - Fast, unopinionated web framework
- [MongoDB](https://www.mongodb.com/) - The database for modern applications
- [Socket.io](https://socket.io/) - Real-time bidirectional event-based communication

## 📞 Support

For support, email support@jobhub.com or join our Slack channel.