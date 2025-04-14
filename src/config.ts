export interface ServerConfig {
    gcsimPath: string;
}

// Global configuration object
let config: ServerConfig | null = null;

/**
 * Parse configuration from command line arguments
 * @param argv Command line arguments
 * @returns Parsed configuration object
 * @throws When required options are missing
 */
export function parseArgs(argv: string[]): ServerConfig {
    const args = argv.slice(2); // Skip Node execution path and script path

    let gcsimPath = "";

    // Parse arguments
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg === "--gcsim-path" && i + 1 < args.length) {
            gcsimPath = args[i + 1];
            i++; // Skip next argument
        }
    }

    // Check required options
    if (!gcsimPath) {
        throw new Error("--gcsim-path option is required. Please specify the path to gcsim executable.");
    }

    return { gcsimPath };
}

/**
 * Initialize and save global configuration
 * @param argv Command line arguments
 */
export function initConfig(argv: string[]): ServerConfig {
    config = parseArgs(argv);
    return config;
}

/**
 * Get current configuration
 * @returns Configuration object
 * @throws When configuration has not been initialized
 */
export function getConfig(): ServerConfig {
    if (!config) {
        throw new Error("Configuration has not been initialized. Call initConfig first.");
    }
    return config;
}