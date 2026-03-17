
const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}


function handleResponseError(res, parsedError) {
  if (res.status === 401) {
    console.error("Session expired or Unauthorized. Logging out...");
    localStorage.clear();
    window.location.href = '/'; // Rediect to login or home page
  }
  
  const errMsg = parsedError?.message || parsedError?.detail || (typeof parsedError === "string" ? parsedError : res.statusText);
  const e = new Error(errMsg || "Request failed");
  e.status = res.status;
  e.response = parsedError;
  throw e;
}

export async function apiGet(path) {
  const res = await fetch(BASE + path, {
    method: "GET",
    headers: { "Content-Type": "application/json", ...authHeaders() },
  });
  
  if (!res.ok) {
    const err = await res.json().catch(()=>({message:res.statusText}));
    handleResponseError(res, err);
  }
  return res.json();
}

export async function apiPost(path, body) {
  const res = await fetch(BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });
  
  if (!res.ok) {
    const err = await res.json().catch(()=>({message:res.statusText}));
    handleResponseError(res, err);
  }
  return res.json();
}

export async function apiPut(path, body) {
  const res = await fetch(BASE + path, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let parsed;
  try { parsed = text ? JSON.parse(text) : null; } catch (e) { parsed = text; }

  if (!res.ok) {
    handleResponseError(res, parsed);
  }

  return parsed;
}

//  For Multipart Forms (File Uploads)

export async function apiPutMultipart(path, formData) {
  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const res = await fetch(BASE + path, {
    method: "PUT",
    headers: headers, 
    body: formData,
  });

  const text = await res.text();
  let parsed;
  try { parsed = text ? JSON.parse(text) : null; } catch (e) { parsed = text; }

  if (!res.ok) {
    handleResponseError(res, parsed);
  }
  return parsed;
}

//  NEW: For POST requests with Files/FormData
export async function apiPostMultipart(path, formData) {
  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const res = await fetch(BASE + path, {
    method: "POST",
    headers: headers, 
    body: formData,
  });

  const text = await res.text();
  let parsed;
  try { parsed = text ? JSON.parse(text) : null; } catch (e) { parsed = text; }

  if (!res.ok) {
    handleResponseError(res, parsed); // Auto-logout handle karega
  }
  return parsed;
}