# Hardware & IoT integrations

AquaERP connects field hardware (cold-chain probes, door sensors, vessel GPS, landing-site scales, barcode scanners) through a **device registry** and **machine ingest APIs**.

## What is implemented

| Hardware / use case | Integration | Ingest |
|---------------------|-------------|--------|
| Temperature / humidity probes | `temperature_probe`, `humidity_sensor` | `POST /api/v2/integrations/iot/ingest` |
| Door / power sensors | `door_sensor` | Same ( `doorOpen`, `powerOk` ) |
| MQTT / gateway (ThingsBoard, Node-RED) | `gateway` | Global secret + tenant header |
| Vessel GPS trackers | `gps_tracker` | `POST /api/v2/integrations/gps/ingest` |
| Landing / market scales | `scale` | `POST /api/v2/integrations/scale/ingest` |
| Barcode / GS1 lot codes | Browser + manual | `/dashboard/inventory/scan` (camera when supported) |
| Outbound ERP webhooks | N/A | Tenant `webhook_endpoints` |

Temperature breaches create **`coldchain_alerts`**, fire workflow event `coldchain.temperature.critical`, and dispatch webhooks (`temp.alert`).

## Device registry

1. Dashboard → **Integrations → Device registry** → Register device.
2. Copy the one-time **ingest key** (`dev_…`).
3. Configure the physical device or bridge to send that key on every POST.

## Authentication (machine ingest)

No browser JWT. Use either:

**Per-device key (recommended)**

```http
POST /api/v2/integrations/iot/ingest
X-AquaERP-Device-Key: dev_abc123...
Content-Type: application/json

{"temperatureC": -2.1, "eventType": "temperature_reading"}
```

Device must be registered; `facility_id` / `zone_id` / `boat_id` on the device record are applied when omitted in the body.

**Global gateway secret** (MQTT bridges)

```http
X-AquaERP-Ingest-Secret: <IOT_GLOBAL_INGEST_SECRET from .env>
X-Tenant-Id: tenant-default-0001
```

Set `IOT_GLOBAL_INGEST_SECRET` in production. Restrict network access to ingest URLs.

**Dashboard / testing (JWT)**

`POST /api/v2/integrations/iot/webhook` still works for authenticated users with `integrations.iot.write`.

## Payload examples

### Cold chain

```json
{
  "eventType": "temperature_reading",
  "temperatureC": 3.2,
  "humidityPct": 78,
  "zoneId": "optional-uuid-if-not-on-device"
}
```

### Door open

```json
{ "eventType": "door_open", "doorOpen": true }
```

### GPS

```json
{
  "boatId": "uuid",
  "latitude": -4.0435,
  "longitude": 39.6682,
  "speedKnots": 4.2,
  "headingDeg": 120
}
```

### Scale (catch weigh-in)

```json
{
  "weightKg": 42.5,
  "referenceType": "catch",
  "referenceId": "catch-uuid",
  "locationLabel": "Landing site Kilifi"
}
```

## Fleet map

`GET /api/v2/fleet/telemetry?latest=1` — latest position per boat (requires `fishing.boats.read`).

## Environment variables

| Variable | Purpose |
|----------|---------|
| `IOT_GLOBAL_INGEST_SECRET` | Shared secret for MQTT/gateway bridges |
| `NEXT_PUBLIC_APP_URL` | Base URL shown in IoT hub UI |

## Industry hardware (configuration only)

Typical vendors map to HTTP POST above:

- **Dragino LHT65** / **Milesight** → temperature ingest  
- **Teltonika GPS** → GPS ingest (HTTP forwarder)  
- **Zebra / Honeywell scanners** → keyboard wedge or `/dashboard/inventory/scan`  
- **CAS / Avery weigh scales** → serial-to-HTTP gateway → scale ingest  

Native MQTT subscriber service is Phase 5 (roadmap); until then use Node-RED or cloud rule → AquaERP ingest URL.

## Not in scope (Phase 5)

- Dedicated POS register / receipt printers  
- BLE direct pairing from browser  
- Blockchain temperature oracle  
