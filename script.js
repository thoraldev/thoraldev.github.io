document.addEventListener('DOMContentLoaded', () => {

    // Theme Toggle
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    const icon = themeToggle.querySelector('i');

    const savedTheme = localStorage.getItem('theme') || 'dark';
    html.setAttribute('data-theme', savedTheme);
    icon.className = savedTheme === 'light' ? 'fas fa-sun' : 'fas fa-moon';

    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        icon.className = newTheme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
    });

    // Scroll Progress Indicator
    window.addEventListener('scroll', () => {
        const scrollIndicator = document.querySelector('.scroll-indicator');
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = (window.scrollY / scrollHeight) * 100;
        scrollIndicator.style.width = scrolled + '%';
    });

    // Download function (Simulación)
    function downloadProject(filename) {
        // ... (tu lógica de descarga) ...
    }

    // Smooth reveal on scroll (IntersectionObserver)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    document.querySelectorAll('.project-card').forEach(card => {
        observer.observe(card);
    });

    // Parallax effect on hero (Optimizado con rAF)
    const heroSection = document.querySelector('.hero');
    let parallaxTicking = false;
    function applyHeroParallax() {
        const scrolled = window.scrollY;
        heroSection.style.transform = `translateY(${scrolled * 0.1}px)`;
        parallaxTicking = false;
    }
    window.addEventListener('scroll', () => {
        if (!parallaxTicking) {
            window.requestAnimationFrame(applyHeroParallax);
            parallaxTicking = true;
        }
    });

    // Ripple effect on buttons
    document.querySelectorAll('.download-btn, .contact-btn, .theme-toggle, .project-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            if (this.tagName === 'A' && e.target.closest('[data-magnetic]')) {
               // e.preventDefault(); 
            }
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(255, 255, 255, 0.5)';
            ripple.style.pointerEvents = 'none';
            ripple.style.animation = 'ripple 0.6s ease-out';
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });

    // --- Efectos de Cursor y Botones Magnéticos ---
    const cursorGlow = document.getElementById('cursor-glow');
    let cursorTicking = false;
    
    // 1. Efecto Cursor Glow (optimizado con rAF)
    function updateCursorGlow(e) {
        if (cursorGlow) { // Verifica si el elemento existe
            cursorGlow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
        }
        cursorTicking = false;
    }

    window.addEventListener('mousemove', (e) => {
        if (!cursorTicking) {
            window.requestAnimationFrame(() => updateCursorGlow(e));
            cursorTicking = true;
        }
    });
    // --- Efecto 3D Tilt ---
    VanillaTilt.init(document.querySelectorAll(".project-card, .hero"), {
        max: 10,     // Inclinación máxima
        speed: 400,  // Velocidad
        glare: true, // Añade un reflejo
    "   max-glare": 0.2 // Intensidad del reflejo
    });

    // 2. Efecto Botones Magnéticos
    const magneticButtons = document.querySelectorAll('[data-magnetic]');
    const magneticStrength = 0.4; 

    magneticButtons.forEach(button => {
        button.addEventListener('mousemove', (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            button.style.transform = `translate(${x * magneticStrength}px, ${y * magneticStrength * 1.2}px) scale(1.05)`;
            
            const innerEl = button.querySelector('span') || button.querySelector('i');
            if (innerEl) {
                innerEl.style.transform = `translate(${-x * magneticStrength * 0.5}px, ${-y * magneticStrength * 0.5}px)`;
            }
        });

        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translate(0, 0) scale(1)';
            const innerEl = button.querySelector('span') || button.querySelector('i');
            if (innerEl) {
                innerEl.style.transform = 'translate(0, 0)';
            }
        });
    });

}); // Fin del DOMContentLoaded
