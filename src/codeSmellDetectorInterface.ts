// The is the interface for code smell detectors.
// It contains 1 function that trigger the appropriate code smell detector.

class CodeSmellDetector {
  /**
   * @param {string} folderPath
   */
  async runDetector(folderPath: string): Promise<string> {
    if (!folderPath) {
      //if project folder path is not detected
      throw new Error("Project folder path is not detected.");
    }
    throw new Error("Code smell detector failed to activate.");
  }
}

export default CodeSmellDetector;
