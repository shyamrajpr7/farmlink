# 🌱 FarmLink — P2P Agritech Platform

A modular peer-to-peer marketplace connecting farmers directly to consumers, with a built-in **Logistics Switch** for scaling from manual delivery to enterprise courier integration.

---

## Quick Start

```bash
cd server
cp .env.example .env        # Fill in your MongoDB URI and secrets
npm install
npm run dev                 # Starts with nodemon on port 5000
```

---

## Project Structure

```
farmlink/
├── server/
│   ├── index.js                  # Express entry point
│   ├── .env.example
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── models/
│   │   ├── User.js               # farmer | consumer | admin
│   │   ├── Product.js            # crop listings with geolocation
│   │   └── Order.js              # full order lifecycle + escrow
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── orderController.js    # includes logistics switch logic
│   │   └── adminController.js
│   ├── middleware/
│   │   └── auth.js               # JWT protect, role guard, verified check
│   └── routes/
│       ├── auth.js
│       ├── products.js
│       ├── orders.js
│       └── admin.js
├── admin/                        # (next: admin dashboard UI)
├── farmer-app/                   # (next: farmer mobile/web app)
└── consumer-app/                 # (next: consumer marketplace UI)
```

---

## API Reference

### Auth
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/auth/register` | Public | Register farmer or consumer |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | Auth | Get current user |

### Products (Marketplace)
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/products` | Public | Browse listings (supports `?lat&lng&radius&category`) |
| GET | `/api/products/:id` | Public | Single product |
| GET | `/api/products/my` | Farmer | My listings |
| POST | `/api/products` | Farmer (verified) | Create listing |
| PUT | `/api/products/:id` | Farmer | Update listing |
| DELETE | `/api/products/:id` | Farmer | Remove listing |

### Orders
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/orders` | Consumer | Place order (payment held in escrow) |
| GET | `/api/orders/my` | Consumer | My orders |
| GET | `/api/orders/farm` | Farmer | Incoming orders |
| PATCH | `/api/orders/:id/accept` | Farmer | Accept order |
| PATCH | `/api/orders/:id/ready` | Farmer | Mark ready |
| PATCH | `/api/orders/:id/deliver` | Farmer | Mark delivered |
| PATCH | `/api/orders/:id/complete` | Farmer | Submit consumer PIN → escrow released |
| PATCH | `/api/orders/:id/cancel` | Both | Cancel + refund |

### Admin Dashboard
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/admin/dashboard` | Platform stats + recent orders |
| GET | `/api/admin/farmers` | All farmers (`?verified=false` for pending) |
| PATCH | `/api/admin/farmers/:id/verify` | Approve a farmer |
| PATCH | `/api/admin/users/:id/toggle` | Activate / deactivate user |
| GET | `/api/admin/orders` | All orders with filters |
| PATCH | `/api/admin/orders/:id/dispute` | Flag disputed order |
| GET | `/api/admin/logistics/status` | Current logistics switch state |

---

## Order Lifecycle

```
pending → accepted → ready → in_transit → delivered → completed
                                                    ↘ (wrong PIN)
         ↘ cancelled (any stage before completed)
```

### Phase 1 — Manual Delivery (Active by default)

**Self-Pickup flow:**
1. Consumer places order → receives `pickupCode`
2. Consumer visits farm, shows `pickupCode`
3. Farmer marks delivered
4. Consumer shares `confirmationPin` with farmer
5. Farmer submits PIN → escrow released ✅

**Farmer-Arranged Delivery flow:**
1. Farmer accepts, arranges local delivery
2. Farmer marks delivered
3. Consumer shares `confirmationPin`
4. Farmer submits PIN → escrow released ✅

---

## Logistics Switch (Phase 2)

When you're ready to integrate enterprise couriers:

1. Set `LOGISTICS_ENTERPRISE_ENABLED=true` in `.env`
2. Add your `EKART_API_KEY` / `AMAZON_LOGISTICS_API_KEY`
3. Replace the `requestEnterpriseCourier()` stub in `orderController.js` with the real SDK call

The `enterprise_courier` delivery mode will then be accepted at checkout, and shipping labels + tracking IDs will be auto-generated at the farm gate.

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | Token expiry (default `7d`) |
| `LOGISTICS_ENTERPRISE_ENABLED` | `false` = Phase 1, `true` = Phase 2 |
| `EKART_API_KEY` | (Phase 2) Ekart courier API key |
| `AMAZON_LOGISTICS_API_KEY` | (Phase 2) Amazon Logistics key |

---

## Next Steps

- [ ] Admin dashboard UI (React)
- [ ] Farmer app UI (React / React Native)
- [ ] Consumer marketplace UI
- [ ] SMS notifications (Twilio) for order status changes
- [ ] Image upload (Cloudinary) for product listings
- [ ] Real payment gateway (Razorpay / Stripe)
- [ ] Plug in Ekart/Amazon SDK for Phase 2
