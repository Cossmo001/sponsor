import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', () => {

    // Handle Form Submission
    const form = document.getElementById('sponsorship-form');
    const submitBtn = document.querySelector('.submit-btn');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Processing request...';
            submitBtn.disabled = true;

            const fullName = document.getElementById('fullName').value;
            const companyName = document.getElementById('companyName').value;
            const companyEmail = document.getElementById('companyEmail').value;
            const personalEmail = document.getElementById('personalEmail').value;
            const phoneNumber = document.getElementById('phoneNumber').value;
            const tier = document.getElementById('tierSelection').value;
            const message = document.getElementById('message').value;
            const logoFile = document.getElementById('logoUpload').files[0];

            let logoUrl = null;

            // Upload to Supabase Storage if an image was selected
            if (logoFile) {
                const fileExt = logoFile.name.split('.').pop();
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}.${fileExt}`;

                const { error: uploadError, data } = await supabase.storage
                    .from('sponsor-logos')
                    .upload(fileName, logoFile);

                if (uploadError) {
                    console.error('Error uploading logo:', uploadError);
                    alert('We had an issue uploading your brand logo, but we will proceed with your registration anyway.');
                } else {
                    const { data: urlData } = supabase.storage
                        .from('sponsor-logos')
                        .getPublicUrl(fileName);
                    logoUrl = urlData.publicUrl;
                }
            }

            // Submit to Supabase
            const { error } = await supabase
                .from('sponsors')
                .insert([
                    {
                        full_name: fullName,
                        company_name: companyName,
                        company_email: companyEmail,
                        personal_email: personalEmail,
                        phone_number: phoneNumber,
                        tier: tier,
                        notes: message,
                        status: 'pending',
                        logo_url: logoUrl
                    }
                ]);

            if (error) {
                console.error('Error submitting sponsorship to Supabase:', error);
                alert('We encountered a database error: ' + error.message + '\n\nWe will proceed to the payment popup anyway so you can complete your payment.');
            }

            // Trigger Paystack Payment
            let amountInKobo = 50000 * 100; // default 50k
            if (tier === 'Silver') amountInKobo = 50000 * 100;
            if (tier === 'Gold') amountInKobo = 100000 * 100;
            if (tier === 'Platinum') amountInKobo = 200000 * 100;

            const handler = PaystackPop.setup({
                key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
                email: personalEmail,
                amount: amountInKobo,
                currency: 'NGN',
                ref: 'TS_' + Math.floor((Math.random() * 1000000000) + 1),
                callback: function(response) {
                    // Show in-page success banner
                    const successBanner = document.getElementById('form-success');
                    if (successBanner) {
                        successBanner.style.display = 'block';
                        successBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.display = 'none';
                    form.reset();
                },
                onClose: function() {
                    alert('Transaction was not completed, window closed. You can try again when you are ready.');
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            });

            handler.openIframe();
        });
    }

});
