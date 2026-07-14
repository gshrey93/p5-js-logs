import { getFibonacci, getNearestPalindromeConstructive } from './js/calculator-logic.js';

let inputField;
let submitButton;
let copyButton;
let resultsDiv;
let errorDiv;

let lastResultText = ''; // To store the plain text for copying

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

  // Create the copy button, initially hidden
  copyButton = createButton('Copy Results').parent(uiContainer);
  copyButton.addClass('copy-btn').mousePressed(copyResultsToClipboard).hide();
  
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
    copyButton.hide();
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
    
    // Store plain text for copying
    lastResultText = `N: ${n}\n` +
                     `Fibonacci Value: ${fibVal.toLocaleString()}\n` +
                     `Nearest Palindrome: ${nearestPal.toLocaleString()}\n` +
                     `Difference: ${diff.toLocaleString()}`;
    
    // Display results as HTML
    resultsDiv.html(
      `<p><strong>N:</strong> ${n}</p>` +
      `<p><strong>Fibonacci Value:</strong> ${fibVal.toLocaleString()}</p>` +
      `<p><strong>Nearest Palindrome:</strong> ${nearestPal.toLocaleString()}</p>` +
      `<p><strong>Difference:</strong> ${diff.toLocaleString()}</p>`
    );

    // Re-enable calculate button and show the copy button
    submitButton.removeAttribute('disabled');
    copyButton.html('Copy Results').show();
  }, 10); // A small delay is enough
}

function copyResultsToClipboard() {
  navigator.clipboard.writeText(lastResultText).then(() => {
    copyButton.html('Copied!');
    setTimeout(() => copyButton.html('Copy Results'), 2000); // Reset after 2 seconds
  });
}
