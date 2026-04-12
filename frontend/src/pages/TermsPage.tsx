export default function TermsPage() {
    return (
        <div className="section" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0F172A', marginBottom: '0.5rem' }}>Điều khoản sử dụng</h1>
                <p style={{ color: '#64748B', fontWeight: 500 }}>Cập nhật lần cuối: Tháng 4 năm 2026</p>
            </div>

            <div style={{ background: 'white', padding: '2.5rem', borderRadius: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <section>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E293B', marginBottom: '1rem' }}>1. Giới thiệu</h2>
                        <p style={{ color: '#475569', lineHeight: 1.8, margin: 0 }}>
                            Chào mừng bạn đến với FutureGate. Bằng cách truy cập và sử dụng nền tảng của chúng tôi, bạn đồng ý tuân thủ các điều khoản sử dụng dưới đây. Vui lòng đọc kỹ trước khi sử dụng dịch vụ.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E293B', marginBottom: '1rem' }}>2. Tài khoản người dùng</h2>
                        <p style={{ color: '#475569', lineHeight: 1.8, margin: 0 }}>
                            Khi đăng ký tài khoản trên FutureGate, bạn cam kết cung cấp thông tin chính xác và đầy đủ. Bạn có trách nhiệm bảo mật thông tin đăng nhập và mọi hoạt động diễn ra trên tài khoản của mình.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E293B', marginBottom: '1rem' }}>3. Nội dung và hành vi</h2>
                        <p style={{ color: '#475569', lineHeight: 1.8, margin: 0 }}>
                            Người dùng không được đăng tải nội dung sai sự thật, lừa đảo, vi phạm pháp luật hoặc xâm phạm quyền riêng tư của người khác. FutureGate có quyền xóa nội dung vi phạm và khóa tài khoản mà không cần báo trước.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E293B', marginBottom: '1rem' }}>4. Dịch vụ tuyển dụng</h2>
                        <p style={{ color: '#475569', lineHeight: 1.8, margin: 0 }}>
                            FutureGate là nền tảng kết nối ứng viên và nhà tuyển dụng. Chúng tôi không đảm bảo việc làm sẽ được cung cấp và không chịu trách nhiệm về quyết định tuyển dụng của các bên tham gia.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E293B', marginBottom: '1rem' }}>5. Sở hữu trí tuệ</h2>
                        <p style={{ color: '#475569', lineHeight: 1.8, margin: 0 }}>
                            Toàn bộ nội dung, giao diện, logo và mã nguồn của FutureGate thuộc quyền sở hữu của chúng tôi. Nghiêm cấm sao chép, phân phối hoặc sử dụng trái phép dưới mọi hình thức.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E293B', marginBottom: '1rem' }}>6. Giới hạn trách nhiệm</h2>
                        <p style={{ color: '#475569', lineHeight: 1.8, margin: 0 }}>
                            FutureGate không chịu trách nhiệm về bất kỳ thiệt hại trực tiếp hay gián tiếp nào phát sinh từ việc sử dụng hoặc không thể sử dụng nền tảng này.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E293B', marginBottom: '1rem' }}>7. Thay đổi điều khoản</h2>
                        <p style={{ color: '#475569', lineHeight: 1.8, margin: 0 }}>
                            FutureGate có quyền sửa đổi các điều khoản này bất cứ lúc nào. Việc tiếp tục sử dụng dịch vụ sau khi thay đổi đồng nghĩa với việc bạn chấp nhận các điều khoản mới.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E293B', marginBottom: '1rem' }}>8. Liên hệ</h2>
                        <p style={{ color: '#475569', lineHeight: 1.8, margin: 0 }}>
                            Nếu có thắc mắc về điều khoản sử dụng, vui lòng liên hệ: <strong>support@futuregate.vn</strong>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
