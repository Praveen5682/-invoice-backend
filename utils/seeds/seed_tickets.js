exports.seed = async function (knex) {
  await knex("tickets").del();

  const tickets = Array.from({ length: 40 }, (_, i) => ({
    ticket_id: i + 1,
    seat_number: i + 1, // ✅ REQUIRED FIX
    status: 0,
    user_name: null,
    user_email: null,
    user_phone: null,
  }));

  await knex("tickets").insert(tickets);
};
