import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying with account:", deployer.address);

  const factory = await ethers.getContractFactory("TranscriptRegistry");
  const contract = await factory.deploy(deployer.address);
  await contract.waitForDeployment();

  console.log("TranscriptRegistry deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
