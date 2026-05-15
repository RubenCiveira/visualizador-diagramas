# Commerce Flows

Post-purchase flows: return requests and refund processing.

## Return Request

A customer initiates a return. The warehouse evaluates the item condition and the payment service issues a refund once the return is approved.

```mermaid
sequenceDiagram
    %% @desc User: Customer requesting a return
    %% @desc OrderService: Manages order lifecycle and return requests
    %% @desc WarehouseService: Manages inventory, picking, packing and returns
    %% @desc PaymentService: Processes payments and refunds
    %% @desc NotificationService: Sends emails and push notifications
    actor User
    participant OrderService as Order Service
    participant WarehouseService as Warehouse Service
    participant PaymentService as Payment Service
    participant NotificationService as Notification Service

    User->>OrderService: POST /orders/:id/returns (reason, items)
    OrderService->>OrderService: Validate return window (≤30 days)
    OrderService-->>User: 201 Created (return label attached)
    User->>WarehouseService: Ship items back (carrier drop-off)
    WarehouseService->>WarehouseService: Inspect returned items
    WarehouseService->>OrderService: returnReceived(orderId, condition: ok)
    OrderService->>PaymentService: issueRefund(chargeId, amount)
    PaymentService-->>OrderService: { refundId, status: "pending" }
    OrderService->>NotificationService: refundInitiated(userId, amount)
    NotificationService-->>User: Email: "Your refund is on its way"
    PaymentService->>OrderService: webhookRefundSettled(refundId)
    OrderService->>NotificationService: refundSettled(userId)
    NotificationService-->>User: Email: "Refund of €49.99 processed"
```

## Inventory Check

Called during product browsing to show real-time stock availability across warehouses before the user adds an item to the cart.

```mermaid
sequenceDiagram
    %% @desc User: Customer browsing products
    %% @desc CatalogService: Serves product listings and detail pages
    %% @desc WarehouseService: Manages inventory across warehouses
    %% @desc CacheService: Redis cache for frequently accessed inventory data
    actor User
    participant CatalogService as Catalog Service
    participant WarehouseService as Warehouse Service
    participant CacheService as Cache Service

    User->>CatalogService: GET /products/:id
    CatalogService->>CacheService: GET inventory:{productId}
    CacheService-->>CatalogService: Cache miss
    CatalogService->>WarehouseService: getStock(productId)
    WarehouseService-->>CatalogService: { available: 14, reserved: 2 }
    CatalogService->>CacheService: SET inventory:{productId} TTL 60s
    CacheService-->>CatalogService: OK
    CatalogService-->>User: Product details + stock: 12 available

    User->>CatalogService: GET /products/:id
    CatalogService->>CacheService: GET inventory:{productId}
    CacheService-->>CatalogService: { available: 14, reserved: 2 }
    CatalogService-->>User: Product details + stock: 12 available (cached)
```

## Abandoned Cart Recovery

Triggered when a user leaves items in the cart without completing checkout. A scheduled job detects inactivity and the notification service sends a recovery email with a discount code.

```mermaid
sequenceDiagram
    %% @desc SchedulerService: Cron-based job runner for background tasks
    %% @desc CartService: Manages shopping cart contents and pricing
    %% @desc NotificationService: Sends emails and push notifications
    %% @desc UserDB: Stores user credentials and profiles
    participant SchedulerService as Scheduler Service
    participant CartService as Cart Service
    participant NotificationService as Notification Service
    participant UserDB as User Database

    SchedulerService->>CartService: findAbandonedCarts(inactiveFor: 1h)
    CartService-->>SchedulerService: [ { cartId, userId, total } ]
    SchedulerService->>UserDB: SELECT email WHERE id IN (userIds)
    UserDB-->>SchedulerService: [ { userId, email } ]
    SchedulerService->>NotificationService: sendAbandonedCartEmail(userId, cartId, discountCode)
    NotificationService-->>SchedulerService: Queued
    SchedulerService->>CartService: markRecoveryEmailSent(cartId)
    CartService-->>SchedulerService: OK
```
