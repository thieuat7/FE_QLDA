// Footer Component - Tái sử dụng cho toàn bộ website
import './Footer.css';

const Footer = () => {
    return (
        <footer className="main-footer">
            <div className="footer-top">
                <div className="container">
                    <div className="footer-grid">
                        {/* About Section */}
                        <div className="footer-col">
                            <h3 className="footer-title">🛍️ I6O STORE</h3>
                            <p className="footer-desc">
                                Thời trang cao cấp, phong cách trẻ trung, năng động.
                                Chất lượng đảm bảo, giá cả hợp lý.
                            </p>
                            <div className="social-links">
                                <a href="#" className="social-btn facebook">📘</a>
                                <a href="#" className="social-btn instagram">📷</a>
                                <a href="#" className="social-btn youtube">📺</a>
                                <a href="#" className="social-btn tiktok">🎵</a>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="footer-col">
                            <h4 className="footer-heading">Về chúng tôi</h4>
                            <ul className="footer-links">
                                <li><a href="#">Giới thiệu</a></li>
                                <li><a href="#">Tin tức</a></li>
                                <li><a href="#">Tuyển dụng</a></li>
                                <li><a href="#">Hệ thống cửa hàng</a></li>
                                <li><a href="#">Liên hệ</a></li>
                            </ul>
                        </div>

                        {/* Customer Support */}
                        <div className="footer-col">
                            <h4 className="footer-heading">Hỗ trợ khách hàng</h4>
                            <ul className="footer-links">
                                <li><a href="#">Hướng dẫn mua hàng</a></li>
                                <li><a href="#">Chính sách đổi trả</a></li>
                                <li><a href="#">Chính sách bảo mật</a></li>
                                <li><a href="#">Điều khoản dịch vụ</a></li>
                                <li><a href="#">Câu hỏi thường gặp</a></li>
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div className="footer-col">
                            <h4 className="footer-heading">Liên hệ</h4>
                            <ul className="footer-contact">
                                <li>
                                    <span className="icon">📍</span>
                                    <span>123 Đường ABC, Q.1, TP.HCM</span>
                                </li>
                                <li>
                                    <span className="icon">📞</span>
                                    <span>Hotline: 1900-xxxx</span>
                                </li>
                                <li>
                                    <span className="icon">📧</span>
                                    <span>support@i6ostore.vn</span>
                                </li>
                                <li>
                                    <span className="icon">⏰</span>
                                    <span>8:00 - 22:00 (Tất cả các ngày)</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Methods */}
            <div className="footer-payment">
                <div className="container">
                    <div className="payment-section">
                        <div className="payment-title">Phương thức thanh toán</div>
                        <div className="payment-icons">
                            <span className="payment-icon">💳 Visa</span>
                            <span className="payment-icon">💳 MasterCard</span>
                            <span className="payment-icon">💰 COD</span>
                            <span className="payment-icon">🏦 Chuyển khoản</span>
                            <span className="payment-icon">📱 MoMo</span>
                            <span className="payment-icon">📱 ZaloPay</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Bottom */}
            <div className="footer-bottom">
                <div className="container">
                    <div className="footer-bottom-content">
                        <p className="copyright">
                            © 2024 I6O Store. All rights reserved. Designed with ❤️ by Development Team
                        </p>
                        <div className="footer-bottom-links">
                            <a href="#">Điều khoản sử dụng</a>
                            <span>|</span>
                            <a href="#">Chính sách bảo mật</a>
                            <span>|</span>
                            <a href="#">Sitemap</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
