// API service for handling HTTP requests
export async function fetchJSON(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching JSON:', error);
    throw error;
  }
}

export async function postJSON(url, data, options = {}) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      },
      body: JSON.stringify(data),
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error posting JSON:', error);
    throw error;
  }
}

export default {
  fetchJSON,
  postJSON
};