import unittest
from unittest.mock import patch, mock_open
import os
import json
import subprocess
from designite_java import run_designite_java

class TestRunDesigniteJava(unittest.TestCase):

    @patch('subprocess.run')
    @patch('os.makedirs')
    @patch('os.path.exists')
    def test_successful_execution(self, mock_exists, mock_makedirs, mock_run):
        mock_run.return_value.stdout = "DesigniteJava executed successfully"
        mock_run.return_value.stderr = ""
        mock_exists.return_value = True

        result = run_designite_java("/fake/project", "/fake/output", "/fake/DesigniteJava.jar")

        self.assertEqual(result['status'], 'success')
        self.assertEqual(result['message'], 'DesigniteJava executed successfully')
        mock_makedirs.assert_called_once_with("/fake/output", exist_ok=True)
        mock_run.assert_called_once()

    @patch('subprocess.run')
    @patch('os.makedirs')
    @patch('os.path.exists')
    def test_partial_success(self, mock_exists, mock_makedirs, mock_run):
        mock_run.return_value.stdout = "DesigniteJava executed"
        mock_run.return_value.stderr = ""
        mock_exists.side_effect = [True, False, True, True]  # One file missing

        result = run_designite_java("/fake/project", "/fake/output", "/fake/DesigniteJava.jar")

        self.assertEqual(result['status'], 'partial_success')
        self.assertTrue("some output files are missing" in result['message'])

    @patch('subprocess.run')
    def test_subprocess_error(self, mock_run):
        error = subprocess.CalledProcessError(1, "cmd")
        error.stdout = "Some stdout"
        error.stderr = "Error occurred"
        mock_run.side_effect = error

        result = run_designite_java("/fake/project", "/fake/output", "/fake/DesigniteJava.jar")

        self.assertEqual(result['status'], 'error')
        self.assertTrue("DesigniteJava execution failed with return code 1" in result['message'])
        self.assertEqual(result['stdout'], "Some stdout")
        self.assertEqual(result['stderr'], "Error occurred")

    @patch('subprocess.run')
    def test_unexpected_error(self, mock_run):
        mock_run.side_effect = Exception("Unexpected error")

        result = run_designite_java("/fake/project", "/fake/output", "/fake/DesigniteJava.jar")

        self.assertEqual(result['status'], 'error')
        self.assertTrue("An unexpected error occurred: Unexpected error" in result['message'])
        self.assertEqual(result['stderr'], "Unexpected error")

if __name__ == '__main__':
    unittest.main()