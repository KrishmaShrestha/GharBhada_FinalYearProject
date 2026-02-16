const { pool } = require('../config/database');

// @desc    Record monthly utility reading and calculate total due
// @route   POST /api/utilities/record
// @access  Private/Owner
exports.recordReading = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { agreement_id, current_reading, month_year } = req.body;
        const ownerId = req.user.user_id;

        // 1. Get agreement details
        const [agreements] = await connection.query(
            `SELECT a.*, p.title as property_title, u.full_name as tenant_name, u.email as tenant_email
             FROM rental_agreements a
             JOIN properties p ON a.property_id = p.property_id
             JOIN users u ON a.tenant_id = u.user_id
             WHERE a.agreement_id = ? AND a.owner_id = ?`,
            [agreement_id, ownerId]
        );

        if (agreements.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Agreement not found or unauthorized' });
        }

        const agreement = agreements[0];

        // 2. Get previous reading (latest recorded for this agreement in payments table)
        const [prevPayments] = await connection.query(
            'SELECT electricity_units FROM payments WHERE booking_id = ? AND payment_type = "rent" ORDER BY payment_date DESC LIMIT 1',
            [agreement.booking_id]
        );

        const lastReading = prevPayments.length > 0 ? prevPayments[0].electricity_units : 0;
        const unitsConsumed = current_reading - lastReading;

        if (unitsConsumed < 0) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Current reading cannot be less than previous reading' });
        }

        // 3. Calculate costs
        const electricityAmount = unitsConsumed * (agreement.electricity_rate || 10);
        const waterAmount = parseFloat(agreement.water_bill || 500);
        const garbageAmount = parseFloat(agreement.garbage_bill || 200);
        const baseRent = parseFloat(agreement.base_rent);

        // 4. Check if it's the first payment to apply deposit credit
        const [totalPayments] = await connection.query(
            'SELECT COUNT(*) as count FROM payments WHERE booking_id = ? AND payment_type = "rent"',
            [agreement.booking_id]
        );

        let depositAdjustment = 0;
        if (totalPayments[0].count === 0) {
            // First month: Apply pre-paid 5000 deposit adjustment
            depositAdjustment = 5000;
        }

        const totalDue = baseRent + electricityAmount + waterAmount + garbageAmount - depositAdjustment;

        // 5. Insert record into payments table
        const [result] = await connection.query(
            `INSERT INTO payments (
                booking_id, tenant_id, owner_id, amount, payment_type, 
                payment_status, notes, due_date, payment_for_month,
                electricity_units, electricity_amount, water_amount, garbage_amount, 
                deposit_adjustment, base_rent
            ) VALUES (?, ?, ?, ?, 'rent', 'pending', ?, DATE_ADD(CURDATE(), INTERVAL 7 DAY), ?, ?, ?, ?, ?, ?, ?)`,
            [
                agreement.booking_id, agreement.tenant_id, ownerId, totalDue,
                `Units: ${unitsConsumed}, Prev: ${lastReading}, Curr: ${current_reading}`,
                month_year || new Date(),
                current_reading, electricityAmount, waterAmount, garbageAmount,
                depositAdjustment, baseRent
            ]
        );

        await connection.commit();
        res.json({
            success: true,
            message: 'Utility reading recorded and bill generated',
            payment_id: result.insertId,
            calculation: {
                units_consumed: unitsConsumed,
                electricity_amount: electricityAmount,
                total_amount: totalDue,
                deposit_adjustment: depositAdjustment
            }
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Record utility reading error:', error);
        res.status(500).json({ success: false, message: 'Failed to record reading', error: error.message });
    } finally {
        connection.release();
    }
};

// @desc    Get billing history for a tenant
// @route   GET /api/utilities/history/:agreementId
// @access  Private
exports.getBillingHistory = async (req, res) => {
    try {
        const { agreementId } = req.params;
        const userId = req.user.user_id;

        const [history] = await pool.query(
            `SELECT p.* FROM payments p
             JOIN rental_agreements ra ON p.booking_id = ra.booking_id
             WHERE ra.agreement_id = ? AND (ra.tenant_id = ? OR ra.owner_id = ?)
             AND p.payment_type = 'rent'
             ORDER BY p.payment_date DESC`,
            [agreementId, userId, userId]
        );

        res.json({
            success: true,
            history
        });
    } catch (error) {
        console.error('Get billing history error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch history' });
    }
};
