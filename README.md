# Collaborative Todo Board

A real-time collaborative task management application built with React (frontend) and Node.js/Express (backend).

## Features

### 🔐 Authentication & Security
- User registration and login with JWT authentication
- Password hashing with bcrypt
- Protected routes and API endpoints
- Rate limiting and security headers

### 📋 Kanban Board
- Three-column layout (Todo, In Progress, Done)
- Drag-and-drop functionality
- Real-time updates using Socket.IO
- Custom animations and transitions

### 🤖 Smart Business Logic
- **Smart Assign**: Automatically assigns tasks to users with fewest active tasks
- **Task Validation**: Prevents duplicate titles and column name conflicts
- **Conflict Resolution**: Handles simultaneous edits with user choice modal

### 📊 Activity Logging
- Real-time activity feed showing last 20 actions
- Tracks all CRUD operations with timestamps
- Live updates across all connected clients

### 🎨 Custom UI & Animations
- No external CSS frameworks - pure custom styling
- Card flip animation on click
- Smooth slide-in animations for forms
- Responsive design for all screen sizes

## Tech Stack

### Frontend
- **React 18** with JavaScript (no TypeScript)
- **React Router** for navigation
- **Axios** for API calls
- **Socket.IO Client** for real-time updates
- **React Beautiful DnD** for drag-and-drop
- **Tailwind CSS** via CDN for styling

### Backend
- **Node.js** with **Express.js**
- **MongoDB** with **Mongoose** ODM
- **Socket.IO** for real-time communication
- **JWT** for authentication
- **bcrypt** for password hashing
- **Helmet** for security headers
- **CORS** for cross-origin requests

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Git

### 1. Clone the Repository
\`\`\`bash
git clone <repository-url>
cd collaborative-todo-board
\`\`\`

### 2. Backend Setup
\`\`\`bash
cd server
npm install

# Create .env file and configure environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start the server
npm run dev
\`\`\`

### 3. Frontend Setup
\`\`\`bash
cd client
npm install

# Start the React development server
npm start
\`\`\`

### 4. Database Setup
Make sure MongoDB is running on your system. The application will automatically create the necessary collections.

## Environment Variables

Create a `.env` file in the `server` directory:

\`\`\`env
MONGODB_URI=mongodb://localhost:27017/collaborative-todo
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
NODE_ENV=development
\`\`\`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/smart-assign` - Smart assign task
- `POST /api/tasks/:id/resolve-conflict` - Resolve edit conflicts

### Users
- `GET /api/users` - Get all active users
- `GET /api/users/:id` - Get user by ID

### Activities
- `GET /api/activities` - Get last 20 activities

## Socket.IO Events

### Client to Server
- `joinRoom` - Join a specific room
- `disconnect` - Handle user disconnection

### Server to Client
- `taskCreated` - New task created
- `taskUpdated` - Task updated
- `taskDeleted` - Task deleted
- `activityAdded` - New activity logged

## Project Structure

\`\`\`
collaborative-todo-board/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # React context providers
│   │   ├── pages/          # Page components
│   │   └── App.js          # Main app component
│   └── package.json
├── server/                 # Node.js backend
│   ├── config/             # Database configuration
│   ├── middleware/         # Express middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── server.js           # Main server file
│   └── package.json
└── README.md
\`\`\`

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Create Tasks**: Click the + button in any column to add a new task
3. **Drag & Drop**: Move tasks between columns by dragging
4. **Edit Tasks**: Click the edit icon on any task card
5. **Smart Assign**: Click the lightning bolt icon to auto-assign tasks
6. **View Activity**: Toggle the activity panel to see recent changes
7. **Real-time Updates**: See changes from other users instantly

## Key Features Explained

### Smart Assign Algorithm
The smart assign feature automatically assigns tasks to the user with the fewest active (non-completed) tasks, ensuring balanced workload distribution.

### Conflict Resolution
When two users edit the same task simultaneously, the system detects the conflict and presents both versions, allowing users to choose which changes to keep.

### Task Validation
- Task titles must be unique across the board
- Task titles cannot match column names (Todo, In Progress, Done)
- All validation happens both client-side and server-side

### Real-time Synchronization
All changes are immediately broadcast to connected clients using Socket.IO, ensuring everyone sees updates instantly without page refreshes.

## Development

### Running in Development Mode

Backend:
\`\`\`bash
cd server
npm run dev  # Uses nodemon for auto-restart
\`\`\`

Frontend:
\`\`\`bash
cd client
npm start    # React development server with hot reload
\`\`\`

### Building for Production

Frontend:
\`\`\`bash
cd client
npm run build
\`\`\`

Backend:
\`\`\`bash
cd server
npm start
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

# Front End               :-   https://collaborative-todo-board.vercel.app/
# Backend                 :-   https://collaborative-todo-board.onrender.com
# Video                   :-   https://drive.google.com/file/d/1Um_QL03Sc55gb5FK8W9BtjdbuCRsK4wd/view?usp=sharing
# Logic_Document_Compact  :-   https://drive.google.com/file/d/1ZtTZGW-n1YmgiDA6KTEVCZlzd47yxtt4/view?usp=sharing
 
 
