const db = require("../../../../config/db");

// Get all states
module.exports.getStates = async () => {
  try {
    const states = await db("states")
      .select("id", "name")
      .where({ country_id: 1 }) // India (assuming 1 = India)
      .orderBy("name", "asc");

    return states;
  } catch (err) {
    console.error("Service Error (getStates):", err);
    throw new Error("Failed to fetch states");
  }
};

// Get cities by state
module.exports.getCitiesByState = async (stateId) => {
  try {
    const cities = await db("cities")
      .select("id", "name")
      .where({ state_id: stateId })
      .orderBy("name", "asc");

    return cities;
  } catch (err) {
    console.error("Service Error (getCitiesByState):", err);
    throw new Error("Failed to fetch cities");
  }
};
