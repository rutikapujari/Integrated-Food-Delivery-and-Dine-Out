const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const mongoose = require('mongoose');

// TODO (Week 3): AI Suggestions enhancements
// See: backend/docs/week-3.md
// - Add simple caching for expensive aggregations
// - Add response contract tests and tuning

// Simple suggestion engine: recommend most-ordered menu items from user's history
// Simple in-memory cache to reduce aggregation load for frequent calls
const _suggestionsCache = new Map(); // key -> { expires: timestamp, data }
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

const getSuggestions = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id;

        if (!userId) {
            return res.status(400).json({ success: false, message: 'User authentication required' });
        }

        const cacheKey = `suggestions:user:${userId}`;
        const cached = _suggestionsCache.get(cacheKey);
        if (cached && cached.expires > Date.now()) {
            return res.status(200).json({ success: true, suggestions: cached.data, cached: true });
        }
        // Aggregate ordered menu item counts for the user
        const pipeline = [
            { $match: { userId: new mongoose.Types.ObjectId(userId), status: { $ne: 'cancelled' } } },
            { $unwind: '$items' },
            { $group: { _id: '$items.menuItemId', count: { $sum: '$items.quantity' } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
        ];

        const results = await Order.aggregate(pipeline);

        const menuItemIds = results.map((r) => r._id).filter(Boolean);

        const menuItems = await MenuItem.find({ _id: { $in: menuItemIds } }).select('name price image');
        const menuMap = new Map(menuItems.map((m) => [m._id.toString(), m]));

        const suggestions = results
            .map((r) => {
                const id = r._id ? r._id.toString() : null;
                const menu = menuMap.get(id);
                if (!menu) return null;
                return {
                    menuItemId: id,
                    name: menu.name,
                    price: menu.price,
                    image: menu.image,
                    score: r.count,
                    reason: 'Frequently ordered by you',
                };
            })
            .filter(Boolean);

        // If no personal history, offer popular items across all orders
        if (suggestions.length === 0) {
            const popular = await Order.aggregate([
                { $unwind: '$items' },
                { $group: { _id: '$items.menuItemId', count: { $sum: '$items.quantity' } } },
                { $sort: { count: -1 } },
                { $limit: 10 },
            ]);

            const popularIds = popular.map((p) => p._id).filter(Boolean);
            const popularItems = await MenuItem.find({ _id: { $in: popularIds } }).select('name price image');
            const popularMap = new Map(popularItems.map((m) => [m._id.toString(), m]));

            const fallback = popular
                .map((p) => {
                    const id = p._id ? p._id.toString() : null;
                    const menu = popularMap.get(id);
                    if (!menu) return null;
                    return {
                        menuItemId: id,
                        name: menu.name,
                        price: menu.price,
                        image: menu.image,
                        score: p.count,
                        reason: 'Popular with other customers',
                    };
                })
                .filter(Boolean);

            // cache fallback results
            _suggestionsCache.set(cacheKey, { expires: Date.now() + CACHE_TTL_MS, data: fallback });
            return res.status(200).json({ success: true, suggestions: fallback });
        }

        // cache results
        _suggestionsCache.set(cacheKey, { expires: Date.now() + CACHE_TTL_MS, data: suggestions });

        res.status(200).json({ success: true, suggestions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getSuggestions };
