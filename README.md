# The GTO Lab (GTO Visualizer)

A web-based interactive visualizer for **Game Theory Optimal (GTO)** strategies in poker using the **Counterfactual Regret Minimization (CFR)** algorithm.

## 🚀 Features
- **Live CFR Solver:** Watch an AI reach Nash Equilibrium in real-time through self-play.
- **Kuhn Poker Model:** Visualize the simplest form of poker (3 cards) where concepts like bluffing and value betting emerge mathematically.
- **Convergence Chart:** Real-time tracking of strategy probabilities (e.g., P1 bluff frequency stabilizing at exactly 1/3).
- **Interactive Dashboard:** Control simulation speed, pause/resume, and reset the learning process.
- **Educational Guide:** Learn the rules of Kuhn Poker and the basics of Game Theory.

## 🛠 Tech Stack
- **Next.js 15 (React)**
- **TypeScript**
- **Tailwind CSS**
- **Recharts** (Real-time data visualization)
- **Framer Motion** (Smooth UI animations)

## 🌐 Deployment
Hosted on GitHub Pages: [https://berrymelon.github.io/gto-lab/](https://berrymelon.github.io/gto-lab/)

## 📖 How it Works
The visualizer uses the **CFR algorithm**, which is the industry standard for solving imperfect information games like Poker. The AI plays millions of hands against itself, calculates "regret" for every missed opportunity, and gradually improves its strategy until it becomes unexploitable.
