# Unit Test Execution

## Run Unit Tests

### 1. Install Test Dependencies
```bash
pip install -r requirements.txt
```

### 2. Execute All Unit Tests
```bash
pytest tests/ -v
```

### 3. Run with Coverage (optional)
```bash
pip install pytest-cov
pytest tests/ -v --cov=src --cov-report=term-missing
```

## Expected Results
- **Total Tests**: 58
- **Expected**: All pass, 0 failures
- **Test Report**: Console output (verbose mode)

## Test Breakdown

| Test File | Tests | Coverage Area |
|-----------|-------|---------------|
| test_ghosty.py | 10 | Jump, gravity, wind, bounce, invincibility |
| test_wall.py | 11 | Static/moving walls, collision, activation |
| test_wind.py | 6 | Lerp, timer, bounds, cloud cue |
| test_score.py | 7 | Increment, high score, file I/O |
| test_difficulty.py | 13 | All parameter scaling and caps |
| test_powerup.py | 11 | PowerUp + SlowMotionEffect |

## Fix Failing Tests
If tests fail:
1. Review pytest output for assertion errors
2. Check if constants changed without updating test expectations
3. Verify pygame is initialized (fixtures handle this)
4. Rerun individual test: `pytest tests/test_ghosty.py -v`
