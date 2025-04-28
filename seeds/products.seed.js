require("dotenv").config();
const { faker } = require("@faker-js/faker");

async function createRandomProduct(categoryIds, userIds) {
    const name = faker.commerce.productName();
    const price = parseFloat(faker.commerce.price());
    const discountPercentage = faker.number.int({ min: 0, max: 70 });
    const discountAmount = parseFloat((price * (discountPercentage / 100)).toFixed(2));
    const quantity = faker.number.int({ min: 1, max: 200 });
    const views = faker.number.int({ min: 0, max: 1000 });
    const rating = faker.number.float({ min: 0, max: 5, precision: 0.1 });
    const description = faker.lorem.paragraph(5);
    const colors = faker.helpers.arrayElements(
        ["red", "green", "blue", "yellow", "pink"],
        faker.number.int({ min: 1, max: 5 }),
    );
    const imageNames = Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () =>
        faker.image.url(),
    );
    const tags = faker.helpers.arrayElements(
        ["new_arrival", "sale", "eco_friendly", "limited_edition", "handmade", "bestseller"],
        faker.number.int({ min: 0, max: 3 }),
    );
    const shippingCost = parseFloat(faker.commerce.price({ min: 5, max: 50, dec: 2 }));
    const estimatedDelivery = faker.number.int({ min: 1, max: 7 });
    const simulatedCreatedAt = faker.date.past();

    const randomCategoryId = faker.helpers.arrayElement(categoryIds);
    const randomUserId = faker.helpers.arrayElement(userIds);

    return {
        name: name,
        price: price,
        rating: rating,
        imageNames: imageNames,
        colors: colors,
        discountAmount: discountAmount,
        discountPercentage: discountPercentage,
        category: randomCategoryId,
        description: description,
        views: views,
        quantity: quantity,
        simulatedCreatedAt: simulatedCreatedAt,
        shippingInfo: {
            shippingCost: shippingCost,
            estimatedDelivery: estimatedDelivery,
        },
        tags: tags,
        soldBy: randomUserId,
    };
}

async function seedProducts(numProducts = 10, categoryIds, userIds) {
    if (!categoryIds || categoryIds.length === 0) {
        throw new Error("No categories found in the database. Cannot seed products.");
    }
    if (!userIds || userIds.length === 0) {
        throw new Error("No users found in the database. Cannot seed products.");
    }

    try {
        const productPromises = [];
        for (let i = 0; i < numProducts; i++) {
            productPromises.push(createRandomProduct(categoryIds, userIds));
        }

        const products = await Promise.all(productPromises);

        // console.log(products);
        console.log(`${numProducts} products seeded successfully!`);
        return products;
    } catch (error) {
        console.error("Error seeding products:", error);
        throw error;
    }
}

module.exports = { seedProducts };
