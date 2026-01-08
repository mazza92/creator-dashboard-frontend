import React, { useState, useEffect } from 'react';
import { apiClient } from '../config/api';
import { FaGift, FaCheckCircle, FaSearch, FaUser, FaArrowRight, FaFileContract } from 'react-icons/fa';
import { Input, Avatar, message } from 'antd';
import PRPartnershipAgreement from './PRPartnershipAgreement';

const PR_CATEGORIES = [
  'Skincare & Beauty',
  'Fashion & Style',
  'Tech & Gadgets',
  'Wellness & Fitness',
  'Food & Nutrition',
  'Travel & Adventure',
  'Gaming',
  'Sustainable/Eco',
  'Parenting & Family',
  'Home & Lifestyle',
  'Music & Entertainment',
  'Sports & Outdoors',
  'Health & Medical',
  'Finance & Business',
  'Arts & Crafts',
  'Education',
  'Automotive',
  'Pet Products',
  'Books & Literature',
  'Photography'
];

const DELIVERABLE_OPTIONS = [
  '1 x TikTok Video (1 min)',
  '1 x Instagram Reel (1 min)',
  '1 x Instagram Post (Static)',
  '3 x Story Frames with Link',
  '1 x YouTube Short (1 min)',
  '1 x YouTube Video (5+ min)',
  '1 x Twitter/X Post',
  '1 x Facebook Post'
];

