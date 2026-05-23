/* ==============================================================
   THORAL.DEV — MAIN.JS
   Modular · mobile-friendly · pulido
   ============================================================== */

(() => {
    'use strict';

    // ---------- Feature detection ----------
    const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ============================================================
       1. THEME TOGGLE — con persistencia y respeto a preferencia OS
       ============================================================ */
    (() => {
        const root = document.documentElement;
        const btn = document.getElementById('theme-toggle');
        const icon = document.getElementById('theme-icon');
        const KEY = 'thoral-theme';

        const apply = (theme) => {
            root.setAttribute('data-theme', theme);
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        };

        const saved = localStorage.getItem(KEY);
        apply(saved || 'dark');

        btn.addEventListener('click', () => {
            const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            apply(next);
            localStorage.setItem(KEY, next);
        });
    })();

    /* ============================================================
       2. CUSTOM CURSOR — interpolación suave, solo desktop
       ============================================================ */
    if (!isTouch && !prefersReduced) {
        const dot = document.querySelector('.cursor-dot');
        const ring = document.querySelector('.cursor-ring');
        if (!dot || !ring) return;

        let mx = window.innerWidth / 2;
        let my = window.innerHeight / 2;
        let dx = mx, dy = my;
        let rx = mx, ry = my;
        let initialized = false;

        const onMove = (e) => {
            mx = e.clientX;
            my = e.clientY;
            if (!initialized) {
                dx = rx = mx;
                dy = ry = my;
                dot.classList.add('ready');
                ring.classList.add('ready');
                initialized = true;
            }
        };

        document.addEventListener('mousemove', onMove);

        const animate = () => {
            // Punto: muy responsivo
            dx += (mx - dx) * 0.65;
            dy += (my - dy) * 0.65;
            dot.style.transform = `translate3d(${dx}px, ${dy}px, 0) translate(-50%, -50%)`;

            // Anillo: con lag elegante
            rx += (mx - rx) * 0.16;
            ry += (my - ry) * 0.16;
            ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;

            requestAnimationFrame(animate);
        };
        animate();

        // Hover sobre interactivos
        const hoverables = document.querySelectorAll(
            'a, button, .card, [role="button"], input, textarea, select'
        );
        hoverables.forEach((el) => {
            el.addEventListener('mouseenter', () => {
                dot.classList.add('hovering');
                ring.classList.add('hovering');
            });
            el.addEventListener('mouseleave', () => {
                dot.classList.remove('hovering');
                ring.classList.remove('hovering');
            });
        });

        // Salida/entrada de ventana
        document.addEventListener('mouseleave', () => {
            dot.style.opacity = '0';
            ring.style.opacity = '0';
        });
        document.addEventListener('mouseenter', () => {
            dot.style.opacity = '';
            ring.style.opacity = '';
        });
    }

    /* ============================================================
       3. SCROLL PROGRESS BAR
       ============================================================ */
    (() => {
        const bar = document.querySelector('.scroll-progress');
        if (!bar) return;

        let ticking = false;
        const update = () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            const ratio = max > 0 ? Math.min(1, window.scrollY / max) : 0;
            bar.style.transform = `scaleX(${ratio})`;
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(update);
                ticking = true;
            }
        }, { passive: true });
    })();

    /* ============================================================
       4. STICKY HEADER — clase en vez de inline styles
       ============================================================ */
    (() => {
        const header = document.querySelector('.site-header');
        if (!header) return;

        let ticking = false;
        const update = () => {
            header.classList.toggle('scrolled', window.scrollY > 20);
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(update);
                ticking = true;
            }
        }, { passive: true });
    })();

    /* ============================================================
       5. REVEAL ON SCROLL — IntersectionObserver
       ============================================================ */
    (() => {
        const items = document.querySelectorAll('[data-reveal]');
        if (!items.length) return;

        // Las del hero se revelan al cargar (con un breve delay tras el loader)
        setTimeout(() => {
            document.querySelectorAll('.hero [data-reveal]').forEach((el) => {
                el.classList.add('visible');
            });
        }, prefersReduced ? 0 : 1850);

        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    io.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -60px 0px',
        });

        items.forEach((el) => io.observe(el));
    })();

    /* ============================================================
       6. CARD TILT 3D + GLOW MAGNÉTICO — solo desktop
       ============================================================ */
    if (!isTouch && !prefersReduced) {
        const cards = document.querySelectorAll('[data-tilt]');

        cards.forEach((card) => {
            let rafId = null;

            card.addEventListener('mousemove', (e) => {
                if (rafId) cancelAnimationFrame(rafId);
                rafId = requestAnimationFrame(() => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    card.style.setProperty('--mx', `${x}px`);
                    card.style.setProperty('--my', `${y}px`);

                    const cx = rect.width / 2;
                    const cy = rect.height / 2;
                    const rotateX = ((y - cy) / cy) * -2.8;
                    const rotateY = ((x - cx) / cx) * 2.8;

                    card.style.transform =
                        `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
                });
            });

            card.addEventListener('mouseleave', () => {
                if (rafId) cancelAnimationFrame(rafId);
                card.style.transform = '';
            });
        });
    }

    /* ============================================================
       7. BOTONES MAGNÉTICOS — atracción sutil hacia el cursor
       ============================================================ */
    if (!isTouch && !prefersReduced) {
        const magnetics = document.querySelectorAll('[data-magnetic]');
        const STRENGTH = 0.25;
        const ACTIVATION_RADIUS = 80;

        magnetics.forEach((el) => {
            let rafId = null;

            el.addEventListener('mousemove', (e) => {
                if (rafId) cancelAnimationFrame(rafId);
                rafId = requestAnimationFrame(() => {
                    const rect = el.getBoundingClientRect();
                    const cx = rect.left + rect.width / 2;
                    const cy = rect.top + rect.height / 2;
                    const dx = e.clientX - cx;
                    const dy = e.clientY - cy;
                    const dist = Math.hypot(dx, dy);

                    if (dist < ACTIVATION_RADIUS + rect.width / 2) {
                        el.style.transform =
                            `translate(${dx * STRENGTH}px, ${dy * STRENGTH}px)`;
                    }
                });
            });

            el.addEventListener('mouseleave', () => {
                if (rafId) cancelAnimationFrame(rafId);
                el.style.transform = '';
            });
        });
    }

    /* ============================================================
       8. TYPING ANIMATION — título escrito letra por letra
       ============================================================ */
    (() => {
        const target = document.querySelector('.title-text');
        if (!target || prefersReduced) return;

        const fullText = target.getAttribute('data-text') || target.textContent;
        target.textContent = '';
        target.style.minWidth = '0';

        const SPEED_MIN = 42;
        const SPEED_MAX = 88;

        let i = 0;
        const type = () => {
            if (i < fullText.length) {
                target.textContent += fullText.charAt(i);
                i++;
                const delay = SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN);
                setTimeout(type, delay);
            }
        };

        // Empieza tras: loader (1.9s) + reveal del título (delay 0.30s + transición 0.4s)
        setTimeout(type, 2400);
    })();

    /* ============================================================
       9. GLITCH OCASIONAL — sutil, cada 7-15s, no en hover
       ============================================================ */
    (() => {
        const title = document.querySelector('.title');
        if (!title || prefersReduced) return;

        const trigger = () => {
            title.classList.add('glitching');
            setTimeout(() => title.classList.remove('glitching'), 300);
            const next = 7000 + Math.random() * 8000;
            setTimeout(trigger, next);
        };
        setTimeout(trigger, 6000);
    })();

    /* ============================================================
       10. SMOOTH SCROLL — para anchors internos
       ============================================================ */
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (!href || href === '#' || href.length < 2) return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    /* ============================================================
       11. CONSOLE SIGNATURE
       ============================================================ */
    console.log(
        '%c thoral.dev ',
        'background:#ffb454;color:#0b0d10;font-weight:700;padding:6px 12px;border-radius:4px;font-family:monospace;font-size:13px;'
    );
    console.log(
        '%c> hola, dev curioso. escríbeme: thoraldev@gmail.com',
        'color:#8a8d94;font-family:monospace;font-size:12px;line-height:1.6;'
    );
})();
