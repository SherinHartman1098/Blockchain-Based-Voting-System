const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Pinata API credentials
const pinataApiKey = '1237d219b13cea007dd6'; // Replace with your actual key
const pinataApiSecret = 'f99d71d55994856e1dda9b16e1510edb017ede2df1ed09d762a2fb08e3425fd3'; // Replace with your actual secret

// Folder containing dummy images
const imageFolder = path.join(__dirname, '/dummyImages'); // Adjust path as needed

// Function to upload images to IPFS and save CIDs
const uploadImagesToIPFS = async () => {
  try {
    const files = fs.readdirSync(imageFolder); // Read all files in the folder
    const imageCIDs = {};

    for (const file of files) {
      const filePath = path.join(imageFolder, file);
      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath)); // Add file to FormData

      // Upload to Pinata
      const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
        headers: {
          ...formData.getHeaders(),
          pinata_api_key: pinataApiKey,
          pinata_secret_api_key: pinataApiSecret,
        },
      });

      const cid = response.data.IpfsHash; // Extract CID from response
      console.log(`Uploaded: ${file}, CID: ${cid}`);
      imageCIDs[file] = cid; // Store CID against file name
    }

    // Save CIDs to a JSON file
    fs.writeFileSync('./imageCIDs.json', JSON.stringify(imageCIDs, null, 2));
    console.log('Image CIDs saved to imageCIDs.json!');
  } catch (error) {
    console.error('Error uploading images to IPFS:', error);
  }
};

// Execute the script
uploadImagesToIPFS();