import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

// Contract ABI (you'll need to import the full ABI from your compiled contract)
const CONTRACT_ABI = [
  "function createElection(string memory _title, string memory _description, uint256 _startTime, uint256 _endTime) external returns (uint256)",
  "function addCandidate(uint256 _electionId, string memory _name, string memory _description) external",
  "function castVote(uint256 _electionId, uint256 _candidateId) external",
  "function getElection(uint256 _electionId) external view returns (tuple(uint256 id, string title, string description, uint256 startTime, uint256 endTime, bool active, bool exists, uint256 totalVotes, uint256[] candidateIds, address creator))",
  "function getElectionCandidates(uint256 _electionId) external view returns (tuple(uint256 id, string name, string description, uint256 voteCount, bool exists)[])",
  "function getElectionResults(uint256 _electionId) external view returns (tuple(uint256 id, string name, string description, uint256 voteCount, bool exists)[] candidates, uint256 totalVotes)",
  "function getWinner(uint256 _electionId) external view returns (tuple(uint256 id, string name, string description, uint256 voteCount, bool exists))",
  "function hasUserVoted(uint256 _electionId, address _voter) external view returns (bool)",
  "function getTotalElections() external view returns (uint256)",
  "function isElectionVotable(uint256 _electionId) external view returns (bool)",
  "function authorizedCreators(address) external view returns (bool)",
  "event ElectionCreated(uint256 indexed electionId, string title, address indexed creator, uint256 startTime, uint256 endTime)",
  "event VoteCast(uint256 indexed electionId, uint256 indexed candidateId, address indexed voter)"
];

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Initial state
const initialState = {
  provider: null,
  signer: null,
  contract: null,
  account: null,
  connected: false,
  loading: false,
  elections: [],
  currentElection: null,
  error: null
};

// Action types
const ACTION_TYPES = {
  SET_PROVIDER: 'SET_PROVIDER',
  SET_ACCOUNT: 'SET_ACCOUNT',
  SET_CONTRACT: 'SET_CONTRACT',
  SET_LOADING: 'SET_LOADING',
  SET_ELECTIONS: 'SET_ELECTIONS',
  SET_CURRENT_ELECTION: 'SET_CURRENT_ELECTION',
  SET_ERROR: 'SET_ERROR',
  RESET_STATE: 'RESET_STATE'
};

// Reducer
function web3Reducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.SET_PROVIDER:
      return { ...state, provider: action.payload };
    case ACTION_TYPES.SET_ACCOUNT:
      return { ...state, account: action.payload, connected: !!action.payload };
    case ACTION_TYPES.SET_CONTRACT:
      return { ...state, contract: action.payload };
    case ACTION_TYPES.SET_LOADING:
      return { ...state, loading: action.payload };
    case ACTION_TYPES.SET_ELECTIONS:
      return { ...state, elections: action.payload };
    case ACTION_TYPES.SET_CURRENT_ELECTION:
      return { ...state, currentElection: action.payload };
    case ACTION_TYPES.SET_ERROR:
      return { ...state, error: action.payload };
    case ACTION_TYPES.RESET_STATE:
      return { ...initialState };
    default:
      return state;
  }
}

// Create context
const Web3Context = createContext();

