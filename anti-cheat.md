Collecting workspace information# Tổng Quan Cơ Chế Anti-Cheat Hệ Thống Test Online

## 📋 Mục Lục
1. Kiến Trúc Tổng Thể
2. Bảo Mật Dữ Liệu
3. Phát Hiện Vi Phạm
4. Xử Lý Vi Phạm
5. Lưu Trữ An Toàn
6. Báo Cáo & Giám Sát

---

## 🏗️ Kiến Trúc Tổng Thể

### Các Thành Phần Chính

```
┌─────────────────────────────────────────────────────────┐
│                    TestRoom Component                    │
│  ┌───────────────────────────────────────────────────┐  │
│  │           Anti-Cheat Detection Layer              │  │
│  │  • Event Listeners                                │  │
│  │  • Activity Monitoring                            │  │
│  │  • Violation Tracking                             │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │         Secure Storage Layer (secureStorage)      │  │
│  │  • Encryption/Decryption                          │  │
│  │  • Integrity Checking                             │  │
│  │  • Fingerprinting                                 │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │              State Management                     │  │
│  │  • Violation Counters                             │  │
│  │  • Test Status                                    │  │
│  │  • Activity Logs                                  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Bảo Mật Dữ Liệu

### 1. **SecureStorage Class** (secureStorage.js)

#### a. Tạo Secret Keys Đa Lớp

```javascript
generateSecretKey() {
  // Kết hợp nhiều browser fingerprints
  const canvas = this.getCanvasFingerprint();
  const screenInfo = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const language = navigator.language;
  const userAgent = navigator.userAgent.slice(0, 50);
  
  return CryptoJS.SHA256(`${canvas}-${screenInfo}-${timezone}-${language}-${userAgent}`).toString();
}
```

**Mục đích:**
- Tạo key duy nhất cho mỗi thiết bị/trình duyệt
- Khó bị đoán hoặc sao chép
- Ngăn chặn việc chuyển dữ liệu giữa các thiết bị

#### b. Canvas Fingerprinting

```javascript
getCanvasFingerprint() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 200;
  canvas.height = 50;
  
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillText('SecureTest123!@#', 2, 2);
  
  return CryptoJS.SHA256(canvas.toDataURL()).toString().slice(0, 16);
}
```

**Đặc điểm:**
- Tạo fingerprint duy nhất dựa trên khả năng render của browser
- Khác nhau giữa các thiết bị/trình duyệt
- Khó bị giả mạo

---

### 2. **Mã Hóa Dữ Liệu**

#### a. Data Packet Structure

```javascript
createDataPacket(data, testId, timestamp = Date.now()) {
  const packet = {
    data,              // Dữ liệu thực tế
    testId,            // ID bài test
    timestamp,         // Thời gian tạo
    sessionId,         // ID phiên làm bài
    checksum,          // Checksum để verify
    integrity          // Hash HMAC để kiểm tra toàn vẹn
  };
  return packet;
}
```

#### b. Quy Trình Mã Hóa

```
┌──────────────┐
│  Raw Data    │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│  Create Data Packet  │
│  • Add metadata      │
│  • Calculate checksum│
│  • Add integrity hash│
└──────┬───────────────┘
       │
       ▼
┌──────────────────┐
│  AES Encryption  │
│  with SecretKey  │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Obfuscation     │
│  • Caesar cipher │
│  • Base64 encode │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Store in        │
│  localStorage    │
└──────────────────┘
```

#### c. Obfuscation Layer

```javascript
obfuscateData(data) {
  // Chia nhỏ dữ liệu thành các phần 50 ký tự
  const parts = data.match(/.{1,50}/g) || [];
  
  // Áp dụng Caesar cipher với shift khác nhau cho mỗi phần
  const shuffled = parts.map((part, index) => {
    const shift = (index + 1) % 26;
    return part.split('').map(char => {
      if (char.match(/[a-zA-Z]/)) {
        const code = char.charCodeAt(0);
        const base = code >= 65 && code <= 90 ? 65 : 97;
        return String.fromCharCode(((code - base + shift) % 26) + base);
      }
      return char;
    }).join('');
  });
  
  return btoa(shuffled.join('|'));
}
```

**Lợi ích:**
- Dữ liệu không thể đọc được trong DevTools
- Thêm 1 lớp bảo vệ ngoài mã hóa AES
- Khó phân tích cấu trúc dữ liệu

---

### 3. **Integrity Checking**

#### a. Checksum Verification

```javascript
// Khi tạo packet
checksum: CryptoJS.SHA256(JSON.stringify(data) + testId + timestamp).toString()

