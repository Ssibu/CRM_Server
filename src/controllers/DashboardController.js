import models from '../models/index.js';

const { Tender, Notice, Advertisement, 
    NewsAndEvent, 
    User } = models;

export const getDashboardStats = async (req, res) => {
    try {
        // Define the conditions for active and non-deleted records
        const activeConditions = { where: { is_active: true, is_delete: false } };
        const activeUserConditions = { where: { isActive: true } }; 
        const newsEvenetActive = {where: {status: "Active"}}

        // Run all count queries in parallel for efficiency
        const [
            tenderCount,
            noticeCount,
            advertisementCount,
            newsEventCount,
            userCount
        ] = await Promise.all([
            Tender.count(activeConditions),
            Notice.count(activeConditions),
            Advertisement.count(activeConditions),
            NewsAndEvent.count(newsEvenetActive),
            User.count(activeUserConditions) // Use specific user conditions
        ]);

        // Combine counts for the "Notice & Advertisement" card
        const noticeAndAdCount = noticeCount + advertisementCount;

        // Send the aggregated data in the response
        res.status(200).json({
            tenderCount,
            noticeAndAdCount,
            newsEventCount,
            userCount
        });

    } catch (error) {
        console.error("Error fetching dashboard statistics:", error);
        res.status(500).json({ message: "Server error while fetching dashboard statistics." });
    }
};