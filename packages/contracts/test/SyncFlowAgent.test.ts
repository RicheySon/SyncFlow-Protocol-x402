import { expect } from "chai";
import { ethers } from "hardhat";
import { SyncFlowAgent } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("SyncFlowAgent", function () {
    let syncFlowAgent: SyncFlowAgent;
    let owner: SignerWithAddress;
    let addr1: SignerWithAddress;
    let addr2: SignerWithAddress;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        const SyncFlowAgentFactory = await ethers.getContractFactory("SyncFlowAgent");
        syncFlowAgent = await SyncFlowAgentFactory.deploy("Test Agent", "trade");
        await syncFlowAgent.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the correct agent name", async function () {
            expect(await syncFlowAgent.agentName()).to.equal("Test Agent");
        });

        it("Should set the correct agent type", async function () {
            expect(await syncFlowAgent.agentType()).to.equal("trade");
        });

        it("Should set the deployer as owner", async function () {
            expect(await syncFlowAgent.owner()).to.equal(owner.address);
        });
    });

    describe("Execute", function () {
        it("Should emit AgentAction event when execute is called", async function () {
            await expect(syncFlowAgent.execute("swap", '{"amount": "1.0"}'))
                .to.emit(syncFlowAgent, "AgentAction")
                .withArgs("swap", '{"amount": "1.0"}', await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));
        });

        it("Should revert if non-owner tries to execute", async function () {
            await expect(
                syncFlowAgent.connect(addr1).execute("swap", "{}")
            ).to.be.revertedWithCustomError(syncFlowAgent, "OwnableUnauthorizedAccount");
        });
    });

    describe("Deposit and Receive", function () {
        it("Should accept deposits via deposit function", async function () {
            const depositAmount = ethers.parseEther("1.0");
            await owner.sendTransaction({
                to: await syncFlowAgent.getAddress(),
                value: depositAmount,
            });

            expect(await ethers.provider.getBalance(await syncFlowAgent.getAddress())).to.equal(depositAmount);
        });

        it("Should accept plain transfers via receive function", async function () {
            const transferAmount = ethers.parseEther("2.5");
            await owner.sendTransaction({
                to: await syncFlowAgent.getAddress(),
                value: transferAmount,
            });

            expect(await ethers.provider.getBalance(await syncFlowAgent.getAddress())).to.equal(transferAmount);
        });
    });

    describe("Batch Transfer", function () {
        beforeEach(async function () {
            const fundAmount = ethers.parseEther("10.0");
            await owner.sendTransaction({
                to: await syncFlowAgent.getAddress(),
                value: fundAmount,
            });
        });

        it("Should transfer to multiple recipients", async function () {
            const recipients = [addr1.address, addr2.address];
            const amounts = [ethers.parseEther("1.0"), ethers.parseEther("2.0")];

            const addr1BalanceBefore = await ethers.provider.getBalance(addr1.address);
            const addr2BalanceBefore = await ethers.provider.getBalance(addr2.address);

            await syncFlowAgent.batchTransfer(recipients, amounts);

            const addr1BalanceAfter = await ethers.provider.getBalance(addr1.address);
            const addr2BalanceAfter = await ethers.provider.getBalance(addr2.address);

            expect(addr1BalanceAfter - addr1BalanceBefore).to.equal(ethers.parseEther("1.0"));
            expect(addr2BalanceAfter - addr2BalanceBefore).to.equal(ethers.parseEther("2.0"));
        });

        it("Should emit BatchTransfer events", async function () {
            const recipients = [addr1.address];
            const amounts = [ethers.parseEther("1.0")];

            await expect(syncFlowAgent.batchTransfer(recipients, amounts))
                .to.emit(syncFlowAgent, "BatchTransfer")
                .withArgs(addr1.address, ethers.parseEther("1.0"), await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));
        });

        it("Should revert if arrays length mismatch", async function () {
            const recipients = [addr1.address, addr2.address];
            const amounts = [ethers.parseEther("1.0")];

            await expect(
                syncFlowAgent.batchTransfer(recipients, amounts)
            ).to.be.revertedWith("Arrays length mismatch");
        });

        it("Should revert if no recipients provided", async function () {
            await expect(
                syncFlowAgent.batchTransfer([], [])
            ).to.be.revertedWith("No recipients provided");
        });

        it("Should revert if insufficient contract balance", async function () {
            const recipients = [addr1.address];
            const amounts = [ethers.parseEther("20.0")]; // More than funded

            await expect(
                syncFlowAgent.batchTransfer(recipients, amounts)
            ).to.be.revertedWith("Insufficient contract balance");
        });

        it("Should revert if recipient is zero address", async function () {
            const recipients = [ethers.ZeroAddress];
            const amounts = [ethers.parseEther("1.0")];

            await expect(
                syncFlowAgent.batchTransfer(recipients, amounts)
            ).to.be.revertedWith("Invalid recipient address");
        });

        it("Should revert if amount is zero", async function () {
            const recipients = [addr1.address];
            const amounts = [0];

            await expect(
                syncFlowAgent.batchTransfer(recipients, amounts)
            ).to.be.revertedWith("Amount must be greater than 0");
        });

        it("Should revert if non-owner tries to batch transfer", async function () {
            const recipients = [addr1.address];
            const amounts = [ethers.parseEther("1.0")];

            await expect(
                syncFlowAgent.connect(addr1).batchTransfer(recipients, amounts)
            ).to.be.revertedWithCustomError(syncFlowAgent, "OwnableUnauthorizedAccount");
        });

        it("Should handle batch transfers to same recipient", async function () {
            const recipients = [addr1.address, addr1.address];
            const amounts = [ethers.parseEther("1.0"), ethers.parseEther("1.5")];

            const addr1BalanceBefore = await ethers.provider.getBalance(addr1.address);

            await syncFlowAgent.batchTransfer(recipients, amounts);

            const addr1BalanceAfter = await ethers.provider.getBalance(addr1.address);

            expect(addr1BalanceAfter - addr1BalanceBefore).to.equal(ethers.parseEther("2.5"));
        });
    });

    describe("Withdraw", function () {
        beforeEach(async function () {
            const fundAmount = ethers.parseEther("5.0");
            await owner.sendTransaction({
                to: await syncFlowAgent.getAddress(),
                value: fundAmount,
            });
        });

        it("Should allow owner to withdraw funds", async function () {
            const withdrawAmount = ethers.parseEther("2.0");
            const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);

            const tx = await syncFlowAgent.withdraw(withdrawAmount);
            const receipt = await tx.wait();
            const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

            const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);

            expect(ownerBalanceAfter).to.equal(ownerBalanceBefore + withdrawAmount - gasUsed);
        });

        it("Should revert if withdrawal amount exceeds balance", async function () {
            const withdrawAmount = ethers.parseEther("10.0");

            await expect(
                syncFlowAgent.withdraw(withdrawAmount)
            ).to.be.revertedWith("Insufficient balance");
        });

        it("Should revert if non-owner tries to withdraw", async function () {
            const withdrawAmount = ethers.parseEther("1.0");

            await expect(
                syncFlowAgent.connect(addr1).withdraw(withdrawAmount)
            ).to.be.revertedWithCustomError(syncFlowAgent, "OwnableUnauthorizedAccount");
        });

        it("Should allow owner to withdraw full balance", async function () {
            const contractBalance = await ethers.provider.getBalance(await syncFlowAgent.getAddress());

            await syncFlowAgent.withdraw(contractBalance);

            expect(await ethers.provider.getBalance(await syncFlowAgent.getAddress())).to.equal(0);
        });
    });
});
