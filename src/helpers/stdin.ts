/**
 * Function to read piped input from stdin.
 *
 * @returns {Promise<string>} The piped input as a string.
 */
export function readPipedInput(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    process.stdin.on("data", function (chunk) {
      data += chunk.toString(); // Convert chunk to a string before concatenating
    });

    process.stdin.on("end", function () {
      resolve(data);
    });

    process.stdin.on("error", function (error) {
      reject(error);
    });
  });
}
