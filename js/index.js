"use strict";

const USERS_KEY = "users";
const SESSION_KEY = "sessionUsername";
const $ = (id) => document.getElementById(id);

/* ---------- storage helpers ---------- */
function getUsers() {
    try {
        const users = JSON.parse(localStorage.getItem(USERS_KEY));
        return Array.isArray(users) ? users : [];
    } catch {
        return [];
    }
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getSession() {
    return localStorage.getItem(SESSION_KEY);
}

// textContent (not innerHTML) so user input can never inject HTML
function showMessage(el, text, type) {
    el.textContent = text;
    el.className = "msg " + (type === "ok" ? "text-success" : "text-danger");
}

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

/* ---------- sign up ---------- */
function setupSignup() {
    const form = $("signupForm");
    if (!form) return;
    const msg = $("exist");

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = $("signupName").value.trim();
        const email = $("signupEmail").value.trim().toLowerCase();
        const password = $("signupPassword").value;

        if (!name || !email || !password) return showMessage(msg, "All inputs are required", "error");
        if (!isValidEmail(email)) return showMessage(msg, "Enter a valid email address", "error");
        if (password.length < 6) return showMessage(msg, "Password must be at least 6 characters", "error");

        const users = getUsers();
        if (users.some((u) => u.email.toLowerCase() === email)) {
            return showMessage(msg, "This email already exists", "error");
        }

        users.push({ name, email, password });
        saveUsers(users);
        showMessage(msg, "Account created. Redirecting to sign in...", "ok");
        form.querySelector("button").disabled = true;
        setTimeout(() => location.replace("index.html"), 1200);
    });
}

/* ---------- sign in ---------- */
function setupSignin() {
    const form = $("signinForm");
    if (!form) return;
    const msg = $("incorrect");

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = $("signinEmail").value.trim().toLowerCase();
        const password = $("signinPassword").value;

        if (!email || !password) return showMessage(msg, "All inputs are required", "error");

        // passwords are case-sensitive; emails are not
        const user = getUsers().find((u) => u.email.toLowerCase() === email && u.password === password);
        if (!user) return showMessage(msg, "Incorrect email or password", "error");

        localStorage.setItem(SESSION_KEY, user.name);
        location.replace("home.html");
    });
}

/* ---------- home ---------- */
function setupHome() {
    const card = $("homeCard");
    if (!card) return;

    const name = getSession();
    if (!name) return location.replace("index.html"); // not signed in

    $("welcome").textContent = "Welcome " + name;
    card.hidden = false;
    $("logoutBtn").addEventListener("click", () => {
        localStorage.removeItem(SESSION_KEY);
        location.replace("index.html");
    });
}

/* ---------- already signed in? skip the login pages ---------- */
if ((($("signinForm") || $("signupForm"))) && getSession()) {
    location.replace("home.html");
} else {
    setupSignup();
    setupSignin();
    setupHome();
}
