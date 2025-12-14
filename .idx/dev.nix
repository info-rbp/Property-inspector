{ pkgs, ... }:
{
  # Tooling available in the IDX/Firebase Studio environment
  packages = with pkgs; [
    nodejs_20
    pnpm
    firebase-tools
  ];

  # Enable IDX preview for the web workspace; Vite binds 0.0.0.0:3000 by config
  idx.previews = {
    enable = true;
    previews = {
      web = {
        command = [ "bash" "-lc" "npm install && npm run dev:web -- --host 0.0.0.0 --port 3000" ];
      };
    };
  };
}
