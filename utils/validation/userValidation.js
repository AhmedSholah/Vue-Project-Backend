const { z } = require("zod");

const egyptianCities = [
  "Cairo",
  "Alexandria",
  "Giza",
  "Shubra El-Kheima",
  "Port Said",
  "Suez",
  "Mansoura",
  "Tanta",
  "Asyut",
  "Ismailia",
  "Fayoum",
  "Zagazig",
  "Minya",
  "Damietta",
  "Beni Suef",
  "Luxor",
  "Aswan",
  "6th of October City",
  "Damanhur",
  "Shibin El Kom",
  "Hurghada",
  "Banha",
  "Minya al-Qamh",
  "Kafr El Sheikh",
  "Qena",
  "Sohag",
  "Mahalla",
  "Mersa Matruh",
  "Rashid",
  "Edfu",
  "Kafr El Dawar",
  "El-Mahalla El-Kubra",
  "Beni Suef",
  "Tanta",
  "Gharbia",
  "Qalyubia",
];

const updateUserSchema = z
  .object({
    name: z.string().min(3).max(16).optional(),
    // firstName: z.string().min(3).max(16).optional(),
    // lastName: z.string().min(3).max(16).optional(),
    phoneNumber: z.string().length(11).optional(),
    country: z.enum(["Egypt"]).optional(),
    city: z.enum(egyptianCities).optional(),
    bio: z.string().max(200).optional().or(z.literal("")),
    email: z.string().email().optional(),
    image: z.string().optional(),
  })
  .strict();

module.exports = { updateUserSchema };
