module.exports = function () {

    var opers = {

        // wstawienie jednego "rekordu" do dokumentu - INSERT

        InsertOne: function (data) {
            data.save(function (error, data, dodanych) {
                console.log("dodano " + data)
            })
        },

        // pobranie wszystkich "rekordów" z dokumentu - SELECT
        // zwracamy uwagę na argument Model

        SelectAll: function (Model) {
            Model.find({}, function (err, data) {
                if (err) return console.error(err);
                console.log(data);
            })
        },

        //pobranie z ograniczeniem ilości i warunkiem - WHERE, LIMIT

        SelectByImie: function (Model, imie, count, callback) {
            Model.find({ name: imie }, function (err, data) {
                if (err) return console.error(err);
                if (data[0] != undefined)
                    callback("checked");
                else
                    callback("not");
            }).limit(count)
        },

        //aktualizacja - np zamiana imienia - UPDATE

        UpdateImie: function (Model, oldName, newName) {
            Model.update({ imie: oldName }, { imie: newName }, function (err, data) {
                if (err) return console.error(err);
                console.log(data);
            })
        },

        //usuniecie danych - DELETE

        DeleteAll: function (Model) {
            Model.remove(function (err, data) {
                if (err) return console.error(err);
                console.log(data);
            })
        },

        // pozostałe niezbędne operacje trzeba sobie dopisać samemu, 
        // na podstawie dokumentacji Mongoose
    }

    return opers;

}