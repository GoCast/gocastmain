package com.gocast.pctest;

import android.app.Activity;
import android.widget.Button;
import android.widget.EditText;
import android.view.View;
import android.os.Bundle;
import android.os.AsyncTask;
import java.lang.Void;

public class PeerConnectionTestActivity extends Activity {
    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main);
        new AsyncObserverTask().execute();
        
        Button connectButton = (Button) findViewById(R.id.connect_button);
        connectButton.setOnClickListener(new View.OnClickListener() {
			public void onClick(View v) {
				EditText peerNameInput = (EditText) findViewById(R.id.peer_name);
				signin(peerNameInput.getText().toString()); 
			}
		});
        
        Button disconnectButton = (Button) findViewById(R.id.disconnect_button);
        disconnectButton.setOnClickListener(new View.OnClickListener() {
			public void onClick(View v) {				
				signout();
			}
		});
        
        Button callButton = (Button) findViewById(R.id.call_button);
        callButton.setOnClickListener(new View.OnClickListener() {
			public void onClick(View v) {
				EditText callPeerIdInput = (EditText) findViewById(R.id.call_peer_id);
				call(callPeerIdInput.getText().toString());
			}
		});
        
        Button hangupButton = (Button) findViewById(R.id.hangup_button);
        hangupButton.setOnClickListener(new View.OnClickListener() {
			public void onClick(View v) {
				hangup();
			}
		});
    }
    
    private class AsyncObserverTask extends AsyncTask<Void, Void, Void> {
    	protected Void doInBackground(Void... arg) {
    		pcObserverWorker();
    		return null;
    	}
    }
    
    public native boolean signin(final String userName);
    public native boolean signout();
    public native boolean call(final String peerId);
    public native boolean hangup();
    public native void pcObserverWorker();
    
    static {
    	System.loadLibrary("json");
    	System.loadLibrary("webrtc_audio_preprocessing");
    	System.loadLibrary("webrtc");
    	System.loadLibrary("android-peerconnection-test");
    }
}