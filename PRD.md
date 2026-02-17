I'll create a comprehensive PRD for your CDC Voucher Valuation Tool. Based on the information available and your requirements, here's the markdown document:

```markdown
# Product Requirements Document (PRD)
# CDC Voucher Valuation Tool

## 1. Product Overview

### 1.1 Product Name
CDC Voucher Valuation Calculator

### 1.2 Purpose
A tool that calculates the true economic value of CDC (Community Development Council) vouchers received by Singaporean residents, accounting for usage constraints, spending patterns, and opportunity costs.

### 1.3 Problem Statement
CDC vouchers have a nominal face value (e.g., $300), but their actual economic value to recipients may be lower due to:
- Spending constraints (limited merchant acceptance)
- Denomination loss (fixed $10 denominations with no change given)
- Restricted usage scenarios (not all recipients can fully utilize vouchers)

### 1.4 Target Users
- Singaporean residents who receive CDC vouchers
- Policy researchers analyzing voucher program effectiveness
- Financial planners assessing household resources

---

## 2. Product Goals

### 2.1 Primary Goals
1. Provide an accurate range of economic value for CDC vouchers based on individual spending patterns
2. Help users understand the true value they can extract from their vouchers
3. Enable data-driven analysis of voucher program efficiency

### 2.2 Success Metrics
- Accurate valuation within ±5% of actual realized value
- Clear, interpretable output showing value range and methodology
- Processing time < 2 seconds for calculation

---

## 3. Functional Requirements

### 3.1 Input Variables

#### Required Inputs:
| Variable | Type | Description | Validation Rules |
|----------|------|-------------|------------------|
| `voucher_amount` | Float | Total CDC voucher amount received (SGD) | > 0, typically in multiples of $100 |
| `supermarket_spending_frequency` | Float | Average spending per visit at CDC supermarkets (SGD) | ≥ 0 |
| `supermarket_visit_count` | Integer | Number of supermarket visits during voucher validity period | ≥ 0 |
| `heartland_merchant_spending_frequency` | Float | Average spending per visit at heartland merchants (SGD) | ≥ 0 |
| `heartland_visit_count` | Integer | Number of heartland merchant visits during voucher validity period | ≥ 0 |
| `willingness_to_pay_percentage` | Float | Percentage of face value user would accept as cash (0-100%) | 0-100 |

#### Optional Inputs:
| Variable | Type | Description | Default Value |
|----------|------|-------------|---------------|
| `validity_period_months` | Integer | Voucher validity period in months | 12 |
| `voucher_denomination` | Float | Individual voucher denomination (SGD) | 10.00 |

### 3.2 Calculation Methods

#### Method 1: Willingness to Pay (WTP)
**Purpose**: Capture subjective valuation based on user preference

**Formula**:
```
WTP_Value = voucher_amount × (willingness_to_pay_percentage / 100)
```

**Example**:
- Voucher amount: $300
- Willingness to pay: 70%
- WTP Value: $300 × 0.70 = $210

---

#### Method 2: Denomination Loss Estimator
**Purpose**: Calculate value loss due to fixed denominations and inability to receive change

**Sub-calculations**:

1. **Total Projected Spending**:
```
total_supermarket_spending = supermarket_spending_frequency × supermarket_visit_count
total_heartland_spending = heartland_merchant_spending_frequency × heartland_visit_count
total_projected_spending = total_supermarket_spending + total_heartland_spending
```

2. **Usable Voucher Amount**:
```
usable_amount = min(voucher_amount, total_projected_spending)
```

3. **Denomination Loss Per Transaction**:
For each transaction type (supermarket and heartland):

```python
def calculate_denomination_loss(spending_amount, voucher_denomination):
    if spending_amount == 0:
        return 0
  
    # Calculate remainder when spending is not a multiple of denomination
    remainder = spending_amount % voucher_denomination
  
    if remainder == 0:
        # No loss - spending is exact multiple
        return 0
    else:
        # Loss = amount needed to round up to next denomination
        loss_per_transaction = voucher_denomination - remainder
        return loss_per_transaction
```

4. **Total Denomination Loss**:
```
supermarket_loss_per_visit = calculate_denomination_loss(
    supermarket_spending_frequency, 
    voucher_denomination
)
heartland_loss_per_visit = calculate_denomination_loss(
    heartland_merchant_spending_frequency, 
    voucher_denomination
)

