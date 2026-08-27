import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Package } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { InventoryItem } from '../../types/ingredient';
import { formatCurrency, formatUnitCost } from '../../utils/currency';
import { InventoryItemModal } from './InventoryItemModal';
import { QuickUnitConverter } from './QuickUnitConverter';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Pagination } from '../common/Pagination';

export const InventoryList: React.FC = () => {
  const { inventory, deleteInventoryItem, settings } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const filteredItems = inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 pb-20 md:pb-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Pantry & Materials</h2>
          <p className="text-xs text-slate-500">
            Manage raw baking ingredients, cake boxes, ribbons, and unit costs.
          </p>
        </div>

        <Button
          variant="primary"
          icon={<Plus size={18} />}
          onClick={handleOpenAdd}
        >
          Add Item
        </Button>
      </div>

      <QuickUnitConverter />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search ingredients, boxes, ribbons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            prefixSymbol="🔍"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['all', 'ingredient', 'packaging', 'overhead'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap capitalize transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat === 'all' ? 'All Items' : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedItems.map((item) => (
          <Card key={item.id} className="flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-start justify-between gap-2">
                <Badge
                  variant={
                    item.category === 'ingredient'
                      ? 'amber'
                      : item.category === 'packaging'
                      ? 'indigo'
                      : 'slate'
                  }
                >
                  {item.category}
                </Badge>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    title="Edit Item"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => deleteInventoryItem(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Item"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-slate-800 text-base mt-2">{item.name}</h3>

              {item.notes && (
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{item.notes}</p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Bought As:</span>
                <span className="font-semibold text-slate-700">
                  {item.purchaseQuantity} {item.purchaseUnit} @ {formatCurrency(item.purchasePrice, settings.currencySymbol)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs bg-amber-50/60 p-2 rounded-lg border border-amber-100">
                <span className="text-amber-900 font-medium">Unit Cost:</span>
                <span className="font-bold text-amber-700">
                  {formatUnitCost(item.unitCost, settings.currencySymbol)} / {item.baseUnit}
                </span>
              </div>
            </div>
          </Card>
        ))}

        {filteredItems.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <Package size={40} className="mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700">No items found</p>
            <p className="text-xs text-slate-500 mt-1">Try adding a new ingredient or changing your filter.</p>
          </div>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredItems.length}
        itemsPerPage={itemsPerPage}
        onPageChange={(page) => setCurrentPage(page)}
        onItemsPerPageChange={(num) => setItemsPerPage(num)}
      />

      <InventoryItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingItem={editingItem}
      />
    </div>
  );
};
