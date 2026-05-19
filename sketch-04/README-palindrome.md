# Fibonacci Palindrome Finder

A p5.js sketch that computes the Nth Fibonacci number, finds the nearest palindrome to that value, and reports the gap between them.

## What It Does

Given an integer N, the sketch:

1. Calculates `Fibonacci(N)` using `BigInt` for exact arithmetic on large numbers.
2. Searches outward from that value to find the nearest palindrome.
3. Displays N, the Fibonacci value, the nearest palindrome, and the absolute difference.

## UI

- **Heading**: "Fibonacci Palindrome Finder"
- **Input**: numeric field labeled `Enter Nth term` (defaults to `20`)
- **Button**: `Calculate`
- **Disclaimer**: notes that values above N = 64 use `BigInt` automatically
- **Output area**: results rendered to the canvas

## Core Functions

| Function | Purpose |
|---|---|
| `setup()` | Builds the canvas and DOM controls, sets initial state |
| `draw()` | Clears the result region and renders the latest output text |
| `calculateAndDisplay()` | Reads input, validates it, runs the calculations, formats the result |
| `getFibonacci(n)` | Iterative Fibonacci using `BigInt` |
| `isPalindrome(n)` | String-based palindrome check |
| `getNearestPalindrome(num)` | Expands an offset outward until a palindrome is found, with a 500,000 safety cap |

## Requirements

- A modern browser with `BigInt` support (current Chrome, Firefox, Edge, Safari).
- [p5.js](https://p5js.org/) (v1.x).

## Setup

1. Save the sketch code as `sketch.js`.
2. Create an `index.html` next to it:

   ```html
   <!DOCTYPE html>
   <html>
     <head>
       <meta charset="utf-8" />
       <title>Fibonacci Palindrome Finder</title>
       <script src="https://cdn.jsdelivr.net/npm/p5@1.9.0/lib/p5.min.js"></script>
     </head>
     <body>
       <script src="sketch.js"></script>
     </body>
   </html>
   ```

3. Open `index.html` directly in your browser, or serve the folder with a static server (`npx serve`, `python -m http.server`, etc.).

## Usage

1. Enter a non-negative integer in the input field.
2. Click `Calculate`.
3. Read the output:

   ```
   N: 20
   Fibonacci Value: 6765
   Nearest Palindrome: 6776
   Difference: 11
   ```

## Behavior and Limits

- All arithmetic uses `BigInt`, so accuracy holds for arbitrarily large N.
- Palindrome search is linear in the gap size. Very large Fibonacci values can be slow.
- If the gap exceeds 500,000, the sketch returns `"Gap too large for browser iteration"` instead of locking up the browser.
- Negative or non-numeric input triggers a validation message: `"Please enter a valid positive integer."`
- For N > 100, the canvas shows a `"Calculating..."` hint before the result appears.

## Edge Cases

| Input | Result |
|---|---|
| `0` | Fibonacci = 0, palindrome = 0, difference = 0 |
| `1` | Fibonacci = 1, palindrome = 1, difference = 0 |
| Negative | Validation message |
| Non-numeric | Validation message |
| Very large N with huge gap | `"Gap too large for browser iteration"` |

## License

Add your preferred license here.
