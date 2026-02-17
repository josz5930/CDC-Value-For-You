# CDC Voucher Valuation Tool - Implementation Plan

## Overview
A client-side web application for calculating the true economic value of CDC vouchers based on personal spending habits, with strict security and privacy requirements.

## Core Features
1. **Input Form** - 7 validated input fields
2. **Three Calculation Methods** - WTP, Denomination Loss, Incremental Spending
3. **Results Display** - Value range, breakdown, efficiency score
4. **Security Features** - XSS prevention, input sanitization, CSP
5. **UX Enhancements** - URL parameters, localStorage, real-time updates

## Detailed Implementation Tasks

### 1. HTML Structure (`index.html`)
- [ ] Create basic HTML5 structure with semantic tags
- [ ] Add CSP meta tag: `default-src 'self'; style-src 'self'; script-src 'self';`
- [ ] Create form with 7 input fields (labels, IDs, types)
- [ ] Add Calculate and Reset buttons
- [ ] Create results display area with clear sections
- [ ] Include script tag for `app.js`
- [ ] Add viewport meta tag for responsive design

### 2. CSS Styling (`styles.css`)
- [ ] Implement mobile-first responsive design
- [ ] Style form inputs with validation states (error/success)
- [ ] Create card layout for input and results sections
- [ ] Style results table for horizontal scroll on mobile
- [ ] Add typography (font, sizes, colors)
- [ ] Implement button styling (primary/secondary)
- [ ] Add loading/calculation state indicators

### 3. JavaScript Core Logic (`app.js`)
#### 3.1 DOM References & Initialization
- [ ] Get references to all input elements
- [ ] Get references to result display elements
- [ ] Initialize default values
- [ ] Set up event listeners

#### 3.2 Input Validation & Sanitization
- [ ] Create `sanitizeInput()` function
- [ ] Implement type checking with `parseFloat()` and `parseInt()`
- [ ] Validate ranges (positive numbers, 0-100 for percentage)
- [ ] Show visual feedback for invalid inputs
- [ ] Disable Calculate button when inputs are invalid

#### 3.3 Calculation Functions
- [ ] Implement Method 1: WTP calculation
- [ ] Implement Method 2: Denomination Loss calculation (with helper `getLoss()`)
- [ ] Implement Method 3: Incremental Spending calculation
- [ ] Create `calculateAllMethods()` orchestrator
- [ ] Handle edge cases (zero visits, zero spend)

#### 3.4 Results Display
- [ ] Format currency values (2 decimal places)
- [ ] Calculate value range (min/max of three methods)
- [ ] Calculate efficiency score (value/face value %)
- [ ] Update DOM using `textContent` only (no innerHTML)
- [ ] Create summary sentence with dynamic values

#### 3.5 URL Parameter Support
- [ ] Parse URL parameters using `URLSearchParams`
- [ ] Implement allowlist for parameter keys
- [ ] Sanitize and validate parameter values
- [ ] Pre-fill form with parameter values
- [ ] Update URL when form changes (optional)

#### 3.6 localStorage Integration
- [ ] Save form state to localStorage on input change
- [ ] Load from localStorage on page load
- [ ] Validate stored data before applying
- [ ] Add "Clear Saved Data" button/option

#### 3.7 Real-time Updates
- [ ] Attach event listeners for input changes
- [ ] Debounce calculations to prevent performance issues
- [ ] Update results as user types
- [ ] Provide visual feedback during calculation

### 4. Security Implementation
- [ ] Ensure all DOM updates use `textContent`
- [ ] Validate all inputs before calculations
- [ ] Implement CSP in HTML meta tag
- [ ] Sanitize URL parameters
- [ ] Validate localStorage data

### 5. Error Handling & Edge Cases
- [ ] Handle NaN, Infinity results gracefully
- [ ] Show user-friendly error messages
- [ ] Prevent form submission on invalid data
- [ ] Test with PRD's test cases

## Technical Specifications

### Input Fields & Validation
| Field | ID | Type | Validation | Default |
|-------|----|------|------------|---------|
| Voucher Amount | `voucher-amount` | number | >0, ≤2000 | 300 |
| Voucher Denomination | `voucher-denomination` | number | >0 | 10 |
| Supermarket Avg Spend | `supermarket-spend` | number | ≥0 | 80 |
| Supermarket Visits | `supermarket-visits` | number | ≥0, integer | 4 |
| Heartland Avg Spend | `heartland-spend` | number | ≥0 | 30 |
| Heartland Visits | `heartland-visits` | number | ≥0, integer | 6 |
| WTP Percentage | `wtp-percentage` | number | 0-100 | 70 |

### Calculation Logic Details

#### Method 1: Willingness to Pay (WTP)
```javascript
wtpValue = voucherAmount * (wtpPercentage / 100)
```

#### Method 2: Denomination Loss
```javascript
function getLoss(spend, denom) {
    if (spend <= 0) return 0;
    const remainder = spend % denom;
    return remainder === 0 ? 0 : denom - remainder;
}

supermarketLoss = getLoss(supermarketAvgSpend, denomination) * supermarketVisits;
heartlandLoss = getLoss(heartlandAvgSpend, denomination) * heartlandVisits;
totalProjectedSpend = (supermarketAvgSpend * supermarketVisits) + (heartlandAvgSpend * heartlandVisits);
usableAmount = Math.min(voucherAmount, totalProjectedSpend);
totalLoss = Math.min(supermarketLoss + heartlandLoss, usableAmount);
denominationValue = usableAmount - totalLoss;
```

#### Method 3: Incremental Spending
```javascript
totalEligibleSpend = (supermarketAvgSpend * supermarketVisits) + (heartlandAvgSpend * heartlandVisits);
incrementalValue = Math.min(voucherAmount, totalEligibleSpend);
```

### Results to Display
1. **Value Range**: `[min(wtpValue, denominationValue, incrementalValue)]` to `[max(...)]`
2. **Method Breakdown**: Individual values for each method
3. **Efficiency Score**: `(averageValue / voucherAmount) * 100`%
4. **Summary Sentence**: "Your $X vouchers are worth between $Y and $Z..."

## Testing Strategy
- [ ] Test with PRD's provided test cases
- [ ] Test edge cases (zero values, negative inputs)
- [ ] Test URL parameter injection attempts
- [ ] Test localStorage functionality
- [ ] Test mobile responsiveness
- [ ] Test calculation accuracy

## Deployment Considerations
- Static files can be hosted on any web server
- No backend required
- Can be served from GitHub Pages, Netlify, etc.
- File size should be minimal (<100KB total)

## Success Metrics
- All calculations match PRD specifications
- No XSS vulnerabilities
- Mobile-responsive design
- Real-time updates work smoothly
- URL parameters and localStorage function correctly