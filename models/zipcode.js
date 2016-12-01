"use strict";

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
		Schema = mongoose.Schema;


/**
 * Zip Code Schema
 */

var ZipCodeSchema = new Schema({
	code: String,
	insee: String,
	city: String,
	department: String,
	country: String,
	gps: [Number]
});

exports.Schema = mongoose.model('zipCode', ZipCodeSchema, 'ZipCode');
exports.name = 'zipCode';

