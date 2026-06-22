import React, { useEffect, useState } from 'react';
import adminOrderService from '../../services/orderService'; // Biz boya yaratgan servis

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filtrlar uchun state'lar
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    // Ma'lumotlarni yuklash
    useEffect(() => {
        const fetchAdminOrders = async () => {
            try {
                const res = await adminOrderService.getAllOrdersForAdmin();
                if (res.success) {
                    setOrders(res.data);
                    setFilteredOrders(res.data);
                }
            } catch (err) {
                setError(err.message || "Buyurtmalarni yuklashda xatolik yuz berdi");
            } finally {
                setLoading(false);
            }
        };

        fetchAdminOrders();
    }, []);

    // Filtr mantiqi
    useEffect(() => {
        let result = [...orders];

        if (statusFilter) {
            result = result.filter(order => order.status === statusFilter);
        }

        if (dateFilter) {
            result = result.filter(order => {
                const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
                return orderDate === dateFilter;
            });
        }

        setFilteredOrders(result);
    }, [statusFilter, dateFilter, orders]);

    // Statusni o'zgartirish funksiyasi
    const handleStatusChange = async (orderId, currentStatus) => {
        const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        const nextIndex = (statuses.indexOf(currentStatus) + 1) % statuses.length;
        const newStatus = statuses[nextIndex];

        if (!window.confirm(`Buyurtma statusini "${newStatus}" ga o'zgartirmoqchimisiz?`)) return;

        try {
            const res = await adminOrderService.updateOrderStatus(orderId, newStatus);
            if (res.success) {
                setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            }
        } catch (err) {
        }
    };

    // Status ranglarini aniqlash (Rasmga moslab)
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'delivered': return 'bg-[#00B69B]/20 text-[#00B69B]'; // Completed
            case 'processing': return 'bg-[#6226EF]/20 text-[#6226EF]'; // Processing
            case 'pending': return 'bg-[#FFA755]/20 text-[#FFA755]'; // On Hold
            case 'cancelled': return 'bg-[#EF3826]/20 text-[#EF3826]'; // Rejected
            default: return 'bg-gray-700 text-gray-300';
        }
    };

    if (loading) return <div className="text-center pt-20 text-white">Yuklanmoqda...</div>;
    if (error) return <div className="text-center pt-20 text-red-500">{error}</div>;

    return (
        <div className="min-h-screen bg-[#1F2128] text-white p-8 font-sans">
            <div className="max-w-7xl mx-auto">

                {/* Sarlavha */}
                <h1 className="text-3xl font-semibold mb-6 text-gray-100">Order Lists</h1>

                {/* Filtrlar paneli */}
                <div className="bg-[#242731] p-4 rounded-xl flex flex-wrap items-center gap-4 mb-6 border border-gray-800">
                    <div className="flex items-center gap-2 text-gray-400">
                        <span>Filter By</span>
                    </div>

                    {/* Sana bo'yicha filtr */}
                    <input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="bg-[#1F2128] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-blue-500"
                    />

                    {/* Status bo'yicha filtr */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-[#1F2128] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-blue-500"
                    >
                        <option value="">Order Status</option>
                        <option value="pending">Pending (On Hold)</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered (Completed)</option>
                        <option value="cancelled">Cancelled (Rejected)</option>
                    </select>

                    {/* Filtrni tiklash */}
                    {(statusFilter || dateFilter) && (
                        <button
                            onClick={() => { setStatusFilter(''); setDateFilter(''); }}
                            className="text-sm text-red-400 hover:text-red-300 transition-colors"
                        >
                            Reset Filter
                        </button>
                    )}
                </div>

                {/* Buyurtmalar jadvali */}
                <div className="bg-[#242731] rounded-xl overflow-hidden border border-gray-800 shadow-xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-800 bg-[#292D37] text-gray-400 text-xs font-bold uppercase tracking-wider">
                                <th className="py-4 px-6">ID</th>
                                <th className="py-4 px-6">User Name</th>
                                <th className="py-4 px-6">Address</th>
                                <th className="py-4 px-6">Date</th>
                                <th className="py-4 px-6">Total Price</th>
                                <th className="py-4 px-6 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800 text-sm text-gray-300">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-gray-500">Hech qanday buyurtma topilmadi.</td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-[#2a2e3a] transition-colors">
                                        <td className="py-4 px-6 font-semibold">#{String(order.id).padStart(5, '0')}</td>
                                        <td className="p-4 px-6 font-semibold text-white/90">
                                            {order.user?.name || "Noma'lum Xaridor"}
                                        </td>
                                        <td className="py-4 px-6 max-w-xs truncate text-gray-400">
                                            {order.shipping_address}
                                        </td>
                                        <td className="py-4 px-6 text-gray-400">
                                            {new Date(order.createdAt).toLocaleDateString('en-GB', {
                                                day: '2-digit', month: 'short', year: 'numeric'
                                            })}
                                        </td>
                                        <td className="py-4 px-6 font-semibold text-gray-200">
                                            ${Number(order.total_price).toFixed(2)}
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <button
                                                onClick={() => handleStatusChange(order.id, order.status)}
                                                className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize tracking-wide transition-transform active:scale-95 cursor-pointer ${getStatusBadgeClass(order.status)}`}
                                                title="Statusni o'zgartirish uchun bosing"
                                            >
                                                {order.status === 'delivered' ? 'Completed' :
                                                    order.status === 'cancelled' ? 'Rejected' :
                                                        order.status === 'pending' ? 'On Hold' : order.status}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* Jadval osti ma'lumotlari */}
                    <div className="bg-[#292D37] px-6 py-4 flex justify-between items-center text-xs text-gray-400 border-t border-gray-800">
                        <span>Showing 1-{filteredOrders.length} of {orders.length}</span>
                    </div>
                </div>

            </div>
        </div>
    );
}