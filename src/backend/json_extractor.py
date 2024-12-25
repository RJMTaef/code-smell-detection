import json
import sys

def extract_line_num_from_json(json_output_path, file_name_arg):
    """
    Extract line number with code smells from designite java output file.

    Args:
    json_output_path (str): Path to the Designite Java output file

    Returns:
    list: containing the line numbers of code with code smell
    """
    try:
        # Open and read the JSON file
        # Replace with file path as necessary
        with open(json_output_path, "r") as file:
            data = json.load(file)  # Parsing the JSON data

        # list to store line number
        line_numbers = []

        # Extracting the line numbers
        for item in data:
            if (item["Type Name"] == file_name_arg):
                line_no = item.get("Method start line no")
                if line_no is not None:
                    line_numbers.append(line_no)
            
        return line_numbers

    except FileNotFoundError:
        print(f"Error: File '{json_output_path}' not found.")
        return []
    except json.JSONDecodeError as e:
        print(f"Error: Failed to decode JSON from the file '{json_output_path}': {e}")
        return []
    
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Error: did not pass all necessary paths to JSON file")
        sys.exit(1)

    json_path=sys.argv[1]
    file_name=sys.argv[2]

    result = extract_line_num_from_json(json_path, file_name)
    print(json.dumps(result, indent=2))