total_denomination_loss = (
    (supermarket_loss_per_visit × supermarket_visit_count) +
    (heartland_loss_per_visit × heartland_visit_count)
)

# Cap loss at usable amount
total_denomination_loss = min(total_denomination_loss, usable_amount)
```

5. **Denomination-Adjusted Value**:
```
denomination_adjusted_value = usable_amount - total_denomination_loss
```

**Example** (from your description):
- Voucher amount: $300
- Supermarket spending: $150 per visit
- Supermarket visits: 1
- Heartland spending: $0
- Heartland visits: 0
- Denomination: $10

Calculation:
- Total projected spending: $150
- Usable amount: min($300, $150) = $150
- Denomination loss: $150 % $10 = $0 (exact multiple)
- Value: $150 - $0 = $150

---

#### Method 3: Incremental Spending Method (Opportunity Cost)
**Purpose**: Calculate value based on cash expenditure replacement

**Formula**:
```
# Calculate how much existing cash spending can be replaced
total_eligible_spending = (
    supermarket_spending_frequency × supermarket_visit_count +
    heartland_merchant_spending_frequency × heartland_visit_count
)

incremental_value = min(voucher_amount, total_eligible_spending)
```

**Rationale**: 
- Vouchers only have value if they replace existing cash spending
- If user doesn't shop at eligible merchants, vouchers force incremental (unplanned) spending
- Maximum value = minimum of (voucher amount, existing eligible spending)

**Example**:
- Voucher amount: $300
- Existing eligible spending: $150
- Incremental value: min($300, $150) = $150

---

### 3.3 Output Specifications

#### Output Structure:
```json
{
  "input_summary": {
    "voucher_amount": 300.00,
    "validity_period_months": 12,
    "voucher_denomination": 10.00,
    "total_projected_spending": 150.00,
    "willingness_to_pay_percentage": 70.0
  },
  "valuation_results": {
    "method_1_wtp": {
      "value": 210.00,
      "percentage_of_face_value": 70.0,
      "methodology": "Willingness to Pay"
    },
    "method_2_denomination_loss": {
      "value": 150.00,
      "percentage_of_face_value": 50.0,
      "methodology": "Denomination Loss Estimator",
      "breakdown": {
        "usable_amount": 150.00,
        "denomination_loss": 0.00,
        "supermarket_loss": 0.00,
        "heartland_loss": 0.00
      }
    },
    "method_3_incremental": {
      "value": 150.00,
      "percentage_of_face_value": 50.0,
      "methodology": "Incremental Spending (Opportunity Cost)"
    }
  },
  "value_range": {
    "minimum_value": 150.00,
    "maximum_value": 210.00,
    "average_value": 170.00,
    "face_value": 300.00,
    "value_efficiency": "50-70%"
  },
  "interpretation": {
    "summary": "Based on your spending patterns, your $300 CDC vouchers have an estimated economic value between $150-$210 (50-70% of face value).",
    "primary_constraint": "Limited eligible spending ($150) compared to voucher amount ($300)",
    "recommendations": [
      "Your vouchers are constrained by limited spending at eligible merchants",
      "Consider identifying additional CDC-participating merchants for better value realization",
      "Denomination loss is minimal due to spending amounts aligning with $10 denominations"
    ]
  }
}
```

---

## 4. Technical Requirements

### 4.1 Programming Language
- Python 3.8+ (recommended for mathematical operations and data handling)
- Alternative: JavaScript/TypeScript for web-based implementation

### 4.2 Core Functions

#### Function 1: Input Validation
```python
def validate_inputs(voucher_amount, supermarket_spending_frequency, 
                    supermarket_visit_count, heartland_merchant_spending_frequency,
                    heartland_visit_count, willingness_to_pay_percentage,
                    validity_period_months=12, voucher_denomination=10.0):
    """
    Validate all input parameters
  
    Returns: tuple (is_valid: bool, error_messages: list)
    """
    pass
```

#### Function 2: WTP Calculation
```python
def calculate_wtp_value(voucher_amount, willingness_to_pay_percentage):
    """
    Calculate Willingness to Pay value
  
    Args:
        voucher_amount (float): Total voucher amount
        willingness_to_pay_percentage (float): WTP as percentage (0-100)
  
    Returns: float
    """
    pass
