# Product Requirements Document (PRD)
# CDC Voucher Valuation Tool (Client-Side Secure)

## 1. Product Overview

### 1.1 Product Name
CDC Voucher Valuation Calculator (Browser-Based)

### 1.2 Purpose
A purely client-side web tool that allows Singaporean residents to calculate the "true" economic value of their CDC vouchers based on personal spending habits, denomination constraints, and opportunity costs.

### 1.3 Key Architectural Constraints
- **Client-Side Only**: All logic, validation, and calculation must occur within the user's browser using JavaScript/TypeScript.
- **No Backend**: There is no server-side processing, no database, and no API calls to external computation engines.
- **Stateless**: No login, no user accounts, and no session cookies.
- **Privacy First**: User data must never leave the user's device.

### 1.4 Target Users
- Singaporean households.
- Privacy-conscious users who do not wish to share financial data with a server.

## 2. Functional Requirements

### 2.1 Input Variables (UI Fields)
All inputs must be strictly typed.

| Variable | UI Label | Data Type | Validation Rules |
|----------|----------|-----------|------------------|
| `voucher_amount` | Total Voucher Amount Received ($) | Float | > 0, Max 2000 |
| `voucher_denomination` | Voucher Denomination ($) | Float | > 0, Default 10 |
| `supermarket_avg_spend` | Avg. Spend at Supermarkets ($) | Float | ≥ 0 |
| `supermarket_visits` | Supermarket Visits (during validity) | Integer | ≥ 0, Integer only |
| `heartland_avg_spend` | Avg. Spend at Heartland Shops ($) | Float | ≥ 0 |
| `heartland_visits` | Heartland Visits (during validity) | Integer | ≥ 0, Integer only |
| `wtp_percentage` | Willingness to Pay (%) | Integer | 0 - 100 |

### 2.2 Calculation Logic (JavaScript)

#### Method 1: Willingness to Pay (WTP)
```javascript
const wtpValue = voucherAmount * (wtpPercentage / 100);
```

#### Method 2: Denomination Loss Estimator
Because vouchers (e.g., $10) do not provide change, loss occurs if transaction amounts are not multiples of the denomination.
*Logic must iterate through the number of visits to simulate cumulative loss.*

```javascript
// Helper: Calculate loss per specific transaction
function getLoss(spendAmount, denomination) {
    if (spendAmount <= 0) return 0;
    const remainder = spendAmount % denomination;
    if (remainder === 0) return 0;
    // Loss is the "change" you don't get back
    // However, usually people round UP. 
    // If I buy $8 item with $10 voucher, loss is $2.
    // Logic: The voucher used is ceil(spend / denom) * denom. 
    // Loss = VoucherUsed - Spend.
    // Constraint: You only use a voucher if you have one.
  
    // SIMPLIFIED MODEL REQUESTED: 
    // "Intrinsic value reduced by spillover."
    // If I spend $18, I use $20 worth of vouchers. Loss is $2.
    return denomination - remainder; 
}

// Calculate Total Potential Loss
const supermarketTotalLoss = getLoss(supermarketAvgSpend, denomination) * supermarketVisits;
const heartlandTotalLoss = getLoss(heartlandAvgSpend, denomination) * heartlandVisits;

// Cap loss at the total voucher amount
const totalProjectedSpend = (supermarketAvgSpend * supermarketVisits) + (heartlandAvgSpend * heartlandVisits);
const usableAmount = Math.min(voucherAmount, totalProjectedSpend);
const totalLoss = Math.min(supermarketTotalLoss + heartlandTotalLoss, usableAmount);

const denominationMethodValue = usableAmount - totalLoss;
```

#### Method 3: Incremental Spending (Opportunity Cost)
Value is limited to the cash expenditure the vouchers actually replace.

```javascript
const totalEligibleSpend = (supermarketAvgSpend * supermarketVisits) + (heartlandAvgSpend * heartlandVisits);
const incrementalMethodValue = Math.min(voucherAmount, totalEligibleSpend);
```

