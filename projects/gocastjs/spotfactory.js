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
				} else {
					if (!spottype) {
						throw 'GoCastJS.SpotFactory.RegisterSpot(): ' +
							  'spot type not provided.';
					} else if (!spotclass) {
						throw 'GoCastJS.SpotFactory.RegisterSpot(): ' +
							  'spot class constructor not provided.';
					} else {
						throw 'GoCastJS.SpotFactory.RegisterSpot(): ' +
							  'spot type [' + spottype + '] already exists.';
					}
				}
			},
			DeregisterSpot: function(spottype) {
				if (spottype && this.spottypes().hasOwnProperty(spottype)) {
					delete this.spottypes()[spottype];
				} else {
					if (!spottype) {
						throw 'GoCastJS.SpotFactory.DeregisterSpot(): ' +
							  'spot type not provided.';
					} else {
						throw 'GoCastJS.SpotFactory.DeregisterSpot(): ' +
							  'spot type [' + spottype + '] does not exist.';
					}
				}
			},
			CreateSpot: function(spottype, args) {
				if (spottype && args &&
					this.spottypes().hasOwnProperty(spottype)) {
					if (!isNaN(Number(args.spotnumber)) &&
						!this.spotlist().hasOwnProperty(args.spotnumber)) {
						args.spotnumber = Number(args.spotnumber);		// Ensure we're converted to number.
						this.spotlist()[args.spotnumber] = new (this.spottypes()[spottype])(args);
						return this.spotlist()[args.spotnumber];
					} else {
						if ('number' !== (typeof(args.spotnumber)).toLowerCase()) {
							throw 'GoCastJS.SpotFactory.CreateSpot(): ' +
								  'args.spotnumber does not exist or is of wrong type.';
						} else {
							throw 'GoCastJS.SpotFactory.CreateSpot(): ' +
								  'a spot with spot number [' + args.spotnumber + '] ' +
								  'already exists.';
						}
					}
				} else {
					if (!spottype) {
						throw 'GoCastJS.SpotFactory.CreateSpot(): ' +
							  'spot type not provided.';
					} else if (!args) {
						throw 'GoCastJS.SpotFactory.CreateSpot(): ' +
							  'args object not provided.';
					} else {
						throw 'GoCastJS.SpotFactory.CreateSpot(): ' +
							  'spot type [' + spottype + '] does not exist.';
					}
				}

				return null;
			},
			DestroySpot: function(spotnumber) {
				if ('number' === (typeof(spotnumber)).toLowerCase() &&
					this.spotlist().hasOwnProperty(spotnumber)) {
						delete this.spotlist()[spotnumber];
				} else {
					if ('number' !== (typeof(spotnumber)).toLowerCase()) {
						throw 'GoCastJS.SpotFactory.DestroySpot(): ' +
							  'spot number not provided or of wrong type.';
					} else {
						throw 'GoCastJS.SpotFactory.DestroySpot(): ' +
							  'spot with spot number [' + spotnumber + '] ' +
							  'does not exist.';
					}
				}
			}
		}
	});
}(GoCastJS || (GoCastJS = {})));