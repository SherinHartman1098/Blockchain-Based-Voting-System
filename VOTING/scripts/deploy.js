const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function main() {
  const Voting = await hre.ethers.getContractFactory("Voting");

  // Candidate details
  const names = ["Mark", "Mike"];
  const photos = ['QmHash1', "QmHash2"];
  const ages = [35, 40];
  const countries = ["USA", "Canada"];
  const genders = ["Male", "Male"];
  const votingDurationInMinutes = 480;
  const adminAddress = process.env.ADMIN_ADDRESS
  // Deploy the contract
  const votingContract = await Voting.deploy(
    names,
    photos,
    ages,
    countries,
    genders,
    votingDurationInMinutes,
    adminAddress
  );

  await votingContract.deployed();

  console.log("Voting contract deployed to:", votingContract.address);

   // Update the .env file with the new contract address
   const envPath = path.resolve(__dirname, "../.env"); 
   const envContent = fs.readFileSync(envPath, "utf8");
 
   // Update or add the CONTRACT_ADDRESS key
   const updatedEnvContent = envContent.includes("CONTRACT_ADDRESS=")
     ? envContent.replace(/CONTRACT_ADDRESS=.*/, `CONTRACT_ADDRESS="${votingContract.address}"`)
     : `${envContent}\nCONTRACT_ADDRESS="${votingContract.address}"`;
 
   fs.writeFileSync(envPath, updatedEnvContent);
   console.log("Updated .env with the new contract address.");

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });