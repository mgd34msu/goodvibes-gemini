/**
 * Extension Installation Script
 *
 * Automates the installation of the GoodVibes extension into the Gemini CLI.
 * 1. Builds the project.
 * 2. Generates the absolute path configuration.
 * 3. Updates the global Gemini MCP configuration.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';

const CWD = process.cwd();
const HOME_DIR = os.homedir();
const GEMINI_CONFIG_DIR = path.join(HOME_DIR, '.gemini');
const MCP_CONFIG_PATH = path.join(GEMINI_CONFIG_DIR, 'mcp.json'); // Standard MCP config location
const GEMINI_CONFIG_PATH = path.join(GEMINI_CONFIG_DIR, 'config.json'); // Fallback/Main config

// Configuration for this specific extension
const EXTENSION_NAME = 'goodvibes-tools';
const SERVER_SCRIPT = path.join(CWD, 'tools', 'implementations', 'tool-search-server', 'dist', 'index.cjs');

function log(msg: string) {
  console.log(`\x1b[36m[Install]\x1b[0m ${msg}`);
}

function error(msg: string) {
  console.error(`\x1b[31m[Error]\x1b[0m ${msg}`);
  process.exit(1);
}

function runBuild() {
  log('Building extension...');
  try {
    execSync('npm install && npm run build', { stdio: 'inherit', cwd: CWD });
  } catch (e) {
    error('Build failed. Please check the logs above.');
  }
}

function getMcpConfig() {
  return {
    command: 'node',
    args: [SERVER_SCRIPT],
    env: {
      GEMINI_PLUGIN_ROOT: CWD,
      NODE_ENV: 'production'
    }
  };
}

function updateConfigFile(configPath: string) {
  let config: any = { mcpServers: {} };
  
  if (fs.existsSync(configPath)) {
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch (e) {
      log(`Warning: Could not parse existing config at ${configPath}. Creating new one.`);
    }
  } else {
    // Ensure directory exists
    if (!fs.existsSync(GEMINI_CONFIG_DIR)) {
      fs.mkdirSync(GEMINI_CONFIG_DIR, { recursive: true });
    }
  }

  // Ensure mcpServers object exists
  if (!config.mcpServers) {
    config.mcpServers = {};
  }

  // Add/Update our server
  config.mcpServers[EXTENSION_NAME] = getMcpConfig();

  // Write back
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  log(`Updated configuration at: ${configPath}`);
}

function main() {
  log(`Installing Gemini GoodVibes Extension from: ${CWD}`);

  // 1. Build
  runBuild();

  // 2. Determine where to install
  // We prioritize mcp.json if it exists or if we're creating fresh, 
  // but if config.json exists and has mcpServers, we might want to respect that.
  // For now, we'll try to update mcp.json as the standard for MCP servers.
  
  updateConfigFile(MCP_CONFIG_PATH);

  log('Installation Complete! ✅');
  log('You can now use GoodVibes tools in your Gemini CLI.');
  log(`Extension Root: ${CWD}`);
}

main();
