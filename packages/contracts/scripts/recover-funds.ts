import { ethers } from "hardhat";

async function main() {
    const OLD_CONTRACT = "0x43EdC3Bf4c0766E2EdFD557C99cE8A89bDAA827A";
    const NEW_CONTRACT = "0x21E205e2C45417E81d39F28183cA0BA1493ACeee";

    const [signer] = await ethers.getSigners();
    console.log(`Recovering funds using account: ${signer.address}`);

    // 1. Check Old Contract Balance
    const oldBalance = await ethers.provider.getBalance(OLD_CONTRACT);
    console.log(`Old Contract Balance: ${ethers.formatEther(oldBalance)} TCRO`);

    if (oldBalance === 0n) {
        console.log("No funds to recover.");
        return;
    }

    // 2. Withdraw from Old Contract (to signer)
    console.log("Withdrawing funds from old contract...");
    const oldContractABI = [
        "function withdraw(uint256 amount) external",
        "function owner() view returns (address)"
    ];
    const oldContract = new ethers.Contract(OLD_CONTRACT, oldContractABI, signer);

    // Verify ownership (just in case)
    /*
    const owner = await oldContract.owner();
    if (owner.toLowerCase() !== signer.address.toLowerCase()) {
        console.log(`Critical: Signer is not owner. Owner is ${owner}`);
        return;
    }
    */

    const txWithdraw = await oldContract.withdraw(oldBalance);
    console.log(`Withdraw tx sent: ${txWithdraw.hash}`);
    await txWithdraw.wait();
    console.log("Withdraw confirmed!");

    // 3. Send to New Contract
    console.log(`Transferring ${ethers.formatEther(oldBalance)} TCRO to new contract...`);
    const txSend = await signer.sendTransaction({
        to: NEW_CONTRACT,
        value: oldBalance
    });
    console.log(`Transfer tx sent: ${txSend.hash}`);
    await txSend.wait();

    console.log("✅ Funds successfully moved to new contract!");

    // Final check
    const newBalance = await ethers.provider.getBalance(NEW_CONTRACT);
    console.log(`New Contract Balance: ${ethers.formatEther(newBalance)} TCRO`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
