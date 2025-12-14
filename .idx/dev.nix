{ pkgs, ... }:
{
  packages = with pkgs; [
    nodejs_20
    pnpm
    firebase-tools
  ];

  idx.previews = {
    enable = true;
    previews = {
      web = {
        command = [ "bash" "-lc" "npm install && npm run dev:web -- --host 0.0.0.0" ];
      };
    };
  };

  # Ensure globally installed npm binaries are discoverable
  shellHook = ''
    export NPM_CONFIG_PREFIX=$HOME/.npm-global
    export PATH=$HOME/.npm-global/bin:$PATH
  '';
}
