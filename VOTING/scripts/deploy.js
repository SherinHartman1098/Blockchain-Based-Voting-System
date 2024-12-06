const hre = require("hardhat");

async function main() {
  const Voting = await hre.ethers.getContractFactory("Voting");

  // Candidate details
  const names = ["Mark", "Mike"];
  const photos = ['QmHash1', "QmHash2"];
  const ages = [35, 40];
  const countries = ["USA", "Canada"];
  const genders = ["Male", "Male"];
  const votingDurationInMinutes = 480;

  // Deploy the contract
  const votingContract = await Voting.deploy(
    names,
    photos,
    ages,
    countries,
    genders,
    votingDurationInMinutes
  );

  await votingContract.deployed();

  console.log("Voting contract deployed to:", votingContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });