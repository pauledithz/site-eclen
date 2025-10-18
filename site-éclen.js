        function showSection(sectionName) {
            const sections = document.querySelectorAll('.section');
            sections.forEach(section => {
                section.classList.remove('active');
            });

            const heroSection = document.getElementById('hero-section');
            if (sectionName === 'accueil') {
                heroSection.style.display = 'block';
            } else {
                heroSection.style.display = 'none';
            }

            const targetSection = document.getElementById(sectionName);
            if (targetSection) {
                targetSection.classList.add('active');
            }

            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function handleSubmit(event) {
            event.preventDefault();
            
            const successMessage = document.getElementById('successMessage');
            successMessage.style.display = 'block';
            
            event.target.reset();
            
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 5000);
        }