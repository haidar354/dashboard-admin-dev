# Purchase Module TypeScript Types

This directory contains comprehensive TypeScript type definitions for the purchase management module, generated from the API structure found in the Postman collection.

## Overview

The purchase module consists of three main entities:
- **Purchase Orders**: Orders placed to suppliers for items
- **Purchase Receives**: Recording of received items from purchase orders
- **Purchase Invoices**: Billing and payment tracking (basic structure provided)

## File Structure

```
src/types/models/purchase/
├── index.ts              # Main export file
├── purchase-order.ts     # Purchase order types
├── purchase-receive.ts   # Purchase receive types
└── purchase-invoice.ts   # Purchase invoice types (basic structure)
```

## Purchase Order Types

### Core Interfaces
- `PurchaseOrder`: Basic purchase order information for lists
- `PurchaseOrderDetail`: Detailed purchase order with items
- `PurchaseOrderItem`: Individual items in a purchase order
- `PurchaseOrderItemDetail`: Detailed item information with relations

### Form Types
- `PurchaseOrderForm`: Creating new purchase orders
- `PurchaseOrderItemForm`: Adding items to purchase orders
- `PurchaseOrderUpdateForm`: Updating existing purchase orders
- `PurchaseOrderBulkInsertForm`: Creating multiple purchase orders

### Query Types
- `PurchaseOrderQueryParams`: Query parameters for filtering purchase orders
- `PurchaseOrderItemQueryParams`: Query parameters for purchase order items

### Status Values
- `draft`: Order is being prepared
- `received`: Order has been received

## Purchase Receive Types

### Core Interfaces
- `PurchaseReceive`: Basic purchase receive information
- `PurchaseReceiveDetail`: Detailed receive with items
- `PurchaseReceiveItem`: Individual received items
- `PurchaseReceiveOrderItem`: Related purchase order item information

### Form Types
- `PurchaseReceiveForm`: Creating new purchase receives
- `PurchaseReceiveItemForm`: Adding items to receives
- `PurchaseReceiveUpdateForm`: Updating existing receives

### Response Types
- `PurchaseReceiveCreateResponse`: API response structure for creation

## Purchase Invoice Types

### Core Interfaces
- `PurchaseInvoice`: Basic invoice information
- `PurchaseInvoiceDetail`: Detailed invoice with items
- `PurchaseInvoiceItem`: Individual invoice items

### Form Types
- `PurchaseInvoiceForm`: Creating new invoices
- `PurchaseInvoiceItemForm`: Adding items to invoices
- `PurchaseInvoiceUpdateForm`: Updating existing invoices

### Status Values
- `pending`: Invoice awaiting payment
- `paid`: Invoice has been paid
- `overdue`: Invoice is past due date

## API Endpoints Covered

Based on the Postman collection analysis:

### Purchase Orders
- `GET /api/purchase/purchase-orders` - List purchase orders
- `GET /api/purchase/purchase-orders/{id}` - Get purchase order details
- `POST /api/purchase/purchase-orders` - Create purchase order
- `PUT /api/purchase/purchase-orders/{id}` - Update purchase order
- `DELETE /api/purchase/purchase-orders/{id}` - Delete purchase order
- `POST /api/purchase/purchase-orders/bulk-insert` - Bulk create orders

### Purchase Order Items
- `GET /api/purchase/purchase-order-items` - List purchase order items

### Purchase Receives
- `GET /api/purchase/purchase-receives` - List purchase receives
- `GET /api/purchase/purchase-receives/{id}` - Get purchase receive details
- `POST /api/purchase/purchase-orders/{id}/purchase-receives` - Create receive

## Usage Examples

### Importing Types
```typescript
import type {
  PurchaseOrder,
  PurchaseOrderForm,
  PurchaseReceive,
  PurchaseReceiveForm
} from '@/types/models/purchase'
```

### Creating a Purchase Order
```typescript
const orderForm: PurchaseOrderForm = {
  outletId: 'outlet-uuid',
  supplierId: 'supplier-uuid',
  expectedAt: '2025-08-01',
  note: 'Urgent order',
  items: [
    {
      itemId: 'item-uuid',
      quantity: 100,
      unitId: 'unit-uuid'
    }
  ]
}
```

### Creating a Purchase Receive
```typescript
const receiveForm: PurchaseReceiveForm = {
  purchaseOrderId: 'order-uuid',
  receivedAt: '2025-07-31',
  note: 'All items received in good condition',
  items: [
    {
      orderItemId: 'order-item-uuid',
      itemId: 'item-uuid',
      price: 17000,
      quantity: 10,
      note: 'Quality checked'
    }
  ]
}
```

## Field Naming Conventions

- All IDs follow the pattern: `{entity}Id` (e.g., `purchaseOrderId`, `itemId`)
- Timestamps are in ISO string format
- Optional fields are marked with `?` or `| null`
- Arrays use descriptive names (e.g., `purchase_order_items`)
- Form types omit system-generated fields (IDs, timestamps)

## Related Types

These purchase types depend on:
- `Item` from `../item`
- `Unit` from `../unit`
- Standard API response types from `@/types/api/response`

## Notes

- Purchase invoice types are basic structures since no API endpoints were found in the Postman collection
- All types follow the established project patterns from other modules
- Error types are provided for form validation
- Query parameter types support filtering and pagination
- Response types match the actual API structure from Postman examples