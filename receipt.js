/**
 * SevaSetu Official 80G Donation Receipt Generator
 * Uses html2pdf.js to generate and download authentic PDF receipts.
 */

(function () {
    // Helper: Convert number to words in Indian Rupees
    function inWords(num) {
        const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
        const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        num = Math.floor(Number(num) || 0);
        if (num === 0) return 'Zero Rupees Only';

        function convert(n) {
            if (n < 20) return a[n];
            if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : ' ');
            if (n < 1000) return a[Math.floor(n / 100)] + 'Hundred ' + (n % 100 !== 0 ? convert(n % 100) : '');
            if (n < 100000) return convert(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 !== 0 ? convert(n % 1000) : '');
            if (n < 10000000) return convert(Math.floor(n / 100000)) + 'Lakh ' + (n % 100000 !== 0 ? convert(n % 100000) : '');
            return convert(Math.floor(n / 10000000)) + 'Crore ' + (n % 10000000 !== 0 ? convert(n % 10000000) : '');
        }

        return convert(num).trim() + ' Rupees Only';
    }

    // Public download receipt function
    window.downloadDonationReceipt = function (data) {
        if (typeof html2pdf === 'undefined') {
            alert('PDF Generator is loading. Please check internet connection.');
            return;
        }

        const receiptNo = data.id || ('REC-' + Math.floor(100000 + Math.random() * 900000));
        const amount = Number(data.amount) || 0;
        const donorName = data.donorName || data.donor_name || 'Generous Donor';
        const donorEmail = data.donorEmail || data.donor_email || 'donor@sevasetu.org';
        const orgName = data.org || data.org_name || 'General Charity Care Fund';
        const cause = data.type || data.cause_type || 'General Support & Care';
        const date = data.date || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        const paymentMethod = data.method || 'Razorpay Online';

        // Hidden element to render receipt
        const receiptDiv = document.createElement('div');
        receiptDiv.style.cssText = `
            width: 750px;
            padding: 40px;
            background: #ffffff;
            color: #1a1a1a;
            font-family: 'Poppins', Arial, sans-serif;
            border: 2px solid #e0e0e0;
            border-top: 8px solid #ff7b00;
            box-sizing: border-box;
            line-height: 1.5;
        `;

        receiptDiv.innerHTML = `
            <!-- HEADER -->
            <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom: 2px solid #ff7b00; padding-bottom: 20px; margin-bottom: 25px;">
                <div>
                    <h1 style="color: #011232; margin: 0; font-size: 28px; font-weight: 700; display:flex; align-items:center; gap:8px;">
                        <span style="color: #ff7b00;">Seva</span>Setu Foundation
                    </h1>
                    <p style="margin: 4px 0 0; color: #555; font-size: 12px;">Bridging Hearts & Empowering Communities Across India</p>
                    <p style="margin: 2px 0 0; color: #777; font-size: 11px;">Registered NGO | 80G Registration No: <strong>AACTS9281PF20261</strong></p>
                </div>
                <div style="text-align: right;">
                    <div style="background: #fff3e6; border: 1px solid #ff7b00; color: #ff7b00; font-weight: 700; padding: 6px 14px; border-radius: 6px; font-size: 13px; display:inline-block;">
                        DONATION RECEIPT
                    </div>
                    <p style="margin: 8px 0 0; font-size: 12px; color: #333;"><strong>Receipt No:</strong> ${receiptNo}</p>
                    <p style="margin: 2px 0 0; font-size: 12px; color: #333;"><strong>Date:</strong> ${date}</p>
                </div>
            </div>

            <!-- DONOR DETAILS BOX -->
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin-bottom: 25px;">
                <h3 style="margin: 0 0 12px; color: #011232; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px;">
                    Donor Information
                </h3>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 13px;">
                    <div><span style="color: #64748b;">Donor Name:</span> <strong style="color: #0f172a;">${donorName}</strong></div>
                    <div><span style="color: #64748b;">Email Address:</span> <strong style="color: #0f172a;">${donorEmail}</strong></div>
                    <div><span style="color: #64748b;">Payment Method:</span> <strong style="color: #0f172a;">${paymentMethod}</strong></div>
                    <div><span style="color: #64748b;">Transaction Status:</span> <strong style="color: #16a34a;">Verified & Complete</strong></div>
                </div>
            </div>

            <!-- BENEFICIARY & DONATION TABLE -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 13px;">
                <thead>
                    <tr style="background: #011232; color: #ffffff;">
                        <th style="padding: 12px 14px; text-align: left; border-radius: 6px 0 0 0;">Supported Beneficiary / Cause</th>
                        <th style="padding: 12px 14px; text-align: left;">Category</th>
                        <th style="padding: 12px 14px; text-align: right; border-radius: 0 6px 0 0;">Amount (INR)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                        <td style="padding: 14px;">
                            <strong style="color: #011232; font-size: 14px;">${orgName}</strong>
                            <div style="color: #64748b; font-size: 12px; margin-top: 3px;">Dedicated Care Contribution</div>
                        </td>
                        <td style="padding: 14px; color: #334155;">${cause}</td>
                        <td style="padding: 14px; text-align: right; font-size: 16px; font-weight: 700; color: #ff7b00;">
                            ₹ ${amount.toLocaleString('en-IN')}.00
                        </td>
                    </tr>
                    <tr style="background: #fff8f0; font-weight: 700;">
                        <td colspan="2" style="padding: 12px 14px; text-align: right; color: #011232;">Total Amount Donated:</td>
                        <td style="padding: 12px 14px; text-align: right; color: #ff7b00; font-size: 18px;">
                            ₹ ${amount.toLocaleString('en-IN')}.00
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- AMOUNT IN WORDS -->
            <div style="background: #f1f5f9; padding: 10px 14px; border-radius: 6px; font-size: 12px; color: #334155; margin-bottom: 25px;">
                <strong>Amount in Words:</strong> ${inWords(amount)}
            </div>

            <!-- TAX EXEMPTION & STAMP SECTION -->
            <div style="display:flex; justify-content:space-between; align-items:flex-end; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                <div style="max-width: 420px; font-size: 11px; color: #64748b; line-height: 1.6;">
                    <p style="margin: 0 0 6px;"><strong style="color: #0f172a;">Tax Exemption Notice:</strong></p>
                    <p style="margin: 0;">Donations to SevaSetu Foundation are eligible for <strong>50% deduction under Section 80G</strong> of the Income Tax Act, 1961 (Order No. ITBA/EXM/80G/2026-27/00129).</p>
                    <p style="margin: 4px 0 0;">This is a computer-generated receipt and requires no physical signature.</p>
                </div>

                <div style="text-align: center; margin-right: 20px;">
                    <!-- OFFICIAL CIRCULAR SEAL -->
                    <div style="width: 85px; height: 85px; border: 2px dashed #ff7b00; border-radius: 50%; display:flex; flex-direction:column; align-items:center; justify-content:center; margin: 0 auto 6px; color: #ff7b00; font-size: 9px; font-weight: 700; text-align: center; transform: rotate(-5deg);">
                        <span>★ SEVASETU ★</span>
                        <span style="font-size: 8px;">VERIFIED 80G</span>
                        <span style="font-size: 8px;">SEAL</span>
                    </div>
                    <div style="font-size: 11px; color: #011232; font-weight: 600;">Authorized Signatory</div>
                    <div style="font-size: 10px; color: #64748b;">SevaSetu Foundation India</div>
                </div>
            </div>
        `;

        document.body.appendChild(receiptDiv);

        const opt = {
            margin: 10,
            filename: `SevaSetu_Receipt_${receiptNo}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(receiptDiv).save().then(() => {
            receiptDiv.remove();
        }).catch(err => {
            console.error('PDF error:', err);
            receiptDiv.remove();
        });
    };
})();
