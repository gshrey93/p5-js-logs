let inputField;
let submitButton;
let outputText = "";

function setup() {
  createCanvas(600, 450); // Increased height slightly
  background(250);
  
  // 1. Create the UI Elements
  createElement('h3', 'Fibonacci Palindrome Finder').position(20, 0);
  
  createSpan('Enter Nth term: ').position(20, 60);
  
  inputField = createInput('20'); 
  inputField.position(120, 60);
  inputField.size(100);
  
  submitButton = createButton('Calculate');
  submitButton.position(240, 60);
  submitButton.mousePressed(calculateAndDisplay);

  // --- NEW DISCLAIMER ADDED HERE ---
  let disclaimer = createP('Note: Max N for standard JS numbers is 64. <br>Higher values use BigInt automatically.');
  disclaimer.position(20, 90);
  disclaimer.style('font-size', '12px');
  disclaimer.style('color', '#666');
  // ---------------------------------
  
  // Initial instructions text
  outputText = "Enter a number and press Calculate.";
}

function draw() {
  // Clear the bottom area for text (leaving UI at top intact)
  fill(250);
  noStroke();
  rect(0, 160, width, height - 160); // Adjusted Y start to accommodate disclaimer
  
  // Draw the results to the canvas
  fill(50);
  textSize(16);
  textAlign(LEFT, TOP);
  textLeading(25);
  text(outputText, 20, 170, width - 40, height - 170);
}

// --- Core Logic ---

function calculateAndDisplay() {
  let val = inputField.value();
  let n = parseInt(val);

  if (isNaN(n) || n < 0) {
    outputText = "Please enter a valid positive integer.";
    return;
  }
  
  // Visual feedback for heavy calculation
  if (n > 100) {
    outputText = "Calculating... (Large gaps may take time)";
    redraw(); 
  }

  // 1. Get Fibonacci (Always using BigInt for safety)
  let fibVal = getFibonacci(n);
  
  // 2. Get Nearest Palindrome
  let nearestPal = getNearestPalindrome(fibVal);
  
  // 3. Calculate Difference
  let diff = (fibVal > nearestPal) ? fibVal - nearestPal : nearestPal - fibVal;

  outputText = `N: ${n}\n` +
               `Fibonacci Value: ${fibVal}\n` +
               `Nearest Palindrome: ${nearestPal}\n` +
               `Difference: ${diff}`;
}

function isPalindrome(n) {
  let s = n.toString();
  return s === s.split('').reverse().join('');
}

function getFibonacci(n) {
  if (n <= 0) return 0n;
  if (n === 1) return 1n;
  
  let a = 0n;
  let b = 1n;
  
  for (let i = 2; i <= n; i++) {
    let temp = a + b;
    a = b;
    b = temp;
  }
  return b;
}

function getNearestPalindrome(num) {
  if (isPalindrome(num)) return num;
  
  let offset = 1n;
  
  // Safety break for browser performance
  while (true) {
    if (isPalindrome(num - offset)) return num - offset;
    if (isPalindrome(num + offset)) return num + offset;
    offset++;
    
    // Stop if the gap is unreasonably large to prevent crashing
    if (offset > 500000n) {
       return "Gap too large for browser iteration"; 
    }
  }
}
