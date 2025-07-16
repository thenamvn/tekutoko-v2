document.addEventListener('DOMContentLoaded', function () {
    const accordion = document.getElementById('accordion-flush');
    const items = accordion.querySelectorAll('h3 button');
    const bodies = accordion.querySelectorAll('[id^="accordion-flush-body-"]'); // Select all answer bodies

    items.forEach(item => {
        item.addEventListener('click', function () {
            const targetId = this.getAttribute('data-accordion-target');
            const targetBody = document.querySelector(targetId);
            const isExpanded = this.getAttribute('aria-expanded') === 'true';

            // Close all other open items
            bodies.forEach(body => {
                if (body !== targetBody && !body.classList.contains('hidden')) {
                    body.classList.add('hidden');
                    const associatedButton = document.querySelector(`[data-accordion-target="#${body.id}"]`);
                    if (associatedButton) {
                        associatedButton.setAttribute('aria-expanded', 'false');
                        const svgIcon = associatedButton.querySelector('svg');
                        if (svgIcon) {
                            svgIcon.classList.remove('rotate-180');
                        }
                        associatedButton.classList.remove('bg-white', 'dark:bg-gray-900', 'text-gray-900', 'dark:text-white');
                        associatedButton.classList.add('text-gray-500', 'dark:text-gray-400');
                    }
                }
            });

            if (isExpanded) {
                // Close the current item
                targetBody.classList.add('hidden');
                this.setAttribute('aria-expanded', 'false');
                const svgIcon = this.querySelector('svg');
                if (svgIcon) {
                    svgIcon.classList.remove('rotate-180');
                }
                this.classList.remove('bg-white', 'dark:bg-gray-900', 'text-gray-900', 'dark:text-white');
                this.classList.add('text-gray-500', 'dark:text-gray-400');
            } else {
                // Open the current item
                targetBody.classList.remove('hidden');
                this.setAttribute('aria-expanded', 'true');
                const svgIcon = this.querySelector('svg');
                if (svgIcon) {
                    svgIcon.classList.add('rotate-180');
                }
                this.classList.remove('text-gray-500', 'dark:text-gray-400');
                this.classList.add('bg-white', 'dark:bg-gray-900', 'text-gray-900', 'dark:text-white');
            }
        });
    });
});