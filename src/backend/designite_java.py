"""
A Python script to execute the DesigniteJava analysis tool on Java projects.
This tool generates CSV output containing various code quality metrics.
Then the csv output files are converted to json files.
"""
import subprocess
import os
import json
import csv
import sys


def run_designite_java(project_path_arg, output_dir_arg, jar_path_arg):
    """
    Execute DesigniteJava tool on a given Java project and capture the output.

    Args:
    project_path (str): Path to the Java project to analyze
    output_dir (str): Directory to store the output files
    jar_path (str): Path to the DesigniteJava JAR file

    Returns:
    dict: A dictionary containing the execution status and any output or errors
    """
    try:
        # Ensure the output directory exists
        os.makedirs(output_dir_arg, exist_ok=True)

        # Deletes old files
        if(len(os.listdir(output_dir_arg)) != 0):
            for files in os.listdir(output_dir_arg):
                if files.endswith((".json", ".txt")):
                    files_path = os.path.join(output_dir_arg, files)

                    os.remove(files_path)
        

        # Construct the command
        command = [
            "java",
            "-jar",
            jar_path_arg,
            "-i",
            project_path_arg,
            "-o",
            output_dir_arg
        ]

        # Execute the command
        result = subprocess.run(command, capture_output=True, text=True, check=True)

        # Convert csv to json file
        convert_csv_to_json(output_dir_arg)

        # Check if the implementation code smell output file were created
        expected_files = [
            "ImplementationSmells.json"
        ]

        missing_files = [f for f in expected_files if not os.path.exists(os.path.join(output_dir, f))]

        if missing_files:
            return {
                "status": "partial_success",
                "message": f"DesigniteJava executed, but some output files are missing: {', '.join(missing_files)}",
                "stdout": result.stdout,
                "stderr": result.stderr
            }

        return {
            "status": "success",
            "message": "DesigniteJava executed successfully",
            "stdout": result.stdout,
            "stderr": result.stderr
        }

    except subprocess.CalledProcessError as e:
        return {
            "status": "error",
            "message": f"DesigniteJava execution failed with return code {e.returncode}",
            "stdout": e.stdout,
            "stderr": e.stderr
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"An unexpected error occurred: {str(e)}",
            "stderr": str(e)
        }

# Since Designite creates CSV files by default this method is needed to covert the CSV files to json files
def convert_csv_to_json(input_dir):
    """
    Takes in a directory with cose smells stated in csv format and converts
    the csv files into JSON. Deletes old csv files.

    Args:
    input_directory(str): path to directory with the csv files

    Returns:
    dict: JSON files that replace the csv files
    """
    for file_name in os.listdir(input_dir):
        if file_name.endswith(".csv"):
            csv_file_path = os.path.join(input_dir, file_name)
            json_file_path = csv_file_path.replace(".csv", ".json")

            # Read the CSV file and convert it to JSON
            with open(csv_file_path, 'r') as csv_file:
                reader = csv.DictReader(csv_file)
                data = list(reader) 

            # Write the data to a JSON file
            with open(json_file_path, 'w') as json_file:
                json.dump(data, json_file, indent=2)

            # Deletes non needed csv file
            os.remove(csv_file_path)

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Error: did not pass all necessary paths to Designite Java")
        sys.exit(1)

    project_path=sys.argv[1]
    output_dir=sys.argv[2]
    jar_path=sys.argv[3]

    result = run_designite_java(project_path, output_dir, jar_path)
    print(json.dumps(result, indent=2))
