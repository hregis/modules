exports.install = function () {
    F.route('/', view_homepage);
    F.route('/api/zipcode/autocomplete', zipcode);
    F.route('/api/zipcode/import', zipcodeImport, ['upload'], 1240);
};

function view_homepage() {
    var self = this;
    self.redirect('http://www.tomanage.fr');
}


function zipcode() {
    var self = this;
    var ZipCodeModel = MODEL('zipCode').Schema;
    var callback = self.query.callback || 'myCallback';
    console.log(this.query);
    if (this.query.q === null)
        return self.jsonp(callback, []);

    var val = "^" + this.query.q;

    var query = {"$or": [
            {code: new RegExp(val, "i")},
            {city: new RegExp(val, "i")}
        ]
    };

    //var query = {$or: [{"code" : {$regex: /val.*/ }}, {"city" : { $regex: val, $options: 'i'}}]};

    ZipCodeModel.find(query, {}, {limit: 5}, function (err, doc) {
        if (err)
            return self.throw500(err);

        return self.jsonp(callback, doc);

    });
}

function zipcodeImport() {

    var ZipCodeModel = MODEL('zipCode').Schema;
    var csv = require('csv');
    var fixedWidthString = require('fixed-width-string');

    var self = this;

    if (self.query.key != CONFIG('zipcode_key'))
        return self.throw401("Error key");


    if (self.files.length > 0) {
        //console.log(self.files[0].filename);

        var tab = [];

        csv()
                .from.path(self.files[0].path, {
                    delimiter: ';',
                    escape: '"'
                })
                .transform(function (row, index, callback) {
                    if (index === 0) {
                        tab = row; // Save header line
                        return callback();
                    }
                    //console.log(tab);
                    //console.log(row);

                    //console.log(row[0]);

                    //return;

                    var convertRow = function (tab, row, index, cb) {
                        var obj = {};

                        for (var i = 0; i < row.length; i++) {
                            if (tab[i] === "false")
                                continue;
                            
                            if (tab[i] == 'code') {
                                obj[tab[i]] = fixedWidthString(row[i], 5, {padding: '0', align: 'right'});
                                continue;
                            }

                            if (row[i])
                                obj[tab[i]] = row[i];
                        }

                        cb(obj);
                    };

                    convertRow(tab, row, index, function (data) {
                        ZipCodeModel.update({country: 'FR', insee: data.insee}, {$set: data}, {upsert: true, multi: true}, callback);
                    });
                })
                .on("end", function (count) {
                    console.log('Number of lines: ' + count);
                    return self.json({
                        count: count
                    });
                })
                .on('error', function (error) {
                    console.log(error.message);
                });
    }
    else
        self.plain('Error no file');
}