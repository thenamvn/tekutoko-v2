// Tải JSON chứa các ngôn ngữ
const translations = {
    "en": {
        meta: {
            title: "Tekutoko - The Interactive, Easy, and Fun Platform for Hosting & Joining Events!",
            description: "Tekutoko is the ultimate sales promotion tool for increasing customer engagement and building lasting loyalty. With Tekutoko, you can host and join interactive games that make every experience more engaging and fun."
        },
        header: {
            home: "Home",
            introduction: "Introduction",
            benefits: "Benefits",
            features: "Features",
            sample: "Sample Room",
            qa: "Q&A",
            contact: "Contact"
        },
        hero: {
            title: "The Interactive, Easy, and Fun Platform for Hosting & Joining Events!",
            description: "Join now and don't miss out on amazing experiences!",
            joinNow: "Join Now"
        },
        introduction: {
            content: "Tekutoko is the ultimate platform to boost customer engagement and foster lasting loyalty. By enabling interactive, memorable experiences, it helps businesses develop stronger strategies, expand their reach, and drive sales growth."
        },
        showcase: {
            title: "What Can You Do with Tekutoko?",
            description: "With Tekutoko, you can host and join exciting interactive games that make every experience more engaging and fun.",
            item1: "Photo Scavenger Hunt",
            item1_1: "Snap & upload photos to complete challenges.",
            item2: "Stamp Collection Game",
            item2_2: "Collect stamps and reach the goal.",
            item3: "Riddle Challenge",
            item3_3: "Solve quizzes and riddles to progress.",
            item4: "Mission Log",
            item4_4: "Complete fun challenges and upload your results.",
            item5: "Workflow Submission",
            item5_5: " Submit reports and track work tasks easily.",
            item6: "Homework Submission",
            item6_6: "Upload and track homework effortlessly!"
        },
        benefits: {
            title: "Benefits",
            type1: "For Businesses (Event Organizers)",
            type2: "For Participants",
            description1: "Connect with your audience in a fun and interactive way. Tekutoko helps you create memorable experiences that build lasting relationships.",
            description2: "Discover exciting events, connect with others, and create lasting memories with Tekutoko.",
            item1: "Introduce Your Services",
            item1_1: "Highlight your attractions, products, or services in an engaging and memorable way.",
            item2: "Share Knowledge Entertainingly",
            item2_2: "Help participants learn about your services through fun and engaging experiences.",
            item3: "Build a Sustainable Community",
            item3_3: "Strengthen connections with participants by creating a sense of belonging through events.",
            item4: "Fun Interactive Experience",
            item4_4: "Participate in unique tasks, receive attractive rewards, and enjoy extended trips at event locations.",
            item5: "Explore and Connect",
            item5_5: "Follow your favorite organizers and easily join upcoming events to stay engaged.",
            item6: "Preserve Memories",
            item6_6: "Record moments, complete challenges, and share your experiences."
        },
        features: {
            title: "Key Features",
            description: "Discover the features that make Tekutoko unique and useful for both event organizers and participants.",
            item1: "Easy Event Organization and Participation",
            item1_1: "Create events with engaging tasks, manage participants, and track progress easily.",
            item1_2: "Create diverse, engaging tasks.",
            item1_3: "Manage participants easily.",
            item2: "Exclusive Rewards and Offers",
            item2_1: "Join events to receive gifts, discount codes, and other attractive offers.",
            item2_2: "Attractive event gifts.",
            item2_3: "Exclusive discount codes.",
            item3: "Easy Event Tracking and Sharing",
            item3_1: "Easily find, track, and share your favorite events with friends and the community.",
            item3_2: "Share on social media.",
            item3_3: "Easily find events."
        },
        room: {
            title: "Example Rooms"
        },
        qa: {
            title: "Frequently asked questions",
            question1: "How do I create an event?",
            answer1: "After logging in, you can click the 'Create Event' button to start the process of creating and customizing your event.",
            question2: "How to participate and get rewards?",
            answer2: "Participate in activities and events on the website to receive attractive rewards, You can receive rewards via QR code in the 'Rewards' section.",
            question3: "What if I forgot my password?",
            answer3: "You can click on the 'Forgot password' link on the login page to reset your password. A password reset code will be sent to your email."
        },
        footer: {
            contact: "Contact Us",
            copyright: "© 2024-2025 TEKUTOKO. All Rights Reserved.",
            privacy: "Privacy Policy",
            terms: "Terms of Use"
        }


    },
    "vi": {
        meta: {
            title: "Tekutoko - Nền tảng tổ chức sự kiện dễ dàng và thú vị!",
            description: "Tekutoko là công cụ tối ưu để tăng cường sự tương tác giữa doanh nghiệp với khách hàng và tạo dựng niềm tin bền vững. Với Tekutoko, bạn có thể tổ chức và tham gia các trò chơi tương tác thú vị, biến mọi trải nghiệm trở nên hấp dẫn và vui nhộn hơn."
        },
        header: {
            home: "Trang chủ",
            introduction: "Giới thiệu",
            benefits: "Lợi ích",
            features: "Tính năng",
            sample: "Phòng Mẫu",
            qa: "Hỏi đáp",
            contact: "Liên hệ"
        },
        hero: {
            title: "Nền tảng tổ chức sự kiện dễ dàng và thú vị!",
            description: "Tham gia ngay để không bỏ lỡ những trải nghiệm tuyệt vời!",
            joinNow: "Tham Gia"
        },
        introduction: {
            content: "Tekutoko là nền tảng tối ưu để tăng cường sự tương tác giữa doanh nghiệp với khách hàng, tạo dựng niềm tin bền vững. Bằng cách tạo ra những trải nghiệm tương tác, đáng nhớ, Tekutoko giúp doanh nghiệp phát triển chiến lược mạnh mẽ hơn, mở rộng thị trường với và thúc đẩy tăng trưởng doanh số."
        },
        showcase: {
            title: "Bạn Có Thể Làm Gì Với Tekutoko?",
            description: "Với Tekutoko, bạn có thể tổ chức và tham gia các hoạt động tương tác thú vị, biến mọi trải nghiệm trở nên hấp dẫn và vui nhộn hơn.",
            item1: "Săn Ảnh Thú Vị",
            item1_1: "Chụp và chia sẻ ảnh để hoàn thành thử thách.",
            item2: "Sưu Tập Tem",
            item2_2: "Thu thập tem và đạt mục tiêu đề ra.",
            item3: "Thử Thách Đố Vui",
            item3_3: "Giải đố và trả lời câu hỏi để tiến bộ.",
            item4: "Nhật Ký Nhiệm Vụ",
            item4_4: "Hoàn thành các thử thách vui nhộn và chia sẻ kết quả.",
            item5: "Nộp Báo Cáo",
            item5_5: "Gửi và theo dõi tiến độ công việc dễ dàng.",
            item6: "Nộp Bài Tập",
            item6_6: "Tải lên và quản lý bài tập đơn giản!"
        },
        benefits: {
            title: "Lợi Ích",
            type1: "Dành Cho Doanh Nghiệp (Tổ Chức Sự Kiện)",
            type2: "Dành Cho Người Tham Gia",
            description1: "Kết nối với khán giả một cách vui vẻ và tương tác. Tekutoko giúp bạn tạo ra những trải nghiệm đáng nhớ, xây dựng mối quan hệ lâu dài.",
            description2: "Khám phá những sự kiện hấp dẫn, kết nối với người khác và tạo ra những kỷ niệm bền vững cùng Tekutoko.",
            item1: "Giới Thiệu Dịch Vụ",
            item1_1: "Nổi bật những điểm mạnh, sản phẩm hoặc dịch vụ của bạn một cách hấp dẫn và đáng nhớ.",
            item2: "Chia Sẻ Kiến Thức Một Cách Thú Vị",
            item2_2: "Giúp người tham gia hiểu về dịch vụ của bạn thông qua những trải nghiệm vui vẻ và hấp dẫn.",
            item3: "Xây Dựng Cộng Đồng Bền Vững",
            item3_3: "Củng cố mối quan hệ với người tham gia bằng cách tạo ra cảm giác thuộc về thông qua các sự kiện.",
            item4: "Trải Nghiệm Tương Tác Thú Vị",
            item4_4: "Tham gia vào các nhiệm vụ độc đáo, nhận phần thưởng hấp dẫn và thưởng thức những chuyến đi kéo dài tại các địa điểm sự kiện.",
            item5: "Khám Phá và Kết Nối",
            item5_5: "Theo dõi những tổ chức sự kiện yêu thích của bạn và dễ dàng tham gia vào những sự kiện sắp tới để duy trì sự tương tác.",
            item6: "Lưu Giữ Kỷ Niệm",
            item6_6: "Ghi lại những khoảnh khắc, hoàn thành thách thức và chia sẻ trải nghiệm của bạn."
        },
        features: {
            title: "Tính Năng Nổi Bật",
            description: "Khám phá những tính năng giúp Tekutoko trở nên độc đáo và hữu ích cho cả người tổ chức và người tham gia sự kiện.",
            item1: "Dễ dàng tổ chức và tham gia sự kiện",
            item1_1: "Tạo sự kiện với các nhiệm vụ hấp dẫn, quản lý người tham gia, và theo dõi tiến trình một cách dễ dàng.",
            item1_2: "Tạo nhiệm vụ đa dạng, hấp dẫn.",
            item1_3: "Quản lý người tham gia dễ dàng.",
            item2: "Phần thưởng và ưu đãi độc quyền",
            item2_1: "Tham gia sự kiện để nhận quà tặng, mã giảm giá và nhiều ưu đãi hấp dẫn khác.",
            item2_2: "Quà tặng sự kiện hấp dẫn.",
            item2_3: "Mã giảm giá độc quyền.",
            item3: "Theo dõi và chia sẻ sự kiện dễ dàng",
            item3_1: "Dễ dàng tìm kiếm, theo dõi và chia sẻ các sự kiện yêu thích với bạn bè và cộng đồng.",
            item3_2: "Chia sẻ qua mạng xã hội.",
            item3_3: "Tìm kiếm sự kiện dễ dàng."
        },
        room: {
            title: "Phòng Mẫu"
        },
        qa: {
            title: "Câu hỏi thường gặp",
            question1: "Làm thế nào để tạo sự kiện?",
            answer1: "Sau khi đăng nhập, bạn có thể nhấn vào nút 'Tạo Sự Kiện' để bắt đầu quá trình tạo và tùy chỉnh sự kiện của bạn.",
            question2: "Làm thế nào để tham gia và nhận phần thưởng?",
            answer2: "Tham gia các hoạt động và sự kiện trên trang web để nhận phần thưởng hấp dẫn, Bạn có thể nhận phần thưởng qua mã QR trong phần 'Phần Thưởng'.",
            question3: "Nếu tôi quên mật khẩu thì sao?",
            answer3: "Bạn có thể nhấn vào liên kết 'Quên mật khẩu' trên trang đăng nhập để đặt lại mật khẩu. Một mã đặt lại mật khẩu sẽ được gửi vào email của bạn."
        },
        footer: {
            contact: "Liên hệ",
            copyright: "© 2024-2025 TEKUTOKO. Mọi quyền đã được bảo lưu.",
            privacy: "Chính sách Bảo mật",
            terms: "Điều Khoản Sử Dụng",
        }
    },
    "ja": {
        meta: {
            title: "Tekutoko - イベントを簡単に楽しく開催＆参加できるプラットフォーム！",
            description: "Tekutokoは、顧客とのエンゲージメントを高め、持続的なロイヤルティを育むための究極のプラットフォームです。インタラクティブで記憶に残る体験を可能にすることで、ビジネスはより強力な戦略を開発し、リーチを拡大し、売上成長を促進するのに役立ちます。"
        },
        header: {
            home: "ホーム",
            introduction: "紹介",
            benefits: "メリット",
            features: "機能",
            sample: "サンプルルーム",
            qa: "Q&A",
            contact: "お問い合わせ"
        },
        hero: {
            title: "イベントを簡単に楽しく開催＆参加できるプラットフォーム！",
            description: "今すぐ参加して、素晴らしい体験をお見逃しなく！",
            joinNow: "今すぐ参加"
        },
        introduction: {
            content: "Tekutokoは、顧客とのエンゲージメントを高め、持続的なロイヤルティを育むための究極のプラットフォームです。インタラクティブで記憶に残る体験を可能にすることで、ビジネスはより強力な戦略を開発し、リーチを拡大し、売上成長を促進するのに役立ちます。"
        },
        showcase: {
            title: "Tekutokoでできること",
            description: "Tekutokoで、楽しく魅力的なインタラクティブゲームを主催し、参加することができます。すべての体験がより面白く充実したものになります。",
            item1: "フォトスカベンジャーハント",
            item1_1: "写真を撮影してアップロードし、チャレンジを達成しよう。",
            item2: "スタンプラリー",
            item2_2: "スタンプを集めて、目標を達成しよう。",
            item3: "なぞなぞチャレンジ",
            item3_3: "クイズやなぞなぞを解いて進もう。",
            item4: "ミッションログ",
            item4_4: "楽しいチャレンジを完了して、結果を共有しよう。",
            item5: "ワークフロー提出",
            item5_5: "レポートを簡単に提出し、タスクを管理。",
            item6: "宿題提出",
            item6_6: "宿題を簡単にアップロードして管理しよう！"
        },
        benefits: {
            title: "メリット",
            type1: "ビジネス（イベント主催者）向け",
            type2: "参加者向け",
            description1: "楽しくインタラクティブに観客とつながります。Tekutokoは、持続的な関係を築く記憶に残る体験を作成するのに役立ちます。",
            description2: "エキサイティングなイベントを発見し、他の人とつながり、Tekutokoで記憶に残る思い出を作成します。",
            item1: "サービスの紹介",
            item1_1: "魅力的で記憶に残る方法で、あなたの魅力、製品、またはサービスを強調します。",
            item2: "楽しく知識を共有",
            item2_2: "楽しく魅力的な体験を通じて、参加者があなたのサービスについて学ぶのを助けます。",
            item3: "持続可能なコミュニティの構築",
            item3_3: "イベントを通じて帰属感を作り出すことで、参加者とのつながりを強化します。",
            item4: "楽しいインタラクティブ体験",
            item4_4: "ユニークなタスクに参加し、魅力的な報酬を受け取り、イベントの場所で長期滞在を楽しむ。",
            item5: "探索とつながり",
            item5_5: "お気に入りの主催者をフォローし、簡単に次のイベントに参加して関与を維持します。",
            item6: "思い出を保存",
            item6_6: "瞬間を記録し、チャレンジを完了し、あなたの経験を共有します。"
        },
        features: {
            title: "主な機能",
            description: "Tekutokoをユニークで便利にする機能を発見してください。イベント主催者と参加者の両方にとって有用です。",
            item1: "イベントの簡単な組織と参加",
            item1_1: "魅力的なタスクを持つイベントを作成し、参加者を管理し、進行状況を簡単に追跡します。",
            item1_2: "多様で魅力的なタスクを作成します。",
            item1_3: "参加者を簡単に管理します。",
            item2: "独占的な報酬とオファー",
            item2_1: "イベントに参加して、ギフト、割引コード、その他の魅力的なオファーを受け取ります。",
            item2_2: "魅力的なイベントギフト。",
            item2_3: "独占的な割引コード。",
            item3: "イベントの追跡と共有が簡単",
            item3_1: "お気に入りのイベントを簡単に見つけ、追跡し、友達やコミュニティと共有します。",
            item3_2: "ソーシャルメディアで共有します。",
            item3_3: "イベントを簡単に見つけます。"
        },
        room: {
            title: "サンプルルーム"
        },
        qa: {
            title: "よくある質問",
            question1: "イベントを作成する方法",
            answer1: "ログインした後、 'イベントを作成'ボタンをクリックして、イベントの作成とカスタマイズのプロセスを開始できます。",
            question2: "参加して報酬を得る方法",
            answer2: "ウェブサイト上のアクティビティとイベントに参加して魅力的な報酬を受け取ります。 '報酬'セクションのQRコードを使用して報酬を受け取ることができます。",
            question3: "パスワードを忘れた場合",
            answer3: "ログインページの 'パスワードを忘れた'リンクをクリックしてパスワードをリセットできます。パスワードリセットコードがメールで送信されます。"
        },
        footer: {
            contact: "お問い合わせ",
            copyright: "© 2024-2025 TEKUTOKO。すべての権利を保有。",
            privacy: "プライバシーポリシー",
            terms: "利用規約"
        }
    }
};


