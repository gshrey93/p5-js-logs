let inputField;
let submitButton;
let resultsDiv;
let errorDiv;

function setup() {
  // The canvas is now a background element
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.position(0, 0);
  canvas.style('z-index', '-1');
  background(240); // A light grey background
  
  // Get the main UI container from the HTML
  const uiContainer = select('#ui-container');
  
  // Create and parent all UI elements to the container
  createElement('h3', 'Fibonacci Palindrome Finder').parent(uiContainer);
  
  let inputGroup = createDiv().parent(uiContainer);
  createSpan('Enter Nth term: ').parent(inputGroup);
  inputField = createInput('20').parent(inputGroup);
  inputField.size(80);
  
  submitButton = createButton('Calculate').parent(inputGroup);
  submitButton.mousePressed(calculateAndDisplay);

  // Create divs for error messages and results
  errorDiv = createDiv('').id('error-message').parent(uiContainer);
  resultsDiv = createDiv('Enter a number and press Calculate.').id('results').parent(uiContainer);
  
  // Handle 'Enter' key press in the input field
  inputField.elt.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
      calculateAndDisplay();
    }
  });
}

function draw() {
  // Optional: Add a subtle animated background
  background(240, 50); // Slowly fade previous frames
  stroke(220);
  strokeWeight(0.5);
  if (frameCount % 10 === 0) {
    line(random(width), 0, random(width), height);
    line(0, random(height), width, random(height));
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// --- Core Logic ---

async function calculateAndDisplay() {
  let val = inputField.value();
  let n = parseInt(val);

  if (isNaN(n) || n < 0) {
    errorDiv.html("Please enter a valid positive integer.");
    resultsDiv.html('');
    return;
  }
  
  // Clear previous errors and show loading state
  errorDiv.html('');
  resultsDiv.html('Calculating...');
  submitButton.attribute('disabled', '');

  // Use setTimeout to allow the DOM to update before heavy calculation
  setTimeout(() => {
    const fibVal = getFibonacci(n);
    const nearestPal = getNearestPalindromeConstructive(fibVal);
    const diff = (fibVal > nearestPal) ? fibVal - nearestPal : nearestPal - fibVal;

    resultsDiv.html(
      `<p><strong>N:</strong> ${n}</p>` +
      `<p><strong>Fibonacci Value:</strong> ${fibVal.toLocaleString()}</p>` +
      `<p><strong>Nearest Palindrome:</strong> ${nearestPal.toLocaleString()}</p>` +
      `<p><strong>Difference:</strong> ${diff.toLocaleString()}</p>`
    );
    
    submitButton.removeAttribute('disabled');
  }, 10); // A small delay is enough
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

/**
 * Finds the nearest palindrome to a number using a constructive method,
 * which is much more performant for large numbers than a linear search.
 * @param {BigInt} num The number to start from.
 * @returns {BigInt} The nearest palindrome.
 */
function getNearestPalindromeConstructive(num) {
    if (isPalindrome(num)) return num;

    const s = num.toString();
    const len = s.length;
    const halfLen = Math.floor(len / 2);
    const firstHalf = s.substring(0, halfLen);
    const middle = s.substring(halfLen, len - halfLen);

    // Candidate 1: Mirror the first half
    const p1Root = BigInt(firstHalf + middle);
    const p1 = BigInt(p1Root.toString() + firstHalf.split('').reverse().join(''));

    // Candidate 2: Increment the root and mirror
    const p2Root = p1Root + 1n;
    const p2Str = p2Root.toString();
    const p2 = BigInt(p2Str + p2Str.substring(0, p2Str.length - middle.length).split('').reverse().join(''));

    // Candidate 3: Decrement the root and mirror
    const p3Root = p1Root - 1n;
    const p3Str = p3Root.toString();
    const p3 = BigInt(p3Str + p3Str.substring(0, p3Str.length - middle.length).split('').reverse().join(''));

    const candidates = [p1, p2, p3];
    let nearest = candidates[0];
    let minDiff = (num > nearest) ? num - nearest : nearest - num;

    for (let i = 1; i < candidates.length; i++) {
        const candidate = candidates[i];
        const diff = (num > candidate) ? num - candidate : candidate - num;
        if (diff < minDiff) {
            minDiff = diff;
            nearest = candidate;
        }
    }
    return nearest;
}
