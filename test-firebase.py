import requests
import json
import os
from datetime import datetime
from dotenv import load_dotenv

# Load biến môi trường từ file .env
if load_dotenv():
    print("✅ Đã load file .env thành công.")
else:
    print("⚠️  Không tìm thấy file .env hoặc load thất bại ensure bạn đang chạy lệnh tại thư mục chứa file .env")

# --- CẤU HÌNH (Dùng API KEY như Node.js) ---
# Paste config của bạn vào đây
firebaseConfig = {
  "apiKey": os.environ.get("REACT_APP_FIREBASE_API_KEY"), # Điền cứng nếu không dùng biến môi trường
  "storageBucket": os.environ.get("REACT_APP_FIREBASE_STORAGE_BUCKET"),
  "projectId": os.environ.get("REACT_APP_FIREBASE_PROJECT_ID")
}

def list_files_as_client():
    # 1. Xác định Endpoint REST API của Firebase Storage
    # URL format: https://firebasestorage.googleapis.com/v0/b/[BUCKET_NAME]/o
    bucket_name = firebaseConfig["storageBucket"]
    url = f"https://firebasestorage.googleapis.com/v0/b/{bucket_name}/o"

    print(f"Connecting to: {url}")

    try:
        # 2. Gọi API (Giống như cách Client SDK hoạt động)
        # Lưu ý: Nếu rules yêu cầu đăng nhập, bạn cần truyền header 'Authorization': 'Bearer [USER_TOKEN]'
        response = requests.get(url)

        if response.status_code == 200:
            data = response.json()
            items = data.get('items', [])
            
            print(f"\n--- Tìm thấy {len(items)} files (Client View) ---")
            
            for item in items:
                name = item.get('name')
                size = item.get('size')
                content_type = item.get('contentType')
                updated = item.get('updated')
                
                # Format này giống output của Node.js Client SDK
                print(f"📄 File: {name}")
                print(f"   Size: {size}")
                print(f"   Type: {content_type}")
                print(f"   Download: https://firebasestorage.googleapis.com/v0/b/{bucket_name}/o/{name.replace('/', '%2F')}?alt=media")
                print("-" * 20)

            # --- LOGIC XÓA FILE ---
            if len(items) > 0:
                print(f"\n⚠️  CẢNH BÁO: Tìm thấy {len(items)} file trong bucket '{bucket_name}'.")
                confirm = input("🔥 Bạn có chắc chắn muốn XÓA TẤT CẢ file này không? (gõ 'yes' để xóa): ")
                
                if confirm.lower() == 'yes':
                    print("\n--- BẮT ĐẦU XÓA ---")
                    for item in items:
                        file_name = item.get('name')
                        # Phải encode dấu / thành %2F trong URL nếu file nằm trong thư mục
                        encoded_name = file_name.replace('/', '%2F')
                        delete_url = f"https://firebasestorage.googleapis.com/v0/b/{bucket_name}/o/{encoded_name}"
                        
                        # Gọi Method DELETE
                        del_response = requests.delete(delete_url)
                        
                        if del_response.status_code == 204:
                            print(f"✅ Đã xóa: {file_name}")
                        else:
                            print(f"❌ Xóa thất bại '{file_name}': {del_response.status_code} - {del_response.text}")
                    print("--- HOÀN TẤT ---")
                else:
                    print("Đã hủy thao tác xóa.")

        else:
            print(f"Lỗi {response.status_code}: {response.text}")
            print("\nNGUYÊN NHÂN CÓ THỂ:")
            print("1. Storage Rules chặn (ví dụ: allow list: if request.auth != null)")
            print("2. Tên Bucket sai.")

    except Exception as e:
        print(f"Exception: {e}")

if __name__ == '__main__':
    # Cần cài thư viện: pip install requests
    list_files_as_client()
