package com.mhazz.minesweeperreact;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(AndroidSharePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
