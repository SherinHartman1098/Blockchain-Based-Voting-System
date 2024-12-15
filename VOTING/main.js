// Frontend (main.js)


//const axios = require('axios');// IPFS to upload files
var  WALLET_CONNECTED=localStorage.getItem("Wallet_Connected");
var contractAddress = localStorage.getItem('contractAddress');
//var adminContractAddress=localStorage.getItem('adminContractAddress');
var contractAbi="";
var candidateIdPhoto = [
  { id:0,photo: "https://via.placeholder.com/100" },
  { id:1,photo: "https://via.placeholder.com/100" },
  {id:2,photo: "https://via.placeholder.com/100" },
  {id:3,photo: "https://via.placeholder.com/100" },
];
var card="";
const pinataApiKey="";
const pinataApiSecret="";
var flag=0;
//     console.log('Contract ABI:', config.abi);

//     const config = await response.json();
// Fetch contract address from backend and store it in localStorage
const fetchAndStoreContractAddress = async () => {
    try {
      const response = await fetch('http://localhost:3000/getContractAddress');
      const data = await response.json();
      const contractAddress = data.contractAddress;
      const adminContractAddress=data.adminContractAddress;
      // Store the contract address in localStorage
      localStorage.setItem('contractAddress', contractAddress);
      localStorage.setItem('adminContractAddress',adminContractAddress);
      console.log('Contract Address stored in localStorage:', contractAddress);
    } catch (error) {
      console.error('Error fetching contract address:', error);
    }

  };

  
  // Fetch the contract address from localStorage
  const getContractAbi =async () => {
    var responseConfig = await fetch('./artifacts/contracts/Voting.sol/Voting.json');
    const config = await responseConfig.json();
    contractAbi=config.abi;
  };
  
  async function checkIfAdmin() {
    try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const userAddress = await signer.getAddress();
    console.log('Connected address:', userAddress);

    // Fetch the admin address from the contract
    const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
    const adminAddress = await contractInstance.admin();

    if (userAddress.toLowerCase() === adminAddress.toLowerCase()) {
        console.log("User is the admin");
        setTimeout(() => {
          window.location.href = "/adminPage.html";
        }, 1000);
        //return true;
      
    } else {
        console.log("User is a voter");
        setTimeout(() => {
          window.location.href = "/Home.html";
        }, 2000);
       
         
        
        //return false;
    }
  }catch(error){
    console.log(error);
  }
}

async function configureUI() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
        const contractEligible = await contractInstance.getRemainingTime();
        if (contractEligible.toNumber() != 0) {
      // Show admin-only buttons
      document.getElementById('submitButton').disabled=true;
      document.getElementById('update').disabled=true;
      document.getElementById('delete').disabled=true;
  } else {
      // Hide admin-only buttons
      document.getElementById('vote').style.display = 'none';
  }
}


  //Connect to local mask
  const connectMetamask = async () => {
   

    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        WALLET_CONNECTED = await signer.getAddress();
        localStorage.setItem("Wallet_Connected",WALLET_CONNECTED);
        var element = document.getElementById("metamasknotification");
        showToast("Meta Mask is Connected: " + WALLET_CONNECTED, "success");
        document.getElementById('metamasknotification').innerText = "MetaMask connected successfully!";
        
        await checkIfAdmin();
        // setTimeout(() => {
        //   displayCandidates();
        // }, 1000);
      } else {
        showToast("MetaMask is not installed. Please install it to proceed.", "error");// Notify the user that MetaMask is not installed
      }
    } catch (error) {
       showToast("Failed to connect to MetaMask. Please try again.", "error");// Handle errors (e.g., user denied connection)
    }
    
  };
  
  //Function to add Vote
  const addVote = async (index) => {
    try{
    if (WALLET_CONNECTED != 0) {
        // Retrieve the name based on the selected candidate ID
       

        const candidateName = index; // Assuming the name is stored in `candidateData.name`

        // Ethereum and smart contract interaction
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
        const contractEligible = await contractInstance.getRemainingTime();
        //var cand = document.getElementById("cand");

        console.log("Remaining time:", contractEligible);

        if (contractEligible.toNumber() != 0) {
            
            showToast("Please wait as your votes are valuable to us!", "info");
            // Pass the candidate name to the smart contract's vote function
            const tx = await contractInstance.vote(index);
            await tx.wait();
            
            showToast("Vote added successfully!", "success");
        } else {
            
            showToast("Vote cannot be casted as the voting lines are closed.", "error");
        }
    } else {
        //var cand = document.getElementById("cand");
        showToast("Please connect Metamask first.", "error");
    }
  }catch(error){
    if (error.data && error.data.message) {
      console.error("Revert reason:", error.data.message);
      showToast("You have already voted. Thank you!","error");
    }
   else {
      console.error("Unhandled error:", error);
      
  }
  }

};