```

#### Function 3: Denomination Loss Calculation
```python
def calculate_denomination_loss_value(voucher_amount, supermarket_spending_frequency,
                                     supermarket_visit_count, heartland_merchant_spending_frequency,
                                     heartland_visit_count, voucher_denomination=10.0):
    """
    Calculate value accounting for denomination constraints
  
    Returns: dict with keys: value, usable_amount, total_loss, breakdown
    """
    pass
```

#### Function 4: Incremental Spending Calculation
```python
def calculate_incremental_value(voucher_amount, supermarket_spending_frequency,
                                supermarket_visit_count, heartland_merchant_spending_frequency,
                                heartland_visit_count):
    """
    Calculate opportunity cost / cash replacement value
  
    Returns: float
    """
    pass
```

#### Function 5: Main Valuation Function
```python
def calculate_voucher_value(voucher_amount, supermarket_spending_frequency, 
                           supermarket_visit_count, heartland_merchant_spending_frequency,
                           heartland_visit_count, willingness_to_pay_percentage,
                           validity_period_months=12, voucher_denomination=10.0):
    """
    Calculate comprehensive voucher valuation using all three methods
  
    Returns: dict containing all valuation results and interpretation
    """
    pass
```

#### Function 6: Interpretation Generator
```python
def generate_interpretation(valuation_results, input_summary):
    """
    Generate human-readable interpretation and recommendations
  
    Returns: dict with summary, primary_constraint, and recommendations
    """
    pass
```

### 4.3 Dependencies
```
# Python
- typing (built-in)
- json (built-in)
- dataclasses (optional, for structured data)

# Optional for web interface
- flask / fastapi (API framework)
- pydantic (data validation)
```

### 4.4 Error Handling
- Input validation errors should return clear error messages
- Division by zero protection
- Negative value prevention
- Boundary condition handling (e.g., spending exceeds voucher amount)

---

## 5. User Interface Requirements

### 5.1 Input Form
Display fields for all input variables with:
- Clear labels and descriptions
- Input validation (real-time if web-based)
- Default values for optional parameters
- Help tooltips explaining each field

### 5.2 Output Display
- Visual representation of value range (e.g., bar chart or gauge)
- Tabular breakdown of each method
- Percentage efficiency indicators
- Color coding (green for high efficiency, yellow for medium, red for low)

### 5.3 Example Input Form Layout
```
CDC Voucher Valuation Calculator
================================

Voucher Information:
[ ] Total Voucher Amount (SGD)*: _____
[ ] Validity Period (months): _____ (default: 12)
[ ] Voucher Denomination (SGD): _____ (default: 10)

Supermarket Spending:
[ ] Average Spending per Visit (SGD)*: _____
[ ] Number of Visits (during validity period)*: _____

Heartland Merchant Spending:
[ ] Average Spending per Visit (SGD)*: _____
[ ] Number of Visits (during validity period)*: _____

Personal Valuation:
[ ] Willingness to Pay (% of face value)*: _____
    (What % of face value would you accept as cash instead?)

