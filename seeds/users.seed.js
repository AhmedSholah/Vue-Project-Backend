require("dotenv").config();
const { faker } = require("@faker-js/faker");
const bcrypt = require("bcryptjs");

async function createRandomUser(roleId) {
    const gender = faker.helpers.arrayElement(["male", "female"]);
    const segments = faker.helpers.arrayElement([
        "new_customer",
        "premium_user",
        "high_spender",
        "frequent_buyer",
        "inactive",
        "vip",
    ]);

    const tags = faker.helpers.arrayElement(["regular", "premium "]);
    const provider = faker.helpers.arrayElement(["local", "google"]);

    // Generate a strong password that meets the validation requirements
    const password = `${faker.internet.password()}Aa1!`; // Simplified password generation

    const simulatedCreatedAt = faker.date.past({ years: 5 });

    // Generate phone number without using numeric helper
    const phoneNumber = Math.floor(10000000000 + Math.random() * 90000000000).toString();

    return {
        name: faker.person.firstName(),
        provider: provider,
        phoneNumber: phoneNumber,
        adress: faker.location.streetAddress(true),
        tags: tags,
        email: faker.internet.email(),
        password: await bcrypt.hash(password, 10),
        avatar: faker.image.avatar(),
        gender: gender,
        role: roleId,
        permissions: [],
        wallet: Number((Math.random() * 10000).toFixed(2)), // Simplified wallet generation
        simulatedCreatedAt: simulatedCreatedAt,
        segments: segments,
    };
}

async function seedUsers(numUsers = 100, roleId) {
    if (!roleId) {
        throw new Error("Role ID is required for seeding users.");
    }

    try {
        console.log(`Generating ${numUsers} random users...`);
        const userPromises = [];
        for (let i = 0; i < numUsers; i++) {
            userPromises.push(createRandomUser(roleId));
        }

        const userData = await Promise.all(userPromises);
        console.log(`Successfully generated ${numUsers} users`);
        return userData;
    } catch (error) {
        console.error("Error generating users:", error);
        throw error;
    }
}

seedUsers(10, "12");

module.exports = { seedUsers };
