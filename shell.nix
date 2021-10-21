# WIP, copied from https://github.com/centrifuge/tinlake-maker-lib/blob/master/shell.nix

let
  pkgs = import (builtins.fetchGit rec {
    name = "dapptools-${rev}";
    url = https://github.com/dapphub/dapptools;
    rev = "dc992eb2e9d05bee150156add790bddb160fc80c";
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