import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useProperty } from '../../contexts/PropertyContext';
import toast from 'react-hot-toast';
import MapLocationPicker from './MapLocationPicker';
import api from '../../services/api';

// Validation schemas for each step
const step1Schema = yup.object({
  title: yup.string().required('Property name is required'),
  address: yup.string().required('Address is required'),
  area: yup.string().required('Area/Locality is required'),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
  pincode: yup.string().matches(/^\d{6}$/, 'Pincode must be 6 digits').required('Pincode is required'),
});

const step2Schema = yup.object({
  area: yup.number().min(1, 'Area must be at least 1 sq ft').required('Area is required'),
  price: yup.number().min(1, 'Monthly rent must be at least $1').required('Monthly rent is required'),
  bedrooms: yup.number().min(0, 'Bedrooms cannot be negative'),
  bathrooms: yup.number().min(0, 'Bathrooms cannot be negative'),
});

// Step 3 is images (no form validation needed)
// Step 4 is description
const step4Schema = yup.object({
  description: yup.string().min(50, 'Description must be at least 50 characters').required('Description is required'),
});

const AddPropertyModal = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [documents, setDocuments] = useState([]);
  const [propertyImages, setPropertyImages] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [amenities, setAmenities] = useState([]);
  const [usagePreferences, setUsagePreferences] = useState([]);
  const [customBusinessType, setCustomBusinessType] = useState('');
  const [hasOthersCustom, setHasOthersCustom] = useState(false);
  const [mapLocation, setMapLocation] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const { addProperty, loading } = useProperty();

  const getSchema = () => {
    switch (currentStep) {
      case 1: return step1Schema;
      case 2: return step2Schema;
      case 3: return yup.object({}); // Step 3 is images (no form validation)
      case 4: return step4Schema; // Step 4 is description
      case 5: return yup.object({}); // Step 5 is documents (no form validation)
      case 6: return yup.object({}); // Step 6 is phone verification (handled separately)
      default: return yup.object({});
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(getSchema()),
    defaultValues: formData,
  });

  const popularAmenities = [
    'WiFi', 'Parking', 'Security System', 'Elevator', 'Generator/Power Backup',
    'Water Supply', 'CCTV Surveillance', 'Reception/Front Desk', 'Conference Room',
    'Air Conditioning', 'Heating', 'Fire Safety System', 'Handicap Accessible',
    'Hospital Nearby', 'ATM Access', 'Market/Shopping Area', 'Petrol Pump',
    'Public Transport', 'Restaurant/Food Court', 'Loading Dock', 'Storage Space',
    'Natural Light', 'Ventilation System', 'Cafeteria', 'Cleaning Service',
    '24/7 Access', 'Maintenance Service', 'Washrooms', 'Kitchen/Pantry',
    'Green Spaces/Terrace Access', 'Police Station Nearby', 'Bank Nearby', 
    'Gym/Fitness Center', 'Pharmacy', 'EV Charging Station'
  ];

  const handleNext = (data) => {
    console.log('handleNext called, step:', currentStep, 'data:', data);
    console.log('Current formData before merge:', formData);
    
    // Validate usage preferences on step 1
    if (currentStep === 1 && usagePreferences.length === 0) {
      toast.error('Please select at least one preferred business type');
      return;
    }
    
    // Validate images on step 3
    if (currentStep === 3 && propertyImages.length === 0) {
      toast.error('Please upload at least one property image to continue');
      return;
    }
    
    // Merge current step data with existing formData
    const updatedFormData = { ...formData, ...data };
    console.log('Updated formData after merge:', updatedFormData);
    setFormData(updatedFormData);
    
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
      // Don't reset - we need to keep the data
      // reset();
    }
  };

  // Handle Next button click for Step 3 (bypass form validation)
  const handleStep3Next = (e) => {
    e.preventDefault();
    console.log('Step 3 Next clicked, images:', propertyImages.length);
    
    if (propertyImages.length === 0) {
      toast.error('Please upload at least one property image to continue');
      return;
    }
    
    setCurrentStep(4);
  };

  // Handle Submit button for Step 5 (bypass form validation, but check documents)
  const handleStep5Submit = (e) => {
    e.preventDefault();
    console.log('Step 5 Submit clicked, documents:', documents.length);
    
    if (documents.length === 0) {
      toast.error('Please upload at least one verification document to continue');
      return;
    }
    
    // Go to phone verification step
    setCurrentStep(6);
  };

  // Send OTP to phone number
  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      setVerifyingOtp(true);
      
      // Call backend API to send OTP
      const response = await api.post('/auth/send-otp', { 
        phone: `+91${phoneNumber}`,
        type: 'verification'
      });
      
      if (response.data.success) {
        setOtpSent(true);
        toast.success(`OTP sent to ${response.data.data.phone}`);
      } else {
        throw new Error(response.data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('OTP send error:', error);
      toast.error(error.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setVerifyingOtp(true);
      
      // Call backend API to verify OTP
      const response = await api.post('/auth/verify-otp', { 
        phone: `+91${phoneNumber}`,
        otp: otp,
        type: 'verification'
      });
      
      if (response.data.success) {
        setOtpVerified(true);
        toast.success('Phone number verified successfully!');
      } else {
        throw new Error(response.data.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error(error.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Handle final submit after phone verification
  const handleStep6Submit = (e) => {
    e.preventDefault();
    
    if (!otpVerified) {
      toast.error('Please verify your phone number before submitting');
      return;
    }
    
    handleFinalSubmit({});
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      reset(formData); // Restore previous data
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Validate file types
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      toast.error('Please upload only PDF, DOC, DOCX, or image files');
      return;
    }
    
    // Validate file sizes (max 10MB per document)
    const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024);
    
    if (oversizedFiles.length > 0) {
      toast.error('Documents must be under 10MB each');
      return;
    }
    
    setUploadingImages(true); // Reuse the loading state
    
    try {
      // Upload documents to Cloudinary
      const uploadedDocs = [];
      
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'connectspace_properties');
        formData.append('folder', 'properties/documents'); // Separate folder for documents
        formData.append('resource_type', 'auto'); // Auto-detect file type
        
        const cloudinaryUrl = 'https://api.cloudinary.com/v1_1/dljvt4fkw/auto/upload';
        
        const response = await fetch(cloudinaryUrl, {
          method: 'POST',
          body: formData
        });
        
        const data = await response.json();
        
        if (data.secure_url) {
          uploadedDocs.push({
            name: file.name,
            size: file.size,
            type: file.type,
            url: data.secure_url,
            publicId: data.public_id
          });
        }
      }
      
      setDocuments(prevDocs => [...prevDocs, ...uploadedDocs]);
      toast.success(`${files.length} document(s) uploaded successfully!`);
      
    } catch (error) {
      console.error('Document upload error:', error);
      toast.error('Failed to upload documents. Please try again.');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      toast.error('Please upload only images (JPG, PNG, WebP) or videos (MP4, WebM)');
      return;
    }
    
    // Validate file sizes (max 10MB for images, 50MB for videos)
    const oversizedFiles = files.filter(file => {
      const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
      return file.size > maxSize;
    });
    
    if (oversizedFiles.length > 0) {
      toast.error('Images must be under 10MB, videos under 50MB');
      return;
    }
    
    setUploadingImages(true);
    
    try {
      // Create preview URLs
      const previews = files.map(file => URL.createObjectURL(file));
      setImagePreviewUrls(prev => [...prev, ...previews]);
      
      // Upload to Cloudinary
      const uploadedUrls = [];
      
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'connectspace_properties'); // ⚠️ STEP 3: Create this preset in Cloudinary (see CLOUDINARY_VISUAL_GUIDE.md)
        formData.append('folder', 'properties');
        
        // ⚠️ STEP 4: Replace YOUR_CLOUD_NAME with your actual Cloudinary cloud name below
        // Example: If your cloud name is "democloud123", change both URLs to:
        // 'https://api.cloudinary.com/v1_1/democloud123/video/upload'
        // 'https://api.cloudinary.com/v1_1/democloud123/image/upload'
        const cloudinaryUrl = file.type.startsWith('video/')
          ? 'https://api.cloudinary.com/v1_1/dljvt4fkw/video/upload'
          : 'https://api.cloudinary.com/v1_1/dljvt4fkw/image/upload';
        
        const response = await fetch(cloudinaryUrl, {
          method: 'POST',
          body: formData
        });
        
        const data = await response.json();
        
        if (data.secure_url) {
          uploadedUrls.push({
            url: data.secure_url,
            publicId: data.public_id,
            type: file.type.startsWith('video/') ? 'video' : 'image'
          });
        }
      }
      
      setPropertyImages(prev => [...prev, ...uploadedUrls]);
      toast.success(`${files.length} file(s) uploaded successfully!`);
      
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload images. Please try again.');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index) => {
    setPropertyImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
    toast.success('Image removed');
  };

  const toggleAmenity = (amenity) => {
    setAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleFinalSubmit = async (data) => {
    console.log('🔵 handleFinalSubmit called with data:', data);
    console.log('🔵 formData:', formData);
    console.log('🔵 amenities:', amenities);
    console.log('🔵 usagePreferences:', usagePreferences);
    console.log('🔵 documents:', documents);
    console.log('🔵 propertyImages:', propertyImages);
    
    const finalData = {
      ...formData,
      ...data,
      amenities,
      usagePreferences,
      customBusinessType: hasOthersCustom ? customBusinessType : null,
      documents: documents.map(doc => ({
        name: doc.name,
        size: doc.size,
        type: doc.type,
        url: doc.url,
        publicId: doc.publicId
      })),
      location: `${formData.address}, ${formData.city}, ${formData.pincode}`,
      images: propertyImages.map(img => img.url), // Extract URLs for backend
      imageDetails: propertyImages, // Full details including publicId for future management
    };

    try {
      console.log('🚀 Submitting property data:', finalData);
      const result = await addProperty(finalData);
      console.log('📝 AddProperty result:', result);
      
      if (result.success) {
        toast.success('Property added successfully!');
        onClose();
        resetForm();
      } else {
        console.error('❌ Property creation failed:', result.error);
        toast.error(result.error || 'Failed to add property. Please try again.');
      }
    } catch (error) {
      console.error('❌ Property submission error:', error);
      toast.error(error.message || 'An error occurred. Please try again.');
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({});
    setDocuments([]);
    setPropertyImages([]);
    setImagePreviewUrls([]);
    setAmenities([]);
    setUsagePreferences([]);
    setCustomBusinessType('');
    setHasOthersCustom(false);
    reset();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Property Name/Title *
        </label>
        <input
          {...register('title')}
          type="text"
          placeholder="e.g., Modern Office Space in Business District"
          className="input"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* Property Types & Business Preferences */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Preferred Business Types (What kind of businesses do you want to rent to?) *
        </label>
        <div className="space-y-2">
          {/* Anyone/No Preferences Option - TOP OF LIST */}
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              checked={usagePreferences.includes('Anyone (No Preferences)')}
              onChange={() => {
                const anyoneOption = 'Anyone (No Preferences)';
                setUsagePreferences(prev => 
                  prev.includes(anyoneOption)
                    ? prev.filter(u => u !== anyoneOption)
                    : [...prev, anyoneOption]
                );
              }}
            />
            <span className="ml-2 text-sm text-gray-700 font-medium">Anyone (No Preferences)</span>
          </label>
          
          {/* Separator line for visual clarity */}
          <div className="border-t border-gray-200 my-2"></div>
          
          {[
            'Retail',
            'Industrial', 
            'Office Buildings',
            'F&B Spaces (Food & Beverage)',
            'Warehousing & Storage',
            'Wellness & Fitness Studios',
            'Training & Coaching Center',
            'Mixed-Use Commercial Floors',
            'Studio & Creative Spaces',
            'Diagnostic Centers',
            'Spas & Wellness Retreats',
            'Office & Corporate',
            'Healthcare & Medical',
            'Education & Training',
            'Fitness & Wellness',
            'Creative & Studios',
            'Technology & IT',
            'Manufacturing & Industrial'
          ].map((usage) => (
            <label key={usage} className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                checked={usagePreferences.includes(usage)}
                onChange={() => {
                  setUsagePreferences(prev => 
                    prev.includes(usage)
                      ? prev.filter(u => u !== usage)
                      : [...prev, usage]
                  );
                }}
              />
              <span className="ml-2 text-sm text-gray-700">{usage}</span>
            </label>
          ))}
          
          {/* Others/Custom Option */}
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              checked={hasOthersCustom}
              onChange={() => {
                setHasOthersCustom(!hasOthersCustom);
                if (hasOthersCustom) {
                  setCustomBusinessType('');
                  setUsagePreferences(prev => prev.filter(u => !u.startsWith('Others/Custom:')));
                }
              }}
            />
            <span className="ml-2 text-sm text-gray-700">Others/Custom</span>
          </label>
          
          {/* Custom Business Type Input */}
          {hasOthersCustom && (
            <div className="ml-6 mt-2">
              <input
                type="text"
                className="input"
                placeholder="e.g., Coworking Space, Event Venue, etc."
                value={customBusinessType}
                onChange={(e) => {
                  setCustomBusinessType(e.target.value);
                  const customValue = `Others/Custom: ${e.target.value}`;
                  setUsagePreferences(prev => {
                    const filtered = prev.filter(u => !u.startsWith('Others/Custom:'));
                    return e.target.value ? [...filtered, customValue] : filtered;
                  });
                }}
              />
            </div>
          )}
        </div>
        {usagePreferences.length === 0 && (
          <p className="mt-1 text-sm text-gray-500">Please select at least one preferred business type</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Address *
        </label>
        <input
          {...register('address')}
          type="text"
          placeholder="Street address, building name, floor"
          className="input"
        />
        {errors.address && (
          <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Area/Locality *
          </label>
          <input
            {...register('area')}
            type="text"
            placeholder="e.g., Bandra West, Andheri East"
            className="input"
          />
          {errors.area && (
            <p className="mt-1 text-sm text-red-600">{errors.area.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City *
          </label>
          <input
            {...register('city')}
            type="text"
            placeholder="e.g., Mumbai, Delhi, Bangalore"
            className="input"
          />
          {errors.city && (
            <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            State *
          </label>
          <input
            {...register('state')}
            type="text"
            placeholder="e.g., Maharashtra, Delhi, Karnataka"
            className="input"
          />
          {errors.state && (
            <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pincode *
          </label>
          <input
            {...register('pincode')}
            type="text"
            placeholder="6-digit pincode"
            className="input"
          />
          {errors.pincode && (
            <p className="mt-1 text-sm text-red-600">{errors.pincode.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Landmark (Optional)
        </label>
        <input
          {...register('landmark')}
          type="text"
          placeholder="e.g., Near Metro Station, Opposite Mall"
          className="input"
        />
      </div>

      {/* Map Location Picker */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          📍 Pin Location on Map (Optional)
        </label>
        <MapLocationPicker
          initialLat={28.6139}
          initialLng={77.2090}
          onLocationSelect={(location) => {
            setMapLocation(location);
            console.log('Map location selected:', location);
          }}
        />
        <p className="mt-2 text-xs text-gray-500">
          💡 Tip: Setting the exact location helps tenants find your property easily
        </p>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Specifications</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Size (sq. ft.) *
          </label>
          <input
            {...register('area', { valueAsNumber: true })}
            type="number"
            placeholder="e.g., 1200"
            className="input"
          />
          {errors.area && (
            <p className="mt-1 text-sm text-red-600">{errors.area.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monthly Rent ($) *
          </label>
          <input
            {...register('price', { valueAsNumber: true })}
            type="number"
            placeholder="e.g., 2500"
            className="input"
          />
          {errors.price && (
            <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Floors
          </label>
          <input
            {...register('floors', { valueAsNumber: true })}
            type="number"
            placeholder="Number of floors"
            className="input"
            min="1"
            defaultValue="1"
          />
          {errors.floors && (
            <p className="mt-1 text-sm text-red-600">{errors.floors.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Parking Spaces
          </label>
          <input
            {...register('parkingSpaces', { valueAsNumber: true })}
            type="number"
            placeholder="Number of parking spaces"
            className="input"
            min="0"
            defaultValue="0"
          />
          {errors.parkingSpaces && (
            <p className="mt-1 text-sm text-red-600">{errors.parkingSpaces.message}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Images & Videos</h3>
      
      {/* Upload Section */}
      <div className="border-2 border-dashed border-teal-300 rounded-lg p-6 bg-teal-50/30">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-teal-600" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="mt-4">
            <label htmlFor="image-upload" className="cursor-pointer">
              <span className="mt-2 block text-sm font-medium text-teal-900">
                Upload Property Images/Videos *
              </span>
              <p className="text-xs text-teal-700 mt-1">
                JPG, PNG, WebP (max 10MB) | MP4, WebM (max 50MB)
              </p>
              <p className="text-xs text-teal-600 mt-1">
                Upload multiple files to showcase your property
              </p>
            </label>
            <input
              id="image-upload"
              name="image-upload"
              type="file"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/webm"
              onChange={handleImageUpload}
              disabled={uploadingImages}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => document.getElementById('image-upload').click()}
              disabled={uploadingImages}
              className="mt-4 px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadingImages ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Uploading...
                </span>
              ) : (
                'Choose Files'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      {propertyImages.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Uploaded Media ({propertyImages.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {propertyImages.map((img, index) => (
              <div key={index} className="relative group rounded-lg overflow-hidden border-2 border-gray-200 hover:border-teal-500 transition-colors">
                {img.type === 'video' ? (
                  <video
                    src={img.url}
                    className="w-full h-32 object-cover"
                    controls
                  />
                ) : (
                  <img
                    src={img.url}
                    alt={`Property ${index + 1}`}
                    className="w-full h-32 object-cover"
                  />
                )}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                  title="Remove"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <span className="text-xs text-white font-medium">
                    {img.type === 'video' ? '🎥 Video' : '📷 Image'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {propertyImages.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">No media uploaded yet</p>
          <p className="text-xs text-gray-400 mt-1">Please upload at least one image to continue</p>
        </div>
      )}

      {/* Hidden field to make form submittable */}
      <input type="hidden" {...register('images')} value={propertyImages.length} />
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Description & Amenities</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Property Description *
        </label>
        <textarea
          {...register('description')}
          rows={4}
          placeholder="Provide a detailed description of your property, including key features, location benefits, and any special characteristics..."
          className="input"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">Minimum 50 characters required</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Amenities & Features
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {popularAmenities.map((amenity) => (
            <label
              key={amenity}
              className="flex items-center space-x-2 p-2 rounded border hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={amenities.includes(amenity)}
                onChange={() => toggleAmenity(amenity)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">{amenity}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Selected amenities: {amenities.length}
        </p>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="text-sm font-semibold text-amber-900">Admin Verification Documents</h4>
            <p className="text-xs text-amber-700 mt-1">
              These documents are only visible to administrators for property verification. They will not be shown to users.
            </p>
          </div>
        </div>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Upload (For Admin Verification)</h3>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="mt-4">
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="mt-2 block text-sm font-medium text-gray-900">
                Upload Verification Documents *
              </span>
              <p className="text-xs text-gray-500">Sale Deed, Property Tax Receipt, NOC, etc.</p>
            </label>
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={handleFileUpload}
              className="sr-only"
            />
          </div>
          <p className="text-xs text-gray-500">
            PDF, DOC, or image files up to 10MB each
          </p>
        </div>
      </div>

      {documents.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h4>
          <ul className="space-y-1">
            {documents.map((file, index) => (
              <li key={index} className="flex justify-between items-center text-sm text-gray-600 bg-gray-50 p-2 rounded">
                <span>{file.name}</span>
                <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-800">
              <strong>Document Verification:</strong> All uploaded documents will be manually verified by our team within 24-48 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>
          <div>
            <h4 className="text-sm font-semibold text-blue-900">Phone Verification Required</h4>
            <p className="text-xs text-blue-700 mt-1">
              We need to verify your phone number to ensure the authenticity of property listings and enable direct contact with potential tenants.
            </p>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-4">Verify Your Phone Number</h3>

      <div className="space-y-4">
        {/* Phone Number Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mobile Number *
          </label>
          <div className="flex gap-2">
            <div className="flex items-center bg-gray-100 px-3 rounded-lg border border-gray-300">
              <span className="text-gray-700 font-medium">+91</span>
            </div>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                setPhoneNumber(value);
              }}
              placeholder="Enter 10-digit mobile number"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              disabled={otpSent}
              maxLength={10}
            />
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={otpSent || phoneNumber.length !== 10 || verifyingOtp}
              className={`px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${
                otpSent
                  ? 'bg-green-100 text-green-700 cursor-not-allowed'
                  : phoneNumber.length === 10
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {verifyingOtp ? 'Sending...' : otpSent ? '✓ Sent' : 'Send OTP'}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            We'll send a 6-digit OTP to this number for verification
          </p>
        </div>

        {/* OTP Input */}
        {otpSent && !otpVerified && (
          <div className="animate-fade-in">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter OTP *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtp(value);
                }}
                placeholder="Enter 6-digit OTP"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-center text-lg tracking-widest"
                maxLength={6}
              />
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={otp.length !== 6 || verifyingOtp}
                className={`px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  otp.length === 6
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {verifyingOtp ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                Didn't receive OTP?
              </p>
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtp('');
                  toast.info('You can resend OTP now');
                }}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Resend OTP
              </button>
            </div>
          </div>
        )}

        {/* Verification Success */}
        {otpVerified && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-green-900">Phone Number Verified!</h4>
                <p className="text-xs text-green-700">
                  Your phone number +91 {phoneNumber} has been successfully verified.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-800">
              <strong>Privacy Note:</strong> Your phone number will only be used for property-related communication and won't be shared publicly without your consent.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderStep6();
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Add New Property</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between items-center mb-8">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium ${
                step <= currentStep ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step}
              </div>
              {step < 6 && (
                <div className={`w-8 h-1 mx-1 ${
                  step < currentStep ? 'bg-teal-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={
          currentStep === 3 ? handleStep3Next : 
          currentStep === 5 ? handleStep5Submit :
          currentStep === 6 ? handleStep6Submit :
          handleSubmit(handleNext)
        }>
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                currentStep === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Previous
            </button>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || (currentStep === 5 && documents.length === 0) || (currentStep === 6 && !otpVerified)}
                className="px-6 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </div>
                ) : currentStep === 6 ? 'Submit Property' : currentStep === 5 ? 'Continue to Phone Verification' : 'Next'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPropertyModal;
