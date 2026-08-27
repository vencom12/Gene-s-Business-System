import React, { useState, useEffect } from 'react';
import type { InventoryItem, UnitType, CategoryType } from '../../types/ingredient';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { calculateBaseUnitCost } from '../../utils/unitConversions';
import { formatUnitCost } from '../../utils/currency';

interface InventoryItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem?: InventoryItem | null;
}

export const InventoryItemModal: React.FC<InventoryItemModalProps> = ({
  isOpen,
  onClose,
  editingItem,
}) => {
  const { addInventoryItem, updateInventoryItem, settings } = useApp();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<CategoryType>('ingredient');
  const [purchasePrice, setPurchasePrice] = useState<string>('');
  const [purchaseQuantity, setPurchaseQuantity] = useState<string>('');
  const [purchaseUnit, setPurchaseUnit] = useState<UnitType>('kg');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name);
      setCategory(editingItem.category);
      setPurchasePrice(editingItem.purchasePrice.toString());
      setPurchaseQuantity(editingItem.purchaseQuantity.toString());
      setPurchaseUnit(editingItem.purchaseUnit);
      setNotes(editingItem.notes || '');
    } else {
      setName('');
      setCategory('ingredient');
      setPurchasePrice('');
      setPurchaseQuantity('');
      setPurchaseUnit('kg');
      setNotes('');
    }
  }, [editingItem, isOpen]);

  const priceNum = parseFloat(purchasePrice) || 0;
  const qtyNum = parseFloat(purchaseQuantity) || 0;
  const { unitCost, baseUnit } = calculateBaseUnitCost(priceNum, qtyNum, purchaseUnit);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || priceNum <= 0 || qtyNum <= 0) return;

    if (editingItem) {
      updateInventoryItem({
        ...editingItem,
        name: name.trim(),
        category,
        purchasePrice: priceNum,
        purchaseQuantity: qtyNum,
        purchaseUnit,
        unitCost,
        baseUnit,
        notes: notes.trim() || undefined,
        updatedAt: new Date().toISOString(),
      });
    } else {
      addInventoryItem({
        name: name.trim(),
        category,
        purchasePrice: priceNum,
        purchaseQuantity: qtyNum,
        purchaseUnit,
        unitCost,
        baseUnit,
        notes: notes.trim() || undefined,
      });
    }

    onClose();
  };

  const unitOptions = category === 'ingredient'
    ? [
        { value: 'kg', label: 'Kilograms (kg)' },
        { value: 'g', label: 'Grams (g)' },
        { value: 'oz', label: 'Ounces (oz)' },
        { value: 'lb', label: 'Pounds (lb)' },
        { value: 'l', label: 'Liters (L)' },
        { value: 'ml', label: 'Milliliters (ml)' },
        { value: 'pcs', label: 'Pieces / Carton (pcs)' },
      ]
    : [
        { value: 'pcs', label: 'Pieces (pcs)' },
        { value: 'box', label: 'Box / Pack' },
        { value: 'sheet', label: 'Sheets' },
        { value: 'pack', label: 'Pack' },
      ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingItem ? 'Edit Pantry Item' : 'Add New Pantry Item'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Item Name"
          placeholder="e.g. Dutch Cocoa Powder, 10-inch Cake Box"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value as CategoryType)}
            options={[
              { value: 'ingredient', label: 'Raw Ingredient' },
              { value: 'packaging', label: 'Packaging & Box' },
              { value: 'overhead', label: 'Overhead / Supplies' },
            ]}
          />

          <Select
            label="Purchase Unit"
            value={purchaseUnit}
            onChange={(e) => setPurchaseUnit(e.target.value as UnitType)}
            options={unitOptions}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Purchase Price"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            prefixSymbol={settings.currencySymbol}
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            required
          />

          <Input
            label="Purchase Package Size"
            type="number"
            step="any"
            min="0.0001"
            placeholder="e.g. 5"
            suffixSymbol={purchaseUnit}
            value={purchaseQuantity}
            onChange={(e) => setPurchaseQuantity(e.target.value)}
            required
          />
        </div>

        {qtyNum > 0 && priceNum > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-center justify-between">
            <span className="font-semibold">Calculated Unit Cost:</span>
            <span className="font-bold text-sm text-amber-800">
              {formatUnitCost(unitCost, settings.currencySymbol)} / {baseUnit}
            </span>
          </div>
        )}

        <Input
          label="Notes (Optional)"
          placeholder="e.g. Brand, store bought from, location in kitchen"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            {editingItem ? 'Save Changes' : 'Add to Inventory'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