// Hàm cập nhật nội dung theo ngôn ngữ
function setLanguage(lang) {
    localStorage.setItem("language", lang); // Lưu vào localStorage

    // Cập nhật hiển thị của dropdown ngôn ngữ
    updateLanguageDisplay(lang);
    // Cập nhật meta tags theo ngôn ngữ đã chọn
    updateMetaTags(lang);
    document.querySelectorAll("[data-translate]").forEach(element => {
        const keys = element.getAttribute("data-translate").split("."); // Hỗ trợ key lồng nhau
        let translation = translations[lang];

        // Duyệt qua từng cấp của JSON (hỗ trợ nhiều cấp)
        keys.forEach(key => {
            if (translation && translation[key]) {
                translation = translation[key];
            } else {
                translation = null;
            }
        });

        if (translation) {
            element.innerText = translation;
        }
    });
}

// Thêm hàm này nếu chưa có
function updateLanguageDisplay(language) {
    const selectedOption = document.querySelector(`[data-lang="${language}"]`);
    if (selectedOption) {
        document.getElementById("selected-text").innerText = selectedOption.getAttribute("data-text");
        document.getElementById("selected-flag").src = selectedOption.getAttribute("data-flag");
    }
}
function updateMetaTags(language) {
    // Cập nhật thẻ meta description và title theo ngôn ngữ
    const metaDescription = document.querySelector('meta[name="description"]');
    const metaTitle = document.querySelector('meta[name="title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const documentTitle = document.querySelector('title');
    
    // Đảm bảo rằng translations[language] và translations[language].meta tồn tại
    if (translations[language] && translations[language].meta) {
        // Cập nhật meta description
        if (metaDescription && translations[language].meta.description) {
            metaDescription.setAttribute('content', translations[language].meta.description);
        }
        
        // Cập nhật meta title
        if (metaTitle && translations[language].meta.title) {
            metaTitle.setAttribute('content', translations[language].meta.title);
        }
        
        // Cập nhật og:description
        if (ogDescription && translations[language].meta.description) {
            ogDescription.setAttribute('content', translations[language].meta.description);
        }
        
        // Cập nhật og:title
        if (ogTitle && translations[language].meta.title) {
            ogTitle.setAttribute('content', translations[language].meta.title);
        }

        // Cập nhật tiêu đề trang
        if (documentTitle && translations[language].meta.title) {
            documentTitle.textContent = translations[language].meta.title;
        }
    }
}

// Khi tải trang, kiểm tra localStorage để lấy ngôn ngữ đã lưu
document.addEventListener("DOMContentLoaded", function () {
    const savedLang = localStorage.getItem("language") || "en"; // Mặc định là English
    setLanguage(savedLang);
});

// Xử lý khi người dùng chọn ngôn ngữ
document.querySelectorAll("[data-lang]").forEach(button => {
    button.addEventListener("click", function () {
        const lang = this.getAttribute("data-lang");
        setLanguage(lang);
        location.reload(); // Reload lại trang để áp dụng
    });
});

// Khi tải trang, kiểm tra localStorage để lấy ngôn ngữ đã lưu
document.addEventListener("DOMContentLoaded", function () {
    // Lấy ngôn ngữ từ URL path trước
    const language = getLanguageFromUrl();
    
    // Cập nhật localStorage để khớp với URL path
    if (language !== localStorage.getItem("language")) {
        localStorage.setItem("language", language);
    }
    
    // Áp dụng ngôn ngữ
    setLanguage(language);
});
