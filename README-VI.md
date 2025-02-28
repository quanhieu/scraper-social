## Mục tiêu

Kiểm tra khả năng xây dựng hệ thống thu thập dữ liệu, phân tích Social Media Trends, và tích
hợp API để đánh giá hiệu suất nội dung trên YouTube & TikTok.

## Yêu cầu

### 1. Xây dựng một hệ thống Social Listening giúp theo dõi hiệu suất của một Affiliate

Program dựa trên link website được dán vào.

### 2. Chức năng chính:

- Người dùng nhập link website
  - Ví dụ: n8n, Notion, Binance, OKX, Jasper AI.
- Hệ thống tự động tìm kiếm các video review, có nhắc đến tên thương hiệu trên YouTube & TikTok có chứa link đó hoặc từ khóa liên quan.
- Thu thập dữ liệu gồm:

  - Lượt xem

  - Lượt like, comment, share

- Xếp hạng video theo mức độ tương tác và ảnh hưởng.

#### Công nghệ

- YouTube API, TikTok API hoặc scraping (nếu cần).
- Backend: Node.js / Python / Go để xử lý dữ liệu.
- Database: PostgreSQL / MongoDB để lưu kết quả.
- Frontend: Dashboard đơn giản hiển thị danh sách video và thống kê tương tác.

#### Kết quả

- Deploy nhanh, phiên bản dùng thử hoạt động được.
- Thống kê chi tiết giúp người làm Affiliate chọn video phù hợp để hợp tác hoặc học cách làm nội dung