### 2.3 Output Generation
The tool must display:
1.  **Value Range**: Lowest calculated value to Highest calculated value.
2.  **Breakdown**: Specific dollar value for existing methods.
3.  **Efficiency Score**: (Calculated Value / Face Value) %.

---

## 3. Security Requirements

Since this runs in the browser, the primary threats are Cross-Site Scripting (XSS) via DOM manipulation and malicious input injection if the user attempts to share configurations via URL parameters.

### 3.1 Input Sanitize & Validation
- **Strict Type Checking**: Inputs must be parsed as `Number()` or `parseFloat()`. If the result is `NaN`, the input is rejected immediately.
- **HTML Encoding**: Any data reflected back to the user (e.g., "Your calculation for $300...") must be HTML entity encoded.
- **No `eval()`**: The code must strictly avoid `eval()`, `new Function()`, or `setTimeout(string)`.

### 3.2 DOM Protection
- **TextContent vs InnerHTML**: all results must be injected into the DOM using `element.textContent = value` or `element.innerText = value`.
- **Prohibited**: Do **not** use `element.innerHTML` to display calculation results or user inputs.

### 3.3 Output Encoding (XSS Prevention)
If the application reads URL parameters to pre-fill the form (e.g., `?amount=300&visits=5`), the following defense in depth is required:
1.  **URL Parsing**: Use `URLSearchParams` API only.
2.  **Allowlisting**: Only accept specific keys (`amount`, `visits`). Ignore unknown keys.
3.  **Type Coercion**: Immediately convert values to numbers. If a value contains non-numeric characters (except decimal points), discard it.

### 3.4 Library Restrictions
- Use zero-dependeny Vanilla JS or a lightweight framework (React/Vue/Preact) with automatic escaping enabled.
- Do not include third-party script tags (CDNs) for analytics or ads to minimize vector surface.

## 4. Technical Specifications

### 4.1 Tech Stack
- **Languages**: HTML5, CSS3, JavaScript (ES6+) or TypeScript.
- **Framework Options**: 
  - *Option A*: Vanilla JS (Recommended for smallest footprint and auditability).
  - *Option B*: React (Create React App or Vite) – ensures DOM escaping by default.
- **Styling**: Pure CSS or Tailwind (via CDN or build process).

### 4.2 Data Persistence
- **Session**: None.
- **Local Storage (Optional)**: If "Save my inputs" is requested, store as a JSON string in `localStorage`.
  - *Security Note*: When retrieving from `localStorage`, run the same validation logic as user input. Do not trust stored data blindly (it can be edited by the user via DevTools).

### 4.3 Error Handling
- **UI Feedback**: If inputs are invalid (e.g., negative numbers), show a red border on the input field and disable the "Calculate" button.
- **Graceful Failure**: If a calculation results in `Infinity` or `NaN`, display "Invalid Configuration" rather than crashing the script.

## 5. UI/UX Requirements

### 5.1 Layout
- **Single Page Interface**: No reloading.
- **Top Section**: Input Form (Card style).
- **Bottom Section**: Results Dashboard (Update in real-time or on button click).

### 5.2 Responsive Design
- Mobile-first approach. Tables must use horizontal scroll or stack vertically on small screens.

### 5.3 Interaction
- **Compute Trigger**: "Calculate Value" button.
- **Reset Trigger**: "Clear Form" button (wipes inputs and variable state).

## 6. Implementation Guide for Agent

**File Structure Generation Request:**
1.  `index.html`: Main entry point.
2.  `styles.css`: Styling.
3.  `app.js`: Logic (or `calculator.ts`).

**Code Generation Prompt Directives:**
- "Generate a single-page HTML/JS application."
- "Use `document.getElementById` and `textContent`."
- "Create a `calculateValue()` function that reads inputs, parses them to floats, performs the 3 methods, and updates the DOM."
- "Implement a standalone `sanitizeInput()` function that removes non-numeric characters."
- "Add a Content Security Policy (CSP) meta tag in the HTML head limiting scripts to `'self'`."

