

require('dotenv').config();
const fs = require('fs');
const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
app.use(
    fileUpload({
        extended:true
    })
)
app.use(express.static(__dirname));
app.use(express.json());
const path = require("path");
const ethers = require('ethers');


var port = 3000;

// Middleware for handling file uploads and JSON parsing
app.use(
    fileUpload({
        useTempFiles: true, // Allow temporary files for uploads
    })
);

const API_URL = process.env.API_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const ADMIN_CONTRACT_ADDRESS=process.env.ADMIN_ADDRESS
const  PINATA_API_KEY=process.env.API_KEY;
const PINATA_API_SECRET=process.env.API_SECRET;

const {abi} = require('./artifacts/contracts/Voting.sol/Voting.json');
const provider = new ethers.providers.JsonRpcProvider(API_URL);

const signer = new ethers.Wallet(PRIVATE_KEY, provider);

const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);


// API route to send API key/Secret to the frontend
app.get('/getKey', (req, res) => {
    // Ensure the environment variables are being loaded correctly
    console.log('PINATA_API_KEY:', process.env.PINATA_API_KEY);
    console.log('PINATA_API_SECRET:', process.env.PINATA_API_SECRET);

    res.json({
        pinataApiKey: process.env.PINATA_API_KEY,
        pinataApiSecret: process.env.PINATA_API_SECRET,
    });
});
// API endpoint to get contract address
app.get('/getContractAddress', (req, res) => {
    res.json({ contractAddress: CONTRACT_ADDRESS
        });

  });


  
  // Endpoint to upload candidate data, including photo
app.post('/addCandidate', async (req, res) => {
    try {
        const { name, age, country, gender } = req.body;
        const photoFile = req.files.photo; // Access the uploaded file

        if (!photoFile) {
            return res.status(400).json({ error: 'Photo file is required' });
        }

        // Upload the photo to IPFS
        const added = await ipfs.add(photoFile.data);
        const photoHash = added.path; // IPFS hash of the uploaded photo

        console.log(`Photo uploaded to IPFS with hash: ${photoHash}`);

        // Add candidate details to the blockchain
        const tx = await contractInstance.addCandidate(name, photoHash, age, country, gender);
        await tx.wait();

        res.status(200).json({ message: 'Candidate added successfully', photoHash });
    } catch (error) {
        console.error('Error adding candidate:', error);
        res.status(500).json({ error: 'Failed to add candidate' });
    }
});

//serve the main page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
})

app.get("/index.html", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
})

// Endpoint to handle voting
// Endpoint to handle voting
app.post("/vote", async (req, res) => {
    try {
        const { candidateName } = req.body;

        // Check if voting is still open
        const isVotingOpen = await contractInstance.getVotingStatus();
        if (!isVotingOpen) {
            return res.status(400).json({ error: "Voting is closed" });
        }

        // Cast the vote
        const tx = await contractInstance.vote(candidateName);
        await tx.wait();

        res.status(200).json({ message: "Vote cast successfully" });
    } catch (error) {
        console.error('Error casting vote:', error);
        res.status(500).json({ error: 'Failed to cast vote' });
    }
});

// app.listen(port, function () {
//     console.log("App is listening on port 3000")
// });
// Start the server
app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
});