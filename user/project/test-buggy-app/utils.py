def calculate_sum(numbers):
    total = 0
    for i in range(len(numbers)):
        total += numbers[i]
    return total

def find_average(numbers):
    if not numbers:
        return 0
    total = calculate_sum(numbers)
    return total / len(numbers)

def get_max(numbers):
    max_val = numbers[0]
    for num in numbers:
        if num > max_val:
            max_val = num
    return max_val

def is_even(num):
    if num % 2 == 0:
        return True
    return False

def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
