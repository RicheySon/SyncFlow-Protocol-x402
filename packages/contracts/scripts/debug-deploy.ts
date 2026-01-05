import { ethers, config } from "hardhat";

async function main() {
    console.log("Checking Hardhat Configuration...");

    const hasKey = !!process.env.PRIVATE_KEY;
    console.log(`Environment Variable PRIVATE_KEY present: ${hasKey}`);

    const apiKey = process.env.CRONOS_EXPLORER_API_KEY;
    console.log(`CRONOS_EXPLORER_API_KEY present: ${!!apiKey}`);
    if (apiKey) {
        console.log(`CRONOS_EXPLORER_API_KEY value: ${apiKey}`);
    } else {
        console.log("❌ CRONOS_EXPLORER_API_KEY is missing/empty");
    }

    // Check etherscan config
    const etherscanConfig = (config as any).etherscan;
    console.log("Etherscan Config:", JSON.stringify(etherscanConfig.apiKey, null, 2));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
