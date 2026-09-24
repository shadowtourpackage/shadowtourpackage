import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
    {
        bookingReference: {
            type: String,
            unique: true,
            index: true
        },
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters long'],
            maxlength: [100, 'Name cannot exceed 100 characters']
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            default: null,
            validate: {
                validator: function (val) {
                    return !val || /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val);
                },
                message: 'Please provide a valid email address'
            }
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true,
            match: [/^[+\d][\d\s-]{7,15}$/, 'Please provide a valid phone number']
        },
        destination: {
            type: String,
            required: [true, 'Destination is required'],
            trim: true
        },
        category: {
            type: String,
            required: [true, 'Package category is required'],
            trim: true,
            default: 'Standard Package'
        },
        travellers: {
            type: Number,
            required: [true, 'Number of travellers is required'],
            min: [1, 'Minimum 1 traveller is required'],
            max: [50, 'Maximum 50 travellers permitted per single enquiry']
        },
        travelDate: {
            type: Date,
            default: null
        },
        emailNotificationStatus: {
            type: String,
            enum: ['pending', 'sent', 'failed'],
            default: 'pending'
        },
        category: {
            type: String,
            required: [true, 'Group category is required'],
            trim: true,
            enum: {
                values: ['School', 'College', 'Staff', 'Family', 'Bachelors'],
                message: '{VALUE} is not a valid category'
            }
        },
    },
    {
        timestamps: true
    }
);

bookingSchema.pre('validate', function (next) {
    if (!this.bookingReference) {
        const randomSuffix = Math.floor(100000 + Math.random() * 900000);
        this.bookingReference = `ST-${Date.now().toString().slice(-4)}${randomSuffix.toString().slice(-2)}`;
    }
    next();
});

export const Booking = mongoose.model('Booking', bookingSchema);