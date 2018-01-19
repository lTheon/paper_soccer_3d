
module.exports = function (mongoose) {
    var Schema = mongoose.Schema;
    var userSchema = new Schema(
        {
            name: { type: String, required: true },
        });
    var models = {
        user: mongoose.model("user", userSchema), 
    }

    return models;

}