// Khi verify
const expectedChecksum = CryptoJS.SHA256(
  JSON.stringify(packet.data) + packet.testId + packet.timestamp
).toString();

if (packet.checksum !== expectedChecksum) {
  throw new Error('Data checksum mismatch');
}
```

#### b. HMAC Integrity Hash

```javascript
verifyIntegrity(packet) {
  const { integrity, ...packetWithoutIntegrity } = packet;
  const expectedIntegrity = CryptoJS.HmacSHA256(
    JSON.stringify(packetWithoutIntegrity), 
    this.integrityKey
  ).toString();
  
  return integrity === expectedIntegrity;
}
```

**Phát hiện:**
- Dữ liệu bị thay đổi
- Packet bị giả mạo
- Thông tin bị chèn thêm

---

## 🚨 Phát Hiện Vi Phạm

### 1. **Các Loại Vi Phạm Được Giám Sát**

```javascript
const suspiciousActivity = {
  tabSwitches: 0,           // Chuyển tab/cửa sổ
  devToolsAttempts: 0,      // Mở DevTools
  copyAttempts: 0,          // Sao chép nội dung
  screenshotAttempts: 0,    // Chụp màn hình
  contextMenuAttempts: 0,   // Click phải
  keyboardShortcuts: 0      // Phím tắt bị cấm
};
```

---

### 2. **Event Listeners & Detection Methods**

#### a. **DevTools Detection**

```javascript
const detectDevTools = () => {
  const threshold = 160;
  const widthThreshold = window.outerWidth - window.innerWidth > threshold;
  const heightThreshold = window.outerHeight - window.innerHeight > threshold;
  
  if (widthThreshold || heightThreshold) {
    logSuspiciousActivity('devToolsAttempts');
  }
};

// Kiểm tra mỗi giây
const devToolsInterval = setInterval(detectDevTools, 1000);
```

**Nguyên lý:**
- Khi DevTools mở, kích thước cửa sổ thay đổi
- So sánh `outerWidth/Height` với `innerWidth/Height`
- Nếu chênh lệch > 160px → DevTools đang mở

---

#### b. **Tab Switching Detection**

```javascript
// Method 1: visibilitychange event
document.addEventListener('visibilitychange', () => {
  if (document.hidden && !isTestSubmitted) {
    logSuspiciousActivity('tabSwitches');
  }
});

// Method 2: window blur event
window.addEventListener('blur', () => {
  if (!isTestSubmitted) {
    logSuspiciousActivity('tabSwitches');
  }
});

// Method 3: beforeunload (refresh/reload)
window.addEventListener('beforeunload', (e) => {
  if (!isTestSubmitted) {
    logSuspiciousActivity('tabSwitches', 'Page refresh/reload attempt');
    e.preventDefault();
    e.returnValue = '';
  }
});
```

**Bao phủm:**
- Chuyển tab (`Alt+Tab`)
- Mở cửa sổ mới
- Reload trang
- Thoát trình duyệt

---

#### c. **Keyboard Shortcuts Blocking**

```javascript
const handleKeyDown = (e) => {
  // Danh sách phím tắt bị cấm
  if (
    e.key === 'F12' ||
    (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
    (e.ctrlKey && (e.key === 'u' || e.key === 's' || e.key === 'a' || e.key === 'c' || e.key === 'v' || e.key === 'x')) ||
    (e.metaKey && (e.key === 'u' || e.key === 's' || e.key === 'a' || e.key === 'c' || e.key === 'v' || e.key === 'x'))
  ) {
    e.preventDefault();
    logSuspiciousActivity('keyboardShortcuts', `Attempted: ${e.key}`);
    return false;
  }
};
```

**Phím tắt bị chặn:**
- `F12` - Mở DevTools
- `Ctrl+Shift+I/J/C` - DevTools variants
- `Ctrl+U` - View source
- `Ctrl+S` - Lưu trang
- `Ctrl+A/C/V/X` - Select all, Copy, Paste, Cut

---

#### d. **Context Menu & Copy Prevention**

```javascript
// Chặn menu chuột phải
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  logSuspiciousActivity('contextMenuAttempts');
  return false;
});