const CreatePROffer = ({ onClose, onSuccess, preselectedCreatorId }) => {
  const [step, setStep] = useState(1); // 1: Offer Details, 2: Match Creators, 3: Select Creators
  const [formData, setFormData] = useState({
    offer_title: '',
    products_offered: '',
    products_value: '',
    deliverables_required: [],
    mandatory_requirements: '',
    content_deadline_days: 14,
    target_categories: []
  });
  const [matchedCreators, setMatchedCreators] = useState(null);
  const [checkingMatches, setCheckingMatches] = useState(false);
  const [selectedCreators, setSelectedCreators] = useState([]);
  const [creatorSearch, setCreatorSearch] = useState('');
  const [filteredCreators, setFilteredCreators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAgreementPreview, setShowAgreementPreview] = useState(false);
  const [brandName, setBrandName] = useState('');
  const matchCheckTimeoutRef = React.useRef(null);

  // Fetch brand name
  useEffect(() => {
    const fetchBrandName = async () => {
      try {
        const response = await apiClient.get('/profile');
        if (response.data?.name) {
          setBrandName(response.data.name);
        } else if (response.data?.brand_name) {
          setBrandName(response.data.brand_name);
        }
      } catch (err) {
        console.error('Error fetching brand name:', err);
      }
    };
    fetchBrandName();
  }, []);

  // Store preselected creator (from marketplace) - don't auto-select, just store for later
  const [preselectedCreator, setPreselectedCreator] = React.useState(null);
  
  useEffect(() => {
    if (preselectedCreatorId && !preselectedCreator) {
      const fetchPreselectedCreator = async () => {
        try {
          console.log('🔍 Fetching preselected creator with ID:', preselectedCreatorId);
          
          // Use /creators endpoint to get all creators and find the one we need
          const response = await apiClient.get('/creators');
          console.log('📥 Creators API response:', response.data);
          
          let creator = null;
          
          if (response.status === 200 && response.data) {
            const creators = Array.isArray(response.data) ? response.data : [];
            // Find the creator with matching ID
            const creatorData = creators.find(c => 
              String(c.id) === String(preselectedCreatorId) || 
              Number(c.id) === Number(preselectedCreatorId) ||
              String(c.creator_id) === String(preselectedCreatorId) ||
              Number(c.creator_id) === Number(preselectedCreatorId)
            );
            
            if (creatorData) {
              creator = {
                id: creatorData.id || creatorData.creator_id,
                username: creatorData.username,
                name: creatorData.username || creatorData.name || `${creatorData.first_name || ''} ${creatorData.last_name || ''}`.trim(),
                image_profile: creatorData.image_profile || creatorData.profile_pic,
                followers_count: creatorData.followers_count || 0
              };
            }
          }
          
          // Fallback: try marketplace endpoint
          if (!creator) {
            console.log('⚠️ Creators endpoint did not return creator, trying marketplace endpoint');
            const marketplaceResponse = await apiClient.get(`/api/marketplace/creators?public=true`);
            console.log('📥 Marketplace API response:', marketplaceResponse.data);
            
            if (marketplaceResponse.status === 200 && marketplaceResponse.data) {
              const creators = marketplaceResponse.data.creators || [];
              const creatorData = creators.find(c => 
                String(c.id) === String(preselectedCreatorId) || 
                Number(c.id) === Number(preselectedCreatorId)
              );
              
              if (creatorData) {
                creator = {
                  id: creatorData.id,
                  username: creatorData.username,
                  name: creatorData.username || creatorData.name || `${creatorData.first_name || ''} ${creatorData.last_name || ''}`.trim(),
                  image_profile: creatorData.image_profile || creatorData.profile_pic,
                  followers_count: creatorData.followers_count || 0
                };
              }
            }
          }
          
          if (creator && creator.id) {
            console.log('✅ Preselected creator fetched successfully:', creator);
            setPreselectedCreator(creator);
          } else {
            console.error('❌ Failed to fetch preselected creator - creator not found in response');
          }
        } catch (err) {
          console.error('❌ Error fetching preselected creator:', err);
          // Don't show error - just continue without preselection
        }
      };
      fetchPreselectedCreator();
    }
  }, [preselectedCreatorId, preselectedCreator]);

  // Check matched creators when categories change (only in step 1)
  useEffect(() => {
    // Only check matches when we're on step 1
    if (step !== 1) {
      return;
    }
    
    if (formData.target_categories.length > 0) {
      if (matchCheckTimeoutRef.current) {
        clearTimeout(matchCheckTimeoutRef.current);
      }
      matchCheckTimeoutRef.current = setTimeout(() => {
        checkMatchedCreators(formData.target_categories);
      }, 500);
    } else {
      // Only clear matchedCreators if we're on step 1 and categories are cleared
      setMatchedCreators(null);
    }

    return () => {
      if (matchCheckTimeoutRef.current) {
        clearTimeout(matchCheckTimeoutRef.current);
      }
    };
  }, [formData.target_categories, step]);

  // Initialize filteredCreators when step changes to 2 or matchedCreators changes
  useEffect(() => {
    if (step === 2) {
      if (matchedCreators && matchedCreators.creators && matchedCreators.creators.length > 0) {
        let creatorsToShow = [...matchedCreators.creators];
        
        // If we have a preselected creator, ensure it's in the list and selected
        if (preselectedCreator) {
          // Check if preselected creator is in the matched creators list (compare by ID)
          const foundCreator = matchedCreators.creators.find(c => 
            String(c.id) === String(preselectedCreator.id) || 
            Number(c.id) === Number(preselectedCreator.id)
          );
          
          if (foundCreator) {
            // Use the creator from matched list (to ensure same structure)
            setFilteredCreators(creatorsToShow);
            // Force select the preselected creator
            console.log('✅ Selecting preselected creator in useEffect (found in matched):', foundCreator);
            setSelectedCreators([foundCreator]);
          } else {
            // If not in matched list, add it anyway (user came from marketplace)
            creatorsToShow = [...matchedCreators.creators, preselectedCreator];
            setFilteredCreators(creatorsToShow);
            // Force select the preselected creator
            console.log('✅ Selecting preselected creator in useEffect (not in matched, adding):', preselectedCreator);
            setSelectedCreators([preselectedCreator]);
          }
        } else {
          setFilteredCreators(creatorsToShow);
        }
      } else if (preselectedCreator) {
        // If we have a preselected creator but no matched creators yet, 
        // show just the preselected creator
        setFilteredCreators([preselectedCreator]);
        // Force select the preselected creator
        console.log('✅ Selecting preselected creator in useEffect (no matched creators):', preselectedCreator);
        setSelectedCreators([preselectedCreator]);
      }
    }
  }, [step, matchedCreators, preselectedCreator]);

  // Debug: Log when selectedCreators changes
  useEffect(() => {
    console.log('📊 selectedCreators changed:', selectedCreators.map(c => ({ id: c.id, username: c.username, idType: typeof c.id })));
  }, [selectedCreators]);

  // Filter creators when search changes
  useEffect(() => {
    if (matchedCreators && matchedCreators.creators) {
      if (!creatorSearch || creatorSearch.length < 2) {
        setFilteredCreators(matchedCreators.creators);
      } else {
        const searchLower = creatorSearch.toLowerCase();
        const filtered = matchedCreators.creators.filter(c =>
          c.username.toLowerCase().includes(searchLower) ||
          (c.name && c.name.toLowerCase().includes(searchLower))
        );
        // If we have a preselected creator and it's not in the filtered results, add it
        if (preselectedCreator) {
          const preselectedInFiltered = filtered.some(c => 
            String(c.id) === String(preselectedCreator.id) || 
            Number(c.id) === Number(preselectedCreator.id)
          );
          if (!preselectedInFiltered) {
            filtered.push(preselectedCreator);
          }
        }
        setFilteredCreators(filtered);
      }
    }
  }, [creatorSearch, matchedCreators, preselectedCreator]);

  const checkMatchedCreators = async (categories) => {
    if (!categories || categories.length === 0) {
      setMatchedCreators(null);
      return;
    }
    
    setCheckingMatches(true);
    try {
      const response = await apiClient.post('/api/pr-offers/matched-creators', {
        target_categories: categories
      });
      if (response.status === 200) {
        setMatchedCreators(response.data);
        // Auto-populate filtered creators
        if (response.data.creators && response.data.creators.length > 0) {
          setFilteredCreators(response.data.creators);
        } else {
          setFilteredCreators([]);
        }
      }
    } catch (err) {
      console.error('Error checking matched creators:', err);
    } finally {
      setCheckingMatches(false);
    }
  };

  const handleCategoryToggle = (category) => {
    setFormData(prev => {
      const isSelected = prev.target_categories.includes(category);
      return {
        ...prev,
        target_categories: isSelected
          ? prev.target_categories.filter(c => c !== category)
          : [...prev.target_categories, category]
      };
    });
  };

  const handleDeliverableChange = (deliverable) => {
    setFormData(prev => {
      const isSelected = prev.deliverables_required.includes(deliverable);
      return {
        ...prev,
        deliverables_required: isSelected
          ? prev.deliverables_required.filter(d => d !== deliverable)
          : [...prev.deliverables_required, deliverable]
      };
    });
  };

  const handleToggleCreator = (creator) => {
    setSelectedCreators(prev => {
      // Compare IDs robustly (handle string vs number)
      const isSelected = prev.some(c => 
        String(c.id) === String(creator.id) || 
        Number(c.id) === Number(creator.id)
      );
      if (isSelected) {
        return prev.filter(c => 
          String(c.id) !== String(creator.id) && 
          Number(c.id) !== Number(creator.id)
        );
      } else {
        return [...prev, creator];
      }
    });
  };

  const handleNext = async () => {
    if (step === 1) {
      // Validate offer details
      if (!formData.offer_title || !formData.products_offered || formData.deliverables_required.length === 0) {
        setError('Please fill in all required fields');
        return;
      }
      
      setError(null);
      
      // If no categories selected, fetch all public creators
      if (formData.target_categories.length === 0) {
        setCheckingMatches(true);
        try {
          // Fetch all public creators
          const response = await apiClient.get('/creators');
          if (response.status === 200) {
            const allCreators = (response.data || []).filter(c => c.public_profile_enabled !== false);
            const mappedCreators = allCreators.map(c => ({
              id: c.id,
              username: c.username,
              name: c.name || c.username,
              image_profile: c.image_profile,
              followers_count: c.followers_count || 0
            }));
            
            // If we have a preselected creator, ensure it's in the list
            let finalCreators = [...mappedCreators];
            if (preselectedCreator) {
              const exists = mappedCreators.some(c => 
                String(c.id) === String(preselectedCreator.id) || 
                Number(c.id) === Number(preselectedCreator.id)
              );
              if (!exists) {
                finalCreators = [...mappedCreators, preselectedCreator];
              }
            }
            
            setMatchedCreators({
              count: finalCreators.length,
              message: `We found ${finalCreators.length} creator${finalCreators.length !== 1 ? 's' : ''} with public profiles.`,
              creators: finalCreators
            });
            setFilteredCreators(finalCreators);
            
            // Select the preselected creator if we have one
            if (preselectedCreator) {
              const foundCreator = finalCreators.find(c => 
                String(c.id) === String(preselectedCreator.id) || 
                Number(c.id) === Number(preselectedCreator.id)
              );
              if (foundCreator) {
                console.log('✅ Selecting preselected creator in handleNext (no categories):', foundCreator);
                setSelectedCreators([foundCreator]);
              } else {
                console.log('⚠️ Preselected creator not found in finalCreators, adding it:', preselectedCreator);
                setSelectedCreators([preselectedCreator]);
              }
            }
          }
        } catch (err) {
          console.error('Error fetching all creators:', err);
          setError('Failed to load creators. Please try again.');
          return;
        } finally {
          setCheckingMatches(false);
        }
      } else {
        // Categories are selected - ensure we have matched creators
        if (!matchedCreators || !matchedCreators.creators || matchedCreators.creators.length === 0) {
          // Fetch matched creators now (in case debounce didn't complete)
          setCheckingMatches(true);
          try {
            const response = await apiClient.post('/api/pr-offers/matched-creators', {
              target_categories: formData.target_categories
            });
            if (response.status === 200) {
              const matchData = response.data;
              console.log('Fetched matched creators in handleNext:', matchData);
              
              // If we have a preselected creator, ensure it's in the list
              let finalCreators = matchData.creators || [];
              if (preselectedCreator && finalCreators.length > 0) {
                const exists = finalCreators.some(c => 
                  String(c.id) === String(preselectedCreator.id) || 
                  Number(c.id) === Number(preselectedCreator.id)
                );
                if (!exists) {
                  finalCreators = [...finalCreators, preselectedCreator];
                }
              }
              
              setMatchedCreators({
                ...matchData,
                creators: finalCreators
              });
              setFilteredCreators(finalCreators);
              
              // Select the preselected creator if we have one
              if (preselectedCreator && finalCreators.length > 0) {
                const foundCreator = finalCreators.find(c => 
                  String(c.id) === String(preselectedCreator.id) || 
                  Number(c.id) === Number(preselectedCreator.id)
                );
                if (foundCreator) {
                  console.log('✅ Selecting preselected creator in handleNext (with categories):', foundCreator);
                  setSelectedCreators([foundCreator]);
                } else {
                  console.log('⚠️ Preselected creator not found in finalCreators, adding it:', preselectedCreator);
                  setSelectedCreators([preselectedCreator]);
                }
              }
              
              // If no matches found, offer to show all creators
              if (matchData.count === 0 || !matchData.creators || matchData.creators.length === 0) {
                if (!window.confirm('No creators found matching your categories. This offer will be visible to all creators. Continue?')) {
                  setCheckingMatches(false);
                  return;
                }
                // Fetch all creators as fallback
                const allResponse = await apiClient.get('/creators');
                if (allResponse.status === 200) {
                  const allCreators = (allResponse.data || []).filter(c => c.public_profile_enabled !== false);
                  setMatchedCreators({
                    count: allCreators.length,
                    message: `Showing all ${allCreators.length} creator${allCreators.length !== 1 ? 's' : ''} with public profiles.`,
                    creators: allCreators.map(c => ({
                      id: c.id,
                      username: c.username,
                      name: c.name || c.username,
                      image_profile: c.image_profile,
                      followers_count: c.followers_count || 0
                    }))
                  });
                  setFilteredCreators(allCreators.map(c => ({
                    id: c.id,
                    username: c.username,
                    name: c.name || c.username,
                    image_profile: c.image_profile,
                    followers_count: c.followers_count || 0
                  })));
                }
              }
            }
          } catch (err) {
            console.error('Error fetching matched creators:', err);
            setError('Failed to load creators. Please try again.');
            setCheckingMatches(false);
            return;
          } finally {
            setCheckingMatches(false);
          }
        } else {
          // We already have matched creators, ensure filteredCreators is set
          if (matchedCreators && matchedCreators.creators && matchedCreators.creators.length > 0) {
            setFilteredCreators(matchedCreators.creators);
          }
        }
      }
      
      // Advance to step 2
      // The useEffect will handle preselection when step changes to 2
      setStep(2);
    } else if (step === 2) {
      // Validate creator selection
      if (selectedCreators.length === 0) {
        setError('Please select at least one creator to send the offer to');
        return;
      }
      setError(null);
      setStep(3);
    }
  };

  const handleBack = () => {
    setError(null);
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Send offer to each selected creator
      const promises = selectedCreators.map(creator =>
        apiClient.post('/api/pr-offers', {
          creator_id: creator.id,
          offer_title: formData.offer_title,
          products_offered: formData.products_offered,
          products_value: formData.products_value ? parseFloat(formData.products_value) : null,
          deliverables_required: formData.deliverables_required,
          mandatory_requirements: formData.mandatory_requirements,
          content_deadline_days: parseInt(formData.content_deadline_days),
          target_categories: formData.target_categories
        })
      );

      const results = await Promise.allSettled(promises);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      if (successful > 0) {
        message.success(`Successfully sent ${successful} PR offer${successful > 1 ? 's' : ''}!`);
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      } else {
        setError('Failed to send offers. Please try again.');
      }

      if (failed > 0) {
        message.warning(`${failed} offer${failed > 1 ? 's' : ''} failed to send`);
      }
    } catch (err) {
      console.error('Error sending PR offers:', err);
      setError(err.response?.data?.error || 'Failed to send offers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: 16
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: 24,
        maxWidth: step === 2 ? 900 : 700,
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'transparent',
            border: 'none',
            fontSize: 24,
            cursor: 'pointer',
            color: '#6B7280',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f3f4f6';
            e.currentTarget.style.color = '#1F2937';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#6B7280';
          }}
        >
          ×
        </button>

        {/* Progress Steps */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32, gap: 8 }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: step >= s ? '#10b981' : '#e5e7eb',
                color: step >= s ? '#fff' : '#9ca3af',
                fontWeight: 700,
                fontSize: 14
              }}>
                {step > s ? <FaCheckCircle /> : s}
              </div>
              {s < 3 && (
                <div style={{
                  width: 60,
                  height: 2,
                  background: step > s ? '#10b981' : '#e5e7eb'
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Offer Details */}
        {step === 1 && (
          <div>
            <h2 style={{ margin: '0 0 24px 0', fontSize: 24, fontWeight: 700 }}>
              Create PR Package Offer
            </h2>
            <p style={{ margin: '0 0 24px 0', color: '#6B7280', fontSize: 14 }}>
              Fill in the offer details. We'll match you with relevant creators based on your target categories.
            </p>

            {/* Offer Title */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                Offer Title <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.offer_title}
                onChange={(e) => setFormData({ ...formData, offer_title: e.target.value })}
                placeholder="e.g., PR Package for our new Vitamin C Serum"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1.5px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 15,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Products Offered */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                Product(s) Offered <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                value={formData.products_offered}
                onChange={(e) => setFormData({ ...formData, products_offered: e.target.value })}
                placeholder="e.g., 1x 50ml Vitamin C Serum, 1x 30ml Cleanser. Total Value: $75"
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1.5px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 15,
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Products Value */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                Total Product Value (Optional)
              </label>
              <input
                type="number"
                value={formData.products_value}
                onChange={(e) => setFormData({ ...formData, products_value: e.target.value })}
                placeholder="75.00"
                step="0.01"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1.5px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 15,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Deliverables */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                Key Deliverables <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{
                border: '1.5px solid #e5e7eb',
                borderRadius: 8,
                padding: 12,
                maxHeight: 200,
                overflowY: 'auto'
              }}>
                {DELIVERABLE_OPTIONS.map((option) => (
                  <label
                    key={option}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 0',
                      cursor: 'pointer',
                      fontSize: 14
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.deliverables_required.includes(option)}
                      onChange={() => handleDeliverableChange(option)}
                      style={{ width: 18, height: 18, cursor: 'pointer' }}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Target Categories */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                Target Categories <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <p style={{ margin: '0 0 12px 0', fontSize: 12, color: '#6B7280' }}>
                Select categories to match with creators who have these in their PR preferences.
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: 8,
                maxHeight: 200,
                overflowY: 'auto',
                padding: 12,
                border: '1.5px solid #e5e7eb',
                borderRadius: 8
              }}>
                {PR_CATEGORIES.map(category => {
                  const isSelected = formData.target_categories.includes(category);
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => handleCategoryToggle(category)}
                      style={{
                        padding: '6px 12px',
                        border: `1.5px solid ${isSelected ? '#10b981' : '#e5e7eb'}`,
                        borderRadius: 6,
                        background: isSelected ? '#f0fdf4' : '#fff',
                        color: isSelected ? '#10b981' : '#6B7280',
                        fontWeight: isSelected ? 600 : 500,
                        cursor: 'pointer',
                        fontSize: 12,
                        transition: 'all 0.2s',
                        textAlign: 'left'
                      }}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
              {formData.target_categories.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  {checkingMatches ? (
                    <div style={{ fontSize: 12, color: '#6B7280', fontStyle: 'italic' }}>
                      Checking matched creators...
                    </div>
                  ) : matchedCreators && (
                    <div style={{
                      marginTop: 8,
                      padding: 16,
                      background: matchedCreators.count > 0 ? '#f0fdf4' : '#fef3c7',
                      border: `1.5px solid ${matchedCreators.count > 0 ? '#10b981' : '#fbbf24'}`,
                      borderRadius: 8
                    }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: matchedCreators.count > 0 ? '#065f46' : '#92400e', marginBottom: 4 }}>
                        {matchedCreators.count > 0 ? (
                          <>🎯 {matchedCreators.message}</>
                        ) : (
                          <>⚠️ {matchedCreators.message}</>
                        )}
                      </div>
                      {matchedCreators.count > 0 && (
                        <p style={{ margin: '8px 0 0 0', fontSize: 13, color: '#047857' }}>
                          Click "Next" to browse and select creators to send this offer to.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mandatory Requirements */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                Mandatory Requirements
              </label>
              <textarea
                value={formData.mandatory_requirements}
                onChange={(e) => setFormData({ ...formData, mandatory_requirements: e.target.value })}
                placeholder="e.g., Must tag @YourBrand and use #YourHashtag in the post"
                rows={2}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1.5px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 15,
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Content Deadline */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                Content Deadline (Days after receiving product)
              </label>
              <select
                value={formData.content_deadline_days}
                onChange={(e) => setFormData({ ...formData, content_deadline_days: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1.5px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 15,
                  outline: 'none',
                  boxSizing: 'border-box',
                  background: '#fff'
                }}
              >
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={21}>21 days</option>
                <option value={30}>30 days</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 2: Match Creators */}
        {step === 2 && (
          <div>
            <h2 style={{ margin: '0 0 8px 0', fontSize: 24, fontWeight: 700 }}>
              Matched Creators
            </h2>
            
            {checkingMatches ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ fontSize: 16, color: '#6B7280', marginBottom: 8 }}>Loading matched creators...</div>
                <div style={{ fontSize: 14, color: '#9ca3af' }}>Please wait while we find creators matching your criteria</div>
              </div>
            ) : matchedCreators && matchedCreators.creators ? (
              <>
                <div style={{
                  padding: 16,
                  background: '#f0fdf4',
                  border: '1.5px solid #10b981',
                  borderRadius: 8,
                  marginBottom: 24
                }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#065f46', marginBottom: 4 }}>
                    🎯 {matchedCreators.message || `We found ${matchedCreators.count || 0} creator${matchedCreators.count !== 1 ? 's' : ''}!`}
                  </div>
                  <p style={{ margin: '8px 0 0 0', fontSize: 14, color: '#047857' }}>
                    Select the creators you want to send this PR offer to. You can select multiple creators.
                  </p>
                </div>

            {/* Search */}
            <div style={{ marginBottom: 16 }}>
              <Input
                placeholder="Search creators by username or name..."
                prefix={<FaSearch style={{ color: '#9ca3af' }} />}
                value={creatorSearch}
                onChange={(e) => setCreatorSearch(e.target.value)}
                size="large"
                style={{ borderRadius: 8 }}
              />
            </div>

            {/* Selected Count */}
            {selectedCreators.length > 0 && (
              <div style={{
                padding: 12,
                background: '#f0fdf4',
                border: '1.5px solid #10b981',
                borderRadius: 8,
                marginBottom: 16,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#065f46' }}>
                  {selectedCreators.length} creator{selectedCreators.length > 1 ? 's' : ''} selected
                </div>
                <button
                  onClick={() => setSelectedCreators([])}
                  style={{
                    padding: '4px 12px',
                    border: '1px solid #10b981',
                    borderRadius: 6,
                    background: '#fff',
                    color: '#10b981',
                    fontSize: 12,
                    cursor: 'pointer'
                  }}
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Creators List */}
            <div style={{
              maxHeight: 400,
              overflowY: 'auto',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              padding: 8
            }}>
              {(() => {
                // Use filteredCreators if available, otherwise fallback to matchedCreators.creators
                const creatorsToDisplay = filteredCreators.length > 0 
                  ? filteredCreators 
                  : (matchedCreators && matchedCreators.creators ? matchedCreators.creators : []);
                
                if (!creatorsToDisplay || creatorsToDisplay.length === 0) {
                  return (
                    <div style={{ textAlign: 'center', padding: 40, color: '#6B7280' }}>
                      {creatorSearch ? 'No creators found matching your search' : 'No creators available'}
                    </div>
                  );
                }
                
                return creatorsToDisplay.map((creator) => {
                  if (!creator || !creator.id) {
                    return null;
                  }
                  // Compare IDs robustly (handle string vs number)
                  const isSelected = selectedCreators.some(c => {
                    const cId = c?.id;
                    const creatorId = creator?.id;
                    const match = String(cId) === String(creatorId) || Number(cId) === Number(creatorId);
                    // Debug log for preselected creator
                    if (preselectedCreator && (String(creatorId) === String(preselectedCreator.id) || Number(creatorId) === Number(preselectedCreator.id))) {
                      console.log('🔍 Checking preselected creator:', {
                        creatorId,
                        creatorIdType: typeof creatorId,
                        selectedCreators: selectedCreators.map(sc => ({ id: sc.id, idType: typeof sc.id })),
                        isSelected: match
                      });
                    }
                    return match;
                  });
                  return (
                    <div
                      key={`creator-${creator.id}`}
                      onClick={() => handleToggleCreator(creator)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: 12,
                        border: `1.5px solid ${isSelected ? '#10b981' : '#e5e7eb'}`,
                        borderRadius: 8,
                        marginBottom: 8,
                        cursor: 'pointer',
                        background: isSelected ? '#f0fdf4' : '#fff',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = '#10b981';
                          e.currentTarget.style.background = '#f9fafb';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = '#e5e7eb';
                          e.currentTarget.style.background = '#fff';
                        }
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleCreator(creator)}
                        style={{ width: 20, height: 20, cursor: 'pointer' }}
                      />
                      <Avatar
                        src={creator.image_profile}
                        icon={<FaUser />}
                        size={48}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 15, color: '#1F2937' }}>
                          @{creator.username}
                        </div>
                        {creator.name && creator.name !== creator.username && (
                          <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
                            {creator.name}
                          </div>
                        )}
                        {creator.followers_count && (
                          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                            {creator.followers_count.toLocaleString()} followers
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <FaCheckCircle style={{ color: '#10b981', fontSize: 20 }} />
                      )}
                    </div>
                  );
                });
              })()}
            </div>

            {/* Select All / Deselect All */}
            {filteredCreators.length > 0 && (
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <button
                  onClick={() => {
                    const allSelected = filteredCreators.every(c => selectedCreators.some(sc => sc.id === c.id));
                    if (allSelected) {
                      // Deselect all filtered
                      setSelectedCreators(prev => prev.filter(sc => !filteredCreators.some(fc => fc.id === sc.id)));
                    } else {
                      // Select all filtered
                      const newSelected = [...selectedCreators];
                      filteredCreators.forEach(c => {
                        if (!newSelected.some(sc => sc.id === c.id)) {
                          newSelected.push(c);
                        }
                      });
                      setSelectedCreators(newSelected);
                    }
                  }}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: 6,
                    background: '#fff',
                    color: '#6B7280',
                    fontSize: 12,
                    cursor: 'pointer'
                  }}
                >
                  {filteredCreators.every(c => selectedCreators.some(sc => sc.id === c.id)) ? 'Deselect All' : 'Select All'}
                </button>
              </div>
            )}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: '#6B7280' }}>
                <div style={{ fontSize: 16, marginBottom: 8 }}>No creators found</div>
                <div style={{ fontSize: 14, color: '#9ca3af' }}>Please go back and adjust your search criteria</div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Review & Confirm */}
        {step === 3 && (
          <div>
            <h2 style={{ margin: '0 0 24px 0', fontSize: 24, fontWeight: 700 }}>
              Review & Send
            </h2>

            {/* Offer Summary */}
            <div style={{
              background: '#f9fafb',
              borderRadius: 8,
              padding: 20,
              marginBottom: 24
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 700 }}>Offer Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
                <div><strong>Title:</strong> {formData.offer_title}</div>
                <div><strong>Products:</strong> {formData.products_offered}</div>
                {formData.products_value && (
                  <div><strong>Value:</strong> ${parseFloat(formData.products_value).toFixed(2)}</div>
                )}
                <div><strong>Deliverables:</strong> {formData.deliverables_required && formData.deliverables_required.length > 0 ? formData.deliverables_required.join(', ') : 'None specified'}</div>
                {formData.target_categories && formData.target_categories.length > 0 && (
                  <div><strong>Categories:</strong> {formData.target_categories.join(', ')}</div>
                )}
                <div><strong>Deadline:</strong> {formData.content_deadline_days} days after receiving product</div>
              </div>
            </div>

            {/* Selected Creators */}
            <div style={{
              background: '#f9fafb',
              borderRadius: 8,
              padding: 20,
              marginBottom: 24
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 700 }}>
                Sending to {selectedCreators.length} Creator{selectedCreators.length > 1 ? 's' : ''}
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {selectedCreators.map((creator, index) => (
                  <div
                    key={creator.id || `selected-creator-${index}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 12px',
                      background: '#fff',
                      borderRadius: 6,
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    <Avatar src={creator.image_profile} icon={<FaUser />} size={24} />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>@{creator.username}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Agreement Preview */}
            <div style={{
              background: '#f0fdf4',
              border: '1.5px solid #10b981',
              borderRadius: 8,
              padding: 16,
              marginBottom: 24
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: 15, fontWeight: 700, color: '#065f46' }}>
                    Partnership Agreement
                  </h4>
                  <p style={{ margin: 0, fontSize: 13, color: '#047857' }}>
                    Creators will need to accept this agreement before receiving the PR package. Preview what they'll see.
                  </p>
                </div>
                <button
                  onClick={() => setShowAgreementPreview(true)}
                  style={{
                    padding: '8px 16px',
                    border: '1.5px solid #10b981',
                    borderRadius: 8,
                    background: '#fff',
                    color: '#10b981',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <FaFileContract />
                  Preview Agreement
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Agreement Preview Modal */}
        {showAgreementPreview && (
          <PRPartnershipAgreement
            offer={{
              ...formData,
              products_offered: formData.products_offered,
              products_value: formData.products_value,
              deliverables_required: formData.deliverables_required,
              mandatory_requirements: formData.mandatory_requirements,
              content_deadline_days: formData.content_deadline_days
            }}
            brandName={brandName || 'Your Brand'}
            creatorName="Creator Name"
            open={showAgreementPreview}
            onAccept={() => setShowAgreementPreview(false)}
            onCancel={() => setShowAgreementPreview(false)}
            isPreview={true}
          />
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#fee2e2',
            color: '#dc2626',
            padding: '12px 16px',
            borderRadius: 8,
            marginBottom: 16,
            fontSize: 14
          }}>
            {error}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
          <button
            onClick={step === 1 ? onClose : handleBack}
            disabled={loading}
            style={{
              padding: '12px 24px',
              border: '1.5px solid #e5e7eb',
              borderRadius: 8,
              background: '#fff',
              color: '#6B7280',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 15
            }}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          <div style={{ display: 'flex', gap: 12 }}>
            {step < 3 && (
              <button
                onClick={handleNext}
                disabled={loading}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: 8,
                  background: loading ? '#d1fae5' : '#10b981',
                  color: loading ? '#6b7280' : '#fff',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: 15,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                Next
                <FaArrowRight />
              </button>
            )}
            {step === 3 && (
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: 8,
                  background: loading ? '#d1fae5' : '#10b981',
                  color: loading ? '#6b7280' : '#fff',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: 15,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <FaGift />
                {loading ? 'Sending...' : `Send to ${selectedCreators.length} Creator${selectedCreators.length > 1 ? 's' : ''}`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePROffer;

