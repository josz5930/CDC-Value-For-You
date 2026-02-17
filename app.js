/**
 * CDC Voucher Valuation Calculator
 * Client-side secure implementation with XSS prevention
 */

// Configuration
const CONFIG = {
    STORAGE_KEY: 'cdcVoucherCalculatorData',
    DEBOUNCE_DELAY: 300,
    DEFAULT_VALUES: {
        voucherAmount: 300,
        voucherDenomination: 10,
        supermarketSpend: 80,
        supermarketVisits: 4,
        heartlandSpend: 30,
        heartlandVisits: 6,
        wtpPercentage: 70
    },
    URL_PARAMS: [
        'amount',
        'denomination',
        'super_spend',
        'super_visits',
        'heart_spend',
        'heart_visits',
        'wtp'
    ]
};

// DOM Element References
let elements = {};

// State
let calculationDebounceTimer = null;

/**
 * Initialize the application
 */
function init() {
    cacheElements();
    bindEvents();
    loadFromLocalStorage();
    loadFromUrlParams();
    validateAllInputs();
    calculateAndDisplay();
}

/**
 * Cache DOM element references
 */
function cacheElements() {
    // Input elements
    elements.voucherAmount = document.getElementById('voucher-amount');
    elements.voucherDenomination = document.getElementById('voucher-denomination');
    elements.supermarketSpend = document.getElementById('supermarket-spend');
    elements.supermarketVisits = document.getElementById('supermarket-visits');
    elements.heartlandSpend = document.getElementById('heartland-spend');
    elements.heartlandVisits = document.getElementById('heartland-visits');
    elements.wtpPercentage = document.getElementById('wtp-percentage');
    
    // Error elements
    elements.voucherAmountError = document.getElementById('voucher-amount-error');
    elements.voucherDenominationError = document.getElementById('voucher-denomination-error');
    elements.supermarketSpendError = document.getElementById('supermarket-spend-error');
    elements.supermarketVisitsError = document.getElementById('supermarket-visits-error');
    elements.heartlandSpendError = document.getElementById('heartland-spend-error');
    elements.heartlandVisitsError = document.getElementById('heartland-visits-error');
    elements.wtpPercentageError = document.getElementById('wtp-percentage-error');
    
    // Button elements
    elements.calculateBtn = document.getElementById('calculate-btn');
    elements.resetBtn = document.getElementById('reset-btn');
    elements.shareBtn = document.getElementById('share-btn');
    
    // Results elements
    elements.resultsSection = document.getElementById('results-section');
    elements.minValue = document.getElementById('min-value');
    elements.maxValue = document.getElementById('max-value');
    elements.efficiencyScore = document.getElementById('efficiency-score');
    elements.summaryText = document.getElementById('summary-text');
    elements.wtpValue = document.getElementById('wtp-value');
    elements.denomValue = document.getElementById('denom-value');
    elements.incrementalValue = document.getElementById('incremental-value');
    elements.supermarketLoss = document.getElementById('supermarket-loss');
    elements.heartlandLoss = document.getElementById('heartland-loss');
    elements.totalLoss = document.getElementById('total-loss');
    elements.usableAmount = document.getElementById('usable-amount');
}

/**
 * Bind event listeners
 */
function bindEvents() {
    // Input change events with debouncing
    const inputs = [
        elements.voucherAmount,
        elements.voucherDenomination,
        elements.supermarketSpend,
        elements.supermarketVisits,
        elements.heartlandSpend,
        elements.heartlandVisits,
        elements.wtpPercentage
    ];
    
    inputs.forEach(input => {
        input.addEventListener('input', handleInputChange);
        input.addEventListener('blur', handleInputBlur);
    });
    
    // Button events
    elements.calculateBtn.addEventListener('click', calculateAndDisplay);
    elements.resetBtn.addEventListener('click', resetForm);
    elements.shareBtn.addEventListener('click', shareResults);
}

/**
 * Handle input changes with debouncing
 */
function handleInputChange(event) {
    const input = event.target;
    validateInput(input);
    
    // Clear previous debounce timer
    if (calculationDebounceTimer) {
        clearTimeout(calculationDebounceTimer);
    }
    
    // Set new debounce timer for real-time calculation
    calculationDebounceTimer = setTimeout(() => {
        if (areAllInputsValid()) {
            calculateAndDisplay();
            saveToLocalStorage();
        }
    }, CONFIG.DEBOUNCE_DELAY);
}

