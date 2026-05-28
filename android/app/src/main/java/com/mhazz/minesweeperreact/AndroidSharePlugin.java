package com.mhazz.minesweeperreact;

import android.content.Intent;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "AndroidShare")
public class AndroidSharePlugin extends Plugin {
    private String sharedText;

    @Override
    public void load() {
        handleShareIntent(getActivity().getIntent(), false);
    }

    @Override
    protected void handleOnNewIntent(Intent intent) {
        handleShareIntent(intent, true);
    }

    @PluginMethod
    public void getSharedText(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("text", sharedText);
        call.resolve(ret);
    }

    @PluginMethod
    public void clearSharedText(PluginCall call) {
        sharedText = null;
        call.resolve();
    }

    private void handleShareIntent(Intent intent, boolean notify) {
        if (intent == null || !Intent.ACTION_SEND.equals(intent.getAction())) {
            return;
        }

        String type = intent.getType();

        if (type == null || !type.startsWith("text/")) {
            return;
        }

        String nextSharedText = intent.getStringExtra(Intent.EXTRA_TEXT);

        if (nextSharedText == null || nextSharedText.trim().isEmpty()) {
            return;
        }

        sharedText = nextSharedText.trim();

        if (notify) {
            JSObject ret = new JSObject();
            ret.put("text", sharedText);
            notifyListeners("shareReceived", ret, true);
        }
    }
}
