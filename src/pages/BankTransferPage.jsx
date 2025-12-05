import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './BankTransferPage.css';

const BankTransferPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const [orderInfo, setOrderInfo] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // Lấy thông tin đơn hàng từ URL params
        const orderId = searchParams.get('orderId');
        const amount = searchParams.get('amount');
        const orderCode = searchParams.get('orderCode');

        if (orderId && amount) {
            setOrderInfo({
                orderId,
                amount: parseInt(amount),
                orderCode: orderCode || orderId,
                bankName: 'Vietcombank',
                accountNumber: '1033238856',
                accountName: 'NGUYEN DUC HAI',
                transferContent: `DH${orderId}`
            });
        }
    }, [searchParams]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const copyToClipboard = (text, field) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(field);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleConfirmPayment = () => {
        clearCart();
        navigate('/order-success', {
            state: {
                orderId: orderInfo.orderId,
                paymentMethod: 'BANK_TRANSFER'
            }
        });
    };

    if (!orderInfo) {
        return (
            <>
                <Header />
                <div className="bank-transfer-container">
                    <div className="loading">
                        <div className="spinner"></div>
                        <p>Đang tải thông tin...</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="bank-transfer-container">
                <div className="bank-transfer-content">
                    <div className="bank-header">
                        <div className="bank-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>
                        <h2>Chuyển khoản ngân hàng</h2>
                        <p className="subtitle">Vui lòng chuyển khoản theo thông tin bên dưới</p>
                    </div>

                    <div className="bank-details">
                        <div className="detail-item">
                            <label>Ngân hàng</label>
                            <div className="value-with-copy">
                                <span className="value">{orderInfo.bankName}</span>
                                <button
                                    className="copy-btn"
                                    onClick={() => copyToClipboard(orderInfo.bankName, 'bank')}
                                >
                                    {copied === 'bank' ? '✓ Đã sao chép' : 'Sao chép'}
                                </button>
                            </div>
                        </div>

                        <div className="detail-item">
                            <label>Số tài khoản</label>
                            <div className="value-with-copy">
                                <span className="value highlight">{orderInfo.accountNumber}</span>
                                <button
                                    className="copy-btn"
                                    onClick={() => copyToClipboard(orderInfo.accountNumber, 'account')}
                                >
                                    {copied === 'account' ? '✓ Đã sao chép' : 'Sao chép'}
                                </button>
                            </div>
                        </div>

                        <div className="detail-item">
                            <label>Chủ tài khoản</label>
                            <div className="value-with-copy">
                                <span className="value">{orderInfo.accountName}</span>
                                <button
                                    className="copy-btn"
                                    onClick={() => copyToClipboard(orderInfo.accountName, 'name')}
                                >
                                    {copied === 'name' ? '✓ Đã sao chép' : 'Sao chép'}
                                </button>
                            </div>
                        </div>

                        <div className="detail-item">
                            <label>Số tiền cần chuyển</label>
                            <div className="value-with-copy">
                                <span className="value amount">{formatPrice(orderInfo.amount)}</span>
                                <button
                                    className="copy-btn"
                                    onClick={() => copyToClipboard(orderInfo.amount.toString(), 'amount')}
                                >
                                    {copied === 'amount' ? '✓ Đã sao chép' : 'Sao chép'}
                                </button>
                            </div>
                        </div>

                        <div className="detail-item important">
                            <label>Nội dung chuyển khoản</label>
                            <div className="value-with-copy">
                                <span className="value highlight">{orderInfo.transferContent}</span>
                                <button
                                    className="copy-btn"
                                    onClick={() => copyToClipboard(orderInfo.transferContent, 'content')}
                                >
                                    {copied === 'content' ? '✓ Đã sao chép' : 'Sao chép'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="qr-section">
                        <h3>Quét mã QR để chuyển khoản</h3>
                        <div className="qr-code">
                            <img
                                src={`https://img.vietqr.io/image/${orderInfo.bankName}-${orderInfo.accountNumber}-compact2.jpg?amount=${orderInfo.amount}&addInfo=${orderInfo.transferContent}&accountName=${orderInfo.accountName}`}
                                alt="QR Code chuyển khoản"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = '<p style="color: #666;">QR Code không khả dụng</p>';
                                }}
                            />
                        </div>
                        <p className="qr-note">Quét mã QR bằng app ngân hàng để chuyển khoản tự động</p>
                    </div>

                    <div className="instructions">
                        <h3>Hướng dẫn</h3>
                        <ol>
                            <li>Mở ứng dụng ngân hàng của bạn</li>
                            <li>Chọn chức năng chuyển khoản</li>
                            <li>Nhập thông tin tài khoản người nhận như trên</li>
                            <li>Nhập số tiền: <strong>{formatPrice(orderInfo.amount)}</strong></li>
                            <li>Nhập nội dung: <strong>{orderInfo.transferContent}</strong></li>
                            <li>Xác nhận và hoàn tất giao dịch</li>
                        </ol>
                    </div>

                    <div className="warning-box">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                            <strong>Lưu ý quan trọng:</strong>
                            <p>Vui lòng nhập ĐÚNG nội dung chuyển khoản <strong>{orderInfo.transferContent}</strong> để đơn hàng được xác nhận tự động.</p>
                        </div>
                    </div>

                    <div className="actions">
                        <button className="btn-primary" onClick={handleConfirmPayment}>
                            Tôi đã chuyển khoản
                        </button>
                        <button className="btn-secondary" onClick={() => navigate('/cart')}>
                            Quay lại giỏ hàng
                        </button>
                    </div>

                    <div className="support-info">
                        <p>Đơn hàng sẽ được xử lý sau khi chúng tôi nhận được thanh toán</p>
                        <p>Cần hỗ trợ? Liên hệ: <strong>0287.100.8788</strong></p>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default BankTransferPage;
