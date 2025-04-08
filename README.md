# STCMP - Staff Training and Certification Management Platform

A comprehensive web application for managing staff training programs and certifications. Built with React.js frontend and Node.js/Express backend with MongoDB database.

## Features

- Staff training management
- Faculty information management
- Training certification system
- Interactive dashboards
- PDF report generation
- Data visualization with charts

## Tech Stack

### Frontend
- React.js
- Redux for state management
- React Router for navigation
- Bootstrap for styling
- Chart.js for data visualization
- React PDF for document generation

### Backend
- Node.js
- Express.js
- MongoDB
- Cors for cross-origin resource sharing
- Dotenv for environment variables

## Getting Started

### Prerequisites
- Node.js (v12 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/STCMP.git
cd STCMP
```

2. Install Backend Dependencies
```bash
cd backend
npm install
```

3. Configure Environment Variables
Create a `.env` file in the backend directory with:
```
PORT=5000
DB_URL=your_mongodb_connection_string
```

4. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### Running the Application

1. Start the Backend Server
```bash
cd backend
npm start
```

2. Start the Frontend Development Server
```bash
cd frontend
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
STCMP/
├── backend/
│   ├── APIs/
│   │   ├── faculty-api.js
│   │   └── trainings-api.js
│   ├── server.js
│   └── package.json
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   └── ...
    └── package.json
```

## License

This project is licensed under the MIT License.
