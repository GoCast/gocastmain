package com.gocast.kddidemo;

import android.app.Activity;
import android.os.Bundle;
import android.view.SurfaceView;

public class KDDIDemoActivity extends Activity {
    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main);
        
        /*Button connectButton = (Button) findViewById(R.id.connect_button);
        connectButton.setOnClickListener(new View.OnClickListener() {
			public void onClick(View v) {
				EditText destIpInput = (EditText) findViewById(R.id.dest_ip);
				EditText destPortInput = (EditText) findViewById(R.id.dest_port);
				EditText localPortInput = (EditText) findViewById(R.id.local_port);
				
				connect(destIpInput.getText().toString(),
						Integer.parseInt(destPortInput.getText().toString()),
						Integer.parseInt(localPortInput.getText().toString()));
			}
		});
        
        Button disconnectButton = (Button) findViewById(R.id.disconnect_button);
        disconnectButton.setOnClickListener(new View.OnClickListener() {
			public void onClick(View v) {
				disconnect();
			}
		});*/
        
        localRenderTestStart((SurfaceView) findViewById(R.id.localView));
    }
    
    @Override
    public void onStop() {
    	super.onStop();
    	//disconnect();
    	//KDDIDemoActivity.deinit();
    	localRenderTestStop();
    	finish();
    }
    
    public static native boolean init();
    public static native boolean deinit();
    public native boolean connect(final String destIp, final int destPort, final int localPort);
    public native boolean disconnect();
    public native boolean localRenderTestStart(SurfaceView localView);
    public native boolean localRenderTestStop();
    
    static {
    	System.loadLibrary("webrtc_audio_preprocessing");
    	System.loadLibrary("webrtc");
    	System.loadLibrary("android-kddidemo");
    	//init();
    }

}