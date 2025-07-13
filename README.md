# 🍽️ Meal Nutrition Analyzer

A modern web application that uses AI to analyze food images and provide detailed nutrition information. Built with Next.js, TypeScript, and OpenAI GPT-4 Vision.

## ✨ Features

- **📸 AI-Powered Analysis** - Upload food photos for instant nutrition analysis
- **📱 Camera Capture** - Take photos directly from your device camera
- **📊 Visual Charts** - Interactive pie charts showing macro breakdown
- **📦 Barcode Lookup** - Search packaged foods using OpenFoodFacts API
- **📈 Meal Tracking** - Save and track your daily meals
- **🤖 AI Nutrition Tips** - Get personalized nutrition advice
- **📱 Responsive Design** - Works perfectly on desktop and mobile

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- OpenAI API key
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/cal-ai.git
   cd cal-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env.local file
   echo "OPENAI_API_KEY=your_openai_api_key_here" > .env.local
   ```

4. **Get your OpenAI API key**
   - Go to [OpenAI Platform](https://platform.openai.com/)
   - Create an account or sign in
   - Navigate to "API Keys"
   - Create a new API key
   - Replace `your_openai_api_key_here` in `.env.local` with your actual key

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the project root:

```bash
# Required: Your OpenAI API key
OPENAI_API_KEY=sk-your_actual_openai_api_key_here
```

### API Configuration

The application uses:
- **OpenAI GPT-4 Vision** for food analysis
- **OpenFoodFacts API** for barcode lookup (no key required)

## 📱 Usage

### Analyzing Food Images

1. **Upload an image** or **take a photo** using the camera
2. **Wait for AI analysis** (usually 5-10 seconds)
3. **View results** including:
   - Calories, protein, carbs, and fat
   - Interactive pie chart
   - AI nutrition tips
4. **Save to daily log** to track your meals

### Barcode Lookup

1. **Enter a barcode** (e.g., 737628064502)
2. **Click Search** to find product information
3. **View nutrition facts** from the OpenFoodFacts database

### Meal Tracking

- **Daily totals** are automatically calculated
- **Meal history** shows all saved meals for the day
- **Nutrition breakdown** for each meal

## 🏗️ Project Structure

```
cal-ai/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── analyse/
│   │   │       └── route.ts          # OpenAI analysis API
│   │   ├── globals.css               # Global styles
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Main application
│   └── components/                   # Reusable components
├── public/                           # Static assets
├── .env.local                        # Environment variables
└── package.json                      # Dependencies
```

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variable:
     - **Name**: `OPENAI_API_KEY`
     - **Value**: Your OpenAI API key
   - Deploy!

### Deploy to Other Platforms

The app can be deployed to any platform that supports Next.js:

- **Netlify** - Add build command: `npm run build`
- **Railway** - Automatic deployment from GitHub
- **DigitalOcean App Platform** - Direct GitHub integration

## 🔧 Development

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Chart.js with react-chartjs-2
- **AI**: OpenAI GPT-4 Vision
- **Deployment**: Vercel

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenAI](https://openai.com/) for GPT-4 Vision API
- [OpenFoodFacts](https://world.openfoodfacts.org/) for barcode data
- [Chart.js](https://www.chartjs.org/) for beautiful charts
- [Next.js](https://nextjs.org/) for the amazing framework

## 📞 Support

If you encounter any issues:

1. Check the [Issues](https://github.com/yourusername/cal-ai/issues) page
2. Create a new issue with detailed information
3. Include your environment (browser, OS, etc.)

---

**Made with ❤️ for better nutrition tracking**
