# 🐛 Test Buggy App for CodeShield

This is a test project with intentional bugs for CodeShield to fix!

## Bugs in this project:

1. **utils.py:19** - `is_even()` uses `=` instead of `==` for comparison
2. **utils.py:9** - `find_average()` doesn't check for empty list
3. **utils.py:12** - `get_max()` doesn't check for empty list
4. **main.py:25** - Calls `find_average()` with empty list
5. **main.py:27** - Calls `get_max()` with empty list

## How to test with CodeShield:

Use **Project Mode** in CodeShield and enter:
```
d:\New_codeshield\user\project\test-buggy-app
```

Or use **Code Mode** and paste individual files!
