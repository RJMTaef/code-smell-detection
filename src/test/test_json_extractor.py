import unittest
from unittest.mock import patch, mock_open
import json
from src.backend.json_extractor import extract_line_num_from_json

class TestExtractLineNumFromJson(unittest.TestCase):
    # Test case for a valid JSON file where each entry contains "Method start line no"
    # The function should correctly extract and return the list of line numbers
    @patch("builtins.open", new_callable=mock_open, read_data=json.dumps([
        {"Method start line no": 10},
        {"Method start line no": 20},
        {"Method start line no": 30}
    ]))
    def test_valid_json_extraction(self, mock_file):
        # Test that the line numbers are extracted correctly from the file
        result = extract_line_num_from_json("valid_file.json")
        # Assert that the result matches the expected list of line numbers
        self.assertEqual(result, [10, 20, 30])
        # Verify that the open function was called one time with the right file path
        mock_file.assert_called_once_with("valid_file.json", "r")

    # Test case for a nonexistent file
    @patch("builtins.open", new_callable=mock_open, read_data="")
    def test_file_not_found(self, mock_file):
        # Simulate a FileNotFoundError when the file is not found
        mock_file.side_effect = FileNotFoundError
        # The function should return an empty list when the file is not found
        result = extract_line_num_from_json("nonexistent_file.json")
        # Assert that the result is an empty list
        self.assertEqual(result, [])
        mock_file.assert_called_once_with("nonexistent_file.json", "r")

    # Test case for an invalid JSON format (malformed JSON)
    @patch("builtins.open", new_callable=mock_open, read_data="{invalid: true")
    def test_invalid_json_format(self, mock_file):
        # Simulate a JSONDecodeError due to invalid JSON format
        result = extract_line_num_from_json("invalid_file.json")
        # The function should return an empty list due to the JSON decoding error
        self.assertEqual(result, [])
        mock_file.assert_called_once_with("invalid_file.json", "r")

    # Test case for a JSON file where the "Method start line no" is missing
    @patch("builtins.open", new_callable=mock_open, read_data=json.dumps([{"Other field": 5}]))
    def test_missing_line_no_field(self, mock_file):
        # Simulate the case where the "Method start line no" is missing
        result = extract_line_num_from_json("missing_field.json")      
        # The function should return an empty list when the field is missing
        self.assertEqual(result, [])
        mock_file.assert_called_once_with("missing_field.json", "r")

    # Test case for an empty JSON file
    @patch("builtins.open", new_callable=mock_open, read_data=json.dumps([]))
    def test_empty_json(self, mock_file):
        # Simulate an empty JSON array (no data in the file)
        result = extract_line_num_from_json("empty_file.json")
        # The function should return an empty list for an empty file
        self.assertEqual(result, [])
        mock_file.assert_called_once_with("empty_file.json", "r")

    # Test case for a JSON file with mixed data types for line numbers (strings and integers)
    @patch("builtins.open", new_callable=mock_open, read_data=json.dumps([
        {"Method start line no": "10"},
        {"Method start line no": 20},
        {"Method start line no": "30"}
    ]))
    def test_mixed_types_in_line_numbers(self, mock_file):
        # Simulate the case where line numbers are provided as a mix of strings and integers
        result = extract_line_num_from_json("mixed_types.json")
        # The function should correctly extract and return the mixed types of line numbers
        self.assertEqual(result, ["10", 20, "30"])
        mock_file.assert_called_once_with("mixed_types.json", "r")

if __name__ == "__main__":
    unittest.main()
