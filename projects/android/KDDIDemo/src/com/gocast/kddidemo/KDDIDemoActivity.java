package com.gocast.kddidemo;

import android.app.Activity;
import android.os.Bundle;
import android.os.AsyncTask;
import android.util.Log;
import android.text.format.Formatter;
import android.net.wifi.WifiManager;
import android.view.SurfaceView;
import android.widget.TextView;

public class KDDIDemoActivity extends Activity {
    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main);
        
        new AsyncStartTask().execute();
    }
    
    @Override
    public void onStop() {
    	super.onStop();
    	stop();
    	deinit();
    	finish();
    }
    
    public native boolean init();
    public native boolean deinit();
    public native boolean start(final String localIp, SurfaceView [] views);
    public native boolean stop();

    private String localIp;
    
    private class AsyncStartTask extends AsyncTask<Void, Void, Void> {
    	protected Void doInBackground(Void... arg) {
    		localIp = getLocalIp();
    		return null;
    	}
    	
    	protected void onPostExecute(Void result) {
    		String [] viewLabelValues = new String[3];
    		viewLabelValues[0] = "moto xoom";
    		viewLabelValues[1] = "acer iconia";
    		viewLabelValues[2] = "google nexus";
    		
    		String [] participantIps = new String[3];
    		participantIps[0] = "192.168.20.101";
    		participantIps[1] = "192.168.20.104";
    		participantIps[2] = "192.168.20.102";
    		
    		TextView [] viewLabels = new TextView[3];
    		viewLabels[0] = (TextView) findViewById(R.id.localViewLabel);
    		viewLabels[1] = (TextView) findViewById(R.id.remoteViewLabel0);
    		viewLabels[2] = (TextView) findViewById(R.id.remoteViewLabel1);    		
    		
    		int viewLabelIdx = 1;
    		for(int i=0; i<3; i++) {
    			if(!localIp.equals(participantIps[i])) {
    				Log.d("KDDIDEMO-SDK", participantIps[i]);
    				viewLabels[viewLabelIdx++].setText(viewLabelValues[i]);
    			}
    		}
    		
    		SurfaceView [] views = new SurfaceView[3];
    		views[0] = (SurfaceView) findViewById(R.id.localView);
    		views[1] = (SurfaceView) findViewById(R.id.remoteView0);
    		views[2] = (SurfaceView) findViewById(R.id.remoteView1);
    		
    		
    		init();
    		start(localIp, views);
    	}
    }
    
    private String getLocalIp() {
    	String localIp = "";
    	try {
    		WifiManager wifi = (WifiManager) getSystemService(WIFI_SERVICE);
    		localIp = Formatter.formatIpAddress(wifi.getConnectionInfo().getIpAddress());
    		Log.d("KDDIDEMO-SDK", localIp);
    	} catch(Exception e) {
    		Log.e("KDDIDEMO-SDK", e.toString());
    	}
    	
    	return localIp;
    }
    
    static {
    	System.loadLibrary("webrtc_audio_preprocessing");
    	System.loadLibrary("webrtc");
    	System.loadLibrary("android-kddidemo");
    }

}