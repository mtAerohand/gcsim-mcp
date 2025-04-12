export interface ServerConfig {
    gcsimPath: string;
}

// グローバルな設定オブジェクト
let config: ServerConfig | null = null;

/**
 * コマンドライン引数から設定を解析する
 * @param argv コマンドライン引数
 * @returns 解析された設定オブジェクト
 * @throws 必須オプションが欠けている場合
 */
export function parseArgs(argv: string[]): ServerConfig {
    const args = argv.slice(2); // ノードの実行パスとスクリプトパスをスキップ

    let gcsimPath = "";

    // 引数を解析
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg === "--gcsim-path" && i + 1 < args.length) {
            gcsimPath = args[i + 1];
            i++; // 次の引数をスキップ
        }
    }

    // 必須オプションをチェック
    if (!gcsimPath) {
        throw new Error("--gcsim-path option is required. Please specify the path to gcsim executable.");
    }

    return { gcsimPath };
}

/**
 * 設定を初期化し、グローバル設定を保存
 * @param argv コマンドライン引数
 */
export function initConfig(argv: string[]): ServerConfig {
    config = parseArgs(argv);
    return config;
}

/**
 * 現在の設定を取得
 * @returns 設定オブジェクト
 * @throws 設定が初期化されていない場合
 */
export function getConfig(): ServerConfig {
    if (!config) {
        throw new Error("Configuration has not been initialized. Call initConfig first.");
    }
    return config;
}