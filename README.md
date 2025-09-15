# Web3 Voting System

A decentralized voting system built with React frontend and Solidity smart contracts, enabling secure, transparent, and immutable elections on the blockchain.

## 🚀 Features

- **Decentralized Elections**: Create and manage elections on the blockchain
- **Secure Voting**: Cryptographically secure voting with MetaMask integration
- **Real-time Results**: Live vote counting and result visualization
- **Transparent Process**: All votes are publicly verifiable on the blockchain
- **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS
- **Multiple Elections**: Support for concurrent elections with different timeframes
- **Candidate Management**: Easy addition and management of election candidates

## 🛠️ Tech Stack

### Backend
- **Solidity** - Smart contract development
- **Hardhat** - Ethereum development environment
- **OpenZeppelin** - Secure smart contract library
- **Ethers.js** - Ethereum library for blockchain interaction

### Frontend
- **React** - Frontend framework
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Lucide React** - Icon library
- **React Hot Toast** - Toast notifications

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MetaMask** browser extension
- **Git**

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd web3-voting-system
```

### 2. Install Root Dependencies
```bash
npm install
```

### 3. Install Backend Dependencies
```bash
cd backend
npm install
cd ..
```

### 4. Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

### 5. Environment Configuration

#### Backend Environment
Create `backend/.env` from `backend/.env.example`:
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your configuration:
```env
# Private key for deployment (DO NOT commit real private keys)
PRIVATE_KEY=your_private_key_here

# RPC URLs for different networks
MAINNET_RPC_URL=https://mainnet.infura.io/v3/your_infura_project_id
GOERLI_RPC_URL=https://goerli.infura.io/v3/your_infura_project_id
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_infura_project_id

# Etherscan API key for contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key

# Local development
LOCAL_RPC_URL=http://127.0.0.1:8545
```

#### Frontend Environment
Create `frontend/.env` from `frontend/.env.example`:
```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env` with your configuration:
```env
# Contract address (will be set after deployment)
REACT_APP_CONTRACT_ADDRESS=your_contract_address_here

# Network configuration
REACT_APP_NETWORK_ID=31337
REACT_APP_NETWORK_NAME=localhost

# RPC URL for connecting to blockchain
REACT_APP_RPC_URL=http://127.0.0.1:8545

# Application settings
REACT_APP_APP_NAME=Web3 Voting System
REACT_APP_VERSION=1.0.0
```

## 🚀 Running the Application

### Method 1: Using Root Scripts (Recommended)

1. **Start the development environment** (runs both backend and frontend):
```bash
npm run dev
```

This command will:
- Start a local Hardhat node
- Start the React development server
- Run both services concurrently

### Method 2: Manual Setup

1. **Start the local blockchain** (Terminal 1):
```bash
cd backend
npm run node
```

2. **Deploy the smart contract** (Terminal 2):
```bash
cd backend
npm run deploy
```

3. **Update frontend environment** with the deployed contract address from the deployment output.

4. **Start the frontend** (Terminal 3):
```bash
cd frontend
npm start
```

### Additional Commands

- **Compile contracts**: `npm run compile` (from backend directory)
- **Run tests**: `npm run test` (from backend directory)
- **Build frontend**: `npm run build` (from frontend directory)

## 🔗 MetaMask Setup

1. **Install MetaMask** browser extension
2. **Add Local Network** to MetaMask:
   - Network Name: `Localhost 8545`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`

3. **Import Account** using one of the private keys from Hardhat's local accounts
4. **Connect** your wallet to the application

## 📖 Usage Guide

### For Voters

1. **Connect Wallet**: Click "Connect Wallet" and approve MetaMask connection
2. **Browse Elections**: Navigate to the Elections page to see available elections
3. **View Details**: Click on an election to see candidates and details
4. **Cast Vote**: Select a candidate and confirm your vote through MetaMask
5. **View Results**: Check real-time results and final outcomes

### For Election Creators

1. **Connect Wallet**: Ensure your wallet is connected
2. **Create Election**: Navigate to "Create Election" page
3. **Fill Details**: Enter election title, description, and timeframe
4. **Add Candidates**: Add candidate names and descriptions
5. **Deploy**: Confirm transaction to create the election on blockchain
6. **Manage**: Monitor voting progress and results

## 🏗️ Project Structure

```
web3-voting-system/
├── backend/                 # Hardhat backend
│   ├── contracts/          # Solidity smart contracts
│   │   └── VotingSystem.sol
│   ├── scripts/            # Deployment scripts
│   │   └── deploy.js
│   ├── test/              # Contract tests
│   ├── hardhat.config.js  # Hardhat configuration
│   └── package.json
├── frontend/               # React frontend
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   ├── App.js         # Main app component
│   │   └── index.js       # Entry point
│   └── package.json
├── docs/                  # Documentation
├── package.json           # Root package.json
└── README.md             # This file
```

## 🔒 Security Features

- **Access Control**: Only authorized addresses can create elections
- **Reentrancy Protection**: Smart contract protected against reentrancy attacks
- **Vote Integrity**: Each address can only vote once per election
- **Time Validation**: Elections have defined start and end times
- **Immutable Records**: All votes are permanently recorded on blockchain

## 🧪 Testing

Run the smart contract tests:
```bash
cd backend
npm run test
```

The test suite covers:
- Election creation and management
- Candidate addition and validation
- Voting functionality and restrictions
- Access control and security features

## 🚀 Deployment

### Local Development
Follow the installation steps above for local development.

### Testnet Deployment
1. Update `hardhat.config.js` with testnet configuration
2. Fund your deployment account with testnet ETH
3. Deploy: `npx hardhat run scripts/deploy.js --network goerli`
4. Update frontend environment with deployed contract address

### Mainnet Deployment
⚠️ **Warning**: Mainnet deployment requires real ETH and thorough testing.

1. Audit smart contracts thoroughly
2. Test extensively on testnets
3. Update configuration for mainnet
4. Deploy with proper security measures

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

**MetaMask Connection Issues**
- Ensure MetaMask is installed and unlocked
- Check that you're on the correct network (localhost:8545 for development)
- Clear MetaMask cache if needed

**Contract Interaction Errors**
- Verify contract address in frontend environment
- Ensure sufficient ETH balance for gas fees
- Check that the local Hardhat node is running

**Build Errors**
- Clear node_modules and reinstall dependencies
- Ensure Node.js version compatibility
- Check for missing environment variables

**Transaction Failures**
- Verify election timing (start/end dates)
- Ensure you haven't already voted
- Check gas limit and price settings

### Getting Help

If you encounter issues:
1. Check the console for error messages
2. Verify your environment configuration
3. Ensure all dependencies are installed
4. Check that MetaMask is properly configured

## 📞 Support

For support and questions:
- Open an issue on GitHub
- Check existing documentation
- Review the troubleshooting section

---

**Happy Voting! 🗳️**