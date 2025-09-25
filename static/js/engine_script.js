let mockData = {}; // Global variable to store fetched data

document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM fully loaded. Initializing scripts...');
    
    // Asynchronously fetch both data sources
    const staticDataPromise = fetch('/api/static_data').then(res => {
        if (!res.ok) throw new Error(`Failed to fetch static data. Status: ${res.status}`);
        return res.json();
    });
    
    const internshipsPromise = fetch('/api/internships').then(res => {
        if (!res.ok) throw new Error(`Failed to fetch internships data. Status: ${res.status}`);
        return res.json();
    });
    
    try {
        // Wait for both promises to resolve
        const [staticData, internshipsData] = await Promise.all([staticDataPromise, internshipsPromise]);
        
        // Merge the data into the global mockData object
        Object.assign(mockData, staticData, { internships: internshipsData });
        
        console.log('All data loaded successfully:', mockData);

        // Now that data is guaranteed to be loaded, call the initialization functions
        populateDropdowns();
        setupEventListeners();
        initializeModeToggle();
    } catch (error) {
        // Log the specific error to help with debugging
        console.error('Error loading data from APIs. Please check if your FastAPI server is running and the endpoints are correct.', error);
    }
});

// Populate dropdowns with fetched static data
function populateDropdowns() {
    const educationSelect = document.getElementById('education');
    const internshipTypeSelect = document.getElementById('internship-type');
    const categorySelect = document.getElementById('category'); // New select element for category
    const durationSelect = document.getElementById('internship-duration');
    const languageSelector = document.getElementById('language-selector');

    // Use the fetched data to populate dropdowns with checks for existence
    if (mockData.education) {
        mockData.education.forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            educationSelect.appendChild(option);
        });
    }

    if (mockData.internship_types) {
        mockData.internship_types.forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            internshipTypeSelect.appendChild(option);
        });
    }

    // Populate the new category dropdown
    if (mockData.categories) {
        mockData.categories.forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            categorySelect.appendChild(option);
        });
    }

    if (mockData.durations) {
        mockData.durations.forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            durationSelect.appendChild(option);
        });
    }

    // Populate language selector
    const placeholderOption = document.createElement('option');
    placeholderOption.value = "";
    placeholderOption.textContent = "Translate the page into:";
    placeholderOption.disabled = true;
    placeholderOption.selected = true;
    languageSelector.appendChild(placeholderOption);

    if (mockData.translations) {
        const languages = Object.keys(mockData.translations);
        languages.forEach(lang => {
            const option = document.createElement('option');
            option.value = lang;
            option.textContent = mockData.translations[lang].languageName;
            languageSelector.appendChild(option);
        });
    }

    console.log('Dropdowns populated with static data.');
}

// Set up event listeners
function setupEventListeners() {
    const form = document.getElementById('user-input-form');
    const searchInput = document.getElementById('search-input');
    const exploreBtn = document.getElementById('explore-btn');
    const saveProfileBtn = document.getElementById('save-profile-btn');
    const faqBtn = document.getElementById('faq-queries-btn');
    const faqBtnMobile = document.getElementById('faq-queries-btn-mobile');
    const backBtn = document.getElementById('back-to-home');
    const languageSelector = document.getElementById('language-selector');
    const feedbackForm = document.getElementById('feedback-form');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    form.addEventListener('submit', handleExploreInternships);
    searchInput.addEventListener('input', handleSearch);
    saveProfileBtn.addEventListener('click', handleSaveProfile);
    backBtn.addEventListener('click', showMainPage);
    languageSelector.addEventListener('change', handleLanguageChange);
    feedbackForm.addEventListener('submit', handleFeedbackSubmit);
    if (faqBtn) faqBtn.addEventListener('click', showFaqPage);
    if (faqBtnMobile) faqBtnMobile.addEventListener('click', showFaqPage);

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            const isOpen = mobileMenu.classList.toggle('open');
            const icon = mobileMenuBtn.querySelector('i');
            icon.classList.toggle('fa-times', isOpen);
            icon.classList.toggle('fa-bars', !isOpen);
        });
    }

    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', () => mobileMenu.classList.remove('open'));
    });
}

