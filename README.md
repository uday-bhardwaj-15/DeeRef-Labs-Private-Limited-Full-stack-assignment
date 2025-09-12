# PDF Annotator - Full-Stack Application

A modern PDF annotation app I built with Next.js, MongoDB, and React PDF.  
Upload, view, highlight, and manage your PDFs with annotations that stay with you across sessions.

I created this project to scratch my own itch: as a student and developer, I constantly needed to highlight PDFs (research papers, documentation, lecture notes) but hated losing track of my highlights. This app brings everything together in a clean, responsive, and persistent way.

## 🚀 Features

### Core Functionality

- **User Authentication**: Secure email/password registration and login with JWT tokens
- **PDF Upload & Storage**: Upload PDF files with UUID-based identification and local file system storage
- **PDF Viewer**: In-browser PDF viewing with pagination, zoom controls, and smooth navigation
- **Text Highlighting**: Select and highlight text with position tracking and color customization
- **Annotation Persistence**: Save highlights across sessions with metadata (page number, position, text, notes)
- **User Dashboard**: Manage uploaded PDFs with rename, delete, and organization features
- **Responsive Design**: Optimized for desktop and tablet viewing

### Advanced Features

- **Real-time Highlighting**: Instant highlight creation with visual feedback
- **Highlight Management**: View, edit, and delete highlights from a dedicated sidebar
- **File Management**: Rename documents and organize your PDF library
- **Search & Navigation**: Jump to specific pages and navigate through documents
- **Secure Access**: Middleware-protected routes with token validation

## 🛠️ Technology Stack

### Frontend

- **Next.js 13+** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Shadcn/ui** - Beautiful UI components
- **React PDF** - PDF rendering and interaction
- **Lucide React** - Icon library

### Backend

- **Next.js API Routes** - Serverless API endpoints
- **MongoDB** - Document database with Mongoose ODM
- **JWT** - Authentication tokens
- **Multer** - File upload handling
- **bcryptjs** - Password hashing

### Storage & Security

- **Local File System** - PDF storage on server
- **JWT Authentication** - Secure user sessions
- **Route Protection** - Middleware-based access control
- **Input Validation** - Comprehensive data validation

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v18 or later)
- **MongoDB** (local installation or MongoDB Atlas)
- **npm** or **yarn** package manager

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd pdf-annotator-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/pdf-annotator
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/pdf-annotator

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secure-jwt-secret-key-change-this

# NextAuth Secret (generate a secure random string)
NEXTAUTH_SECRET=your-super-secure-nextauth-secret-change-this

# App URL
NEXTAUTH_URL=http://localhost:3000
```

### 4. Database Setup

Ensure MongoDB is running, then create the demo user:

```bash
node scripts/seed-demo-user.js
```

### 5. Create Upload Directory

```bash
mkdir uploads
```

### 6. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🔐 Demo Account

Use these credentials to test the application:

- **Email**: demo@example.com
- **Password**: demo123

## 📚 Usage Guide

### Getting Started

1. **Register/Login**: Create an account or use the demo credentials
2. **Upload PDF**: Click "Upload PDF" to add documents to your library
3. **View Document**: Click on any PDF card to open the viewer
4. **Highlight Text**: Enable highlight mode and select text to annotate
5. **Manage Annotations**: Use the sidebar to view and manage your highlights

### Key Features

- **Dashboard**: View all your uploaded PDFs with file management options
- **PDF Viewer**: Full-featured viewer with zoom, navigation, and highlighting
- **Highlight Sidebar**: Manage all annotations with notes and navigation
- **File Management**: Rename, delete, and organize your PDF library

## 🏗️ Architecture Overview

### File Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── pdf/          # PDF management endpoints
│   │   └── highlights/   # Highlight management endpoints
│   ├── (auth)/           # Authentication pages
│   ├── dashboard/        # User dashboard
│   ├── viewer/           # PDF viewer
│   └── layout.tsx        # Root layout
├── components/           # React components
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
├── models/              # MongoDB models
├── middleware.ts        # Route protection
├── scripts/             # Database seeding scripts
└── uploads/             # PDF file storage
```

