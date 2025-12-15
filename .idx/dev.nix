{ pkgs, ... }:
  {
  packages = with pkgs; [
    nodejs_20
    pnpm
    firebase-tools
    openssl_1_1
];

  idx.previews = {
    enable = true;
    previews = {
      web = {
        command = [ "bash" "-lc" "npm install && npm run dev:web -- --host 0.0.0.0" ];
      };
    };
  };

shellHook = ''
  # keep globals isolated, but don't override everything
  export NPM_CONFIG_PREFIX=$HOME/.npm-global
  if [ -d "$HOME/.npm-global/bin" ]; then
    export PATH="$HOME/.npm-global/bin:$PATH"
  fi
'';}

