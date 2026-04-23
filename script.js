import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', () => {
    // Scroll Animation Observer (slide-up elements)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Determine if there is a stagger delay assigned via inline CSS --delay
                const delay = entry.target.style.getPropertyValue('--delay') || 0;
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, delay * 150); // 150ms stagger per item
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const slideUpElements = document.querySelectorAll('.slide-up');
    slideUpElements.forEach(el => observer.observe(el));


    // Pre-fill Tier Dropdown when clicking Tier Buttons
    const tierButtons = document.querySelectorAll('.tier-btn');
    const tierSelect = document.getElementById('tierSelection');

    tierButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tierVal = e.target.getAttribute('data-tier');
            if (tierVal && tierSelect) {
                // Find matching option
                for(let i=0; i<tierSelect.options.length; i++) {
                    if (tierSelect.options[i].value === tierVal) {
                        tierSelect.selectedIndex = i;
                        break;
                    }
                }
            }
        });
    });

    // Handle Form Submission
    const form = document.getElementById('sponsorship-form');
    const submitBtn = document.querySelector('.submit-btn');

    if(form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Processing request...';
            submitBtn.disabled = true;

            const companyName = document.getElementById('companyName').value;
            const email = document.getElementById('email').value;
            const tier = document.getElementById('tierSelection').value;
            const message = document.getElementById('message').value;

            // Submit to Supabase
            const { error } = await supabase
                .from('sponsors')
                .insert([
                    {
                        company_name: companyName,
                        email: email,
                        tier: tier,
                        notes: message,
                        status: 'pending'
                    }
                ]);

            if (error) {
                console.error('Error submitting sponsorship:', error);
                alert('We encountered an error. Please try again.');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                return;
            }

            // Simulate API request/submission for payment link
            setTimeout(() => {
                alert('Thank you for choosing to sponsor "Operation Freewill". Your details have been secured. A payment link setup is in progress and you will be contacted shortly.');
                
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                form.reset();
            }, 1000);
        });
    }

    // Dynamic glow effect on mouse movement
    document.addEventListener('mousemove', (e) => {
        const orbs = document.querySelectorAll('.glow-orb');
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;

        orbs[0].style.transform = `translate(${x * 30}px, ${y * 30}px)`;
        orbs[1].style.transform = `translate(${-x * 40}px, ${-y * 40}px)`;
        orbs[2].style.transform = `translate(${x * 20}px, ${-y * 20}px)`;
    });
});
