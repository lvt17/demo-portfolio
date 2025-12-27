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

### Bước 3: Chạy Scripts

#### 1. Lấy thông tin từ Figma API

```bash
node scripts/figma-api.js
```

Script này sẽ:
- Fetch thông tin từ Figma API cho tất cả các node IDs
- Extract CSS properties (width, height, colors, fonts, spacing, etc.)
- Generate CSS code từ Figma styles
- Lưu output vào `scripts/output/` (JSON và CSS files)

#### 2. Apply CSS tự động vào code

```bash
node scripts/apply-figma-css.js
```

Script này sẽ:
- Đọc data từ `scripts/output/`
- Generate CSS rules dựa trên Figma data
- Scale font sizes cho mobile (440px frame -> 375px screen)
- Output CSS để apply vào `css/style.css`

**Lưu ý:** Script hiện tại chỉ output CSS, bạn cần apply thủ công hoặc cải thiện script để tự động apply.

### Output Files

Tất cả files được lưu trong `scripts/output/`:
- `home1.json`, `home1.css` - DoraChann Portfolio section
- `home2.json`, `home2.css` - WELCOME TO my Vietnameseland section
- `dragon.json`, `dragon.css` - Philosophy/Dragon section
- `preview1.json`, `preview1.css` - Gallery preview 1
- `preview2.json`, `preview2.css` - Gallery preview 2

### Mapping Figma → CSS

Script sử dụng mapping để map Figma node names đến CSS selectors:

```javascript
const FIGMA_TO_CSS_MAP = {
  'home1': {
    'DoraChann': '.hero__name',
    'PortfoLio': '.hero__title'
  },
  'home2': {
    'WELCOME': '.hero__welcome span:first-child',
    'TO': '.hero__welcome .to',
    'my': '.hero__welcome .my',
    'Vietnameseland': '.hero__welcome .land'
  },
  'dragon': {
    'ĐỐI VỚI TÔI...': '.philosophy__title',
    'Văn hoá, là nói lên bản sắc của một dân tộc.': '.philosophy__quote--first p',
    // ...
  }
};
```

### Scaling cho Mobile

Script tự động scale font sizes từ Figma frame (440px) sang mobile screen (375px):
- Formula: `mobileSize = (figmaSize / 440) * 375`

### Lưu ý

- Figma API có rate limit: 200 requests/minute
- Cần có quyền truy cập vào file Figma
- Node IDs có thể thay đổi nếu design được update
- Script đã có delay 1 giây giữa các requests để tránh rate limit

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

### Cải thiện Script

Để tự động apply CSS vào file, bạn có thể:
1. Cải thiện `apply-figma-css.js` để tự động tìm và replace CSS sections
2. Sử dụng AST parser để parse và modify CSS
3. Hoặc apply thủ công dựa trên output của script
