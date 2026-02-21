# CDC Voucher Valuation Calculator

[![Client-Side Only](https://img.shields.io/badge/Client--Side-Only-brightgreen)](https://github.com/josz5930/cdc-voucher-calculator)
[![Privacy First](https://img.shields.io/badge/Privacy-First-blue)](https://github.com/josz5930/cdc-voucher-calculator)
[![LLM/AI Generated](https://img.shields.io/badge/AI_Generated-red)](https://github.com/josz5930/cdc-voucher-calculator)

A **privacy-first, client-side web tool** that helps Singaporean residents calculate the true economic value of their CDC (Community Development Council) vouchers based on personal spending habits, denomination constraints, and opportunity costs.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Supported Voucher Types](#supported-voucher-types)
- [How It Works](#how-it-works)
- [Installation](#installation)
- [Usage](#usage)
- [Security](#security)
- [Technical Details](#technical-details)
- [Browser Compatibility](#browser-compatibility)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

Singapore's CDC vouchers come with specific constraints:
- **No change given**: Vouchers must be used in full
- **Denomination limitations**: Different voucher values have different denomination splits
- **Usage restrictions**: Some vouchers are restricted to specific merchant types
- **Expiry dates**: Vouchers must be used within a validity period

This calculator helps you understand the **real value** of your vouchers by accounting for:
- 💰 **Denomination loss**: Money "lost" when you can't spend the exact amount
- 🛒 **Spending patterns**: Your actual shopping habits at different merchant types
- 💭 **Willingness to pay**: Your subjective valuation of the vouchers

---

## ✨ Features

### Core Features
- ✅ **Multiple Voucher Types**: Support for CDC $300, CDC $500, Climate $300, and SG60 vouchers
- ✅ **Denomination Breakdown**: Visual display of voucher denominations by category
- ✅ **Three Valuation Methods**:
  1. **Willingness to Pay (WTP)**: Subjective value based on personal preference
  2. **Denomination Loss**: Mechanical loss due to "no change" policy
  3. **Incremental Spending**: Opportunity cost based on actual spending patterns
- ✅ **Real-time Calculations**: Instant results as you adjust inputs
- ✅ **Efficiency Score**: Percentage of face value you'll actually utilize

### Security & Privacy
- 🔒 **100% Client-Side**: No data ever leaves your browser
- 🔒 **No Backend**: No servers, no databases, no APIs
- 🔒 **No Tracking**: No analytics, no cookies, no user accounts
- 🔒 **XSS Protected**: Input sanitization and DOM protection
- 🔒 **CSP Enabled**: Content Security Policy headers

### User Experience
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- 🎨 **Clean Interface**: Modern, accessible UI with clear visual hierarchy
- 💾 **Local Storage**: Optional save/restore of your inputs (privacy-respecting)
- 🔗 **Shareable URLs**: Pre-fill calculations via URL parameters
- 📊 **Visual Breakdown**: Tables showing denomination distributions

### Advanced Features
- 🧮 **Multi-Denomination Logic**: Accurate loss calculation across different voucher denominations
- 👥 **SG60 Age-Based**: Special handling for SG60 anniversary vouchers
- 🌡️ **Climate Vouchers**: Separate tracking for climate-specific vouchers
- 📄 **PDF Export**: Export your analysis as a PDF document *(coming soon)*

---

## 🎫 Supported Voucher Types

### CDC Vouchers $300 (Non-May Distribution)
| Category | Denominations | Total |
|----------|--------------|-------|
| Regular/Household | 15×$2, 12×$5, 6×$10 | $150 |
| Supermarket | 15×$10 | $150 |
| **Total** | | **$300** |

### CDC Vouchers $500 (May Distribution)
| Category | Denominations | Total |
|----------|--------------|-------|
| Regular/Household | 25×$2, 20×$5, 10×$10 | $250 |
| Supermarket | 15×$10, 5×$20 | $250 |
| **Total** | | **$500** |

### Climate Vouchers $300
| Category | Denominations | Total |
|----------|--------------|-------|
| Climate Vendors | 5×$2, 4×$5, 12×$10, 3×$50 | $300 |
| **Total** | | **$300** |

### SG60 Vouchers (Anniversary Special)
| Age Group | Total Value | Denominations |
|-----------|-------------|---------------|
| Adult (21-59) | $600 | Mixed denominations |
| Senior (60+) | $800 | Mixed denominations |

---

## 🧮 How It Works

### Method 1: Willingness to Pay (WTP)
```
WTP Value = Voucher Amount × (WTP Percentage / 100)
```
*Example: If you'd pay $210 for $300 vouchers (70% WTP), your subjective value is $210.*

### Method 2: Denomination Loss Estimator
```javascript
// Calculate loss for each transaction
function getLoss(spendAmount, denomination) {
    const remainder = spendAmount % denomination;
    if (remainder === 0) return 0;
    return denomination - remainder; // "Change" you don't get back
}

// Total loss across all visits
Total Loss = Σ(Loss per visit × Number of visits)
Denomination Value = Usable Amount - Total Loss
```

### Method 3: Incremental Spending (Opportunity Cost)
```
Total Eligible Spend = (Supermarket Spend × Visits) + (Heartland Spend × Visits)
Incremental Value = min(Voucher Amount, Total Eligible Spend)
```

### Final Output
The calculator presents a **value range** showing:
- **Minimum value**: Lowest of the three methods
- **Maximum value**: Highest of the three methods
- **Efficiency score**: (Calculated Value / Face Value) × 100%

---

## 🚀 Installation

### Option 1: Direct Download (Expected Workflow)
1. Download the latest release from the [Releases](https://github.com/josz5930/cdc-voucher-calculator/releases) page
2. Extract the ZIP file
3. Open `index.html` in your web browser

### Option 2: Clone Repository (For Development)
```bash
git clone https://github.com/yourusername/cdc-voucher-calculator.git
cd cdc-voucher-calculator
# Open index.html in your browser
```

### Option 3: Local Server (Also for development)
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (http-server)
npx http-server

# Using PHP
php -S localhost:8000
```

Then navigate to `http://localhost:8000`

---

## 📖 Usage

### Basic Usage

1. **Select Voucher Type**: Choose from CDC $300, CDC $500, Climate $300, or SG60
2. **Enter Voucher Amount**: Input your total voucher value (auto-filled based on type)
3. **Set Spending Patterns**:
   - Average spend at supermarkets per visit
   - Number of supermarket visits during validity period
   - Average spend at heartland shops per visit
   - Number of heartland visits during validity period
4. **Set Willingness to Pay**: Adjust the percentage slider to your subjective valuation
5. **View Results**: See your voucher's true value across all three calculation methods

### Advanced Features

#### SG60 Vouchers
If you select "SG60 Vouchers", an age input field will appear:
- Enter your age to get the correct voucher amount and denomination split
- Adults (21-59): $600 total
- Seniors (60+): $800 total

#### Denomination Breakdown
Click "Show Denomination Breakdown" to see:
- Exact quantity of each voucher denomination
- Category-specific splits (Regular vs Supermarket vs Climate)
- Visual tables with totals

#### Save Your Inputs
Toggle "Save my inputs" to store your data in browser localStorage:
- Data never leaves your device
- Automatically restored on your next visit
- Can be cleared anytime via "Clear Form" button

#### Share Your Calculation
Use URL parameters to share or bookmark specific calculations:
```
index.html?amount=300&type=cdc300&super_spend=80&super_visits=4&heart_spend=30&heart_visits=6&wtp=70
```

Supported parameters:
- `amount`: Voucher amount
- `type`: Voucher type (cdc300, cdc500, climate300, sg60)
- `age`: Age (for SG60 vouchers)
- `super_spend`: Supermarket average spend
- `super_visits`: Supermarket visit count
- `heart_spend`: Heartland shop average spend
- `heart_visits`: Heartland shop visit count
- `wtp`: Willingness to pay percentage

---

## 🔒 Security

We have attempted some security in this application, although since it runs in your own computer and you should be the only user....

### Client-Side Architecture
- ✅ **No Server**: All processing happens in your browser
- ✅ **No Data Transmission**: Your financial data never leaves your device
- ✅ **No External APIs**: No calls to external computation services

### Input Protection
- ✅ **Strict Type Checking**: All inputs parsed as numbers with NaN rejection
- ✅ **HTML Encoding**: User data is entity-encoded before display
- ✅ **No Eval**: Zero use of `eval()`, `new Function()`, or `setTimeout(string)`

### DOM Security
- ✅ **textContent Only**: Results injected via `textContent`, never `innerHTML`
- ✅ **CSP Headers**: Content Security Policy restricts script sources
- ✅ **URL Sanitization**: URL parameters validated and type-coerced

### Privacy
- ✅ **No Cookies**: No session tracking
- ✅ **No Analytics**: No Google Analytics or similar
- ✅ **Optional LocalStorage**: Only stores data if explicitly requested
- ✅ **No Fingerprinting**: No browser fingerprinting techniques

---

## 🛠️ Technical Details

### Tech Stack
- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Custom properties, Flexbox, Grid, responsive design
- **JavaScript (ES6+)**: Modern vanilla JS, no frameworks
- **Zero Dependencies**: No external libraries (except optional PDF export)

### File Structure
```
cdc-voucher-calculator/
├── index.html          # Main HTML structure
├── styles.css          # Styling and responsive design
├── app.js              # Core application logic
├── test_logic.js       # Unit tests for calculation functions
├── PRD.md              # Product Requirements Document
└── README.md           # This file
```

### Browser APIs Used
- `URLSearchParams`: URL parameter parsing
- `localStorage`: Optional data persistence
- `Intl.NumberFormat`: Currency formatting
- `debounce`: Input debouncing for performance

### Performance
- **Lightweight**: < 50KB total (HTML + CSS + JS)
- **Fast Load**: No external dependencies to download
- **Efficient**: Debounced calculations, minimal DOM updates
- **Mobile Optimized**: Works smoothly on low-end devices

---

## 🌐 Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 80+ | ✅ Fully Supported |
| Firefox | 75+ | ✅ Fully Supported |
| Safari | 13+ | ✅ Fully Supported |
| Edge | 80+ | ✅ Fully Supported |
| Opera | 67+ | ✅ Fully Supported |
| Mobile Chrome | 80+ | ✅ Fully Supported |
| Mobile Safari | 13+ | ✅ Fully Supported |
| Samsung Internet | 12+ | ✅ Fully Supported |

**Note**: Internet Explorer is not supported.

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Reporting Issues
- Use the [GitHub Issues](https://github.com/yourusername/cdc-voucher-calculator/issues) page
- Include browser version and operating system
- Provide steps to reproduce
- Include screenshots if applicable

### Submitting Changes
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly (see [Testing](#testing))
5. Commit with clear messages (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines
- Maintain client-side only architecture
- Follow existing code style
- Ensure XSS protection for any new inputs
- Test on multiple browsers
- Update documentation as needed

### Testing
Run the test suite in `test_logic.js`:
```bash
# Open browser console and run
runAllTests()
```

Or use Node.js:
```bash
node test_logic.js
```

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 CDC Voucher Calculator Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

## 🙏 Acknowledgments

- Singapore Government for the CDC Voucher scheme
- Community feedback and feature requests
- Contributors who helped improve this tool

---

## 📞 Support


---

## 🗺️ Roadmap

### Completed ✅
- [x] Basic calculator with 3 valuation methods
- [x] Multiple voucher type support
- [x] Denomination breakdown visualization
- [x] SG60 voucher support with age-based calculations
- [x] Climate voucher support
- [x] LocalStorage persistence
- [x] URL parameter sharing
- [x] Responsive design

### The Future? 📋
- [ ] Historical voucher tracking
- [ ] Spending optimization suggestions
- [ ] Merchant locator integration
- [ ] PWA (Progressive Web App) support

---

**Made with ❤️ for Singapore residents**

*This is an independent tool and is not affiliated with or endorsed by the Singapore Government or any commercial company, at the time of writing*
