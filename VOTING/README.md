# **Decentralized Voting System** 🗳️

A blockchain-based decentralized voting system that ensures transparency, security, and immutability for digital voting processes.

---
## **Introduction** ℹ️
This decentralized voting system is built as part of a master’s thesis project to demonstrate the feasibility of blockchain technology in secure and transparent voting systems. The application ensures tamper-proof and verifiable voting using Ethereum smart contracts and IPFS for data storage.


## **Features** 🖥️
- **Conduct Secure Voting:** Enable voters to cast their votes securely using blockchain technology.  
- **Authenticate Voter Identity:** Verify voters via Ethereum wallets, ensuring only eligible participants can vote.  
- **Ensure Vote Privacy:** Maintain anonymity for voters while ensuring the integrity of the vote count.  
- **Store and Access Voting Data:** Utilize IPFS for decentralized storage of supplementary materials like candidate information.  
- **Display Real-Time Results:** Provide real-time vote counting and result visualization directly on the web interface.  
- **Automate Voting Logic:** Use smart contracts to enforce voting rules and tally results without manual intervention.  
- **Prevent Double Voting:** Implement safeguards to ensure each voter can cast only one vote.  
- **Audit and Verify Elections:** Allow independent verification of results with blockchain's transparent and immutable ledger.  
- **Offer Cross-Platform Accessibility:** Enable participation from any device equipped with a web browser and Ethereum wallet.  

-----
## **Technologies Used** 💻
- **Blockchain**: Ethereum (Smart Contracts written in Solidity)
- **Storage**: InterPlanetary File System (IPFS)
- **Backend**: Node.js
- **Frontend**: HTML, CSS, JavaScript
- **Testing Framework**: Hardhat
- **Smart Contract Deployment**: Hardhat framework
- **Cryptographic Libraries**: ethers.js

---

## **Setup and Installation** 

### **Prerequisites** 🏷️
- Node.js (v14 or higher)
- Hardhat
- Metamask (for Ethereum wallet)
- Ganache or other Ethereum local blockchain for testing
- IPFS CLI (optional for data upload)

### **Installation Steps** 💾
1. Clone the repository:
   ```bash
   git clone https://github.com/SherinHartman1098/Blockchain-Based-Voting-System.git
   cd decentralized-voting-system

2.	Install Dependencies
    ```bash
    npm install

3.  Install Hardhat
    ```bash
    npm install --global hardhat
### **How to run the application** ⌨️
1. Compile Contracts
    ``` bash
    npx hardhat compile
2. Deploy Contracts
    ``` bash
    npx hardhat run --network volta scripts/deploy.js

3. Start the application 
    ``` bash
    node index.js 

## **Output** 💻
![Decentralized Voting System](/Images/HomeScreen.png)

