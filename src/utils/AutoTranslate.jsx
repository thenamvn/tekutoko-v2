export async function translateText(text, targetLang = 'en') {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    
    try {
        const res = await fetch(url);
        const data = await res.json();
        // Kiểm tra cấu trúc của dữ liệu trả về và lấy phần tử dịch đầu tiên
        if (Array.isArray(data) && Array.isArray(data[0]) && Array.isArray(data[0][0])) {
            // Nối các phần tử dịch lại với nhau nếu có nhiều phần tử
            return data[0].map(item => item[0]).join('');
        } else {
            console.error("Unexpected translation data structure:", data);
            return text; // Trả về nguyên văn nếu cấu trúc dữ liệu không như mong đợi
        }
    } catch (error) {
        console.error("Translation Error:", error);
        return text; // Trả về nguyên văn nếu có lỗi
    }
}