import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import chai, { expect } from "chai";
import { ethers } from "hardhat";
import { FakeContract, smock } from "@defi-wonderland/smock";
import {
    ITreasury,
    IgOHM,
    IsOHM,
    IOHM,
    StakingHelper,
    StakingHelper__factory,
    OlympusStaking,
    OlympusStaking__factory,    
    Distributor__factory,
    Distributor,
    OlympusAuthority,
    OlympusAuthority__factory,
} from "../../types";

chai.use(smock.matchers);

const ZERO_ADDRESS = ethers.utils.getAddress("0x0000000000000000000000000000000000000000");

describe("StakingHelper", () => {
    let owner: SignerWithAddress;    
    let governor: SignerWithAddress;
    let guardian: SignerWithAddress;
    let other: SignerWithAddress;
    let ohmFake: FakeContract<IOHM>;
    let sOHMFake: FakeContract<IsOHM>;
    let gOHMFake: FakeContract<IgOHM>;    
    let treasuryFake: FakeContract<ITreasury>;
    let distributor: Distributor;
    let authority: OlympusAuthority;
    let staking: OlympusStaking;
    let stakingHelper: StakingHelper;

    const EPOCH_LENGTH = 2200;
    const EPOCH_NUMBER = 1;
    const FUTURE_END_TIME = 1022010000; // an arbitrary future block timestamp


    beforeEach(async () => {
        [owner, governor, guardian, other] = await ethers.getSigners();
        treasuryFake = await smock.fake<ITreasury>("ITreasury");
        ohmFake = await smock.fake<IOHM>("IOHM");
        gOHMFake = await smock.fake<IgOHM>("IgOHM");
        // need to be specific because IsOHM is also defined in OLD
        sOHMFake = await smock.fake<IsOHM>("contracts/interfaces/IsOHM.sol:IsOHM");
        authority = await new OlympusAuthority__factory(owner).deploy(
            governor.address,
            guardian.address,
            owner.address,
            owner.address
        );

        staking = await new OlympusStaking__factory(owner).deploy(
            ohmFake.address,
            sOHMFake.address,
            gOHMFake.address,
            EPOCH_LENGTH,
            EPOCH_NUMBER,
            FUTURE_END_TIME,
            authority.address
        );        
        
        distributor = await new Distributor__factory(owner).deploy(
            treasuryFake.address,
            ohmFake.address,
            staking.address,
            authority.address
        );
        staking.connect(governor).setDistributor(distributor.address);

        stakingHelper = await new StakingHelper__factory(owner).deploy();
    });

   

    describe("post-construction", () => {
        beforeEach(async () => {
            
        });

        describe("stake", () => {      
            it("exchanges OHM for newly minted gOHM when claim is true and rebasing is true", async () => {
                const amount = 1000;
                const indexedAmount = 10000;
                const rebasing = false;
                const claim = true;

                ohmFake.transferFrom
                    // .whenCalledWith(other.address, staking.address, amount) //TODO this is significant b/c Staking::stake() uses msg.sender!!
                    .returns(true);
                gOHMFake.balanceTo.whenCalledWith(amount).returns(indexedAmount);

                // await staking.connect(other).stake(other.address, amount, rebasing, claim);
                await stakingHelper.stake(staking.address, distributor.address, other.address, amount, rebasing, claim);

                expect(gOHMFake.mint).to.be.calledWith(other.address, indexedAmount);
            });
            // it.only("mint from treasury and distribute to recipients", async () => {
            //     await distributor.connect(governor).addRecipient(staking.address, 2975);
            //     await distributor.connect(governor).addRecipient(other.address, 1521);

            //     ohmFake.totalSupply.returns(10000000);
            //     // await stakingHelper.stake(staking.address, distributor.address,
            //     // )
            //     await distributor.connect(other).distribute();

            //     expect(treasuryFake.mint).to.have.been.calledWith(staking.address, 29750);
            //     expect(treasuryFake.mint).to.have.been.calledWith(other.address, 15210);
            // });

           
        });

    });
});
