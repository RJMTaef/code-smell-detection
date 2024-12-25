"""
Module for listing files and directories in a given path.
"""
import os
from typing import List

def list_directory_contents(directory: str) -> List[str]:
    """
    Walk through directory and list all files.
    Args:
        directory: Path to examine
    Returns:
        List of found files
    """
    found_files = []
    for dirpath, _, filenames in os.walk(directory):
        print(f'Current Directory: {dirpath}')
        for filename in filenames:
            found_files.append(filename)
            print(f'File: {filename}')
    return found_files

if __name__ == "__main__":
    TARGET_DIR = r''  # Replace with target directory
    list_directory_contents(TARGET_DIR) 
    