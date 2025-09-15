# Port Management Tools - Complete Guide

This suite of tools provides automated port management and cleanup functionality for the Manylla project, eliminating manual intervention with `lsof` and `kill` commands.

## 🚀 Quick Start

```bash
# Check if development ports are free
npm run ports:check

# Clean all development ports
npm run ports:clean

# Free a specific port
npm run ports:free 3000

# Interactive cleanup mode
npm run ports:interactive

# Kill all development servers
npm run ports:kill-dev
```

## 📁 Tool Overview

### Core Scripts

| Script | Purpose | Location |
|--------|---------|----------|
| `port-manager.sh` | Main port management tool | `/Users/adamstack/manylla/scripts/port-manager.sh` |
| `check-ports.sh` | Quick port status checker | `/Users/adamstack/manylla/scripts/check-ports.sh` |
| `free-port.sh` | Single port cleanup utility | `/Users/adamstack/manylla/scripts/free-port.sh` |
| `kill-dev-servers.sh` | Development server cleanup | `/Users/adamstack/manylla/scripts/kill-dev-servers.sh` |

### NPM Scripts

| Command | Action | Direct Equivalent |
|---------|--------|-------------------|
| `npm run ports:check` | Check port status | `./scripts/check-ports.sh` |
| `npm run ports:clean` | Clean all ports | `./scripts/port-manager.sh clean` |
| `npm run ports:free` | Free specific port | `./scripts/free-port.sh PORT` |
| `npm run ports:interactive` | Interactive mode | `./scripts/port-manager.sh interactive` |
| `npm run ports:kill-dev` | Kill dev servers | `./scripts/kill-dev-servers.sh` |
| `npm run ports:scan` | Scan port range | `./scripts/port-manager.sh scan START END` |

## 🔧 Detailed Tool Documentation

### 1. Port Manager (`port-manager.sh`)

The main tool with comprehensive port management capabilities.

**Basic Usage:**
```bash
./scripts/port-manager.sh [OPTIONS] [COMMAND]
```

**Commands:**
- `check` - Check default development ports
- `check PORT` - Check specific port
- `check START:END` - Check port range
- `clean` - Clean all default ports
- `clean PORT` - Clean specific port
- `force-clean` - Force clean all ports (SIGKILL)
- `interactive` - Interactive cleanup mode
- `kill-dev-servers` - Kill development server processes
- `scan START END` - Scan port range
- `performance-test` - Run benchmarks

**Options:**
- `--force` - Use SIGKILL instead of SIGTERM
- `--verbose` - Enable verbose logging
- `--debug` - Enable debug output
- `--quiet` - Minimal output

**Examples:**
```bash
# Check all development ports
./scripts/port-manager.sh check

# Check specific port
./scripts/port-manager.sh check 3000

# Check port range
./scripts/port-manager.sh check 3000:3010

# Clean all ports gracefully
./scripts/port-manager.sh clean

# Force clean all ports
./scripts/port-manager.sh force-clean

# Interactive mode
./scripts/port-manager.sh interactive

# Scan for usage in range
./scripts/port-manager.sh scan 8000 8100
```

### 2. Check Ports (`check-ports.sh`)

Quick port status checker for development workflow.

**Usage:**
```bash
./scripts/check-ports.sh [PORT|RANGE]
```

**Examples:**
```bash
# Check default development ports
./scripts/check-ports.sh

# Check specific port
./scripts/check-ports.sh 3000

# Check port range
./scripts/check-ports.sh 3000:3010
```

**Exit Codes:**
- `0` - All checked ports are free
- `1` - One or more ports are in use

### 3. Free Port (`free-port.sh`)

Single port cleanup utility for targeted cleanup.

**Usage:**
```bash
./scripts/free-port.sh PORT [--force]
```

**Examples:**
```bash
# Gracefully free port 3000
./scripts/free-port.sh 3000

# Force free port 3000
./scripts/free-port.sh 3000 --force

# Free port 8080
./scripts/free-port.sh 8080
```

**Safety Features:**
- Validates port numbers (1-65535)
- Protects system processes
- Uses graceful termination by default

### 4. Kill Dev Servers (`kill-dev-servers.sh`)

Comprehensive development environment cleanup.

**Usage:**
```bash
./scripts/kill-dev-servers.sh [OPTIONS]
```

**Options:**
- `--no-ports` - Don't clean ports, only kill processes
- `--force` - Use SIGKILL instead of SIGTERM
- `--interactive` - Interactive guided cleanup

**Examples:**
```bash
# Standard cleanup (processes + ports)
./scripts/kill-dev-servers.sh

# Kill processes only
./scripts/kill-dev-servers.sh --no-ports

# Force kill everything
./scripts/kill-dev-servers.sh --force

# Interactive mode
./scripts/kill-dev-servers.sh --interactive
```

