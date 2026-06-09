#!/usr/bin/env python3
"""使用 OpenCV WeChatQRCode 扫描单张图片中的二维码/小程序码。"""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path
from urllib.request import urlretrieve


MODEL_FILES = {
    "detect.prototxt": "https://raw.githubusercontent.com/WeChatCV/opencv_3rdparty/a8b69ccc738421293254aec5ddb38bd523503252/detect.prototxt",
    "detect.caffemodel": "https://raw.githubusercontent.com/WeChatCV/opencv_3rdparty/a8b69ccc738421293254aec5ddb38bd523503252/detect.caffemodel",
    "sr.prototxt": "https://raw.githubusercontent.com/WeChatCV/opencv_3rdparty/a8b69ccc738421293254aec5ddb38bd523503252/sr.prototxt",
    "sr.caffemodel": "https://raw.githubusercontent.com/WeChatCV/opencv_3rdparty/a8b69ccc738421293254aec5ddb38bd523503252/sr.caffemodel",
}


def clamp(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(maximum, value))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("image_path")
    parser.add_argument("--json", action="store_true")
    parser.add_argument("--download-models", action="store_true")
    parser.add_argument("--model-dir")
    return parser.parse_args()


def emit(payload: dict, use_json: bool) -> int:
    if use_json:
        print(json.dumps(payload, ensure_ascii=False))
    else:
        print(payload)
    return 0


def resolve_model_dir(arg_value: str | None) -> Path:
    if arg_value:
        return Path(arg_value).expanduser().resolve()

    env_value = os.environ.get("WECHAT_QRCODE_MODEL_DIR")
    if env_value:
        return Path(env_value).expanduser().resolve()

    return (Path(__file__).resolve().parents[1] / ".cache" / "wechat-qrcode-models").resolve()


def ensure_models(model_dir: Path, allow_download: bool) -> tuple[bool, str | None]:
    model_dir.mkdir(parents=True, exist_ok=True)
    missing = [name for name in MODEL_FILES if not (model_dir / name).exists()]

    if not missing:
        return True, None

    if not allow_download:
        return False, f"missing model files: {', '.join(missing)}"

    for name in missing:
        urlretrieve(MODEL_FILES[name], model_dir / name)

    return True, None


def detect_sun_code_shape(cv2, image) -> tuple[bool, dict]:
    """识别微信小程序太阳码的图形特征，不依赖文本解码。"""

    height, width = image.shape[:2]
    max_side = max(width, height)
    scale = 560 / max_side if max_side > 560 else 1
    if scale != 1:
        image = cv2.resize(image, (round(width * scale), round(height * scale)), interpolation=cv2.INTER_AREA)

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (3, 3), 0)
    _, binary = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    image_area = binary.shape[0] * binary.shape[1]
    center_x = binary.shape[1] / 2
    center_y = binary.shape[0] / 2
    small_components = 0
    radial_components = 0
    finder_rings = 0
    dark_area = int(cv2.countNonZero(binary))

    for contour in contours:
        area = cv2.contourArea(contour)
        if area < image_area * 0.00005 or area > image_area * 0.16:
            continue

        x, y, w, h = cv2.boundingRect(contour)
        ratio = w / max(h, 1)
        fill = area / max(w * h, 1)
        component_center_x = x + w / 2
        component_center_y = y + h / 2
        distance_to_center = ((component_center_x - center_x) ** 2 + (component_center_y - center_y) ** 2) ** 0.5
        radius_ratio = distance_to_center / max(min(binary.shape[:2]) / 2, 1)

        if 0.45 <= ratio <= 2.25 and 0.08 <= fill <= 0.82:
            small_components += 1

        if radius_ratio >= 0.2 and 0.18 <= fill <= 0.72 and (ratio >= 1.65 or ratio <= 0.62):
            radial_components += 1

        perimeter = cv2.arcLength(contour, True)
        if perimeter <= 0:
            continue
        circularity = 4 * 3.141592653589793 * area / (perimeter * perimeter)
        if 0.72 <= ratio <= 1.28 and 0.24 <= fill <= 0.64 and circularity >= 0.42 and area >= image_area * 0.002:
            finder_rings += 1

    density = dark_area / image_area
    aspect_ratio = width / height
    aspect_score = clamp(1 - abs(aspect_ratio - 1) / 0.38, 0, 1)
    density_score = 1 if 0.035 <= density <= 0.42 else 0
    component_score = clamp(small_components / 80, 0, 1)
    radial_score = clamp(radial_components / 28, 0, 1)
    finder_score = clamp(finder_rings / 3, 0, 1)
    score = aspect_score * 24 + density_score * 12 + component_score * 22 + radial_score * 24 + finder_score * 18

    details = {
        "score": round(score, 2),
        "density": round(density, 4),
        "smallComponents": small_components,
        "radialComponents": radial_components,
        "finderRings": finder_rings,
        "width": width,
        "height": height,
    }
    return score >= 68 and aspect_score >= 0.72 and radial_components >= 12, details


def main() -> int:
    args = parse_args()
    image_path = Path(args.image_path).resolve()

    try:
        import cv2  # type: ignore
    except Exception as error:  # pragma: no cover
        return emit({
            "detected": False,
            "text": None,
            "backend": "opencv-python",
            "reason": f"cv2 unavailable: {error}",
        }, args.json)

    if not image_path.exists():
        return emit({
            "detected": False,
            "text": None,
            "backend": "opencv-python",
            "reason": f"image not found: {image_path}",
        }, args.json)

    detector = None
    detector_reason = None

    if args.download_models or args.model_dir or os.environ.get("WECHAT_QRCODE_MODEL_DIR"):
        model_dir = resolve_model_dir(args.model_dir)
        ok, model_error = ensure_models(model_dir, args.download_models)
        if not ok:
            return emit({
                "detected": False,
                "text": None,
                "backend": "opencv-python",
                "reason": model_error,
                "modelDir": str(model_dir),
            }, args.json)

        try:
            detector = cv2.wechat_qrcode_WeChatQRCode(
                str(model_dir / "detect.prototxt"),
                str(model_dir / "detect.caffemodel"),
                str(model_dir / "sr.prototxt"),
                str(model_dir / "sr.caffemodel"),
            )
        except Exception as error:
            return emit({
                "detected": False,
                "text": None,
                "backend": "opencv-python",
                "reason": f"failed to init WeChatQRCode: {error}",
                "modelDir": str(model_dir),
            }, args.json)

    if detector is None:
        try:
            detector = cv2.wechat_qrcode_WeChatQRCode()
        except Exception as error:
            detector_reason = str(error)

    if detector is None:
        return emit({
            "detected": False,
            "text": None,
            "backend": "opencv-python",
            "reason": detector_reason or "failed to init WeChatQRCode",
        }, args.json)

    image = cv2.imread(str(image_path))
    if image is None:
        return emit({
            "detected": False,
            "text": None,
            "backend": "opencv-python",
            "reason": "failed to read image",
        }, args.json)

    texts, _ = detector.detectAndDecode(image)
    first_text = next((text for text in texts if text), None)
    if first_text:
        return emit({
            "detected": True,
            "text": first_text,
            "backend": "opencv-python",
            "kind": "qrcode",
        }, args.json)

    detected_sun_code, details = detect_sun_code_shape(cv2, image)

    return emit({
        "detected": detected_sun_code,
        "text": None,
        "backend": "opencv-python",
        "kind": "wechat-miniprogram-code" if detected_sun_code else None,
        "details": details,
    }, args.json)


if __name__ == "__main__":
    sys.exit(main())