// Provider component
export const Web3Provider = ({ children }) => {
  const [state, dispatch] = useReducer(web3Reducer, initialState);

  // Connect to MetaMask
  const connectWallet = async () => {
    if (!window.ethereum) {
      dispatch({ type: ACTION_TYPES.SET_ERROR, payload: 'MetaMask not found. Please install MetaMask.' });
      toast.error('MetaMask not found. Please install MetaMask.');
      return;
    }

    try {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Check if user is on Polygon Mumbai testnet
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const expectedChainId = process.env.REACT_APP_NETWORK_ID === '137' ? '0x89' : '0x13881'; // 0x89 = Polygon Mainnet, 0x13881 = Mumbai
      
      if (chainId !== expectedChainId) {
        const networkName = process.env.REACT_APP_NETWORK_NAME || 'Polygon Mumbai';
        toast.error(`Please switch MetaMask to ${networkName}!`);
        
        // Try to switch network automatically
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: expectedChainId }],
          });
        } catch (switchError) {
          // If network doesn't exist, add it
          if (switchError.code === 4902) {
            await addPolygonNetwork();
          }
          throw switchError;
        }
      }

      // Create provider and signer
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const account = accounts[0];

      // Create contract instance
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // Update state
      dispatch({ type: ACTION_TYPES.SET_PROVIDER, payload: provider });
      dispatch({ type: ACTION_TYPES.SET_ACCOUNT, payload: account });
      dispatch({ type: ACTION_TYPES.SET_CONTRACT, payload: contract });

      toast.success('Wallet connected successfully!');
      
      // Load elections after connecting
      await fetchElections();
      
    } catch (error) {
      console.error('Error connecting wallet:', error);
      dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
      toast.error(`Failed to connect wallet: ${error.message}`);
    } finally {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
    }
  };

  const addPolygonNetwork = async () => {
    const isMainnet = process.env.REACT_APP_NETWORK_ID === '137';
    
    const networkParams = {
      chainId: isMainnet ? '0x89' : '0x13881',
      chainName: isMainnet ? 'Polygon Mainnet' : 'Polygon Mumbai Testnet',
      nativeCurrency: {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18,
      },
      rpcUrls: [isMainnet ? 'https://rpc.ankr.com/polygon' : 'https://rpc.ankr.com/polygon_mumbai'],
      blockExplorerUrls: [isMainnet ? 'https://polygonscan.com/' : 'https://mumbai.polygonscan.com/'],
    };

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [networkParams],
      });
      toast.success('Polygon network added to MetaMask!');
    } catch (error) {
      console.error('Error adding Polygon network:', error);
      toast.error('Failed to add Polygon network to MetaMask');
      throw error;
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    dispatch({ type: ACTION_TYPES.RESET_STATE });
    toast.success('Wallet disconnected');
  };

  // Create new election
  const createElection = async (title, description, startTime, endTime) => {
    if (!state.contract) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });

      const tx = await state.contract.createElection(title, description, startTime, endTime);
      const receipt = await tx.wait();

      // Find the ElectionCreated event
      const event = receipt.events?.find(e => e.event === 'ElectionCreated');
      const electionId = event?.args?.electionId;

      toast.success(`Election created successfully! ID: ${electionId}`);
      
      // Refresh elections list
      await fetchElections();
      
      return electionId;
    } catch (error) {
      console.error('Error creating election:', error);
      toast.error(`Failed to create election: ${error.reason || error.message}`);
      throw error;
    } finally {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
    }
  };

  // Add candidate to election
  const addCandidate = async (electionId, name, description) => {
    if (!state.contract) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });

      const tx = await state.contract.addCandidate(electionId, name, description);
      await tx.wait();

      toast.success('Candidate added successfully!');
      
      // Refresh current election if it matches
      if (state.currentElection && state.currentElection.id === electionId) {
        await fetchElectionDetails(electionId);
      }
    } catch (error) {
      console.error('Error adding candidate:', error);
      toast.error(`Failed to add candidate: ${error.reason || error.message}`);
      throw error;
    } finally {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
    }
  };

  // Cast vote
  const castVote = async (electionId, candidateId) => {
    if (!state.contract) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });

      const tx = await state.contract.castVote(electionId, candidateId);
      await tx.wait();

      toast.success('Vote cast successfully!');
      
      // Refresh current election details
      if (state.currentElection && state.currentElection.id === electionId) {
        await fetchElectionDetails(electionId);
      }
    } catch (error) {
      console.error('Error casting vote:', error);
      toast.error(`Failed to cast vote: ${error.reason || error.message}`);
      throw error;
    } finally {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
    }
  };

  // Fetch all elections
  const fetchElections = async (contract = state.contract) => {
    if (!contract) return;

    try {
      const totalElections = await contract.getTotalElections();
      const elections = [];

      for (let i = 1; i <= totalElections.toNumber(); i++) {
        const election = await contract.getElection(i);
        elections.push({
          id: election.id.toNumber(),
          title: election.title,
          description: election.description,
          startTime: election.startTime.toNumber(),
          endTime: election.endTime.toNumber(),
          active: election.active,
          totalVotes: election.totalVotes.toNumber(),
          creator: election.creator
        });
      }

      dispatch({ type: ACTION_TYPES.SET_ELECTIONS, payload: elections });
    } catch (error) {
      console.error('Error fetching elections:', error);
      dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
    }
  };

  // Fetch election details with candidates
  const fetchElectionDetails = async (electionId) => {
    if (!state.contract) return;

    try {
      const election = await state.contract.getElection(electionId);
      const candidates = await state.contract.getElectionCandidates(electionId);
      const hasVoted = state.account ? await state.contract.hasUserVoted(electionId, state.account) : false;
      const isVotable = await state.contract.isElectionVotable(electionId);

      const electionDetails = {
        id: election.id.toNumber(),
        title: election.title,
        description: election.description,
        startTime: election.startTime.toNumber(),
        endTime: election.endTime.toNumber(),
        active: election.active,
        totalVotes: election.totalVotes.toNumber(),
        creator: election.creator,
        candidates: candidates.map(candidate => ({
          id: candidate.id.toNumber(),
          name: candidate.name,
          description: candidate.description,
          voteCount: candidate.voteCount.toNumber(),
          exists: candidate.exists
        })),
        hasVoted,
        isVotable
      };

      dispatch({ type: ACTION_TYPES.SET_CURRENT_ELECTION, payload: electionDetails });
    } catch (error) {
      console.error('Error fetching election details:', error);
      dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
    }
  };

  // Check if user is authorized creator
  const isAuthorizedCreator = async () => {
    if (!state.contract || !state.account) return false;

    try {
      const isAuthorized = await state.contract.authorizedCreators(state.account);
      return isAuthorized;
    } catch (error) {
      console.error('Error checking authorization:', error);
      return false;
    }
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          dispatch({ type: ACTION_TYPES.SET_ACCOUNT, payload: accounts[0] });
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  // Auto-connect if previously connected
  useEffect(() => {
    const autoConnect = async () => {
      if (window.ethereum && localStorage.getItem('walletConnected')) {
        await connectWallet();
      }
    };

    autoConnect();
  }, []);

  // Save connection status
  useEffect(() => {
    if (state.connected) {
      localStorage.setItem('walletConnected', 'true');
    } else {
      localStorage.removeItem('walletConnected');
    }
  }, [state.connected]);

  // Fetch elections when contract is available
  useEffect(() => {
    if (state.contract) {
      fetchElections();
    }
  }, [state.contract]);

  const value = {
    ...state,
    connectWallet,
    disconnectWallet,
    createElection,
    addCandidate,
    castVote,
    fetchElections,
    fetchElectionDetails,
    isAuthorizedCreator
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};

// Custom hook to use Web3 context
export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};