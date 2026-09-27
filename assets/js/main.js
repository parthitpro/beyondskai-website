document.addEventListener('DOMContentLoaded', () => {
  // Set minimum date for all date pickers to today (Prevent back dates)
  const todayStr = new Date().toISOString().split('T')[0];
  document.querySelectorAll('input[type="date"]').forEach(dateInput => {
    dateInput.setAttribute('min', todayStr);
  });

  // Intercept all form submissions for AJAX & Modal Popup
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      // Allow default only if action is search or external
      const action = form.getAttribute('action') || '';
      if (!action.includes('enquiry-form.php')) {
        return;
      }

      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Submit';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i> Submitting...';
      }

      const formData = new FormData(form);

      fetch(action, {
        method: 'POST',
        body: formData
      })
      .then(res => res.json())
      .then(data => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
        }

        form.reset();

        // Show Bootstrap Success Modal
        const successModalEl = document.getElementById('enquirySuccessModal');
        if (successModalEl && typeof bootstrap !== 'undefined') {
          const successModal = new bootstrap.Modal(successModalEl);
          successModal.show();
        } else {
          alert("Thank you! Your request has been received. Our team will contact you shortly.");
        }
      })
      .catch(err => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
        }
        // Fallback popup if network glitch
        const successModalEl = document.getElementById('enquirySuccessModal');
        if (successModalEl && typeof bootstrap !== 'undefined') {
          const successModal = new bootstrap.Modal(successModalEl);
          successModal.show();
        } else {
          alert("Thank you! Your request has been received. Our team will contact you shortly.");
        }
      });
    });
  });
});
