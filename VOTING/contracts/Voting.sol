// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    struct Candidate {
        string name;
        uint256 voteCount;
        string photo;
        uint256 age;
        string country;
        string gender;
        
    }

    Candidate[] public candidates;
    address public immutable admin;
   uint256 public votingStart = 0;
uint256 public votingEnd = 0;

    mapping(address => bool) public voters;                                                     
     bool public isVotingActive = false; // New variable to manage voting status

    event CandidateAdded(string name, uint256 age);
    event Voted(address voter, uint256 candidateIndex);
    event VotingEnded(uint256 timestamp);
    event VotingStarted(uint256 startTime);

    modifier onlyAdmin {
        require(msg.sender == admin, "Not authorized");
        _;
    }
    modifier whenVotingActive {
        require(isVotingActive, "Voting is not active");
        _;
    }
    constructor(
        string[] memory _names,
        string[] memory _photos,
        uint256[] memory _ages,
        string[] memory _countries,
        string[] memory _genders,
       uint256 _durationInMinutes, 
        address _admin) {
        require(_names.length == _photos.length && _names.length == _ages.length && _names.length == _countries.length && _names.length == _genders.length, "Input arrays length mismatch");
        //admin = msg.sender;
        admin=_admin;
        votingStart = block.timestamp;
       votingEnd = block.timestamp + (_durationInMinutes * 1 minutes);

        for (uint256 i = 0; i < _names.length; i++) {
            require(bytes(_names[i]).length > 0, "Name cannot be empty");
            require(_ages[i] >= 18, "Candidate must be at least 18 years old");

            candidates.push(Candidate({
                name: _names[i],
                photo: _photos[i],
                age: _ages[i],
                country: _countries[i],
                gender: _genders[i],
                voteCount: 0
            }));

            emit CandidateAdded(_names[i], _ages[i]);
        }
    }

   function startVoting() public onlyAdmin() {
    require(!isVotingActive, "Voting is already active");
    isVotingActive = true;
    votingStart = block.timestamp;
    votingEnd = votingEnd;
    emit VotingStarted(block.timestamp);
}

    function addCandidate(string memory _name, string memory _photo, uint256 _age, string memory _country, string memory _gender) public onlyAdmin(){
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(_age >= 18, "Candidate must be at least 18 years old");
        candidates.push(Candidate({
            name: _name,
            photo: _photo,
            age: _age,
            country: _country,
            gender: _gender,
            voteCount: 0
        }));

        emit CandidateAdded(_name, _age);
    }

    function vote(uint256 _candidateIndex) public whenVotingActive {
        require(!voters[msg.sender], "You have already voted");
        require(_candidateIndex < candidates.length, "Invalid candidate index");

        candidates[_candidateIndex].voteCount++;
        voters[msg.sender] = true;

        emit Voted(msg.sender, _candidateIndex);
    }

    // function getCandidate(uint256 _index) public view returns (string memory, uint256, string memory, uint256, string memory, string memory) {
    //     require(_index < candidates.length, "Invalid index");
    //     Candidate memory candidate = candidates[_index];
    //     return (candidate.name, candidate.voteCount, candidate.photo, candidate.age, candidate.country, candidate.gender);
    // }
    //***** */

    //to display all the candidates at once
    function getAllCandidates() public view returns (Candidate[] memory) {
            return candidates;
    }
  
  
   function getVotingStatus() public view returns (bool) {
        return isVotingActive && block.timestamp < votingEnd;
    }

    function getRemainingTime() public view returns (uint256) {
       if (!isVotingActive || block.timestamp >= votingEnd) {
            return 0;
        }
        return votingEnd - block.timestamp;
    }

    function endVoting() public onlyAdmin whenVotingActive {
        require(block.timestamp < votingEnd, "Voting already ended");
        isVotingActive = false;
        votingEnd = block.timestamp;
        emit VotingEnded(block.timestamp);
    }
    // Update Candidate
function updateCandidate(uint candidateId, string memory newName, string memory newPhoto, uint newAge, string memory newCountry, string memory newGender) public onlyAdmin() {
    require(candidateId < candidates.length, "Invalid Candidate ID");
    Candidate storage candidate = candidates[candidateId];
    candidate.name = newName;
    candidate.photo = newPhoto; // Assuming IPFS hash
    candidate.age = newAge;
    candidate.country = newCountry;
    candidate.gender = newGender;
}

// Delete Candidate
function deleteCandidate(uint candidateId) public onlyAdmin() {
    require(candidateId < candidates.length, "Invalid Candidate ID");
    candidates[candidateId] = candidates[candidates.length - 1]; // Replace with last candidate
    candidates.pop(); // Remove last candidate
}

//Declaring Winner
event WinnerDeclared(string winnerName, uint256 highestVotes);
function declareWinner() public returns (string memory winnerName) {
    require(!isVotingActive, "Voting is still active");

    uint256 highestVotes = 0;
    uint256 winnerIndex = 0;
    uint256 tieCount = 0;

    // Determine the highest vote count and handle ties
    for (uint256 i = 0; i < candidates.length; i++) {
        if (candidates[i].voteCount > highestVotes) {
            highestVotes = candidates[i].voteCount;
            winnerIndex = i; // Update winner index
            tieCount = 1;    // Reset tie count
        } else if (candidates[i].voteCount == highestVotes) {
            tieCount++; // Increment tie count
        }
    }

    if (tieCount > 1) {
        // Randomly choose among tied candidates
        uint256 randomIndex = uint256(
            keccak256(abi.encodePacked(blockhash(block.number - 1), block.timestamp))
        ) % tieCount;

        uint256 count = 0;
        for (uint256 i = 0; i < candidates.length; i++) {
            if (candidates[i].voteCount == highestVotes) {
                if (count == randomIndex) {
                    winnerIndex = i;
                    break;
                }
                count++;
            }
        }
    }

    winnerName = candidates[winnerIndex].name;

    // Emit event with winner details
    emit WinnerDeclared(winnerName, highestVotes);

    return winnerName;
}
}
