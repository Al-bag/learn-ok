// Auto redirect if already logged in
function autoRedirectIfLoggedIn() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user) {
    window.location.href = 'chat.html';
  }
}
autoRedirectIfLoggedIn();

// Hash function using SHA-256
async function sha256(userData) {
  const msgBuffer = new TextEncoder().encode(userData);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Signup function
async function signup() {
  const data = await signUpData();
  const res = await fetch('/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (res.ok) {
    localStorage.setItem('user', JSON.stringify(data));
    window.location.href = 'chat.html';
  } else {
    alert('Signup failed');
  }
}

// Signup data builder
async function signUpData() {
  return {
    firstName: document.getElementById('firstName').value,
    lastName: document.getElementById('lastName').value,
    roomNos: [document.querySelector('.room-no').value],
    username: await sha256(document.getElementById('username').value),
    password: await sha256(document.getElementById('password').value),
  };
}

// Login function
async function login() {
  const data = await logInData(); // ✅ FIX: get hashed data from the function
  const res = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (res.ok) {
    const user = await res.json();
    localStorage.setItem('user', JSON.stringify(user));
    window.location.href = 'chat.html';
  } else {
    alert('Login failed');
  }
}

// Login data builder
async function logInData() {
  return {
    // ✅ FIX: Use correct login fields (not the signup ones)
    username: await sha256(document.getElementById('logInUsername').value),
    password: await sha256(document.getElementById('logInPassword').value),
  };
}


//form function
const signUpForm = document.querySelector('.signUpForm');
const logInForm = document.querySelector('.logInForm');
document.querySelector('.logIn').addEventListener('click' ,()=>{
signUpForm.style.display = 'flex';
logInForm.style.display = 'none';
})
document.querySelector('.signUp').addEventListener('click',()=>{
logInForm.style.display = 'flex';
signUpForm.style.display = 'none';
})


//only numbers support 
const numberInputs = document.querySelectorAll('.numberInput');

numberInputs.forEach((input) => {
  const alertDiv = input.nextElementSibling; // assumes alert follows the input directly

  input.addEventListener('input', () => {
    if (/[^0-9]/.test(input.value)) {
      alertDiv.style.display = 'block';
      input.value = input.value.replace(/[^0-9]/g, '');
    } else {
      alertDiv.style.display = 'none';
    }
  });
});
// lets start
const firstName = document.getElementById('firstName');
const lastName = document.getElementById('lastName');
const roomNo = document.querySelector('.room-no');
const username = document.getElementById('username');
const password = document.getElementById('password');
const logInUsername = document.getElementById('logInUsername');
const logInPassword = document.getElementById('logInPassword');
const signupBtn = document.querySelector('button[onclick="signup()"]');
const loginBtn = document.querySelector('button[onclick="login()"]');
function submitIfValid() {
if (signUpForm.style.display !== 'none'){
const isSignupValid = firstName.value.trim() !== '' && roomNo.value.trim() !== '' && isValidUsername(username.value.trim()) && isValidPassword(password.value.trim());

if (isSignupValid) { signup(); } }

else {
const isLoginValid = isValidUsername(logInUsername.value.trim()) && isValidPassword(logInPassword.value.trim());

if (isLoginValid) { login(); } } }

//auto go second function 
//last input press and submit
const inputs = document.querySelectorAll('.input');

inputs.forEach((input, index) => {
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === 'ArrowDown') {
      if (index + 1 < inputs.length) {
        inputs[index + 1].focus();
      }
    } else if (e.key === 'ArrowUp') {
      if (index - 1 >= 0) {
        inputs[index - 1].focus();
      }
    }
  });
});

password.addEventListener('keydown',(e)=>{
  if (e.key === 'Enter') submitIfValid();
})
logInPassword.addEventListener('keydown',(e)=>{
  if (e.key === 'Enter') submitIfValid();
})

// Initial check in case values are prefilled


function isValidUsername(name) {
  return /^[a-zA-Z0-9_]{3,20}$/.test(name);
}

function isValidPassword(pw) {
  return pw.length >= 8;
}

function validateForm() {
  const isSignupValid =
    firstName.value.trim() !== '' &&
    roomNo.value.trim() !== '' &&
    isValidUsername(username.value.trim()) &&
    isValidPassword(password.value.trim());

  const isLoginValid =
    isValidUsername(logInUsername.value.trim()) &&
    isValidPassword(logInPassword.value.trim());

  signupBtn.disabled = !isSignupValid;
  loginBtn.disabled = !isLoginValid;
}



[firstName, lastName, roomNo, username, password,logInUsername,logInPassword].forEach(input => {
  input.addEventListener('input', validateForm);
});
validateForm();


//alerts

// password alert
function passwordAlert(){
    password.addEventListener('input',()=>{
  const alertDiv = document.querySelector('.passwordAlert');
if (password.value.length < 8){
     alertDiv.style.display = 'block';
     setTimeout(()=>{
alertDiv.style.display = 'none';
},2000);
          
  }else{
alertDiv.style.display = 'none';

  }
  })
}

// username alert
function usernameAlert(){
    username.addEventListener('input',()=>{
    const alertDiv = document.querySelector('.usernameAlert')
    if (username.value.length < 4){
     alertDiv.style.display = 'block';
setTimeout(()=>{
alertDiv.style.display = 'none';
},2000);

  }else{
alertDiv.style.display = 'none';

  }

  })
}

usernameAlert();
passwordAlert();

