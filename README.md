# FreshPredict - Nền Tảng Dự Báo Lượng Khách & Gợi Ý Mua Nguyên Liệu Thông Minh Cho Quán Ăn F&B

FreshPredict là giải pháp web giúp chủ quán ăn, quán cà phê, quán ăn vỉa hè tại Việt Nam tự động **dự báo lượng khách mỗi ngày** dựa trên thời tiết (Open-Meteo) và chu kỳ ngày trong tuần. Từ đó, hệ thống đưa ra **danh sách đi chợ thông minh** với lượng nguyên liệu tươi sống cần mua vừa đủ, loại trừ rủi ro hỏng hóc quá hạn sử dụng và chống lãng phí dòng tiền.

---

## 1. Công Nghệ & Kiến Trúc

- **Frontend & Full-stack**: React 19 + TypeScript + Express Full-Stack Server + Tailwind CSS v4
- **ORM & Database**: Prisma ORM + PostgreSQL (Neon / Supabase) hoặc SQLite khi phát triển cục bộ
- **Biểu đồ**: Recharts (ComposedChart doanh thu & AreaChart dải dao động khách)
- **API Thời tiết**: Open-Meteo API (miễn phí, không cần API Key, tích hợp cơ chế cache 1 giờ)
- **Xác thực & Bảo mật**: Bcrypt băm mật khẩu, phân tách dữ liệu đa quán (Multi-tenant)
- **Validation**: Zod schema validation trên các API route
- **Unit Testing**: Bộ test tự động kiểm thử công thức dự báo và trần hạn sử dụng nguyên liệu

---

## 2. Cấu Trúc Thư Mục Dự Án (Modular Architecture)

Dự án được phân chia theo module tính năng rõ ràng để nhóm 4 lập trình viên làm việc song song mà không xung đột mã nguồn:

```
├── lib/
│   ├── types.ts          # Định nghĩa interface TypeScript chung cho toàn bộ dự án
│   ├── forecast.ts       # Module dự báo: Baseline × Hệ số Thứ × Thời tiết × Lễ hội
│   ├── purchase.ts       # Module mua nguyên liệu: Dự phòng an toàn & Chặn trần HSD
│   ├── weather.ts        # Module tích hợp Open-Meteo & Cache 1 giờ
│   ├── holidays.ts       # Danh mục ngày lễ Việt Nam (Tết, 30/4 - 1/5, 2/9, v.v.)
│   ├── auth.ts           # Dịch vụ mã hóa bcrypt & xác thực tài khoản
│   └── db.ts             # Lớp truy xuất cơ sở dữ liệu tương thích Prisma
├── prisma/
│   ├── schema.prisma     # Mô hình dữ liệu Prisma (User, Shop, Ingredient, RevenueEntry...)
│   └── seed.ts           # Script tạo dữ liệu mẫu thực tế (Quán Phở Hà Nội & Cà Phê Đà Nẵng)
├── src/
│   ├── components/
│   │   ├── Navbar.tsx            # Header, chọn quán, thời tiết trực tiếp, thông báo
│   │   ├── Sidebar.tsx           # Menu điều hướng tab
│   │   ├── WeatherIcon.tsx       # Hiển thị icon thời tiết Open-Meteo
│   │   ├── IngredientModal.tsx   # Modal thêm & sửa nguyên liệu
│   │   ├── AuthModal.tsx         # Modal đăng nhập & chuyển đổi tài khoản mẫu 1-click
│   │   ├── ProUpgradeModal.tsx   # Modal giới thiệu và kích hoạt gói Pro
│   │   └── tabs/
│   │       ├── DashboardTab.tsx  # Thẻ dự báo 7 ngày & biểu đồ xu hướng
│   │       ├── ForecastTab.tsx   # Phân tích dự báo chuyên sâu & giải trình công thức
│   │       ├── PurchaseTab.tsx   # Danh sách đi chợ, xuất CSV & in ấn
│   │       ├── IngredientsTab.tsx# CRUD nguyên liệu, tồn kho & định mức
│   │       ├── RevenueTab.tsx    # Nhập doanh thu hàng ngày & biểu đồ lịch sử
│   │       └── SettingsTab.tsx   # Quản lý gói Free/Pro & cài đặt tọa độ quán
│   ├── context/
│   │   └── AppContext.tsx        # Quản lý trạng thái toàn cục ứng dụng
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── tests/
│   └── forecast-and-purchase.test.ts # 21 unit tests kiểm thử logic cốt lõi
├── server.ts             # Express server tích hợp Vite middleware
├── .env.example          # Mẫu biến môi trường
└── package.json
```