### Sample CSP Header (for HTML)
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; style-src 'self'; script-src 'self';">
```

## 7. Minimal Test Cases

| Test Input | Expected Behavior |
| :--- | :--- |
| **Voucher Amount**: `<script>alert(1)</script>` | Input field rejects char or converts to `NaN`. No alert triggers. |
| **Visits**: `-5` | Validation error: "Must be positive". |
| **URL Injection**: `myapp.html?amount=" onmouseover="alert(1)` | Tool reads `NaN` or 0. No existing `onmouseover` attribute is created. |
| **Calculation**: Supermarket Spend $150, Voucher $300, Visits 0 | WTP: Based on %, Denom Method: $0 (Loss=0, Usable=0), Incr Method: $0. |

```

### Notes for the Code Generation Agent
*   **Method 1 (WTP)** calculates the purely subjective value.
*   **Method 2 (Denomination Loss)** calculates the mechanical loss of value due to the "No Change" policy.
*   **Method 3 (Incremental/Opp Cost)** calculates the replacement value (financial utility).
*   **Final Output**: The code should present a summary sentence such as: *"Your $300 vouchers are worth between **$150** and **$210** to you based on your usage profile."*

---

## 8. Feature Requests (Completed)

### 8.1 Feature 1: Multiple Voucher Types with Denomination Breakdowns

**Status**: ✅ Implemented

**Description**: Extended the calculator to support multiple Singapore government voucher schemes with detailed denomination breakdowns for each voucher type.

**Supported Voucher Types**:
- **CDC Vouchers $300 (Non-May)**: Regular distribution with $2, $5, $10 denominations
- **CDC Vouchers $500 (May)**: Enhanced May distribution with additional $20 denominations
- **Climate Vouchers $300**: Specialized vouchers for climate-friendly purchases ($2, $5, $10, $50 denominations)
- **SG60 Vouchers**: Anniversary special vouchers with age-based calculations
  - Adult (21-59): $600 total
  - Senior (60+): $800 total

**Implementation Details**:
- Added `VOUCHER_CONFIG` object with detailed denomination mappings
- Created dynamic denomination breakdown tables in UI
- Implemented separate tracking for:
  - Regular/Household use (Heartland merchants & hawkers)
  - Supermarket use (Supermarkets only)
  - Climate vendor use (Climate vouchers only)
- Added age input field for SG60 voucher calculations
- Real-time denomination display updates based on voucher type selection

**Technical Changes**:
- Extended input variables to include `voucherType` and `age`
- Added denomination-aware loss calculation in `getLossMultiDenomination()`
- Implemented dynamic table generation for denomination breakdowns
- Added URL parameter support for voucher type and age

### 8.2 Feature 2: Export Results as PDF

**Status**: 🔄 Pending Implementation

**Description**: Add functionality to export calculation results as a PDF document for users to save or share their voucher valuation analysis.

**Requirements**:
- Export button in the results section
- PDF generation using client-side libraries (e.g., jsPDF, html2pdf.js)
- Include in PDF export:
  - User input values (voucher amount, spending patterns, WTP percentage)
  - Complete denomination breakdown
  - All three calculation method results
  - Value range summary
  - Efficiency score
  - Timestamp of calculation
  - Visual charts/graphs (if implemented)

**Technical Specifications**:
- Use `html2pdf.js` or `jsPDF` library (CDN or bundled)
- Maintain client-side only architecture
- PDF styling should match application theme
- Include page headers and footers
- Support for both desktop and mobile generated PDFs

**Security Considerations**:
- Ensure PDF generation libraries are loaded from trusted CDN with SRI hashes
- No sensitive user data should be transmitted to external PDF generation services
- All processing must remain client-side

**UI/UX Requirements**:
- "Export as PDF" button in results dashboard
- Loading indicator during PDF generation
- Error handling for PDF generation failures
- Filename format: `CDC-Voucher-Analysis-YYYY-MM-DD.pdf`

---

## 9. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Initial | Basic calculator with 3 valuation methods |
| 1.1.0 | 2026-02 | Added multiple voucher types with denomination breakdowns |
| 1.2.0 | TBD | Added PDF export functionality |