// Handle form submit and fetch from FastAPI
async function handleExploreInternships(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    console.log('Sending form data to backend:', data);

    try {
        const response = await fetch('/api/recommendations', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        displayInternshipResults(result.recommendations);
        document.getElementById('results-section').classList.remove('hidden');
    } catch (error) {
        console.error('Error fetching recommendations:', error);
    }
}

// Save profile placeholder
function handleSaveProfile() {
    console.log('Redirecting to login/signup page simulation...');
}

// Search functionality
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const dropdown = document.getElementById('search-results-dropdown');
    const displayArea = document.getElementById('search-display-area');
    
    dropdown.innerHTML = '';
    displayArea.innerHTML = '';
    
    if (searchTerm.length > 1) {
        // Correctly filter through the internships array
        const filteredInternships = mockData.internships.filter(internship => 
            internship.title.toLowerCase().includes(searchTerm) ||
            internship.company.toLowerCase().includes(searchTerm) ||
            (internship.eligibility && internship.eligibility.skills_required && internship.eligibility.skills_required.some(skill => skill.toLowerCase().includes(searchTerm)))
        );

        if (filteredInternships.length > 0) {
            filteredInternships.forEach(internship => {
                const item = document.createElement('div');
                item.classList.add('search-results-item', 'hover:bg-gray-200', 'p-2');
                item.textContent = `${internship.title} at ${internship.company}`;
                item.addEventListener('click', () => {
                    displaySelectedInternship(internship);
                    dropdown.style.display = 'none';
                    event.target.value = '';
                });
                dropdown.appendChild(item);
            });
            dropdown.style.display = 'block';
        } else {
            dropdown.style.display = 'none';
        }
    } else {
        dropdown.style.display = 'none';
    }
}

// Display selected internship
function displaySelectedInternship(internship) {
    const displayArea = document.getElementById('search-display-area');
    displayArea.innerHTML = `
        <div class="card p-6 border-l-4 border-blue-500">
            <h3 class="text-xl font-bold text-gray-800">${internship.title}</h3>
            <p class="text-gray-600 mb-2"><strong>Company:</strong> ${internship.company}</p>
            <p class="text-gray-600 mb-2"><strong>Duration:</strong> ${internship.duration}</p>
            <p class="text-gray-600 mb-2"><strong>Stipend:</strong> ${internship.stipend}</p>
            <p class="text-gray-600 mb-2"><strong>Location:</strong> ${internship.location}</p>
            <p class="text-gray-600"><strong>Skills:</strong> ${internship.eligibility.skills_required.join(', ')}</p>
        </div>
    `;
}

// Render internship results dynamically
function displayInternshipResults(internships) {
    const container = document.getElementById('internship-results-container');
    container.innerHTML = '';
    if (internships && internships.length > 0) {
        internships.forEach(internship => {
            const card = document.createElement('div');
            card.classList.add('card', 'p-6');
            card.innerHTML = `
                <h3 class="text-xl font-bold text-gray-800 mb-2">${internship.title}</h3>
                <p class="text-gray-600 mb-1"><strong>Company:</strong> ${internship.company}</p>
                <p class="text-gray-600 mb-1"><strong>Duration:</strong> ${internship.duration}</p>
                <p class="text-gray-600 mb-1"><strong>Stipend:</strong> ${internship.stipend}</p>
                <p class="text-gray-600 mb-1"><strong>Location:</strong> ${internship.location}</p>
                <p class="text-gray-600 mt-2"><strong>Skills:</strong> ${internship.eligibility.skills_required.join(', ')}</p>
            `;
            container.appendChild(card);
        });
    } else {
        container.innerHTML = `<p class="text-center text-gray-500">No recommendations found. Please try different skills.</p>`;
    }
}

// Language translation
function handleLanguageChange(event) {
    const lang = event.target.value;
    // Ensure mockData and its translations property exist
    if (!mockData || !mockData.translations) {
        console.error("Translation data is not available.");
        return;
    }
    const translations = mockData.translations[lang];
    if (translations) {
        document.getElementById('find-internship-title').textContent = translations.find_internship_title;
        document.querySelector('label[for="name"]').textContent = translations.name;
        document.querySelector('label[for="education"]').textContent = translations.education;
        document.querySelector('label[for="skills"]').textContent = translations.skills;
        document.querySelector('label[for="internship-type"]').textContent = translations.internship_type;
        // Updated translation for the new category field
        const categoryLabel = document.querySelector('label[for="category"]');
        if (categoryLabel) {
            categoryLabel.textContent = translations.category;
        }
        document.querySelector('label[for="internship-duration"]').textContent = translations.internship_duration;
        document.getElementById('explore-btn').textContent = translations.explore_btn;
        document.getElementById('save-profile-btn').textContent = translations.save_profile_btn;
        document.getElementById('search-title').textContent = translations.search_title;
        document.getElementById('search-input').placeholder = translations.search_placeholder;
        document.getElementById('feedback-title').textContent = translations.feedback_title;
        document.getElementById('feedback-message').placeholder = translations.feedback_placeholder;
        document.getElementById('submit-feedback-btn').textContent = translations.submit_feedback_btn;
        document.getElementById('faq-title').textContent = translations.faq_title;
        document.getElementById('back-to-home').textContent = translations.back_to_home;
        document.getElementById('toggle-label-simple').textContent = translations.simple_mode;
        document.getElementById('toggle-label-advanced').textContent = translations.advanced_mode;
        document.getElementById('faq-queries-btn').textContent = translations.faq_queries;
        document.getElementById('faq-queries-btn-mobile').textContent = translations.faq_queries;

        const languagePlaceholder = document.querySelector('#language-selector option[value=""]');
        if (languagePlaceholder) {
            languagePlaceholder.textContent = translations.language_placeholder_text;
        }
    }
}

