import React from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { ArrowRight, Shield, Users, Eye, Zap } from 'lucide-react';

const Home = () => {
  const { connected, connectWallet, elections } = useWeb3();

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Secure, Transparent, and Decentralized Voting
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            VoteChain leverages blockchain technology to ensure your vote is counted, 
            verified, and immutable. Experience democracy in the digital age with 
            complete transparency and security.
          </p>
          <div className="flex justify-center space-x-4">
            {connected ? (
              <Link 
                to="/elections"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors"
              >
                <span>Browse Elections</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <button
                onClick={connectWallet}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            <Link 
              to="/create"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Create Election
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-100 rounded-2xl">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose VoteChain?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure</h3>
              <p className="text-gray-600">
                Cryptographic security ensures votes cannot be tampered with or manipulated
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Transparent</h3>
              <p className="text-gray-600">
                All votes are publicly verifiable on the blockchain while maintaining voter privacy
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Decentralized</h3>
              <p className="text-gray-600">
                No central authority controls the election - powered by smart contracts
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant Results</h3>
              <p className="text-gray-600">
                Real-time vote counting with immediate, verifiable results
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">
            Platform Statistics
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {elections.length}
              </div>
              <div className="text-gray-600 font-medium">Total Elections</div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {elections.reduce((sum, election) => sum + election.totalVotes, 0)}
              </div>
              <div className="text-gray-600 font-medium">Votes Cast</div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                100%
              </div>
              <div className="text-gray-600 font-medium">Transparency</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-100 rounded-2xl">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect Wallet</h3>
              <p className="text-gray-600">
                Connect your MetaMask wallet to authenticate your identity securely
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Choose Election</h3>
              <p className="text-gray-600">
                Browse active elections and select the one you want to participate in
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Cast Vote</h3>
              <p className="text-gray-600">
                Select your candidate and submit your vote to the blockchain
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Experience the Future of Voting?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of users who trust VoteChain for secure, transparent elections
          </p>
          {!connected && (
            <button
              onClick={connectWallet}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium text-lg transition-colors"
            >
              Connect Wallet & Get Started
            </button>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;