# Shop Theme API (SDUI)

Base path: `/api/v1/shops`

All endpoints require `bearerAuth` (JWT in Authorization header). Write operations require `VENDOR` role + shop ownership.

---

## GET `/{shopId}/theme`

Retrieve the theme configuration for a shop.

**Response 200:**
```json
{
  "code": 200,
  "message": "Get theme successfully",
  "result": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "shopId": "550e8400-e29b-41d4-a716-446655440000",
    "primaryColor": "#1677FF",
    "secondaryColor": "#FFFFFF",
    "fontFamily": "Inter",
    "layoutConfig": {
      "header": { "backgroundColor": "#F5F5F5", "height": 80 },
      "footer": { "show": true, "backgroundColor": "#333333" },
      "sections": [
        { "id": "hero", "type": "banner", "height": 400 },
        { "id": "products", "type": "grid", "columns": 4 }
      ]
    },
    "isPublished": true,
    "createdAt": "2026-05-17T10:30:00",
    "updatedAt": "2026-05-17T10:30:00"
  }
}
```

**404** — theme not found for this shop.

---

## POST `/{shopId}/theme`

Create a theme. Only one theme per shop (calling this twice returns 400).

**Request body:**
```json
{
  "primaryColor": "#1677FF",
  "secondaryColor": "#FFFFFF",
  "fontFamily": "Inter",
  "layoutConfig": {},
  "isPublished": true
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `primaryColor` | string | yes | Hex color `#RRGGBB` |
| `secondaryColor` | string | yes | Hex color `#RRGGBB` |
| `fontFamily` | string | yes | CSS font-family name |
| `layoutConfig` | object | no | Arbitrary JSON object for layout |
| `isPublished` | boolean | no | Defaults to `true` if omitted |

**Response 201:** same shape as GET response, `"message": "Create theme successfully"`.

**Errors:**
- `400` — invalid data or theme already exists (`SHOP_ALREADY_HAS_THEME`)
- `403` — not the shop owner

---

## PUT `/{shopId}/theme`

Partial update. Only include fields you want to change — omitted/null fields keep their current values.

**Request body** (same shape as POST):
```json
{
  "primaryColor": "#FF0000"
}
```

**Response 200:** same shape as GET, `"message": "Update theme successfully"`.

**Errors:** `400` (invalid data), `403` (not owner), `404` (theme not found).

---

## DELETE `/{shopId}/theme`

Remove the theme. The shop reverts to default styling on the frontend side.

**Response 200:**
```json
{
  "code": 200,
  "message": "Delete theme successfully",
  "result": "Theme deleted"
}
```

**Errors:** `403` (not owner), `404` (theme not found).
