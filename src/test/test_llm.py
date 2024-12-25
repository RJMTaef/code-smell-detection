import sys
import os

# Gets current file path
parent_dir = os.path.dirname(os.path.abspath(__file__))

# Construct the absolute path to callllm.py
callllm_path = os.path.join(parent_dir, "../")

# Add the absolute path to sys.path
sys.path.insert(0, callllm_path)

import src.backend.callllm as callllm

# Uses Alex's API Key for testing
key = "AIzaSyAHmdaTzovm8pBzczc8JMP8eXGBJvicE2k"

# Read the prompt from prompt.txt
with open("../backend/prompt.txt", "r") as f:
    prompt = f.read()

# Test 1
test = callllm.callllm(key, prompt, "../test", "test_code.java")
test.dial()

# Test 2
test.set_code("test_code_2.java")
test.dial()