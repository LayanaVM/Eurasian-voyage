// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    
    // ===== NAVBAR SCROLL EFFECT =====
    const navbar = document.querySelector('.navbar');
    const scrollIndicator = document.querySelector('.scroll-indicator');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
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
    });

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
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ===== SMOOTH SCROLL REVEAL ANIMATIONS =====
    const revealElements = document.querySelectorAll('.about-content, .dest-block, .ev-footer');
    
    const revealOnScroll = () => {
        const triggerBottom = window.innerHeight * 0.85;
        
        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            
            if (elementTop < triggerBottom) {
                element.classList.add('reveal');
            }
        });
    };
    
    // Initial check
    revealOnScroll();
    
    // Check on scroll with throttle for performance
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (!scrollTimeout) {
            scrollTimeout = setTimeout(function() {
                revealOnScroll();
                scrollTimeout = null;
            }, 50);
        }
    });

    // ===== PARALLAX EFFECT FOR HERO =====
    const heroSection = document.querySelector('.hero');
    
    window.addEventListener('scroll', function() {
        const scrolled = window.scrollY;
        if (heroSection && scrolled < window.innerHeight) {
            const parallaxSpeed = 0.5;
            heroSection.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
        }
    });

    // ===== ENHANCED HOVER EFFECTS FOR DESTINATION BLOCKS =====
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

    // ===== PERFORMANCE OPTIMIZATION =====
    // Use Intersection Observer for better performance
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            threshold: 0.2,
            rootMargin: '0px 0px -100px 0px'
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
});