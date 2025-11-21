// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {

    // ===== DETECT MOBILE DEVICE =====
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    // ===== PERFORMANCE OPTIMIZATION VARIABLES =====
    let ticking = false;
    let lastScrollY = 0;

    // ===== HAMBURGER MENU TOGGLE FIX =====
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        // Toggle menu when hamburger is clicked
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close menu when a nav link is clicked
        const navItems = navLinks.querySelectorAll('a');
        navItems.forEach(item => {
            item.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInsideNav = navLinks.contains(event.target);
            const isClickOnHamburger = hamburger.contains(event.target);

            if (!isClickInsideNav && !isClickOnHamburger && navLinks.classList.contains('active')) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
    }

    // ===== NAVBAR SCROLL EFFECT (OPTIMIZED) =====
    const navbar = document.querySelector('.navbar');
    const scrollIndicator = document.querySelector('.scroll-indicator');

    function updateNavbar() {
        const scrollY = window.scrollY;

        if (scrollY > 100) {
            navbar && navbar.classList.add('scrolled');
            if (scrollIndicator) {
                scrollIndicator.style.opacity = '0';
            }
        } else {
            navbar && navbar.classList.remove('scrolled');
            if (scrollIndicator) {
                scrollIndicator.style.opacity = '1';
            }
        }

        lastScrollY = scrollY;
        ticking = false;
    }

    function requestNavbarUpdate() {
        if (!ticking) {
            requestAnimationFrame(updateNavbar);
            ticking = true;
        }
    }

    window.addEventListener('scroll', requestNavbarUpdate, { passive: true });

    // ===== SMOOTH SCROLL =====
    const smoothScrollTo = (targetElement) => {
        if (!targetElement) return;

        const navbarHeight = navbar ? navbar.offsetHeight : 0;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;

        if ('scrollBehavior' in document.documentElement.style) {
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        } else {
            const startPosition = window.pageYOffset;
            const distance = targetPosition - startPosition;
            const duration = 800;
            let startTime = null;

            function animation(currentTime) {
                if (startTime === null) startTime = currentTime;
                const timeElapsed = currentTime - startTime;
                const progress = Math.min(timeElapsed / duration, 1);

                const ease = progress < 0.5
                    ? 4 * progress * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 3) / 2;

                window.scrollTo(0, startPosition + distance * ease);

                if (timeElapsed < duration) {
                    requestAnimationFrame(animation);
                }
            }

            requestAnimationFrame(animation);
        }
    };

    const allNavLinks = document.querySelectorAll('a[href^="#"]');

    allNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');

            if (!targetId || targetId === '#') {
                e.preventDefault();
                return;
            }

            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                e.preventDefault();
                smoothScrollTo(targetSection);
            }
        });
    });

    // ===== SMOOTH SCROLL REVEAL (FIXED ANIMATION TIMING) =====
    const revealElements = document.querySelectorAll('.about-content, .dest-block, .package-card, .ev-footer');

    // Remove all animation delays (ensures equal loading)
    document.querySelectorAll('.dest-block, .package-card').forEach(el => {
        el.style.animationDelay = '0s';
    });

    if ('IntersectionObserver' in window) {
        const observerOptions = {
            threshold: isMobile ? 0.05 : 0.15,
            rootMargin: isMobile ? '0px 0px -30px 0px' : '0px 0px -80px 0px'
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal');
                }
            });
        }, observerOptions);

        revealElements.forEach(element => {
            observer.observe(element);
        });
    } else {
        const revealOnScroll = () => {
            const triggerBottom = window.innerHeight * 0.85;

            revealElements.forEach(element => {
                const elementTop = element.getBoundingClientRect().top;

                if (elementTop < triggerBottom) {
                    element.classList.add('reveal');
                }
            });
        };

        revealOnScroll();
        window.addEventListener('scroll', revealOnScroll, { passive: true });
    }

    // ===== PARALLAX EFFECT (Disabled on mobile) =====
    const heroSection = document.querySelector('.hero');

    if (!isMobile && heroSection) {
        let heroTicking = false;

        function updateParallax() {
            const scrolled = window.scrollY;
            if (scrolled < window.innerHeight) {
                const parallaxSpeed = 0.5;
                heroSection.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
            }
            heroTicking = false;
        }

        window.addEventListener('scroll', function() {
            if (!heroTicking) {
                requestAnimationFrame(updateParallax);
                heroTicking = true;
            }
        }, { passive: true });
    }

    // ===== HOVER EFFECTS FOR DESTINATIONS =====
    if (!isMobile) {
        const destBlocks = document.querySelectorAll('.dest-block');

        destBlocks.forEach(block => {
            const img = block.querySelector('.dest-img img');

            block.addEventListener('mouseenter', function() {
                if (img) img.style.transform = 'scale(1.05)';
            });

            block.addEventListener('mouseleave', function() {
                if (img) img.style.transform = 'scale(1)';
            });
        });
    }

    // ===== MOBILE TOUCH FEEDBACK =====
    if (isMobile) {
        const destBlocks = document.querySelectorAll('.dest-block');

        destBlocks.forEach(block => {
            const img = block.querySelector('.dest-img img');

            block.addEventListener('touchstart', function() {
                if (img) {
                    img.style.transition = 'transform 0.3s ease';
                    img.style.transform = 'scale(0.98)';
                }
            }, { passive: true });

            block.addEventListener('touchend', function() {
                if (img) {
                    setTimeout(() => {
                        img.style.transform = 'scale(1)';
                    }, 100);
                }
            }, { passive: true });
        });
    }

    // ===== WINDOW RESIZE FIX =====
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            updateNavbar();
        }, 250);
    }, { passive: true });

    // ===== LAZY LOADING =====
    if ('loading' in HTMLImageElement.prototype) {
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => {
            img.src = img.dataset.src || img.src;
        });
    }

    // ===== REDUCE MOTION SUPPORT =====
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) {
        if (heroSection) heroSection.style.transform = 'none';

        document.querySelectorAll('.dest-block, .about-content, .package-card, .ev-footer').forEach(element => {
            element.style.transition = 'opacity 0.3s ease';
        });
    }

    // ===== INITIAL ANIMATION =====
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);

    // ===== MOBILE SCROLL TO TOP =====
    const createScrollToTop = () => {
        const scrollBtn = document.createElement('button');
        scrollBtn.className = 'scroll-to-top';
        scrollBtn.innerHTML = '↑';
        scrollBtn.setAttribute('aria-label', 'Scroll to top');
        document.body.appendChild(scrollBtn);

        scrollBtn.addEventListener('click', () => {
            smoothScrollTo(document.querySelector('#home') || document.body);
        });

        let scrollBtnTicking = false;
        window.addEventListener('scroll', () => {
            if (!scrollBtnTicking) {
                requestAnimationFrame(() => {
                    if (window.scrollY > 500) {
                        scrollBtn.classList.add('visible');
                    } else {
                        scrollBtn.classList.remove('visible');
                    }
                    scrollBtnTicking = false;
                });
                scrollBtnTicking = true;
            }
        }, { passive: true });
    };

    if (isMobile) createScrollToTop();

    // ===== DISABLE DOUBLE-TAP ZOOM FOR IOS =====
    if (isIOS) {
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, { passive: false });
    }

    // ===== FIX VH UNIT ON MOBILE =====
    const setVH = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListAener('orientationchange', setVH);

});