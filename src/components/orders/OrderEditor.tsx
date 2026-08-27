import React, { useState } from 'react';
import { ArrowLeft, Save, Plus, Trash2, ShoppingBag } from 'lucide-react';
import type { CustomerOrder, OrderItem, OrderStatus } from '../../types/order';
import { useApp } from '../../context/AppContext';
import { calculateSellingPriceFromMargin, formatCurrency } from '../../utils/currency';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { Card } from '../common/Card';

interface OrderEditorProps {
  orderToEdit?: CustomerOrder | null;
  onBack: () => void;
}

export const OrderEditor: React.FC<OrderEditorProps> = ({ orderToEdit, onBack }) => {
  const { recipes, addOrder, updateOrder, settings } = useApp();

  const [customerName, setCustomerName] = useState(orderToEdit?.customerName || '');
  const [customerPhone, setCustomerPhone] = useState(orderToEdit?.customerPhone || '');
  const [deliveryDate, setDeliveryDate] = useState(
    orderToEdit?.deliveryDate || new Date().toISOString().split('T')[0]
  );
  const [status, setStatus] = useState<OrderStatus>(orderToEdit?.status || 'Confirmed');
  const [depositPaid, setDepositPaid] = useState<string>(orderToEdit?.depositPaid.toString() || '0');
  const [notes, setNotes] = useState(orderToEdit?.notes || '');

  const [orderItems, setOrderItems] = useState<OrderItem[]>(orderToEdit?.items || []);

  const handleAddItem = () => {
    if (recipes.length === 0) return;
    const first = recipes[0];
    const firstYield = first.yieldQuantity > 0 ? first.yieldQuantity : 1;

    const totalCost = first.ingredients.reduce((sum, ri) => sum + (ri.cost || 0), 0) +
      first.packaging.reduce((sum, rp) => sum + (rp.cost || 0), 0) +
      (first.laborHours || 0) * settings.defaultLaborRate +
      (first.overheadCostPerBatch || 0);

    const pricePerUnit = calculateSellingPriceFromMargin(totalCost, first.targetProfitMargin) / firstYield;

    setOrderItems((prev) => [
      ...prev,
      {
        recipeId: first.id,
        quantity: firstYield,
        pricePerUnit,
        totalCost,
        totalRevenue: pricePerUnit * firstYield,
      },
    ]);
  };

  const totalRevenue = orderItems.reduce((sum, item) => sum + item.totalRevenue, 0);
  const totalCost = orderItems.reduce((sum, item) => sum + item.totalCost, 0);
  const totalProfit = totalRevenue - totalCost;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || orderItems.length === 0) return;

    if (orderToEdit) {
      updateOrder({
        ...orderToEdit,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || undefined,
        deliveryDate,
        status,
        items: orderItems,
        totalCost,
        totalRevenue,
        totalProfit,
        depositPaid: parseFloat(depositPaid) || 0,
        notes: notes.trim() || undefined,
        updatedAt: new Date().toISOString(),
      });
    } else {
      addOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || undefined,
        deliveryDate,
        status,
        items: orderItems,
        totalCost,
        totalRevenue,
        totalProfit,
        depositPaid: parseFloat(depositPaid) || 0,
        notes: notes.trim() || undefined,
      });
    }

    onBack();
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 pb-20 md:pb-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" type="button" icon={<ArrowLeft size={18} />} onClick={onBack}>
          Back to Orders
        </Button>
        <Button variant="primary" type="submit" icon={<Save size={18} />}>
          {orderToEdit ? 'Update Order' : 'Save Customer Order'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="space-y-4">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <ShoppingBag size={20} className="text-amber-600" />
              <span>Customer Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Customer Name"
                placeholder="e.g. Sarah Jenkins"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />

              <Input
                label="Phone Number (Optional)"
                placeholder="e.g. +1 (555) 234-5678"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Delivery / Pickup Date"
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                required
              />

              <Select
                label="Order Status"
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                options={[
                  { value: 'Draft', label: 'Draft' },
                  { value: 'Confirmed', label: 'Confirmed' },
                  { value: 'Baking', label: 'In Baking / Prep' },
                  { value: 'Completed', label: 'Completed' },
                  { value: 'Cancelled', label: 'Cancelled' },
                ]}
              />

              <Input
                label="Deposit Paid"
                type="number"
                step="0.01"
                min="0"
                prefixSymbol={settings.currencySymbol}
                value={depositPaid}
                onChange={(e) => setDepositPaid(e.target.value)}
              />
            </div>

            <Input
              label="Order Notes (Optional)"
              placeholder="e.g. Custom cake message, theme colors"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base">Ordered Bakery Items</h3>
              <Button
                variant="outline"
                size="sm"
                type="button"
                icon={<Plus size={16} />}
                onClick={handleAddItem}
              >
                Add Item to Order
              </Button>
            </div>

            <div className="space-y-3">
              {orderItems.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-3 rounded-xl border border-slate-200"
                >
                  <div className="col-span-6 sm:col-span-5">
                    <select
                      className="w-full text-xs sm:text-sm font-semibold rounded-lg border-slate-300 py-1.5 px-2 bg-white"
                      value={item.recipeId}
                      onChange={(e) => {
                        const rId = e.target.value;
                        const r = recipes.find((x) => x.id === rId);
                        if (!r) return;
                        const rYield = r.yieldQuantity > 0 ? r.yieldQuantity : 1;
                        const rBatchCost =
                          r.ingredients.reduce((s, ri) => s + (ri.cost || 0), 0) +
                          r.packaging.reduce((s, rp) => s + (rp.cost || 0), 0) +
                          (r.laborHours || 0) * settings.defaultLaborRate +
                          (r.overheadCostPerBatch || 0);

                        const priceUnit =
                          calculateSellingPriceFromMargin(rBatchCost, r.targetProfitMargin) / rYield;

                        setOrderItems((prev) =>
                          prev.map((row, i) =>
                            i === index
                              ? {
                                  ...row,
                                  recipeId: rId,
                                  pricePerUnit: priceUnit,
                                  totalCost: (rBatchCost / rYield) * row.quantity,
                                  totalRevenue: priceUnit * row.quantity,
                                }
                              : row
                          )
                        );
                      }}
                    >
                      {recipes.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-3 sm:col-span-3">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      placeholder="Qty"
                      className="w-full text-xs sm:text-sm rounded-lg border-slate-300 py-1.5 px-2 bg-white font-medium"
                      value={item.quantity}
                      onChange={(e) => {
                        const qty = parseInt(e.target.value) || 1;
                        setOrderItems((prev) =>
                          prev.map((row, i) => {
                            if (i !== index) return row;
                            const r = recipes.find((x) => x.id === row.recipeId);
                            const rYield = r && r.yieldQuantity > 0 ? r.yieldQuantity : 1;
                            const rBatchCost = r
                              ? r.ingredients.reduce((s, ri) => s + (ri.cost || 0), 0) +
                                r.packaging.reduce((s, rp) => s + (rp.cost || 0), 0) +
                                (r.laborHours || 0) * settings.defaultLaborRate +
                                (r.overheadCostPerBatch || 0)
                              : 0;

                            const unitCost = rBatchCost / rYield;
                            return {
                              ...row,
                              quantity: qty,
                              totalCost: unitCost * qty,
                              totalRevenue: row.pricePerUnit * qty,
                            };
                          })
                        );
                      }}
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-3 text-right">
                    <span className="font-bold text-amber-800 text-xs sm:text-sm">
                      {formatCurrency(item.totalRevenue, settings.currencySymbol)}
                    </span>
                  </div>

                  <div className="col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setOrderItems((prev) => prev.filter((_, i) => i !== index))}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {orderItems.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">
                  No items added. Click 'Add Item to Order' to pick recipes.
                </p>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-2xl p-5 text-white space-y-4 shadow-xl">
            <h4 className="font-bold text-sm text-amber-200">Order Revenue & Profit</h4>

            <div className="space-y-2 pt-2 border-t border-amber-500/50">
              <div className="flex justify-between text-xs text-amber-100">
                <span>Total Customer Price:</span>
                <span className="font-extrabold text-lg text-white">
                  {formatCurrency(totalRevenue, settings.currencySymbol)}
                </span>
              </div>

              <div className="flex justify-between text-xs text-amber-100">
                <span>Total Production Cost:</span>
                <span className="font-semibold text-amber-200">
                  {formatCurrency(totalCost, settings.currencySymbol)}
                </span>
              </div>

              <div className="flex justify-between text-xs font-bold pt-2 border-t border-amber-500/50">
                <span className="text-emerald-300">Net Order Profit:</span>
                <span className="text-emerald-300 text-lg">
                  {formatCurrency(totalProfit, settings.currencySymbol)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
