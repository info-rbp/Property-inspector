{
  # Development shell configuration for IDX/Firebase Studio
  pkgs, ...
}: {
  packages = with pkgs; [
    nodejs_20
    pnpm
    firebase-tools
  ];

  idx = {
    previews = {
      enable = true;
      previews.web.command = "npm install && npm run dev:web -- --host 0.0.0.0 --port 3000";
    };
  };

  # Ensure globally installed npm binaries are discoverable
  shellHook = ''
    export NPM_CONFIG_PREFIX=$HOME/.npm-global
    export PATH=$HOME/.npm-global/bin:$PATH
  '';
}
