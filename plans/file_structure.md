# CDC Voucher Valuation Tool - File Structure

## Core Files
1. `index.html` - Main HTML document with form and results display
2. `styles.css` - Pure CSS styling with mobile-first responsive design
3. `app.js` - Vanilla JavaScript application logic

## Optional Files (if needed)
4. `README.md` - Project documentation
5. `plans/` - Directory for planning documents (this file)

## File Contents Overview

### index.html
- HTML5 doctype with semantic structure
- CSP meta tag for security
- Form with 7 input fields (as per PRD)
- Results display area
- Calculate and Reset buttons
- Script tags for app.js

### styles.css
- Mobile-first responsive design
- Card-based layout for inputs and results
- Form validation styling (error states)
- Typography and color scheme
- Horizontal scroll for tables on mobile

### app.js
- DOM element references
- Input validation functions
- Calculation functions for 3 methods
- URL parameter parsing
- localStorage integration
- Real-time calculation updates
- Security sanitization functions

## Architecture Decisions
- Vanilla JS (no frameworks)
- Pure CSS (no Tailwind)
- URL parameter support for sharing
- localStorage for saving inputs
- Real-time calculation updates
- Sensible default values

## Default Values
Based on typical Singaporean household usage:
- Voucher Amount: 300
- Voucher Denomination: 10
- Supermarket Avg Spend: 80
- Supermarket Visits: 4
- Heartland Avg Spend: 30
- Heartland Visits: 6
- WTP Percentage: 70

## Security Implementation
- CSP meta tag in HTML
- Input sanitization using `parseFloat()` and validation
- DOM manipulation via `textContent` only
- URL parameter allowlisting
- localStorage data validation