const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting deployment...");
  
  // Get the ContractFactory and Signers here
  const [deployer] = await hre.ethers.getSigners();
  
  console.log(`📝 Deploying contracts with account: ${deployer.address}`);
  console.log(`💰 Account balance: ${hre.ethers.utils.formatEther(await deployer.getBalance())} ETH`);

  // Deploy VotingSystem contract
  console.log("\n📦 Deploying VotingSystem contract...");
  const VotingSystem = await hre.ethers.getContractFactory("VotingSystem");
  const votingSystem = await VotingSystem.deploy();

  await votingSystem.deployed();

  console.log(`✅ VotingSystem deployed to: ${votingSystem.address}`);
  
  // Create a sample election for testing
  console.log("\n🗳️  Creating sample election...");
  
  const currentTime = Math.floor(Date.now() / 1000);
  const startTime = currentTime + 60; // Start in 1 minute
  const endTime = currentTime + 3600; // End in 1 hour
  
  const createElectionTx = await votingSystem.createElection(
    "Sample Presidential Election 2025",
    "A demonstration election for testing the voting system",
    startTime,
    endTime
  );
  
  await createElectionTx.wait();
  console.log("✅ Sample election created!");
  
  // Add sample candidates
  console.log("\n👥 Adding sample candidates...");
  
  const candidates = [
    { name: "Alice Johnson", description: "Experienced leader with focus on education and healthcare" },
    { name: "Bob Smith", description: "Business executive advocating for economic growth" },
    { name: "Carol Davis", description: "Environmental advocate promoting sustainable policies" }
  ];
  
  for (const candidate of candidates) {
    const addCandidateTx = await votingSystem.addCandidate(1, candidate.name, candidate.description);
    await addCandidateTx.wait();
    console.log(`✅ Added candidate: ${candidate.name}`);
  }
  
  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: votingSystem.address,
    deployerAddress: deployer.address,
    blockNumber: await hre.ethers.provider.getBlockNumber(),
    timestamp: new Date().toISOString(),
    sampleElectionId: 1,
    candidates: candidates
  };
  
  console.log("\n📋 Deployment Summary:");
  console.log("=".repeat(50));
  console.log(`Network: ${deploymentInfo.network}`);
  console.log(`Contract Address: ${deploymentInfo.contractAddress}`);
  console.log(`Deployer: ${deploymentInfo.deployerAddress}`);
  console.log(`Block Number: ${deploymentInfo.blockNumber}`);
  console.log(`Timestamp: ${deploymentInfo.timestamp}`);
  console.log("=".repeat(50));
  
  console.log("\n🔧 Frontend Configuration:");
  console.log("Add this to your frontend .env file:");
  console.log(`REACT_APP_CONTRACT_ADDRESS=${votingSystem.address}`);
  console.log(`REACT_APP_NETWORK_ID=${hre.network.config.chainId}`);
  
  console.log("\n🎉 Deployment completed successfully!");
  
  // Verify contract on Etherscan (only for testnets/mainnet)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n🔍 Waiting for block confirmations...");
    await votingSystem.deployTransaction.wait(5);
    
    console.log("📄 Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: votingSystem.address,
        constructorArguments: [],
      });
      console.log("✅ Contract verified on Etherscan!");
    } catch (error) {
      console.log("❌ Error verifying contract:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });