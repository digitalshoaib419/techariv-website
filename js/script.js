function handleActiveNav() {
    // This function needs to run *after* the header is loaded.
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPath = window.location.pathname;

    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        // Check if the link's href is a substring of the current path.
        // This handles nested paths like /services/email-marketing.html
        if (currentPath.endsWith(linkPath)) {
            // Exact match, like /aboutus.html
            link.classList.add('active');

            // Also highlight the parent dropdown link if it's inside one
            const parentDropdown = link.closest('.dropdown');
            if (parentDropdown) {
                parentDropdown.querySelector('.nav-link').classList.add('active');
            }
        } else if (linkPath === '/index.html' && (currentPath === '/' || currentPath.endsWith('/index.html'))) {
            // Special case for home page
            link.classList.add('active');
        }
    });
}
function handleAnimations() {
    // Intersection Observer for animations
    const animatedElements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .stagger-children-fade, .text-reveal');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                if (entry.target.classList.contains('stagger-children-fade')) {
                    const children = entry.target.children;
                    for (let i = 0; i < children.length; i++) {
                        children[i].style.transitionDelay = `${i * 0.15}s`;
                    }
                }

                observer.unobserve(entry.target); // Optional: stop observing once animated
            }
        });
    }, {
        threshold: 0.1 // Trigger when 10% of the element is visible
    });

    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

function handlePointer() {
    const pointerRing = document.querySelector('.pointer');
    const pointerDot = document.querySelector('.pointer-dot');
    if (!pointerRing || !pointerDot) return;

    window.addEventListener('mousemove', e => {
        pointerRing.style.left = `${e.clientX}px`;
        pointerRing.style.top = `${e.clientY}px`;
        
        pointerDot.style.left = `${e.clientX}px`;
        pointerDot.style.top = `${e.clientY}px`;
    });

    const interactiveElements = document.querySelectorAll('a, button, h1, h2, h3');

    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            pointerRing.classList.add('hover');
            pointerDot.classList.add('hover');
        });

        el.addEventListener('mouseleave', () => {
            pointerRing.classList.remove('hover');
            pointerDot.classList.remove('hover');
        });
    });
}

function handleParticleBackground() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    const mouse = { x: null, y: null, radius: 120 };

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        const heroSection = document.getElementById('hero');
        canvas.height = heroSection ? heroSection.offsetHeight : window.innerHeight;
    }

    window.addEventListener('resize', () => {
        resizeCanvas();
        init();
    });

    window.addEventListener('mousemove', (event) => {
        mouse.x = event.x;
        mouse.y = event.y;
    });
    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    class Particle {
        constructor(x, y, directionX, directionY, size, color) {
            this.x = x;
            this.y = y;
            this.directionX = directionX;
            this.directionY = directionY;
            this.size = size;
            this.color = color;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = 'rgba(0, 174, 255, 0.5)';
            ctx.fill();
        }
        update() {
            if (this.x > canvas.width || this.x < 0) this.directionX = -this.directionX;
            if (this.y > canvas.height || this.y < 0) this.directionY = -this.directionY;
            this.x += this.directionX;
            this.y += this.directionY;
            this.draw();
        }
    }

    function init() {
        particles = [];
        let numberOfParticles = (canvas.height * canvas.width) / 12000;
        for (let i = 0; i < numberOfParticles; i++) {
            let size = (Math.random() * 1.5) + 1;
            let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
            let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
            let directionX = (Math.random() * .4) - .2;
            let directionY = (Math.random() * .4) - .2;
            particles.push(new Particle(x, y, directionX, directionY, size));
        }
    }

    function connect() {
        let opacityValue = 1;
        for (let a = 0; a < particles.length; a++) {
            for (let b = a; b < particles.length; b++) {
                let distance = ((particles[a].x - particles[b].x) * (particles[a].x - particles[b].x))
                             + ((particles[a].y - particles[b].y) * (particles[a].y - particles[b].y));
                if (distance < (canvas.width/7) * (canvas.height/7)) {
                    opacityValue = 1 - (distance/20000);
                    ctx.strokeStyle = `rgba(0, 174, 255, ${opacityValue})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        particles.forEach(p => p.update());
        connect();
    }

    resizeCanvas();
    init();
    animate();
}

async function loadComponent(path, placeholderId, callback) {
    try {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`Could not load component from ${path}`);
        }
        const html = await response.text();
        const placeholder = document.getElementById(placeholderId);
        if (placeholder) {
            placeholder.innerHTML = html;
            if (callback) {
                callback();
            }
        }
    } catch (error) {
        console.error(error);
    }
}

function handleCounters() {
    const counters = document.querySelectorAll('.counter');
    if (counters.length === 0) return;

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = +counter.getAttribute('data-target');
                let current = 0;
                const increment = target / 100;

                const updateCounter = () => {
                    if (current < target) {
                        current += increment;
                        counter.innerText = Math.ceil(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.innerText = target;
                    }
                };
                updateCounter();
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

function handleCaseStudyFilter() {
    const filterContainer = document.getElementById('case-study-filters');
    if (!filterContainer) return;

    const filterButtons = filterContainer.querySelectorAll('.filter-btn');
    const caseStudyItems = document.querySelectorAll('.case-study-item');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filter = button.getAttribute('data-filter');

            caseStudyItems.forEach(item => {
                const category = item.getAttribute('data-category');
                if (filter === 'all' || filter === category) {
                    item.classList.remove('hide');
                } else {
                    item.classList.add('hide');
                }
            });
        });
    });
}

function handlePreloader() {
    const preloader = document.querySelector('.preloader');
    const counter = document.querySelector('.progress-counter');
    if (!preloader || !counter) return;

    const animationDuration = 3000; // 3 seconds
    let startTime = null;

    function updateCounter(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        const percentage = Math.min(Math.floor((progress / animationDuration) * 100), 100);
        
        counter.textContent = `${percentage}%`;

        if (progress < animationDuration) {
            requestAnimationFrame(updateCounter);
        } else {
            counter.textContent = `100%`;
        }
    }

    requestAnimationFrame(updateCounter);

    setTimeout(() => {
        preloader.classList.add('hidden');
    }, animationDuration);
}

function handleHamburgerMenu() {
    const hamburgerBtn = document.querySelector('.hamburger-menu');
    const navMenu = document.querySelector('.main-nav');

    if (!hamburgerBtn || !navMenu) return;

    hamburgerBtn.addEventListener('click', () => {
        hamburgerBtn.classList.toggle('is-active');
        navMenu.classList.toggle('nav-open');

        // Toggle aria-expanded for accessibility
        const isExpanded = hamburgerBtn.getAttribute('aria-expanded') === 'true';
        hamburgerBtn.setAttribute('aria-expanded', !isExpanded);
        
        // Prevent body scroll when menu is open
        document.body.classList.toggle('no-scroll');
    });
}

function handleBackToTop() {
    const backToTopBtn = document.querySelector('.back-to-top-btn');
    if (!backToTopBtn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    backToTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    handlePreloader();
    await loadComponent('/header.html', 'header-placeholder', handleActiveNav);
    await loadComponent('/footer.html', 'footer-placeholder');
    handleAnimations();
    handlePointer();
    handleParticleBackground();
    handleCounters();
    handleCaseStudyFilter();
    handleHamburgerMenu();
    handleBackToTop();
});