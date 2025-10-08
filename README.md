# SquadGoals 🎯

A digital scrapbook and relationship mapping platform that helps friends create interactive timelines and visualize how their relationships are interconnected through shared memories and events.

## 🌟 Inspiration

We were inspired by traditional scrapbooks made by friends and wanted to digitize this concept. Our goal was to create a digital timeline of events where users could see how their relationships are "linked" through shared experiences, memories, and photos.

## 🚀 What It Does

SquadGoals allows users to:

- **Input Personal Details**: Users create profiles with their information and preferences
- **Share Significant Events**: Upload photos and details about meaningful events and experiences
- **Visualize Relationships**: View connections between friends and shared experiences in both:
  - **Timeline View**: Chronological display of events and memories
  - **Mind Map View**: Interactive network visualization showing relationship connections
- **Discover Connections**: See how "goals" your squad is by exploring mutual connections and shared experiences

## 🛠️ How We Built It

We built SquadGoals using a modern MERN stack:

- **Frontend**: React.js with `vis-network` for interactive graph visualizations
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with Google OAuth integration
- **File Upload**: Multer for handling profile images and event photos

### Key Technologies

- **React Graph Visualization**: Utilizing `vis-network` library to create interactive mind maps and relationship networks
- **Real-time Updates**: Dynamic graph rendering that updates as users add new events and connections
- **Responsive Design**: Mobile-friendly interface that works across all devices

## 🎯 Features

### Current Features
- ✅ User registration and authentication
- ✅ Google OAuth integration
- ✅ Profile management with image uploads
- ✅ Event creation with photos and descriptions
- ✅ Interactive mind map visualization
- ✅ Relationship connection mapping
- ✅ Protected routes and user sessions
- ✅ Email verification system

### Planned Features
- 📅 Timeline view for chronological event display
- 💬 Commenting system on events
- 📊 Metadata reading and analysis
- 📱 Third-party photo syncing (Instagram, Google Photos)
- 🔍 Advanced search and filtering
- 📈 Analytics and insights on relationship patterns

## 🚧 Challenges We Ran Into

- **Team Exhaustion**: One team member got sick, and we started getting tired as the hackathon progressed
- **Performance Optimization**: Optimizing the `vis.js` library to prevent slow rendering with large datasets
- **Learning Curve**: One team member had never worked with the MERN stack before, requiring significant learning
- **Time Constraints**: Balancing feature development with the limited hackathon timeframe

## 🏆 Accomplishments We're Proud Of

- **Passionate Collaboration**: Coming up with an idea that the entire team was genuinely excited about
- **Learning Achievement**: Successfully learning `react-graph-vis` from scratch to implement our visualization features
- **Full-Stack Development**: Building a complete MERN application with authentication, file uploads, and complex data relationships
- **User Experience**: Creating an intuitive interface for visualizing complex relationship data

## 📚 What We Learned

- **MERN Stack Mastery**: One team member went from zero MERN experience to building a full application
- **Graph Visualization**: Deep dive into `vis-network` and `react-graph-vis` libraries
- **Team Collaboration**: Working effectively under time pressure with varying skill levels
- **Data Modeling**: Designing MongoDB schemas for complex relationship data
- **Performance Optimization**: Techniques for optimizing graph rendering performance

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/squadgoals.git
   cd squadgoals
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the backend directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/squadgoals
   JWT_SECRET=your_jwt_secret_here
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start both the backend server (port 5001) and frontend development server (port 3000).

5. **Access the application**
   
   Open your browser and navigate to `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run server` - Start only the backend server
- `npm run client` - Start only the frontend development server
- `npm run build` - Build the frontend for production
- `npm start` - Start the production server

## 🏗️ Project Structure

```
squadgoals/
├── backend/
│   ├── controllers/     # Route controllers
│   ├── middleware/     # Authentication middleware
│   ├── models/         # MongoDB models
│   ├── routes/         # API routes
│   ├── services/       # Business logic services
│   └── uploads/        # File uploads directory
├── frontend/
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── contexts/   # React contexts
│   │   ├── pages/      # Page components
│   │   └── utils/      # Utility functions
│   └── public/         # Static assets
└── package.json        # Root package configuration
```

## 🔮 What's Next for SquadGoals

We have ambitious plans for the future of SquadGoals:

- **Enhanced Timeline View**: Implement a comprehensive timeline interface for better chronological navigation
- **Social Features**: Add commenting, reactions, and sharing capabilities
- **Smart Analytics**: Implement metadata reading and relationship pattern analysis
- **Integration**: Third-party photo syncing with Instagram, Google Photos, and other platforms
- **Mobile App**: Native mobile applications for iOS and Android
- **AI Features**: Smart suggestions for events and relationship insights
- **Group Management**: Enhanced tools for managing friend groups and permissions

## 🤝 Contributing

We welcome contributions! Please feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

Built with ❤️ by the SquadGoals team at MRUHacks2025:

- **Matthew Rojas** ([@MattyTD](https://github.com/MattyTD)) - *Frontend Developer*
  - Developed React components and user interfaces
  - Implemented interactive mind map visualizations using `vis-network`
  - Built responsive UI/UX for timeline and relationship mapping features
  - Integrated Google OAuth authentication flow
  - Created dynamic graph rendering and user interaction systems

- **Evan Pitman** - *Full-Stack Developer*
  - Contributed to both frontend and backend development
  - Assisted with feature implementation and debugging

- **Danny Nguyen** - *Backend Developer & MongoDB Specialist*
  - Designed and implemented MongoDB database schemas
  - Optimized database queries and data relationships
  - Built robust data models for users, events, and relationships
  - Implemented efficient data storage and retrieval systems

- **Don Laliberte** - *Backend Developer*
  - Developed Express.js API endpoints and routes
  - Implemented authentication middleware and JWT token handling
  - Built file upload system for images and media
  - Created RESTful API architecture and error handling

## 🙏 Acknowledgments

- MRUHacks2025 for hosting the hackathon
- The `vis-network` community for the excellent visualization library
- Our friends who inspired the scrapbook concept

---

**SquadGoals** - Because every friendship deserves to be celebrated! 🎉
