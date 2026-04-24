document.addEventListener('DOMContentLoaded', () => {
    // Scroll Animation Observer (slide-up elements)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.05
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

    // Dynamic glow effect on mouse movement
    document.addEventListener('mousemove', (e) => {
        const orbs = document.querySelectorAll('.glow-orb');
        if (orbs.length < 3) return;
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;

        orbs[0].style.transform = `translate(${x * 30}px, ${y * 30}px)`;
        orbs[1].style.transform = `translate(${-x * 40}px, ${-y * 40}px)`;
        orbs[2].style.transform = `translate(${x * 20}px, ${-y * 20}px)`;
    });

    // Handle Image Preview
    const logoUpload = document.getElementById('logoUpload');
    const logoPreview = document.getElementById('logoPreview');
    const uploadLabel = document.querySelector('.upload-label');
    
    if (logoUpload && logoPreview) {
        logoUpload.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    logoPreview.src = e.target.result;
                    logoPreview.style.display = 'block';
                    uploadLabel.textContent = file.name;
                }
                reader.readAsDataURL(file);
            } else {
                logoPreview.style.display = 'none';
                logoPreview.src = '';
                uploadLabel.textContent = 'Choose an image';
            }
        });
    }

    // Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }
});
