# Nix Development Environment

This project includes a Nix flake for setting up a consistent development environment.

## Prerequisites

1. Install Nix package manager:
   ```bash
   sh <(curl -L https://nixos.org/nix/install) --daemon
   ```

2. Enable flakes:
   Add the following to your `~/.config/nix/nix.conf` or `/etc/nix/nix.conf`:
   ```
   experimental-features = nix-command flakes
   ```

3. (Optional) Install direnv for automatic environment activation:
   ```bash
   # With homebrew
   brew install direnv
   
   # Add to your shell (.zshrc, .bashrc, etc.):
   eval "$(direnv hook zsh)"  # or bash, fish, etc.
   ```

## Usage

### With Nix commands

1. Enter the development environment:
   ```bash
   nix develop
   ```

2. Inside the environment, you can run:
   ```bash
   pnpm install
   pnpm dev
   ```

### With direnv (if installed)

1. Allow direnv in the project directory:
   ```bash
   direnv allow
   ```

2. The environment will automatically activate when you enter the directory.

3. Run your development commands:
   ```bash
   pnpm install
   pnpm dev
   ```

## What's Included

- Node.js 20
- PNPM package manager
- Watchman for file watching

This ensures that all developers use the same versions of these tools, regardless of what's installed on their host system. 