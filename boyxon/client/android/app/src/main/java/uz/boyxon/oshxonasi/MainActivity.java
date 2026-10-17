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

    @Override
    public void onPause() {
        super.onPause();
        // Chromium cookie'ni diskka ~20-30 soniya kechikish bilan yozadi. Ilova fon
        // rejimiga o'tganda (yoki yopilishidan oldin) majburan yozamiz — aks holda
        // refresh cookie yo'qolib, qayta ochilganda sessiya tiklanmasligi mumkin.
        CookieManager.getInstance().flush();
    }
}
