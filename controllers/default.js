exports.install = function () {
    F.route('/', view_homepage);
    F.route('/api/zipcode/autocomplete', zipcode);
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