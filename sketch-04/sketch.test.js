/**
 * @jest-environment jsdom
 */
import {
  getFibonacci, isPalindrome, getNearestPalindromeConstructive, generatePalindromeFromRoot
} from './js/calculator-logic.js';

describe('Fibonacci Palindrome Finder Logic', () => {

  describe('getFibonacci(n)', () => {
    test('F-001: should return 0n for n = 0', () => {
      expect(getFibonacci(0)).toBe(0n);
    });
    test('F-002: should return 1n for n = 1', () => {
      expect(getFibonacci(1)).toBe(1n);
    });
    test('F-005: should return 55n for n = 10', () => {
      expect(getFibonacci(10)).toBe(55n);
    });
    test('F-006: should return 6765n for n = 20', () => {
      expect(getFibonacci(20)).toBe(6765n);
    });
    test('F-008: should correctly calculate large numbers (n=100)', () => {
      expect(getFibonacci(100)).toBe(354224848179261915075n);
    });
  });

  describe('isPalindrome(n)', () => {
    test('P-001: should return true for a single digit (0n)', () => {
      expect(isPalindrome(0n)).toBe(true);
    });
    test('P-004: should return true for an odd-length palindrome (121n)', () => {
      expect(isPalindrome(121n)).toBe(true);
    });
    test('P-005: should return true for an even-length palindrome (1221n)', () => {
      expect(isPalindrome(1221n)).toBe(true);
    });
    test('P-008: should return false for a non-palindrome (12n)', () => {
      expect(isPalindrome(12n)).toBe(false);
    });
    test('P-011: should return false for a number ending in zero (100n)', () => {
      expect(isPalindrome(100n)).toBe(false);
    });
  });

  describe('getNearestPalindromeConstructive(num)', () => {
    test('NP-001: should return the number itself if it is a palindrome', () => {
      expect(getNearestPalindromeConstructive(121n)).toBe(121n);
    });
    test('NP-002: should find the nearest smaller palindrome', () => {
      expect(getNearestPalindromeConstructive(123n)).toBe(121n);
    });
    test('NP-003: should find the nearest larger palindrome', () => {
      expect(getNearestPalindromeConstructive(128n)).toBe(131n);
    });
    test('NP-008: should find a smaller palindrome with different length', () => {
      expect(getNearestPalindromeConstructive(100n)).toBe(99n);
    });
    test('NP-012: should work for the Fib(20) example', () => {
      expect(getNearestPalindromeConstructive(6765n)).toBe(6776n);
    });
    test('NP-004: should handle equidistant case (favors smaller)', () => {
      // For 125, the candidates are 121 and 131.
      // The difference is 4 for 121 and 6 for 131.
      expect(getNearestPalindromeConstructive(125n)).toBe(121n);
    });
    test('should handle a very large number', () => {
      const largeNum = 1234567890123456789n;
      const expectedPalindrome = 12345678987654321n;
      expect(getNearestPalindromeConstructive(largeNum)).toBe(expectedPalindrome);
    });
  });

  describe('generatePalindromeFromRoot(root, originalLength)', () => {
    test('should generate an even-length palindrome from a root', () => {
      // For a 4-digit number, root is "12" -> "12" + reverse("12") -> 1221
      expect(generatePalindromeFromRoot('12', 4)).toBe(1221n);
    });
    test('should generate an odd-length palindrome from a root', () => {
      // For a 5-digit number, root is "123" -> "123" + reverse("12") -> 12321
      expect(generatePalindromeFromRoot('123', 5)).toBe(12321n);
    });
    test('should handle single-digit roots', () => {
      expect(generatePalindromeFromRoot('8', 1)).toBe(8n);
    });
    test('should return null for a "0" or empty root', () => {
      expect(generatePalindromeFromRoot('0', 1)).toBeNull();
    });
  });
});