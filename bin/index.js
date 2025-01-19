#!/usr/bin/env node

const { program } = require('commander');
const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

program
  .version('1.0.0')
  .description('Generate an MVC structure for your Node.js application')
  .argument('[projectName]', 'Name of your project')
  .action(async (projectName) => {
    try {
      // Prompt for project details
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: 'What is your project name?',
          default: 'my-mvc-app',
          when: !projectName
        },
        {
          type: 'input',
          name: 'dbName',
          message: 'Enter your database name (this will be created if it doesn\'t exist):',
          default: 'mvc-app',
          validate: input => input.length > 0 || 'Database name is required'
        },
        {
          type: 'list',
          name: 'dbType',
          message: 'Choose your MongoDB setup:',
          choices: [
            { name: 'Local MongoDB (mongodb://localhost)', value: 'local' },
            { name: 'MongoDB Atlas (Cloud)', value: 'atlas' },
            { name: 'Custom MongoDB URL', value: 'custom' }
          ],
          default: 'local'
        },
        {
          type: 'input',
          name: 'mongoUri',
          message: 'Enter your MongoDB connection URI:',
          when: answers => answers.dbType === 'custom',
          validate: input => input.startsWith('mongodb') || 'Must be a valid MongoDB URI starting with mongodb://'
        },
        {
          type: 'input',
          name: 'dbHost',
          message: 'Enter MongoDB host (e.g., localhost or cluster0.xxxxx.mongodb.net):',
          default: answers => answers.dbType === 'local' ? 'localhost' : '',
          when: answers => answers.dbType !== 'custom'
        },
        {
          type: 'input',
          name: 'dbPort',
          message: 'Enter MongoDB port (default: 27017 for local):',
          default: answers => answers.dbType === 'local' ? '27017' : '',
          when: answers => answers.dbType === 'local'
        },
        {
          type: 'input',
          name: 'dbUsername',
          message: 'Enter MongoDB username (leave empty for local without auth):',
          when: answers => answers.dbType !== 'custom'
        },
        {
          type: 'password',
          name: 'dbPassword',
          message: 'Enter MongoDB password:',
          when: answers => answers.dbType !== 'custom' && answers.dbUsername
        },
        {
          type: 'list',
          name: 'viewEngine',
          message: 'Choose your view engine:',
          choices: ['ejs', 'pug', 'handlebars'],
          default: 'ejs'
        }
      ]);

      projectName = projectName || answers.projectName;
      const projectPath = path.join(process.cwd(), projectName);

      // Create MongoDB URI based on setup type
      let mongoUri;
      if (answers.dbType === 'custom') {
        mongoUri = answers.mongoUri;
      } else if (answers.dbType === 'atlas') {
        mongoUri = `mongodb+srv://${answers.dbUsername}:${answers.dbPassword}@${answers.dbHost}/${answers.dbName}?retryWrites=true&w=majority`;
      } else {
        // Local MongoDB
        mongoUri = answers.dbUsername
          ? `mongodb://${answers.dbUsername}:${answers.dbPassword}@${answers.dbHost}:${answers.dbPort}/${answers.dbName}`
          : `mongodb://${answers.dbHost}:${answers.dbPort}/${answers.dbName}`;
      }

      // Create project directory
      await fs.ensureDir(projectPath);

      // Create MVC structure
      const dirs = [
        'controllers',
        'models',
        'views',
        'views/layouts',
        'views/partials',
        'routes',
        'config',
        'middlewares',
        'public',
        'public/css',
        'public/js',
        'public/images',
        'utils',
        'services'
      ];

      for (const dir of dirs) {
        await fs.ensureDir(path.join(projectPath, dir));
      }

      // Create basic files
      const files = {
        'package.json': {
          name: projectName,
          version: '1.0.0',
          description: 'MVC Node.js application',
          main: 'app.js',
          scripts: {
            start: 'node app.js',
            dev: 'nodemon app.js'
          },
          dependencies: {
            'express': '^4.18.2',
            'mongoose': '^8.0.0',
            'dotenv': '^16.3.1',
            [answers.viewEngine]: '^3.1.9',
            'morgan': '^1.10.0',
            'cors': '^2.8.5',
            'helmet': '^7.1.0',
            'compression': '^1.7.4',
            'express-rate-limit': '^7.1.5',
            'express-validator': '^7.0.1',
            'jsonwebtoken': '^9.0.2',
            'bcryptjs': '^2.4.3'
          },
          devDependencies: {
            'nodemon': '^3.0.1'
          }
        },
        'app.js': `const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// General Middleware
app.use(morgan('dev'));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', '${answers.viewEngine}');

// Database connection
require('./config/database');

// Routes
app.use('/', require('./routes/index'));
app.use('/api/users', require('./routes/users'));

// Error handling middleware
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server is running on port \${PORT}\`);
});`,
        'routes/index.js': `const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

// @route   GET /
// @desc    Home page
// @access  Public
router.get('/', homeController.index);

module.exports = router;`,
        'routes/users.js': `const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middlewares/auth');
const { validateUser } = require('../middlewares/validators');

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
router.post('/register', validateUser, userController.register);

// @route   POST /api/users/login
// @desc    Login user
// @access  Public
router.post('/login', userController.login);

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, userController.getProfile);

module.exports = router;`,
        'controllers/homeController.js': `/**
 * Home page controller
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.index = (req, res) => {
  res.render('index', { 
    title: 'Welcome to MVC App',
    description: 'A powerful MVC application built with Node.js'
  });
};`,
        'controllers/userController.js': `const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * User registration
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({ name, email, password });
    await user.save();

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * User login
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.login = async (req, res) => {
  // TODO: Implement login logic
};

/**
 * Get user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getProfile = async (req, res) => {
  // TODO: Implement get profile logic
};`,
        'models/User.js': `const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\\w+([\\.-]?\\w+)*@\\w+([\\.-]?\\w+)*(\\.\\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to check if password matches
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);`,
        'middlewares/auth.js': `const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
module.exports = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};`,
        'middlewares/validators.js': `const { body } = require('express-validator');

exports.validateUser = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 50 })
    .withMessage('Name cannot be more than 50 characters'),
    
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
    
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];`,
        'config/database.js': `const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Handle MongoDB connection errors after initial connection
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Handle application termination
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});`,
        '.env': `PORT=3000
MONGODB_URI=${mongoUri}
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development`,
        '.gitignore': `node_modules
.env
.DS_Store
logs
*.log
npm-debug.log*
coverage`,
        'public/css/style.css': `/* Reset default styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Arial', sans-serif;
  line-height: 1.6;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Header styles */
header {
  text-align: center;
  margin-bottom: 2rem;
}

/* Navigation styles */
nav {
  background: #f4f4f4;
  padding: 1rem;
  margin-bottom: 2rem;
}

nav ul {
  list-style: none;
  display: flex;
  justify-content: center;
  gap: 2rem;
}

nav a {
  text-decoration: none;
  color: #333;
}

/* Form styles */
form {
  max-width: 500px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
}

input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  background: #333;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #555;
}

/* Responsive design */
@media (max-width: 768px) {
  body {
    padding: 10px;
  }

  nav ul {
    flex-direction: column;
    gap: 1rem;
  }
}`
      };

      // Add view files based on chosen engine
      if (answers.viewEngine === 'ejs') {
        files['views/layouts/main.ejs'] = `<!DOCTYPE html>
<html>
  <head>
    <title><%= title %></title>
    <link rel='stylesheet' href='/css/style.css' />
  </head>
  <body>
    <%- include('../partials/header') %>
    <%- body %>
    <%- include('../partials/footer') %>
  </body>
</html>`;
        
        files['views/partials/header.ejs'] = `<header>
  <h1><%= title %></h1>
  <nav>
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/about">About</a></li>
      <li><a href="/contact">Contact</a></li>
    </ul>
  </nav>
</header>`;

        files['views/partials/footer.ejs'] = `<footer>
  <p>&copy; <%= new Date().getFullYear() %> <%= title %>. All rights reserved.</p>
</footer>`;

        files['views/index.ejs'] = `<%- include('layouts/main', { title: title }) %>
<main>
  <h2><%= title %></h2>
  <p><%= description %></p>
</main>`;
      }

      // Create files
      for (const [file, content] of Object.entries(files)) {
        const filePath = path.join(projectPath, file);
        await fs.ensureFile(filePath);
        await fs.writeFile(
          filePath,
          typeof content === 'object' ? JSON.stringify(content, null, 2) : content
        );
      }

      console.log(chalk.green('\n✨ MVC project structure created successfully!'));
      console.log(chalk.blue('\nTo get started:'));
      console.log(chalk.white(`  cd ${projectName}`));
      console.log(chalk.white('  npm install'));
      console.log(chalk.white('  npm run dev\n'));
      
      console.log(chalk.yellow('Important next steps:'));
      console.log(chalk.white('1. Update the JWT_SECRET in .env with a secure key'));
      console.log(chalk.white('2. Complete the TODO items in userController.js'));
      console.log(chalk.white('3. Add your own models in the models directory'));
      console.log(chalk.white('4. Customize the views according to your needs\n'));

    } catch (error) {
      console.error(chalk.red('Error creating project:'), error);
      process.exit(1);
    }
  });

program.parse(process.argv);
