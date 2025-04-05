import React, { useState } from 'react';
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

export default function Register() {
  const router = useRouter();
  const { user } = useAuthState();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [aadharNumber, setAadharNumber] = useState('');
  const [aadharImage, setAadharImage] = useState<string | null>(null);

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
    aadharImage: ''
  });

  // Function to handle image picking
  const pickAadharImage = async () => {
    try {
      // Launch image picker without explicit permission checks
      // ImagePicker will handle permission requests internally
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAadharImage(result.assets[0].uri);
        // Clear any previous error
        setErrors(prev => ({ ...prev, aadharImage: '' }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'There was a problem uploading your image.');
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

    try {
      setLoading(true);
      
      // For now, just collect the form data
      // In a real app, you would upload the image to storage and save the URL
      const formData = {
        firstName,
        lastName,
        fatherName,
        address,
        city,
        state,
        zipCode,
        dateOfBirth,
        aadharNumber,
        aadharImageUri: aadharImage,
        submittedAt: new Date().toISOString()
      };
      
      console.log('Form data submitted:', formData);
      
      // Set voter status to PENDING
      await updateVoterStatus(user.uid, VoterVerificationStatus.PENDING);
      
      Alert.alert(
        'Verification Submitted',
        'Your verification details have been submitted successfully. Your status is now pending verification.',
        [
          { 
            text: 'OK', 
            onPress: () => {
              setTimeout(() => {
                router.replace('/');
              }, 0);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error submitting verification:', error);
      Alert.alert('Error', 'There was a problem submitting your verification. Please try again.');
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
          >
            {aadharImage ? (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: aadharImage }} style={styles.imagePreview} />
                <TouchableOpacity 
                  style={styles.changeImageButton}
                  onPress={pickAadharImage}
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
            disabled={loading}
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
}); 