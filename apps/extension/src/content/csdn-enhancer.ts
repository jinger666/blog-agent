// Content script for CSDN pages
console.log('AI Blog Assistant extension loaded');

// Detect CSDN article pages
if (window.location.hostname.includes('blog.csdn.net')) {
  initializeCSDNEnhancer();
}

function initializeCSDNEnhancer() {
  console.log('CSDN enhancer initialized');

  // Add enhancement button
  const enhanceButton = document.createElement('button');
  enhanceButton.textContent = '✨ AI Enhance';
  enhanceButton.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    z-index: 9999;
    padding: 10px 20px;
    background: #1890ff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  `;

  enhanceButton.onclick = () => {
    extractAndSendToAI();
  };

  document.body.appendChild(enhanceButton);
}

async function extractAndSendToAI() {
  // Extract article content
  const title = document.querySelector('h1')?.textContent || '';
  const content = document.querySelector('.article-content')?.textContent || '';

  console.log('Extracted:', { title, contentLength: content.length });

  // Send to backend for AI processing
  try {
    const response = await fetch('http://localhost:3000/api/agent/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        skill: 'seo_optimizer',
        input: content.substring(0, 2000),
      }),
    });

    const result = await response.json();
    console.log('AI Analysis:', result);

    // Show results in alert (in production, use a nice UI)
    alert('SEO Analysis Complete! Check console for details.');
  } catch (error) {
    console.error('Error:', error);
    alert('Error connecting to AI service. Make sure backend is running.');
  }
}
