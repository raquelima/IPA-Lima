import executeRequest from "./executeRequest";

/**
 * Creates a reservation with the parameters below
 * @param {Object} client The API client
 * @param {string} parkingSpotId
 * @param {string} userId
 * @param {string} vehicleId
 * @param {Object} date
 * @param {Boolean} halfDay
 * @param {Boolean} am
 * @returns {Promise<Object>} A promise that resolves to the response data from the API call.
 */
async function createReservation(
  client,
  parkingSpotId,
  userId,
  vehicleId,
  date,
  halfDay,
  am
) {
  return executeRequest(
    client,
    "reservations",
    "createReservation",
    {},
    {
      requestBody: {
        parking_spot_id: parkingSpotId,
        user_id: userId,
        vehicle_id: vehicleId,
        date: date.toString(),
        half_day: halfDay,
        am: am,
      },
    }
  );
}

export default createReservation;
