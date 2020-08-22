const Student = require("./Models/StudentModel"),
    Class = require("./Models/ClassModel"),
    mongoose = require("mongoose"),
    config = require("./config.json");

beforeAll(async () => {
    await mongoose.connect(
        config["MONGODB_TEST_URI"],
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
        },
        () => console.log("Test Mongoose successfully connected")
    );
});
afterAll(async () => {
    await Student.deleteMany({});
    await Class.deleteMany({});
    await mongoose.disconnect();
});
