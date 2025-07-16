/**
 * Tiện ích xử lý đa ngôn ngữ dựa trên URL path
 */

// Lấy ngôn ngữ từ URL path
function getLanguageFromUrl() {
    // Kiểm tra URL path có chứa mã ngôn ngữ không
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

// Tạo URL cho ngôn ngữ cụ thể
function createLanguageUrl(lang) {
    const validLanguages = ['en', 'vi', 'ja'];
    
    if (!validLanguages.includes(lang)) {
        lang = 'en'; // Mặc định là tiếng Anh nếu không hợp lệ
    }
    
    // Lấy các phần của URL hiện tại
    const currentUrl = window.location.origin;
    const pathParts = window.location.pathname.split('/').filter(part => part);
    
    // Kiểm tra xem phần đầu tiên có phải là mã ngôn ngữ không
    if (validLanguages.includes(pathParts[0])) {
        // Thay thế mã ngôn ngữ hiện có
        pathParts[0] = lang;
    } else {
        // Thêm mã ngôn ngữ vào đầu
        pathParts.unshift(lang);
    }
    
    // Tạo URL mới
    return `${currentUrl}/${pathParts.join('/')}`;
}