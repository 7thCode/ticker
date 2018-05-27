var mongoose = require('mongoose');
require('mongoose-double')(mongoose);

var Schema = mongoose.Schema;
var SchemaTypes = Schema.Types;

var Tick = new Schema({
    key: String,
    eventTime: Date,
    high: SchemaTypes.Double,
    low: SchemaTypes.Double,
    open: SchemaTypes.Double,
    close: SchemaTypes.Double,
    quoteVolume: Number,
    volume: Number
});

mongoose.connect('mongodb://localhost/ticks');

exports.Tick = mongoose.model('Tick', Tick);
