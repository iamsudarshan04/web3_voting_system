import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { ArrowLeft, Trophy, Users, BarChart3, Calendar, Clock } from 'lucide-react';

const Results = () => {
  const { id } = useParams();
  const { fetchElectionDetails, connected, currentElection } = useWeb3();
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    if (id && connected) {
      fetchElectionDetails(parseInt(id));
    }
  }, [id, connected, fetchElectionDetails]);

  useEffect(() => {
    if (currentElection && currentElection.candidates.length > 0) {
      const winningCandidate = currentElection.candidates.reduce((prev, current) => 
        prev.voteCount > current.voteCount ? prev : current
      );
      setWinner(winningCandidate);
    }
  }, [currentElection]);

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getVotePercentage = (candidate) => {
    if (!currentElection || currentElection.totalVotes === 0) return 0;
    return ((candidate.voteCount / currentElection.totalVotes) * 100).toFixed(1);
  };

  const getElectionStatus = () => {
    if (!currentElection) return 'loading';
    
    const now = Math.floor(Date.now() / 1000);
    const { startTime, endTime, active } = currentElection;

    if (!active) return 'inactive';
    if (now < startTime) return 'upcoming';
    if (now > endTime) return 'ended';
    return 'active';
  };

  const sortedCandidates = currentElection?.candidates
    ? [...currentElection.candidates].sort((a, b) => b.voteCount - a.voteCount)
    : [];

  if (!connected) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Election Results</h1>
        <p className="text-gray-600 mb-8">Please connect your wallet to view election results</p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">You need to connect your MetaMask wallet to view election results.</p>
        </div>
      </div>
    );
  }

  if (!currentElection) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading election results...</p>
      </div>
    );
  }

  const status = getElectionStatus();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            to={`/election/${id}`}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Election</span>
          </Link>
        </div>
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-gray-600" />
          <span className="text-gray-600 font-medium">Election Results</span>
        </div>
      </div>

      {/* Election Info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentElection.title}</h1>
        <p className="text-gray-600 mb-4">{currentElection.description}</p>
        
        <div className="grid md:grid-cols-4 gap-6">
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-700">Started</p>
              <p className="text-gray-600">{formatDate(currentElection.startTime)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-sm font-medium text-gray-700">Ended</p>
              <p className="text-gray-600">{formatDate(currentElection.endTime)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Users className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-700">Total Votes</p>
              <p className="text-gray-600">{currentElection.totalVotes}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-gray-700">Status</p>
              <p className="text-gray-600 capitalize">{status}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Winner Announcement */}
      {winner && currentElection.totalVotes > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <Trophy className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Winner</h2>
              <p className="text-xl font-semibold text-yellow-800">{winner.name}</p>
              <p className="text-gray-600">{winner.description}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-yellow-600">{winner.voteCount}</div>
              <div className="text-sm text-gray-600">votes ({getVotePercentage(winner)}%)</div>
            </div>
          </div>
        </div>
      )}

      {/* No Votes Message */}
      {currentElection.totalVotes === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Votes Cast</h3>
          <p className="text-gray-600">No votes have been cast in this election yet.</p>
        </div>
      )}

      {/* Detailed Results */}
      {currentElection.totalVotes > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Detailed Results</h2>
          
          <div className="space-y-4">
            {sortedCandidates.map((candidate, index) => (
              <div key={candidate.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{candidate.name}</h3>
                      <p className="text-gray-600">{candidate.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{candidate.voteCount}</div>
                    <div className="text-sm text-gray-500">{getVotePercentage(candidate)}% of votes</div>
                  </div>
                </div>
                
                {/* Vote Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                    }`}
                    style={{ width: `${getVotePercentage(candidate)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Election Statistics */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{currentElection.candidates.length}</div>
          <div className="text-gray-600">Total Candidates</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{currentElection.totalVotes}</div>
          <div className="text-gray-600">Votes Cast</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {winner && currentElection.totalVotes > 0 ? getVotePercentage(winner) : '0'}%
          </div>
          <div className="text-gray-600">Winning Margin</div>
        </div>
      </div>

      {/* Election Timeline */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Election Timeline</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <div>
              <p className="font-medium text-gray-900">Election Created</p>
              <p className="text-sm text-gray-600">By {currentElection.creator}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <div>
              <p className="font-medium text-gray-900">Voting Started</p>
              <p className="text-sm text-gray-600">{formatDate(currentElection.startTime)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`w-3 h-3 rounded-full ${status === 'ended' ? 'bg-red-600' : 'bg-gray-300'}`}></div>
            <div>
              <p className="font-medium text-gray-900">Voting {status === 'ended' ? 'Ended' : 'Ends'}</p>
              <p className="text-sm text-gray-600">{formatDate(currentElection.endTime)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