---

## 3. Công Thức Tính Toán Cốt Lõi

### A. Công thức Dự báo lượng khách (`lib/forecast.ts`)
$$\text{khách\_dự\_báo} = \text{baseline} \times \text{hệ\_số\_thứ} \times \text{hệ\_số\_thời\_tiết} \times \text{hệ\_số\_lễ\_hội}$$

- **Baseline**: Tính trung bình gia quyền từ lịch sử bán hàng gần nhất của quán (trọng số cao hơn cho 14 ngày gần nhất). Nếu quán mới chưa có dữ liệu, dùng `defaultBaseline` chủ quán tự nhập.
- **Hệ số thứ (T2 - CN)**: Tính từ tỉ lệ thực tế các ngày trong tuần so với baseline. T2 thường 0.85x, T6 là 1.15x, T7 là 1.35x, CN là 1.30x.
- **Hệ số thời tiết**:
  - *Mưa*: Giảm 15% - 25% với quán trong nhà, giảm 30% - 50% với quán vỉa hè (`STREET_FOOD`).
  - *Nhiệt độ*: Quán súp/phở nóng (`HOT_FOOD`) tăng 12% - 25% khi trời se lạnh (&le;18°C); quán đồ uống lạnh (`COLD_DRINKS`) tăng 15% - 25% khi trời nắng nóng (&ge;34°C).
- **Hệ số lễ hội**: Tự động áp dụng khi rơi vào dịp Tết Âm Lịch (+60%), 30/4 - 1/5 (+50%), Quốc Khánh (+45%), Giáng Sinh (+40%).

### B. Công thức Gợi ý mua nguyên liệu (`lib/purchase.ts`)
$$\text{cần\_mua} = \text{khách\_dự\_báo} \times \text{định\_mức} \times (1 + \text{hệ\_số\_dự\_phòng}) - \text{tồn\_kho\_hiện\_tại}$$

- **Giới hạn trần hạn sử dụng (Shelf-life cap)**:
  $$\text{lượng\_tối\_đa} = \text{hạn\_sử\_dụng\_ngày} \times \text{lượng\_tiêu\_thụ\_trung\_bình\_ngày}$$
  Nếu `cần_mua + tồn_kho > lượng_tối_đa`, hệ thống sẽ tự động ép giảm lượng mua về mức an toàn để tránh hết hạn phải đổ bỏ.
- **Làm tròn thực tế**: Làm tròn lên theo đơn vị đóng gói hợp lý (0.5kg, 1kg, hoặc số nguyên cho quả/hộp/bó).

---

## 4. Hướng Dẫn Cài Đặt & Chạy Cục Bộ (Local Development)

### Bước 1: Cài đặt dependencies
```bash
npm install
```

### Bước 2: Cấu hình biến môi trường
Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```

### Bước 3: Chạy Unit Tests
Kiểm tra tính chính xác của toàn bộ 21 test case cho logic dự báo và mua hàng:
```bash
npm test
```

### Bước 4: Khởi động máy chủ phát triển
```bash
npm run dev
```
Truy cập ứng dụng tại địa chỉ: `http://localhost:3000`

---

## 5. Dữ Liệu Mẫu Được Cung Cấp Sẵn (Seed Data)

