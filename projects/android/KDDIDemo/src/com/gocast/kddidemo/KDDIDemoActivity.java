package com.gocast.kddidemo;

import android.app.Activity;
import android.os.Bundle;
import android.os.AsyncTask;
import android.util.Log;
import android.text.format.Formatter;
import android.net.wifi.WifiManager;
import android.view.SurfaceView;

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
    public native boolean start(final String localIp, SurfaceView remoteView);
    public native boolean stop();

    private String localIp;
    
    private class AsyncStartTask extends AsyncTask<Void, Void, Void> {
    	protected Void doInBackground(Void... arg) {
    		localIp = getLocalIp();
    		return null;
    	}
    	
    	protected void onPostExecute(Void result) {
    		init();
    		start(localIp, (SurfaceView) findViewById(R.id.remoteView0));
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