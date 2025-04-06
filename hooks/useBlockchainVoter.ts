import { useState } from 'react';
import { 
  VoterRegistrationData, 
  registerVoterOnBlockchain, 
  getVoterStatusByAddress,
  getVoterDetailsByAddress
} from '../services/voterService';
import { getAuth } from 'firebase/auth';

/**
 * Hook to interact with the blockchain voter functionality
 */
export function useBlockchainVoter() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Register a voter on the blockchain
   */
  const registerVoter = async (voterData: VoterRegistrationData) => {
    setLoading(true);
    setError(null);
    
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        throw new Error('Authentication required. User not logged in');
      }
      
      const result = await registerVoterOnBlockchain(currentUser.uid, voterData);
      return result;
    } catch (err) {
      console.error('Error registering voter:', err);
      setError(err instanceof Error ? err.message : 'Failed to register voter');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Get voter status by blockchain address
   */
  const getVoterStatus = async (address: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const statusResult = await getVoterStatusByAddress(address);
      
      return {
        isVerified: statusResult.isVerified,
        registrationDate: new Date(statusResult.registrationDate).toISOString(),
        // Only add verification date for verified voters
        ...(statusResult.isVerified && {
          verificationDate: new Date(statusResult.registrationDate).toISOString()
        })
      };
    } catch (err) {
      console.error('Error getting voter status:', err);
      setError(err instanceof Error ? err.message : 'Failed to get voter status');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Get voter details by blockchain address
   */
  const getVoterDetails = async (address: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getVoterDetailsByAddress(address);
      
      // Format dates for the response
      const formattedVoter = {
        ...result.voter,
        createdAt: new Date(result.voter.createdAt).toISOString(),
        updatedAt: new Date(result.voter.updatedAt).toISOString(),
        // Only include verificationDate if it exists in the voter data
        ...(result.voter.verificationStatus === 'verified' && {
          verificationDate: new Date(result.voter.updatedAt).toISOString()
        })
      };
      
      return { voter: formattedVoter };
    } catch (err) {
      console.error('Error getting voter details:', err);
      setError(err instanceof Error ? err.message : 'Failed to get voter details');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Generate a new blockchain address
   * In a real application, this would securely generate a new wallet address
   * For demo purposes, we're generating a random address
   */
  const generateBlockchainAddress = () => {
    // Generate a random hexadecimal string for the address
    const addr = '0x' + Array.from({length: 40}, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    
    return addr;
  };
  
  return {
    loading,
    error,
    registerVoter,
    getVoterStatus,
    getVoterDetails,
    generateBlockchainAddress,
  };
} 