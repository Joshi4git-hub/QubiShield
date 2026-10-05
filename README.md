# QubiShield 🛡️⚛️

An interactive, 3D web simulation of the **BB84 Quantum Key Distribution (QKD) Protocol**. Experience how quantum mechanics protects modern communication against eavesdroppers in real time.

---

## 🌌 Introduction to Quantum Security

In classical cryptography, secure communication relies on complex mathematical problems that are difficult for current computers to solve. However, quantum computers will soon be capable of cracking these traditional encryption standards. 

**Enter Quantum Key Distribution (QKD).** 

Instead of relying on math, QKD uses the fundamental laws of quantum physics to secure information:
* **The Quantum State:** Information is encoded into light particles called **photons** using properties like polarization.
* **The No-Cloning Theorem:** A quantum state cannot be copied perfectly without altering it.
* **The Observer Effect:** The moment an eavesdropper attempts to measure or intercept a quantum state, the state changes. 

If someone tries to spy on a quantum channel, they inevitably leave a detectable trace, alerting the sender and receiver instantly!

---

## ✨ Key Features

* ⚛️ **Interactive BB84 Simulation:** Real-time visual pipeline where you control photon generation, polarization basis selection, and eavesdropping.
* 🎨 **Immersive 3D Experience:** Dynamic 3D canvas built with React Three Fiber (`HeroScene`, `SimulationScene`, and `QuantumSceneElements`).
* 👥 **Character-Driven Visuals:** Interactive 3D model showcase featuring Alice, Bob, and Eve (`CharacterModelViewer.tsx` using `alice.glb`).
* 📊 **Eavesdropping & Error Metrics:** Visual calculations of Quantum Bit Error Rates (QBER) and key reconciliation.
* ⚡ **Responsive & Fast:** Powered by Next.js App Router and Tailwind CSS with custom asset caching (`modelCache.ts`).

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router) |
| **UI Library** | [React 19](https://react.dev/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **3D Graphics** | [Three.js](https://threejs.org/) & [React Three Fiber](https://r3f.docs.pmnd.rs/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) / PostCSS |

---

## 🚀 Getting Started

Follow these steps to set up and run QubiShield on your local machine.

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v18.0 or higher) and `npm` installed.

```bash
node -v
npm -v
```

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Joshi4git-hub/QubiShield.git
   cd QubiShield
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run the Development Server**
   ```bash
   npm run dev
   ```

4. **Open in Browser**  
   Navigate to `http://localhost:3000` in your web browser to view the interactive simulation.

---

## 📁 Project Structure

```text
QubiShield/
├── app/                       # Next.js App Router pages
│   ├── about/page.tsx         # Educational overview of Quantum Security
│   ├── characters/page.tsx    # Interactive 3D character showcase
│   ├── simulation/page.tsx    # Core BB84 QKD interactive simulation page
│   ├── globals.css            # Global Tailwind styling
│   ├── layout.tsx             # Root layout & Navigation header
│   └── page.tsx               # Landing hero page
├── components/                # UI & 3D React components
│   ├── CharacterCard.tsx
│   ├── CharacterModelViewer.tsx
│   ├── CharacterShowcase.tsx
│   ├── FallbackScene.tsx
│   ├── HeroScene.tsx          # 3D Hero background canvas
│   ├── Navbar.tsx             # Top navigation bar
│   └── SimulationScene.tsx   # 3D transmission scene
├── lib/                       # Protocol logic & helpers
│   ├── bb84.ts                # BB84 QKD mathematical engine
│   ├── characters.ts          # Character metadata & profile definitions
│   └── modelCache.ts          # 3D asset caching utility
└── public/                    # Static assets & 3D models
    └── models/
        └── alice.glb          # 3D GLTF model file
```

---

## 🔑 How the BB84 Simulation Works

QubiShield visualizes the core steps of the BB84 protocol through three main actors: **Alice** (Sender), **Bob** (Receiver), and **Eve** (Eavesdropper).

```text
[ Alice ]  --- Photons (Rectilinear / Diagonal) --->  [ Bob ]
                               ^
                          [ Eve (Spy) ]
```

### Protocol Steps

1. **Preparation (Alice):**  
   Alice generates a random sequence of classical bits (`0` or `1`) and randomly chooses a basis to encode each bit into a photon:
   * **Rectilinear Basis ($+$):** Horizontal ($0^\circ \rightarrow 0$) or Vertical ($90^\circ \rightarrow 1$)
   * **Diagonal Basis ($\times$):** Diagonal Left ($45^\circ \rightarrow 0$) or Diagonal Right ($135^\circ \rightarrow 1$)

2. **Transmission & Eavesdropping (Eve):**  
   Alice transmits the photons across the quantum channel. If **Eve** is enabled in the simulation, she attempts to intercept and measure the photons before passing them to Bob. If Eve measures using the wrong basis, she irreversibly alters the photon's state.

3. **Measurement (Bob):**  
   Bob receives each photon and randomly selects a measurement basis ($+$ or $\times$) without knowing which basis Alice used.

4. **Sifting & Reconciliation:**  
   Alice and Bob communicate over a public channel to compare the bases they used (without revealing the bit values). They keep only the bits where their bases matched, forming the **Sifted Key**.

5. **Error Rate Detection:**  
   They compare a small sample of their key over the public channel to check the **Quantum Bit Error Rate (QBER)**:
   * **Low Error Rate:** Communication is secure! The secret key is established.
   * **High Error Rate ($> 11\%$):** Eve's presence is detected! The key is discarded, and the connection is aborted.

---

## 🧑‍💻 Author & Maintainer

* GitHub Profile: [@Joshi4git-hub](https://github.com/Joshi4git-hub)
* Repository: [Joshi4git-hub/QubiShield](https://github.com/Joshi4git-hub/QubiShield)

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
