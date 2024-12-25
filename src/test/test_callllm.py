import unittest
from callllm import callllm

class TestCallLLM(unittest.TestCase):
    def setUp(self):
        """Initialize callllm instance with test values before each test"""
        self.initial_api_key = "test_api_key"
        self.initial_prompt = "test_prompt"
        self.initial_directory = "/test/directory"
        self.initial_code = "test_code.py"
        
        self.llm = callllm(
            self.initial_api_key,
            self.initial_prompt,
            self.initial_directory,
            self.initial_code
        )

    def test_api_key_setter_getter(self):
        """Test API key setter and getter"""
        # Verify initial state
        self.assertEqual(self.llm.get_key(), self.initial_api_key)
        
        # Set new value
        new_api_key = "new_test_api_key"
        self.llm.set_key(new_api_key)
        
        # Verify state changed
        self.assertEqual(self.llm.get_key(), new_api_key)
        self.assertNotEqual(self.llm.get_key(), self.initial_api_key)

    def test_prompt_setter_getter(self):
        """Test prompt setter and getter"""
        # Verify initial state
        self.assertEqual(self.llm.get_prompt(), self.initial_prompt)
        
        # Set new value
        new_prompt = "new_test_prompt"
        self.llm.set_prompt(new_prompt)
        
        # Verify state changed
        self.assertEqual(self.llm.get_prompt(), new_prompt)
        self.assertNotEqual(self.llm.get_prompt(), self.initial_prompt)

    def test_working_directory_setter_getter(self):
        """Test working directory setter and getter"""
        # Verify initial state
        self.assertEqual(self.llm.get_working_directory(), self.initial_directory)
        
        # Set new value
        new_directory = "/new/test/directory"
        self.llm.set_working_directory(new_directory)
        
        # Verify state changed
        self.assertEqual(self.llm.get_working_directory(), new_directory)
        self.assertNotEqual(self.llm.get_working_directory(), self.initial_directory)

    def test_code_setter_getter(self):
        """Test code setter and getter"""
        # Verify initial state
        self.assertEqual(self.llm.get_code(), self.initial_code)
        
        # Set new value
        new_code = "new_test_code.py"
        self.llm.set_code(new_code)
        
        # Verify state changed
        self.assertEqual(self.llm.get_code(), new_code)
        self.assertNotEqual(self.llm.get_code(), self.initial_code)

if __name__ == '__main__':
    unittest.main(verbosity=2)
    