import { setupServer } from "msw/node";
import { rest } from "msw";
import { OpenAPIBackend } from "openapi-backend";
import path, { dirname } from "path";
import { fileURLToPath } from "node:url";
import { developmentBaseUrl } from "./conf.js";
import { users, parkingSpots, reservations, vehicles } from "./data.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const api = new OpenAPIBackend({
  definition: path.join(
    __dirname,
    "..",
    "node_modules",
    "@berufsbildung-basel",
    "parkit-spec",
    "api.yml"
  ),
});

api.register("notFound", (c, res, ctx) => {
  return res(ctx.status(404));
});

function sendMockResponse(operationId, res, ctx) {
  const { status, mock } = api.mockResponseForOperation(operationId);
  ctx.status(status);
  return res(ctx.json(mock));
}

api.register("notImplemented", async (c, res, ctx) => {
  const mockStatusCode = c.request.headers["x-test-response-code"];
  const mockStatusText = c.request.headers["x-test-response-text"];

  if (mockStatusCode) {
    return res(ctx.status(mockStatusCode, mockStatusText));
  }

  return sendMockResponse(c.operation.operationId, res, ctx);
});

api.register("validationFail", (c, res, ctx) => {
  ctx.text(c.validation.errors.join(", "));
  return res(
    ctx.status(
      400,
      c.validation.errors.map((e) => JSON.stringify(e)).join(", ")
    )
  );
});

api.registerSecurityHandler("BasicAuth", (c) => {
  return (
    c.request.headers["authorization"] ===
    `Basic ${new Buffer("test@adobe.com:testPassword").toString("base64")}`
  );
});

api.register("unauthorizedHandler", (c, res, ctx) => {
  return res(ctx.status(401, "unauthorized"));
});

//User Endpoints
api.register({
  listUsers: (c, res, ctx) => {
    const { status, mock } = api.mockResponseForOperation(
      c.operation.operationId
    );
    if (c.request.headers["x-test-empty-response"]) {
      ctx.status(200);
      return res(ctx.json([]));
    } else {
      const returnObject = {
        ...mock,
        users: [...mock.users, ...users],
      };
      return res(ctx.json(returnObject));
    }
  },
  //Hannes Review
  getUser: (c, res, ctx) => {
    const id = c.request.params.id;
    const user = users.find((user) => user.id === id);

    if (user) {
      ctx.status(200);
      return res(ctx.json(user));
    } else {
      return res(ctx.status(404));
    }
  },
});

//Parking Spot Endpoints
api.register({
  listParkingSpots: (c, res, ctx) => {
    const { status, mock } = api.mockResponseForOperation(
      c.operation.operationId
    );
    if (c.request.headers["x-test-empty-response"]) {
      ctx.status(200);
      return res(ctx.json([]));
    } else {
      //send array
      return sendMockResponse(c.operation.operationId, res, ctx);
    }
  },
  checkParkingSpotAvailability: (c, res, ctx) => {
    const startTime = new Date(Date.parse(c.request.query.date)).setHours(
      0,
      0,
      0,
      0
    );
    const endTime = new Date(Date.parse(c.request.query.date)).setHours(
      23,
      59,
      59,
      999
    );

    const availableParkingSpots = parkingSpots.filter((parkingSpot) => {
      return (
        reservations
          .filter(
            (reservation) => reservation.parking_spot_id === parkingSpot.id
          )
          .filter((reservation) => {
            const reservationStartTime = new Date(
              Date.parse(reservation.start_time)
            );
            const reservationEndTime = new Date(
              Date.parse(reservation.end_time)
            );
            // check if reservation overlaps with start and end time
            return (
              (startTime >= reservationStartTime &&
                startTime <= reservationEndTime) ||
              (endTime >= reservationStartTime &&
                endTime <= reservationEndTime) ||
              (startTime <= reservationStartTime &&
                endTime >= reservationEndTime)
            );
          }).length === 0
      );
    });

    ctx.status(200);
    return res(
      ctx.json({
        available_parking_spots: availableParkingSpots,
      })
    );
  },
  listParkingSpotsToday: (c, res, ctx) => {
    const { status, mock } = api.mockResponseForOperation(
      c.operation.operationId
    );
    if (c.request.headers["x-test-empty-response"]) {
      ctx.status(200);
      return res(ctx.json([]));
    } else {
      return sendMockResponse(c.operation.operationId, res, ctx);
    }
  },
});

//Reservation Endpoints
api.register({
  listReservations: (c, res, ctx) => {
    const { status, mock } = api.mockResponseForOperation(
      c.operation.operationId
    );
    if (c.request.headers["x-test-empty-response"]) {
      ctx.status(200);
      return res(ctx.json([]));
    } else {
      const returnObject = {
        ...mock,
        reservations: [...mock.reservations, ...reservations],
      };
      return res(ctx.json(returnObject));
    }
  },
  //Hannes review
  createReservation: (c, res, ctx) => {
    const vehicle = vehicles.find(
      (vehicle) => vehicle.id === c.request.body.vehicle_id
    );

    if (c.request.headers["x-test-too-many-reservations"]) {
      return res(ctx.status(409, "Conflict"));
    }
    reservations.push({
      ...c.request.body,
      id: `item-${reservations.length}`,
      created_at: "2021-01-30T10:30:00Z",
      created_by: "ccf8d1c6-f927-4e51-8de4-4d4a4f4be623",
      cancelled: false,
      start_time: "2021-01-30T08:30:00Z",
      end_time: "2021-01-30T10:30:00Z",
      vehicle: vehicle,
    });
    return res(ctx.status(200));
  },
  //Hannes Review
  cancelReservation: (c, res, ctx) => {
    const id = c.request.params.id;
    const index = reservations.findIndex(
      (reservation) => reservation.id === id
    );

    if (index !== -1) {
      reservations[index].cancelled = true;
      return res(ctx.status(200));
    } else {
      return res(ctx.status(404));
    }
  },
});

//Vehicle Endpoints
api.register({
  listVehicles: (c, res, ctx) => {
    const { status, mock } = api.mockResponseForOperation(
      c.operation.operationId
    );
    if (c.request.headers["x-test-empty-response"]) {
      ctx.status(200);
      return res(ctx.json([]));
    } else {
      const returnObject = {
        ...mock,
        vehicles: [...mock.vehicles, ...vehicles],
      };
      return res(ctx.json(returnObject));
    }
  },
  createVehicle: (c, res, ctx) => {
    vehicles.push({
      ...c.request.body,
      id: `item-${vehicles.length}`,
    });
    return res(ctx.status(200));
  },
  //Hannes Review
  removeVehicle: (c, res, ctx) => {
    const id = c.request.params.id;
    const index = vehicles.findIndex((vehicle) => vehicle.id === id);

    if (index !== -1) {
      vehicles.splice(index, 1);
      return res(ctx.status(200));
    } else {
      return res(ctx.status(404));
    }
  },
});

export function setupMockServer() {
  console.log("using mock server");
  const mockServer = setupServer(
    rest.all(`${developmentBaseUrl}/*`, async (req, res, ctx) => {
      const rawHeaders = req.headers.raw();
      return api.handleRequest(
        {
          path: req.url.pathname.replace(/^\/api/, ""),
          query: req.url.search,
          method: req.method,
          body:
            rawHeaders["content-type"] === "application/json"
              ? await req.json()
              : null,
          headers: rawHeaders,
        },
        res,
        ctx
      );
    })
  );
  mockServer.listen();
  mockServer.printHandlers();
  return mockServer;
}
