// Room data (your provided JSON) -  KEEP THIS AS IS
const roomsData = {
    "en": {
        "rooms": [
            {
                "room_id": "622uv",
                "room_title": "Sample: City Park Event Missions",
                "avatarImage": "https://firebasestorage.googleapis.com/v0/b/jptravelz.appspot.com/o/uploads%2F622uv%2Ftekutoko.services%40gmail.com%2Facc3da32-b63e-4991-b74a-f65e521bbeef-DALL%C2%B7E%202025-01-20%2017.15.39%20-%20A%20social%20media%20post%20featuring%20a%20simple%20anime-style%20illustration%20of%20a%20cheerful%20magic%20performer%20in%20an%20adventure%20park.%20The%20performer%20is%20wearing%20a%20vibrant.webp?alt=media&token=2b192999-f65e-4956-b6c7-99d0f54eccdd"
            },
            {
                "room_id": "zmnus",
                "room_title": "Sample: Discover Evolution: Dinosaur Fossils",
                "avatarImage": "https://firebasestorage.googleapis.com/v0/b/jptravelz.appspot.com/o/uploads%2Fzmnus%2Ftekutoko.services%40gmail.com%2Fe32e09af-35b4-40dd-8293-1ebaef8f7d1b-1%20(1).webp?alt=media&token=53829c5a-5e40-44df-a71e-3207700aad57"
            },
            {
                "room_id": "oxjdn",
                "room_title": "Sample: Find the Hidden Birds at the Landscape Painting Exhibition!",
                "username": "tekutoko.services@gmail.com",
                "fullname": "Official _tekutoko",
                "avatarImage": "https://firebasestorage.googleapis.com/v0/b/jptravelz.appspot.com/o/uploads%2Foxjdn%2Ftekutoko.services%40gmail.com%2Fe0b43b66-83d4-4baa-a1ff-bbee5e454317-DALL%C2%B7E%202025-01-21%2011.53.25%20-%20A%20vibrant%20illustration%20styled%20as%20a%20social%20media%20post%2C%20featuring%20a%20person%20taking%20a%20selfie%20in%20front%20of%20a%20detailed%20painting.%20The%20painting%20shows%20a%20serene%20.webp?alt=media&token=b253edff-b1e3-4300-91d4-a0a298af7b51"
            },
            {
                "room_id": "v9o85",
                "room_title": "Sample: Garden Adventure: Find the Special Plants!",
                "avatarImage": "https://firebasestorage.googleapis.com/v0/b/jptravelz.appspot.com/o/uploads%2Fv9o85%2Ftekutoko.services%40gmail.com%2Fcc34de3b-eb53-46b1-bfa4-6f26f78bc95b-water%20lily.webp?alt=media&token=8eb3a75e-25dd-4261-937c-79d4c0349d15"
            },
            {
                "room_id": "dbj55",
                "room_title": "Sample:🌲 Discover Nature: Explore, Learn, and Enjoy! 🌿",
                "avatarImage": "https://firebasestorage.googleapis.com/v0/b/jptravelz.appspot.com/o/uploads%2Fdbj55%2Ftekutoko.services%40gmail.com%2Ffa3c3c9e-e010-40b0-9489-2a8778331a3f-squieel.webp?alt=media&token=db72ae0e-b7b1-4527-a60b-342bc43d4a09"
            },
            {
                "room_id": "ld9c7",
                "room_title": "Sample: Explore the Bicycle Trail: Capture and Discover! 🚴‍♂️🌳",
                "avatarImage": "https://firebasestorage.googleapis.com/v0/b/jptravelz.appspot.com/o/uploads%2Fld9c7%2Ftekutoko.services%40gmail.com%2F98e0d512-eb35-4615-abb7-23f01b110c8d-shrine.webp?alt=media&token=3203370a-4794-4e70-a247-81a56dad024a"
            },
            {
                "room_id": "wuio9",
                "room_title": "Sample:☁️ Cloud Find: Explore the Sky and Learn! 🌤️",
                "avatarImage": "https://firebasestorage.googleapis.com/v0/b/jptravelz.appspot.com/o/uploads%2Fwuio9%2Ftekutoko.services%40gmail.com%2Fd3d25822-b691-4ed6-8fb5-a8c30c3d49c5-%E6%98%BC%E9%96%93%E3%81%AE%E7%A9%BA%E3%81%AE%E4%B8%8A%E3%81%AE%E6%96%B9%E3%81%AE%E9%9B%B2%E3%81%AE%E6%A8%AA%E3%81%AB%E6%8E%9B%E3%81%8B%E3%82%8B%E8%99%B9.webp?alt=media&token=af859890-791e-4c89-8998-2199b640dda5"
            },
            {
                "room_id": "js0sl",
                "room_title": "Sample: Exploring Fire Safety: What Equipment Can Be Found in the City? 🚒",
                "avatarImage": "https://firebasestorage.googleapis.com/v0/b/jptravelz.appspot.com/o/uploads%2Fjs0sl%2Ftekutoko.services%40gmail.com%2Fe7f82d27-12b8-4c81-aa60-daa081d1f315-detection.webp?alt=media&token=0ee39954-3189-4483-ab28-1c865f8c2484"
            },
            {
                "room_id": "nttph",
                "room_title": "Sample: Amusement Park Quest: Solve, Snap, and Win! 🎢✨",
                "avatarImage": "https://firebasestorage.googleapis.com/v0/b/jptravelz.appspot.com/o/uploads%2Fnttph%2Ftekutoko.services%40gmail.com%2Fbdd33c77-6357-4f22-895b-d3e094fbdc9b-carousel.webp?alt=media&token=96a92a64-83a8-4e8b-8502-733a82651b27"
            }
        ]
    },
    "ja": {
        "rooms": [
            {
                "room_id": "622uv",
                "room_title": "サンプル：パークアドベンチャー：スナップ、探索、勝利！",
                "avatarImage": "https://firebasestorage.googleapis.com/v0/b/jptravelz.appspot.com/o/uploads%2F622uv%2Ftekutoko.services%40gmail.com%2Facc3da32-b63e-4991-b74a-f65e521bbeef-DALL%C2%B7E%202025-01-20%2017.15.39%20-%20A%20social%20media%20post%20featuring%20a%20simple%20anime-style%20illustration%20of%20a%20cheerful%20magic%20performer%20in%20an%20adventure%20park.%20The%20performer%20is%20wearing%20a%20vibrant.webp?alt=media&token=2b192999-f65e-4956-b6c7-99d0f54eccdd"
            },
            {
                "room_id": "zmnus",
                "room_title": "サンプル：進化を発見：恐竜の化石",
                "avatarImage": "https://firebasestorage.googleapis.com/v0/b/jptravelz.appspot.com/o/uploads%2Fzmnus%2Ftekutoko.services%40gmail.com%2Fe32e09af-35b4-40dd-8293-1ebaef8f7d1b-1%20(1).webp?alt=media&token=53829c5a-5e40-44df-a71e-3207700aad57"
            },
            {
                "room_id": "oxjdn",
                "room_title": "サンプル：風景画展で隠れた鳥を見つける！",
                "avatarImage": "https://firebasestorage.googleapis.com/v0/b/jptravelz.appspot.com/o/uploads%2Foxjdn%2Ftekutoko.services%40gmail.com%2Fe0b43b66-83d4-4baa-a1ff-bbee5e454317-DALL%C2%B7E%202025-01-21%2011.53.25%20-%20A%20vibrant%20illustration%20styled%20as%20a%20social%20media%20post%2C%20featuring%20a%20person%20taking%20a%20selfie%20in%20front%20of%20a%20detailed%20painting.%20The%20painting%20shows%20a%20serene%20.webp?alt=media&token=b253edff-b1e3-4300-91d4-a0a298af7b51"
            },
            {
                "room_id": "v9o85",
                "room_title": "サンプル：ガーデンアドベンチャー：特別な植物を見つける！",
                "avatarImage": "https://firebasestorage.googleapis.com/v0/b/jptravelz.appspot.com/o/uploads%2Fv9o85%2Ftekutoko.services%40gmail.com%2Fcc34de3b-eb53-46b1-bfa4-6f26f78bc95b-water%20lily.webp?alt=media&token=8eb3a75e-25dd-4261-937c-79d4c0349d15"
            },
            {
                "room_id": "dbj55",
                "room_title": "サンプル：🌲自然を発見：探索、学習、楽しむ！🌿",
                "avatarImage": "https://firebasestorage.googleapis.com/v0/b/jptravelz.appspot.com/o/uploads%2Fdbj55%2Ftekutoko.services%40gmail.com%2Ffa3c3c9e-e010-40b0-9489-2a8778331a3f-squieel.webp?alt=media&token=db72ae0e-b7b1-4527-a60b-342bc43d4a09"
            },
            {
                "room_id": "ld9c7",
                "room_title": "サンプル：自転車道を探索：キャプチャして発見！🚴‍♂️🌳",
                "avatarImage": "https://firebasestorage.googleapis.com/v0/b/jptravelz.appspot.com/o/uploads%2Fld9c7%2Ftekutoko.services%40gmail.com%2F98e0d512-eb35-4615-abb7-23f01b110c8d-shrine.webp?alt=media&token=3203370a-4794-4e70-a247-81a56dad024a"
            },
            {
                "room_id": "wuio9",
                "room_title": "サンプル：☁️クラウドファインド：空を探索して学ぶ！🌤️",
                "avatarImage": "https://firebasestorage.googleapis.com/v0/b/jptravelz.appspot.com/o/uploads%2Fwuio9%2Ftekutoko.services%40gmail.com%2Fd3d25822-b691-4ed6-8fb5-a8c30c3d49c5-%E6%98%BC%E9%96%93%E3%81%AE%E7%A9%BA%E3%81%AE%E4%B8%8A%E3%81%AE%E6%96%B9%E3%81%AE%E9%9B%B2%E3%81%AE%E6%A8%AA%E3%81%AB%E6%8E%9B%E3%81%8B%E3%82%8B%E8%99%B9.webp?alt=media&token=af859890-791e-4c89-8998-2199b640dda5"
            },
            {
                "room_id": "js0sl",
                "room_title": "サンプル：消防安全を探る：都市で見つかる機器は何ですか？🚒",
                "avatarImage": "https://firebasestorage.googleapis.com/v0/b/jptravelz.appspot.com/o/uploads%2Fjs0sl%2Ftekutoko.services%40gmail.com%2Fe7f82d27-12b8-4c81-aa60-daa081d1f315-detection.webp?alt=media&token=0ee39954-3189-4483-ab28-1c865f8c2484"
            },
            {
                "room_id": "nttph",
                "room_title": "サンプル：遊園地クエスト：解決し、スナップし、勝利！🎢✨",
                "avatarImage": "https://firebasestorage.googleapis.com/v0/b/jptravelz.appspot.com/o/uploads%2Fnttph%2Ftekutoko.services%40gmail.com%2Fbdd33c77-6357-4f22-895b-d3e094fbdc9b-carousel.webp?alt=media&token=96a92a64-83a8-4e8b-8502-733a82651b27"
            }
        ]
    },
    "vi": {
        "rooms": [
            {
                "room_id": "622uv",
                "room_title": "Mẫu: Park Adventure: Chụp, Khám phá và Thắng!",
                "avatarImage": "https://firebasestorage.googleapis.com/v0/b/jptravelz.appspot.com/o/uploads%2F622uv%2Ftekutoko.services%40gmail.com%2Facc3da32-b63e-4991-b74a-f65e521bbeef-DALL%C2%B7E%202025-01-20%2017.15.39%20-%20A%20social%20media%20post%20featuring%20a%20simple%20anime-style%20illustration%20of%20a%20cheerful%20magic%20performer%20in%20an%20adventure%20park.%20The%20performer%20is%20wearing%20a%20vibrant.webp?alt=media&token=2b192999-f65e-4956-b6c7-99d0f54eccdd"
            },
            {
                "room_id": "zmnus",
                "room_title": "Mẫu: Khám phá Tiến hóa: Hóa thạch Khủng long",
                "avatarImage": "https://firebasestorage.googleapis.com/v0/b/jptravelz.appspot.com/o/uploads%2Fzmnus%2Ftekutoko.services%40gmail.com%2Fe32e09af-35b4-40dd-8293-1ebaef8f7d1b-1%20(1).webp?alt=media&token=53829c5a-5e40-44df-a71e-3207700aad57"
            },
            {
                "room_id": "oxjdn",
                "room_title": "Mẫu: Tìm các loài chim ẩn trong triển lãm tranh cảnh!",
                "avatarImage": "https://firebasestorage.googleapis.com/v0/b/jptravelz.appspot.com/o/uploads%2Foxjdn%2Ftekutoko.services%40gmail.com%2Fe0b43b66-83d4-4baa-a1ff-bbee5e454317-DALL%C2%B7E%202025-01-21%2011.53.25%20-%20A%20vibrant%20illustration%20styled%20as%20a%20social%20media%20post%2C%20featuring%20a%20person%20taking%20a%20selfie%20in%20front%20of%20a%20detailed%20painting.%20The%20painting%20shows%20a%20serene%20.webp?alt=media&token=b253edff-b1e3-4300-91d4-a0a298af7b51"
            },
            {
                "room_id": "v9o85",
                "room_title": "Mẫu: Garden Adventure: Tìm các loại cây đặc biệt!",
                "avatarImage": "https://firebasestorage.googleapis.com/v0/b/jptravelz.appspot.com/o/uploads%2Fv9o85%2Ftekutoko.services%40gmail.com%2Fcc34de3b-eb53-46b1-bfa4-6f26f78bc95b-water%20lily.webp?alt=media&token=8eb3a75e-25dd-4261-937c-79d4c0349d15"
            },
            {
                "room_id": "dbj55",
                "room_title": "Mẫu:🌲 Khám phá Thiên nhiên: Khám phá, Học và Thưởng thức! 🌿",
                "avatarImage": "https://firebasestorage.googleapis.com/v0/b/jptravelz.appspot.com/o/uploads%2Fdbj55%2Ftekutoko.services%40gmail.com%2Ffa3c3c9e-e010-40b0-9489-2a8778331a3f-squieel.webp?alt=media&token=db72ae0e-b7b1-4527-a60b-342bc43d4a09"
            },
            {
                "room_id": "ld9c7",
                "room_title": "Mẫu: Khám phá Đường đua Xe đạp: Chụp và Khám phá! 🚴‍♂️🌳",
                "avatarImage": "https://firebasestorage.googleapis.com/v0/b/jptravelz.appspot.com/o/uploads%2Fld9c7%2Ftekutoko.services%40gmail.com%2F98e0d512-eb35-4615-abb7-23f01b110c8d-shrine.webp?alt=media&token=3203370a-4794-4e70-a247-81a56dad024a"
            },
            {
                "room_id": "wuio9",
                "room_title": "Mẫu:☁️ Tìm Đám mây: Khám phá Bầu trời và Học! 🌤️",
                "avatarImage": "https://firebasestorage.googleapis.com/v0/b/jptravelz.appspot.com/o/uploads%2Fwuio9%2Ftekutoko.services%40gmail.com%2Fd3d25822-b691-4ed6-8fb5-a8c30c3d49c5-%E6%98%BC%E9%96%93%E3%81%AE%E7%A9%BA%E3%81%AE%E4%B8%8A%E3%81%AE%E6%96%B9%E3%81%AE%E9%9B%B2%E3%81%AE%E6%A8%AA%E3%81%AB%E6%8E%9B%E3%81%8B%E3%82%8B%E8%99%B9.webp?alt=media&token=af859890-791e-4c89-8998-2199b640dda5"
            },
            {
                "room_id": "js0sl",
                "room_title": "Mẫu: Khám phá An toàn cháy: Thiết bị nào có thể được tìm thấy trong thành phố? 🚒",
                "avatarImage": "https://firebasestorage.googleapis.com/v0/b/jptravelz.appspot.com/o/uploads%2Fjs0sl%2Ftekutoko.services%40gmail.com%2Fe7f82d27-12b8-4c81-aa60-daa081d1f315-detection.webp?alt=media&token=0ee39954-3189-4483-ab28-1c865f8c2484"
            },
            {
                "room_id": "nttph",
                "room_title": "Mẫu: Amusement Park Quest: Giải quyết, Chụp và Thắng! 🎢✨",
                "avatarImage": "https://firebasestorage.googleapis.com/v0/b/jptravelz.appspot.com/o/uploads%2Fnttph%2Ftekutoko.services%40gmail.com%2Fbdd33c77-6357-4f22-895b-d3e094fbdc9b-carousel.webp?alt=media&token=96a92a64-83a8-4e8b-8502-733a82651b27"
            }
        ]
    }
};

