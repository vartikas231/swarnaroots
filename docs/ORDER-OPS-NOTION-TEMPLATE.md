# Swarna Roots Order & Shipping Ops

Copy this page into Notion and convert the sections into databases/checklists as needed.

---

## Launch Status

- Shipping partner selected: `Shiprocket`
- Checkout flow live: `Yes / No`
- Tracking API live: `Yes / No`
- Admin shipping controls live: `Yes / No`
- Email updates live: `Yes / No`
- WhatsApp updates live: `Later`

---

## Master To-Do

| Task | Owner | Priority | Status | Notes |
| --- | --- | --- | --- | --- |
| Finalize Shiprocket account + credentials |  | High | Not started |  |
| Add production env vars |  | High | Not started |  |
| Run Prisma schema push |  | High | Not started |  |
| Test local order creation |  | High | Not started |  |
| Test admin shipping update flow |  | High | Not started |  |
| Test public tracking API |  | High | Not started |  |
| Configure shipment email copy |  | Medium | Not started |  |
| Add customer tracking page UI |  | Medium | Not started |  |
| Add Shiprocket webhook sync |  | High | Not started |  |
| Add WhatsApp opt-in flow |  | Low | Later |  |

---

## Shipping Partner Setup

### Shiprocket

- Account email:
- Account owner:
- Pickup location name:
- Pickup address:
- Support phone:
- API key:
- API secret:
- Sandbox status:
- Production status:

### Fallback Vendor

- Vendor name:
- Reason to keep as fallback:
- Account link:

---

## Environment Variables

| Variable | Local | Production | Notes |
| --- | --- | --- | --- |
| `DATABASE_URL` |  |  |  |
| `NEXTAUTH_URL` |  |  |  |
| `NEXTAUTH_SECRET` |  |  |  |
| `RESEND_API_KEY` or Gmail SMTP |  |  |  |
| `ORDER_EMAIL_FROM` |  |  |  |
| `SHIPROCKET_API_KEY` |  |  | Add later |
| `SHIPROCKET_API_SECRET` |  |  | Add later |

---

## Order Tracking Fields

Use this as the source of truth for what must be visible in admin and APIs.

| Field | Required | Example |
| --- | --- | --- |
| Order number | Yes | `SR-20260330-4821` |
| Shipping provider | Yes | `Shiprocket` |
| Service name | Yes | `Delhivery Surface` |
| Shipment status | Yes | `IN_TRANSIT` |
| Tracking number | Yes | `1334567890123` |
| Tracking URL | Yes | Third-party tracking link |
| Shipment updated at | Yes | ISO datetime |
| Shipment events | Yes | Timeline array |
| Email updates enabled | Yes | `true` |
| WhatsApp updates enabled | Yes | `false` |

---

## Shipment Status Rules

| Status | Customer Visible | Send Email | Notes |
| --- | --- | --- | --- |
| `NOT_BOOKED` | No | No | Order created only |
| `BOOKED` | Yes | Yes | Tracking assigned |
| `PICKED_UP` | Yes | Optional | Courier picked package |
| `IN_TRANSIT` | Yes | Yes | On the way |
| `OUT_FOR_DELIVERY` | Yes | Yes | Delivery expected soon |
| `DELIVERED` | Yes | Yes | Final success |
| `FAILED_ATTEMPT` | Yes | Yes | Delivery failed |
| `RTO_INITIATED` | Yes | Optional | Return started |
| `RTO_DELIVERED` | Yes | Optional | Returned back |
| `CANCELLED` | Yes | Optional | Shipment cancelled |

---

## Daily Operations

### Morning

- Check new paid/pending orders
- Book shipments
- Add tracking links
- Mark booked orders in admin

### Afternoon

- Review failed delivery attempts
- Check NDR/RTO cases
- Reply to customer support

### Evening

- Confirm delivered orders
- Verify email update logs
- Reconcile payment vs shipment count

---

## Testing Checklist

- Place COD order
- Place prepaid order
- Save shipping provider/service/tracking in admin
- Verify shipment status saves correctly
- Verify shipment event is created
- Verify shipment email is sent
- Verify tracking API works with `orderNumber + email`
- Verify customer cannot fetch another user's order without matching email

---

## Issues Log

| Date | Issue | Severity | Owner | Resolution |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |

---

## Decisions Log

| Date | Decision | Why |
| --- | --- | --- |
|  | Shiprocket as shipping partner | Cheapest acceptable starting option with later flexibility |

