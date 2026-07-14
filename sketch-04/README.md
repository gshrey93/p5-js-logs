# Fibonacci Palindrome Finder

A modern web application that calculates the Nth Fibonacci number and finds its nearest palindrome. This sketch demonstrates handling very large numbers in JavaScript and features a clean, responsive user interface.

## ✨ Features

*   **Modern & Responsive UI**: A clean, centered panel that works well on both desktop and mobile devices.
*   **Arbitrary-Precision Arithmetic**: Uses `BigInt` to accurately calculate Fibonacci numbers of any size, far beyond the limits of standard JavaScript numbers.
*   **Performant Palindrome Search**: Employs a constructive algorithm (`getNearestPalindromeConstructive`) to find the nearest palindrome instantly, even for numbers with hundreds of digits.
*   **Clear User Feedback**:
    *   The "Calculate" button is disabled during computation to prevent multiple submissions.
    *   Clear error messages are shown for invalid input.
    *   Results are formatted with commas for improved readability.
*   **Copy Results**: A convenient "Copy Results" button appears after a successful calculation.

## 🛠️ UI Overview

The user interface is built with standard HTML DOM elements for a modern, accessible experience.

*   **Main Panel**: A responsive white panel, centered on the page.
*   **Input**: A numeric input field labeled `Enter Nth term`, pre-filled with `20`.
*   **Button**: A `Calculate` button to trigger the computation.
*   **Error Display**: A dedicated area below the input for validation messages (e.g., for non-numeric input).
*   **Results Area**: A section where the final `N`, Fibonacci Value, Nearest Palindrome, and Difference are displayed as selectable text.

## ⚙️ Core Functions

The application logic is split between UI control (`sketch.js`) and pure calculations (`js/calculator-logic.js`).

| Function | Purpose |
|---|---|---|
| `setup()`, `draw()`, `calculateAndDisplay()` | `sketch.js` | Handles UI creation, event handling, and orchestrates the calculation flow. |
| `getFibonacci(n)` | `js/calculator-logic.js` | Iteratively calculates the Nth Fibonacci number using `BigInt`. |
| `isPalindrome(n)` | `js/calculator-logic.js` | Checks if a given number is a palindrome. |
| `getNearestPalindromeConstructive(num)` | `js/calculator-logic.js` | A performant function that finds the nearest palindrome by constructing candidates. |

## 🚀 How It Works

1.  **User Input**: The user enters an integer `N`.
2.  **Fibonacci Calculation**: The `getFibonacci(n)` function iteratively calculates the Nth Fibonacci number using `BigInt` to ensure precision.
3.  **Palindrome Calculation**: The `getNearestPalindromeConstructive(num)` function takes the large Fibonacci number and constructs its nearest palindrome candidates. This method is significantly faster than a linear search, providing instant results.
4.  **Display**: The results are displayed in a structured HTML format within the main UI panel.

## 📂 File Structure

The project is organized to separate UI concerns from the core calculation logic.

*   `index.html`: The main HTML file. It sets up the page structure and loads the JavaScript as a module (`type="module"`).
*   `sketch.js`: The main script that handles all UI interactions, DOM manipulation, and event handling. It acts as the "controller".
*   `js/calculator-logic.js`: A JavaScript module containing the pure calculation functions (`getFibonacci`, `isPalindrome`, `getNearestPalindromeConstructive`). This is the "engine".
*   `package.json`: Defines project metadata and development dependencies for testing with Jest.
*   `sketch.test.js`: The Jest test file for running automated unit tests on the functions in `calculator-logic.js`.
*   `test-cases.md`: A markdown file documenting manual test scenarios for the UI and logic.

## 🏃 Setup and Usage

### Setup
No build process or server is required.
1.  Clone or download the repository.
2.  Navigate to the `sketch-04/` directory.
3.  Open the `index.html` file in any modern web browser.

### Usage
1.  Enter a non-negative integer in the input field.
2.  Click the **Calculate** button or press the **Enter** key.
3.  The results will appear below. For an input of `N = 40`, the output will be:
    ```
    N: 40
    Fibonacci Value: 102,334,155
    Nearest Palindrome: 102,333,201
    Difference: 954
    ```

## 📝 Behavior and Limits

*   **Large Number Support**: All arithmetic uses `BigInt`, so accuracy holds for arbitrarily large values of `N`.
*   **Performant Palindrome Search**: The palindrome search is constructive, not linear. It can instantly find the nearest palindrome even for numbers with hundreds of digits, avoiding the browser lock-ups that a linear search would cause.
*   **User Feedback**: During calculation, the `Calculate` button is disabled and a "Calculating..." message is displayed to provide clear feedback.
*   **Input Validation**: Negative or non-numeric input triggers a validation message: `"Please enter a valid positive integer."`

## 🧪 Edge Cases

| Input | Result | Notes |
|---|---|---|
| `0` | Fibonacci = 0, Palindrome = 0, Difference = 0 | Handles the base case correctly. |
| `1` | Fibonacci = 1, Palindrome = 1, Difference = 1 | Handles the base case correctly. |
| `8` | Fibonacci = 21, Palindrome = 22, Difference = 1 | A simple case. |
| `30` | Fibonacci = 832,040, Palindrome = 832,238, Difference = 198 | A standard case. |
| Negative (`-5`) | Validation message | Input is validated to be non-negative. |
| Non-numeric (`abc`) | Validation message | Input is validated to be a number. |
| Very large `N` (`1000`) | Correctly calculates and finds palindrome | The use of `BigInt` and the constructive algorithm ensures performance and accuracy for very large numbers. |

## ✅ Testing

This project includes a comprehensive testing strategy to ensure code quality and correctness.

*   **Manual Test Cases**: A detailed list of manual UI and logic test scenarios is documented in `test-cases.md`. This file covers edge cases, valid inputs, and invalid input handling.
*   **Automated Unit Tests**: The core logic functions (`getFibonacci`, `isPalindrome`, `getNearestPalindromeConstructive`) are covered by automated unit tests using Jest.

### Running Automated Tests

To run the automated unit tests, you will need Node.js installed.

1.  Navigate to the `sketch-04/` directory in your terminal.
2.  Install the required development dependencies:
    ```bash
    npm install
    ```
3.  Run the test suite:
    ```bash
    npm test
    ```