**Targets These Processes:**
- webpack-dev-server, webpack serve
- react-scripts start
- next dev
- vite
- npm run dev/start/web
- node dev processes
- nodemon

## 🎯 Default Ports Monitored

The tools monitor these common development ports by default:
- **3000, 3001** - React/Webpack dev servers
- **8080, 8081** - Common HTTP servers
- **5000, 5001** - Node.js applications
- **4000, 4001** - Alternative dev servers
- **9000, 9001** - Build tools

## 🛡️ Safety Features

### Protected Processes
These critical system processes are **NEVER** terminated:
- systemd, kernel_task, launchd
- WindowServer, Finder, Safari, Chrome, firefox
- loginwindow, sshd, ssh

### Graceful Termination
1. **SIGTERM** sent first (graceful shutdown)
2. **5-second wait** for process to exit
3. **SIGKILL** sent if process doesn't respond (force mode)

### Process Validation
- Validates process IDs before termination
- Checks process ownership (only user processes)
- Prevents accidental system process kills

## 📊 Common Workflows

### 1. Before Starting Development
```bash
# Check if ports are free
npm run ports:check

# If ports are in use, clean them
npm run ports:clean
```

### 2. Port Conflict Resolution
```bash
# Quick fix for port 3000 conflict
npm run ports:free 3000

# Or clean all development ports
npm run ports:clean
```

### 3. Complete Environment Reset
```bash
# Kill all dev servers and clean ports
npm run ports:kill-dev
```

### 4. Debugging Port Issues
```bash
# Interactive mode for guided cleanup
npm run ports:interactive

# Scan specific port range
./scripts/port-manager.sh scan 3000 3010

# Check detailed process info
./scripts/port-manager.sh check 3000
```

### 5. Force Cleanup (Last Resort)
```bash
# Force kill stubborn processes
./scripts/kill-dev-servers.sh --force

# Or force clean specific port
./scripts/free-port.sh 3000 --force
```

## 🔍 Troubleshooting

### Common Issues

**Issue: "Permission denied" errors**
```bash
# Check script permissions
ls -la scripts/port-manager.sh

# Fix permissions if needed
chmod +x scripts/port-manager.sh
```

**Issue: "Command not found" errors**
```bash
# Ensure you're in project root
pwd
# Should output: /Users/adamstack/manylla

# Or use absolute paths
/Users/adamstack/manylla/scripts/port-manager.sh check
```

**Issue: Process won't terminate**
```bash
# Try force mode
./scripts/free-port.sh 3000 --force

# Or check if it's a protected process
./scripts/port-manager.sh check 3000
```

**Issue: Port still shows as "in use" after cleanup**
```bash
# Wait a moment and recheck
sleep 2 && npm run ports:check

# Check for new processes using the port
lsof -i :3000
```

### Debug Mode

Enable detailed logging for troubleshooting:
```bash
./scripts/port-manager.sh --debug check
```

### Log File

All operations are logged to:
```
/Users/adamstack/manylla/port-manager.log
```

View recent activity:
```bash
tail -f port-manager.log
```

## ⚡ Performance Metrics

Based on testing with real processes:

- **Port Detection**: ~0.1s per port
- **Process Termination**: ~1-2s per process
- **Batch Cleanup**: ~3-5s for all development ports
- **Memory Usage**: Minimal (<1MB)

Performance test:
```bash
./scripts/port-manager.sh performance-test
```

## 🔄 Integration with Existing Workflow

### Pre-Development Checks
Add to your development startup routine:
```bash
# Check ports before starting
npm run ports:check && npm run web
```

### Deployment Integration
The port tools integrate with existing deployment scripts:
```bash
# In deploy scripts, ensure clean environment
npm run ports:kill-dev
npm run build:web
```

### CI/CD Integration
Use in continuous integration:
```bash
# Cleanup before tests
npm run ports:clean
npm run test:ci
```

## 📋 Exit Codes

All tools use consistent exit codes:
- **0** - Success, all operations completed
- **1** - Warning, ports in use or cleanup needed
- **2** - Error, invalid arguments or permissions

## 🔗 Related Documentation

- [Deployment Rules](/Users/adamstack/manylla/DEPLOYMENT_RULES.md)
- [Git Commit Conventions](/Users/adamstack/manylla/processes/GIT_COMMIT_CONVENTIONS.md)
- [Scripts Overview](/Users/adamstack/manylla/scripts/README.md)

## 💡 Tips and Best Practices

1. **Use NPM scripts** for common operations (`npm run ports:check`)
2. **Check before cleanup** to see what will be affected
3. **Use force mode sparingly** - graceful termination is safer
4. **Monitor the log file** for debugging persistent issues
5. **Run interactive mode** when unsure about cleanup actions

---

*This documentation covers the complete port management suite for the Manylla project. For additional help, use the `--help` option with any tool.*