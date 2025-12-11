const { pool } = require("../config/db");

const Activity = {};

/**
 * Get recent activities from various tables
 * Combines activities from projects, repositories, and pending projects
 * Note: Only includes tables that have timestamp columns (created_at, updated_at, submitted_at)
 */
Activity.getRecentActivities = async (limit = 10) => {
    try {
        const query = `
            WITH project_activities AS (
                SELECT 
                    'project_created' as activity_type,
                    'New project added' as activity_title,
                    title as activity_description,
                    created_at as activity_time,
                    'primary' as activity_color,
                    'Plus' as activity_icon
                FROM Project
                WHERE created_at >= NOW() - INTERVAL '30 days'
                
                UNION ALL
                
                SELECT 
                    'project_updated' as activity_type,
                    'Project updated' as activity_title,
                    title as activity_description,
                    updated_at as activity_time,
                    'primary' as activity_color,
                    'FolderTree' as activity_icon
                FROM Project
                WHERE updated_at >= NOW() - INTERVAL '30 days'
                AND updated_at != created_at
            ),
            repository_activities AS (
                SELECT 
                    'repository_created' as activity_type,
                    'New repository added' as activity_title,
                    COALESCE("Heading", 'Untitled Repository') as activity_description,
                    created_at as activity_time,
                    'success' as activity_color,
                    'Book' as activity_icon
                FROM DocumentRepository
                WHERE created_at >= NOW() - INTERVAL '30 days'
                
                UNION ALL
                
                SELECT 
                    'repository_updated' as activity_type,
                    'Repository updated' as activity_title,
                    COALESCE("Heading", 'Untitled Repository') as activity_description,
                    updated_at as activity_time,
                    'success' as activity_color,
                    'Book' as activity_icon
                FROM DocumentRepository
                WHERE updated_at >= NOW() - INTERVAL '30 days'
                AND updated_at != created_at
            ),
            pending_project_activities AS (
                SELECT 
                    'pending_project_submitted' as activity_type,
                    'Pending project submitted' as activity_title,
                    title as activity_description,
                    submitted_at as activity_time,
                    'info' as activity_color,
                    'CheckCircle' as activity_icon
                FROM PendingProject
                WHERE submitted_at >= NOW() - INTERVAL '30 days'
            ),
            pending_repository_activities AS (
                SELECT 
                    'pending_repository_submitted' as activity_type,
                    'Pending repository submitted' as activity_title,
                    COALESCE("Heading", 'Untitled Repository') as activity_description,
                    created_at as activity_time,
                    'info' as activity_color,
                    'BookOpenText' as activity_icon
                FROM PendingDocumentRepository
                WHERE created_at >= NOW() - INTERVAL '30 days'
            ),
            all_activities AS (
                SELECT * FROM project_activities
                UNION ALL
                SELECT * FROM repository_activities
                UNION ALL
                SELECT * FROM pending_project_activities
                UNION ALL
                SELECT * FROM pending_repository_activities
            )
            SELECT 
                activity_type,
                activity_title,
                activity_description,
                activity_time,
                activity_color,
                activity_icon,
                CASE
                    WHEN activity_time >= NOW() - INTERVAL '1 hour' THEN 'Just now'
                    WHEN activity_time >= NOW() - INTERVAL '2 hours' THEN '1 hour ago'
                    WHEN activity_time >= NOW() - INTERVAL '24 hours' THEN 
                        EXTRACT(HOUR FROM (NOW() - activity_time))::INTEGER || ' hours ago'
                    WHEN activity_time >= NOW() - INTERVAL '48 hours' THEN '1 day ago'
                    WHEN activity_time >= NOW() - INTERVAL '7 days' THEN 
                        EXTRACT(DAY FROM (NOW() - activity_time))::INTEGER || ' days ago'
                    WHEN activity_time >= NOW() - INTERVAL '30 days' THEN 
                        EXTRACT(DAY FROM (NOW() - activity_time))::INTEGER || ' days ago'
                    ELSE 'More than 30 days ago'
                END as time_ago
            FROM all_activities
            ORDER BY activity_time DESC
            LIMIT $1
        `;

        const result = await pool.query(query, [limit]);
        return result.rows;
    } catch (error) {
        console.error("Error fetching recent activities:", error);
        throw error;
    }
};

module.exports = Activity;