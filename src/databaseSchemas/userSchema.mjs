import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    }
}, {
    timestamps: true,
    versionKey: false
});

userSchema.pre('save', async function(next) {
    const count = await User.countDocuments();
    if (count >= 1) {
        const error = new Error('Cannot exceed the limit of 2 users.');
        next(error);
    } else {
        next();
    }
});

const User = model('User', userSchema);

export default User;
