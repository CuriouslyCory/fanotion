import { exec } from "child_process";
import { promisify } from "util";

import { escapeForEcho } from "../string-utils.js";

/**
 * Function to run a fabric command.
 *
 * @description Runs a fabric command with the given input and model.
 * @param {string} promptTemplate - The prompt template to use.
 * @param {string} input - The input to the fabric command.
 * @param {string} model - The model to use for the fabric command.
 * @returns {Promise<string>} The output of the fabric command.
 */
export async function fabric(
  promptTemplate: string,
  input: string,
  model = "gpt-4o"
) {
  const escapedInput = escapeForEcho(input);
  const command = `echo "${escapedInput}" | fabric -m ${model} -p ${promptTemplate}`;
  const execAsync = promisify(exec);

  try {
    const { stdout } = await execAsync(command);
    return stdout;
  } catch (error) {
    console.error("Error running fabric command:", error);
    throw error;
  }
}
