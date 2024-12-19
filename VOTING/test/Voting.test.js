const { expect } = require("chai");
const { ethers } = require("hardhat");

let Voting, voting, admin, voter1, voter2;

beforeEach(async () => {
    [admin, voter1, voter2] = await ethers.getSigners();

    const Voting = await ethers.getContractFactory("Voting");
    voting = await Voting.deploy(
        ["Alice", "Bob"], 
        ["ipfs://photo1", "ipfs://photo2"], 
        [30, 25], 
        ["USA", "Canada"], 
        ["Female", "Male"], 
        10, 
        admin.address
    );
    await voting.deployed();
});


//**** Test cases ****//

//Verifying if the contract is deployed correctly with initial parameters.
it("should deploy the contract and initialize candidates", async () => {
    const candidates = await voting.getAllCandidates();
    expect(candidates.length).to.equal(2);
    expect(candidates[0].name).to.equal("Alice");
    expect(candidates[1].name).to.equal("Bob");
});

//Ensureing only the admin can start the voting
it("should allow admin to start voting", async () => {
    await voting.connect(admin).startVoting();
    expect(await voting.getVotingStatus()).to.be.true;
});

it("should not allow non-admin to start voting", async () => {
    await expect(voting.connect(voter1).startVoting()).to.be.revertedWith("Not authorized");
});

//Ensuring only eligible voters can cast a vote.
it("should allow a voter to cast a vote", async () => {
    await voting.connect(admin).startVoting();
    await voting.connect(voter1).vote(0);
    const candidates = await voting.getAllCandidates();
    expect(candidates[0].voteCount).to.equal(1);
});

it("should not allow a voter to vote twice", async () => {
    await voting.connect(admin).startVoting();
    await voting.connect(voter1).vote(0);
    await expect(voting.connect(voter1).vote(0)).to.be.revertedWith("You have already voted");
});

//Ensuring only the admin can end voting.
it("should allow admin to end voting", async () => {
    await voting.connect(admin).startVoting();
    await voting.connect(admin).endVoting();
    expect(await voting.getVotingStatus()).to.be.false;
});

it("should not allow non-admin to end voting", async () => {
    await voting.connect(admin).startVoting();
    await expect(voting.connect(voter1).endVoting()).to.be.revertedWith("Not authorized");
});

//Ensuring only admin can add candidates
it("should allow admin to add candidates", async () => {
    await voting.connect(admin).addCandidate("Charlie", "ipfs://photo3", 28, "India", "Male");
    const candidates = await voting.getAllCandidates();
    expect(candidates.length).to.equal(3);
    expect(candidates[2].name).to.equal("Charlie");
});

it("should not allow non-admin to add candidates", async () => {
    await expect(voting.connect(voter1).addCandidate("Charlie", "ipfs://photo3", 28, "India", "Male"))
        .to.be.revertedWith("Not authorized");
});

//functionality to declare the winner.
it("should declare the winner after voting ends", async () => {
    await voting.connect(admin).startVoting();
    await voting.connect(voter1).vote(0);
    await voting.connect(voter2).vote(1);
    await voting.connect(admin).endVoting();

    const winner = await voting.connect(admin).declareWinner();
    expect(winner).to.be.oneOf(["Alice", "Bob"]);
});

//Handling cases like invalid candidate ID or voting when not active
it("should revert if trying to vote with an invalid candidate ID", async () => {
    await voting.connect(admin).startVoting();
    await expect(voting.connect(voter1).vote(10)).to.be.revertedWith("Invalid candidate index");
});

it("should not allow voting when voting is not active", async () => {
    await expect(voting.connect(voter1).vote(0)).to.be.revertedWith("Voting is not active");
});