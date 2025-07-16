document.addEventListener("DOMContentLoaded", function () {
    // Đảm bảo utils.js đã được tải
    if (typeof getLanguageFromUrl !== 'function') {
        console.error('utils.js is not loaded properly');
        return;
    }
    //language dropdown const
    const langBtn = document.getElementById("language-btn");
    const langDropdown = document.getElementById("language-dropdown");
    const selectedFlag = document.getElementById("selected-flag");
    const selectedText = document.getElementById("selected-text");
    // Lấy ngôn ngữ hiện tại từ URL path
    let currentLang = getLanguageFromUrl();


    //menu button
    const toggleButton = document.querySelector("[data-collapse-toggle='mobile-menu-2']");
    const menu = document.getElementById("mobile-menu-2");
    const icons = toggleButton.querySelectorAll("svg");

    // Carousel functionality (using a simple approach - could be improved with a library)
    const carousel = document.getElementById('carousel');
    if (carousel) { // Check if carousel exists
        let currentIndex = 0;
        const images = carousel.querySelectorAll('img');
        const numImages = images.length;

        function showImage(index) {
            carousel.style.transform = `translateX(-${index * 100}%)`;
        }
        function nextImage() {
            currentIndex = (currentIndex + 1) % numImages;
            showImage(currentIndex);
        }
        setInterval(nextImage, 3000); // Change image every 3 seconds
    }

    // Toggle dropdown
    langBtn.addEventListener("click", function () {
        langDropdown.classList.toggle("hidden");
    });
    // Cập nhật liên kết ngôn ngữ để sử dụng URL path
    document.querySelectorAll("[data-lang]").forEach(button => {
        button.addEventListener("click", function (e) {
            e.preventDefault();
            const lang = this.getAttribute("data-lang");
            
            // Cập nhật localStorage
            localStorage.setItem("language", lang);
            
            // Tạo URL mới với đường dẫn ngôn ngữ
            const newUrl = createLanguageUrl(lang);
            
            // Chuyển hướng đến URL mới
            window.location.href = newUrl;
        });
    });
    // Ẩn dropdown khi click ra ngoài
    document.addEventListener("click", function (event) {
        if (!langBtn.contains(event.target) && !langDropdown.contains(event.target)) {
            langDropdown.classList.add("hidden");
        }
    });
    //menu button
    toggleButton.addEventListener("click", function () {
        const isExpanded = toggleButton.getAttribute("aria-expanded") === "true";
        toggleButton.setAttribute("aria-expanded", !isExpanded);
        menu.classList.toggle("hidden");

        // Toggle the icons (hamburger and close)
        icons.forEach(icon => icon.classList.toggle("hidden"));
    });
});
