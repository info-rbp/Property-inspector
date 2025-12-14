{
  # Development shell configuration for IDX/Firebase Studio
  pkgs ? import <nixpkgs> {}
}:
pkgs.mkShell {
  packages = with pkgs; [
    nodejs_20
    pnpm
    firebase-tools
  ];

  # Ensure globally installed npm binaries are discoverable
  shellHook = ''
    export NPM_CONFIG_PREFIX=$HOME/.npm-global
    export PATH=$HOME/.npm-global/bin:$PATH
  '';
}
