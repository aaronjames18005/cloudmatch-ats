
import { User } from '../types';

// --- STANDBOX (Mock) DB Logic ---
const MOCK_DB_KEY = 'cloudmatch_users_db';
interface UserRecord extends User {
  passwordHash: string;
  verificationCode?: string;
}

const getMockUsers = (): UserRecord[] => {
  const data = localStorage.getItem(MOCK_DB_KEY);
  return data ? JSON.parse(data) : [];
};

const saveMockUsers = (users: UserRecord[]) => {
  localStorage.setItem(MOCK_DB_KEY, JSON.stringify(users));
};

export const initAuthDB = () => {
  const existing = localStorage.getItem(MOCK_DB_KEY);
  if (!existing) {
    const defaultAdmin: UserRecord = {
      id: 'admin_root',
      name: 'Standalone Admin',
      email: 'admin@cloudmatch.io',
      role: 'admin',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=admin',
      passwordHash: 'admin123',
      isVerified: true
    };
    localStorage.setItem(MOCK_DB_KEY, JSON.stringify([defaultAdmin]));
  }
};

export const authService = {
  getMode: () => 'sandbox',

  subscribe: (callback: (user: User | null) => void): () => void => {
    let lastUserString: string | null = null;
    
    const loadSandboxUser = () => {
        const stored = localStorage.getItem('app_user');
        // Only trigger callback if the data actually changed
        if (stored !== lastUserString) {
          lastUserString = stored;
          callback(stored ? JSON.parse(stored) : null);
        }
    };
    
    loadSandboxUser();
    const interval = setInterval(loadSandboxUser, 1000);
    return () => clearInterval(interval);
  },

  signUp: async (name: string, email: string, password: string): Promise<{ success: boolean; message?: string; code?: string }> => {
    await new Promise(r => setTimeout(r, 800));
    const users = getMockUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, message: "Email already registered in local database." };
    }
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newUser: UserRecord = { 
        id: `user_${Math.random().toString(36).substr(2, 9)}`, 
        name, 
        email, 
        role: 'user', 
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`, 
        passwordHash: password, 
        isVerified: false, 
        verificationCode 
    };
    saveMockUsers([...users, newUser]);
    return { success: true, code: verificationCode };
  },

  signIn: async (email: string, password: string): Promise<{ success: boolean; user?: User; message?: string; code?: string }> => {
    await new Promise(r => setTimeout(r, 800));
    const users = getMockUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user || user.passwordHash !== password) {
        return { success: false, message: "Invalid email or password." };
    }
    
    if (!user.isVerified) {
        const newCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.verificationCode = newCode;
        saveMockUsers(users);
        return { 
            success: false, 
            message: "Account not verified.", 
            code: newCode 
        };
    }
    
    const { passwordHash, verificationCode, ...safeUser } = user;
    localStorage.setItem('app_user', JSON.stringify(safeUser));
    return { success: true, user: safeUser };
  },

  signOut: async () => {
    localStorage.removeItem('app_user');
  },

  resetPassword: async (email: string): Promise<{ success: boolean; message?: string; simulatedLink?: string }> => {
    const users = getMockUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return { success: false, message: "User not found in local database." };
    return { 
      success: true, 
      message: "Simulation: Reset link generated.",
      simulatedLink: `https://cloudmatch.io/reset?token=${Math.random().toString(36).substr(2, 12)}`
    };
  },

  verifyEmailSandbox: async (email: string, code: string): Promise<{ success: boolean; message?: string }> => {
     await new Promise(r => setTimeout(r, 600));
     const users = getMockUsers();
     const userIdx = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
     
     if (userIdx === -1) return { success: false, message: "User not found." };
     
     if (users[userIdx].verificationCode === code) {
       users[userIdx].isVerified = true;
       delete users[userIdx].verificationCode;
       saveMockUsers(users);
       return { success: true };
     }
     return { success: false, message: "Invalid verification code." };
  },

  resendVerification: async (user: User) => {
    // No-op for local mode
  },
  
  reloadUser: async (): Promise<User | null> => {
     const stored = localStorage.getItem('app_user');
     return stored ? JSON.parse(stored) : null;
  },

  getAllUsers: async (): Promise<User[]> => {
    return getMockUsers().map(({ passwordHash, verificationCode, ...u }) => u);
  },

  deleteUser: async (id: string): Promise<void> => {
    saveMockUsers(getMockUsers().filter(u => u.id !== id));
  },

  updateUserRole: async (id: string, role: 'user' | 'admin'): Promise<void> => {
    const users = getMockUsers();
    const user = users.find(u => u.id === id);
    if (user) { 
        user.role = role; 
        saveMockUsers(users); 
    }
  }
};
