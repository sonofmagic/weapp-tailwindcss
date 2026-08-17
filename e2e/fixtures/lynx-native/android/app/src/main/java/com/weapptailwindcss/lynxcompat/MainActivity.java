package com.weapptailwindcss.lynxcompat;

import android.app.Activity;
import android.os.Bundle;
import android.view.ViewGroup;
import com.lynx.tasm.LynxView;
import com.lynx.tasm.LynxViewBuilder;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;

public final class MainActivity extends Activity {
  private LynxView lynxView;

  @Override
  protected void onCreate(Bundle state) {
    super.onCreate(state);
    lynxView = new LynxViewBuilder().build(this);
    CompatibilityReporterModule.setLynxView(lynxView);
    setContentView(lynxView, new ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
    // 将 bundle 注入排到 Activity 首帧之后，避免 API 35 软件模拟器在 onCreate 内创建空 UI 树。
    lynxView.post(this::renderBundle);
  }

  private void renderBundle() {
    try (InputStream input = getAssets().open("main.lynx.bundle")) {
      lynxView.renderTemplateWithBaseUrl(readAllBytes(input), new HashMap<>(), "assets://main.lynx.bundle");
    } catch (IOException error) {
      CompatibilityReporterModule.writeFatal(this, error);
    }
  }

  private static byte[] readAllBytes(InputStream input) throws IOException {
    ByteArrayOutputStream output = new ByteArrayOutputStream();
    byte[] buffer = new byte[8192];
    int length;
    while ((length = input.read(buffer)) != -1) {
      output.write(buffer, 0, length);
    }
    return output.toByteArray();
  }

  @Override
  protected void onDestroy() {
    if (lynxView != null) {
      CompatibilityReporterModule.setLynxView(null);
      lynxView.destroy();
    }
    super.onDestroy();
  }
}