// Feedback submit simulation
function handleFeedbackSubmit(event) {
    event.preventDefault();
    const message = document.getElementById('feedback-message').value;
    if (message.trim() !== '') {
        const feedbackData = { userId: 'mock-user-123', message: message, timestamp: new Date().toISOString() };
        console.log('Feedback submitted:', feedbackData);
        document.getElementById('feedback-message').value = '';
        showTemporaryMessage('Thank you for your feedback!');
    }
}

// Mode toggle
function initializeModeToggle() {
    const toggle = document.getElementById('mode-toggle');
    const formSection = document.getElementById('user-input-form-section');
    const feedbackSection = document.getElementById('feedback-section');
    
    toggle.addEventListener('change', () => {
        if (toggle.checked) {
            formSection.classList.add('hidden');
            feedbackSection.classList.add('hidden');
            document.getElementById('toggle-label-simple').classList.replace('text-gray-400','text-gray-700');
            document.getElementById('toggle-label-advanced').classList.replace('text-gray-700','text-gray-400');
            showTemporaryMessage('Switched to Simple Mode');
        } else {
            formSection.classList.remove('hidden');
            feedbackSection.classList.remove('hidden');
            document.getElementById('toggle-label-simple').classList.replace('text-gray-700','text-gray-400');
            document.getElementById('toggle-label-advanced').classList.replace('text-gray-400','text-gray-700');
            showTemporaryMessage('Switched to Advanced Mode');
        }
    });
}

// Temporary messages
function showTemporaryMessage(message) {
    const messageBox = document.createElement('div');
    messageBox.textContent = message;
    messageBox.classList.add('fixed','bottom-16','right-4','bg-gray-800','text-white','p-4','rounded-lg','shadow-lg','z-50','transition-all','duration-500','transform','translate-y-full','opacity-0');
    document.body.appendChild(messageBox);

    setTimeout(() => {
        messageBox.classList.remove('translate-y-full','opacity-0');
        messageBox.classList.add('translate-y-0','opacity-100');
    }, 100);

    setTimeout(() => {
        messageBox.classList.remove('translate-y-0','opacity-100');
        messageBox.classList.add('translate-y-full','opacity-0');
        setTimeout(() => messageBox.remove(), 500);
    }, 3000);
}

// Show FAQ page
function showFaqPage() {
    ['user-input-form-section','search-section','results-section','feedback-section'].forEach(id => document.getElementById(id).classList.add('hidden'));
    document.getElementById('faq-page').classList.remove('hidden');

    const faqContent = document.getElementById('faq-content');
    faqContent.innerHTML = '';
    
    if (mockData.faq && mockData.faq.content) {
        mockData.faq.content.forEach(item => {
            if(item.type==='text'){
                const p=document.createElement('p');
                p.classList.add('mb-4','text-gray-700');
                p.textContent = item.text;
                faqContent.appendChild(p);
            } else if(item.type==='qa'){
                const div=document.createElement('div');
                div.classList.add('mb-4');
                div.innerHTML=`<h3 class="font-bold text-lg text-gray-800">${item.question}</h3><p class="text-gray-600">${item.answer}</p>`;
                faqContent.appendChild(div);
            } else if(item.type==='video'){
                const iframe=document.createElement('iframe');
                iframe.src=item.url;
                iframe.classList.add('w-full','aspect-video','rounded-lg','mt-4');
                iframe.title="FAQ Video";
                iframe.setAttribute("allowfullscreen","");
                faqContent.appendChild(iframe);
            }
        });
    }
}

// Back to main page
function showMainPage() {
    ['user-input-form-section','search-section'].forEach(id => document.getElementById(id).classList.remove('hidden'));
    ['results-section','feedback-section','faq-page'].forEach(id => document.getElementById(id).classList.add('hidden'));
    document.getElementById('mode-toggle').checked=false;
    document.getElementById('mode-toggle').dispatchEvent(new Event('change'));
}
