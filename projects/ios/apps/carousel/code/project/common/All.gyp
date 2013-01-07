{
	'includes': [
		'common.gypi',
	], # includes

    'targets': [
    			{	# All
    				'target_name': 'All',
    				'type': 'none',
    				'dependencies': [
    					'Whiteboard.gyp:*',
    					'HelloWorld.gyp:*',
    				], # dependencies
    			},	# All

                ],
}
