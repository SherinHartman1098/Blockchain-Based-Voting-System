const { create } = require('ipfs-http-client');
const fs = require('fs');

// Create IPFS client for public gateway
const ipfs = create({
    host: 'ipfs.io',
    port: 5001,
    protocol: 'https',
});

// Function to upload a file to IPFS
async function uploadFile(filePath) {
    try {
        const file = fs.readFileSync(filePath); // Read file from the local filesystem
        const added = await ipfs.add(file); // Add file to IPFS
        console.log(`File uploaded to IPFS. CID: ${added.path}`);
        return added.path; // Return the CID
    } catch (error) {
        console.error('Error uploading file to IPFS:', error);
        throw error;
    }
}

// Function to retrieve a file from IPFS
async function retrieveFile(cid) {
    try {
        const url = `https://ipfs.io/ipfs/${cid}`; // Use public IPFS gateway
        console.log(`File accessible at: ${url}`);
        return url;
    } catch (error) {
        console.error('Error retrieving file from IPFS:', error);
        throw error;
    }
}

// Example Usage
(async () => {
    const filePath = './example.jpg'; // Path to the file you want to upload

    // Upload the file
    const cid = await uploadFile(filePath);

    // Fetch the file URL
    const fileUrl = await retrieveFile(cid);

    console.log(`File can be accessed at: ${fileUrl}`);
})();