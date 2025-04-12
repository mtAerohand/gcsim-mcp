import fs from 'fs';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import util from 'util';
import { getConfig } from '../config.js';

const execAsync = util.promisify(exec);

/**
 * gcsim コマンドを実行して結果を返す
 * @param configContent gcsimの設定ファイル内容
 * @returns gcsim実行結果
 */
async function executeGcsimCommand(configContent: string) {
    // 一時ディレクトリの作成
    const tempDir = path.join(os.tmpdir(), `gcsim-${Date.now()}`);
    await fs.promises.mkdir(tempDir, { recursive: true });

    // configファイルの保存
    const configPath = path.join(tempDir, "config.txt");
    await fs.promises.writeFile(configPath, configContent, 'utf8');

    try {
        // グローバル設定からgcsimのパスを取得
        const { gcsimPath } = getConfig();

        // コマンド組み立て
        const cmd = `"${gcsimPath}" -c "${configPath}" -substatOptimFull`;

        console.log(`Executing command: ${cmd}`);

        // コマンド実行
        const { stdout, stderr } = await execAsync(cmd, { timeout: 60000 });

        if (stderr && stderr.trim() !== '') {
            console.warn(`gcsim stderr: ${stderr}`);
        }

        // 正常に実行された場合、結果を返す
        return {
            content: [{
                type: "text",
                text: stdout
            }]
        };
    } catch (error: unknown) {
        console.error('Error executing gcsim:', error);

        // エラーが発生した場合、エラーメッセージを返す
        const errorMessage = error instanceof Error ? error.message : String(error);
        const stderr = (error as any)?.stderr || '';

        return {
            content: [{
                type: "text",
                text: `Simulation failed: ${errorMessage}\n${stderr}`
            }]
        };
    } finally {
        // 一時ファイル削除
        try {
            await fs.promises.rm(tempDir, { recursive: true, force: true });
        } catch (e) {
            console.error("Failed to clean up temp files:", e);
        }
    }
}

export { executeGcsimCommand };
