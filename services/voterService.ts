import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { User } from 'firebase/auth';

// Voter verification status types
export enum VoterVerificationStatus {
  NOT_VERIFIED = 'not_verified',
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected'
}

// Voter profile interface
export interface VoterProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  verificationStatus: VoterVerificationStatus;
  createdAt: number;
  updatedAt: number;
}

/**
 * Creates a new voter profile in Firestore
 * Default status is NOT_VERIFIED
 */
export const createVoterProfile = async (user: User): Promise<VoterProfile> => {
  const voterProfile: VoterProfile = {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName,
    photoURL: user.photoURL,
    verificationStatus: VoterVerificationStatus.NOT_VERIFIED,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  // Save the voter profile to Firestore
  await setDoc(doc(db, 'voters', user.uid), voterProfile);
  
  return voterProfile;
};

/**
 * Gets a voter profile from Firestore
 * If it doesn't exist, creates a new one
 */
export const getVoterProfile = async (user: User): Promise<VoterProfile> => {
  const voterRef = doc(db, 'voters', user.uid);
  const voterSnap = await getDoc(voterRef);

  if (voterSnap.exists()) {
    return voterSnap.data() as VoterProfile;
  } else {
    // Create new voter profile if it doesn't exist
    return createVoterProfile(user);
  }
};

/**
 * Updates voter verification status
 */
export const updateVoterStatus = async (
  uid: string, 
  status: VoterVerificationStatus
): Promise<void> => {
  const voterRef = doc(db, 'voters', uid);
  await updateDoc(voterRef, {
    verificationStatus: status,
    updatedAt: Date.now()
  });
};

/**
 * Checks if a voter is verified
 */
export const isVoterVerified = async (uid: string): Promise<boolean> => {
  const voterRef = doc(db, 'voters', uid);
  const voterSnap = await getDoc(voterRef);

  if (voterSnap.exists()) {
    const voterData = voterSnap.data() as VoterProfile;
    return voterData.verificationStatus === VoterVerificationStatus.VERIFIED;
  }
  
  return false;
}; 