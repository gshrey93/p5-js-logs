/**
 * Checks if a given BigInt is a palindrome.
 * @param {BigInt} n The number to check.
 * @returns {boolean} True if the number is a palindrome.
 */
export function isPalindrome(n) {
  const s = n.toString();
  return s === s.split('').reverse().join('');
}

/**
 * Calculates the Nth Fibonacci number using BigInt for arbitrary precision.
 * @param {number} n The term to calculate.
 * @returns {BigInt} The Nth Fibonacci number.
 */
export function getFibonacci(n) {
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
 * Finds the nearest palindrome to a number using a constructive method.
 * This is highly performant for large numbers.
 * @param {BigInt} num The number to start from.
 * @returns {BigInt} The nearest palindrome.
 */
export function getNearestPalindromeConstructive(num) {
  // If the number is already a palindrome, no work is needed.
  if (isPalindrome(num)) return num;

  const s = num.toString();
  const len = s.length;

  // 1. Find the "root" of the number.
  // For "12345", the root is "123". For "1234", the root is "12".
  const halfLen = Math.floor(len / 2);
  const firstHalf = s.substring(0, len - halfLen);
  const firstHalfBigInt = BigInt(firstHalf);

  // 2. Generate three primary palindrome candidates.
  // The nearest palindrome is almost always one of these three:
  //   - The palindrome made by mirroring the original root.
  //   - The palindrome made by mirroring the root-1.
  //   - The palindrome made by mirroring the root+1.
  // Example: For 800, the root is 8. Candidates are from 7, 8, 9 -> 797, 808, 909.
  const candidates = [
    // Candidate from root - 1
    generatePalindromeFromRoot((firstHalfBigInt - 1n).toString(), len),
    // Candidate from the original root
    generatePalindromeFromRoot(firstHalf, len),
    // Candidate from root + 1
    generatePalindromeFromRoot((firstHalfBigInt + 1n).toString(), len)
  ].filter(c => c !== null); // Filter out nulls if generation fails

  // 3. Find which of the candidates is closest to the original number.
  let nearest = -1n;
  let minDiff = -1n;

  for (const candidate of candidates) {
    const diff = (num > candidate) ? num - candidate : candidate - num; // Absolute difference
    if (minDiff === -1n || diff < minDiff) {
      minDiff = diff;
      nearest = candidate;
    } else if (diff === minDiff) {
      // In a tie, the problem statement is ambiguous. We prefer the smaller value.
      nearest = (candidate < nearest) ? candidate : nearest;
    }
  }

  // 4. Handle a special edge case: numbers close to a power of 10.
  // For a number like 100, the candidates generated above would be 99, 101, 111.
  // The algorithm would pick 101 (diff 1) over 99 (diff 1).
  // However, for a number like 1000, the nearest is 999. Our candidates would be
  // from roots 99, 100, 101 -> 9999, 10001, 10101. 999 is missed.
  // This check adds the largest palindrome with one fewer digit (e.g., 99, 999)
  // to the comparison.
  const allNines = BigInt('9'.repeat(len - 1));
  const diffWithNines = num - allNines;
  if (minDiff === -1n || diffWithNines < minDiff || (diffWithNines === minDiff && allNines < nearest)) {
    return allNines;
  }

  return nearest;
}

/**
 * A helper function to generate a palindrome from a "root" string.
 * @param {string} root The first half of the number.
 * @param {number} originalLength The total length of the original number.
 * @returns {BigInt | null} The generated palindrome as a BigInt, or null on error.
 */
export function generatePalindromeFromRoot(root, originalLength) {
  if (!root || root === '0') return null;
  const len = root.length;
  // Determine the part of the root to reverse and append.
  // If original was odd (e.g., 5 digits, root has 3), we skip the root's last char.
  const secondHalf = root.substring(0, len - (originalLength % 2)).split('').reverse().join('');
  return BigInt(root + secondHalf);
}