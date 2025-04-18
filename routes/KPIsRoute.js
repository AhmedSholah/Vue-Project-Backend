router.get("/api/admin/kpis", async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [revenue] = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);

    const [avg] = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, avgValue: { $avg: "$totalPrice" } } },
    ]);

    const totalOrders = await Order.countDocuments();
    const totalCustomers = await User.countDocuments();
    const newCustomers = await User.countDocuments({
      createdAt: { $gte: startOfMonth },
    });

    res.json({
      totalRevenue: revenue?.total || 0,
      avgOrderValue: avg?.avgValue || 0,
      totalOrders,
      totalCustomers,
      newCustomers,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to calculate KPIs" });
  }
});
