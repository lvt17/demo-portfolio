# Figma API Scripts

## Cách sử dụng Figma API

### Bước 1: Lấy Personal Access Token

1. Vào https://www.figma.com/settings
2. Scroll xuống phần "Personal access tokens"
3. Click "Create new token"
4. Đặt tên token (ví dụ: "Portfolio Project")
5. Copy token (chỉ hiển thị 1 lần!)

### Bước 2: Set Environment Variable

```bash
export FIGMA_TOKEN="your-token-here"
```

Hoặc thêm vào `~/.zshrc` hoặc `~/.bashrc`:
```bash
echo 'export FIGMA_TOKEN="your-token-here"' >> ~/.zshrc
source ~/.zshrc
```

### Bước 3: Chạy Script

```bash
node scripts/figma-api.js
```

### Output

Script sẽ:
- Fetch thông tin từ Figma API cho tất cả các node IDs
- Extract CSS properties (width, height, colors, fonts, spacing, etc.)
- Generate CSS code từ Figma styles
- Output JSON và CSS cho mỗi node

### Lưu ý

- Figma API có rate limit: 200 requests/minute
- Cần có quyền truy cập vào file Figma
- Node IDs có thể thay đổi nếu design được update

### Troubleshooting

**Lỗi 403 Forbidden:**
- Kiểm tra token có đúng không
- Đảm bảo token chưa hết hạn
- Kiểm tra quyền truy cập file

**Lỗi 404 Not Found:**
- Kiểm tra file key có đúng không
- Kiểm tra node ID có tồn tại không

**Rate Limit:**
- Script đã có delay 1 giây giữa các requests
- Nếu vẫn bị limit, tăng delay lên 2-3 giây

