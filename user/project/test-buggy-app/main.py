from utils import calculate_sum, find_average, get_max, is_even, fibonacci

def main():
    print("=== Test Buggy App ===\n")
    
    numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    
    print(f"Numbers: {numbers}\n")
    
    sum_result = calculate_sum(numbers)
    print(f"Sum: {sum_result}")
    
    avg_result = find_average(numbers)
    print(f"Average: {avg_result}")
    
    max_result = get_max(numbers)
    print(f"Max: {max_result}")
    
    print(f"\nIs 5 even? {is_even(5)}")
    print(f"Is 6 even? {is_even(6)}")
    
    print(f"\nFibonacci(5): {fibonacci(5)}")
    
    empty_list = []
    print(f"\nTrying average of empty list: {find_average(empty_list)}")
    
    print(f"\nTrying max of empty list: {get_max(empty_list)}")

if __name__ == "__main__":
    main()
