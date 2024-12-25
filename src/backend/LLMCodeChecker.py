from ast import Bytes
import subprocess
import tempfile
import os

from tree_sitter import Language, Parser
import tree_sitter_java as jsitter
JAVA_LANGUAGE = Language(jsitter.language())

class LLMCodeChecker:
    # Initializes code comparator with original and gerenrated code
    def __init__(self, original_code, generated_code):
        self.original_code = original_code
        self.generated_code = generated_code

    # Checks if there have been changes in the generated code vs original
    def has_there_been_changes(self):
        return self.original_code != self.generated_code
    
    def is_syntax_correct(self):
        """
        Checks if the generated Java code is syntax correct by parsing it into an AST.
        :return: True if there are no syntax errors, False otherwise.
        """
        tree = self.parse_java_code()
        errors = self.inspect_tree(tree)
        return errors is None

    # Returns a parsed generated code as a tree
    def parse_java_code(self):
        parser = Parser(JAVA_LANGUAGE)                  # Setting parser language
        byte_code = bytes(self.generated_code, 'utf-8') # Parser onyl acceps bytes
        tree = parser.parse(byte_code)                  # Creating the tree by parsing
        return tree

    # Walks the passed tree to find errors. returns a list of errors in the tree, otherwise returns null
    def inspect_tree(self, tree):
        cursor = tree.walk()
        errors = []
        while True:
            node_type = cursor.node.type
            if node_type == 'ERROR':
                errors.append({
                    'start_byte': cursor.node.start_byte,
                    'end_byte': cursor.node.end_byte,
                    'message': 'Syntax error.'
                })
            if cursor.goto_first_child():
                continue
            while not cursor.goto_next_sibling():
                if not cursor.goto_parent():
                    return errors if errors else None


    # Function to be removed if compilation is not going to be utilized
    def is_java_code_compilable(self, project_path=None):
        """
        Checks if the generated Java code is compilable.
        :param project_path: Path to the Java project directory containing other dependent Java files (optional).
        :return: True if the code compiles successfully, False otherwise.
        """
        with tempfile.NamedTemporaryFile(delete=False, suffix=".java") as temp_file:
            temp_file.write(self.generated_code.encode('utf-8'))
            temp_file_path = temp_file.name

        try:
            # Construct the javac command
            command = ["javac", temp_file_path]
            
            # If a project path is provided, include all Java files in the directory for compilation
            if project_path and os.path.isdir(project_path):
                java_files = [os.path.join(project_path, f) for f in os.listdir(project_path) if f.endswith(".java")]
                command.extend(java_files)

            # Attempt to compile the Java code using javac
            result = subprocess.run(command, capture_output=True, text=True)
            if result.returncode == 0:
                return True
            else:
                print("Compilation error:\n", result.stderr)
                return False
        finally:
            # Clean up the temporary file
            os.remove(temp_file_path)
    
def test_llm_code_checker():
    # Sample Java code for testing purposes
    original_code = """
    public class Example {
        public static void main(String[] args) {
            System.out.println("Hello, World!");
        }
    }
    """

    # this is bad code which should give errors
    generated_code = """
    public class Example {
        public static void main(String[] args){
            System.out.println("Hello, Universe!");
        }
    }
    """

    # Instantiate LLMCodeChecker
    checker = LLMCodeChecker(original_code, generated_code)

    # Check if there have been changes
    if checker.has_there_been_changes():
        print("Generated code is different from the original.")
    else:
        print("No changes in the generated code.")

    # Parse the generated code and inspect the tree for errors
    if checker.is_syntax_correct():
        print("No syntax errors found in the generated code.")
    else:
        print("Syntax errors found in the generated code.")

    

if __name__ == "__main__":
    test_llm_code_checker()