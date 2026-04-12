export default function PrivacyPage() {
    return (
        <div className="section" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0F172A', marginBottom: '0.5rem' }}>Chính sách bảo mật</h1>
                <p style={{ color: '#64748B', fontWeight: 500 }}>Cập nhật lần cuối: Tháng 4 năm 2026</p>
            </div>

            <div style={{ background: 'white', padding: '2.5rem', borderRadius: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <section>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E293B', marginBottom: '1rem' }}>1. Thu thập thông tin</h2>
                        <p style={{ color: '#475569', lineHeight: 1.8, margin: 0 }}>
                            FutureGate thu thập các thông tin cá nhân mà bạn cung cấp khi đăng ký tài khoản, tạo hồ sơ, ứng tuyển hoặc liên hệ với nhà tuyển dụng. Các thông tin bao gồm: họ tên, email, số điện thoại, thông tin học vấn, kinh nghiệm làm việc và sở thích nghề nghiệp.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E293B', marginBottom: '1rem' }}>2. Mục đích sử dụng</h2>
                        <p style={{ color: '#475569', lineHeight: 1.8, margin: 0 }}>
                            Thông tin của bạn được sử dụng để: kết nối với nhà tuyển dụng phù hợp, gửi thông báo việc làm, cải thiện trải nghiệm người dùng, phân tích xu hướng thị trường lao động và tuân thủ các nghĩa vụ pháp lý.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E293B', marginBottom: '1rem' }}>3. Chia sẻ thông tin</h2>
                        <p style={{ color: '#475569', lineHeight: 1.8, margin: 0 }}>
                            Chúng tôi không bán hoặc cho thuê thông tin cá nhân của bạn. Thông tin hồ sơ có thể được chia sẻ với nhà tuyển dụng khi bạn ứng tuyển hoặc cho phép hiển thị công khai. Dữ liệu ẩn danh có thể được sử dụng cho mục đích thống kê.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E293B', marginBottom: '1rem' }}>4. Bảo mật dữ liệu</h2>
                        <p style={{ color: '#475569', lineHeight: 1.8, margin: 0 }}>
                            FutureGate áp dụng các biện pháp bảo mật tiêu chuẩn công nghiệp để bảo vệ thông tin của bạn, bao gồm mã hóa dữ liệu, kiểm soát truy cập và giám sát an ninh mạng thường xuyên.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E293B', marginBottom: '1rem' }}>5. Quyền của người dùng</h2>
                        <p style={{ color: '#475569', lineHeight: 1.8, margin: 0 }}>
                            Bạn có quyền truy cập, chỉnh sửa, xuất hoặc yêu cầu xóa dữ liệu cá nhân của mình bất cứ lúc nào thông qua trang cài đặt tài khoản hoặc liên hệ với bộ phận hỗ trợ.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E293B', marginBottom: '1rem' }}>6. Cookie và công nghệ theo dõi</h2>
                        <p style={{ color: '#475569', lineHeight: 1.8, margin: 0 }}>
                            FutureGate sử dụng cookie và các công nghệ tương tự để cải thiện trải nghiệm, phân tích lưu lượng truy cập và cá nhân hóa nội dung. Bạn có thể quản lý cookie thông qua cài đặt trình duyệt.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E293B', marginBottom: '1rem' }}>7. Lưu trữ dữ liệu</h2>
                        <p style={{ color: '#475569', lineHeight: 1.8, margin: 0 }}>
                            Dữ liệu của bạn được lưu trữ trên máy chủ đám mây an toàn. Chúng tôi sẽ giữ thông tin của bạn miễn là tài khoản còn hoạt động hoặc theo yêu cầu pháp lý.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E293B', marginBottom: '1rem' }}>8. Liên hệ</h2>
                        <p style={{ color: '#475569', lineHeight: 1.8, margin: 0 }}>
                            Nếu có thắc mắc về chính sách bảo mật, vui lòng liên hệ: <strong>privacy@futuregate.vn</strong>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
