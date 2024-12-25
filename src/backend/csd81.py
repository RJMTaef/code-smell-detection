import json

def extract_info_from_json(json_path):
    # Extracts and prints the method name, refactored code, and date-time from a JSON file.
    # Open and read the JSON file
    # Replace with file path as necessary
    with open(json_path, "r", encoding="utf-8") as file:
        data = json.load(file)  # Parsing the JSON data

    # Extracting the required fields
    method_name = data.get("method", "N/A")
    refactored_code = data.get("refactoredCode", "N/A")
    generated_at = data.get("generatedAt", "N/A")

    # Printing the extracted information
    print(f"Method Name: {method_name}")
    print(f"Refactored Code: {refactored_code}")
    print(f"Generated At (Date and Time): {generated_at}")

# Example usage
JSON_FILE_PATH = "response.json"  # Change this to your actual JSON file path
extract_info_from_json(JSON_FILE_PATH)