[Calculate Value]
```

---

## 6. Business Logic Rules

### 6.1 Constraints
1. **No Change Rule**: Merchants cannot give change in vouchers or cash
2. **Fixed Denomination**: Vouchers come in $10 denominations
3. **Limited Merchant Network**: Only CDC-participating merchants accept vouchers
4. **Validity Period**: Vouchers expire after validity period (typically 12 months)

### 6.2 Value Hierarchy
The tool provides a **range** rather than single value because:
- **Lower bound**: Most conservative estimate (typically Method 2 or 3)
- **Upper bound**: Most optimistic estimate (typically Method 1 or 3)
- **Average**: Mean of all three methods

### 6.3 Edge Cases

#### Case 1: Zero Eligible Spending
```
Input: voucher_amount = 300, all spending = 0
Output: 
- Method 1: Based on WTP
- Method 2: 0 (no usable amount)
- Method 3: 0 (no cash replacement)
Range: 0 to WTP_value
```

#### Case 2: Spending Exceeds Voucher Amount
```
Input: voucher_amount = 300, total_spending = 500
Output:
- Method 2: Full voucher value minus denomination loss
- Method 3: Full voucher amount (300)
Range: Should approach face value
```

#### Case 3: Perfect Denomination Alignment
```
Input: All spending amounts are multiples of $10
Output:
- Method 2: No denomination loss
- Higher overall value efficiency
```

---

## 7. Test Cases

### Test Case 1: Perfect Utilization (No Loss)
```python
inputs = {
    "voucher_amount": 300,
    "supermarket_spending_frequency": 150,
    "supermarket_visit_count": 2,
    "heartland_merchant_spending_frequency": 0,
    "heartland_visit_count": 0,
    "willingness_to_pay_percentage": 100
}
expected_output = {
    "method_1_wtp": 300,
    "method_2_denomination_loss": 300,
    "method_3_incremental": 300,
    "value_range": {"minimum": 300, "maximum": 300}
}
```

### Test Case 2: Example from Description
```python
inputs = {
    "voucher_amount": 300,
    "supermarket_spending_frequency": 150,
    "supermarket_visit_count": 1,
    "heartland_merchant_spending_frequency": 0,
    "heartland_visit_count": 0,
    "willingness_to_pay_percentage": 70
}
expected_output = {
    "method_1_wtp": 210,
    "method_2_denomination_loss": 150,
    "method_3_incremental": 150,
    "value_range": {"minimum": 150, "maximum": 210}
}
```

### Test Case 3: High Denomination Loss
```python
inputs = {
    "voucher_amount": 300,
    "supermarket_spending_frequency": 25,  # $25 per visit
    "supermarket_visit_count": 10,
    "heartland_merchant_spending_frequency": 0,
    "heartland_visit_count": 0,
    "willingness_to_pay_percentage": 80
}
# Each $25 transaction wastes $5 (rounded to $30)
expected_denomination_loss = 5 * 10 = 50
expected_output = {
    "method_2_denomination_loss": 250,  # $300 - $50 loss
}
```

### Test Case 4: Zero Eligible Spending
```python
inputs = {
    "voucher_amount": 300,
    "supermarket_spending_frequency": 0,
    "supermarket_visit_count": 0,
    "heartland_merchant_spending_frequency": 0,
    "heartland_visit_count": 0,
    "willingness_to_pay_percentage": 50
}
expected_output = {
    "method_1_wtp": 150,
    "method_2_denomination_loss": 0,
    "method_3_incremental": 0,
    "value_range": {"minimum": 0, "maximum": 150}
}
```

### Test Case 5: Mixed Spending with Denomination Loss
```python
inputs = {
    "voucher_amount": 300,
    "supermarket_spending_frequency": 45,  # $45 -> rounds to $50
    "supermarket_visit_count": 3,
    "heartland_merchant_spending_frequency": 18,  # $18 -> rounds to $20
    "heartland_visit_count": 5,
    "willingness_to_pay_percentage": 85
}
# Supermarket loss: $5 per visit × 3 = $15
# Heartland loss: $2 per visit × 5 = $10
# Total spending: (45×3) + (18×5) = 135 + 90 = 225
# Total loss: $25
expected_output = {
    "method_2_denomination_loss": 200,  # min(300, 225) - 25 = 200
}
```

---

## 8. Non-Functional Requirements

### 8.1 Performance
- Calculation time: < 100ms
- Support for batch calculations (multiple users/scenarios)

### 8.2 Scalability
- Design to handle API requests if deployed as web service
- Efficient for 1000+ calculations per minute

### 8.3 Maintainability
- Clear code documentation
- Modular function design
- Unit tests for each calculation method

### 8.4 Usability
- Clear error messages
- Intuitive input labels
- Helpful tooltips and examples

---

## 9. Implementation Phases

### Phase 1: Core Calculation Engine (Priority 1)
- Implement all three calculation methods
- Input validation
- Basic output structure
- Unit tests

### Phase 2: Interpretation & Recommendations (Priority 2)
- Generate human-readable summaries
- Identify primary constraints
- Provide actionable recommendations

### Phase 3: User Interface (Priority 3)
- Command-line interface OR
- Web-based form interface
- Output visualization

### Phase 4: Advanced Features (Priority 4)
- Batch processing
- Historical tracking
- Comparative analysis
- Export functionality (PDF/CSV)

---

## 10. Documentation Requirements

### 10.1 Code Documentation
- Docstrings for all functions
- Type hints for parameters and returns
- Inline comments for complex logic

### 10.2 User Documentation
- README with installation instructions
- Usage examples
- FAQ section
- Methodology explanation

### 10.3 API Documentation (if applicable)
- Endpoint specifications
- Request/response schemas
- Authentication requirements
- Rate limits

---

## 11. Assumptions & Limitations

### 11.1 Assumptions
1. Users can accurately estimate their spending patterns
2. Spending patterns remain consistent during validity period
3. Merchant network remains stable
4. No partial voucher usage within a single denomination (e.g., can't use $5 from a $10 voucher)

### 11.2 Limitations
1. Does not account for behavioral changes induced by voucher possession
2. Does not consider time value of money
3. Assumes rational spending behavior
4. Does not account for secondary benefits (e.g., discovery of new merchants)

### 11.3 Out of Scope
- Real-time merchant lookup
- Transaction tracking
- Voucher redemption functionality
- Integration with actual CDC systems
- Tax implications
- Multi-household calculations

---

## 12. Future Enhancements

### Version 2.0 Potential Features
1. **Machine Learning Integration**: Predict spending patterns based on demographic data
2. **Merchant Optimization**: Suggest optimal merchant combinations for maximum value
3. **Real-time Tracking**: Connect to payment systems to track actual usage
4. **Behavioral Insights**: Compare intended vs actual voucher usage
5. **Policy Analysis Tools**: Aggregate data to assess program effectiveness
6. **Mobile App**: Native iOS/Android applications
7. **Gamification**: Help users maximize voucher value with challenges/tips

---

## 13. References & Resources

### 13.1 Program Information
- Official CDC Vouchers Scheme: https://www.cdc.gov.sg/our-programmes/cdcvs/
- Merchant Directory: (CDC website)
- Terms & Conditions: (CDC website)

### 13.2 Related Research
- Voucher program effectiveness studies
- Behavioral economics literature on gift certificates
- Denomination effect research

---

## Appendix A: Sample Code Structure

```python
from dataclasses import dataclass
from typing import Dict, List, Tuple