const roomsContainer = document.getElementById('rooms-container');
let currentIndex = 0; // Keep track of the current slide index
let cardWidth; // Store the width of a single card
let numVisibleCards;  // Store number of cards display
let slideStep;       // NEW: How many cards to move at once

// Function to get the current language
function getCurrentLanguage() {
    try {
        // Thử sử dụng hàm tiện ích nếu nó tồn tại
        if (typeof getLanguageFromUrl === 'function') {
            return getLanguageFromUrl();
        } else {
            // Fallback: kiểm tra URL path trực tiếp
            const pathParts = window.location.pathname.split('/').filter(part => part);
            const urlLang = pathParts[0];
            
            // Danh sách ngôn ngữ hợp lệ
            const validLanguages = ['en', 'vi', 'ja'];
            
            // Nếu URL chứa mã ngôn ngữ hợp lệ, sử dụng nó
            if (validLanguages.includes(urlLang)) {
                return urlLang;
            }
            
            // Ngược lại, trả về ngôn ngữ đã lưu hoặc mặc định
            return localStorage.getItem("language") || "en";
        }
    } catch (e) {
        return localStorage.getItem('language') || 'en';
    }
}

// Function to create a single room card
function createRoomCard(room) {
    const cardContainer = document.createElement('div'); // Create a container DIV
    cardContainer.className = "flex-shrink-0 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-4"; // Responsive width & padding

    const cardLink = document.createElement('a');
    cardLink.href = `/room/${room.room_id}`;
    cardLink.className = "block h-full transform transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-lg overflow-hidden group"; // Make entire card clickable, added 'group' class

    cardLink.innerHTML = `
        <div class="relative w-full h-64 overflow-hidden">
            <img src="${room.avatarImage}" alt="${room.room_title}" class="w-full h-full object-cover" loading="lazy" />
            <div class="absolute inset-0 bg-black bg-opacity-40 hover:bg-opacity-20 transition-opacity duration-300"></div>
            <h3 class="absolute bottom-4 left-4 text-white text-lg font-semibold sm:text-xl line-clamp-2">${room.room_title}</h3>
        </div>
    `;

    cardContainer.appendChild(cardLink); // Append the link to the container
    return cardContainer; // Return the container
}

