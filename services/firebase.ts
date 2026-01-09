
export const isFirebaseConfigured = (): boolean => {
  return false;
};

export const getAuthMode = (): 'sandbox' => {
  return 'sandbox';
};

export const setAuthMode = (mode: 'sandbox') => {
  localStorage.setItem('cloudmatch_auth_mode', 'sandbox');
};

export const initFirebase = () => {
  console.log("CloudMatch is running in standalone Local Mode (Mock DB)");
};

// Compatibility exports
export const saveFirebaseConfig = (config: any) => {};
export const setSandboxMode = () => {};
export const clearConfig = () => {
  localStorage.clear();
  window.location.reload();
};

export const auth = undefined;
export const db = undefined;
export const analytics = undefined;
