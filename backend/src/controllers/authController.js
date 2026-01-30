const User = require('../models/User');

// @desc    Register user (Admin only in this system usually, but initial setup might need public)
// @route   POST /api/auth/register
// @access  Public (or Admin, depending on requirements. Making public for initial setup, then should be locked down)
exports.register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, role } = req.body;

        // Create user
        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
            role,
        });

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        console.log('Login attempt:', req.body);
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            console.log('Missing email or password');
            return res.status(400).json({ success: false, message: 'Please provide an email and password' });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');
        console.log('User found:', user ? 'Yes' : 'No');

        if (!user) {
            console.log('User not found for email:', email);
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);
        console.log('Password match:', isMatch);

        if (!isMatch) {
            console.log('Password does not match');
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (!user.isActive) {
            console.log('User is not active');
            return res.status(401).json({ success: false, message: 'Account is deactivated' });
        }

        console.log('Login successful for:', email);
        sendTokenResponse(user, 200, res);
    } catch (err) {
        console.error('Login error:', err);
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
    // Client side just needs to discard the token
    res.status(200).json({
        success: true,
        data: {},
    });
};

// @desc    Update password for current user
// @route   PUT /api/auth/update-password
// @access  Private
exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }

        const user = await User.findById(req.user.id).select('+password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(
            Date.now() + 24 * 60 * 60 * 1000 // 24 hours
        ),
        httpOnly: true,
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res
        .status(statusCode)
        // .cookie('token', token, options) // Optional: if using cookies
        .json({
            success: true,
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        });
};
