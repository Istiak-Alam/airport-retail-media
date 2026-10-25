# Data Adapter Guide

## Adding a new live flight source

1. Implement `FlightSource` in `backend/src/adapters/`.
2. Register it in the factory (env `FLIGHT_SOURCE`).
3. Map vendor payload → `CanonicalFlight` / `FlightEvent`.
4. No changes required in decision pipeline or UI.

## Current mocks

| Adapter     | Format     | Notes                                      |
|-------------|------------|--------------------------------------------|
| mock-aodb   | Synthetic  | ~900 flights generated, CSV-compatible     |
| mock-aidx   | XML-like   | Stream of delay / gate / status events     |
| mock-acris  | NGSI-LD    | Zones, queues (simplified for POC)         |

## Sample AIDX event (conceptual)

```xml
<IATA_AIDX_FlightLegNotifRQ>
  <FlightLeg>
    <LegIdentifier>
      <Airline>XY</Airline>
      <FlightNumber>501</FlightNumber>
    </LegIdentifier>
    <AirportResources>
      <Resource>Gate</Resource>
      <Value>C5</Value>
    </AirportResources>
    <OperationTime OperationQualifier="OFB" TimeType="EST">2026-10-24T14:55:00Z</OperationTime>
  </FlightLeg>
</IATA_AIDX_FlightLegNotifRQ>
```

The mock adapter emits equivalent structured events.