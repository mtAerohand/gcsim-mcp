import fs from 'fs';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import util from 'util';
import { getConfig } from '../config.js';

const execAsync = util.promisify(exec);

/**
 * Execute gcsim command and return results
 * @param configContent gcsim configuration file content
 * @returns gcsim execution results
 */
async function executeGcsimCommand(configContent: string) {
    // Create temporary directory
    const tempDir = path.join(os.tmpdir(), `gcsim-${Date.now()}`);
    await fs.promises.mkdir(tempDir, { recursive: true });

    // Save config file
    const configPath = path.join(tempDir, "config.txt");
    await fs.promises.writeFile(configPath, configContent, 'utf8');

    try {
        // Get gcsim path from global config
        const { gcsimPath } = getConfig();

        // Build command
        const cmd = `"${gcsimPath}" -c "${configPath}" -substatOptimFull`;

        console.log(`Executing command: ${cmd}`);

        // Execute command
        const { stdout, stderr } = await execAsync(cmd, { timeout: 60000 });

        if (stderr && stderr.trim() !== '') {
            console.warn(`gcsim stderr: ${stderr}`);
        }

        // Return results for successful execution
        return {
            content: [{
                type: "text",
                text: stdout
            }]
        };
    } catch (error: unknown) {
        console.error('Error executing gcsim:', error);

        // Return error message if execution fails
        const errorMessage = error instanceof Error ? error.message : String(error);
        const stderr = (error as any)?.stderr || '';

        return {
            content: [{
                type: "text",
                text: `Simulation failed: ${errorMessage}\n${stderr}`
            }]
        };
    } finally {
        // Clean up temporary files
        try {
            await fs.promises.rm(tempDir, { recursive: true, force: true });
        } catch (e) {
            console.error("Failed to clean up temp files:", e);
        }
    }
}

export { executeGcsimCommand };