const voteStatus = async() => {
    if(WALLET_CONNECTED != 0) {
        var status = document.getElementById("status");
        var remainingTime = document.getElementById("time");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
        const currentStatus = await contractInstance.getVotingStatus();
        const time = await contractInstance.getRemainingTime();
        console.log(time);
        status.innerHTML = currentStatus == true ? "Voting is currently open" : "Voting is finished";
        remainingTime.innerHTML = `Remaining time is ${parseInt(time, 16)} seconds`;
        if(currentStatus!= true ){
         await getWinner();
         
        } 
    }
    else {
        var status = document.getElementById("status");
        showToast("Please connect Metamask first.", "error");

    }
}

const displayCandidates = async()=>{
  
  if(WALLET_CONNECTED != 0) {
    
  //Displaying the details of the voters in the card
  const container = document.getElementById("candidateCards");
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
  var candidates = await contractInstance.getAllCandidates();

      candidates.forEach((candidate,index) => {
        const photoHash = candidates[index]['photo'];
        if(photoHash){
           // Construct IPFS URL
           const photoUrl = `https://ipfs.io/ipfs/${photoHash}`;
    card = document.createElement("div");
    // card.classList.add("card");
    // card.setAttribute("data_id", photoData.id);
    // card.setAttribute("data_name", candidate.name);
    
    card.innerHTML = `
        <img src="${photoUrl}" alt="${candidate.name}">
        <h3>${candidate.name}</h3>
        <p>ID: ${index}</p>
        <button class="vote-btn" id="voteButton" onclick="addVote('${index}')">Vote</button>
    `;
    container.appendChild(card);
        }
    });
 
  }
  else {
   showToast("Not Connected to Metamask!", "error");

}
}


const getAllCandidates = async() => {
  
    if(WALLET_CONNECTED != 0) {
      var table = document.getElementById("myTable");
      // Clear all rows except the header (if it exists)
      var rowCount = table.rows.length;
      for (var i = rowCount - 1; i > 0; i--) {
          table.deleteRow(i); // Remove rows one by one
      }
      toggleCandidateTable();
        var p3 = document.getElementById("p3");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
        p3.innerHTML = "Please wait, getting all the candidates from the voting smart contract";
        showToast("Please wait, Fetching the candidates", "info");

        var candidates = await contractInstance.getAllCandidates();
        console.log(candidates);
        for (let i = 0; i < candidates.length; i++) {
            var row = table.insertRow();
            var idCell = row.insertCell();
            var descCell = row.insertCell();
            var statusCell = row.insertCell();

            idCell.innerHTML = i;
            descCell.innerHTML = candidates[i].name;
            statusCell.innerHTML = candidates[i].voteCount;
        }

        showToast("The tasks are updated", "success");

    }
    else {
        var p3 = document.getElementById("p3");
        showToast("Please connect metamask first", "error");

    }
}
function toggleCandidateTable() {
  const table = document.getElementById('myTable');
  // if (table.style.display === 'none') {
      table.style.display = 'table';
  // } else {
  //     table.style.display = 'none';
  // }
}

const logout= async () =>{
  // Clear the wallet address from localStorage
  localStorage.removeItem('Wallet_Connected');
  localStorage.removeItem('contractAddress');

  // Redirect to home page
  window.location.href = "/index.html";
}

function setActiveMenuItem() {
  const links = document.querySelectorAll('.navbar a'); // All menu links
  links.forEach(link => {
      link.addEventListener('click', () => {
          links.forEach(item => item.classList.remove('active')); // Remove active class from all links
          link.classList.add('active'); // Add active class to clicked link
      });
  });
}

// Call the function when the page loads

window.onload = function() {
  setActiveMenuItem();
  getContractAbi();
  fetchAndStoreContractAddress();
   displayCandidates();
}

