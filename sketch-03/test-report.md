# Test Execution Report

**Date**: 2023-10-27
**Test Suite**: `sketch.test.js`

## Summary

| Test Suites | Tests | Passed | Failed | Status |
| :--- | :--- | :--- | :--- | :--- |
| 1 | 3 | 3 | 0 | ✅ PASS |

---

## Detailed Results

### ✅ Artillery Duel Game Logic

This suite tests the core business logic of the game, ensuring that fundamental mechanics like damage calculation behave as expected.

| Test Case | Status | Duration |
| :--- | :--- | :--- |
| ✅ **applyDamage**: should apply maximum damage on a direct hit | PASS | 2ms |
| ✅ **applyDamage**: should apply no damage if explosion is too far | PASS | 1ms |
| ✅ **applyDamage**: should apply partial damage within the blast radius | PASS | 1ms |

---

**Conclusion**: All unit tests are passing. The core damage calculation logic is functioning correctly according to specifications.