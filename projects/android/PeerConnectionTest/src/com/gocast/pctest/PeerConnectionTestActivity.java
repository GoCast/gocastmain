package com.gocast.pctest;

import android.app.Activity;
import android.widget.Button;
import android.widget.EditText;
import android.view.View;
import android.util.Log;
import android.os.Bundle;

public class PeerConnectionTestActivity extends Activity {
    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main);

        Button connectButton = (Button) findViewById(R.id.connect_button);
        connectButton.setOnClickListener(new View.OnClickListener() {
			public void onClick(View v) {
				EditText peerIpInput = (EditText) findViewById(R.id.peer_ip);
				Log.d("PC-TEST", peerIpInput.getText().toString());
			}
		});        
    }
}