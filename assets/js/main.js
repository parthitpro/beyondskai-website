document.addEventListener('DOMContentLoaded', () => {
  // 1. Set minimum date for all date pickers to today (Prevent back dates)
  const todayStr = new Date().toISOString().split('T')[0];
  document.querySelectorAll('input[type="date"]').forEach(dateInput => {
    dateInput.setAttribute('min', todayStr);
  });

  // 2. Intercept all form submissions across all pages
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', async function(e) {
      const action = form.getAttribute('action') || '';
      
      // Only process enquiry / lead forms
      if (!action.includes('enquiry-form.php') && !action.includes('/api/')) {
        return;
      }

      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Submit';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i> Submitting...';
      }

      // Collect all form values
      const formData = new FormData(form);
      const rawData = {};
      formData.forEach((value, key) => {
        if (value && String(value).trim()) {
          rawData[key] = String(value).trim();
        }
      });

      // Normalize fields
      const service = rawData.service_type || 'General Travel Enquiry';
      const name = rawData.name || rawData.full_name || 'Guest';
      const phone = rawData.phone || rawData.whatsapp || rawData.mobile || '';
      
      // Determine destination / route
      let destination = rawData.destination || rawData.country || rawData.destination_country || '';
      if (rawData.origin && rawData.destination) {
        destination = `${rawData.origin} ➔ ${rawData.destination}`;
      } else if (!destination && rawData.currency_type) {
        destination = rawData.currency_type + ' Forex';
      } else if (!destination) {
        destination = 'Bespoke Travel Inquiry';
      }

      // Travel dates
      const travelDate = rawData.date || rawData.checkin_date || rawData.travel_date || '-';

      // Aggregate additional details cleanly
      const detailsList = [];
      if (rawData.checkout_date) detailsList.push(`Check-out: ${rawData.checkout_date}`);
      if (rawData.stay_type) detailsList.push(`Stay: ${rawData.stay_type}`);
      if (rawData.rooms) detailsList.push(`Rooms/Guests: ${rawData.rooms}`);
      if (rawData.cabin_class) detailsList.push(`Cabin: ${rawData.cabin_class}`);
      if (rawData.trip_type) detailsList.push(`Trip: ${rawData.trip_type}`);
      if (rawData.return_date) detailsList.push(`Return: ${rawData.return_date}`);
      if (rawData.visa_type) detailsList.push(`Visa: ${rawData.visa_type}`);
      if (rawData.currency_type) detailsList.push(`Currency: ${rawData.currency_type}`);
      if (rawData.amount) detailsList.push(`Amount: ${rawData.amount}`);
      if (rawData.travelers) detailsList.push(`Travelers: ${rawData.travelers}`);
      if (rawData.email) detailsList.push(`Email: ${rawData.email}`);
      if (rawData.message) detailsList.push(`Message: ${rawData.message}`);
      if (rawData.notes) detailsList.push(`Notes: ${rawData.notes}`);
      const details = detailsList.join(' | ') || 'No additional notes';

      // Create Lead Object
      const now = new Date();
      const leadId = 'BS-' + now.getFullYear().toString().slice(-2) + 
                     String(now.getMonth() + 1).padStart(2, '0') + 
                     String(now.getDate()).padStart(2, '0') + '-' + 
                     Math.random().toString(36).substring(2, 6).toUpperCase();

      const lead = {
        id: leadId,
        timestamp: now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }),
        service: service,
        name: name,
        phone: phone,
        destination: destination,
        date: travelDate,
        details: details,
        page: window.location.pathname.split('/').pop() || 'index.html',
        status: 'New'
      };

      // 1. Store in localStorage (Instant reflection in Admin Panel)
      try {
        const stored = localStorage.getItem('beyondskai_leads');
        const leads = stored ? JSON.parse(stored) : [];
        leads.unshift(lead);
        localStorage.setItem('beyondskai_leads', JSON.stringify(leads));
      } catch (err) {
        console.warn('localStorage lead save notice:', err);
      }

      // 2. Transmit to Google Sheet Webhook
      const defaultSheetUrl = 'https://script.google.com/macros/s/AKfycbxJpQgmZF6ukz-NDNXzgnN76KcPOhfXjtYpBLzx1SkY4_LkiFSRmcl2y0D1X4qXfFXCVA/exec';
      const sheetUrl = localStorage.getItem('beyondskai_sheet_url') || defaultSheetUrl;
      if (sheetUrl) {
        try {
          await fetch(sheetUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lead)
          });
        } catch (postErr) {
          console.warn('Google Sheet background sync notice:', postErr);
        }
      }

      // 3. Reset Button and Form
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
      form.reset();

      // 4. Show Feedback Modal or Alert
      const successModalEl = document.getElementById('enquirySuccessModal');
      if (successModalEl && typeof bootstrap !== 'undefined') {
        const successModal = new bootstrap.Modal(successModalEl);
        successModal.show();
      } else {
        alert("✨ Thank you for choosing Beyond Skai! Your request has been received. Our luxury travel advisor will contact you shortly.");
      }
    });
  });
});
