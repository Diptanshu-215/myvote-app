import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Image
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { updateVoterStatus, VoterVerificationStatus } from '../services/voterService';
import { useAuthState } from '../services/authService';
import * as ImagePicker from 'expo-image-picker';
import { uploadAadharImage, uploadAadharImageDirect, registerVoter, UploadResponse } from '../services/apiService';

export default function Register() {
  const router = useRouter();
  const { user } = useAuthState();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [aadharImageUrl, setAadharImageUrl] = useState('');
  const [blockchainAddress, setBlockchainAddress] = useState('');
  
  // Pre-populate user data from Google account if available
  const [firstName, setFirstName] = useState(user?.displayName ? user.displayName.split(' ')[0] : '');
  const [lastName, setLastName] = useState(user?.displayName ? (user.displayName.split(' ').slice(1).join(' ') || '') : '');
  const [fatherName, setFatherName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [aadharNumber, setAadharNumber] = useState('');
  const [gender, setGender] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [aadharImage, setAadharImage] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Generate a blockchain address
  useEffect(() => {
    const generatedAddress = '0x' + Array.from({length: 40}, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    setBlockchainAddress(generatedAddress);
  }, []);

  // Error states
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    fatherName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    dateOfBirth: '',
    aadharNumber: '',
    gender: '',
    phoneNumber: '',
    aadharImage: ''
  });

  // Function to handle image picking and upload
  const pickAadharImage = async () => {
    try {
      // Launch image picker with updated properties to fix deprecation warnings
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Use MediaTypeOptions as it is still available
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        
        if (!imageUri) {
          Alert.alert('Error', 'Selected image is invalid.');
          return;
        }
        
        setAadharImage(imageUri);
        
        // Clear any previous error
        setErrors(prev => ({ ...prev, aadharImage: '' }));
        
        // Make sure we have a blockchain address before attempting upload
        if (!blockchainAddress) {
          console.error('Missing blockchain address');
          Alert.alert('Error', 'Cannot upload image without blockchain address.');
          return;
        }
        
        console.log('Uploading image...');
        await uploadImage(imageUri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'There was a problem selecting or uploading your image.');
    }
  };
  
  // Function to upload the image
  const uploadImage = async (imageUri: string) => {
    if (!imageUri) {
      console.log('Missing image URI for upload');
      return;
    }
    
    setUploadingImage(true);
    
    try {
      // In development mode, just use the direct upload which now mocks the upload
      console.log('Using development mode for image upload');
      
      const response = await uploadAadharImageDirect(imageUri, blockchainAddress);
      console.log('Development mode upload response:', JSON.stringify(response));
      
      if (response && (response.fileUrl || response.filePath)) {
        const url = response.fileUrl || response.filePath || '';
        setAadharImageUrl(url);
        console.log('Set mock image URL for development:', url);
        
        // Inform user about development mode
        Alert.alert(
          'Development Mode', 
          'Using a mock image URL for development. In production, actual images will be uploaded.',
          [{ text: 'Continue' }]
        );
        
        setErrors(prev => ({ ...prev, aadharImage: '' }));
        return response;
      }
    } catch (error) {
      console.error('Error in development mode upload:', error);
      
      // Even in case of errors, generate a mock URL for development
      const mockUrl = `https://firebasestorage.googleapis.com/v0/b/my-vote.appspot.com/o/dev-mode-aadhar%2Fmock-${Date.now()}.jpg?alt=media`;
      setAadharImageUrl(mockUrl);
      setErrors(prev => ({ ...prev, aadharImage: '' }));
      
      Alert.alert(
        'Development Mode', 
        'Using a mock image URL despite upload errors. In production, this would be handled differently.',
        [{ text: 'Continue' }]
      );
      
      return {
        success: true,
        fileUrl: mockUrl,
        message: 'Development mode: Mock URL generated after error'
      };
    } finally {
      setUploadingImage(false);
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      firstName: '',
      lastName: '',
      fatherName: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      dateOfBirth: '',
      aadharNumber: '',
      gender: '',
      phoneNumber: '',
      aadharImage: ''
    };

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
      valid = false;
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
      valid = false;
    }

    if (!fatherName.trim()) {
      newErrors.fatherName = 'Father name is required';
      valid = false;
    }

    if (!address.trim()) {
      newErrors.address = 'Address is required';
      valid = false;
    }

    if (!city.trim()) {
      newErrors.city = 'City is required';
      valid = false;
    }

    if (!state.trim()) {
      newErrors.state = 'State is required';
      valid = false;
    }

    if (!zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
      valid = false;
    } else if (!/^\d{5}(-\d{4})?$/.test(zipCode.trim())) {
      newErrors.zipCode = 'Enter a valid ZIP code';
      valid = false;
    }

    if (!dateOfBirth.trim()) {
      newErrors.dateOfBirth = 'Date of birth is required';
      valid = false;
    } else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateOfBirth.trim())) {
      newErrors.dateOfBirth = 'Enter date in MM/DD/YYYY format';
      valid = false;
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
      valid = false;
    } else if (!/^\d{10}$/.test(phoneNumber.trim())) {
      newErrors.phoneNumber = 'Enter a valid 10-digit phone number';
      valid = false;
    }

    if (!gender.trim()) {
      newErrors.gender = 'Gender is required';
      valid = false;
    }

    if (!aadharNumber.trim()) {
      newErrors.aadharNumber = 'Aadhar number is required';
      valid = false;
    } else if (!/^\d{12}$/.test(aadharNumber.trim())) {
      newErrors.aadharNumber = 'Enter a valid 12-digit Aadhar number';
      valid = false;
    }

    if (!aadharImage) {
      newErrors.aadharImage = 'Aadhar card image is required';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to submit verification details.');
      return;
    }
    
    // Check if Aadhar image was uploaded and we have its URL
    if (!aadharImageUrl) {
      Alert.alert('Error', 'Please upload your Aadhar image before submitting.');
      return;
    }

    try {
      setLoading(true);
      
      // Format date of birth from MM/DD/YYYY to YYYY-MM-DD
      const [month, day, year] = dateOfBirth.split('/');
      const formattedDOB = `${year}-${month}-${day}`;
      
      // Prepare voter registration data
      const voterData = {
        address: blockchainAddress,
        name: `${firstName} ${lastName}`,
        gender: gender,
        dob: formattedDOB,
        city: city,
        state: state,
        aadharNumber: aadharNumber,
        phoneNumber: phoneNumber,
        email: user.email || '',
        aadharImageUrl: aadharImageUrl // Use the URL received from the upload step
      };
      
      console.log('Starting voter registration with data:', JSON.stringify(voterData));
      
      // Register voter
      const result = await registerVoter(voterData);
      
      console.log('Registration successful, result:', JSON.stringify(result));
      
      // Set voter status to PENDING
      await updateVoterStatus(user.uid, VoterVerificationStatus.PENDING);
      
      // Show success alert and redirect to home page after clicking OK
      Alert.alert(
        'Registration Successful',
        'Your voter registration has been submitted for verification.',
        [{ 
          text: "OK", 
          onPress: () => {
            // First redirect to index page
            router.replace('/');
            
            // Then navigate to pending page with the address
            setTimeout(() => {
              router.push({
                pathname: '/pending',
                params: { address: blockchainAddress }
              });
            }, 100);
          }
        }]
      );
    } catch (error) {
      console.error('Error submitting registration:', error);
      
      // More detailed error message
      let errorMessage = 'There was a problem submitting your registration.';
      if (error instanceof Error) {
        errorMessage += ' ' + error.message;
      }
      
      Alert.alert('Error', errorMessage + ' Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setTimeout(() => {
      router.back();
    }, 0);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleCancel}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Voter Verification</Text>
        <View style={styles.placeholderRight} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <Text style={styles.description}>
          Please provide your details exactly as they appear on your government-issued ID.
          This information will be verified against voter registration records.
        </Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={errors.firstName ? [styles.input, styles.inputError] : styles.input}
            placeholder="Enter your first name"
            value={firstName}
            onChangeText={setFirstName}
          />
          {errors.firstName ? <Text style={styles.errorText}>{errors.firstName}</Text> : null}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={errors.lastName ? [styles.input, styles.inputError] : styles.input}
            placeholder="Enter your last name"
            value={lastName}
            onChangeText={setLastName}
          />
          {errors.lastName ? <Text style={styles.errorText}>{errors.lastName}</Text> : null}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Father's Name</Text>
          <TextInput
            style={errors.fatherName ? [styles.input, styles.inputError] : styles.input}
            placeholder="Enter your father's name"
            value={fatherName}
            onChangeText={setFatherName}
          />
          {errors.fatherName ? <Text style={styles.errorText}>{errors.fatherName}</Text> : null}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Gender</Text>
          <TextInput
            style={errors.gender ? [styles.input, styles.inputError] : styles.input}
            placeholder="Enter your gender (Male/Female/Other)"
            value={gender}
            onChangeText={setGender}
          />
          {errors.gender ? <Text style={styles.errorText}>{errors.gender}</Text> : null}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={errors.phoneNumber ? [styles.input, styles.inputError] : styles.input}
            placeholder="Enter your 10-digit phone number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            maxLength={10}
          />
          {errors.phoneNumber ? <Text style={styles.errorText}>{errors.phoneNumber}</Text> : null}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Street Address</Text>
          <TextInput
            style={errors.address ? [styles.input, styles.inputError] : styles.input}
            placeholder="Enter your street address"
            value={address}
            onChangeText={setAddress}
          />
          {errors.address ? <Text style={styles.errorText}>{errors.address}</Text> : null}
        </View>

        <View style={styles.rowContainer}>
          <View style={[styles.formGroup, styles.halfWidth]}>
            <Text style={styles.label}>City</Text>
            <TextInput
              style={errors.city ? [styles.input, styles.inputError] : styles.input}
              placeholder="City"
              value={city}
              onChangeText={setCity}
            />
            {errors.city ? <Text style={styles.errorText}>{errors.city}</Text> : null}
          </View>

          <View style={[styles.formGroup, styles.halfWidth]}>
            <Text style={styles.label}>State</Text>
            <TextInput
              style={errors.state ? [styles.input, styles.inputError] : styles.input}
              placeholder="State"
              value={state}
              onChangeText={setState}
              maxLength={2}
            />
            {errors.state ? <Text style={styles.errorText}>{errors.state}</Text> : null}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>ZIP Code</Text>
          <TextInput
            style={errors.zipCode ? [styles.input, styles.inputError] : styles.input}
            placeholder="12345"
            keyboardType="numeric"
            value={zipCode}
            onChangeText={setZipCode}
            maxLength={10}
          />
          {errors.zipCode ? <Text style={styles.errorText}>{errors.zipCode}</Text> : null}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Date of Birth (MM/DD/YYYY)</Text>
          <TextInput
            style={errors.dateOfBirth ? [styles.input, styles.inputError] : styles.input}
            placeholder="MM/DD/YYYY"
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            keyboardType="numeric"
          />
          {errors.dateOfBirth ? <Text style={styles.errorText}>{errors.dateOfBirth}</Text> : null}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Aadhar Number</Text>
          <TextInput
            style={errors.aadharNumber ? [styles.input, styles.inputError] : styles.input}
            placeholder="Enter your 12-digit Aadhar number"
            value={aadharNumber}
            onChangeText={setAadharNumber}
            keyboardType="numeric"
            maxLength={12}
          />
          {errors.aadharNumber ? <Text style={styles.errorText}>{errors.aadharNumber}</Text> : null}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Aadhar Card Image</Text>
          <TouchableOpacity 
            style={errors.aadharImage ? [styles.imageUploadContainer, styles.inputError] : styles.imageUploadContainer} 
            onPress={pickAadharImage}
            disabled={uploadingImage}
          >
            {uploadingImage && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="large" color={Colors.light.tint} />
                <Text style={styles.uploadingText}>Uploading...</Text>
              </View>
            )}
            
            {aadharImage ? (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: aadharImage }} style={styles.imagePreview} />
                <TouchableOpacity 
                  style={styles.changeImageButton}
                  onPress={pickAadharImage}
                  disabled={uploadingImage}
                >
                  <Text style={styles.changeImageText}>Change Image</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Ionicons name="camera" size={40} color="#999" />
                <Text style={styles.uploadPlaceholderText}>Tap to upload Aadhar Card</Text>
              </View>
            )}
          </TouchableOpacity>
          {errors.aadharImage ? <Text style={styles.errorText}>{errors.aadharImage}</Text> : null}
        </View>

        <View style={styles.privacyNote}>
          <Ionicons name="shield-checkmark" size={20} color={Colors.light.tint} style={styles.privacyIcon} />
          <Text style={styles.privacyText}>
            Your information is protected and will only be used for voter verification purposes.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.submitButtonLarge}
            onPress={handleSubmit}
            disabled={loading || uploadingImage}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Submit for Verification</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={handleCancel}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    backgroundColor: Colors.light.tint,
    paddingTop: 60,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#e53935',
  },
  errorText: {
    color: '#e53935',
    fontSize: 12,
    marginTop: 4,
  },
  privacyNote: {
    flexDirection: 'row',
    backgroundColor: 'rgba(25, 118, 210, 0.08)',
    padding: 12,
    borderRadius: 8,
    marginVertical: 16,
    alignItems: 'center',
  },
  privacyIcon: {
    marginRight: 8,
  },
  privacyText: {
    flex: 1,
    fontSize: 12,
    color: '#555',
    lineHeight: 18,
  },
  buttonContainer: {
    marginVertical: 20,
  },
  submitButtonLarge: {
    backgroundColor: Colors.light.tint,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  imageUploadContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    minHeight: 180,
    overflow: 'hidden',
    position: 'relative',
  },
  uploadPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    height: 180,
  },
  uploadPlaceholderText: {
    marginTop: 10,
    color: '#999',
    textAlign: 'center',
  },
  imagePreviewContainer: {
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  changeImageButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  changeImageText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    marginTop: 10,
    color: Colors.light.tint,
    fontWeight: '600',
  },
}); 