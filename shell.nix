# Copied from https://github.com/centrifuge/tinlake-maker-lib/blob/master/shell.nix

let
  pkgs = import (builtins.fetchGit rec {
    name = "dapptools-${rev}";
    url = https://github.com/dapphub/dapptools;
    rev = "d7a23096d8ae8391e740f6bdc4e8b9b703ca4764";
  }) {};

in
  pkgs.mkShell {
    src = null;
    name = "olympus-contracts";
    buildInputs = with pkgs; [
      pkgs.dapp
      pkgs.solc-static-versions.solc_0_7_5
    ];
  }