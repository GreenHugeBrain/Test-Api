import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const imageSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    image: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    }
}, {
    timestamps: true,
    versionKey: false
});

const Image = model('Image', imageSchema);

export default Image;