Hệ thống đã có sẵn 2 tài khoản và cơ sở kinh doanh mẫu:
1. **Bác Sáng - Phở Bò Gia Truyền 1986** (Gói PRO)
   - Email: `chusan@freshpredict.vn` | Mật khẩu: `admin123`
   - Địa chỉ: 10 Hàng Nón, Hoàn Kiếm, Hà Nội
   - 10 nguyên liệu chuẩn phở Hà Nội (bánh phở tươi, thăn bò, nạm gầu, xương ống, hành ngò, quẩy giòn...)
   - 60 ngày dữ liệu doanh thu và lượng khách thực tế.
2. **Anh Nam - Cà Phê Muối & Trà Sữa** (Gói FREE)
   - Email: `caphesuada@freshpredict.vn` | Mật khẩu: `cafe123`
   - Địa chỉ: 42 Bạch Đằng, Hải Châu, Đà Nẵng
   - 8 nguyên liệu đồ uống (cà phê Robusta mộc, sữa đặc, kem béo Rich, sữa tươi, trân châu...)
   - 45 ngày dữ liệu doanh thu.

*(Có thể chuyển đổi nhanh 1-click giữa 2 tài khoản ngay tại nút Tài Khoản góc trên bên phải).*

---

## 6. Hướng Dẫn Deploy Lên Vercel & PostgreSQL (Neon / Supabase)

### A. Khởi tạo Cơ Sở Dữ Liệu PostgreSQL (Neon / Supabase)
1. Đăng ký tài khoản miễn phí tại [Neon.tech](https://neon.tech) hoặc [Supabase.com](https://supabase.com).
2. Tạo một database mới tên `freshpredict`.
3. Copy chuỗi kết nối dạng: `postgresql://user:password@ep-xyz.neon.tech/freshpredict?sslmode=require`.

### B. Deploy lên Vercel
1. Đẩy code lên GitHub repository của nhóm.
2. Truy cập [Vercel Dashboard](https://vercel.com) &rarr; **Add New Project** &rarr; Chọn repository.
3. Trong phần **Environment Variables**, điền:
   - `DATABASE_URL`: Chuỗi kết nối PostgreSQL vừa tạo ở trên.
   - `NEXTAUTH_SECRET`: Một chuỗi bí mật ngẫu nhiên (ví dụ tạo bằng `openssl rand -base64 32`).
   - `NODE_ENV`: `production`.
4. Nhấn **Deploy**.

---

## 7. Quy Trình Làm Việc Nhóm 4 Lập Trình Viên (Parallel Collaboration)

Để nhóm 4 lập trình viên làm việc song song hiệu quả, không bị xung đột code:

| Thành viên | Trách nhiệm chính | Thư mục phụ trách |
|---|---|---|
| **Dev 1 (Lead/Core)** | Auth, Database, Prisma schema, Server routes | `lib/auth.ts`, `lib/db.ts`, `prisma/*`, `server.ts` |
| **Dev 2 (Forecast & Weather)** | Thuật toán dự báo, Open-Meteo API, Holiday engine | `lib/forecast.ts`, `lib/weather.ts`, `lib/holidays.ts`, `ForecastTab.tsx` |
| **Dev 3 (Procurement)** | Logic mua nguyên liệu, Hạn sử dụng, Xuất file CSV & In | `lib/purchase.ts`, `PurchaseTab.tsx`, `IngredientsTab.tsx` |
| **Dev 4 (Revenue & Dashboard)** | Nhập doanh thu, Biểu đồ Recharts, Cài đặt & Gói Pro | `RevenueTab.tsx`, `DashboardTab.tsx`, `SettingsTab.tsx` |

### Quy ước Git & Branching:
1. `main`: Nhánh ổn định, luôn chạy được và deploy tự động.
2. Tạo nhánh theo tính năng:
   - `feature/dev2-forecast-weather`
   - `feature/dev3-purchase-ingredients`
   - `feature/dev4-revenue-analytics`
3. Tất cả các module giao tiếp thông qua các interface chuẩn đã định nghĩa tại `lib/types.ts`. Bất kỳ thay đổi nào với `lib/types.ts` phải được cả nhóm thống nhất trước khi commit.
4. Trước khi tạo Pull Request, chạy `npm test` và `npm run lint` để đảm bảo không lỗi kiểu dữ liệu.
