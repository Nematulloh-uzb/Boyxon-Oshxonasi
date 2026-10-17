package uz.boyxon.oshxonasi;

import android.os.Bundle;
import android.webkit.CookieManager;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Production API boshqa domenda (boyxon-server.onrender.com) bo'lgani uchun
        // WebView refresh cookie'ni "third-party" deb bloklaydi — Google kirishdan
        // keyin sessiya (sayt qayta ochilganda) tiklanmay qolmasligi uchun ruxsat beramiz.
        WebView webView = getBridge() != null ? getBridge().getWebView() : null;
        if (webView != null) {
            CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);
        }
    }
}