// Function to populate the carousel with room cards
function populateCarousel(language) {
    roomsContainer.innerHTML = ''; // Clear previous cards
    const rooms = roomsData[language]?.rooms;
    if (!rooms) {
        console.error("No rooms found for language:", language);
        return;
    }

    rooms.forEach(room => {
        const card = createRoomCard(room);
        roomsContainer.appendChild(card);
    });

    // Add a small delay to ensure layout is complete
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            updateCardWidth();
            updateSlideStep();
        });
    });
}
// Function to update the card width and number of visible cards
function updateCardWidth() {
    const firstCard = roomsContainer.querySelector('.flex-shrink-0');
    if (firstCard) {
        // Force a reflow to ensure correct dimensions
        firstCard.offsetHeight;

        const computedStyle = window.getComputedStyle(firstCard);
        const marginRight = parseInt(computedStyle.marginRight, 10) || 0;
        const marginLeft = parseInt(computedStyle.marginLeft, 10) || 0;

        // Get the actual width without the container's padding
        cardWidth = firstCard.getBoundingClientRect().width + marginRight + marginLeft;
        numVisibleCards = Math.floor(roomsContainer.parentElement.offsetWidth / cardWidth);
    }
}

// NEW FUNCTION: Determine how many cards to slide
function updateSlideStep() {
    slideStep = (numVisibleCards <= 1) ? 1 : numVisibleCards;
}

