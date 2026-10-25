/* =========================================================
   STUDENT 360 – FULL APPLICATION LOGIC  (app.js)
   SPA Routing  •  Interactive UI  •  Feature Functions
   ========================================================= */

(function () {
    'use strict';

    // ─── DATA STORE ───────────────────────────────────────
    const StudentData = {
        name: 'Aryan Berwal',
        email: 'aryan.berwal@chitkara.edu.in',
        roll: '074',
        studentId: '2023-CSE-045',
        course: 'B.Tech CSE',
        year: '2nd Year',
        semester: 'Semester 3',
        cgpa: 8.12,
        attendance: 91.9,
        creditsEarned: 96,
        bloodGroup: 'B+ Positive',
        phone: '+91 98765 43210',
        hostel: 'Boys Hostel No. 3 – Block B, Room 204',
        guardian: 'Mr. Suresh Sharma (Father)',
        guardianPhone: '+91 98112 34567',
    };

    function syncStudentData(customUser) {
        let authUser = customUser;
        if (!authUser) {
            try {
                const raw = localStorage.getItem('student360_auth');
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (parsed && parsed.user) authUser = parsed.user;
                }
            } catch (err) {}
        }
        if (authUser) {
            if (authUser.name) StudentData.name = authUser.name;
            if (authUser.email) StudentData.email = authUser.email;
            if (authUser.studentId) StudentData.studentId = authUser.studentId;
            if (authUser.roll) StudentData.roll = authUser.roll;
            if (authUser.course) StudentData.course = authUser.course;
            if (authUser.semester) StudentData.semester = authUser.semester;
            if (authUser.role) StudentData.role = authUser.role;

            // Update topbar DOM
            const topbarName = document.querySelector('.user-meta .user-name');
            const topbarRole = document.querySelector('.user-meta .user-role');
            if (topbarName) topbarName.textContent = StudentData.name;
            if (topbarRole) topbarRole.textContent = StudentData.role;

            setGreeting();
        }
    }
    syncStudentData();

    const Quotes = [
        { text: '"Small steps every day lead to big results."', author: 'Daily Motivation' },
        { text: '"The expert in anything was once a beginner."', author: 'Helen Hayes' },
        { text: '"Education is the most powerful weapon."', author: 'Nelson Mandela' },
        { text: '"Don\'t watch the clock; do what it does. Keep going."', author: 'Sam Levenson' },
        { text: '"Success is the sum of small efforts, repeated."', author: 'Robert Collier' },
        { text: '"Learning never exhausts the mind."', author: 'Leonardo da Vinci' },
        { text: '"Believe you can and you\'re halfway there."', author: 'Theodore Roosevelt' },
        { text: '"The future belongs to those who prepare for it today."', author: 'Malcolm X' },
    ];

    const Notifications = [
        { id: 1, text: 'Your attendance for today\'s class has been updated.', time: '2 hours ago', read: false, type: 'attendance' },
        { id: 2, text: 'New assignment posted for Data Structures & Algorithms.', time: '5 hours ago', read: false, type: 'assignment' },
        { id: 3, text: 'Results for Semester 4 are now available.', time: '1 day ago', read: false, type: 'result' },
        { id: 4, text: 'Notice: Makeup Examination for 25CSE0204 (OOP).', time: '2 days ago', read: true, type: 'notice' },
        { id: 5, text: 'Library book "Introduction to Algorithms" due in 3 days.', time: '3 days ago', read: true, type: 'library' },
    ];

    const SettingsPreferences = {
        attendanceAlerts: true,
        examUpdates: true,
        resultAnnouncements: true,
        libraryReminders: false,
    };


    // ─── SPA ROUTER ───────────────────────────────────────
    const pages = ['dashboard', 'profile', 'academics', 'attendance', 'results', 'courses', 'documents', 'settings'];

    function navigateTo(pageId) {
        if (!pages.includes(pageId)) pageId = 'dashboard';

        // Hide all sections with fade-out
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('page-active');
            section.classList.add('page-hidden');
        });

        // Show the target section with fade-in
        const target = document.getElementById(pageId);
        if (target) {
            // Small delay so the CSS transition plays
            requestAnimationFrame(() => {
                target.classList.remove('page-hidden');
                target.classList.add('page-active');
            });
        }

        // Update sidebar active state
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === '#' + pageId) {
                link.classList.add('active');
            }
        });

        // Update URL hash without scroll
        history.pushState(null, '', '#' + pageId);

        // Scroll main to top
        const mainEl = document.querySelector('.main');
        if (mainEl) mainEl.scrollTop = 0;
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Close mobile sidebar if open
        document.querySelector('.sidebar')?.classList.remove('sidebar-open');
        document.getElementById('sidebar-overlay')?.classList.remove('visible');
    }


    // ─── TOAST NOTIFICATION SYSTEM ────────────────────────
    function createToastContainer() {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }
        return container;
    }

    function showToast(message, type = 'info', duration = 3500) {
        const container = createToastContainer();
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icons = {
            success: 'fa-circle-check',
            error: 'fa-circle-xmark',
            warning: 'fa-triangle-exclamation',
            info: 'fa-circle-info',
        };

        toast.innerHTML = `
            <i class="fa-solid ${icons[type] || icons.info}"></i>
            <span>${message}</span>
            <button class="toast-close" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
        `;

        container.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => toast.classList.add('toast-visible'));

        // Auto-dismiss
        const timer = setTimeout(() => dismissToast(toast), duration);

        toast.querySelector('.toast-close').addEventListener('click', () => {
            clearTimeout(timer);
            dismissToast(toast);
        });
    }

    function dismissToast(toast) {
        toast.classList.remove('toast-visible');
        toast.classList.add('toast-exit');
        toast.addEventListener('transitionend', () => toast.remove());
    }


    // ─── MODAL SYSTEM ─────────────────────────────────────
    function createModal(title, bodyHTML, footerHTML = '') {
        // Remove existing modal
        document.getElementById('app-modal')?.remove();

        const overlay = document.createElement('div');
        overlay.id = 'app-modal';
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal-container">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" aria-label="Close modal"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div class="modal-body">${bodyHTML}</div>
                ${footerHTML ? `<div class="modal-footer">${footerHTML}</div>` : ''}
            </div>
        `;

        document.body.appendChild(overlay);
        requestAnimationFrame(() => overlay.classList.add('modal-visible'));

        // Close handlers
        overlay.querySelector('.modal-close').addEventListener('click', closeModal);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });

        // Trap focus / ESC
        document.addEventListener('keydown', modalEscHandler);

        return overlay;
    }

    function closeModal() {
        const modal = document.getElementById('app-modal');
        if (modal) {
            modal.classList.remove('modal-visible');
            modal.classList.add('modal-exit');
            modal.addEventListener('transitionend', () => modal.remove());
            document.removeEventListener('keydown', modalEscHandler);
        }
    }

    function modalEscHandler(e) {
        if (e.key === 'Escape') closeModal();
    }


    // ─── GREETING BASED ON TIME ───────────────────────────
    function setGreeting() {
        const h = new Date().getHours();
        let greeting = 'Good Evening';
        if (h < 12) greeting = 'Good Morning';
        else if (h < 17) greeting = 'Good Afternoon';

        const el = document.querySelector('.welcome-text h1');
        if (el) el.innerHTML = `${greeting}, ${StudentData.name.split(' ')[0]} <span>👋</span>`;
    }

    // ─── RANDOM MOTIVATIONAL QUOTE ────────────────────────
    function setRandomQuote() {
        const q = Quotes[Math.floor(Math.random() * Quotes.length)];
        const quoteP = document.querySelector('.quote-content p');
        const quoteA = document.querySelector('.quote-author');
        if (quoteP) quoteP.textContent = q.text;
        if (quoteA) quoteA.textContent = `— ${q.author}`;
    }


    // ─── SEARCH FUNCTIONALITY ─────────────────────────────
    function initSearch() {
        const searchInput = document.querySelector('.search-box input');
        if (!searchInput) return;

        // Create search results dropdown
        const dropdown = document.createElement('div');
        dropdown.className = 'search-dropdown';
        dropdown.id = 'search-dropdown';
        document.querySelector('.search-box').appendChild(dropdown);

        const searchItems = [
            { label: 'Dashboard Overview', page: 'dashboard', icon: 'fa-house', keywords: 'home overview welcome' },
            { label: 'My Profile', page: 'profile', icon: 'fa-user', keywords: 'profile personal info student id' },
            { label: 'Academics & Timetable', page: 'academics', icon: 'fa-book-open', keywords: 'academics timetable schedule class exams' },
            { label: 'Attendance Record', page: 'attendance', icon: 'fa-calendar-check', keywords: 'attendance percentage absent present leave' },
            { label: 'Results & SGPA', page: 'results', icon: 'fa-chart-column', keywords: 'results marks sgpa cgpa grades performance transcript' },
            { label: 'Enrolled Courses', page: 'courses', icon: 'fa-graduation-cap', keywords: 'courses subjects syllabus notes ppts elective' },
            { label: 'Student Documents', page: 'documents', icon: 'fa-file-lines', keywords: 'documents hall ticket admit card marksheet fee receipt certificate' },
            { label: 'Settings & Preferences', page: 'settings', icon: 'fa-gear', keywords: 'settings password notifications preferences account security' },
            { label: 'Data Structures & Algorithms', page: 'courses', icon: 'fa-code', keywords: 'dsa cse-201 trees graphs sorting' },
            { label: 'Database Management Systems', page: 'courses', icon: 'fa-database', keywords: 'dbms cse-302 sql normalization' },
            { label: 'Computer Networks', page: 'courses', icon: 'fa-network-wired', keywords: 'networks cse-305 osi tcp routing' },
            { label: 'Web Technologies', page: 'courses', icon: 'fa-globe', keywords: 'web cse-308 html css javascript' },
            { label: 'Operating Systems', page: 'courses', icon: 'fa-server', keywords: 'os cse-310 processes threads scheduling' },
            { label: 'Discrete Mathematics', page: 'courses', icon: 'fa-square-root-variable', keywords: 'math mat-301 logic sets combinatorics' },
            { label: 'SGPA Calculator', page: 'results', icon: 'fa-calculator', keywords: 'sgpa calculator grade point' },
            { label: 'Apply for Leave', page: 'attendance', icon: 'fa-envelope-open-text', keywords: 'leave application absence' },
            { label: 'Exam Hall Ticket', page: 'documents', icon: 'fa-file-arrow-down', keywords: 'hall ticket admit card exam' },
            { label: 'Change Password', page: 'settings', icon: 'fa-key', keywords: 'password change security' },
        ];

        searchInput.addEventListener('input', () => {
            const query = searchInput.value.trim().toLowerCase();
            dropdown.innerHTML = '';

            if (query.length < 2) {
                dropdown.classList.remove('visible');
                return;
            }

            const results = searchItems.filter(item =>
                item.label.toLowerCase().includes(query) ||
                item.keywords.includes(query)
            );

            if (results.length === 0) {
                dropdown.innerHTML = '<div class="search-no-result"><i class="fa-solid fa-magnifying-glass"></i> No results found</div>';
            } else {
                results.forEach(item => {
                    const div = document.createElement('div');
                    div.className = 'search-result-item';
                    div.innerHTML = `<i class="fa-solid ${item.icon}"></i> <span>${item.label}</span>`;
                    div.addEventListener('click', () => {
                        navigateTo(item.page);
                        searchInput.value = '';
                        dropdown.classList.remove('visible');
                    });
                    dropdown.appendChild(div);
                });
            }
            dropdown.classList.add('visible');
        });

        // Close dropdown on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-box')) {
                dropdown.classList.remove('visible');
            }
        });

        // Keyboard navigation
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchInput.value = '';
                dropdown.classList.remove('visible');
                searchInput.blur();
            }
        });
    }


    // ─── NOTIFICATION PANEL ───────────────────────────────
    function initNotifications() {
        const bellIcon = document.querySelector('.notification');
        if (!bellIcon) return;

        bellIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleNotificationPanel();
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.notification-panel') && !e.target.closest('.notification')) {
                document.querySelector('.notification-panel')?.classList.remove('panel-visible');
            }
        });
    }

    function toggleNotificationPanel() {
        let panel = document.querySelector('.notification-panel');

        if (!panel) {
            panel = document.createElement('div');
            panel.className = 'notification-panel';
            document.querySelector('.top-right').appendChild(panel);
        }

        if (panel.classList.contains('panel-visible')) {
            panel.classList.remove('panel-visible');
            return;
        }

        const unreadCount = Notifications.filter(n => !n.read).length;

        panel.innerHTML = `
            <div class="notif-panel-header">
                <h4><i class="fa-solid fa-bell"></i> Notifications</h4>
                <button class="notif-mark-all" id="mark-all-read">${unreadCount > 0 ? 'Mark all as read' : 'All caught up!'}</button>
            </div>
            <div class="notif-panel-list">
                ${Notifications.map(n => `
                    <div class="notif-panel-item ${n.read ? 'read' : 'unread'}" data-id="${n.id}">
                        <span class="notif-dot ${n.read ? '' : 'active'}"></span>
                        <div class="notif-panel-body">
                            <p>${n.text}</p>
                            <small><i class="fa-regular fa-clock"></i> ${n.time}</small>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="notif-panel-footer">
                <button class="btn btn-secondary btn-sm" id="view-all-notif">View All Notifications</button>
            </div>
        `;

        panel.classList.add('panel-visible');

        // Mark all read
        panel.querySelector('#mark-all-read')?.addEventListener('click', () => {
            Notifications.forEach(n => n.read = true);
            updateNotificationBadge();
            toggleNotificationPanel(); // refresh
            setTimeout(() => toggleNotificationPanel(), 50);
            showToast('All notifications marked as read', 'success');
        });

        // Click individual notification
        panel.querySelectorAll('.notif-panel-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = parseInt(item.dataset.id);
                const notif = Notifications.find(n => n.id === id);
                if (notif) {
                    notif.read = true;
                    updateNotificationBadge();
                    item.classList.remove('unread');
                    item.classList.add('read');
                    item.querySelector('.notif-dot').classList.remove('active');

                    // Navigate based on type
                    const typeMap = { attendance: 'attendance', assignment: 'courses', result: 'results', notice: 'academics', library: 'documents' };
                    navigateTo(typeMap[notif.type] || 'dashboard');
                    panel.classList.remove('panel-visible');
                }
            });
        });

        // View all
        panel.querySelector('#view-all-notif')?.addEventListener('click', () => {
            navigateTo('dashboard');
            panel.classList.remove('panel-visible');
        });
    }

    function updateNotificationBadge() {
        const badge = document.querySelector('.notification .badge');
        const unread = Notifications.filter(n => !n.read).length;
        if (badge) {
            badge.textContent = unread;
            badge.style.display = unread > 0 ? 'flex' : 'none';
        }
        // Also update the badge pill in dashboard
        const pill = document.querySelector('.notifications-card .badge-pill');
        if (pill) pill.textContent = `${unread} New`;
    }


    // ─── PROFILE DROPDOWN ─────────────────────────────────
    function initProfileDropdown() {
        const userBtn = document.querySelector('.topbar .user');
        if (!userBtn) return;

        userBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleProfileDropdown();
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.profile-dropdown')) {
                document.querySelector('.profile-dropdown')?.classList.remove('dropdown-visible');
            }
        });
    }

    function toggleProfileDropdown() {
        let dropdown = document.querySelector('.profile-dropdown');

        if (!dropdown) {
            dropdown = document.createElement('div');
            dropdown.className = 'profile-dropdown';
            document.querySelector('.top-right').appendChild(dropdown);
        }

        if (dropdown.classList.contains('dropdown-visible')) {
            dropdown.classList.remove('dropdown-visible');
            return;
        }

        dropdown.innerHTML = `
            <div class="profile-dd-header">
                <div class="profile-dd-avatar"><i class="fa-solid fa-user"></i></div>
                <div>
                    <strong>${StudentData.name}</strong>
                    <small>${StudentData.email}</small>
                </div>
            </div>
            <div class="profile-dd-menu">
                <button class="profile-dd-item" data-page="profile"><i class="fa-solid fa-user"></i> My Profile</button>
                <button class="profile-dd-item" data-page="settings"><i class="fa-solid fa-gear"></i> Settings</button>
                <button class="profile-dd-item" data-page="results"><i class="fa-solid fa-chart-column"></i> Results</button>
                <hr>
                <button class="profile-dd-item logout-btn"><i class="fa-solid fa-right-from-bracket"></i> Logout</button>
            </div>
        `;

        dropdown.classList.add('dropdown-visible');

        dropdown.querySelectorAll('.profile-dd-item[data-page]').forEach(item => {
            item.addEventListener('click', () => {
                navigateTo(item.dataset.page);
                dropdown.classList.remove('dropdown-visible');
            });
        });

        dropdown.querySelector('.logout-btn')?.addEventListener('click', () => {
            dropdown.classList.remove('dropdown-visible');
            createModal(
                '<i class="fa-solid fa-right-from-bracket"></i> Confirm Logout',
                '<p style="margin-bottom: 8px;">Are you sure you want to log out of Student 360?</p><p style="color: var(--text-muted); font-size: 13px;">Your session will be ended and you will need to log in again.</p>',
                '<button class="btn btn-secondary" id="cancel-logout">Cancel</button><button class="btn btn-primary" id="confirm-logout"><i class="fa-solid fa-right-from-bracket"></i> Logout</button>'
            );
            document.getElementById('cancel-logout')?.addEventListener('click', closeModal);
            document.getElementById('confirm-logout')?.addEventListener('click', () => {
                closeModal();
                showToast('Logging out of Student 360...', 'info');
                setTimeout(() => {
                    if (typeof window.handleLogout === 'function') {
                        window.handleLogout();
                    }
                }, 350);
            });
        });
    }


    // ─── SIDEBAR NAVIGATION ───────────────────────────────
    function initSidebar() {
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const hash = link.getAttribute('href')?.replace('#', '');
                if (hash) navigateTo(hash);
            });
        });
    }


    // ─── QUICK ACTION LINKS ───────────────────────────────
    function initQuickActions() {
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const href = btn.getAttribute('href')?.replace('#', '');
                if (href) navigateTo(href);
            });
        });

        // "View Full Profile" button
        document.querySelectorAll('a[href="#profile"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                navigateTo('profile');
            });
        });
    }


    // ─── PROFILE SECTION BUTTONS ──────────────────────────
    function initProfileButtons() {
        // Edit Profile
        document.querySelectorAll('.section-actions .btn').forEach(btn => {
            const text = btn.textContent.trim();

            if (text.includes('Edit Profile')) {
                btn.addEventListener('click', () => {
                    createModal(
                        '<i class="fa-solid fa-pen-to-square"></i> Edit Profile',
                        `<form id="edit-profile-form" class="modal-form">
                            <div class="form-group"><label>Full Name</label><input type="text" value="${StudentData.name}" id="edit-name"></div>
                            <div class="form-group"><label>Phone Number</label><input type="tel" value="${StudentData.phone}" id="edit-phone"></div>
                            <div class="form-group"><label>University Email</label><input type="email" value="${StudentData.email}" disabled class="disabled-input"></div>
                            <div class="form-group"><label>Blood Group</label><input type="text" value="${StudentData.bloodGroup}" id="edit-blood"></div>
                            <p class="form-hint"><i class="fa-solid fa-circle-info"></i> Email and Roll Number cannot be changed. Contact the registrar's office for corrections.</p>
                        </form>`,
                        '<button class="btn btn-secondary" id="cancel-edit">Cancel</button><button class="btn btn-primary" id="save-edit"><i class="fa-solid fa-floppy-disk"></i> Save Changes</button>'
                    );
                    document.getElementById('cancel-edit')?.addEventListener('click', closeModal);
                    document.getElementById('save-edit')?.addEventListener('click', () => {
                        const newName = document.getElementById('edit-name')?.value?.trim();
                        const newPhone = document.getElementById('edit-phone')?.value?.trim();
                        if (newName) StudentData.name = newName;
                        if (newPhone) StudentData.phone = newPhone;
                        closeModal();
                        showToast('Profile updated successfully!', 'success');
                    });
                });
            }

            if (text.includes('ID Card Summary')) {
                btn.addEventListener('click', () => {
                    createModal(
                        '<i class="fa-solid fa-id-card"></i> Student ID Card Summary',
                        `<div class="id-card-preview">
                            <div class="id-card">
                                <div class="id-header">
                                    <i class="fa-solid fa-graduation-cap"></i>
                                    <span>CHITKARA UNIVERSITY</span>
                                </div>
                                <div class="id-body">
                                    <div class="id-photo"><i class="fa-solid fa-user"></i></div>
                                    <div class="id-details">
                                        <h4>${StudentData.name}</h4>
                                        <p><strong>ID:</strong> ${StudentData.studentId}</p>
                                        <p><strong>Program:</strong> ${StudentData.course}</p>
                                        <p><strong>Roll:</strong> ${StudentData.roll}</p>
                                        <p><strong>Blood:</strong> ${StudentData.bloodGroup}</p>
                                    </div>
                                </div>
                                <div class="id-footer">Valid till June 2026</div>
                            </div>
                        </div>`,
                        '<button class="btn btn-secondary" onclick="closeModal()">Close</button><button class="btn btn-primary" id="download-id"><i class="fa-solid fa-download"></i> Download PDF</button>'
                    );
                    document.getElementById('download-id')?.addEventListener('click', () => {
                        showToast('ID Card PDF download initiated...', 'info');
                        setTimeout(() => showToast('Demo mode — file download simulated.', 'warning'), 1500);
                    });
                });
            }
        });
    }


    // ─── ACADEMICS SECTION BUTTONS ────────────────────────
    function initAcademicsButtons() {
        document.querySelectorAll('#academics .section-actions .btn').forEach(btn => {
            const text = btn.textContent.trim();

            if (text.includes('Academic Calendar')) {
                btn.addEventListener('click', () => {
                    createModal(
                        '<i class="fa-solid fa-calendar-week"></i> Academic Calendar 2024-25',
                        `<div class="calendar-preview">
                            <div class="cal-event"><span class="cal-date">Aug 1</span><span class="cal-title">Semester 3 Begins</span><span class="cal-tag">Start</span></div>
                            <div class="cal-event"><span class="cal-date">Sep 12-28</span><span class="cal-title">Mid-Semester Examinations</span><span class="cal-tag exam">Exams</span></div>
                            <div class="cal-event"><span class="cal-date">Oct 2</span><span class="cal-title">Gandhi Jayanti (Holiday)</span><span class="cal-tag holiday">Holiday</span></div>
                            <div class="cal-event"><span class="cal-date">Oct 31 - Nov 1</span><span class="cal-title">Diwali Vacation</span><span class="cal-tag holiday">Holiday</span></div>
                            <div class="cal-event"><span class="cal-date">Nov 20 - Dec 5</span><span class="cal-title">End-Semester Examinations</span><span class="cal-tag exam">Exams</span></div>
                            <div class="cal-event"><span class="cal-date">Dec 10</span><span class="cal-title">Winter Vacation Begins</span><span class="cal-tag">Break</span></div>
                        </div>`,
                        '<button class="btn btn-secondary" onclick="closeModal()">Close</button>'
                    );
                });
            }

            if (text.includes('Syllabus PDF')) {
                btn.addEventListener('click', () => {
                    showToast('Downloading Semester 3 consolidated syllabus PDF...', 'info');
                    setTimeout(() => showToast('Demo mode — file download simulated.', 'warning'), 1500);
                });
            }
        });

        // Exam card chevron buttons
        document.querySelectorAll('.exam-card .btn-icon').forEach(btn => {
            btn.addEventListener('click', () => {
                const examTitle = btn.closest('.exam-card')?.querySelector('h3')?.textContent || 'Exam';
                showToast(`Opening syllabus for: ${examTitle}`, 'info');
            });
        });
    }


    // ─── ATTENDANCE SECTION BUTTONS ───────────────────────
    function initAttendanceButtons() {
        document.querySelectorAll('#attendance .section-actions .btn').forEach(btn => {
            const text = btn.textContent.trim();

            if (text.includes('Detailed Log')) {
                btn.addEventListener('click', () => {
                    createModal(
                        '<i class="fa-solid fa-file-lines"></i> Detailed Attendance Log',
                        `<div class="attendance-log">
                            <div class="log-header">
                                <span>Last 10 days — All Subjects</span>
                            </div>
                            <table class="data-table mini-table">
                                <thead><tr><th>Date</th><th>Subject</th><th>Status</th></tr></thead>
                                <tbody>
                                    <tr><td>Oct 21</td><td>Data Structures & Algorithms</td><td><span class="tag-status safe">Present</span></td></tr>
                                    <tr><td>Oct 21</td><td>Database Management Systems</td><td><span class="tag-status safe">Present</span></td></tr>
                                    <tr><td>Oct 20</td><td>Computer Networks</td><td><span class="tag-status safe">Present</span></td></tr>
                                    <tr><td>Oct 20</td><td>Web Technologies</td><td><span class="tag-status danger">Absent</span></td></tr>
                                    <tr><td>Oct 19</td><td>Operating Systems</td><td><span class="tag-status safe">Present</span></td></tr>
                                    <tr><td>Oct 18</td><td>Discrete Mathematics</td><td><span class="tag-status safe">Present</span></td></tr>
                                    <tr><td>Oct 18</td><td>Data Structures & Algorithms</td><td><span class="tag-status safe">Present</span></td></tr>
                                    <tr><td>Oct 17</td><td>Database Management Systems</td><td><span class="tag-status warning">On Leave</span></td></tr>
                                    <tr><td>Oct 16</td><td>Computer Networks</td><td><span class="tag-status safe">Present</span></td></tr>
                                    <tr><td>Oct 15</td><td>Web Technologies</td><td><span class="tag-status safe">Present</span></td></tr>
                                </tbody>
                            </table>
                        </div>`,
                        '<button class="btn btn-secondary" onclick="closeModal()">Close</button>'
                    );
                });
            }

            if (text.includes('Apply for Leave')) {
                btn.addEventListener('click', () => {
                    createModal(
                        '<i class="fa-solid fa-envelope-open-text"></i> Apply for Leave',
                        `<form id="leave-form" class="modal-form">
                            <div class="form-group"><label>Leave Type</label>
                                <select id="leave-type">
                                    <option value="">Select leave type...</option>
                                    <option value="medical">Medical Leave</option>
                                    <option value="personal">Personal Leave</option>
                                    <option value="family">Family Emergency</option>
                                    <option value="event">College Event / Activity</option>
                                </select>
                            </div>
                            <div class="form-row">
                                <div class="form-group"><label>From Date</label><input type="date" id="leave-from"></div>
                                <div class="form-group"><label>To Date</label><input type="date" id="leave-to"></div>
                            </div>
                            <div class="form-group"><label>Reason / Description</label><textarea id="leave-reason" rows="3" placeholder="Briefly describe the reason for your leave..."></textarea></div>
                            <p class="form-hint"><i class="fa-solid fa-circle-info"></i> Leave applications are reviewed within 24-48 hours by the HOD.</p>
                        </form>`,
                        '<button class="btn btn-secondary" id="cancel-leave">Cancel</button><button class="btn btn-primary" id="submit-leave"><i class="fa-solid fa-paper-plane"></i> Submit Application</button>'
                    );
                    document.getElementById('cancel-leave')?.addEventListener('click', closeModal);
                    document.getElementById('submit-leave')?.addEventListener('click', () => {
                        const type = document.getElementById('leave-type')?.value;
                        const from = document.getElementById('leave-from')?.value;
                        const to = document.getElementById('leave-to')?.value;
                        const reason = document.getElementById('leave-reason')?.value?.trim();

                        if (!type || !from || !to || !reason) {
                            showToast('Please fill in all fields before submitting.', 'error');
                            return;
                        }
                        closeModal();
                        showToast('Leave application submitted successfully! Pending HOD approval.', 'success', 4000);
                    });
                });
            }
        });
    }


    // ─── RESULTS SECTION BUTTONS ──────────────────────────
    function initResultsButtons() {
        document.querySelectorAll('#results .section-actions .btn').forEach(btn => {
            const text = btn.textContent.trim();

            if (text.includes('SGPA Calculator')) {
                btn.addEventListener('click', () => {
                    createModal(
                        '<i class="fa-solid fa-calculator"></i> SGPA Calculator',
                        `<form id="sgpa-form" class="modal-form">
                            <p class="form-hint" style="margin-bottom: 16px;"><i class="fa-solid fa-circle-info"></i> Enter the grade points and credit hours for each subject to calculate SGPA.</p>
                            <div id="sgpa-subjects">
                                <div class="sgpa-row">
                                    <input type="text" placeholder="Subject name" value="Data Structures & Algorithms" class="sgpa-name">
                                    <input type="number" placeholder="Credits" value="4" min="1" max="6" class="sgpa-credits">
                                    <select class="sgpa-grade">
                                        <option value="10">O (10)</option>
                                        <option value="9" selected>A+ (9)</option>
                                        <option value="8">A (8)</option>
                                        <option value="7">B+ (7)</option>
                                        <option value="6">B (6)</option>
                                        <option value="5">C (5)</option>
                                        <option value="0">F (0)</option>
                                    </select>
                                </div>
                                <div class="sgpa-row">
                                    <input type="text" placeholder="Subject name" value="DBMS" class="sgpa-name">
                                    <input type="number" placeholder="Credits" value="4" min="1" max="6" class="sgpa-credits">
                                    <select class="sgpa-grade">
                                        <option value="10">O (10)</option>
                                        <option value="9">A+ (9)</option>
                                        <option value="8" selected>A (8)</option>
                                        <option value="7">B+ (7)</option>
                                        <option value="6">B (6)</option>
                                        <option value="5">C (5)</option>
                                        <option value="0">F (0)</option>
                                    </select>
                                </div>
                                <div class="sgpa-row">
                                    <input type="text" placeholder="Subject name" value="Computer Networks" class="sgpa-name">
                                    <input type="number" placeholder="Credits" value="3" min="1" max="6" class="sgpa-credits">
                                    <select class="sgpa-grade">
                                        <option value="10">O (10)</option>
                                        <option value="9">A+ (9)</option>
                                        <option value="8" selected>A (8)</option>
                                        <option value="7">B+ (7)</option>
                                        <option value="6">B (6)</option>
                                        <option value="5">C (5)</option>
                                        <option value="0">F (0)</option>
                                    </select>
                                </div>
                            </div>
                            <button type="button" class="btn btn-secondary btn-sm" id="add-sgpa-row" style="margin-top: 10px;"><i class="fa-solid fa-plus"></i> Add Subject</button>
                            <div id="sgpa-result" class="sgpa-result-box" style="display:none;">
                                <h4>Your Calculated SGPA: <span id="sgpa-value">0.00</span></h4>
                            </div>
                        </form>`,
                        '<button class="btn btn-secondary" onclick="closeModal()">Close</button><button class="btn btn-primary" id="calc-sgpa"><i class="fa-solid fa-calculator"></i> Calculate</button>'
                    );

                    document.getElementById('add-sgpa-row')?.addEventListener('click', () => {
                        const container = document.getElementById('sgpa-subjects');
                        const row = document.createElement('div');
                        row.className = 'sgpa-row';
                        row.innerHTML = `
                            <input type="text" placeholder="Subject name" class="sgpa-name">
                            <input type="number" placeholder="Credits" value="3" min="1" max="6" class="sgpa-credits">
                            <select class="sgpa-grade">
                                <option value="10">O (10)</option>
                                <option value="9">A+ (9)</option>
                                <option value="8" selected>A (8)</option>
                                <option value="7">B+ (7)</option>
                                <option value="6">B (6)</option>
                                <option value="5">C (5)</option>
                                <option value="0">F (0)</option>
                            </select>
                        `;
                        container.appendChild(row);
                    });

                    document.getElementById('calc-sgpa')?.addEventListener('click', () => {
                        const rows = document.querySelectorAll('.sgpa-row');
                        let totalCredits = 0, totalPoints = 0;
                        rows.forEach(row => {
                            const credits = parseFloat(row.querySelector('.sgpa-credits')?.value) || 0;
                            const grade = parseFloat(row.querySelector('.sgpa-grade')?.value) || 0;
                            totalCredits += credits;
                            totalPoints += credits * grade;
                        });
                        const sgpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
                        const resultBox = document.getElementById('sgpa-result');
                        const valueEl = document.getElementById('sgpa-value');
                        if (resultBox) resultBox.style.display = 'block';
                        if (valueEl) valueEl.textContent = sgpa;
                        showToast(`SGPA Calculated: ${sgpa}`, 'success');
                    });
                });
            }

            if (text.includes('Download Official Transcript')) {
                btn.addEventListener('click', () => {
                    showToast('Generating official transcript PDF...', 'info');
                    setTimeout(() => showToast('Demo mode — transcript download simulated.', 'warning'), 1500);
                });
            }
        });

        // Grade card PDF buttons
        document.querySelectorAll('.btn-table-action').forEach(btn => {
            btn.addEventListener('click', () => {
                const semName = btn.closest('tr')?.querySelector('td b')?.textContent || 'Grade Card';
                showToast(`Downloading ${semName} grade card PDF...`, 'info');
                setTimeout(() => showToast('Demo mode — file download simulated.', 'warning'), 1500);
            });
        });
    }


    // ─── COURSES SECTION BUTTONS ──────────────────────────
    function initCoursesButtons() {
        document.querySelectorAll('#courses .section-actions .btn').forEach(btn => {
            const text = btn.textContent.trim();

            if (text.includes('Course Directory')) {
                btn.addEventListener('click', () => {
                    createModal(
                        '<i class="fa-solid fa-book"></i> Full Course Directory',
                        `<div class="course-directory">
                            <p class="form-hint" style="margin-bottom:14px;"><i class="fa-solid fa-circle-info"></i> All courses offered in the Department of Computer Science & Engineering</p>
                            <table class="data-table mini-table">
                                <thead><tr><th>Code</th><th>Course</th><th>Credits</th><th>Type</th></tr></thead>
                                <tbody>
                                    <tr><td><b>CSE-201</b></td><td>Data Structures & Algorithms</td><td>4</td><td><span class="tag-status safe">Core</span></td></tr>
                                    <tr><td><b>CSE-302</b></td><td>Database Management Systems</td><td>4</td><td><span class="tag-status safe">Core</span></td></tr>
                                    <tr><td><b>CSE-305</b></td><td>Computer Networks</td><td>3</td><td><span class="tag-status safe">Core</span></td></tr>
                                    <tr><td><b>CSE-308</b></td><td>Web Technologies</td><td>3</td><td><span class="tag-status safe">Core</span></td></tr>
                                    <tr><td><b>CSE-310</b></td><td>Operating Systems</td><td>4</td><td><span class="tag-status safe">Core</span></td></tr>
                                    <tr><td><b>MAT-301</b></td><td>Discrete Mathematics</td><td>3</td><td><span class="tag-status safe">Core</span></td></tr>
                                    <tr><td><b>CSE-401</b></td><td>Machine Learning</td><td>4</td><td><span class="tag-status warning">Elective</span></td></tr>
                                    <tr><td><b>CSE-402</b></td><td>Cloud Computing</td><td>3</td><td><span class="tag-status warning">Elective</span></td></tr>
                                    <tr><td><b>CSE-403</b></td><td>Cyber Security</td><td>3</td><td><span class="tag-status warning">Elective</span></td></tr>
                                </tbody>
                            </table>
                        </div>`,
                        '<button class="btn btn-secondary" onclick="closeModal()">Close</button>'
                    );
                });
            }

            if (text.includes('Register Elective')) {
                btn.addEventListener('click', () => {
                    createModal(
                        '<i class="fa-solid fa-plus"></i> Register for Elective',
                        `<form id="elective-form" class="modal-form">
                            <div class="form-group"><label>Select Elective Course</label>
                                <select id="elective-select">
                                    <option value="">Choose an elective...</option>
                                    <option value="ML">CSE-401 — Machine Learning (4 Credits)</option>
                                    <option value="CC">CSE-402 — Cloud Computing (3 Credits)</option>
                                    <option value="CS">CSE-403 — Cyber Security (3 Credits)</option>
                                </select>
                            </div>
                            <p class="form-hint"><i class="fa-solid fa-triangle-exclamation"></i> Elective registration is subject to seat availability and advisor approval.</p>
                        </form>`,
                        '<button class="btn btn-secondary" id="cancel-elective">Cancel</button><button class="btn btn-primary" id="submit-elective"><i class="fa-solid fa-check"></i> Register</button>'
                    );
                    document.getElementById('cancel-elective')?.addEventListener('click', closeModal);
                    document.getElementById('submit-elective')?.addEventListener('click', () => {
                        const val = document.getElementById('elective-select')?.value;
                        if (!val) {
                            showToast('Please select an elective course.', 'error');
                            return;
                        }
                        closeModal();
                        showToast('Elective registration request submitted! Awaiting advisor approval.', 'success', 4000);
                    });
                });
            }
        });

        // Course card buttons (Syllabus / Notes)
        document.querySelectorAll('.course-box .btn').forEach(btn => {
            const text = btn.textContent.trim();
            const courseName = btn.closest('.course-box')?.querySelector('h3')?.textContent || 'Course';

            if (text.includes('Syllabus')) {
                btn.addEventListener('click', () => {
                    showToast(`Opening syllabus for ${courseName}...`, 'info');
                    setTimeout(() => showToast('Demo mode — document preview simulated.', 'warning'), 1500);
                });
            }
            if (text.includes('Notes')) {
                btn.addEventListener('click', () => {
                    showToast(`Opening notes & PPTs for ${courseName}...`, 'info');
                    setTimeout(() => showToast('Demo mode — file browser simulated.', 'warning'), 1500);
                });
            }
        });
    }


    // ─── DOCUMENTS SECTION BUTTONS ────────────────────────
    function initDocumentsButtons() {
        // Upload Certificate button
        document.querySelectorAll('#documents .section-actions .btn').forEach(btn => {
            if (btn.textContent.includes('Upload Certificate')) {
                btn.addEventListener('click', () => {
                    createModal(
                        '<i class="fa-solid fa-upload"></i> Upload Certificate',
                        `<form id="upload-form" class="modal-form">
                            <div class="form-group"><label>Certificate Type</label>
                                <select id="cert-type">
                                    <option value="">Select type...</option>
                                    <option value="internship">Internship Certificate</option>
                                    <option value="workshop">Workshop / Seminar</option>
                                    <option value="hackathon">Hackathon / Competition</option>
                                    <option value="course">Online Course Completion</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div class="form-group"><label>Upload File (PDF, JPG, PNG)</label>
                                <div class="file-upload-area" id="file-drop-zone">
                                    <i class="fa-solid fa-cloud-arrow-up"></i>
                                    <p>Drag & drop your file here, or <strong>click to browse</strong></p>
                                    <small>Max file size: 5 MB</small>
                                    <input type="file" id="cert-file" accept=".pdf,.jpg,.jpeg,.png" style="display:none;">
                                </div>
                                <p id="file-name-display" class="form-hint" style="display:none;"></p>
                            </div>
                            <div class="form-group"><label>Description (Optional)</label><input type="text" placeholder="Brief description of the certificate" id="cert-desc"></div>
                        </form>`,
                        '<button class="btn btn-secondary" id="cancel-upload">Cancel</button><button class="btn btn-primary" id="submit-upload"><i class="fa-solid fa-upload"></i> Upload</button>'
                    );

                    // File drop zone click
                    const dropZone = document.getElementById('file-drop-zone');
                    const fileInput = document.getElementById('cert-file');
                    const fileDisplay = document.getElementById('file-name-display');

                    dropZone?.addEventListener('click', () => fileInput?.click());
                    fileInput?.addEventListener('change', () => {
                        if (fileInput.files.length > 0) {
                            fileDisplay.textContent = `✓ Selected: ${fileInput.files[0].name}`;
                            fileDisplay.style.display = 'block';
                        }
                    });

                    document.getElementById('cancel-upload')?.addEventListener('click', closeModal);
                    document.getElementById('submit-upload')?.addEventListener('click', () => {
                        const type = document.getElementById('cert-type')?.value;
                        if (!type) {
                            showToast('Please select a certificate type.', 'error');
                            return;
                        }
                        closeModal();
                        showToast('Certificate uploaded successfully! Pending verification.', 'success', 4000);
                    });
                });
            }
        });

        // Download buttons on doc cards
        document.querySelectorAll('.doc-card .btn').forEach(btn => {
            if (btn.textContent.includes('Download')) {
                btn.addEventListener('click', () => {
                    const docName = btn.closest('.doc-card')?.querySelector('h4')?.textContent || 'Document';
                    showToast(`Downloading: ${docName}`, 'info');
                    setTimeout(() => showToast('Demo mode — file download simulated.', 'warning'), 1500);
                });
            }
        });
    }


    // ─── SETTINGS SECTION ─────────────────────────────────
    function initSettings() {
        // Password form
        const settingsForm = document.querySelector('#settings .settings-form');
        if (settingsForm) {
            const submitBtn = settingsForm.querySelector('button[type="submit"]');
            submitBtn?.addEventListener('click', (e) => {
                e.preventDefault();
                const inputs = settingsForm.querySelectorAll('input[type="password"]');
                const current = inputs[0]?.value?.trim();
                const newPw = inputs[1]?.value?.trim();
                const confirm = inputs[2]?.value?.trim();

                if (!current || !newPw || !confirm) {
                    showToast('Please fill all password fields.', 'error');
                    return;
                }
                if (newPw.length < 8) {
                    showToast('New password must be at least 8 characters.', 'error');
                    return;
                }
                if (newPw !== confirm) {
                    showToast('New passwords do not match. Please try again.', 'error');
                    return;
                }

                showToast('Password updated successfully!', 'success');
                inputs.forEach(i => i.value = '');
            });
        }

        // Notification checkboxes
        document.querySelectorAll('.checkbox-item input[type="checkbox"]').forEach((cb, i) => {
            cb.addEventListener('change', () => {
                const keys = Object.keys(SettingsPreferences);
                if (keys[i]) {
                    SettingsPreferences[keys[i]] = cb.checked;
                    showToast(`Preference ${cb.checked ? 'enabled' : 'disabled'}: ${cb.closest('.checkbox-item')?.querySelector('strong')?.textContent || ''}`, 'info');
                }
            });
        });

        // Reset Defaults
        document.querySelectorAll('#settings .section-actions .btn').forEach(btn => {
            if (btn.textContent.includes('Reset Defaults')) {
                btn.addEventListener('click', () => {
                    createModal(
                        '<i class="fa-solid fa-rotate-left"></i> Reset to Defaults',
                        '<p>Are you sure you want to reset all settings and preferences to their default values?</p><p style="color: var(--text-muted); font-size: 13px; margin-top: 8px;">This action cannot be undone.</p>',
                        '<button class="btn btn-secondary" id="cancel-reset">Cancel</button><button class="btn btn-primary" id="confirm-reset"><i class="fa-solid fa-rotate-left"></i> Reset</button>'
                    );
                    document.getElementById('cancel-reset')?.addEventListener('click', closeModal);
                    document.getElementById('confirm-reset')?.addEventListener('click', () => {
                        SettingsPreferences.attendanceAlerts = true;
                        SettingsPreferences.examUpdates = true;
                        SettingsPreferences.resultAnnouncements = true;
                        SettingsPreferences.libraryReminders = false;
                        document.querySelectorAll('.checkbox-item input[type="checkbox"]').forEach((cb, i) => {
                            cb.checked = [true, true, true, false][i] ?? false;
                        });
                        document.querySelectorAll('#settings input[type="password"]').forEach(i => i.value = '');
                        closeModal();
                        showToast('All settings have been reset to defaults.', 'success');
                    });
                });
            }

            if (btn.textContent.includes('Save Preferences')) {
                btn.addEventListener('click', () => {
                    showToast('Preferences saved successfully!', 'success');
                });
            }
        });
    }


    // ─── DASHBOARD NOTIFICATION LIST ──────────────────────
    function initDashboardNotifications() {
        document.querySelectorAll('.notification-list .notification-item').forEach((item, i) => {
            item.style.cursor = 'pointer';
            item.addEventListener('click', () => {
                if (Notifications[i]) {
                    Notifications[i].read = true;
                    updateNotificationBadge();
                    const typeMap = { attendance: 'attendance', assignment: 'courses', result: 'results', notice: 'academics', library: 'documents' };
                    navigateTo(typeMap[Notifications[i].type] || 'dashboard');
                }
            });
        });
    }


    // ─── STAT CARD CLICK NAVIGATION ───────────────────────
    function initStatCardClicks() {
        const mapping = {
            'attendance-card': 'attendance',
            'cgpa-card': 'results',
            'courses-card': 'courses',
            'credits-card': 'results',
        };

        Object.entries(mapping).forEach(([cls, page]) => {
            const card = document.querySelector(`.${cls}`);
            if (card) {
                card.style.cursor = 'pointer';
                card.addEventListener('click', () => navigateTo(page));
            }
        });
    }


    // ─── MOBILE SIDEBAR TOGGLE ────────────────────────────
    function initMobileMenu() {
        // Create hamburger button
        let hamburger = document.getElementById('mobile-menu-btn');
        if (!hamburger) {
            hamburger = document.createElement('button');
            hamburger.id = 'mobile-menu-btn';
            hamburger.className = 'mobile-menu-btn';
            hamburger.innerHTML = '<i class="fa-solid fa-bars"></i>';
            hamburger.setAttribute('aria-label', 'Toggle menu');
            document.querySelector('.topbar')?.prepend(hamburger);
        }

        // Create overlay
        let overlay = document.getElementById('sidebar-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'sidebar-overlay';
            overlay.className = 'sidebar-overlay';
            document.body.appendChild(overlay);
        }

        hamburger.addEventListener('click', () => {
            document.querySelector('.sidebar')?.classList.toggle('sidebar-open');
            overlay.classList.toggle('visible');
        });

        overlay.addEventListener('click', () => {
            document.querySelector('.sidebar')?.classList.remove('sidebar-open');
            overlay.classList.remove('visible');
        });
    }


    // ─── BACK-TO-TOP BUTTON ───────────────────────────────
    function initBackToTop() {
        const btn = document.createElement('button');
        btn.id = 'back-to-top';
        btn.className = 'back-to-top-btn';
        btn.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';
        btn.setAttribute('aria-label', 'Back to top');
        document.body.appendChild(btn);

        window.addEventListener('scroll', () => {
            btn.classList.toggle('visible', window.scrollY > 400);
        });

        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }


    // ─── ANIMATED COUNTERS ────────────────────────────────
    function animateCounters() {
        document.querySelectorAll('.stat-value, .summary-num').forEach(el => {
            const text = el.textContent.trim();
            const target = parseFloat(text);
            if (isNaN(target)) return;

            const isPercent = text.includes('%');
            const isFloat = text.includes('.');
            const duration = 1200;
            const start = performance.now();

            el.textContent = '0';

            function update(now) {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                // Ease-out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = target * eased;

                if (isFloat) {
                    el.textContent = current.toFixed(2) + (isPercent ? '%' : '');
                } else {
                    el.textContent = Math.floor(current) + (isPercent ? '%' : '');
                }

                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    el.textContent = text; // Restore exact original value
                }
            }

            requestAnimationFrame(update);
        });
    }


    // ─── INITIALIZE APP ───────────────────────────────────
    function init() {
        // Set greeting and quote
        setGreeting();
        setRandomQuote();

        // Initialize all interactive features
        initSidebar();
        initSearch();
        initNotifications();
        initProfileDropdown();
        initQuickActions();
        initProfileButtons();
        initAcademicsButtons();
        initAttendanceButtons();
        initResultsButtons();
        initCoursesButtons();
        initDocumentsButtons();
        initSettings();
        initDashboardNotifications();
        initStatCardClicks();
        initMobileMenu();
        initBackToTop();

        // Set initial page from hash or default to dashboard
        const initialPage = location.hash.replace('#', '') || 'dashboard';
        navigateTo(initialPage);

        // Animate counters after preloader finishes
        setTimeout(animateCounters, 3200);

        // Handle browser back/forward
        window.addEventListener('popstate', () => {
            const page = location.hash.replace('#', '') || 'dashboard';
            navigateTo(page);
        });
    }

    // Expose closeModal and sync helpers globally
    window.closeModal = closeModal;
    window.syncStudentData = syncStudentData;
    window.animateCounters = animateCounters;

    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
