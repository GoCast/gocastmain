{
	'includes': [
		'common.gypi',
	], # includes

    'targets': [
    			{	# All
    				'target_name': 'All',
    				'type': 'none',

    				'dependencies': [
    					'AppRTCDemo.gyp:*',
    					'AudioDemo.gyp:*',
    					'HUDDemo.gyp:*',
    				], # dependencies

    			},	# All

                ],
}
