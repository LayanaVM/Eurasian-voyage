// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    
    // ===== DETECT MOBILE DEVICE =====
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    // ===== PERFORMANCE OPTIMIZATION VARIABLES =====
    let ticking = false;
    let lastScrollY = 0;
    let lastScrollTime = Date.now();
    
    // ===== NAVBAR SCROLL EFFECT (OPTIMIZED) =====
    const navbar = document.querySelector('.navbar');
    const scrollIndicator = document.querySelector('.scroll-indicator');
    
    function updateNavbar() {
        const scrollY = window.scrollY;
        
        if (scrollY > 100) {
            navbar.classList.add('scrolled');
            if (scrollIndicator) {
                scrollIndicator.style.opacity = '0';
            }
        } else {
            navbar.classList.remove('scrolled');
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

    // ===== SMOOTH SCROLL FOR NAVIGATION LINKS =====
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const navbarHeight = navbar.offsetHeight;
                const targetPosition = targetSection.offsetTop - navbarHeight;
                
                // Use smooth scroll behavior
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ===== SMOOTH SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER) =====
    const revealElements = document.querySelectorAll('.about-content, .dest-block, .ev-footer');
    
    // Use Intersection Observer for better performance (works great on mobile)
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            threshold: isMobile ? 0.1 : 0.2,
            rootMargin: isMobile ? '0px 0px -50px 0px' : '0px 0px -100px 0px'
        };
        
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal');
                    // Optional: unobserve after reveal for better performance
                    // observer.unobserve(entry.target);
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
                    img.style.transform = 'scale(1.05) rotateY(5deg)';
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
                    img.style.transform = 'scale(1)';
                }
            }, { passive: true });
        });
        
        // Optimize scroll for iOS
        if (isIOS) {
            document.body.style.webkitOverflowScrolling = 'touch';
        }
    }

    // ===== SMOOTH SCROLL FOR ANCHOR LINKS IN FOOTER =====
    const footerLinks = document.querySelectorAll('.ev-col a[href^="#"]');
    
    footerLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const navbarHeight = navbar.offsetHeight;
                    const targetPosition = target.offsetTop - navbarHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // ===== TOUCH-FRIENDLY NAV LINKS (MOBILE) =====
    if (isMobile) {
        navLinks.forEach(link => {
            // Add visual feedback on touch
            link.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.95)';
            }, { passive: true });
            
            link.addEventListener('touchend', function() {
                this.style.transform = 'scale(1)';
            }, { passive: true });
        });
    }

    // ===== PREVENT SCROLL BOUNCE ON IOS (OPTIONAL) =====
    if (isIOS) {
        let scrollPos = 0;
        
        document.body.addEventListener('touchstart', function(e) {
            scrollPos = window.scrollY;
        }, { passive: true });
        
        document.body.addEventListener('touchmove', function(e) {
            // Allow natural scrolling
        }, { passive: true });
    }

    // ===== DEBOUNCED WINDOW RESIZE HANDLER =====
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            // Recalculate heights or positions if needed
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
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img.lazy').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // ===== SMOOTH SCROLL POLYFILL FOR OLDER BROWSERS =====
    if (!('scrollBehavior' in document.documentElement.style)) {
        // Simple smooth scroll polyfill
        const smoothScroll = function(targetY, duration) {
            const startY = window.scrollY;
            const difference = targetY - startY;
            const startTime = performance.now();
            
            const step = function(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function (ease-in-out)
                const easing = progress < 0.5
                    ? 4 * progress * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
                
                window.scrollTo(0, startY + difference * easing);
                
                if (progress < 1) {
                    requestAnimationFrame(step);
                }
            };
            
            requestAnimationFrame(step);
        };
        
        // Override scroll behavior
        window.scrollTo = (function(originalScrollTo) {
            return function(x, y) {
                if (typeof x === 'object' && x.behavior === 'smooth') {
                    smoothScroll(x.top, 500);
                } else {
                    originalScrollTo.call(window, x, y);
                }
            };
        })(window.scrollTo);
    }

    // ===== PRELOAD CRITICAL CONTENT =====
    const preloadImages = document.querySelectorAll('link[rel="preload"][as="image"]');
    
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

    // ===== PERFORMANCE MONITORING (DEVELOPMENT) =====
    if (window.performance && window.performance.now) {
        const loadTime = performance.now();
        console.log(`🚀 Page loaded in ${loadTime.toFixed(2)}ms`);
    }

    // ===== INITIAL ANIMATIONS =====
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);

});