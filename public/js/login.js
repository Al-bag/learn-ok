document.addEventListener('DOMContentLoaded', () => {
  
  // --- Auto-redirect if already logged in ---
  if (localStorage.getItem('user')) {
    window.location.href = 'chat.html';
    return;
  }
  
  // --- DOM Element References ---
  const authForm = document.getElementById('authForm');
  const formTitle = document.getElementById('formTitle');
  const submitBtn = document.getElementById('submitBtn');
  
  // Input fields
  const firstNameInput = document.getElementById('firstName');
  const lastNameInput = document.getElementById('lastName');
  const roomNoInput = document.getElementById('roomNo');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  
  let isSignupMode = false;
  
  // --- Toggle between Login and Signup modes ---
  window.toggleMode = () => {
    isSignupMode = !isSignupMode;
    authForm.classList.toggle('signup-mode', isSignupMode);
    authForm.classList.remove('was-validated'); // Reset validation state
    authForm.reset(); // Clear all inputs
    
    if (isSignupMode) {
      formTitle.textContent = 'Create Your Account';
      submitBtn.textContent = 'Sign Up';
      // Set required attributes for signup
      firstNameInput.required = true;
      roomNoInput.required = true;
    } else {
      formTitle.textContent = 'Login to VibeChat';
      submitBtn.textContent = 'Login';
      // Remove required attributes for login
      firstNameInput.required = false;
      roomNoInput.required = false;
    }
  };
  
  // --- Form Submission Logic ---
  authForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (!authForm.checkValidity()) {
      authForm.classList.add('was-validated');
      return;
    }
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Working...`;
    
    try {
      if (isSignupMode) {
        await handleSignup();
      } else {
        await handleLogin();
      }
    } catch (error) {
      console.error('Authentication error:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      submitBtn.disabled = false;
      // Restore original button text
      submitBtn.textContent = isSignupMode ? 'Sign Up' : 'Login';
    }
  });
  
  // --- SHA-256 Hashing Function ---
  async function sha256(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // --- Signup Handler ---
  async function handleSignup() {
    const signupData = {
      firstName: firstNameInput.value,
      lastName: lastNameInput.value,
      roomNos: [roomNoInput.value],
      username: await sha256(usernameInput.value),
      password: await sha256(passwordInput.value),
    };
    
    const res = await fetch('/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signupData),
    });
    
    if (res.ok) {
      // For signup, we can construct the user object to save them a login step
      const userToStore = {
        username: usernameInput.value, // Store plain username for display
        firstName: firstNameInput.value,
        lastName: lastNameInput.value,
        roomNos: [roomNoInput.value],
      };
      localStorage.setItem('user', JSON.stringify(userToStore));
      window.location.href = 'chat.html';
    } else {
      alert('Signup failed. The username might already be taken.');
    }
  }
  
  // --- Login Handler ---
  async function handleLogin() {
    const loginData = {
      username: await sha256(usernameInput.value),
      password: await sha256(passwordInput.value),
    };
    
    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData),
    });
    
    if (res.ok) {
      const user = await res.json();
      localStorage.setItem('user', JSON.stringify(user));
      window.location.href = 'chat.html';
    } else {
      alert('Login failed. Please check your username and password.');
      authForm.classList.add('was-validated'); // Show validation feedback on failure
    }
  }
});