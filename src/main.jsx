import React from 'react';
import ReactDOM from 'react-dom/client';
import Login from './Login.jsx';

const preloader = document.getElementById('preloader');
const progressBar = document.getElementById('preloader-progress-bar');
const percentageText = document.getElementById('preloader-percentage');
const statusText = document.getElementById('preloader-status-text');
const step1 = document.getElementById('step-1');
const step2 = document.getElementById('step-2');
const step3 = document.getElementById('step-3');
const dashboardApp = document.getElementById('dashboard-app');
const loginRoot = document.getElementById('login-root');

let reactRoot = null;

// Exact 3-second preloader animation that runs AFTER login
export function runPreloader(studentName, onComplete) {
    if (!preloader) {
        if (onComplete) onComplete();
        return;
    }

    preloader.style.display = 'flex';
    preloader.classList.remove('preloader-hidden');
    document.body.classList.add('preloader-active');
    if (progressBar) progressBar.style.width = '0%';
    if (percentageText) percentageText.textContent = '0%';
    if (statusText) statusText.textContent = 'Authenticating Credentials...';
    [step1, step2, step3].forEach(s => s && s.classList.remove('active'));
    if (step1) step1.classList.add('active');

    const DURATION = 3000; // 3 seconds phase
    let startTime = null;

    function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(Math.max(elapsed / DURATION, 0), 1);
        const percent = Math.floor(progress * 100);

        if (progressBar) progressBar.style.width = percent + '%';
        if (percentageText) percentageText.textContent = percent + '%';

        if (progress < 0.35) {
            if (statusText) statusText.textContent = 'Authenticating Credentials...';
            if (step1) step1.classList.add('active');
        } else if (progress < 0.72) {
            if (statusText) statusText.textContent = 'Connecting Academic Data...';
            if (step2) step2.classList.add('active');
        } else if (progress < 0.96) {
            if (statusText) statusText.textContent = 'Preparing Dashboard...';
            if (step3) step3.classList.add('active');
        } else {
            if (statusText) statusText.textContent = `Welcome, ${studentName || 'Aryan Berwal'}!`;
        }

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            setTimeout(() => {
                preloader.classList.add('preloader-hidden');
                document.body.classList.remove('preloader-active');

                setTimeout(() => {
                    preloader.style.display = 'none';
                    if (typeof onComplete === 'function') onComplete();
                }, 700);
            }, 80);
        }
    }

    requestAnimationFrame(animate);
}

// Render React Login Component
export function renderLogin() {
    if (!loginRoot) return;
    loginRoot.style.display = 'flex';
    if (!reactRoot) {
        reactRoot = ReactDOM.createRoot(loginRoot);
    }
    reactRoot.render(
        <React.StrictMode>
            <Login onLoginSuccess={handleLoginSuccess} />
        </React.StrictMode>
    );
}

// Unmount / hide Login Component
export function hideLogin() {
    if (loginRoot) {
        loginRoot.style.display = 'none';
    }
}

// Triggered when user logs in successfully via React
export function handleLoginSuccess(user) {
    hideLogin();
    document.body.classList.remove('auth-pending');

    if (window.syncStudentData) {
        window.syncStudentData(user);
    }

    // Run the 3-second preloader window AFTER login
    runPreloader(user.name, () => {
        if (dashboardApp) {
            dashboardApp.style.display = 'block';
        }
        if (window.animateCounters) {
            window.animateCounters();
        }
    });
}

// Global logout handler
window.handleLogout = function () {
    try {
        localStorage.removeItem('student360_auth');
    } catch (e) {}

    document.body.classList.add('auth-pending');
    if (dashboardApp) {
        dashboardApp.style.display = 'none';
    }

    renderLogin();
};

// Check auth on startup
function initAuth() {
    let auth = null;
    try {
        const raw = localStorage.getItem('student360_auth');
        if (raw) auth = JSON.parse(raw);
    } catch (e) {}

    if (auth && auth.isLoggedIn && auth.user) {
        document.body.classList.remove('auth-pending');
        document.body.classList.remove('preloader-active');
        if (preloader) {
            preloader.classList.add('preloader-hidden');
            preloader.style.display = 'none';
        }
        hideLogin();
        if (dashboardApp) dashboardApp.style.display = 'block';
        if (window.syncStudentData) window.syncStudentData(auth.user);
    } else {
        document.body.classList.add('auth-pending');
        document.body.classList.remove('preloader-active');
        if (preloader) {
            preloader.classList.add('preloader-hidden');
            preloader.style.display = 'none';
        }
        if (dashboardApp) dashboardApp.style.display = 'none';
        renderLogin();
    }
}

initAuth();
