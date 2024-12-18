# Tarot Card Reader Web Application

An interactive tarot card reading application that provides personalized readings based on user questions.

## Features

- Interactive tarot card readings
- Personalized responses based on user questions
- Beautiful, responsive UI
- Card interpretation system
- Email delivery of readings

## Prerequisites

- Node.js 18.x or higher
- npm (Node Package Manager)

## Installation

1. Clone the repository:
```bash
git clone [your-repository-url]
cd tarot-card-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your configuration:
```env
PORT=3000
NODE_ENV=production
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The application will be available at `http://localhost:3000` (or your configured PORT).

## Deployment Options

### Option 1: Heroku
1. Create a Heroku account at https://heroku.com
2. Install Heroku CLI
3. Deploy using:
```bash
heroku login
heroku create your-app-name
git push heroku main
```

### Option 2: Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Deploy using:
```bash
vercel login
vercel
```

### Option 3: DigitalOcean App Platform
1. Create a DigitalOcean account
2. Connect your repository
3. Deploy through the DigitalOcean dashboard

## Project Structure

```
tarot-card-app/
├── images/          # Card and UI images
├── js/             # JavaScript files
├── server.js       # Express server
├── index.html      # Main application page
├── reading.html    # Reading results page
└── package.json    # Project dependencies
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details
