/**
 * SevaSetu Real-Time Client SDK
 * Handles WebSockets (Socket.io), Live Notifications, and Backend API Communication
 * with graceful offline/localStorage fallback.
 */

(function () {
    const API_BASE = window.location.origin.startsWith('http') ? window.location.origin : 'http://localhost:5000';
    window.API_BASE = API_BASE;

    // Create Toast Container
    function createToastContainer() {
        if (document.getElementById('sevasetu-toast-container')) return;
        const container = document.createElement('div');
        container.id = 'sevasetu-toast-container';
        container.style.cssText = `
            position: fixed;
            bottom: 25px;
            right: 25px;
            z-index: 99999;
            display: flex;
            flex-direction: column;
            gap: 12px;
            pointer-events: none;
            max-width: 380px;
            width: 90%;
        `;
        document.body.appendChild(container);
    }

    // Show Real-time Floating Toast Alert
    function showLiveToast(message, subtext) {
        createToastContainer();
        const container = document.getElementById('sevasetu-toast-container');

        const toast = document.createElement('div');
        toast.style.cssText = `
            background: linear-gradient(135deg, rgba(1, 18, 50, 0.95), rgba(12, 28, 46, 0.95));
            border: 1px solid #ff7b00;
            border-left: 5px solid #ff7b00;
            color: white;
            padding: 14px 18px;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(255, 123, 0, 0.4);
            backdrop-filter: blur(10px);
            font-family: 'Poppins', sans-serif;
            font-size: 13px;
            display: flex;
            align-items: center;
            gap: 12px;
            pointer-events: auto;
            transform: translateX(120%);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        `;

        toast.innerHTML = `
            <div style="background: rgba(255, 123, 0, 0.2); width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ff7b00; font-size: 18px; flex-shrink: 0;">
                <i class="fa-solid fa-bell"></i>
            </div>
            <div style="flex: 1;">
                <div style="font-weight: 600; color: #fff; margin-bottom: 2px;">⚡ Live Contribution Alert</div>
                <div style="color: #ffd4aa;">${message}</div>
                ${subtext ? `<div style="font-size: 11px; color: #888; margin-top: 2px;">${subtext}</div>` : ''}
            </div>
        `;

        container.appendChild(toast);

        // Slide In
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
        });

        // Auto remove after 5 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(120%)';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 400);
        }, 5000);
    }

    // Connect to Socket.io if available
    let socket = null;
    function initSocket() {
        if (typeof io !== 'undefined') {
            try {
                socket = io(API_BASE);

                socket.on('connect', () => {
                    console.log('⚡ Connected to SevaSetu Real-Time Socket Server');
                });

                // Real-Time Event Listener
                socket.on('new_donation', (data) => {
                    console.log('⚡ Real-Time Donation Received:', data);

                    const don = data.donation;
                    const alertMsg = data.alertMessage || `🎉 ${don.donor_name} donated ₹${don.amount} to ${don.org_name}`;
                    showLiveToast(alertMsg, `Just now via ${don.method || 'Razorpay'}`);

                    // 1. Update any live counter stats on current page
                    if (data.stats) {
                        const totalDonatedEl = document.getElementById('totalDonatedStat') || document.getElementById('statTotalAmount');
                        if (totalDonatedEl) {
                            totalDonatedEl.innerText = `₹ ${data.stats.totalDonated.toLocaleString('en-IN')}`;
                        }
                        const countEl = document.getElementById('donationsCountStat') || document.getElementById('statTotalCount');
                        if (countEl) {
                            countEl.innerText = data.stats.totalDonations;
                        }
                        const orgCountEl = document.getElementById('orgsHelpedStat') || document.getElementById('statOrgCount');
                        if (orgCountEl) {
                            orgCountEl.innerText = data.stats.orgsHelped;
                        }
                    }

                    // 2. Prepend row to table if on history or dashboard page
                    const recentTable = document.getElementById('recentDonationsTable');
                    if (recentTable) {
                        const row = document.createElement('tr');
                        row.style.background = 'rgba(255, 123, 0, 0.15)';
                        row.innerHTML = `
                            <td>Today (Just now)</td>
                            <td><strong>${don.org_name}</strong></td>
                            <td><span style="color:#ddd;">${don.cause_type || 'General Support'}</span></td>
                            <td><strong style="color:#ff7b00;font-size:15px;">₹ ${Number(don.amount).toLocaleString('en-IN')}</strong></td>
                        `;
                        recentTable.insertBefore(row, recentTable.firstChild);
                    }

                    const historyTable = document.getElementById('tableBody');
                    if (historyTable) {
                        const row = document.createElement('tr');
                        row.style.background = 'rgba(255, 123, 0, 0.15)';
                        row.innerHTML = `
                            <td><span class="id-tag">${don.id}</span><br><small style="color:#52b6eb;font-size:11px;"><i class="fa-solid fa-credit-card"></i> ${don.method}</small></td>
                            <td>Today (Just now)</td>
                            <td><strong>${don.org_name}</strong></td>
                            <td><span style="color:#ddd;">${don.cause_type || 'General Support'}</span></td>
                            <td><strong style="color:#ff7b00;font-size:15px;">₹ ${Number(don.amount).toLocaleString('en-IN')}</strong></td>
                            <td><span class="badge-success"><i class="fa-solid fa-check"></i> Success</span></td>
                        `;
                        historyTable.insertBefore(row, historyTable.firstChild);
                    }
                });
            } catch (e) {
                console.warn('Socket.io connection warning:', e);
            }
        }
    }

    // Exported API Helper Functions
    window.SevaSetuAPI = {
        baseUrl: API_BASE,
        showToast: showLiveToast,

        // Auth: Register
        async register(userData) {
            try {
                const res = await fetch(`${API_BASE}/api/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userData)
                });
                return await res.json();
            } catch (err) {
                console.warn('Server offline, using localStorage fallback');
                return { success: false, message: 'Server unreachable. Using local storage mode.' };
            }
        },

        // Auth: Login
        async login(credentials) {
            try {
                const res = await fetch(`${API_BASE}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(credentials)
                });
                return await res.json();
            } catch (err) {
                console.warn('Server offline, using localStorage fallback');
                return { success: false, message: 'Server unreachable' };
            }
        },

        // Payment: Create Razorpay Order
        async createRazorpayOrder(amount, notes) {
            try {
                const res = await fetch(`${API_BASE}/api/payment/create-order`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount, notes })
                });
                return await res.json();
            } catch (err) {
                return { success: false, message: err.message };
            }
        },

        // Donations: Record Completed Donation
        async recordDonation(donationData) {
            try {
                const res = await fetch(`${API_BASE}/api/donations/record`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(donationData)
                });
                return await res.json();
            } catch (err) {
                console.warn('Server offline, local fallback');
                return { success: false, message: err.message };
            }
        },

        // Stats: Fetch Live Aggregations
        async getStats() {
            try {
                const res = await fetch(`${API_BASE}/api/stats`);
                return await res.json();
            } catch (err) {
                return null;
            }
        },

        // Donations: Fetch All
        async getDonations(limit = 50) {
            try {
                const res = await fetch(`${API_BASE}/api/donations?limit=${limit}`);
                return await res.json();
            } catch (err) {
                return null;
            }
        },

        // Auth: Forgot Password (Send OTP)
        async forgotPassword(email) {
            try {
                const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                return await res.json();
            } catch (err) {
                return { success: false, message: 'Server offline. Cannot dispatch OTP.' };
            }
        },

        // Auth: Verify OTP Code
        async verifyOtp(email, otp) {
            try {
                const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, otp })
                });
                return await res.json();
            } catch (err) {
                return { success: false, message: 'Server offline. Cannot verify OTP.' };
            }
        },

        // Auth: Reset Password
        async resetPassword(email, otp, new_password) {
            try {
                const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, otp, new_password })
                });
                return await res.json();
            } catch (err) {
                return { success: false, message: 'Server offline. Cannot reset password.' };
            }
        },

        // Admin: Get Users
        async getAdminUsers(status = 'all') {
            try {
                const res = await fetch(`${API_BASE}/api/admin/users?status=${status}`);
                return await res.json();
            } catch (err) {
                return { success: false, message: 'Server offline' };
            }
        },

        // Admin: Approve User
        async approveUser(userId) {
            try {
                const res = await fetch(`${API_BASE}/api/admin/approve-user`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: userId })
                });
                return await res.json();
            } catch (err) {
                return { success: false, message: 'Server offline' };
            }
        },

        // Admin: Reject User
        async rejectUser(userId, reason) {
            try {
                const res = await fetch(`${API_BASE}/api/admin/reject-user`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: userId, reason })
                });
                return await res.json();
            } catch (err) {
                return { success: false, message: 'Server offline' };
            }
        },

        // Admin: Stats
        async getAdminStats() {
            try {
                const res = await fetch(`${API_BASE}/api/admin/stats`);
                return await res.json();
            } catch (err) {
                return null;
            }
        }
    };

    // Auto-init on page load
    window.addEventListener('DOMContentLoaded', () => {
        initSocket();
    });
})();