const showToast = (message, type) => {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button class="close" onclick="this.parentElement.style.display='none';">&times;</button>
  `;
  document.body.appendChild(toast);

  // Auto-remove after 4 seconds
  setTimeout(() => {
    toast.remove();
  }, 4000);
};

//login functionality for the admin
const authenticate=async(event)=> {
  event.preventDefault(); // Prevent form submission
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  // Hardcoded credentials for demonstration
  const validUsername = "admin";
  const validPassword = "password123";

  if (username === validUsername && password === validPassword) {
      // Redirect to the voting application page
      window.location.href = "/ListVoters.html";
  } else {
      // Display an error message
      document.getElementById('errorMessage').innerText = "Invalid username or password!";
  }
}

//Add candidate
const addCandidate = async () => {
    const name = document.getElementById("name").value;
    const age = document.getElementById("age").value;
    const country = document.getElementById("country").value;
    const gender = document.getElementById("gender").value;
    const photoFile = document.getElementById("file").files[0]; // Access the uploaded file
    try {
    // Upload photo to IPFS
    const photoHash = await uploadToIPFS(photoFile);

    if (!photoHash) {
        showToast("Failed to upload photo to IPFS", "error");
        return;
    }

    // Call the smart contract with the IPFS hash
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
    const currentStatus = await contractInstance.getVotingStatus();
    if(currentStatus==false){
    showToast("Adding candidate to blockchain...", "info");

        const tx = await contractInstance.addCandidate(name, photoHash, age, country, gender);
        await tx.wait();
        showToast("Candidate added successfully!", "success");
    }
    else{
      showToast("Sorry! the Election has already started");
    }
    } catch (error) {
        console.error('Error adding candidate:', error);
        showToast("Error adding candidate to blockchain", "error");
    }
};

//Upload profile picture to IPFS
const uploadToIPFS = async (file) => {
  //fetchIPSF();
  const formData = new FormData();
  formData.append("file", file);

  const metadata = JSON.stringify({
      name: file.name,
  });

  formData.append("pinataMetadata", metadata);

  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

  try {
    const responseAPIKey = await fetch('http://localhost:3000/getKey'); // Backend endpoint
    const data = await responseAPIKey.json();
    
    const pinataApiKey = data.pinataApiKey;
    const pinataApiSecret = data.pinataApiSecret;
    
    console.log('API Key:', pinataApiKey); // For testing only, remove in production
    console.log('API Secret:', pinataApiSecret);
    

      const response = await axios.post(url, formData, {
          headers: {
              'Content-Type': `multipart/form-data`,
              'pinata_api_key': pinataApiKey,
              'pinata_secret_api_key': pinataApiSecret,
          },
      });

      // Return the IPFS hash (CID) of the uploaded file
      return response.data.IpfsHash;
  } catch (error) {
      console.error("Error uploading file to IPFS:", error);
      return null;
  }
};




// Update Candidate
async function updateCandidate() {
  const id = document.getElementById('updateId').value;
  const name = document.getElementById('updateName').value;
  const photo = document.getElementById('updatePhoto').value;
  const age = document.getElementById('updateAge').value;
  const country = document.getElementById('updateCountry').value;
  const gender = document.getElementById('updateGender').value;

  try {
      // Assuming an updateCandidate function is present in the contract
      const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
      const tx = await contractInstance.updateCandidate(id, name, photo, age, country, gender);
      await tx.wait();

      showToast('Candidate updated successfully!','success');
      closeUpdateDialog();
  } catch (error) {
      console.error('Error updating candidate:', error);
      showToast('Failed to update candidate.','error');
  }
}

// Delete Candidate
const deleteCandidate=async()=> {
  const id = document.getElementById('deleteId').value;

  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
      // Assuming a deleteCandidate function is present in the contract
      const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
      const tx = await contractInstance.deleteCandidate(id);
      await tx.wait();
      showToast("Candidate deleted successfully!","success")
      
      closeDeleteDialog();
  } catch (error) {
      console.error(error);
      showToast("Failed to delete candidate.","error");
      
  }
}

// Function to start voting
const startVoting=async()=> {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  const votingContract = new ethers.Contract(contractAddress, contractAbi, signer);

  try {
      const tx = await votingContract.startVoting();
      await tx.wait();
      showToast("Voting session has started successfully!","success");
      voteStatus();
      //updateVotingStatus();
  } catch (error) {
      console.error("Error starting the voting session:", error);
      showToast("Failed to start voting. Please try again.","error");
  }
}

// Update voting status display
const updateVotingStatus=async()=> {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const votingContract = new ethers.Contract(contractAddress, contractAbi, provider);

  try {
      const isVotingActive = await votingContract.getVotingStatus();
      document.getElementById("p3").innerText = isVotingActive ? "Voting is active" : "Voting is not active";
  } catch (error) {
      console.error("Error fetching voting status:", error);
  }
}

//End Vote
const endVote=async()=> {
  try {
      // Connect to the smart contract
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractAbi, signer);
      const votingEndTimestamp = await contract.getVotingStatus();
      //const time = await contractInstance.getRemainingTime();
      //const currentTime = Math.floor(Date.now() / 1000); // Get current timestamp in seconds

      if (votingEndTimestamp==false) {
          showToast("Voting has already ended or hasn't started yet.","warning");
          return;
      }

      // Call the endVoting function
      const tx = await contract.endVoting();
      await tx.wait(); // Wait for the transaction to be mined
      showToast("Voting successfully ended!","success")
  } catch (error) {
      console.log("Error ending voting:", error);
      showToast("Failed to end voting. Please try again.","error");
  }
}

//Decalare the Winner
async function getWinner() {
  try {
    var status = document.getElementById("status");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
      //const winner = await contractInstance.declareWinner();
      
      const tx = await contractInstance.declareWinner();
        console.log("Transaction sent:", tx.hash);

        // Wait for the transaction to be mined
        const receipt = await tx.wait();
        showToast("Fetching the results of the Election. Please wait for sometime!","info");
        console.log("Transaction mined:", receipt);

        // Parse the emitted WinnerDeclared event
        const event = receipt.events.find(event => event.event === "WinnerDeclared");
        console.log(event);
        if (event) {
            const  winnerName=event.args.winnerName;
            const highestVotes  = event.args.highestVotes.toNumber();
            status.innerHTML=`<h1>The winner is: ${winnerName} with ${highestVotes} votes!</h1>`;
        } else {
            console.log("WinnerDeclared event not found.");
        }

      // status.innerHTML=` <h2>The winner is: ${winner.toString()}!!"</h3>`;
      // return winner;
  } catch (error) {
    showToast("Error declaring winner","error");
      console.error("Error declaring winner:", error);
  }
}