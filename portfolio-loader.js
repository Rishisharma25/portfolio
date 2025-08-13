// Portfolio Data Loader
class PortfolioLoader {
    constructor() {
        this.data = null;
        this.init();
    }

    async init() {
        try {
            await this.loadData();
            this.populateContent();
            this.initializeAnimations();
        } catch (error) {
            console.error('Failed to initialize portfolio:', error);
            this.handleError();
        }
    }

    async loadData() {
        try {
            const response = await fetch('portfolio-data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.data = await response.json();
            console.log('Portfolio data loaded successfully');
        } catch (error) {
            console.error('Error loading portfolio data:', error);
            throw error;
        }
    }

    populateContent() {
        this.updateNavigation();
        this.updateHeroSection();
        this.updateAboutSection();
        this.updateSkills();
        this.updateProjects();
        this.updateContact();
        this.updateSEO();
    }

    updateNavigation() {
        const { personal, resume } = this.data;
        
        // Update logo
        const logo = document.getElementById('logo');
        if (logo) logo.textContent = personal.firstName || personal.name.split(' ')[0];
        
        // Update resume links
        if (resume?.file) {
            const resumeElements = [
                document.getElementById('ctaResume'),
                document.getElementById('resumeIframe'),
                document.querySelector('a[download="Rishi_Sharma_Resume"]')
            ];
            
            resumeElements.forEach(el => {
                if (el) {
                    if (el.tagName === 'IFRAME') {
                        el.src = resume.file;
                    } else {
                        el.href = resume.file;
                        if (resume.downloadName && el.hasAttribute('download')) {
                            el.download = resume.downloadName;
                        }
                    }
                }
            });
        }
    }

    updateHeroSection() {
        const { personal, contact } = this.data;
        
        // Update hero content
        const heroName = document.getElementById('heroName');
        const heroBio = document.getElementById('heroBio');
        const heroContact = document.getElementById('heroContact');
        const heroGithub = document.getElementById('heroGithub');
        const heroLinkedin = document.getElementById('heroLinkedin');
        
        if (heroName) heroName.textContent = personal.name;
        if (heroBio) heroBio.textContent = personal.tagline;
        if (heroContact && contact.email) heroContact.href = `mailto:${contact.email}`;
        if (heroGithub && contact.social?.github) heroGithub.href = contact.social.github;
        if (heroLinkedin && contact.social?.linkedin) heroLinkedin.href = contact.social.linkedin;
        
        // Update profile image
        this.updateProfileImage(personal.profileImage);
        
        // Start typing animation with roles
        this.initTypeWriter();
    }

    updateProfileImage(imageSrc) {
        const profileImg = document.getElementById('profileImg');
        const profilePlaceholder = document.getElementById('profilePlaceholder');
        
        if (profileImg && imageSrc) {
            profileImg.src = imageSrc;
            profileImg.alt = `${this.data.personal.name} profile picture`;
            
            profileImg.onload = () => {
                profileImg.classList.remove('hidden');
                if (profilePlaceholder) profilePlaceholder.classList.add('hidden');
            };
            
            profileImg.onerror = () => {
                console.warn('Profile image failed to load, keeping placeholder');
            };
        }
    }

    updateAboutSection() {
        const { about, personal } = this.data;
        
        // Update about text
        const aboutText = document.getElementById('aboutText');
        if (aboutText) aboutText.textContent = about.description;
        
        // Update stats counters
        if (about.stats) {
            this.updateCounter('yearsCounter', about.stats.yearsLearning, '+');
            this.updateCounter('projectsCounter', about.stats.projectsBuilt, '+');
            this.updateCounter('skillsCounter', about.stats.technologies, '+');
        }
    }

    updateCounter(elementId, targetValue, suffix = '') {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        let current = 0;
        const increment = targetValue / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= targetValue) {
                current = targetValue;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current) + suffix;
        }, 50);
    }

    updateSkills() {
        const skillsContainer = document.getElementById('skills');
        if (!skillsContainer || !this.data.skills?.technical) return;
        
        skillsContainer.innerHTML = '';
        
        this.data.skills.technical.forEach((skill, index) => {
            const skillElement = document.createElement('span');
            skillElement.className = 'px-4 py-2 rounded-full text-sm bg-gradient-to-r from-indigo-600/30 to-purple-600/30 hover:from-indigo-600/50 hover:to-purple-600/50 transition-all duration-300 border border-indigo-500/30 hover:border-indigo-500/60 cursor-pointer transform hover:scale-105 skill-animation';
            skillElement.textContent = skill;
            skillElement.style.animationDelay = `${index * 100}ms`;
            skillsContainer.appendChild(skillElement);
        });
    }

    updateProjects() {
        const projectsGrid = document.getElementById('projectsGrid');
        if (!projectsGrid || !this.data.projects) return;
        
        projectsGrid.innerHTML = '';
        
        // Filter featured projects or show all
        const projectsToShow = this.data.projects.filter(project => project.featured) || this.data.projects.slice(0, 6);
        
        projectsToShow.forEach((project, index) => {
            const projectCard = this.createProjectCard(project, index);
            projectsGrid.appendChild(projectCard);
        });
    }

    createProjectCard(project, index) {
        const card = document.createElement('div');
        card.className = 'bg-gray-800 rounded-3xl glass card-hover group overflow-hidden project-animation';
        card.style.animationDelay = `${index * 200}ms`;
        
        const placeholderImage = `https://via.placeholder.com/400x300/6366f1/ffffff?text=${encodeURIComponent(project.title)}`;
        const technologies = project.technologies || [];
        const hasValidLink = project.links?.live && project.links.live !== '#' || 
                           project.links?.demo && project.links.demo !== '#' || 
                           project.links?.github && project.links.github !== '#';
        
        const primaryLink = project.links?.live || project.links?.demo || project.links?.github || '#';
        
        card.innerHTML = `
            <div class="relative overflow-hidden">
                <img src="${project.image || placeholderImage}" 
                     alt="${project.title} screenshot" 
                     class="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                     onerror="this.src='${placeholderImage}'">
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                ${hasValidLink ? `
                <div class="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                    </svg>
                </div>
                ` : ''}
            </div>
            <div class="p-6">
                <div class="flex items-start justify-between mb-3">
                    <h3 class="font-bold text-xl group-hover:text-indigo-400 transition-colors">${project.title}</h3>
                    ${project.status ? `<span class="text-xs px-2 py-1 rounded-full ${this.getStatusColor(project.status)} border">${project.status}</span>` : ''}
                </div>
                <p class="opacity-80 text-sm leading-relaxed mb-6">${project.description}</p>
                <div class="flex gap-2 flex-wrap mb-6">
                    ${technologies.map(tech => 
                        `<span class="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 hover:border-indigo-500 transition-colors">${tech}</span>`
                    ).join('')}
                </div>
                ${hasValidLink ? 
                    `<a href="${primaryLink}" target="_blank" class="group/btn w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 font-medium transform hover:scale-105">
                        <span>View Project</span>
                        <svg class="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                        </svg>
                    </a>` : 
                    '<div class="w-full text-center py-3 px-4 rounded-xl bg-gray-600/50 text-gray-400 cursor-not-allowed font-medium">Coming Soon</div>'
                }
            </div>
        `;
        
        return card;
    }

    getStatusColor(status) {
        const colors = {
            'Completed': 'bg-green-500/20 text-green-400 border-green-500/30',
            'In Progress': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            'Planning': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            'On Hold': 'bg-gray-500/20 text-gray-400 border-gray-500/30'
        };
        return colors[status] || colors['Completed'];
    }

    updateContact() {
        const { contact } = this.data;
        
        // Update contact information
        const contactEmail = document.getElementById('contactEmail');
        const contactPhone = document.getElementById('contactPhone');
        const contactText = document.getElementById('contactText');
        
        if (contactEmail) contactEmail.textContent = contact.email;
        if (contactPhone) contactPhone.textContent = contact.phone;
        if (contactText) contactText.textContent = contact.availability?.message || 'Let\'s connect!';
        
        // Update contact links
        const contactLinks = [
            { id: 'emailLink', href: `mailto:${contact.email}` },
            { id: 'quickContact', href: `mailto:${contact.email}` },
            { id: 'mobileLink', href: `tel:${contact.phone}` },
            { id: 'githubLink', href: contact.social?.github },
            { id: 'linkedinLink', href: contact.social?.linkedin }
        ];
        
        contactLinks.forEach(link => {
            const element = document.getElementById(link.id);
            if (element && link.href) {
                element.href = link.href;
            }
        });
    }

    updateSEO() {
        const { seo } = this.data;
        if (!seo) return;
        
        // Update title
        if (seo.title) document.title = seo.title;
        
        // Update meta tags
        this.updateMetaTag('description', seo.description);
        this.updateMetaTag('keywords', seo.keywords?.join(', '));
        this.updateMetaTag('author', seo.author);
        
        // Update Open Graph tags
        this.updateMetaTag('og:title', seo.title, 'property');
        this.updateMetaTag('og:description', seo.description, 'property');
        this.updateMetaTag('og:url', seo.url, 'property');
    }

    updateMetaTag(name, content, attribute = 'name') {
        if (!content) return;
        
        let meta = document.querySelector(`meta[${attribute}="${name}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute(attribute, name);
            document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
    }

    initTypeWriter() {
        const roles = this.data.roles || ["Developer", "Programmer", "Problem Solver"];
        
        let currentRole = 0;
        let currentChar = 0;
        let isDeleting = false;
        const typeSpeed = 100;
        const deleteSpeed = 50;
        const pauseTime = 2000;
        
        const type = () => {
            const current = roles[currentRole];
            const typedElement = document.getElementById('typed-role');
            
            if (!typedElement) return;
            
            if (isDeleting) {
                typedElement.textContent = current.substring(0, currentChar - 1);
                currentChar--;
            } else {
                typedElement.textContent = current.substring(0, currentChar + 1);
                currentChar++;
            }
            
            let typeSpeedCurrent = isDeleting ? deleteSpeed : typeSpeed;
            
            if (!isDeleting && currentChar === current.length) {
                typeSpeedCurrent = pauseTime;
                isDeleting = true;
            } else if (isDeleting && currentChar === 0) {
                isDeleting = false;
                currentRole = (currentRole + 1) % roles.length;
            }
            
            setTimeout(type, typeSpeedCurrent);
        };
        
        type();
    }

    initializeAnimations() {
        // Animate counters
        setTimeout(() => {
            if (this.data.about?.stats) {
                this.animateCounters();
            }
        }, 1000);
        
        // Initialize intersection observer for animations
        this.initIntersectionObserver();
    }

    animateCounters() {
        const counters = [
            { id: 'yearsCounter', target: this.data.about.stats.yearsLearning, suffix: '+' },
            { id: 'projectsCounter', target: this.data.about.stats.projectsBuilt, suffix: '+' },
            { id: 'skillsCounter', target: this.data.about.stats.technologies, suffix: '+' }
        ];
        
        counters.forEach(counter => {
            this.updateCounter(counter.id, counter.target, counter.suffix);
        });
    }

    initIntersectionObserver() {
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

        // Observe all sections
        const sections = document.querySelectorAll('section, header, footer');
        sections.forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(30px)';
            section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(section);
        });
    }

    handleError() {
        console.error('Using fallback data due to loading error');
        
        // Set fallback content
        const fallbackData = {
            name: 'Rishi Sharma',
            title: 'Developer',
            email: 'contact@example.com'
        };
        
        const heroName = document.getElementById('heroName');
        const heroBio = document.getElementById('heroBio');
        
        if (heroName) heroName.textContent = fallbackData.name;
        if (heroBio) heroBio.textContent = 'Portfolio data temporarily unavailable';
        
        // Still initialize basic animations
        this.initTypeWriter();
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new PortfolioLoader());
} else {
    new PortfolioLoader();
}
