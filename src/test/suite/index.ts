// https://gitlab.com/viktomas/gitlab-example-extension/-/blob/master/src/test/suite/index.ts?ref_type=heads
import * as path from 'path';
import Mocha from 'mocha';
const glob = require('glob');

export function run(): Promise<void> {
  // Create the mocha test
  const mocha = new Mocha({
    color: true,
  });

  const testsRoot = path.resolve(__dirname, '..');

  return new Promise((resolve, reject) => {
    // Declare types for err and files
    glob('**/**.test.js', { cwd: testsRoot }, (err: Error | null, files: string[]) => {
      if (err) {
        return reject(err);
      }

      // Add files to the test suite
      files.forEach((file: string) => mocha.addFile(path.resolve(testsRoot, file)));

      try {
        // Run the mocha test
        mocha.run((failures: number) => {
          if (failures > 0) {
            reject(new Error(`${failures} tests failed.`));
          } else {
            resolve();
          }
        });
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  });
}
