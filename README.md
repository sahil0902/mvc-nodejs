# MVC Node.js Generator

A powerful command-line tool to generate a complete MVC (Model-View-Controller) structure for Node.js applications with essential boilerplate code, authentication, and best practices built-in.

## Features

- 🏗️ Complete MVC architecture setup
- 🔐 Authentication system with JWT
- 🎨 Multiple view engine support (EJS, Pug, Handlebars)
- 🔒 Security features (Helmet, Rate Limiting, etc.)
- 📝 Input validation and sanitization
- 🗃️ MongoDB integration with Mongoose
- 🎯 RESTful API structure
- 📱 Responsive CSS boilerplate
- ⚡ Development ready with nodemon
- 🔍 Error handling middleware
- 📦 Modern ES6+ syntax

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or remote)
- npm or yarn

## Installation

To install the package globally, run:

```bash
npm install -g mvc-nodejs-generator
```

## Usage

You can create a new MVC project in two ways:

1. With a project name:
```bash
create-mvc-app my-project
```

2. Without a project name (you'll be prompted):
```bash
create-mvc-app
```

The CLI will guide you through the setup process, asking for:

### Project Configuration
- Project name (default: my-mvc-app)
- View engine preference (EJS, Pug, or Handlebars)

### Database Configuration
You have three options for MongoDB setup:

1. **Local MongoDB**
   - Host: localhost (default)
   - Port: 27017 (default)
   - Database name
   - Username (optional)
   - Password (optional)

2. **MongoDB Atlas (Cloud)**
   - Host (e.g., cluster0.xxxxx.mongodb.net)
   - Database name
   - Username
   - Password

3. **Custom MongoDB URL**
   - Full MongoDB connection URI
   - Example local: `mongodb://localhost:27017/mydb`
   - Example Atlas: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/mydb`

### MongoDB Connection Examples

1. **Local MongoDB without authentication**
```
Host: localhost
Port: 27017
Database: my-app
Result URI: mongodb://localhost:27017/my-app
```

2. **Local MongoDB with authentication**
```
Host: localhost
Port: 27017
Database: my-app
Username: myuser
Password: mypassword
Result URI: mongodb://myuser:mypassword@localhost:27017/my-app
```

3. **MongoDB Atlas**
```
Host: cluster0.xxxxx.mongodb.net
Database: my-app
Username: atlasuser
Password: atlaspassword
Result URI: mongodb+srv://atlasuser:atlaspassword@cluster0.xxxxx.mongodb.net/my-app
```

## Project Structure

```
my-project/
├── app.js                 # Application entry point
├── package.json          # Project dependencies and scripts
├── .env                  # Environment variables
├── .gitignore           # Git ignore rules
├── controllers/         # Route controllers
│   ├── homeController.js
│   └── userController.js
├── models/              # Database models
│   └── User.js
├── views/               # View templates
│   ├── layouts/
│   │   └── main.ejs
│   ├── partials/
│   │   ├── header.ejs
│   │   └── footer.ejs
│   └── index.ejs
├── routes/              # Route definitions
│   ├── index.js
│   └── users.js
├── config/             # Configuration files
│   └── database.js
├── middlewares/        # Custom middleware
│   ├── auth.js
│   └── validators.js
├── public/             # Static files
│   ├── css/
│   │   └── style.css
│   ├── js/
│   └── images/
├── utils/              # Utility functions
└── services/          # Business logic services
```

## Features in Detail

### Authentication
- JWT-based authentication system
- User registration and login endpoints
- Protected routes middleware
- Password hashing with bcrypt

### Security
- Helmet.js for security headers
- Rate limiting for API endpoints
- CORS configuration
- Input validation and sanitization
- Secure password handling

### Database
- MongoDB connection with Mongoose
- User model with schema validation
- Connection error handling
- Graceful shutdown

### API Structure
- RESTful endpoints
- Structured route handling
- Controller-based logic
- Error handling middleware

### Frontend
- Responsive CSS boilerplate
- Modular view structure
- Partial views support
- Multiple view engine support

## Getting Started

After creating your project:

1. Navigate to your project directory:
```bash
cd my-project
```

2. Install dependencies:
```bash
npm install
```

3. Configure your environment:
The `.env` file is created automatically with your database configuration, but you should:
- Update the `JWT_SECRET` with a secure key
- Modify other variables as needed:
  ```env
  PORT=3000
  MONGODB_URI=your_generated_mongodb_uri
  JWT_SECRET=your_jwt_secret_key
  NODE_ENV=development
  ```

4. Start the development server:
```bash
npm run dev
```

## Available Scripts

- `npm start`: Start the production server
- `npm run dev`: Start the development server with nodemon

## API Endpoints

### Public Routes
- `POST /api/users/register`: Register a new user
- `POST /api/users/login`: Login user
- `GET /`: Home page

### Protected Routes
- `GET /api/users/profile`: Get user profile (requires authentication)

## Customization

### Adding New Models
1. Create a new file in the `models` directory
2. Define your Mongoose schema
3. Add validation rules
4. Export the model

### Adding New Routes
1. Create a route file in `routes` directory
2. Define your endpoints
3. Create corresponding controllers
4. Add to `app.js`

### Middleware
- Add custom middleware in `middlewares` directory
- Register in `app.js` or specific routes

## Best Practices

1. Security
   - Always validate user input
   - Use environment variables for sensitive data
   - Implement rate limiting for APIs
   - Keep dependencies updated

2. Code Organization
   - Follow MVC pattern
   - Use async/await for asynchronous operations
   - Implement error handling
   - Use middleware for common operations

3. Database
   - Use Mongoose middleware for hooks
   - Implement proper indexing
   - Handle connection errors
   - Use appropriate MongoDB connection options

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT 