import os
import sys
import textwrap
import json
import datetime
import html
import difflib

import google.generativeai as genai
from IPython.display import Markdown
from LLMCodeChecker import LLMCodeChecker

MAX_GENERATION_ATTEMPTS = 10

log_dir = os.path.join(os.path.dirname(__file__), '../../logs')
log_file = os.path.join(
    log_dir,
    f"callllm_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
)

def log(message):
    with open(log_file, "a") as f:
        f.write(f"{datetime.datetime.now()}: {message}\n")

class callllm:
    def __init__(self, apiKey, prompt, working_directory, code):
        self.apiKey = apiKey
        self.prompt = prompt
        self.working_directory = working_directory
        self.code = code

    # Setters
    def set_key(self, key):
        self.apiKey = key
        log(f"API key set to: {self.apiKey}")

    def set_prompt(self, prompt):
        self.prompt = prompt
        log(f"Prompt set to: {self.prompt}")

    def set_working_directory(self, working_directory):
        self.working_directory = working_directory
        log(f"Working directory set to: {self.working_directory}")

    def set_code(self, code):
        self.code = code
        log(f"Code file set to: {self.code}")

    # Getters
    def get_key(self):
        return self.apiKey

    def get_prompt(self):
        return self.prompt

    def get_working_directory(self):
        return self.working_directory

    def get_code(self):
        return self.code

    # Methods
    def dial(self):
        genai.configure(api_key=self.apiKey)

        # Using Flash Model
        model = genai.GenerativeModel("gemini-1.5-flash")
        chat = model.start_chat(history=[])

        # Read the test code from the text file
        with open(os.path.join(self.working_directory, self.code), "r") as f:
            testCode = f.read()
            log(f"test code: {testCode}")

        calls = 0
        while calls < MAX_GENERATION_ATTEMPTS:
            calls += 1
            testCode = self.generate_suggestion(chat)


            response_text = self.generate_suggestion(chat)
            log(f"response_text: {response_text}")

            className = self.get_class_name()

            check_code = self.check_generated_code(testCode,response_text)
            if check_code in ["no change" ,"doesn compile"]:
                continue # TODO you can call a "change generation parameters" method here to do just that!
            else:
                break

        if calls == MAX_GENERATION_ATTEMPTS:
            #print("Capped at 9 generations (failed to generate)")
            log("Capped at 9 generations (failed to generate)")
            return
        
        path = self.save_results(className, response_text, testCode)
        return path

    def generate_suggestion(self, chat):

        # Gets files from working directory
        try:
            with open(os.path.join(self.working_directory, self.code), 'r') as f:
                # This code will only run if the file exists
                pass
        except FileNotFoundError:
            log(f"Error: File {self.working_directory}/{self.code} not found.")

        # Generate content using the prompt
        response = chat.send_message(self.prompt)
        # Get the response text for prompt
        responseText = response.text

        # Stream used to prevent messages from saving before llm is done
        response = chat.send_message(responseText, stream=True)
        response_text = ""
        for chunk in response:
            response_text += chunk.text

        # Get the second response text
        response.resolve()

        # Cleans response (DEPENDENT ON PROMPT)
        responseText = response.text.replace("java", "").replace("```", "").replace("\n", "", 1)
        return responseText

    def check_generated_code(self, testCode,responseText):
        # Use LLMCodeChecker to check if generated code differs and is compilable
        checker = LLMCodeChecker(testCode, responseText)

        # Check if the generated code is different from the original code
        if checker.has_there_been_changes():
            log("Generated code is different from the original.")
        else:
            log("No changes in the generated code. Regenerating")
            return "no change"  # TODO you can send the error type here to include in next llm call

        # Check if the generated code is syntax correct
        if checker.is_syntax_correct():
            log("The generated code is syntax correct.")
            return "compiles" # TODO you can send the error type here to include in next llm call
        else:
            log("The generated code has syntax errors. Regenerating...")
            return "doesnt compile" # TODO you can send the error type here to include in next llm call

    def get_class_name(self):
        className = "Class not found"
        checkClass = False
        with open(os.path.join(self.working_directory, self.code), "r") as f:
            for line in f:
                for word in line.split():
                    if checkClass and className == "Class not found":
                        className = word
                        break
                    if word == "class":
                        checkClass = True
        return className

    def save_results(self, className, responseText, testCode):
        if className is None:
            className = "UnknownClass"

        # Get the current datetime object
        now = datetime.datetime.now()

        # Generate the original format for internal use
        generated = now.strftime("%Y%m%d_%H%M%S")

        # Generate a human-readable format using the same datetime object
        readable_generated = now.strftime("%A, %B %d, %Y - %H:%M:%S")

        # Prepare the data to be saved to JSON file
        data_to_save = {
            "method_name": className,
            "refactored_code": responseText if isinstance(responseText, str) else "Code not found",
            "generated_at": generated
        }

        # Create the "results" directory if it doesn't exist
        # resultsDir = "results"
        resultsDir = os.path.join(os.path.dirname(os.path.abspath(os.path.realpath(__file__))), '..', '..', 'results')
        if not os.path.exists(resultsDir):
            os.makedirs(resultsDir)

        fileName = className + "_" + generated + "_results.json"

        filePath = os.path.join(resultsDir, fileName)

        # Write the data to the JSON file
        with open(filePath, "w") as f:
            json.dump(data_to_save, f, indent=4)

        html_path = toHTML(testCode, responseText, className, generated, readable_generated)
        return html_path

def toHTML(originalCode, refactoredCode, className, generated, readable_generated):
    #pages_dir = "pages"
    pages_dir = os.path.join(os.path.dirname(os.path.abspath(os.path.realpath(__file__))), '..', '..', 'pages')

    try:
        # Create the "pages" directory if it doesn't exist
        os.makedirs(pages_dir, exist_ok=True)

        # Calculate the diff between the two code snippets
        diff = difflib.unified_diff(originalCode.splitlines(), refactoredCode.splitlines(), fromfile='Original', tofile='Refactored')

        # Format the diff as HTML
        diff_html = ""
        for line in diff:
            if line.startswith('+'):
                diff_html += f"<span style='color: green;'>{line[1:]}</span><br>"
            elif line.startswith('-'):
                diff_html += f"<span style='color: red;'>{line[1:]}</span><br>"
            else:
                diff_html += f"{line}<br>"

        # Generate the HTML content
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>{className}</title>
            <link href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.58.3/codemirror.min.css" rel="stylesheet" />
            <link href="{{CSS_PLACEHOLDER}}" rel="stylesheet" />
            <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.58.3/codemirror.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.58.3/mode/clike/clike.min.js"></script>
            <script src="{{REJECT_JS_PLACEHOLDER}}"></script>
            <script src="{{ACCEPT_JS_PLACEHOLDER}}"></script>
        </head>
        <body>
            <textarea id="refactoredCode">{refactoredCode}</textarea>
            <button id = "accept">Accept Changes</button> 
            <button id="decline">Reject Changes</button>
            <script>
                CodeMirror.fromTextArea(document.getElementById("refactoredCode"), {{
                    mode: "text/x-java",
                    indentWithTabs: true,
                    smartIndent: true,
                    lineNumbers: true,
                    lineWrapping: true,
                    matchBrackets: true,
                    autofocus: true,
                    theme: "darcula",
                    readOnly: true,

                }});
                
            </script>
        </body>
        </html>
        """

       # Write the HTML content to a file within the "pages" directory
        html_path = f"{pages_dir}/{className}_{generated}_page.html"
        with open(html_path, "w") as file:
            file.write(html_content)
        
    except Exception as e:
        log(f"Error generating HTML: {e}")
        return None
    return html_path

if __name__ == "__main__":
    api_key = sys.argv[1]
    prompt = sys.argv[2]
    working_directory = sys.argv[3]
    code_file_name = sys.argv[4]

    llm = callllm(api_key, prompt, working_directory, code_file_name)
    result = llm.dial()
    print(result)
