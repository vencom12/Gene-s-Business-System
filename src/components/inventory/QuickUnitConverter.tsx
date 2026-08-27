import React, { useState } from 'react';
import { Calculator } from 'lucide-react';
import type { UnitType } from '../../types/ingredient';
import { convertUnit } from '../../utils/unitConversions';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { Select } from '../common/Select';

export const QuickUnitConverter: React.FC = () => {
  const [amount, setAmount] = useState<string>('1');
  const [fromUnit, setFromUnit] = useState<UnitType>('cup');
  const [toUnit, setToUnit] = useState<UnitType>('g');

  const valNum = parseFloat(amount) || 0;
  const result = convertUnit(valNum, fromUnit, toUnit);

  const units = [
    { value: 'cup', label: 'Cups' },
    { value: 'tbsp', label: 'Tablespoons (tbsp)' },
    { value: 'tsp', label: 'Teaspoons (tsp)' },
    { value: 'g', label: 'Grams (g)' },
    { value: 'kg', label: 'Kilograms (kg)' },
    { value: 'oz', label: 'Ounces (oz)' },
    { value: 'lb', label: 'Pounds (lb)' },
    { value: 'ml', label: 'Milliliters (ml)' },
    { value: 'l', label: 'Liters (L)' },
  ];

  return (
    <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-200/80 space-y-3">
      <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
        <Calculator size={18} className="text-amber-600" />
        <span>Quick Baking Unit Converter</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
        <Input
          label="Amount"
          type="number"
          step="any"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <Select
          label="From"
          value={fromUnit}
          onChange={(e) => setFromUnit(e.target.value as UnitType)}
          options={units}
        />
        <Select
          label="To"
          value={toUnit}
          onChange={(e) => setToUnit(e.target.value as UnitType)}
          options={units}
        />
      </div>

      <div className="bg-white rounded-xl p-3 border border-amber-200 flex items-center justify-between">
        <span className="text-xs text-slate-500 font-medium">Conversion Result:</span>
        <span className="font-extrabold text-amber-700 text-base">
          {valNum} {fromUnit} = {result.toFixed(2)} {toUnit}
        </span>
      </div>
    </Card>
  );
};
