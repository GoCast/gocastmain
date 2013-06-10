var GoCastJS;

(function(module) {
	module.SpotFactory = module.Class({
		privates: {
			spottypes: {},
			spotlist: {}
		},
		methods: {
			RegisterSpot: function(spottype, spotclass) {
				if (spottype && spotclass &&
					!this.spottypes().hasOwnProperty(spottype)) {
					this.spottypes()[spottype] = spotclass;
				}
			},
			DeregisterSpot: function(spottype) {
				if (spottype && this.spottypes().hasOwnProperty(spottype)) {
					delete this.spottypes()[spottype];
				}
			},
			CreateSpot: function(spottype, args) {
				if (spottype && args &&
					this.spottypes().hasOwnProperty(spottype)) {
					if ('number' === typeof(args.spotnumber).toLowerCase() &&
						this.spottypes().hasOwnProperty(spottype) &&
						!this.spotlist().hasOwnProperty(args.spotnumber)) {
						this.spotlist()[args.spotnumber] = new this.spottypes()[spottype](args);
					}
				}
				return null;
			},
			DestroySpot: function(spottype, spotnumber) {
				if (spottype && 'number' === typeof(args.spotnumber).toLowerCase()) {
					if (this.spottypes().hasOwnProperty(spottype) &&
						this.spotlist().hasOwnProperty(spotnumber)) {
						delete this.spotlist()[spotnumber];
					}
				}
			}
		}
	});
}(GoCastJS || (GoCastJS = {})));