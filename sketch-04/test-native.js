import test, { describe } from 'node:test';
import assert from 'node:assert';
import {
  getFibonacci, isPalindrome, getNearestPalindromeConstructive, generatePalindromeFromRoot
} from './js/calculator-logic.js';

describe('Fibonacci Palindrome Finder Logic', () => {

  describe('getFibonacci(n)', () => {
    test('F-001: should return 0n for n = 0', () => {
      assert.strictEqual(getFibonacci(0), 0n);
    });
    test('F-002: should return 1n for n = 1', () => {
      assert.strictEqual(getFibonacci(1), 1n);
    });
    test('F-005: should return 55n for n = 10', () => {
      assert.strictEqual(getFibonacci(10), 55n);
    });
    test('F-006: should return 6765n for n = 20', () => {
      assert.strictEqual(getFibonacci(20), 6765n);
    });
    test('F-008: should correctly calculate large numbers (n=100)', () => {
      assert.strictEqual(getFibonacci(100), 354224848179261915075n);
    });
  });

  describe('isPalindrome(n)', () => {
    test('P-001: should return true for a single digit (0n)', () => {
      assert.strictEqual(isPalindrome(0n), true);
    });
    test('P-004: should return true for an odd-length palindrome (121n)', () => {
      assert.strictEqual(isPalindrome(121n), true);
    });
    test('P-005: should return true for an even-length palindrome (1221n)', () => {
      assert.strictEqual(isPalindrome(1221n), true);
    });
    test('P-008: should return false for a non-palindrome (12n)', () => {
      assert.strictEqual(isPalindrome(12n), false);
    });
    test('P-011: should return false for a number ending in zero (100n)', () => {
      assert.strictEqual(isPalindrome(100n), false);
    });
  });

  describe('getNearestPalindromeConstructive(num)', () => {
    test('NP-001: should return the number itself if it is a palindrome', () => {
      assert.strictEqual(getNearestPalindromeConstructive(121n), 121n);
    });
    test('NP-002: should find the nearest smaller palindrome', () => {
      assert.strictEqual(getNearestPalindromeConstructive(123n), 121n);
    });
    test('NP-003: should find the nearest larger palindrome', () => {
      assert.strictEqual(getNearestPalindromeConstructive(128n), 131n);
    });
    test('NP-008: should find a smaller palindrome with different length', () => {
      assert.strictEqual(getNearestPalindromeConstructive(100n), 99n);
    });
    test('NP-012: should work for the Fib(20) example', () => {
      assert.strictEqual(getNearestPalindromeConstructive(6765n), 6776n);
    });
    test('NP-004: should handle equidistant case (favors smaller)', () => {
      assert.strictEqual(getNearestPalindromeConstructive(125n), 121n);
    });
    test('should handle a very large number', () => {
      const largeNum = 1234567890123456789n;
      const expectedPalindrome = 1234567889887654321n;
      assert.strictEqual(getNearestPalindromeConstructive(largeNum), expectedPalindrome);
    });
  });

  describe('generatePalindromeFromRoot(root, originalLength)', () => {
    test('should generate an even-length palindrome from a root', () => {
      assert.strictEqual(generatePalindromeFromRoot('12', 4), 1221n);
    });
    test('should generate an odd-length palindrome from a root', () => {
      assert.strictEqual(generatePalindromeFromRoot('123', 5), 12321n);
    });
    test('should handle single-digit roots', () => {
      assert.strictEqual(generatePalindromeFromRoot('8', 1), 8n);
    });
    test('should return null for a "0" or empty root', () => {
      assert.strictEqual(generatePalindromeFromRoot('0', 1), null);
    });
  });
});
