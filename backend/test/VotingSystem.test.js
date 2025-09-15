const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VotingSystem", function () {
  let VotingSystem;
  let votingSystem;
  let owner;
  let addr1;
  let addr2;
  let addr3;

  beforeEach(async function () {
    // Get the ContractFactory and Signers
    VotingSystem = await ethers.getContractFactory("VotingSystem");
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    // Deploy the contract
    votingSystem = await VotingSystem.deploy();
    await votingSystem.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await votingSystem.owner()).to.equal(owner.address);
    });

    it("Should authorize the deployer as election creator", async function () {
      expect(await votingSystem.authorizedCreators(owner.address)).to.equal(true);
    });
  });

  describe("Election Management", function () {
    it("Should create an election", async function () {
      const currentTime = Math.floor(Date.now() / 1000);
      const startTime = currentTime + 3600; // 1 hour from now
      const endTime = startTime + 7200; // 2 hours after start

      await expect(
        votingSystem.createElection(
          "Test Election",
          "A test election",
          startTime,
          endTime
        )
      ).to.emit(votingSystem, "ElectionCreated")
       .withArgs(1, "Test Election", owner.address, startTime, endTime);

      const election = await votingSystem.getElection(1);
      expect(election.title).to.equal("Test Election");
      expect(election.description).to.equal("A test election");
      expect(election.active).to.equal(true);
    });

    it("Should not allow creating election with past start time", async function () {
      const pastTime = Math.floor(Date.now() / 1000) - 3600;
      const endTime = pastTime + 7200;

      await expect(
        votingSystem.createElection(
          "Past Election",
          "An election in the past",
          pastTime,
          endTime
        )
      ).to.be.revertedWith("Start time must be in the future");
    });

    it("Should not allow unauthorized users to create elections", async function () {
      const currentTime = Math.floor(Date.now() / 1000);
      const startTime = currentTime + 3600;
      const endTime = startTime + 7200;

      await expect(
        votingSystem.connect(addr1).createElection(
          "Unauthorized Election",
          "Should fail",
          startTime,
          endTime
        )
      ).to.be.revertedWith("Not authorized to create elections");
    });

    it("Should authorize and revoke election creators", async function () {
      await votingSystem.authorizeCreator(addr1.address);
      expect(await votingSystem.authorizedCreators(addr1.address)).to.equal(true);

      await votingSystem.revokeCreator(addr1.address);
      expect(await votingSystem.authorizedCreators(addr1.address)).to.equal(false);
    });
  });

  describe("Candidate Management", function () {
    let electionId;

    beforeEach(async function () {
      const currentTime = Math.floor(Date.now() / 1000);
      const startTime = currentTime + 3600;
      const endTime = startTime + 7200;

      const tx = await votingSystem.createElection(
        "Test Election",
        "A test election",
        startTime,
        endTime
      );
      const receipt = await tx.wait();
      electionId = 1; // First election
    });

    it("Should add candidates to election", async function () {
      await expect(
        votingSystem.addCandidate(electionId, "Alice", "First candidate")
      ).to.emit(votingSystem, "CandidateAdded")
       .withArgs(electionId, 0, "Alice");

      const candidates = await votingSystem.getElectionCandidates(electionId);
      expect(candidates.length).to.equal(1);
      expect(candidates[0].name).to.equal("Alice");
    });

    it("Should not allow empty candidate names", async function () {
      await expect(
        votingSystem.addCandidate(electionId, "", "Empty name candidate")
      ).to.be.revertedWith("Candidate name cannot be empty");
    });
  });

  describe("Voting Process", function () {
    let electionId;

    beforeEach(async function () {
      // Create election that starts immediately for testing
      const currentTime = Math.floor(Date.now() / 1000);
      const startTime = currentTime - 60; // Started 1 minute ago
      const endTime = currentTime + 3600; // Ends in 1 hour

      await votingSystem.createElection(
        "Active Election",
        "Currently active election",
        startTime,
        endTime
      );
      electionId = 1;

      // Add candidates
      await votingSystem.addCandidate(electionId, "Alice", "Candidate 1");
      await votingSystem.addCandidate(electionId, "Bob", "Candidate 2");
    });

    it("Should allow voting for valid candidates", async function () {
      await expect(
        votingSystem.connect(addr1).castVote(electionId, 0)
      ).to.emit(votingSystem, "VoteCast")
       .withArgs(electionId, 0, addr1.address);

      expect(await votingSystem.hasUserVoted(electionId, addr1.address)).to.equal(true);
      expect(await votingSystem.getVoterChoice(electionId, addr1.address)).to.equal(0);
    });

    it("Should not allow double voting", async function () {
      await votingSystem.connect(addr1).castVote(electionId, 0);

      await expect(
        votingSystem.connect(addr1).castVote(electionId, 1)
      ).to.be.revertedWith("You have already voted in this election");
    });

    it("Should not allow voting for non-existent candidates", async function () {
      await expect(
        votingSystem.connect(addr1).castVote(electionId, 5)
      ).to.be.revertedWith("Candidate does not exist");
    });

    it("Should track vote counts correctly", async function () {
      await votingSystem.connect(addr1).castVote(electionId, 0);
      await votingSystem.connect(addr2).castVote(electionId, 0);
      await votingSystem.connect(addr3).castVote(electionId, 1);

      const candidates = await votingSystem.getElectionCandidates(electionId);
      expect(candidates[0].voteCount).to.equal(2);
      expect(candidates[1].voteCount).to.equal(1);

      const election = await votingSystem.getElection(electionId);
      expect(election.totalVotes).to.equal(3);
    });
  });

  describe("Results and Winner", function () {
    let electionId;

    beforeEach(async function () {
      const currentTime = Math.floor(Date.now() / 1000);
      const startTime = currentTime - 60;
      const endTime = currentTime + 3600;

      await votingSystem.createElection(
        "Result Election",
        "Election for testing results",
        startTime,
        endTime
      );
      electionId = 1;

      await votingSystem.addCandidate(electionId, "Winner", "The winning candidate");
      await votingSystem.addCandidate(electionId, "Runner-up", "Second place candidate");
      await votingSystem.addCandidate(electionId, "Third", "Third place candidate");

      // Cast votes to establish clear winner
      await votingSystem.connect(addr1).castVote(electionId, 0); // Winner
      await votingSystem.connect(addr2).castVote(electionId, 0); // Winner  
      await votingSystem.connect(addr3).castVote(electionId, 1); // Runner-up
    });

    it("Should return correct election results", async function () {
      const [candidates, totalVotes] = await votingSystem.getElectionResults(electionId);
      
      expect(candidates.length).to.equal(3);
      expect(totalVotes).to.equal(3);
      expect(candidates[0].voteCount).to.equal(2);
      expect(candidates[1].voteCount).to.equal(1);
      expect(candidates[2].voteCount).to.equal(0);
    });

    it("Should identify correct winner", async function () {
      const winner = await votingSystem.getWinner(electionId);
      expect(winner.name).to.equal("Winner");
      expect(winner.voteCount).to.equal(2);
    });
  });

  describe("Access Control", function () {
    it("Should only allow owner to authorize creators", async function () {
      await expect(
        votingSystem.connect(addr1).authorizeCreator(addr2.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should only allow owner to revoke creators", async function () {
      await expect(
        votingSystem.connect(addr1).revokeCreator(addr2.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should only allow owner to toggle election status", async function () {
      const currentTime = Math.floor(Date.now() / 1000);
      await votingSystem.createElection(
        "Toggle Test",
        "Test election status toggle",
        currentTime + 3600,
        currentTime + 7200
      );

      await expect(
        votingSystem.connect(addr1).toggleElectionStatus(1)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Utility Functions", function () {
    it("Should return correct total elections count", async function () {
      expect(await votingSystem.getTotalElections()).to.equal(0);

      const currentTime = Math.floor(Date.now() / 1000);
      await votingSystem.createElection(
        "First Election",
        "Test",
        currentTime + 3600,
        currentTime + 7200
      );

      expect(await votingSystem.getTotalElections()).to.equal(1);

      await votingSystem.createElection(
        "Second Election",
        "Test",
        currentTime + 3600,
        currentTime + 7200
      );

      expect(await votingSystem.getTotalElections()).to.equal(2);
    });

    it("Should correctly check if election is votable", async function () {
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Future election
      await votingSystem.createElection(
        "Future Election",
        "Starts in future",
        currentTime + 3600,
        currentTime + 7200
      );
      expect(await votingSystem.isElectionVotable(1)).to.equal(false);

      // Active election
      await votingSystem.createElection(
        "Active Election",
        "Currently active",
        currentTime - 60,
        currentTime + 3600
      );
      expect(await votingSystem.isElectionVotable(2)).to.equal(true);

      // Past election
      await votingSystem.createElection(
        "Past Election", 
        "Already ended",
        currentTime - 7200,
        currentTime - 3600
      );
      expect(await votingSystem.isElectionVotable(3)).to.equal(false);
    });
  });
});