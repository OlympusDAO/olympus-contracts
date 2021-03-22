// import { Signer } from "@ethersproject/abstract-signer";
// import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
// import { Wallet } from "@ethersproject/wallet";
// import { ethers, waffle } from "hardhat";

// import { Contracts, Signers } from "../types/index";

// const { createFixtureLoader } = waffle;

// export function baseContext(description: string, hooks: () => void): void {
//   describe(description, function () {
//     before(async function () {
//       this.contracts = {} as Contracts;
//       this.signers = {} as Signers;

//       const signers: SignerWithAddress[] = await ethers.getSigners();
//       this.signers.admin = signers[0];
//       this.signers.borrower = signers[1];
//       this.signers.liquidator = signers[2];
//       this.signers.raider = signers[3];

//       // Get rid of this when https://github.com/nomiclabs/hardhat/issues/849 gets fixed.
//       this.loadFixture = createFixtureLoader((signers as Signer[]) as Wallet[]);
//     });

//     hooks();
//   });
// }