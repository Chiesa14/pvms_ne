import { Op } from 'sequelize';

export const createPaginationOptions = (query) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const offset = (page - 1) * limit;

    return {
        page,
        limit,
        offset
    };
};

export const createSearchOptions = (query, searchFields) => {
    const searchOptions = {};
    const searchTerm = query.search;

    if (searchTerm && searchFields.length > 0) {
        searchOptions[Op.or] = searchFields.map(field => ({
            [field]: {
                [Op.iLike]: `%${searchTerm}%`
            }
        }));
    }

    return searchOptions;
};

export const createDateRangeFilter = (query, dateField) => {
    const dateFilter = {};
    const { startDate, endDate } = query;

    if (startDate || endDate) {
        dateFilter[dateField] = {};
        if (startDate) {
            dateFilter[dateField][Op.gte] = new Date(startDate);
        }
        if (endDate) {
            dateFilter[dateField][Op.lte] = new Date(endDate);
        }
    }

    return dateFilter;
};

export const createStatusFilter = (query, statusField) => {
    const statusFilter = {};
    const { status } = query;

    if (status) {
        statusFilter[statusField] = status;
    }

    return statusFilter;
};

export const createWhereClause = (query, options = {}) => {
    const {
        searchFields = [],
        dateField = 'createdAt',
        statusField = 'status'
    } = options;

    const where = {
        ...createSearchOptions(query, searchFields),
        ...createDateRangeFilter(query, dateField),
        ...createStatusFilter(query, statusField)
    };

    // Remove empty objects
    Object.keys(where).forEach(key => {
        if (Object.keys(where[key]).length === 0) {
            delete where[key];
        }
    });

    return where;
};

export const createPaginationResponse = (count, page, limit, data) => {
    return {
        total: count,
        page,
        totalPages: Math.ceil(count / limit),
        data
    };
}; 