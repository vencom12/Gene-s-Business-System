import React, { useState, useEffect } from 'react';
import { Plus, ChefHat, Trash2, Edit2, Scale } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Recipe } from '../../types/recipe';
import { formatCurrency, calculateSellingPriceFromMargin } from '../../utils/currency';
import { calculatePhysicalMetrics } from '../../utils/recipeScaler';
import { RecipeEditor } from './RecipeEditor';
import { PortionRatioScalerModal } from './PortionRatioScalerModal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Pagination } from '../common/Pagination';

export const RecipeList: React.FC = () => {
  const { recipes, deleteRecipe, settings } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [scalingRecipe, setScalingRecipe] = useState<Recipe | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  const handleOpenAdd = () => {
    setEditingRecipe(null);
    setIsEditing(true);
  };

  const handleOpenEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setIsEditing(true);
  };

  const filteredRecipes = recipes.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRecipes.length / itemsPerPage) || 1;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedRecipes = filteredRecipes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isEditing) {
    return (
      <RecipeEditor
        recipeToEdit={editingRecipe}
        onBack={() => {
          setIsEditing(false);
          setEditingRecipe(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Recipes & Costing</h2>
          <p className="text-xs text-slate-500">
            Calculate raw batch costs, packaging, labor wage, and suggested retail prices.
          </p>
        </div>

        <Button
          variant="primary"
          icon={<Plus size={18} />}
          onClick={handleOpenAdd}
        >
          New Recipe Costing
        </Button>
      </div>

      <Input
        placeholder="Search recipes..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        prefixSymbol="🔍"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedRecipes.map((recipe) => {
          const ingCost = recipe.ingredients.reduce((sum, ri) => {
            return sum + (ri.cost || 0);
          }, 0);

          const pkgCost = recipe.packaging.reduce((sum, rp) => {
            return sum + (rp.cost || 0);
          }, 0);

          const laborCost = (recipe.laborHours || 0) * settings.defaultLaborRate;
          const overheadCost = recipe.overheadCostPerBatch || 0;
          const totalBatchCost = ingCost + pkgCost + laborCost + overheadCost;
          const costPerUnit = recipe.yieldQuantity > 0 ? totalBatchCost / recipe.yieldQuantity : 0;

          const suggestedTotalPrice = calculateSellingPriceFromMargin(
            totalBatchCost,
            recipe.targetProfitMargin
          );
          const suggestedPricePerUnit =
            recipe.yieldQuantity > 0 ? suggestedTotalPrice / recipe.yieldQuantity : 0;

          const metrics = calculatePhysicalMetrics(recipe);

          return (
            <Card key={recipe.id} className="flex flex-col justify-between space-y-4 hover:border-amber-300 transition-all">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="emerald">{recipe.targetProfitMargin}% Margin Target</Badge>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setScalingRecipe(recipe)}
                      className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                      title="Scale Portions (1, 2, 3, 4 persons...)"
                    >
                      <Scale size={16} />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(recipe)}
                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Recipe"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteRecipe(recipe.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Recipe"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-slate-800 text-lg mt-2">{recipe.name}</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Yield: {recipe.yieldQuantity} {recipe.yieldUnit} • {recipe.category}
                </p>
                {metrics.totalGrams > 0 && (
                  <p className="text-[11px] text-amber-800 font-semibold mt-0.5 flex items-center gap-1">
                    <Scale size={12} className="text-amber-600" />
                    <span>~{metrics.totalGrams}g batch ({metrics.gramsPerServing}g / portion)</span>
                  </p>
                )}
              </div>

              <div className="bg-amber-50/60 rounded-xl p-3 border border-amber-100 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Total Batch Cost:</span>
                  <span className="font-bold text-slate-800">
                    {formatCurrency(totalBatchCost, settings.currencySymbol)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Cost per Unit:</span>
                  <span className="font-semibold text-slate-700">
                    {formatCurrency(costPerUnit, settings.currencySymbol)} / {recipe.yieldUnit}
                  </span>
                </div>

                <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between font-bold text-amber-800">
                  <span>Suggested Retail Price:</span>
                  <span className="text-sm text-amber-900">
                    {formatCurrency(suggestedPricePerUnit, settings.currencySymbol)} / {recipe.yieldUnit}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Scale size={15} className="text-amber-600" />}
                  onClick={() => setScalingRecipe(recipe)}
                >
                  Scale Portions
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleOpenEdit(recipe)}
                >
                  Cost Details
                </Button>
              </div>
            </Card>
          );
        })}

        {filteredRecipes.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <ChefHat size={40} className="mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700">No recipes found</p>
            <p className="text-xs text-slate-500 mt-1">Create your first recipe to start costing!</p>
          </div>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredRecipes.length}
        itemsPerPage={itemsPerPage}
        onPageChange={(page) => setCurrentPage(page)}
        onItemsPerPageChange={(num) => setItemsPerPage(num)}
      />

      <PortionRatioScalerModal
        recipe={scalingRecipe}
        isOpen={!!scalingRecipe}
        onClose={() => setScalingRecipe(null)}
      />
    </div>
  );
};
