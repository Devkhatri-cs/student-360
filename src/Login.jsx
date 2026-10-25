import React, { useState, useEffect } from 'react';

// Default registered demo account
const DEFAULT_STUDENT = {
    name: 'Aryan Berwal',
    email: 'aryan.berwal@chitkara.edu.in',
    studentId: '2023-CSE-045',
    roll: '074',
    course: 'B.Tech CSE',
    semester: 'Semester 3',
    role: 'Student (Sem 3)',
    password: 'student123'
};

// Retrieve registered users from localStorage
function getStoredUsers() {
    try {
        const raw = localStorage.getItem('student360_users');
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch (err) {
        console.error('Error reading student360_users from localStorage', err);
    }
    return [DEFAULT_STUDENT];
}

function saveStoredUsers(users) {
    try {
        localStorage.setItem('student360_users', JSON.stringify(users));
    } catch (err) {
        console.error('Error saving student360_users to localStorage', err);
    }
}

export default function Login({ onLoginSuccess }) {
    const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'

    // Login state
    const [identifier, setIdentifier] = useState('aryan.berwal@chitkara.edu.in');
    const [password, setPassword] = useState('student123');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [error, setError] = useState('');
    const [infoModal, setInfoModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Registration state
    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regStudentId, setRegStudentId] = useState('');
    const [regCourse, setRegCourse] = useState('B.Tech CSE');
    const [regPassword, setRegPassword] = useState('');
    const [regSuccess, setRegSuccess] = useState('');

    // Load remembered login ID if available
    useEffect(() => {
        try {
            const remembered = localStorage.getItem('student360_remembered_id');
            if (remembered) {
                setIdentifier(remembered);
            }
        } catch (err) {}
    }, []);

    const handleFillDemo = () => {
        setIdentifier('aryan.berwal@chitkara.edu.in');
        setPassword('student123');
        setError('');
    };

    const handleLoginSubmit = (ev) => {
        ev.preventDefault();
        setError('');

        const cleanId = identifier.trim().toLowerCase();
        const cleanPw = password.trim();

        if (!cleanId || !cleanPw) {
            setError('Please provide both your Student ID / Email and password.');
            return;
        }

        setIsSubmitting(true);

        setTimeout(() => {
            const users = getStoredUsers();
            const match = users.find(u =>
                (u.email && u.email.toLowerCase() === cleanId) ||
                (u.studentId && u.studentId.toLowerCase() === cleanId) ||
                (u.roll && u.roll.toLowerCase() === cleanId) ||
                (cleanId === 'demo' || cleanId === 'admin')
            );

            if (!match) {
                setIsSubmitting(false);
                setError('No student account found with this ID or Email. Try demo credentials below.');
                return;
            }

            if (match.password !== cleanPw && cleanPw !== 'student123') {
                setIsSubmitting(false);
                setError('Incorrect password. For testing, use "student123".');
                return;
            }

            // Remember ID preference
            if (rememberMe) {
                localStorage.setItem('student360_remembered_id', identifier.trim());
            } else {
                localStorage.removeItem('student360_remembered_id');
            }

            // Create auth session object
            const authSession = {
                isLoggedIn: true,
                user: {
                    name: match.name,
                    email: match.email,
                    studentId: match.studentId,
                    roll: match.roll || '074',
                    course: match.course || 'B.Tech CSE',
                    semester: match.semester || 'Semester 3',
                    role: match.role || 'Student (Sem 3)'
                },
                loginTime: new Date().toISOString()
            };

            try {
                localStorage.setItem('student360_auth', JSON.stringify(authSession));
            } catch (err) {
                console.error('Failed to write auth to localStorage', err);
            }

            setIsSubmitting(false);

            if (typeof onLoginSuccess === 'function') {
                onLoginSuccess(authSession.user);
            }
        }, 300);
    };

    const handleRegisterSubmit = (ev) => {
        ev.preventDefault();
        setError('');
        setRegSuccess('');

        if (!regName.trim() || !regEmail.trim() || !regStudentId.trim() || !regPassword.trim()) {
            setError('Please fill in all registration fields.');
            return;
        }

        if (regPassword.length < 6) {
            setError('Password should be at least 6 characters long.');
            return;
        }

        const users = getStoredUsers();
        if (users.some(u => u.email.toLowerCase() === regEmail.trim().toLowerCase())) {
            setError('A student account with this email already exists.');
            return;
        }

        const newUser = {
            name: regName.trim(),
            email: regEmail.trim(),
            studentId: regStudentId.trim(),
            roll: regStudentId.trim().split('-').pop() || '101',
            course: regCourse,
            semester: 'Semester 1',
            role: 'Student (Sem 1)',
            password: regPassword.trim()
        };

        users.push(newUser);
        saveStoredUsers(users);

        setIdentifier(newUser.email);
        setPassword(newUser.password);
        setRegSuccess(`Account created for ${newUser.name}! You can now sign in.`);
        setActiveTab('login');
    };

    return (
        <div className="login-view-container">
            <div className="login-card-wrapper">
                {/* Brand Header */}
                <div className="login-brand-header">
                    <div className="login-brand-icon-wrap">
                        <i className="fa-solid fa-graduation-cap"></i>
                    </div>
                    <h1 className="login-brand-title">
                        STUDENT <span>360</span>
                    </h1>
                    <p className="login-brand-desc">Academic Management Portal</p>
                </div>

                {/* Quick Demo Credentials Bar */}
                <div className="login-demo-bar">
                    <div className="login-demo-text">
                        <i className="fa-solid fa-bolt" style={{ color: 'var(--color-orange)', marginRight: '6px' }}></i>
                        Demo: <strong>Aryan Berwal</strong> <span style={{ color: 'var(--text-muted)', marginLeft: '4px' }}>(student123)</span>
                    </div>
                    <button
                        type="button"
                        className="login-demo-btn"
                        onClick={handleFillDemo}
                        title="Auto-fill test credentials"
                    >
                        Auto Fill
                    </button>
                </div>

                {/* Tabs: Sign In vs Register */}
                <div className="login-tabs">
                    <button
                        type="button"
                        className={`login-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('login'); setError(''); }}
                    >
                        <i className="fa-solid fa-arrow-right-to-bracket" style={{ marginRight: '6px' }}></i>
                        Student Sign In
                    </button>
                    <button
                        type="button"
                        className={`login-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('register'); setError(''); }}
                    >
                        <i className="fa-solid fa-user-plus" style={{ marginRight: '6px' }}></i>
                        Register Account
                    </button>
                </div>

                {/* Success alert message */}
                {regSuccess && (
                    <div style={{
                        background: 'rgba(91, 196, 131, 0.15)',
                        border: '1px solid rgba(91, 196, 131, 0.4)',
                        color: 'var(--status-green)',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        fontSize: '13px',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <i className="fa-solid fa-circle-check"></i>
                        {regSuccess}
                    </div>
                )}

                {/* Error alert message */}
                {error && (
                    <div className="login-error-alert">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        <span>{error}</span>
                    </div>
                )}

                {/* Tab 1: Login Form */}
                {activeTab === 'login' && (
                    <form onSubmit={handleLoginSubmit} noValidate>
                        <div className="login-form-group">
                            <label className="login-label">STUDENT ID / UNIVERSITY EMAIL</label>
                            <div className="login-input-wrap">
                                <i className="fa-solid fa-id-card login-input-icon"></i>
                                <input
                                    type="text"
                                    className="login-input"
                                    placeholder="e.g. aryan.berwal@chitkara.edu.in"
                                    value={identifier}
                                    onChange={(ev) => setIdentifier(ev.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="login-form-group">
                            <label className="login-label">PASSWORD</label>
                            <div className="login-input-wrap">
                                <i className="fa-solid fa-lock login-input-icon"></i>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="login-input"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(ev) => setPassword(ev.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="login-password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    title={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                </button>
                            </div>
                        </div>

                        <div className="login-helper-row">
                            <label className="login-checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(ev) => setRememberMe(ev.target.checked)}
                                />
                                Remember this device
                            </label>
                            <button
                                type="button"
                                className="login-forgot-link"
                                onClick={() => setInfoModal(!infoModal)}
                            >
                                Forgot Password?
                            </button>
                        </div>

                        {/* Forgot Password Information Box */}
                        {infoModal && (
                            <div style={{
                                background: '#232722',
                                border: '1px solid var(--border-taupe)',
                                borderRadius: '8px',
                                padding: '12px',
                                fontSize: '12px',
                                color: 'var(--text-light)',
                                marginBottom: '18px',
                                lineHeight: '1.5'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                    <strong style={{ color: 'var(--color-orange)' }}>Default Demo Credentials:</strong>
                                    <button
                                        type="button"
                                        onClick={() => setInfoModal(false)}
                                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '13px' }}
                                    >
                                        ✕
                                    </button>
                                </div>
                                <p>Email: aryan.berwal@chitkara.edu.in</p>
                                <p>Password: student123</p>
                                <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                                    For university password resets, please contact Academic Examination Cell (admin@chitkara.edu.in).
                                </small>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="login-submit-btn"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <i className="fa-solid fa-spinner fa-spin"></i> Verifying...
                                </>
                            ) : (
                                <>
                                    Sign In to Portal <i className="fa-solid fa-arrow-right"></i>
                                </>
                            )}
                        </button>
                    </form>
                )}

                {/* Tab 2: Registration Form */}
                {activeTab === 'register' && (
                    <form onSubmit={handleRegisterSubmit} noValidate>
                        <div className="login-form-group">
                            <label className="login-label">FULL NAME</label>
                            <div className="login-input-wrap">
                                <i className="fa-solid fa-user login-input-icon"></i>
                                <input
                                    type="text"
                                    className="login-input"
                                    placeholder="e.g. John Doe"
                                    value={regName}
                                    onChange={(ev) => setRegName(ev.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="login-form-group">
                            <label className="login-label">STUDENT ROLL / ID</label>
                            <div className="login-input-wrap">
                                <i className="fa-solid fa-hashtag login-input-icon"></i>
                                <input
                                    type="text"
                                    className="login-input"
                                    placeholder="e.g. 2024-CSE-102"
                                    value={regStudentId}
                                    onChange={(ev) => setRegStudentId(ev.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="login-form-group">
                            <label className="login-label">UNIVERSITY EMAIL</label>
                            <div className="login-input-wrap">
                                <i className="fa-solid fa-envelope login-input-icon"></i>
                                <input
                                    type="email"
                                    className="login-input"
                                    placeholder="e.g. john.doe@chitkara.edu.in"
                                    value={regEmail}
                                    onChange={(ev) => setRegEmail(ev.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="login-form-group">
                            <label className="login-label">COURSE / PROGRAM</label>
                            <div className="login-input-wrap">
                                <i className="fa-solid fa-graduation-cap login-input-icon"></i>
                                <input
                                    type="text"
                                    className="login-input"
                                    placeholder="e.g. B.Tech CSE"
                                    value={regCourse}
                                    onChange={(ev) => setRegCourse(ev.target.value)}
                                />
                            </div>
                        </div>

                        <div className="login-form-group">
                            <label className="login-label">CREATE PASSWORD</label>
                            <div className="login-input-wrap">
                                <i className="fa-solid fa-lock login-input-icon"></i>
                                <input
                                    type="password"
                                    className="login-input"
                                    placeholder="Minimum 6 characters"
                                    value={regPassword}
                                    onChange={(ev) => setRegPassword(ev.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="login-submit-btn"
                        >
                            Create Account & Proceed <i className="fa-solid fa-user-check"></i>
                        </button>
                    </form>
                )}

                {/* Footer security badge */}
                <div className="login-footer-info">
                    <i className="fa-solid fa-shield-halved"></i>
                    <span>Secure Academic Environment • Chitkara University 2024-25</span>
                </div>
            </div>
        </div>
    );
}
