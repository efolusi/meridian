// Data Table is an authored recipe, not a Meridian export. Upstream deliberately
// starts from Table and application-owned state so each product can choose its
// own filtering, sorting, pagination, visibility, selection, and data source.
export const paymentsDataTableRecipe = {
  primitives: [
    'Table', 'TableHeader', 'TableBody', 'TableRow', 'TableHead', 'TableCell',
    'Checkbox', 'Input', 'Button', 'DropdownMenu',
  ],
  behaviors: ['sorting', 'filtering', 'pagination', 'visibility', 'selection', 'row-actions'],
  dependency: '@tanstack/react-table',
};