// Function to move the carousel (NOW WITH slideStep)
function moveSlide(direction) {
    const totalCards = roomsContainer.children.length;
    const maxIndex = totalCards - numVisibleCards;

    currentIndex += direction * slideStep;  // Use slideStep

    if (direction > 0 && currentIndex > maxIndex) {
        // Sửa lại: Đặt currentIndex về 0 để cuộn vòng về đầu
        currentIndex = 0;

        roomsContainer.style.transition = 'none';
        roomsContainer.style.transform = `translateX(${-currentIndex * cardWidth}px)`;
        roomsContainer.offsetHeight;
        roomsContainer.style.transition = 'transform 500ms ease-in-out';

    } else if (direction < 0 && currentIndex < 0) {
        currentIndex = 0; // Cái này bạn đã làm đúng

        roomsContainer.style.transition = 'none';
        roomsContainer.style.transform = `translateX(${-currentIndex * cardWidth}px)`;
        roomsContainer.offsetHeight;
        roomsContainer.style.transition = 'transform 500ms ease-in-out';

    } else {
        roomsContainer.style.transition = 'transform 500ms ease-in-out';
        roomsContainer.style.transform = `translateX(${-currentIndex * cardWidth}px)`;
    }
}

// Initial setup
function initializeCarousel() {
    const currentLanguage = getCurrentLanguage();
    populateCarousel(currentLanguage); // Populate based on the stored language

    // Event listeners for language changes
    window.addEventListener('storage', (event) => {
        if (event.key === 'language') {
            const newLanguage = getCurrentLanguage();
            populateCarousel(newLanguage);
            currentIndex = 0;  // Reset index to 0
            roomsContainer.style.transform = `translateX(0px)`; // Reset position.
        }
    });

    // Event listener for window resize
    window.addEventListener('resize', () => {
        const totalCards = roomsContainer.children.length;
        updateCardWidth(); // Recalculate card width on resize
        updateSlideStep();  // Recalculate slideStep on resize!
        currentIndex = Math.max(0, currentIndex - (currentIndex % slideStep)); // Key change!
        currentIndex = Math.min(currentIndex, totalCards - numVisibleCards); // Ensure we don't go past the end.
        roomsContainer.style.transform = `translateX(${-currentIndex * cardWidth}px)`;

    });
}
initializeCarousel(); // Call the initialization function