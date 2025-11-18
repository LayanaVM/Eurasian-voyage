// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {

    // ===== DETECT MOBILE DEVICE =====
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    // ===== PERFORMANCE OPTIMIZATION VARIABLES =====
    let ticking = false;
    let lastScrollY = 0;

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

    // Throttled scroll event for navbar
    window.addEventListener('scroll', requestNavbarUpdate, { passive: true });

    // ===== ENHANCED SMOOTH SCROLL FOR ALL NAVIGATION LINKS =====
    const smoothScrollTo = (targetElement) => {
        if (!targetElement) return;

        const navbarHeight = navbar ? navbar.offsetHeight : 0;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;

        // Use native smooth scroll with fallback
        if ('scrollBehavior' in document.documentElement.style) {
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        } else {
            // Fallback for browsers without smooth scroll support
            const startPosition = window.pageYOffset;
            const distance = targetPosition - startPosition;
            const duration = 800;
            let startTime = null;

            function animation(currentTime) {
                if (startTime === null) startTime = currentTime;
                const timeElapsed = currentTime - startTime;
                const progress = Math.min(timeElapsed / duration, 1);

                // Easing function (ease-in-out)
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

    // Apply smooth scroll to ALL navigation links
    const allNavLinks = document.querySelectorAll('a[href^="#"]');

    allNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');

            // Skip if it's just "#" or empty
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

    // ===== SMOOTH SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER) =====
    // Include package cards in the reveal elements
    const revealElements = document.querySelectorAll('.about-content, .dest-block, .package-card, .ev-footer');

    // Use Intersection Observer for better performance
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

        // Observe all reveal elements
        revealElements.forEach(element => {
            observer.observe(element);
        });
    } else {
        // Fallback for older browsers
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

    // ===== PARALLAX EFFECT FOR HERO (DISABLED ON MOBILE FOR PERFORMANCE) =====
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

    // ===== ENHANCED HOVER EFFECTS FOR DESTINATION BLOCKS (DESKTOP ONLY) =====
    if (!isMobile) {
        const destBlocks = document.querySelectorAll('.dest-block');

        destBlocks.forEach(block => {
            const img = block.querySelector('.dest-img img');

            block.addEventListener('mouseenter', function() {
                if (img) {
                    img.style.transform = 'scale(1.05)';
                }
            });

            block.addEventListener('mouseleave', function() {
                if (img) {
                    img.style.transform = 'scale(1)';
                }
            });
        });
    }

    // ===== MOBILE TOUCH INTERACTIONS =====
    if (isMobile) {
        // Add touch feedback for destination blocks
        const destBlocks = document.querySelectorAll('.dest-block');

        destBlocks.forEach(block => {
            const img = block.querySelector('.dest-img img');

            // Add touch start for immediate feedback
            block.addEventListener('touchstart', function() {
                if (img) {
                    img.style.transition = 'transform 0.3s ease';
                    img.style.transform = 'scale(0.98)';
                }
            }, { passive: true });

            // Reset on touch end
            block.addEventListener('touchend', function() {
                if (img) {
                    setTimeout(() => {
                        img.style.transform = 'scale(1)';
                    }, 100);
                }
            }, { passive: true });
        });

        // Touch feedback for nav links
        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            link.addEventListener('touchstart', function() {
                this.style.opacity = '0.6';
            }, { passive: true });

            link.addEventListener('touchend', function() {
                this.style.opacity = '1';
            }, { passive: true });
        });

        // Optimize scroll for iOS
        if (isIOS) {
            document.body.style.webkitOverflowScrolling = 'touch';
        }
    }

    // ===== DEBOUNCED WINDOW RESIZE HANDLER =====
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            updateNavbar();
        }, 250);
    }, { passive: true });

    // ===== LAZY LOADING FOR IMAGES (PERFORMANCE BOOST) =====
    if ('loading' in HTMLImageElement.prototype) {
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => {
            img.src = img.dataset.src || img.src;
        });
    } else {
        // Fallback for browsers that don't support native lazy loading
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                        }
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img.lazy').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    // ===== REDUCE MOTION FOR ACCESSIBILITY =====
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (prefersReducedMotion.matches) {
        // Disable parallax and complex animations
        if (heroSection) {
            heroSection.style.transform = 'none';
        }

        // Simplify animations
        document.querySelectorAll('.dest-block, .about-content, .package-card, .ev-footer').forEach(element => {
            element.style.transition = 'opacity 0.3s ease';
        });
    }

    // ===== INITIAL ANIMATIONS =====
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);

    // ===== SCROLL TO TOP BUTTON (OPTIONAL - FOR MOBILE) =====
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

    // Create scroll to top button on mobile
    if (isMobile) {
        createScrollToTop();
    }

    // ===== PREVENT ZOOM ON DOUBLE TAP (iOS) =====
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

    // ===== ADD VIEWPORT HEIGHT FIX FOR MOBILE BROWSERS =====
    const setVH = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);

    // ===== PERFORMANCE MONITORING (DEVELOPMENT) =====
    if (window.performance && window.performance.now) {
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            console.log(`🚀 Page loaded in ${loadTime.toFixed(2)}ms`);
        });
    }

});