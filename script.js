// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {

    // ===== HERO IMAGE PRELOAD & PAINT FIX =====
    (function heroPaintFix() {
        const heroEl = document.querySelector('.hero');
        if (!heroEl) return;

            let heroImgEl = document.querySelector('.hero-bg');


        // If there's no <img class="hero-bg">, create and prepend it
        if (!heroImgEl) {
            heroImgEl = document.createElement('img');
            heroImgEl.className = 'hero-bg';
            // keep src empty for now; we'll set it after preload/decode
            heroImgEl.alt = 'Hero background';
            // prefer eager loading for hero so browser fetches it early
            heroImgEl.setAttribute('loading', 'eager');
            heroImgEl.setAttribute('decoding', 'async');
            // Insert as first child so it appears visually behind content when z-index handled by CSS
            heroEl.insertBefore(heroImgEl, heroEl.firstChild);
        }

        const imgPath = 'images/hehe.jpg';
heroImgEl.src = imgPath;
requestAnimationFrame(() => {
        setTimeout(() => {
            heroImgEl.classList.add('visible');
            heroImgEl.style.transform = 'translateZ(0)'; // Force GPU acceleration
        }, 50);
    });

    // Also listen for load event for smoother transition
    heroImgEl.addEventListener('load', function() {
        this.classList.add('visible');
    });
})();
        // Defensive: remove any problematic CSS that could block painting
        try {
            // remove background-attachment: fixed if present
            const computed = getComputedStyle(heroEl);
            if (computed.backgroundAttachment === 'fixed') {
                heroEl.style.backgroundAttachment = 'scroll';
            }
            // hide any ::before-generated background by adding a class / inline style
            // (we can't directly target ::before from JS, but we can ensure hero has no conflicting background image)
            heroEl.style.backgroundImage = 'none';
        } catch (e) {
            // ignore
        }

        // helper to show image (fade-in via class)
        function showHeroImage(srcToSet) {
            // Set src if not already set (prevents double-download)
            if (heroImgEl.src !== srcToSet) {
                heroImgEl.src = srcToSet;
            }

            // Force layout/read to prompt paint, then add class to fade-in:
            

        // Preload + decode image using Image() to ensure it's downloaded and decoded before showing
        const preloadImg = new Image();
        preloadImg.src = imgPath;
        // optional CORS line — remove if unnecessary or causing issues
        // preloadImg.crossOrigin = 'anonymous';

        if ('decode' in preloadImg) {
            preloadImg.decode().then(() => {
                showHeroImage(preloadImg.src);
            }).catch(() => {
                // If decode fails, fall back to load event
                preloadImg.onload = () => showHeroImage(preloadImg.src);
                preloadImg.onerror = () => {
                    // fallback: set src directly to avoid blank screen
                    showHeroImage(preloadImg.src);
                };
            });
        } else {
            // older browsers: use load event
            preloadImg.onload = () => showHeroImage(preloadImg.src);
            preloadImg.onerror = () => {
                // still try to show whatever src exists
                showHeroImage(preloadImg.src);
            };
        }

        // Safety fallback: if not painted within 1s, force visible (prevents indefinite blank)
        setTimeout(() => {
            if (!heroImgEl.classList.contains('visible')) {
                heroImgEl.classList.add('visible');
                heroImgEl.style.transform = 'translateZ(0)';
            }
        }, 1000);
    })();


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
    const revealElements = document.querySelectorAll('.about-content, .dest-block, .ev-footer');

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
        document.querySelectorAll('.dest-block, .about-content, .ev-footer').forEach(element => {
            element.style.transition = 'opacity 0.3s ease';
        });
    }

    // ===== MOBILE MENU FUNCTIONALITY (IF HAMBURGER ADDED LATER) =====
    const createMobileMenu = () => {
        if (window.innerWidth <= 600) {
            const navLinksContainer = document.querySelector('.nav-links');
            if (navLinksContainer && !document.querySelector('.mobile-menu-toggle')) {
                // Could add hamburger menu functionality here if needed
            }
        }
    };

    // ===== PERFORMANCE MONITORING (DEVELOPMENT) =====
    if (window.performance && window.performance.now) {
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            console.log(`🚀 Page loaded in ${loadTime.toFixed(2)}ms`);
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

});
