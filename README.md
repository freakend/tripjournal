# Trip Planner - NextJS Todo App

A modern, responsive trip planning application built with Next.js and Tailwind CSS.

## 🚀 Quick Start

### Installation

1. Install dependencies:
```bash
npm install
```

2. Add your trip data to `/data/trip.json`

3. Run development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
trip-planner/
├── pages/
│   ├── api/
│   │   └── trip.js          # API endpoint for trip data
│   ├── _app.js              # App wrapper
│   └── index.js             # Main trip planner page
├── styles/
│   └── globals.css          # Global styles
├── data/
│   └── trip.json            # Your trip data
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── next.config.js
```

## ✨ Features

- ✅ Real-time trip tracking
- ✅ Auto-save to JSON file
- ✅ Budget tracker
- ✅ Transport mode badges
- ✅ Priority color coding
- ✅ Mobile-first responsive design
- ✅ Category icons
- ✅ Progress tracking

## 🛠️ Built With

- [Next.js 14](https://nextjs.org/)
- [React 18](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide React](https://lucide.dev/) - Icons

## 📝 Notes

- Trip data is stored in `/data/trip.json`
- Changes are automatically saved when you check/uncheck items
- No database required - all data stored in JSON file

---

Made with ❤️ for your Singapore & Malaysia trip!