// Chặn selection
document.addEventListener('selectstart', (e) => {
  e.preventDefault();
  return false;
});

// Chặn copy/cut/paste
['copy', 'cut', 'paste'].forEach(event => {
  document.addEventListener(event, (e) => {
    e.preventDefault();
    logSuspiciousActivity('copyAttempts');
    return false;
  });
});
```

---

#### e. **Screenshot Detection**

```javascript
const handleKeyUp = (e) => {
  if (e.key === 'PrintScreen') {
    logSuspiciousActivity('screenshotAttempts');
  }
};
```

**Hạn chế:**
- Chỉ phát hiện được phím `PrintScreen`
- Không phát hiện được Snipping Tool, Screenshot tools khác
- Vẫn hữu ích để ghi log và cảnh báo

---

#### f. **Fullscreen Enforcement**

```javascript
// Tự động vào fullscreen
const enterFullscreen = async () => {
  try {
    if (document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      await document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      await document.documentElement.msRequestFullscreen();
    }
    setIsFullscreen(true);
  } catch (err) {
    console.error('Could not enter fullscreen:', err);
  }
};

// Giám sát thay đổi fullscreen
const handleFullscreenChange = () => {
  const isCurrentlyFullscreen = !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement
  );
  
  setIsFullscreen(isCurrentlyFullscreen);
  
  if (!isCurrentlyFullscreen && testData) {
    logSuspiciousActivity('tabSwitches', 'Exited fullscreen');
  }
};
```

**Mục đích:**
- Ngăn chặn xem tài liệu ở cửa sổ khác
- Tập trung học sinh vào bài test
- Ghi log khi thoát fullscreen

---

## 📝 Activity Logging

### 1. **Log Entry Structure**

```javascript
const logEntry = { 
  type,                    // Loại vi phạm
  details,                 // Chi tiết
  timestamp,               // Thời gian
  questionIndex,           // Đang ở câu hỏi nào
  sessionId                // ID phiên làm bài
};

activityLogRef.current.push(logEntry);
```

### 2. **Logging Function**

```javascript
const logSuspiciousActivity = useCallback((type, details = '') => {
  if (isTestSubmitted || securityViolationDetected || blockedForCheating) return;
  
  const timestamp = new Date().toISOString();
  const logEntry = { 
    type, 
    details, 
    timestamp, 
    questionIndex: currentQuestionIndex,
    sessionId: secureStorage.getSessionId()
  };
  
  // Thêm vào log
  activityLogRef.current.push(logEntry);
  
  // Lưu vào secure storage ngay lập tức
  secureStorage.setSecureItem(`activity_log_${testId}`, activityLogRef.current, testId);
  
  // Tăng counter
  setSuspiciousActivity(prev => ({
    ...prev,
    [type]: prev[type] + 1
  }));
  
  // Hiển thị cảnh báo
  showWarningToUser(type);
  
  // Kiểm tra ngưỡng vi phạm
  checkViolationThreshold();
}, [/* dependencies */]);
```

---

## ⚖️ Xử Lý Vi Phạm

### 1. **Warning System**

#### a. Hiển thị Cảnh báo

```javascript
// Mapping loại vi phạm → message
switch (type) {
  case 'tabSwitches':
    message = t('antiCheat.tabSwitchWarning');
    break;
  case 'devToolsAttempts':
    message = t('antiCheat.devToolsWarning');
    break;
  // ... các loại khác
}

setWarningMessage(message);
setShowWarning(true);

// Tự động ẩn sau 3 giây
warningTimeoutRef.current = setTimeout(() => {
  setShowWarning(false);
}, 3000);
```

#### b. Warning Modal Component

```jsx
const AntiCheatWarning = () => {
  return (
    <div className="fixed inset-0 bg-red-900/80 backdrop-blur-sm z-[80]">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl border-2 border-red-500">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-4">
          <h2>⚠️ {t('antiCheat.warningTitle')}</h2>
        </div>
        
        {/* Content */}
        <div className="p-6 text-center">
          <p className="text-red-700 font-semibold">{warningMessage}</p>
          <p>{t('antiCheat.violationCount')}: {totalViolations}</p>
          <p className="text-red-600">{t('antiCheat.consequences')}</p>
        </div>
      </div>
    </div>
  );
};
```

---

### 2. **Violation Threshold & Auto-Submit**

```javascript
// Kiểm tra ngưỡng vi phạm
const currentViolations = Object.values(suspiciousActivity).reduce((sum, count) => sum + count, 0);
const totalViolations = currentViolations + 1;

