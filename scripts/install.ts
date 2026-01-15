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
const MCP_CONFIG_PATH = path.join(GEMINI_CONFIG_DIR, 'settings.json'); // Target settings.json

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

function getHooksConfig() {
  const distDir = path.join(CWD, 'hooks', 'scripts', 'dist');
  
  const createHook = (scriptName: string, timeout: number = 5) => ([
    {
      matcher: '*',
      hooks: [
        {
          type: 'command',
          command: `node "${path.join(distDir, scriptName)}"`,
          timeout
        }
      ]
    }
  ]);

  return {
    SessionStart: [
      {
        matcher: 'startup',
        hooks: [{ type: 'command', command: `node "${path.join(distDir, 'session-start.js')}"`, timeout: 10 }]
      },
      {
        matcher: 'resume',
        hooks: [{ type: 'command', command: `node "${path.join(distDir, 'session-start.js')}"`, timeout: 10 }]
      }
    ],
    PreToolUse: createHook('pre-tool-use.js'),
    PostToolUseFailure: createHook('post-tool-use-failure.js'),
    PostToolUse: createHook('post-tool-use.js'),
    PermissionRequest: createHook('permission-request.js'),
    UserPromptSubmit: createHook('user-prompt-submit.js'),
    Stop: createHook('stop.js', 10),
    SubagentStart: createHook('subagent-start.js', 10),
    SubagentStop: createHook('subagent-stop.js', 10),
    PreCompact: [
      { matcher: 'auto', hooks: [{ type: 'command', command: `node "${path.join(distDir, 'pre-compact.js')}"`, timeout: 5 }] },
      { matcher: 'manual', hooks: [{ type: 'command', command: `node "${path.join(distDir, 'pre-compact.js')}"`, timeout: 5 }] }
    ],
    SessionEnd: createHook('session-end.js', 10),
    Notification: createHook('notification.js')
  };
}

function updateConfigFile(configPath: string) {
  let config: any = { mcpServers: {}, hooks: {} };
  
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
  
  // Ensure hooks object exists
  if (!config.hooks) {
    config.hooks = {};
  }

  // Add/Update our server
  config.mcpServers[EXTENSION_NAME] = getMcpConfig();
  
  // Merge hooks
  const gvHooks = getHooksConfig();
  for (const [hookName, matchers] of Object.entries(gvHooks)) {
    if (!config.hooks[hookName]) {
      config.hooks[hookName] = matchers;
    } else {
      // For matchers, we prepended ours to ensure they run first
      const existing = config.hooks[hookName];
      const gvMatchers = matchers as any[];
      
      for (const gvMatcher of gvMatchers) {
        const alreadyExists = existing.some((m: any) => 
          m.matcher === gvMatcher.matcher && 
          m.hooks.some((h: any) => h.command === gvMatcher.hooks[0].command)
        );
        
        if (!alreadyExists) {
          config.hooks[hookName].unshift(gvMatcher);
        }
      }
    }
  }

  // Write back
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  log(`Updated configuration at: ${configPath}`);
}

function main() {
  log(`Installing Gemini GoodVibes Extension from: ${CWD}`);

  // 1. Build
  runBuild();

  // 2. Link using the CLI's native command
  log('Linking extension to Gemini CLI...');
  try {
    // Attempt to uninstall first to ensure we can link cleanly (idempotency)
    try {
      execSync('gemini extensions uninstall goodvibes', { stdio: 'ignore', cwd: CWD });
    } catch (e) {
      // Ignore errors from uninstall if it wasn't already installed
    }
    
    // We use '.' because the script is run from the root
    execSync('gemini extensions link .', { stdio: 'inherit', cwd: CWD });
  } catch (e) {
    error('Failed to link extension. Ensure the Gemini CLI is installed and in your PATH.');
  }

  log('Installation Complete! ✅');
  log('You can now use GoodVibes tools and agents in your Gemini CLI.');
  log(`Extension Root: ${CWD}`);
}

main();
