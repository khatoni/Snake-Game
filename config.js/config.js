module.exports = {
    development: {
        port: process.env.PORT,
        privateKey: process.env.PRIVATE_KEY,
        databaseUrl: process.env.DATABASE_URL,
        cloudinaryName: process.env.CLOUDINARY_APP_NAME,
        cloudinaryApiKey: process.env.CLOUDINARY_APP_KEY,
        cloudinaryApiSecret: process.env.CLOUDINARY_APP_SECRET
    },
    production: {}
};