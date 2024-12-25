// https://gitlab.com/viktomas/gitlab-example-extension/-/blob/master/src/test/runTest.ts?ref_type=heads
import * as path from "path";
import { runTests } from "@vscode/test-electron";

async function main(): Promise<void> {
  try {
    // The folder containing the Extension Manifest package.json
    // Passed to `--extensionDevelopmentPath`
    const extensionDevelopmentPath: string = path.resolve(__dirname, "../");

    // The path to test runner
    // Passed to --extensionTestsPath
    const extensionTestsPath: string = path.resolve(__dirname, "./suite/index");

    // Download VS Code, unzip it and run the integration test
    await runTests({ extensionDevelopmentPath, extensionTestsPath });
  } catch (err) {
    console.error("Failed to run tests:", err);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("error:", err);
  process.exit(1);
});
