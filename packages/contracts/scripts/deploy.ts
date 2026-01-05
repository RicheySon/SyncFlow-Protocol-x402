import { ethers } from "hardhat";

async function main() {
    console.log("Deploying SyncFlowAgent to Cronos Testnet...");

    const SyncFlowAgent = await ethers.getContractFactory("SyncFlowAgent");
    const agent = await SyncFlowAgent.deploy("TestAgent", "DAO_MGR");

    await agent.waitForDeployment();

    const address = await agent.getAddress();
    console.log(`SyncFlowAgent deployed to: ${address}`);

    // Verify contract instructions would go here
    console.log("To verify: npx hardhat verify --network cronosTestnet " + address + " \"TestAgent\" \"DAO_MGR\"");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
