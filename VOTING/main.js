// Frontend (main.js)


//const axios = require('axios');// IPFS to upload files
var  WALLET_CONNECTED=localStorage.getItem("Wallet_Connected");
var contractAddress = localStorage.getItem('contractAddress');
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
//     console.log('Contract ABI:', config.abi);

//     const config = await response.json();
// Fetch contract address from backend and store it in localStorage
const fetchAndStoreContractAddress = async () => {
    try {
      const response = await fetch('http://localhost:3000/getContractAddress');
      const data = await response.json();
      const contractAddress = data.contractAddress;
      // Store the contract address in localStorage
      localStorage.setItem('contractAddress', contractAddress);
  
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
        //element.innerHTML = "Meta Mask is Connected: " + WALLET_CONNECTED;
        showToast("Meta Mask is Connected: " + WALLET_CONNECTED, "success");
     document.getElementById('metamasknotification').innerText = "MetaMask connected successfully!";
        
        // Redirect to Home.html after 1 second (optional delay for UX)
        setTimeout(() => {
          window.location.href = "/Home.html";
        }, 1000);
      } else {
        // Notify the user that MetaMask is not installed
        document.getElementById('metamasknotification').innerText = "MetaMask is not installed. Please install it to proceed.";
      }
    } catch (error) {
      // Handle errors (e.g., user denied connection)
      document.getElementById('metamasknotification').innerText = "Failed to connect to MetaMask. Please try again.";
      console.error(error);
    }
    // const provider = new ethers.providers.Web3Provider(window.ethereum);
    // await provider.send("eth_requestAccounts", []);
    // const signer = provider.getSigner();
    // WALLET_CONNECTED = await signer.getAddress();
    // var element = document.getElementById("metamasknotification");
    // element.innerHTML = "Meta Mask is Connected: " + WALLET_CONNECTED;
  };
  
  const addVote = async (selectedName) => {
    if (WALLET_CONNECTED != 0) {
        // Retrieve the name based on the selected candidate ID
       

        //const candidateName = selectedName; // Assuming the name is stored in `candidateData.name`

        // Ethereum and smart contract interaction
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
        const contractEligible = await contractInstance.getRemainingTime();
        var cand = document.getElementById("cand");

        console.log("Remaining time:", contractEligible);

        if (contractEligible.toNumber() != 0) {
            
            showToast("Please wait, adding a vote in the smart contract", "info");
            // Pass the candidate name to the smart contract's vote function
            const tx = await contractInstance.vote(candidateName);
            await tx.wait();
            
            showToast("Vote added successfully!", "success");
        } else {
            
            showToast("Vote cannot be casted as the voting lines are closed.", "error");
        }
    } else {
        var cand = document.getElementById("cand");
        showToast("Please connect Metamask first.", "error");
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
        status.innerHTML = currentStatus == 1 ? "Voting is currently open" : "Voting is finished";
        remainingTime.innerHTML = `Remaining time is ${parseInt(time, 16)} seconds`;
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
        <button class="vote-btn" id="voteButton" onclick="addVote('${candidate.name}')">Vote</button>
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
        var p3 = document.getElementById("p3");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
        //p3.innerHTML = "Please wait, getting all the candidates from the voting smart contract";
        showToast("Please wait, Fetching the candidates", "info");

        var candidates = await contractInstance.getAllCandidates();
        console.log(candidates);
        

        var table = document.getElementById("myTable");

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


const logout= async () =>{
  // Clear the wallet address from localStorage
  localStorage.removeItem('Wallet_Connected');

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

// document.addEventListener("DOMContentLoaded", () => {
//   document.getElementById("submitButton").addEventListener("click", addCandidate);
// });
//Add candidate
const addCandidate = async () => {
    const name = document.getElementById("name").value;
    const age = document.getElementById("age").value;
    const country = document.getElementById("country").value;
    const gender = document.getElementById("gender").value;
    const photoFile = document.getElementById("file").files[0]; // Access the uploaded file

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

    showToast("Adding candidate to blockchain...", "info");

    try {
        const tx = await contractInstance.addCandidate(name, photoHash, age, country, gender);
        await tx.wait();
        showToast("Candidate added successfully!", "success");
    } catch (error) {
        console.error('Error adding candidate:', error);
        showToast("Error adding candidate to blockchain", "error");
    }
};

// const fetchIPSF = async () => {
//   try {
//     const response = await fetch('http://localhost:3000/api/config'); // Backend endpoint
// const data = await response.json();

// const pinataApiKey = data.pinataApiKey;
// const pinataApiSecret = data.pinataApiSecret;

// console.log('API Key:', pinataApiKey); // For testing only, remove in production
// console.log('API Secret:', pinataApiSecret);

    
//   } catch (error) {
//     console.error('Error :', error);
//   }

// };

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
    const responseAPI = await fetch('http://localhost:3000/getKey'); // Backend endpoint
    const data = await responseAPI.json();
    
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
// //************* */
// // Function to handle form submission
// const submitCandidateForm = async () => {
//   // Get form data
//   const form = document.getElementById("candidateForm");
//   const name = document.getElementById("name").value;
//   const age = document.getElementById("age").value;
//   const country = document.getElementById("country").value;
//   const gender = document.getElementById("gender").value;
//   const fileInput = document.getElementById("file");

//   // Validate the file input
//   if (fileInput.files.length === 0) {
//       alert("Please select a photo to upload.");
//       return;
//   }

//   const file = fileInput.files[0];

//   // Upload the file to IPFS
//   const ipfsHash = await uploadToIPFS(file);
//   if (!ipfsHash) {
//       alert("Failed to upload photo to IPFS.");
//       return;
//   }

//   // Combine all data
//   const candidateData = {
//       name,
//       age,
//       country,
//       gender,
//       photoHash: ipfsHash, // IPFS hash of the uploaded photo
//   };

//   console.log("Candidate data to save:", candidateData);

//   // Here, you would send this data to your backend or blockchain contract
//   // For example:
//   // await saveCandidateToBlockchain(candidateData);

//   alert("Candidate successfully added!");
// };

// // Function to upload file to IPFS
// const uploadToIPFS = async (file) => {
//   const formData = new FormData();
//   formData.append("file", file);

//   const metadata = JSON.stringify({
//       name: file.name,
//   });

//   formData.append("pinataMetadata", metadata);

//   const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

//   try {
//       const response = await axios.post(url, formData, {
//           headers: {
//               'Content-Type': `multipart/form-data`,
//               'pinata_api_key': '<YOUR_PINATA_API_KEY>',
//               'pinata_secret_api_key': '<YOUR_PINATA_API_SECRET>',
//           },
//       });

//       // Return the IPFS hash (CID) of the uploaded file
//       return response.data.IpfsHash;
//   } catch (error) {
//       console.error("Error uploading file to IPFS:", error);
//       return null;
//   }
// };