### Database Models

- **User**: User accounts with authentication
- **PDF**: PDF metadata and file information
- **Highlight**: Annotation data with position tracking

### API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `GET /api/auth/me` - Get current user
- `POST /api/pdf/upload` - Upload PDF file
- `GET /api/pdf/list` - List user's PDFs
- `GET /api/pdf/[uuid]` - Serve PDF file
- `PUT /api/pdf/[uuid]` - Update PDF metadata
- `DELETE /api/pdf/[uuid]` - Delete PDF
- `GET /api/highlights` - Get highlights for PDF
- `POST /api/highlights` - Create highlight
- `PUT /api/highlights/[uuid]` - Update highlight
- `DELETE /api/highlights/[uuid]` - Delete highlight

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Route Protection**: Middleware-based access control
- **Password Hashing**: bcrypt with salt for secure password storage
- **Input Validation**: Comprehensive data validation and sanitization
- **File Type Validation**: PDF-only upload restrictions
- **User Isolation**: Users can only access their own data

## 🚀 Deployment

### Environment Variables for Production

Update your `.env.local` for production:

```env
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
NEXTAUTH_SECRET=your-production-nextauth-secret
NEXTAUTH_URL=https://your-domain.com
```

### Build for Production

```bash
npm run build
npm start
```

## 🔧 Configuration Options

### MongoDB Connection

- **Local MongoDB**: `mongodb://localhost:27017/pdf-annotator`
- **MongoDB Atlas**: `mongodb+srv://username:password@cluster.mongodb.net/pdf-annotator`

### File Storage

PDFs are stored in the `uploads/` directory. Ensure proper permissions for file system access.

### Authentication

JWT tokens expire after 7 days by default. Modify token expiry in `lib/auth.ts`.

## 📝 API Documentation

### Authentication Flow

1. User registers/logs in
2. Server generates JWT token
3. Token stored in httpOnly cookie
4. Middleware validates token for protected routes

### File Upload Process

1. Client uploads PDF via multipart form
2. Server validates file type and user authentication
3. File saved to local filesystem with UUID filename
4. Metadata saved to MongoDB

### Highlight Data Structure

```typescript
{
  uuid: string,
  pdfUuid: string,
  userId: ObjectId,
  pageNumber: number,
  text: string,
  position: {
    x: number,
    y: number,
    width: number,
    height: number
  },
  color: string,
  note: string,
  createdAt: Date,
  updatedAt: Date
}
```

## 🎨 Design System

### Color Palette

- **Primary**: Blue (#3B82F6)
- **Secondary**: Slate (#64748B)
- **Success**: Green (#10B981)
- **Warning**: Amber (#F59E0B)
- **Error**: Red (#EF4444)

### Typography

- **Headings**: Inter font, weights 600-700
- **Body**: Inter font, weight 400
- **Code**: Mono font family

## 🔍 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**

   - Ensure MongoDB is running
   - Check connection string in `.env.local`
   - Verify network connectivity for Atlas

2. **File Upload Fails**

   - Check `uploads/` directory permissions
   - Verify file type is PDF
   - Ensure sufficient disk space

3. **Highlights Not Saving**

   - Check browser console for errors
   - Verify JWT token validity
   - Check MongoDB connection

4. **PDF Not Loading**
   - Verify PDF file exists in uploads directory
   - Check file permissions
   - Ensure PDF is not corrupted

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in your environment.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 📞 Support

For support or questions:

- Create an issue on GitHub
- Check the troubleshooting section
- Review the API documentation

---

Built with ❤️ using Next.js, MongoDB, and modern web technologies.
👨‍💻 Made by [Uday Bhardwaj](https://github.com/udaybhardwaj-15)  
If you try it out, I’d love to hear your feedback!