if (totalViolations >= 5) {
  setBlockedForCheating(true);
  handleAutoSubmit('Quá nhiều hành vi gian lận được phát hiện');
}
```

#### Auto-Submit Function

```javascript
const handleAutoSubmit = useCallback(async (reason) => {
  if (isTestSubmitted) return;
  
  try {
    setIsTestSubmitted(true);
    setIsTestTerminated(true);
    
    const payload = {
      quiz_uuid: testId,
      student_username: localStorage.getItem('username') || '',
      answers: testData?.questions.map((question, index) => ({
        question_id: question.id,
        selected_option: answers[index] || ''
      })) || [],
      cheating_detected: true,
      cheating_reason: reason,
      activity_log: activityLogRef.current,
      suspicious_activity: suspiciousActivity,
      security_violation_detected: securityViolationDetected
    };

    const response = await fetch(`http://localhost:8000/api/v1/quiz/check-answers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const data = await response.json();
      setResults(data);
      clearSecureStorage();
    }
  } catch (err) {
    console.error('Error auto-submitting test:', err);
  }
}, [/* dependencies */]);
```

---

### 3. **Blocked Screen**

```jsx
if ((blockedForCheating || isTestTerminated) && !showBlockedResults) {
  return (
    <div className="h-screen bg-gradient-to-br from-red-100 to-red-200">
      <div className="bg-white/90 rounded-2xl border-2 border-red-500">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-6">
          <h1>🚫 {t('antiCheat.testTerminated')}</h1>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <p className="text-red-700">{t('antiCheat.blockedMessage')}</p>
          <p className="text-slate-600">{t('antiCheat.contactSupport')}</p>
          
          <button onClick={handleCloseBlockedScreen}>
            {results ? t('antiCheat.viewResults') : t('antiCheat.backToDashboard')}
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 💾 Lưu Trữ An Toàn

### 1. **State Persistence**

```javascript
// Load từ secure storage khi component mount
const [suspiciousActivity, setSuspiciousActivity] = useState(() => 
  getSuspiciousActivityFromStorage(testId)
);

const [isTestSubmitted, setIsTestSubmitted] = useState(() => 
  getTestSubmittedFromStorage(testId)
);

const [isTestTerminated, setIsTestTerminated] = useState(() => 
  getTestTerminatedFromStorage(testId)
);
```

### 2. **Auto-Save với useEffect**

```javascript
// Tự động lưu khi suspicious activity thay đổi
useEffect(() => {
  if (testId && !securityViolationDetected) {
    secureStorage.setSecureItem(
      `suspicious_activity_${testId}`, 
      suspiciousActivity, 
      testId
    );
  }
}, [suspiciousActivity, testId, securityViolationDetected]);

// Tương tự cho các state khác
useEffect(() => {
  if (testId && !securityViolationDetected) {
    secureStorage.setSecureItem(`test_submitted_${testId}`, isTestSubmitted, testId);
  }
}, [isTestSubmitted, testId, securityViolationDetected]);
```

### 3. **Integrity Validation**

```javascript
// Kiểm tra integrity khi component mount
useEffect(() => {
  if (testId) {
    const activityValid = secureStorage.validateStorageIntegrity(
      `suspicious_activity_${testId}`, 
      testId
    );
    const logValid = secureStorage.validateStorageIntegrity(
      `activity_log_${testId}`, 
      testId
    );
    const submittedValid = secureStorage.validateStorageIntegrity(
      `test_submitted_${testId}`, 
      testId
    );

    if (!activityValid || !logValid || !submittedValid) {
      console.warn('Storage integrity check failed - possible tampering detected');
      setSecurityViolationDetected(true);
    }
  }
}, [testId]);
```

---

## 📊 Báo Cáo & Giám Sát

### 1. **Leaderboard với Thông Tin Anti-Cheat**

```jsx
<LeaderboardModalTest 
  isOpen={showLeaderboard} 
  onClose={() => setShowLeaderboard(false)} 
  leaderboardData={leaderboardData} 
  leaderboardLoading={leaderboardLoading} 
  testData={testData} 
/>
```

### 2. **Results Payload**

```javascript
const payload = {
  quiz_uuid: testId,
  student_username: localStorage.getItem('username') || '',
  answers: testData.questions.map((question, index) => ({
    question_id: question.id,
    selected_option: answers[index] || ''
  })),
  activity_log: activityLogRef.current,           // Full activity log
  suspicious_activity: suspiciousActivity,         // Counters
  security_violation_detected: securityViolationDetected,
  cheating_detected: blockedForCheating,
  cheating_reason: 'Quá nhiều vi phạm...'
};
```

### 3. **Status Bar**

```jsx
<div className="bg-gradient-to-r from-orange-100 to-red-100 border-b border-orange-200 p-2">
  <div className="flex items-center justify-between">
    <div>
      <span>{t('antiCheat.secureMode')}</span>
      {!isFullscreen && (
        <span className="text-red-600">{t('antiCheat.fullscreenRequired')}</span>
      )}
    </div>
    <div>
      {t('antiCheat.violations')}: {Object.values(suspiciousActivity).reduce((sum, count) => sum + count, 0)}
    </div>
  </div>
</div>
```

---

## 🔄 Luồng Hoạt Động Tổng Thể

```
┌─────────────────────────────────────────────────────────────┐
│                    Học sinh vào test                         │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│          Load trạng thái từ Secure Storage                   │
│  • Suspicious activity counters                             │
│  • Activity log                                              │
│  • Test submitted status                                     │
│  • Test terminated status                                    │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│         Kiểm tra Storage Integrity                           │
│  ✓ Valid → Continue                                          │
│  ✗ Invalid → Set securityViolationDetected = true            │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│    Kiểm tra nếu đã bị block/terminated trước đó              │
│  • totalViolations >= 5 → Block ngay                         │
│  • isTestTerminated = true → Show blocked screen             │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              Bật Anti-Cheat Monitoring                        │
│  • Force fullscreen                                          │
│  • Setup event listeners                                     │
│  • Start DevTools detection interval                         │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                 Học sinh làm bài                             │
│                                                              │
│  ┌────────────────────────────────────────────────┐         │
│  │ Nếu có hành vi đáng ngờ:                       │         │
│  │  1. Log activity                                │         │
│  │  2. Increment counter                           │         │
│  │  3. Save to secure storage                      │         │
│  │  4. Show warning modal                          │         │
│  │  5. Check threshold (>= 5?)                     │         │
│  │     → Yes: Auto-submit & block                  │         │
│  │     → No: Continue monitoring                   │         │
│  └────────────────────────────────────────────────┘         │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                  Nộp bài (Submit)                            │
│  • Normal submit: User clicks submit                        │
│  • Auto-submit: Triggered by >= 5 violations                │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│            Gửi payload lên backend                           │
│  • Answers                                                   │
│  • Activity log                                              │
│  • Suspicious activity counters                             │
│  • Security violation detected flag                         │
│  • Cheating detected flag                                   │
│  • Cheating reason                                           │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                  Nhận kết quả                                │
│  • Nếu bị block: Show blocked results screen                │
│  • Nếu bình thường: Show normal results                     │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              Clear Secure Storage                            │
│  (Chỉ sau khi submit thành công)                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Điểm Mạnh & Hạn Chế

### ✅ Điểm Mạnh

1. **Bảo mật nhiều lớp:**
   - Encryption (AES)
   - Obfuscation
   - Integrity checking
   - Fingerprinting

2. **Phát hiện toàn diện:**
   - DevTools
   - Tab switching
   - Copy/paste
   - Context menu
   - Keyboard shortcuts
   - Screenshot attempts
   - Fullscreen exit

3. **Lưu trữ an toàn:**
   - Encrypted localStorage
   - Integrity verification
   - Tampering detection

4. **Activity logging chi tiết:**
   - Timestamp
   - Type
   - Details
   - Question index
   - Session ID

5. **Auto-submit mechanism:**
   - Ngăn chặn gian lận tiếp tục
   - Bảo toàn bằng chứng
   - Tự động xử lý

---

### ⚠️ Hạn Chế

1. **Có thể bypass một số phương pháp:**
   - Virtual machine với nhiều màn hình
   - Camera/điện thoại chụp màn hình
   - Sử dụng thiết bị khác để tra cứu

2. **Browser compatibility:**
   - Một số browser không hỗ trợ fullscreen API
   - DevTools detection có thể không chính xác 100%

3. **False positives:**
   - Người dùng có thể vô tình vi phạm (network issue, browser crash)
   - Cần có cơ chế review/appeal

4. **Performance:**
   - DevTools checking mỗi giây có thể ảnh hưởng performance trên thiết bị yếu
   - Encryption/decryption overhead

5. **User experience:**
   - Fullscreen bắt buộc có thể gây khó chịu
   - Không thể copy/paste legitimate content
   - Cảnh báo liên tục có thể làm căng thẳng

---

## 🔧 Khuyến Nghị Cải Tiến

### 1. **Thêm AI-based Behavior Analysis**
```javascript
// Phân tích pattern hành vi
const analyzeBehavior = (activityLog) => {
  // Detect unusual patterns
  // E.g., answering too fast, too slow, inconsistent timing
  return suspicionScore;
};
```

### 2. **Webcam Proctoring (Tùy chọn)**
```javascript
// Request webcam access
// Capture frames periodically
// Detect multiple faces, looking away, etc.
```

### 3. **IP & Device Tracking**
```javascript
// Track IP changes during test
// Flag if student switches devices
```

### 4. **Question Randomization**
```javascript
// Randomize question order
// Randomize option order
// Use question banks
```

### 5. **Time-based Analysis**
```javascript
// Flag suspiciously fast answers
// Detect copy-paste patterns (answer immediately after question loads)
```

---

## 📚 Translation Keys Reference

### Anti-Cheat Related Keys

```json
{
  "antiCheat": {
    "warningTitle": "Cảnh báo vi phạm",
    "tabSwitchWarning": "Phát hiện chuyển tab/cửa sổ...",
    "devToolsWarning": "Phát hiện Developer Tools...",
    "copyWarning": "Phát hiện sao chép nội dung...",
    "screenshotWarning": "Phát hiện chụp màn hình...",
    "contextMenuWarning": "Phát hiện click chuột phải...",
    "shortcutWarning": "Phát hiện phím tắt bị cấm...",
    "violationCount": "Số lần vi phạm",
    "consequences": "Quá 5 lần vi phạm sẽ bị chấm dứt bài thi!",
    "understood": "Đã hiểu",
    "testTerminated": "Bài thi đã bị chấm dứt",
    "blockedMessage": "Bạn đã bị chấm dứt bài thi do có quá nhiều hành vi gian lận.",
    "contactSupport": "Vui lòng liên hệ với bộ phận hỗ trợ nếu bạn cho rằng đây là lỗi.",
    "secureMode": "Chế độ bảo mật đang bật",
    "fullscreenRequired": "Yêu cầu chế độ toàn màn hình",
    "violations": "Vi phạm",
    "enterFullscreen": "Vào chế độ toàn màn hình",
    "resultsMayBeInvalid": "Kết quả có thể không được ghi nhận",
    "cheatingDetected": "Phát hiện gian lận",
    "viewResults": "Xem kết quả",
    "backToDashboard": "Quay về Dashboard"
  }
}
```

---

## 🎓 Kết Luận

Hệ thống Anti-Cheat này cung cấp một giải pháp **toàn diện và mạnh mẽ** để ngăn chặn gian lận trong các bài test online. Bằng cách kết hợp:

- **Bảo mật dữ liệu** (encryption, obfuscation, integrity checking)
- **Phát hiện hành vi** (event listeners, monitoring)
- **Xử lý vi phạm** (warnings, auto-submit, blocking)
- **Lưu trữ an toàn** (secure storage, fingerprinting)
- **Báo cáo chi tiết** (activity logs, leaderboard)

Hệ thống tạo ra một môi trường thi cử **công bằng** và **đáng tin cậy**, đồng thời vẫn cân bằng được trải nghiệm người dùng.

Tuy nhiên, **không có hệ thống nào là hoàn hảo 100%**. Nên kết hợp với:
- Giáo dục về trung thực học thuật
- Random question banks
- Manual review cho các trường hợp đáng ngờ
- Cơ chế appeal/review cho false positives