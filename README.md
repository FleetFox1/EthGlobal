# 🐛 BugDex

> A Web3 mobile-first app for discovering and collecting bugs - built for EthGlobal

![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8?style=flat-square&logo=tailwindcss)
![ShadCN UI](https://img.shields.io/badge/ShadCN-UI-black?style=flat-square)

## 📖 About

**BugDex** is a Web3-powered bug collection application where users can scan, discover, and collect bugs in an interactive, gamified experience. Built with modern web technologies and optimized for mobile devices.

## ✨ Features

- 🎯 **Mobile-First Design** - Optimized for mobile viewing and interaction
- 📱 **Fixed Bottom Navigation** - Easy access to core features
- 🔍 **Prominent Scan Button** - Large, circular button for bug scanning
- 🎨 **Modern UI** - Built with ShadCN UI components and Tailwind CSS
- 🌗 **Dark Mode Ready** - Supports light and dark themes
- ⚡ **Fast & Responsive** - Built with Next.js 15 and Turbopack
- 🎭 **Smooth Animations** - Polished transitions and hover effects

## 🏗️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4.1](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Package Manager**: [pnpm](https://pnpm.io/)

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ installed
- pnpm installed (`npm install -g pnpm`)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd EthGlobal
   ```

2. **Navigate to the web app**
   ```bash
   cd apps/web
   ```

3. **Install dependencies**
   ```bash
   pnpm install
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   
   Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
EthGlobal/
└── apps/
    └── web/
        ├── app/
        │   ├── layout.tsx
        │   ├── page.tsx          # Main homepage
        │   └── globals.css
        ├── components/
        │   ├── ui/               # ShadCN UI components
        │   │   ├── button.tsx
        │   │   ├── sheet.tsx
        │   │   └── dialog.tsx
        │   ├── BottomNav.tsx     # Bottom navigation bar
        │   └── ScanButton.tsx    # Circular scan button
        ├── lib/
        │   └── utils.ts
        └── package.json
```

## 🎨 Components

### BottomNav
The fixed bottom navigation bar includes:
- **Left**: Hamburger menu (opens sidebar with Sheet component)
- **Center**: Large circular Scan button (elevated design)
- **Right**: Settings icon (opens settings dialog)

### ScanButton
A prominent, circular button with:
- Scan icon from Lucide React
- Hover animations (scale + shadow)
- Click handler ready for bug scanning logic

## 🛠️ Available Scripts

```bash
# Development
pnpm dev          # Start dev server with Turbopack

# Production
pnpm build        # Build for production
pnpm start        # Start production server

# Code Quality
pnpm lint         # Run ESLint
```

## 🗺️ Roadmap

- [ ] Implement bug scanning functionality
- [ ] Add bug collection grid/list view
- [ ] Integrate Web3 wallet connection
- [ ] Add user stats and achievements
- [ ] Implement leaderboard system
- [ ] Add profile management
- [ ] Create bug detail views
- [ ] Add social sharing features

## 🎯 TODO

### Sidebar Menu
- Navigation menu items
- Links to Collection, Leaderboard, Profile, About

### Settings Modal
- Notification preferences
- Camera permissions
- Theme toggle (light/dark)
- Account management

### Main Page
- Bug collection grid/list
- User stats display
- Recent activity feed

## 📝 License

MIT License - feel free to use this project for your own purposes.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📧 Contact

Built with ❤️ for EthGlobal

---

⭐ Star this repo if you find it helpful!
