import React, { useState, useEffect } from 'react';
import { Plus, ShoppingBag, Trash2, Edit2, ShoppingCart, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { CustomerOrder } from '../../types/order';
import { formatCurrency } from '../../utils/currency';
import { OrderEditor } from './OrderEditor';
import { AggregatedGroceryList } from './AggregatedGroceryList';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Pagination } from '../common/Pagination';

export const OrderList: React.FC = () => {
  const { orders, deleteOrder, settings } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [editingOrder, setEditingOrder] = useState<CustomerOrder | null>(null);
  const [showGroceryList, setShowGroceryList] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  const totalPages = Math.ceil(orders.length / itemsPerPage) || 1;

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedOrders = orders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenAdd = () => {
    setEditingOrder(null);
    setIsEditing(true);
  };

  const handleOpenEdit = (order: CustomerOrder) => {
    setEditingOrder(order);
    setIsEditing(true);
  };

  if (isEditing) {
    return (
      <OrderEditor
        orderToEdit={editingOrder}
        onBack={() => {
          setIsEditing(false);
          setEditingOrder(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Customer Orders</h2>
          <p className="text-xs text-slate-500">
            Track customer bookings, revenue, and generate consolidated grocery lists.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {orders.length > 0 && (
            <Button
              variant="outline"
              icon={<ShoppingCart size={18} />}
              onClick={() => setShowGroceryList(!showGroceryList)}
            >
              {showGroceryList ? 'Hide Grocery List' : 'Generate Shopping List'}
            </Button>
          )}

          <Button variant="primary" icon={<Plus size={18} />} onClick={handleOpenAdd}>
            New Customer Order
          </Button>
        </div>
      </div>

      {showGroceryList && <AggregatedGroceryList ordersToAggregate={orders} />}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedOrders.map((order) => (
          <Card key={order.id} className="flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-start justify-between gap-2">
                <Badge
                  variant={
                    order.status === 'Confirmed'
                      ? 'emerald'
                      : order.status === 'Baking'
                      ? 'amber'
                      : order.status === 'Completed'
                      ? 'indigo'
                      : 'slate'
                  }
                >
                  {order.status}
                </Badge>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(order)}
                    className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    title="Edit Order"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => deleteOrder(order.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Order"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-slate-800 text-lg mt-2">{order.customerName}</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <Calendar size={14} className="text-amber-600" />
                <span>Delivery: {order.deliveryDate}</span>
              </p>
            </div>

            <div className="bg-amber-50/60 rounded-xl p-3 border border-amber-100 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Total Price:</span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(order.totalRevenue, settings.currencySymbol)}
                </span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Net Profit:</span>
                <span>{formatCurrency(order.totalProfit, settings.currencySymbol)}</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={() => handleOpenEdit(order)}
            >
              View Order Details
            </Button>
          </Card>
        ))}

        {orders.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <ShoppingBag size={40} className="mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700">No customer orders yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Add customer bookings to calculate total profit & generate shopping lists!
            </p>
          </div>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={orders.length}
        itemsPerPage={itemsPerPage}
        onPageChange={(page) => setCurrentPage(page)}
        onItemsPerPageChange={(num) => setItemsPerPage(num)}
      />
    </div>
  );
};
