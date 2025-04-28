require("dotenv").config();
const { faker } = require("@faker-js/faker");

async function createRandomOrder(userIds, allProductIds, productsData) {
    const userId = faker.helpers.arrayElement(userIds);
    const numItems = faker.number.int({ min: 1, max: 5 }); // Number of different products per order
    const orderItems = [];
    let calculatedTotalPrice = 0;

    // Ensure we have enough unique products available for the order
    const availableProductIds = [...allProductIds];
    const numProductsToSelect = Math.min(numItems, availableProductIds.length);

    if (numProductsToSelect === 0) {
        console.warn("No product IDs available to create order items.");
        return null;
    }

    for (let i = 0; i < numProductsToSelect; i++) {
        const productIndex = faker.number.int({ min: 0, max: availableProductIds.length - 1 });
        const productId = availableProductIds.splice(productIndex, 1)[0];

        const product = productsData.find((p) => p._id.toString() === productId.toString());
        const price = product ? product.price : parseFloat(faker.commerce.price());

        const quantity = faker.number.int({ min: 1, max: 3 });
        orderItems.push({
            product: productId,
            quantity: quantity,
            price: price,
        });

        calculatedTotalPrice += quantity * price;
    }

    if (orderItems.length === 0) {
        return null;
    }

    const orderStatus = faker.helpers.arrayElement([
        "processing",
        "shipped",
        "delivered",
        "cancelled",
    ]);
    const paymentStatus = faker.helpers.arrayElement(["pending", "paid", "failed", "refunded"]);
    const simulatedCreatedAt = faker.date.past({ years: 1 });

    let deliveredAt = null;
    if (orderStatus === "delivered" && paymentStatus === "paid") {
        deliveredAt = faker.date.between({ from: simulatedCreatedAt, to: new Date() });
    }

    return {
        user: userId,
        orderItems: orderItems,
        shippingAddress: faker.location.streetAddress(true),
        totalPrice: parseFloat(calculatedTotalPrice.toFixed(2)),
        paymentMethod: faker.helpers.arrayElement(["wallet", "visa"]),
        paymentStatus: paymentStatus,
        orderStatus: orderStatus,
        orderNumber: faker.number.int({ min: 100000, max: 999999 }),
        simulatedCreatedAt: simulatedCreatedAt,
        deliveredAt: deliveredAt,
    };
}

async function seedOrders(numOrders = 50, userIds, productIds, productsData) {
    if (!userIds || userIds.length === 0) {
        throw new Error("No user IDs provided. Cannot seed orders.");
    }
    if (!productIds || productIds.length === 0) {
        throw new Error("No product IDs provided. Cannot seed orders.");
    }
    if (!productsData || productsData.length === 0) {
        throw new Error("No product data provided. Cannot seed orders.");
    }

    try {
        console.log(`Attempting to seed ${numOrders} orders...`);

        const orderPromises = [];
        for (let i = 0; i < numOrders; i++) {
            orderPromises.push(createRandomOrder(userIds, productIds, productsData));
        }

        let ordersData = await Promise.all(orderPromises);
        ordersData = ordersData.filter((order) => order !== null);

        if (ordersData.length === 0) {
            console.log("No valid order data generated. Seeding skipped.");
            return [];
        }

        console.log(`Generated ${ordersData.length} valid order data objects.`);
        // console.log(ordersData);
        return ordersData;
    } catch (error) {
        console.error("Error generating orders:", error);
        throw error;
    }
}

module.exports = { seedOrders };
