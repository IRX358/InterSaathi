/**
 * AI Internship Recommender - Interactive JavaScript
 * This file contains all interactive functionality for the website.
 */

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded. Initializing scripts...');
    
    // Initialize all components
    initializePopupModal();
    initializeVideoModal(); // <-- NEW: Initialize the video modal
    initializeNavigation();
    initializeFilterTags();
    initializeMobileMenu();
    initializeGetStartedButton();
    initializeHeroSlider();
    
    console.log('All interactive features initialized.');
});

/**
 * POPUP MODAL FUNCTIONALITY
 */
function initializePopupModal() {
    const modal = document.getElementById('popup-modal');
    const closeButton = document.getElementById('close-popup');
    
    if (!modal || !closeButton) {
        console.warn('Popup modal elements not found');
        return;
    }
    
    const showModal = () => {
        modal.classList.add('active');
        modal.classList.remove('opacity-0', 'pointer-events-none');
        document.body.style.overflow = 'hidden';
    };
    
    const hideModal = () => {
        modal.classList.remove('active');
        modal.classList.add('opacity-0', 'pointer-events-none');
        document.body.style.overflow = '';
    };

    setTimeout(showModal, 1000);
    closeButton.addEventListener('click', hideModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) hideModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) hideModal();
    });
    
    window.showAppModal = showModal; // Make it globally accessible
    console.log('Popup modal initialized');
}

/**
 * NEW: VIDEO MODAL FUNCTIONALITY
 */

// function initializeVideoModal() {
//     const videoModal = document.getElementById('video-modal');
//     const openButton = document.getElementById('watch-demo-btn');
//     const closeButton = document.getElementById('close-video-modal');
//     // Get the <video> element
//     const videoPlayer = document.getElementById('demo-video-player');

//     // THIS IS YOUR LOCAL VIDEO FILE PATH
//     const videoSrc = "/static/assets/InterSaathi.mp4"; 

//     if (!videoModal || !openButton || !closeButton || !videoPlayer) {
//         console.warn('Video modal elements not found');
//         return;
//     }

//     const showModal = () => {
//         videoPlayer.src = videoSrc; // Set the video source
//         videoPlayer.play(); // Tell the video to play
//         videoModal.classList.add('active');
//         videoModal.classList.remove('opacity-0', 'pointer-events-none');
//         document.body.style.overflow = 'hidden';
//     };

//     const hideModal = () => {
//         videoPlayer.pause(); // Pause the video
//         videoPlayer.src = ""; // Remove the source
//         videoModal.classList.remove('active');
//         videoModal.classList.add('opacity-0', 'pointer-events-none');
//         document.body.style.overflow = '';
//     };

//     openButton.addEventListener('click', (e) => {
//         e.preventDefault();
//         showModal();
//     });
//     closeButton.addEventListener('click', hideModal);
//     videoModal.addEventListener('click', (e) => {
//         if (e.target === videoModal) {
//             hideModal();
//         }
//     });
//     document.addEventListener('keydown', (e) => {
//         if (e.key === 'Escape' && videoModal.classList.contains('active')) {
//             hideModal();
//         }
//     });

//     console.log('Video modal initialized for local video.');
// }
/**
 * NAVIGATION FUNCTIONALITY
 */
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link, footer a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    const navbarHeight = document.querySelector('nav').offsetHeight;
                    const targetPosition = targetElement.offsetTop - navbarHeight - 20;
                    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                    if (window.isMobileMenuOpen()) window.toggleMobileMenu();
                }
            }
        });
    });
    
    console.log('Navigation initialized');
}

/**
 * MOBILE MENU FUNCTIONALITY
 */
function initializeMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (!mobileMenuBtn || !mobileMenu) {
        console.warn('Mobile menu elements not found');
        return;
    }

    // This function will be called to open/close the menu
    const toggleMobileMenu = () => {
        const icon = mobileMenuBtn.querySelector('i');
        const isOpen = mobileMenu.classList.toggle('open');
        
        icon.classList.toggle('fa-times', isOpen);
        icon.classList.toggle('fa-bars', !isOpen);
    };

    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    
    // Make functions globally available for other scripts to use
    window.toggleMobileMenu = toggleMobileMenu;
    window.isMobileMenuOpen = () => mobileMenu.classList.contains('open');
    
    console.log('Mobile menu initialized');
}

/**
 * FILTER TAGS FUNCTIONALITY
 */
function initializeFilterTags() {
    const filterTags = document.querySelectorAll('.filter-tag');
    
    filterTags.forEach(tag => {
        tag.addEventListener('click', function() {
            this.classList.toggle('active');
            // Simple visual toggle
            if (this.classList.contains('active')) {
                this.style.backgroundColor = '#f97316'; // orange-500
                this.style.color = 'white';
            } else {
                this.style.backgroundColor = ''; // Reverts to original stylesheet
                this.style.color = ''; 
            }
            console.log('Toggled filter:', this.dataset.tag);
        });
    });
    
    console.log('Filter tags initialized');
}

/**
 * GET STARTED BUTTON FUNCTIONALITY
 */
// function initializeGetStartedButton() {
//     const getStartedBtn = document.getElementById('get-started-btn');
//     if (!getStartedBtn) return;
    
//     getStartedBtn.addEventListener('click', (e) => {
//         e.preventDefault();
//         // Re-open the modal when "Get Started" is clicked
//         if(window.showAppModal) window.showAppModal();
//         console.log('Get Started button clicked, modal shown');
//     });
    
//     console.log('Get Started button initialized');
// }

/**
 * HERO IMAGE SLIDER
 */
function initializeHeroSlider() {
    const slider = document.getElementById('hero-slider');
    if (!slider) {
        console.warn('Hero slider not found');
        return;
    }

    const images = slider.querySelectorAll('.slider-image');
    if (images.length < 2) return; // No need to slide if there's only one image

    let currentIndex = 0;
    const slideInterval = 3000; // 3 seconds

    setInterval(() => {
        // Remove 'active' class from the current image
        images[currentIndex].classList.remove('active');
        
        // Calculate the next index
        currentIndex = (currentIndex + 1) % images.length;

        // Add 'active' class to the next image
        images[currentIndex].classList.add('active');
    }, slideInterval);

    console.log('Hero image slider initialized');
}