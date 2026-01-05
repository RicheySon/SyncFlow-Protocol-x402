import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    const balance = await ethers.provider.getBalance(deployer.address);

    console.log("\nDeployment Wallet Info:");
    console.log("-----------------------");
    console.log(`Address: ${deployer.address}`);
    console.log(`Balance: ${ethers.formatEther(balance)} TCRO`);
    console.log("-----------------------\n");

    if (balance === 0n) {
        console.log("⚠️  Wallet has 0 TCRO. Please fund this address via the Cronos Testnet Faucet: https://cronos.org/faucet/testnet");
    } else {
        console.log("✅ Wallet funded. Ready to deploy.");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
