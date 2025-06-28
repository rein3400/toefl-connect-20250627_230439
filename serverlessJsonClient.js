export async function fetchJSON(url, init = {}) {
  const { headers: initHeaders, ...rest } = init;
  const headers = new Headers(initHeaders);
  if (!headers.has('Accept')) headers.set('Accept', 'application/json');
  let response;
  try {
    response = await fetch(url, { method: 'GET', headers, ...rest });
  } catch (err) {
    throw new Error(`fetchJSON: Network error while fetching ${url} - ${err.message}`);
  }
  if (!response.ok) {
    throw new Error(`fetchJSON: Failed to fetch ${url} - ${response.status} ${response.statusText}`);
  }
  try {
    return await response.json();
  } catch (err) {
    throw new Error(`fetchJSON: Invalid JSON in response from ${url} - ${err.message}`);
  }
}

export async function postJSON(url, data, init = {}) {
  const { headers: initHeaders, ...rest } = init;
  const headers = new Headers(initHeaders);
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (!headers.has('Accept')) headers.set('Accept', 'application/json');
  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
      ...rest
    });
  } catch (err) {
    throw new Error(`postJSON: Network error while posting to ${url} - ${err.message}`);
  }
  if (!response.ok) {
    throw new Error(`postJSON: Failed to post to ${url} - ${response.status} ${response.statusText}`);
  }
  try {
    return await response.json();
  } catch (err) {
    throw new Error(`postJSON: Invalid JSON in response from ${url} - ${err.message}`);
  }
}