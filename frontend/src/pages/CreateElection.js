import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { Plus, X, Calendar, Clock, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateElection = () => {
  const navigate = useNavigate();
  const { createElection, addCandidate, connected, loading } = useWeb3();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: ''
  });
  
  const [candidates, setCandidates] = useState([
    { name: '', description: '' },
    { name: '', description: '' }
  ]);
  
  const [step, setStep] = useState(1);
  const [createdElectionId, setCreatedElectionId] = useState(null);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCandidateChange = (index, field, value) => {
    const updatedCandidates = [...candidates];
    updatedCandidates[index][field] = value;
    setCandidates(updatedCandidates);
  };

  const addCandidateField = () => {
    setCandidates([...candidates, { name: '', description: '' }]);
  };

  const removeCandidateField = (index) => {
    if (candidates.length > 2) {
      setCandidates(candidates.filter((_, i) => i !== index));
    }
  };

  const validateElectionForm = () => {
    if (!formData.title.trim()) {
      toast.error('Election title is required');
      return false;
    }
    if (!formData.description.trim()) {
      toast.error('Election description is required');
      return false;
    }
    if (!formData.startDate || !formData.startTime) {
      toast.error('Start date and time are required');
      return false;
    }
    if (!formData.endDate || !formData.endTime) {
      toast.error('End date and time are required');
      return false;
    }

    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
    const now = new Date();

    if (startDateTime <= now) {
      toast.error('Start time must be in the future');
      return false;
    }
    if (endDateTime <= startDateTime) {
      toast.error('End time must be after start time');
      return false;
    }

    return true;
  };

  const validateCandidates = () => {
    const validCandidates = candidates.filter(c => c.name.trim() && c.description.trim());
    if (validCandidates.length < 2) {
      toast.error('At least 2 candidates with names and descriptions are required');
      return false;
    }
    return true;
  };

  const handleCreateElection = async () => {
    if (!connected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!validateElectionForm()) return;

    try {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
      
      const startTimestamp = Math.floor(startDateTime.getTime() / 1000);
      const endTimestamp = Math.floor(endDateTime.getTime() / 1000);

      const electionId = await createElection(
        formData.title,
        formData.description,
        startTimestamp,
        endTimestamp
      );

      setCreatedElectionId(electionId);
      setStep(2);
    } catch (error) {
      console.error('Error creating election:', error);
    }
  };

  const handleAddCandidates = async () => {
    if (!validateCandidates()) return;

    try {
      const validCandidates = candidates.filter(c => c.name.trim() && c.description.trim());
      
      for (const candidate of validCandidates) {
        await addCandidate(createdElectionId, candidate.name.trim(), candidate.description.trim());
      }

      toast.success('Election created successfully with all candidates!');
      navigate(`/election/${createdElectionId}`);
    } catch (error) {
      console.error('Error adding candidates:', error);
    }
  };

  if (!connected) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Create Election</h1>
        <p className="text-gray-600 mb-8">Please connect your wallet to create an election</p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">You need to connect your MetaMask wallet to create elections.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Election</h1>
        <p className="text-gray-600">Set up a new decentralized election on the blockchain</p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span className="font-medium">Election Details</span>
          </div>
          <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="font-medium">Add Candidates</span>
          </div>
        </div>
      </div>

      {step === 1 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Election Information
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Election Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Student Council Election 2024"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Provide details about the election, voting rules, and any important information..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time *
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time *
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleCreateElection}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Creating...' : 'Create Election'}
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Add Candidates
          </h2>

          <div className="space-y-4">
            {candidates.map((candidate, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">Candidate {index + 1}</h3>
                  {candidates.length > 2 && (
                    <button
                      onClick={() => removeCandidateField(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={candidate.name}
                      onChange={(e) => handleCandidateChange(index, 'name', e.target.value)}
                      placeholder="Candidate name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <input
                      type="text"
                      value={candidate.description}
                      onChange={(e) => handleCandidateChange(index, 'description', e.target.value)}
                      placeholder="Brief description or slogan"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addCandidateField}
            className="mt-4 flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Add Another Candidate</span>
          </button>

          <div className="mt-8 flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleAddCandidates}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Adding Candidates...' : 'Complete Election Setup'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateElection;