/**
 * Handle input blur (when user leaves field)
 */
function handleInputBlur(event) {
    const input = event.target;
    validateInput(input);
}

/**
 * Validate a single input field
 * @param {HTMLInputElement} input - The input element to validate
 * @returns {boolean} - Whether the input is valid
 */
function validateInput(input) {
    const value = sanitizeInput(input.value);
    const fieldName = input.id;
    let isValid = true;
    let errorMessage = '';
    
    // Check if value is a valid number
    if (value === '' || isNaN(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid number';
    } else {
        const numValue = parseFloat(value);
        
        // Field-specific validation
        switch (fieldName) {
            case 'voucher-amount':
                if (numValue <= 0) {
                    isValid = false;
                    errorMessage = 'Must be greater than 0';
                } else if (numValue > 2000) {
                    isValid = false;
                    errorMessage = 'Must not exceed $2000';
                }
                break;
                
            case 'voucher-denomination':
                if (numValue <= 0) {
                    isValid = false;
                    errorMessage = 'Must be greater than 0';
                }
                break;
                
            case 'supermarket-visits':
            case 'heartland-visits':
                if (numValue < 0) {
                    isValid = false;
                    errorMessage = 'Must be 0 or greater';
                } else if (!Number.isInteger(numValue)) {
                    isValid = false;
                    errorMessage = 'Must be a whole number';
                }
                break;
                
            case 'wtp-percentage':
                if (numValue < 0 || numValue > 100) {
                    isValid = false;
                    errorMessage = 'Must be between 0 and 100';
                }
                break;
                
            default:
                if (numValue < 0) {
                    isValid = false;
                    errorMessage = 'Must be 0 or greater';
                }
        }
    }
    
    // Update UI
    updateInputValidationUI(input, isValid, errorMessage);
    
    return isValid;
}

/**
 * Update input validation UI
 */
function updateInputValidationUI(input, isValid, errorMessage) {
    const errorElement = document.getElementById(`${input.id}-error`);
    
    if (isValid) {
        input.classList.remove('error');
        input.classList.add('valid');
        if (errorElement) {
            errorElement.textContent = '';
        }
    } else {
        input.classList.remove('valid');
        input.classList.add('error');
        if (errorElement) {
            errorElement.textContent = errorMessage;
        }
    }
    
    // Update calculate button state
    elements.calculateBtn.disabled = !areAllInputsValid();
}

/**
 * Validate all inputs
 */
function validateAllInputs() {
    const inputs = [
        elements.voucherAmount,
        elements.voucherDenomination,
        elements.supermarketSpend,
        elements.supermarketVisits,
        elements.heartlandSpend,
        elements.heartlandVisits,
        elements.wtpPercentage
    ];
    
    let allValid = true;
    inputs.forEach(input => {
        if (!validateInput(input)) {
            allValid = false;
        }
    });
    
    return allValid;
}

/**
 * Check if all inputs are valid
 */
function areAllInputsValid() {
    const inputs = [
        elements.voucherAmount,
        elements.voucherDenomination,
        elements.supermarketSpend,
        elements.supermarketVisits,
        elements.heartlandSpend,
        elements.heartlandVisits,
        elements.wtpPercentage
    ];
    
    return inputs.every(input => input.classList.contains('valid'));
}

/**
 * Sanitize input value
 * @param {string} value - The raw input value
 * @returns {string} - Sanitized value
 */
function sanitizeInput(value) {
    if (typeof value !== 'string') {
        return '';
    }
    
    // Remove any non-numeric characters except decimal point and minus sign
    // Allow: numbers, one decimal point, one minus sign at start
    let sanitized = value.trim();
    
    // Handle empty string
    if (sanitized === '') {
        return '';
    }
    
    // Remove any HTML tags (XSS prevention)
    sanitized = sanitized.replace(/<[^>]*>/g, '');
    
    // Remove any script tags or event handlers
    sanitized = sanitized.replace(/javascript:/gi, '');
    sanitized = sanitized.replace(/on\w+=/gi, '');
    
    // Keep only valid number characters
    // Allow: digits, one decimal point, one minus sign at start
    let hasDecimal = false;
    let result = '';
    
    for (let i = 0; i < sanitized.length; i++) {
        const char = sanitized[i];
        
        if (char >= '0' && char <= '9') {
            result += char;
        } else if (char === '.' && !hasDecimal) {
            result += char;
            hasDecimal = true;
        } else if (char === '-' && i === 0) {
            result += char;
        }
    }
    
    return result;
}

/**
 * Get numeric value from input
 */
function getInputValue(input) {
    const sanitized = sanitizeInput(input.value);
    const numValue = parseFloat(sanitized);
    return isNaN(numValue) ? 0 : numValue;
}

/**
 * Calculate and display results
 */
function calculateAndDisplay() {
    if (!areAllInputsValid()) {
        elements.resultsSection.style.display = 'none';
        return;
    }
    
    // Get input values
    const voucherAmount = getInputValue(elements.voucherAmount);
    const denomination = getInputValue(elements.voucherDenomination);
    const supermarketSpend = getInputValue(elements.supermarketSpend);
    const supermarketVisits = getInputValue(elements.supermarketVisits);
    const heartlandSpend = getInputValue(elements.heartlandSpend);
    const heartlandVisits = getInputValue(elements.heartlandVisits);
    const wtpPercentage = getInputValue(elements.wtpPercentage);
    
    // Calculate all three methods
    const wtpValue = calculateWTP(voucherAmount, wtpPercentage);
    const denomResult = calculateDenominationLoss(
        voucherAmount,
        denomination,
        supermarketSpend,
        supermarketVisits,
        heartlandSpend,
        heartlandVisits
    );
    const incrementalValue = calculateIncrementalSpending(
        voucherAmount,
        supermarketSpend,
        supermarketVisits,
        heartlandSpend,
        heartlandVisits
    );
    
    // Calculate value range
    const values = [wtpValue, denomResult.value, incrementalValue];
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const avgValue = (wtpValue + denomResult.value + incrementalValue) / 3;
    
    // Calculate efficiency score
    const efficiencyScore = voucherAmount > 0 ? (avgValue / voucherAmount) * 100 : 0;
    
    // Display results
    displayResults({
        voucherAmount,
        wtpValue,
        denomValue: denomResult.value,
        incrementalValue,
        minValue,
        maxValue,
        efficiencyScore,
        supermarketLoss: denomResult.supermarketLoss,
        heartlandLoss: denomResult.heartlandLoss,
        totalLoss: denomResult.totalLoss,
        usableAmount: denomResult.usableAmount
    });
}

/**
 * Method 1: Calculate Willingness to Pay (WTP) value
 */
function calculateWTP(voucherAmount, wtpPercentage) {
    return voucherAmount * (wtpPercentage / 100);
}

/**
 * Helper: Calculate loss for a single transaction
 */
function getLoss(spendAmount, denomination) {
    if (spendAmount <= 0 || denomination <= 0) {
        return 0;
    }
    
    const remainder = spendAmount % denomination;
    if (remainder === 0) {
        return 0;
    }
    
    // Loss is the amount wasted (denomination - remainder)
    return denomination - remainder;
}

/**
 * Method 2: Calculate Denomination Loss
 */
function calculateDenominationLoss(
    voucherAmount,
    denomination,
    supermarketSpend,
    supermarketVisits,
    heartlandSpend,
    heartlandVisits
) {
    // Calculate loss for each category
    const supermarketLossPerVisit = getLoss(supermarketSpend, denomination);
    const heartlandLossPerVisit = getLoss(heartlandSpend, denomination);
    
    const supermarketTotalLoss = supermarketLossPerVisit * supermarketVisits;
    const heartlandTotalLoss = heartlandLossPerVisit * heartlandVisits;
    
    // Calculate total projected spend
    const totalProjectedSpend = (supermarketSpend * supermarketVisits) + 
                                (heartlandSpend * heartlandVisits);
    
    // Calculate usable amount (can't use more than voucher amount or projected spend)
    const usableAmount = Math.min(voucherAmount, totalProjectedSpend);
    
    // Total loss can't exceed usable amount
    const totalLoss = Math.min(supermarketTotalLoss + heartlandTotalLoss, usableAmount);
    
    // Final value
    const value = usableAmount - totalLoss;
    
    return {
        value,
        supermarketLoss: supermarketTotalLoss,
        heartlandLoss: heartlandTotalLoss,
        totalLoss,
        usableAmount
    };
}

/**
 * Method 3: Calculate Incremental Spending (Opportunity Cost)
 */
function calculateIncrementalSpending(
    voucherAmount,
    supermarketSpend,
    supermarketVisits,
    heartlandSpend,
    heartlandVisits
) {
    const totalEligibleSpend = (supermarketSpend * supermarketVisits) + 
                               (heartlandSpend * heartlandVisits);
    
    return Math.min(voucherAmount, totalEligibleSpend);
}

/**
 * Display calculation results
 */
function displayResults(results) {
    // Show results section
    elements.resultsSection.style.display = 'block';
    
    // Format currency values
    const formatCurrency = (value) => {
        if (!isFinite(value) || isNaN(value)) {
            return 'Invalid';
        }
        return '$' + value.toFixed(2);
    };
    
    // Update value range
    elements.minValue.textContent = formatCurrency(results.minValue);
    elements.maxValue.textContent = formatCurrency(results.maxValue);
    
    // Update efficiency score
    const efficiency = Math.max(0, Math.min(100, results.efficiencyScore));
    elements.efficiencyScore.textContent = efficiency.toFixed(1) + '%';
    
    // Update summary text
    const summaryText = `Your ${formatCurrency(results.voucherAmount)} vouchers are worth between ${formatCurrency(results.minValue)} and ${formatCurrency(results.maxValue)} based on your usage profile.`;
    elements.summaryText.textContent = summaryText;
    
    // Update breakdown table
    elements.wtpValue.textContent = formatCurrency(results.wtpValue);
    elements.denomValue.textContent = formatCurrency(results.denomValue);
    elements.incrementalValue.textContent = formatCurrency(results.incrementalValue);
    
    // Update details
    elements.supermarketLoss.textContent = formatCurrency(results.supermarketLoss);
    elements.heartlandLoss.textContent = formatCurrency(results.heartlandLoss);
    elements.totalLoss.textContent = formatCurrency(results.totalLoss);
    elements.usableAmount.textContent = formatCurrency(results.usableAmount);
    
    // Scroll to results on mobile
    if (window.innerWidth < 640) {
        elements.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/**
 * Reset form to default values
 */
function resetForm() {
    // Reset inputs to defaults
    elements.voucherAmount.value = CONFIG.DEFAULT_VALUES.voucherAmount;
    elements.voucherDenomination.value = CONFIG.DEFAULT_VALUES.voucherDenomination;
    elements.supermarketSpend.value = CONFIG.DEFAULT_VALUES.supermarketSpend;
    elements.supermarketVisits.value = CONFIG.DEFAULT_VALUES.supermarketVisits;
    elements.heartlandSpend.value = CONFIG.DEFAULT_VALUES.heartlandSpend;
    elements.heartlandVisits.value = CONFIG.DEFAULT_VALUES.heartlandVisits;
    elements.wtpPercentage.value = CONFIG.DEFAULT_VALUES.wtpPercentage;
    
    // Clear validation states
    const inputs = [
        elements.voucherAmount,
        elements.voucherDenomination,
        elements.supermarketSpend,
        elements.supermarketVisits,
        elements.heartlandSpend,
        elements.heartlandVisits,
        elements.wtpPercentage
    ];
    
    inputs.forEach(input => {
        input.classList.remove('error', 'valid');
        const errorElement = document.getElementById(`${input.id}-error`);
        if (errorElement) {
            errorElement.textContent = '';
        }
    });
    
    // Clear localStorage
    localStorage.removeItem(CONFIG.STORAGE_KEY);
    
    // Clear URL params
    if (window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // Hide results
    elements.resultsSection.style.display = 'none';
    
    // Validate and calculate
    validateAllInputs();
    calculateAndDisplay();
    
    showToast('Form cleared');
}

/**
 * Share results via URL
 */
function shareResults() {
    if (!areAllInputsValid()) {
        showToast('Please fix validation errors first');
        return;
    }
    
    const params = new URLSearchParams();
    params.set('amount', elements.voucherAmount.value);
    params.set('denomination', elements.voucherDenomination.value);
    params.set('super_spend', elements.supermarketSpend.value);
    params.set('super_visits', elements.supermarketVisits.value);
    params.set('heart_spend', elements.heartlandSpend.value);
    params.set('heart_visits', elements.heartlandVisits.value);
    params.set('wtp', elements.wtpPercentage.value);
    
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(url).then(() => {
        showToast('Link copied to clipboard!');
    }).catch(() => {
        // Fallback: show the URL
        prompt('Copy this URL to share:', url);
    });
}

/**
 * Show toast notification
 */
function showToast(message) {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create new toast
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

/**
 * Save form data to localStorage
 */
function saveToLocalStorage() {
    try {
        const data = {
            voucherAmount: elements.voucherAmount.value,
            voucherDenomination: elements.voucherDenomination.value,
            supermarketSpend: elements.supermarketSpend.value,
            supermarketVisits: elements.supermarketVisits.value,
            heartlandSpend: elements.heartlandSpend.value,
            heartlandVisits: elements.heartlandVisits.value,
            wtpPercentage: elements.wtpPercentage.value,
            timestamp: Date.now()
        };
        
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.warn('Failed to save to localStorage:', e);
    }
}

/**
 * Load form data from localStorage
 */
function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (!saved) {
            return;
        }
        
        const data = JSON.parse(saved);
        
        // Validate timestamp (optional: expire after 30 days)
        const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
        if (data.timestamp && (Date.now() - data.timestamp) > maxAge) {
            localStorage.removeItem(CONFIG.STORAGE_KEY);
            return;
        }
        
        // Validate and set each field
        if (isValidNumber(data.voucherAmount)) {
            elements.voucherAmount.value = sanitizeInput(data.voucherAmount);
        }
        if (isValidNumber(data.voucherDenomination)) {
            elements.voucherDenomination.value = sanitizeInput(data.voucherDenomination);
        }
        if (isValidNumber(data.supermarketSpend)) {
            elements.supermarketSpend.value = sanitizeInput(data.supermarketSpend);
        }
        if (isValidNumber(data.supermarketVisits)) {
            elements.supermarketVisits.value = sanitizeInput(data.supermarketVisits);
        }
        if (isValidNumber(data.heartlandSpend)) {
            elements.heartlandSpend.value = sanitizeInput(data.heartlandSpend);
        }
        if (isValidNumber(data.heartlandVisits)) {
            elements.heartlandVisits.value = sanitizeInput(data.heartlandVisits);
        }
        if (isValidNumber(data.wtpPercentage)) {
            elements.wtpPercentage.value = sanitizeInput(data.wtpPercentage);
        }
    } catch (e) {
        console.warn('Failed to load from localStorage:', e);
        // Clear corrupted data
        localStorage.removeItem(CONFIG.STORAGE_KEY);
    }
}

/**
 * Check if value is a valid number string
 */
function isValidNumber(value) {
    if (typeof value !== 'string') {
        return false;
    }
    const num = parseFloat(value);
    return !isNaN(num) && isFinite(num);
}

/**
 * Load form data from URL parameters
 */
function loadFromUrlParams() {
    try {
        const params = new URLSearchParams(window.location.search);
        
        // Only proceed if we have relevant params
        const hasParams = CONFIG.URL_PARAMS.some(param => params.has(param));
        if (!hasParams) {
            return;
        }
        
        // Validate and set each parameter
        const setParamValue = (paramName, element, validator) => {
            if (params.has(paramName)) {
                const rawValue = params.get(paramName);
                const sanitized = sanitizeInput(rawValue);
                const numValue = parseFloat(sanitized);
                
                if (!isNaN(numValue) && validator(numValue)) {
                    element.value = sanitized;
                }
            }
        };
        
        setParamValue('amount', elements.voucherAmount, (v) => v > 0 && v <= 2000);
        setParamValue('denomination', elements.voucherDenomination, (v) => v > 0);
        setParamValue('super_spend', elements.supermarketSpend, (v) => v >= 0);
        setParamValue('super_visits', elements.supermarketVisits, (v) => v >= 0 && Number.isInteger(v));
        setParamValue('heart_spend', elements.heartlandSpend, (v) => v >= 0);
        setParamValue('heart_visits', elements.heartlandVisits, (v) => v >= 0 && Number.isInteger(v));
        setParamValue('wtp', elements.wtpPercentage, (v) => v >= 0 && v <= 100);
        
    } catch (e) {
        console.warn('Failed to load URL params:', e);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}