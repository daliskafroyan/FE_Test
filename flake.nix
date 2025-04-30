{
  description = "React App Development Environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_20
            nodePackages.pnpm
            
            # Optional extras
            watchman # For file watching
          ];

          shellHook = ''
            echo "Node.js $(${pkgs.nodejs_20}/bin/node --version)"
            echo "PNPM $(${pkgs.nodePackages.pnpm}/bin/pnpm --version)"
            echo ""
            echo "React App Development Environment"
            echo "Run 'pnpm install' to install dependencies"
            echo "Run 'pnpm dev' to start the development server"
          '';
        };
      }
    );
} 