/**
 * IndexNow Test Script
 * Run this with: node test-indexnow.js
 */

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

async function testIndexNow() {
  console.log('🚀 Testing IndexNow implementation via backend...');
  
  const testUrls = [
    'https://newcollab.co/',
    'https://newcollab.co/blog',
    'https://newcollab.co/register/creator',
    'https://newcollab.co/register/brand'
  ];

  try {
    const response = await fetch(`${API_URL}/api/indexnow/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        urls: testUrls
      })
    });

    const data = await response.json();
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Data:', data);

    if (response.ok && data.success) {
      console.log('✅ IndexNow test successful!');
      console.log('📝 Submitted URLs:', testUrls);
      console.log('📝 Backend Message:', data.message);
    } else {
      console.log('❌ IndexNow test failed:', response.status, response.statusText);
      console.log('📝 Error details:', data.message || data.error);
    }
  } catch (error) {
    console.error('❌ IndexNow test error:', error.message);
  }
}

async function testCreatorSubmission() {
  console.log('🚀 Testing creator profile submission...');
  
  try {
    const response = await fetch(`${API_URL}/api/indexnow/submit-creator`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser'
      })
    });

    const data = await response.json();
    console.log('📊 Creator Response Status:', response.status);
    console.log('📊 Creator Response Data:', data);

    if (response.ok && data.success) {
      console.log('✅ Creator profile test successful!');
      console.log('📝 Creator URL:', data.url);
    } else {
      console.log('❌ Creator profile test failed:', response.status, response.statusText);
      console.log('📝 Error details:', data.message || data.error);
    }
  } catch (error) {
    console.error('❌ Creator profile test error:', error.message);
  }
}

async function testDynamicBlogPosts() {
  console.log('🚀 Testing dynamic blog posts submission...');
  
  try {
    const response = await fetch(`${API_URL}/api/indexnow/submit-blog-posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    console.log('📊 Blog Posts Response Status:', response.status);
    console.log('📊 Blog Posts Response Data:', data);

    if (response.ok && data.success) {
      console.log('✅ Dynamic blog posts test successful!');
      console.log('📝 Submitted', data.count, 'blog posts');
      console.log('📝 First few URLs:', data.urls.slice(0, 3));
    } else {
      console.log('❌ Dynamic blog posts test failed:', response.status, response.statusText);
      console.log('📝 Error details:', data.message || data.error);
    }
  } catch (error) {
    console.error('❌ Dynamic blog posts test error:', error.message);
  }
}

async function testLatestBlogPosts() {
  console.log('🚀 Testing latest blog posts submission...');
  
  try {
    const response = await fetch(`${API_URL}/api/indexnow/submit-new-posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        limit: 3
      })
    });

    const data = await response.json();
    console.log('📊 Latest Posts Response Status:', response.status);
    console.log('📊 Latest Posts Response Data:', data);

    if (response.ok && data.success) {
      console.log('✅ Latest blog posts test successful!');
      console.log('📝 Submitted', data.count, 'latest posts');
      console.log('📝 URLs:', data.urls);
    } else {
      console.log('❌ Latest blog posts test failed:', response.status, response.statusText);
      console.log('📝 Error details:', data.message || data.error);
    }
  } catch (error) {
    console.error('❌ Latest blog posts test error:', error.message);
  }
}

// Run the tests
async function runAllTests() {
  await testIndexNow();
  console.log('\n' + '='.repeat(50) + '\n');
  await testCreatorSubmission();
  console.log('\n' + '='.repeat(50) + '\n');
  await testDynamicBlogPosts();
  console.log('\n' + '='.repeat(50) + '\n');
  await testLatestBlogPosts();
}

runAllTests();
