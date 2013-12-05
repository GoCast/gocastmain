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
    					'ErizoClient.gyp:*',
    					'HUDDemo.gyp:*',
    					'MemoApp.gyp:*',
    					'GoCastTalk.gyp:*',
    				], # dependencies

    			},	# All

                ],
}
