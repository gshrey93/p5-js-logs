# Calculator and Unit Converter PWA

A clean, responsive, and fully functional Calculator and Unit Converter built as a Progressive Web App (PWA). This application is designed to be lightweight, running perfectly from a single HTML file and a combined JavaScript file. It is fully optimized for easy deployment on GitHub Pages.

## 🚀 Features

| Feature | Description |
|---|---|
| **Dual Functionality** | Seamlessly switch between a standard calculator and a comprehensive unit converter. |
| **Unit Converter** | Supports conversions for Length, Weight/Mass, Area, Volume, Speed, and Temperature. |
| **History Manager** | Automatically tracks and saves past calculations and conversions using local storage. Click any history item to instantly reuse the result. |
| **Theme Manager** | Includes a built-in Dark/Light mode toggle that respects user preferences and remembers them for future visits. |
| **Keyboard Support** | Fully supports physical keyboard input for fast, seamless calculations on desktop devices. |
| **Clipboard Support** | Long-press or click the result display to quickly copy the value to your clipboard. |
| **PWA Ready** | Comes with a `manifest.json` and supports mobile/desktop installation. |

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| **HTML5** | Application structure and semantic elements. |
| **CSS3** | Responsive design, CSS variables for theming, CSS Grid, and Flexbox layouts. |
| **JavaScript (ES6+)** | Core logic, event bus architecture, modular engines, and local storage management. |

## 📂 Project Structure

| File/Folder | Purpose |
|---|---|
| `index.html` | The main entry point containing the DOM structure and inline CSS styles. |
| `sketch.js` | The combined JavaScript application logic (Engine, UI handling, Storage, etc.). |
| `manifest.json` | Web App Manifest for PWA installation features. |
| `icons/` | Directory containing the necessary app icons for the PWA manifest. |

## 💻 Installation & Setup

| Step | Instruction |
|---|---|
| 1. Clone | Clone this repository to your local machine using standard git commands. |
| 2. Run Locally | Open `index.html` in any modern web browser. No build steps or bundlers are required! |
| 3. Deploy | Simply push the files to a GitHub repository and enable GitHub Pages from the repository settings. |

## 🤝 Usage Notes

The logic of this app is driven by an internal EventBus. If you wish to extend the application (for example, by adding new unit conversion categories), you simply need to update the `FACTORS` object within the `ConversionRegistry` section in `sketch.js`.