@dataclass
class VoucherInput:
    voucher_amount: float
    supermarket_spending_frequency: float
    supermarket_visit_count: int
    heartland_merchant_spending_frequency: float
    heartland_visit_count: int
    willingness_to_pay_percentage: float
    validity_period_months: int = 12
    voucher_denomination: float = 10.0

@dataclass
class ValuationResult:
    wtp_value: float
    denomination_adjusted_value: float
    incremental_value: float
    value_range: Dict[str, float]
    interpretation: Dict[str, any]

class CDCVoucherValuator:
    def __init__(self, voucher_input: VoucherInput):
        self.input = voucher_input
      
    def validate_inputs(self) -> Tuple[bool, List[str]]:
        """Validate all inputs"""
        pass
  
    def calculate_wtp(self) -> float:
        """Method 1: Willingness to Pay"""
        pass
  
    def calculate_denomination_loss(self) -> Dict:
        """Method 2: Denomination Loss Estimator"""
        pass
  
    def calculate_incremental_spending(self) -> float:
        """Method 3: Opportunity Cost"""
        pass
  
    def generate_valuation(self) -> ValuationResult:
        """Generate complete valuation"""
        pass
  
    def export_results(self, format='json') -> str:
        """Export results in specified format"""
        pass
```

---

## Appendix B: Glossary

- **CDC**: Community Development Council (Singapore)
- **WTP**: Willingness to Pay
- **Denomination Loss**: Value lost due to rounding up to fixed voucher denominations
- **Incremental Spending**: Additional spending induced by voucher (not replacing existing spending)
- **Opportunity Cost**: The value of the next best alternative foregone
- **Eligible Spending**: Spending at merchants that accept CDC vouchers
- **Face Value**: The nominal value printed on the voucher
- **Economic Value**: The actual monetary benefit derived from the voucher
- **Heartland Merchants**: Smaller local businesses participating in CDC scheme
- **Value Efficiency**: The percentage of face value realized as economic value

---

**Document Version**: 1.0
**Last Updated**: 2024
**Author**: Product Requirements Document for CDC Voucher Valuation Tool
**Status**: Ready for Implementation
```

This PRD provides comprehensive specifications for an agentic code generation tool to build your CDC Voucher Valuation Calculator. It includes detailed methodology, examples, test cases, and implementation guidance.