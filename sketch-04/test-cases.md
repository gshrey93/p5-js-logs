# Test Cases for Fibonacci Palindrome Finder

This document outlines test cases for the `Fibonacci Palindrome Finder` application. The goal is to verify the correctness of the core logic functions (`getFibonacci`, `isPalindrome`, `getNearestPalindromeConstructive`) and the user interface's behavior.

## 🧪 Unit Tests - Core Logic

### Function: `getFibonacci(n)`

**Purpose**: To verify that the function correctly calculates the Nth Fibonacci number, especially with `BigInt` for large values.

| Test ID | Input (n) | Expected Output | Notes |
|---|---|---|---|
| F-001 | `0` | `0n` | Base case |
| F-002 | `1` | `1n` | Base case |
| F-003 | `2` | `1n` | Smallest non-base case |
| F-004 | `5` | `5n` | Standard small value |
| F-005 | `10` | `55n` | Standard value |
| F-006 | `20` | `6765n` | Default UI value |
| F-007 | `90` | `2880067194370816120n` | First value exceeding `Number.MAX_SAFE_INTEGER` (should use BigInt) |
| F-008 | `100` | `354224848179261915075n` | Large BigInt value |
| F-009 | `1000` | (Very large BigInt) | Verify performance and correctness for extremely large N |
| F-010 | Negative (`-1`) | `0n` | Although UI prevents, function should handle gracefully (returns 0n based on current implementation) |

### Function: `isPalindrome(n)`

**Purpose**: To verify that the function correctly identifies palindromic numbers.

| Test ID | Input (n) | Expected Output | Notes |
|---|---|---|---|
| P-001 | `0n` | `true` | Single digit |
| P-002 | `7n` | `true` | Single digit |
| P-003 | `11n` | `true` | Two digits |
| P-004 | `121n` | `true` | Odd length |
| P-005 | `1221n` | `true` | Even length |
| P-006 | `12321n` | `true` | Odd length |
| P-007 | `123321n` | `true` | Even length |
| P-008 | `12n` | `false` | Non-palindrome |
| P-009 | `123n` | `false` | Non-palindrome |
| P-010 | `1234n` | `false` | Non-palindrome |
| P-011 | `100n` | `false` | Ends in zero |

### Function: `getNearestPalindromeConstructive(num)`

**Purpose**: To verify that the function efficiently finds the nearest palindrome to a given number.

| Test ID | Input (num) | Expected Output | Notes |
|---|---|---|---|
| NP-001 | `121n` | `121n` | Already a palindrome |
| NP-002 | `123n` | `121n` | Nearest is smaller |
| NP-003 | `128n` | `131n` | Nearest is larger |
| NP-004 | `125n` | `121n` or `131n` | Equidistant, current logic favors smaller (121) |
| NP-005 | `9n` | `9n` | Single digit |
| NP-006 | `10n` | `11n` | Smallest two-digit non-palindrome |
| NP-007 | `98n` | `99n` | Near end of two digits |
| NP-008 | `100n` | `99n` | Nearest is smaller, different length |
| NP-009 | `102n` | `101n` | Odd length, middle digit change |
| NP-010 | `1234n` | `1221n` | Even length |
| NP-011 | `12345n` | `12321n` | Odd length |
| NP-012 | `6765n` (Fib(20)) | `6776n` | Actual application use case |
| NP-013 | `2880067194370816120n` (Fib(90)) | `288006719437081618820n` (or similar) | Large BigInt, constructive method |
| NP-014 | `1234567890123456789n` | `12345678987654321n` (or similar) | Very large BigInt, complex case |

## 🖥️ UI/Integration Tests

### Scenario: Valid Input and Calculation

| Test ID | Steps | Expected Result |
|---|---|---|
| UI-001 | 1. Open `index.html`. <br> 2. Enter `20` in the input field. <br> 3. Click "Calculate". | - "Calculate" button is disabled. <br> - Results area shows "Calculating...". <br> - After a short delay, results are displayed: <br> `N: 20` <br> `Fibonacci Value: 6,765` <br> `Nearest Palindrome: 6,776` <br> `Difference: 11` <br> - "Calculate" button is re-enabled. |
| UI-002 | 1. Open `index.html`. <br> 2. Enter `90` in the input field. <br> 3. Press `Enter`. | - "Calculate" button is disabled. <br> - Results area shows "Calculating...". <br> - After a short delay, results are displayed with large, comma-formatted numbers. <br> - "Calculate" button is re-enabled. |
| UI-003 | 1. Open `index.html`. <br> 2. Enter `0` in the input field. <br> 3. Click "Calculate". | - Results display: <br> `N: 0` <br> `Fibonacci Value: 0` <br> `Nearest Palindrome: 0` <br> `Difference: 0` |
| UI-004 | 1. Open `index.html`. <br> 2. Enter `1` in the input field. <br> 3. Click "Calculate". | - Results display: <br> `N: 1` <br> `Fibonacci Value: 1` <br> `Nearest Palindrome: 1` <br> `Difference: 0` |

### Scenario: Invalid Input Handling

| Test ID | Steps | Expected Result |
|---|---|---|
| UI-005 | 1. Open `index.html`. <br> 2. Enter `-5` in the input field. <br> 3. Click "Calculate". | - Error message `Please enter a valid positive integer.` appears below the input. <br> - Results area remains empty or shows previous valid result. <br> - "Calculate" button remains enabled. |
| UI-006 | 1. Open `index.html`. <br> 2. Enter `abc` in the input field. <br> 3. Click "Calculate". | - Error message `Please enter a valid positive integer.` appears below the input. <br> - Results area remains empty or shows previous valid result. <br> - "Calculate" button remains enabled. |
| UI-007 | 1. Open `index.html`. <br> 2. Enter nothing (empty) in the input field. <br> 3. Click "Calculate". | - Error message `Please enter a valid positive integer.` appears below the input. <br> - Results area remains empty or shows previous valid result. <br> - "Calculate" button remains enabled. |
| UI-008 | 1. Perform UI-005 (invalid input). <br> 2. Enter `20` in the input field. <br> 3. Click "Calculate". | - Error message disappears. <br> - Valid results for `N=20` are displayed. |

### Scenario: Responsiveness and Background

| Test ID | Steps | Expected Result |
|---|---|---|
| UI-009 | 1. Open `index.html`. <br> 2. Resize the browser window (make it smaller, then larger). | - The main UI panel remains centered. <br> - The p5.js background canvas resizes to fill the window. <br> - The subtle background animation continues. |
| UI-010 | 1. Open `index.html`. <br> 2. Observe the background. | - A subtle, animated background (fading lines) is visible behind the UI panel. |

### Scenario: Accessibility (Manual Check)

| Test ID | Steps | Expected Result |
|---|---|---|
| UI-011 | 1. Perform UI-001 (calculate for N=20). <br> 2. Click the "Copy Results" button. | - The button text changes to "Copied!". <br> - The clipboard contains the formatted text for N=20. <br> - After 2 seconds, the button text reverts to "Copy Results". |
| UI-012 | 1. Perform UI-005 (invalid input). | - The "Copy Results" button should be hidden. |

### Scenario: Accessibility (Manual Check)

| Test ID | Steps | Expected Result |
|---|---|---|
| ACC-001 | 1. Open `index.html`. <br> 2. Use keyboard `Tab` key to navigate through elements. | - Focus moves logically from input to button. <br> - The "Back to Gallery" link is also tabbable. |
| ACC-002 | 1. Open `index.html`. <br> 2. Select and copy the displayed results. | - The text in the results area can be selected and copied to the clipboard. |