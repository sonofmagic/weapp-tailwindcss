# taro-vite-react-tailwindcss-v4 CSS Output

Fixture: demo
Entry: taro-vite-react-tailwindcss-v4/dist/app.wxss

| Bytes | Selectors | @supports | :hover | Tailwind banner | System dark media | Manual dark selector | Raw arbitrary selector | Weapp escaped arbitrary selector |
| ---: | ---: | --- | --- | --- | --- | --- | --- | --- |
| 436023 | 2188 | false | false | false | true | true | false | true |

## Generator CSS Files

| # | File |
| ---: | --- |
| 1 | `app.wxss` |
| 2 | `app-origin.wxss` |
| 3 | `vendors.wxss` |
| 4 | `pages/index/index.wxss` |
| 5 | `sub-independent/pages/index.wxss` |
| 6 | `sub-normal/pages/index.wxss` |

## Generator CSS Summary

| File | Bytes | Selectors | @supports | :hover | Tailwind banner | System dark media | Manual dark selector | Raw arbitrary selector | Weapp escaped arbitrary selector |
| --- | ---: | ---: | --- | --- | --- | --- | --- | --- | --- |
| `app.wxss` | 51 | 0 | false | false | false | false | false | false | false |
| `app-origin.wxss` | 424654 | 2166 | false | false | false | true | true | false | true |
| `vendors.wxss` | 9525 | 36 | false | false | false | false | false | false | false |
| `pages/index/index.wxss` | 50 | 1 | false | false | false | false | false | false | false |
| `sub-independent/pages/index.wxss` | 937 | 6 | false | false | false | false | false | false | true |
| `sub-normal/pages/index.wxss` | 922 | 6 | false | false | false | false | false | false | true |

## Generator CSS

### app.wxss

```css
@import 'app-origin.wxss';
@import 'vendors.wxss';
```

### app-origin.wxss

```css
@charset "UTF-8";
@font-face {
  font-family: JDZH-Regular;
  src: url(data:font/ttf;charset=utf-8;base64,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FxYXByYnLgInARYzMj4BNxcGBCMiJwcnNyYCAS2YAetNUUaFgGA6y64BOcmJcY62lC4oNS6wHDIDCgoE/hVPUlihkymwVP6/0IV5arRue4cCk/7qmAPJGSRWfsR43wFdwisBGVz+3SUxPWFmRD8DCwkE/DUbN4VjZLbQMNFc22cBPgAAAAEAnv97BNUFkQAWAAABFSEVIRUhESMRITUhNSE1IQEzCQEzAQS0/mcBmf5nwf5nAZn+ZwFP/o7TAUkBStH+jwMSrMis/okBd6zIrAJ//ccCOf2BAAIAtgF5BEID+AADAAcAABMhFSERNSEVtgOM/HQDjAP4tv43tLQAAAAAABsBSgABAAAAAAAAADIAZgABAAAAAAABAAUArQABAAAAAAACAAcAwwABAAAAAAADABsBAwABAAAAAAAEAAQBNQABAAAAAAAFACEBfgABAAAAAAAGABABwgABAAAAAAAJAAAB2QABAAAAAAAQAAUB7gABAAAAAAARAAcCBAADAAEECQAAAGQAAAADAAEECQABABIAmQADAAEECQACAA4AswADAAEECQADADYAywADAAEECQAEABQBHwADAAEECQAFAEIBOgADAAEECQAGACABoAADAAEECQAJAAQB0wADAAEECQAQABIB2gADAAEECQARAA4B9AADAAEIBAAAAGQCDAADAAEIBAABABICcgADAAEIBAACAA4ChgADAAEIBAAEABQClgADAAEIBAAHAE4CrAADAAEIBAAQABIC/AADAAEIBAARAA4DEABDAG8AcAB5AHIAaQBnAGgAdAAoAGMAKQAgACAAQgBFAEkASgBJAE4ARwAgAEoASQBOAEcARABPAE4ARwAgAFQARQBDAEgATgBPAEwATwBHAFkAIABDAE8ALgAsACAATABUAEQAAENvcHlyaWdodChjKSAgQkVJSklORyBKSU5HRE9ORyBURUNITk9MT0dZIENPLiwgTFREAE6sThxrY57RACAAVgAyAC4AMwAAIFYyLjMAAFIAZQBnAHUAbABhAHIAAFJlZ3VsYXIAADIALgAwADAAMAA7AFUASwBXAE4AOwBKAEQAWgBIAFYAMgAuADMAXwBSAGUAZwB1AGwAYQByAAAyLjAwMDtVS1dOO0pEWkhWMi4zX1JlZ3VsYXIATqxOHGtjntEAVgAyAC4AM144icQAAFYyLjMAAFYAZQByAHMAaQBvAG4AIAAyAC4AMAAwADAAOwBHAGwAeQBwAGgAcwAgADMALgAxAC4AMQAgACgAMwAxADMANQApAABWZXJzaW9uIDIuMDAwO0dseXBocyAzLjEuMSAoMzEzNSkAAEoARABaAEgAVgAyAC4AMwBfAFIAZQBnAHUAbABhAHIAAEpEWkhWMi4zX1JlZ3VsYXIAlnZ0PAAAAE6sThxrY57RACAAVgAyAC4AMwAAIFYyLjMAAFIAZQBnAHUAbABhAHIAAFJlZ3VsYXIAAEMAbwBwAHkAcgBpAGcAaAB0ACgAYwApACAAIABCAEUASQBKAEkATgBHACAASgBJAE4ARwBEAE8ATgBHACAAVABFAEMASABOAE8ATABPAEcAWQAgAEMATwAuACwAIABMAFQARAAATqxOHGtjntEAIABWADIALgAzAAAAUgBlAGcAdQBsAGEAcgAATqxOHGtjntEAVgAyAC4AM144icQAAABCAHkAIABCAEUASQBKAEkATgBHACAASgBJAE4ARwBEAE8ATgBHACAAVABFAEMASABOAE8ATABPAEcAWQAgAEMATwAuACwAIABMAFQARAAATqxOHGtjntEAIABWADIALgAzAAAAUgBlAGcAdQBsAGEAcgAAAAAAAgAAAAAAAP8AAGYAAAAAAAAAAAAAAAAAAAAAAAAAAAArAAAAAQACAAMABAAHAAgACwAMAA4ADwAQABEAEgATABQAFQAWABcAGAAZABoAGwAcAB0AHgAgAIQAhQCWALYAtwC0ALUBAgEDAQQBBQEGAQcBCAEJAQoERXVybwd1bmkzMDEwB3VuaTMwMTEHdW5pNTE0Mwd1bmlGRjA0B3VuaUZGRTAHdW5pRkZFNQlzcGFjZS4wMDEJZXF1YWwuMDAxAAAAAAAAAf//AAIAAQAAAAwAAAAWAAAAAgABAAMAKgABAAQAAAACAAAAAAAAAAEAAAAA4p8rRgAAAADksiOUAAAAAOUAJYs=)
    format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: JDZH-Bold;
  src: url(data:font/ttf;charset=utf-8;base64,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NDc2JDMyFxMfAQMWFxYXByYnJicBFjMyNgGNPToBtCRAn2VjYANY6Fj+s9R0cWntbHyGXF0BSNB1bI4W15EWNTsm5hcaBA7+Sjouk8kCk2e+QwNaCElI4/56hbTLI8131WkBO77isLDDHwEUDG3+5BM1R06FMxwNDvykCoQAAAAAAQCm/3sFiwXjABYAAAEhFSEVIREhESE1ITUhNSEBIQkBIQEhBVz+QgG+/kL+9f5CAb7+QgFG/osBMwFAAT0BNf6JAUgCYoX8/poBZvyF/AKF/dkCJ/17AAIA+AFOBIMEIwADAAcAABMhFSERNSEV+AOL/HUDiwQj+v4l/PwAAAAAABsBSgABAAAAAAAAADIAZgABAAAAAAABAAoAtwABAAAAAAACAAcA0gABAAAAAAADABgBDAABAAAAAAAEAAQBOwABAAAAAAAFACEBhAABAAAAAAAGAA0BwgABAAAAAAAJAAAB1gABAAAAAAAQAAUB6wABAAAAAAARAAQB+wADAAEECQAAAGQAAAADAAEECQABABwAmQADAAEECQACAA4AwgADAAEECQADADAA2gADAAEECQAEABQBJQADAAEECQAFAEIBQAADAAEECQAGABoBpgADAAEECQAJAAQB0AADAAEECQAQABIB1wADAAEECQARAAgB8QADAAEIBAAAAGQCAAADAAEIBAABABwCZgADAAEIBAACAA4ChAADAAEIBAAEABQClAADAAEIBAAHAE4CqgADAAEIBAAQABIC+gADAAEIBAARAAgDDgBDAG8AcAB5AHIAaQBnAGgAdAAoAGMAKQAgACAAQgBFAEkASgBJAE4ARwAgAEoASQBOAEcARABPAE4ARwAgAFQARQBDAEgATgBPAEwATwBHAFkAIABDAE8ALgAsACAATABUAEQAAENvcHlyaWdodChjKSAgQkVJSklORyBKSU5HRE9ORyBURUNITk9MT0dZIENPLiwgTFREAE6sThxrY57RACAAVgAyAC4AMwAgAEIAbwBsAGQAACBWMi4zIEJvbGQAAFIAZQBnAHUAbABhAHIAAFJlZ3VsYXIAADIALgAwADAAMAA7AFUASwBXAE4AOwBKAEQAWgBIAFYAMgAuADMAXwBCAG8AbABkAAAyLjAwMDtVS1dOO0pEWkhWMi4zX0JvbGQATqxOHGtjntEAVgAyAC4AM3yXT1MAAFYyLjMAAFYAZQByAHMAaQBvAG4AIAAyAC4AMAAwADAAOwBHAGwAeQBwAGgAcwAgADMALgAxAC4AMQAgACgAMwAxADMANQApAABWZXJzaW9uIDIuMDAwO0dseXBocyAzLjEuMSAoMzEzNSkAAEoARABaAEgAVgAyAC4AMwBfAEIAbwBsAGQAAEpEWkhWMi4zX0JvbGQAlnZ0PAAAAE6sThxrY57RACAAVgAyAC4AMwAAIFYyLjMAAEIAbwBsAGQAAEJvbGQAAEMAbwBwAHkAcgBpAGcAaAB0ACgAYwApACAAIABCAEUASQBKAEkATgBHACAASgBJAE4ARwBEAE8ATgBHACAAVABFAEMASABOAE8ATABPAEcAWQAgAEMATwAuACwAIABMAFQARAAATqxOHGtjntEAIABWADIALgAzACAAQgBvAGwAZAAAAFIAZQBnAHUAbABhAHIAAE6sThxrY57RAFYAMgAuADN8l09TAAAAQgB5ACAAQgBFAEkASgBJAE4ARwAgAEoASQBOAEcARABPAE4ARwAgAFQARQBDAEgATgBPAEwATwBHAFkAIABDAE8ALgAsACAATABUAEQAAE6sThxrY57RACAAVgAyAC4AMwAAAEIAbwBsAGQAAAAAAAIAAAAAAAD/NABmAAAAAAAAAAAAAAAAAAAAAAAAAAAAKwAAAAEAAgADAAQABwAIAAsADAAOAA8AEAARABIAEwAUABUAFgAXABgAGQAaABsAHAAdAB4AIACEAIUAlgC2ALcAtAC1AQIBAwEEAQUBBgEHAQgBCQEKBEV1cm8HdW5pMzAxMAd1bmkzMDExB3VuaTUxNDMHdW5pRkYwNAd1bmlGRkUwB3VuaUZGRTUJc3BhY2UuMDAxCWVxdWFsLjAwMQAAAAAAAAH//wACAAEAAAAMAAAAFgAAAAIAAQADACoAAQAEAAAAAgAAAAAAAAABAAAAAOKfK0YAAAAA5LIkawAAAADlACWL)
    format('truetype');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
:root,
page {
  --nutui-brand-1: #ffebf1;
  --nutui-brand-2: #ffd6e1;
  --nutui-brand-3: #ffadbe;
  --nutui-brand-4: #ff8595;
  --nutui-brand-5: #ff5c67;
  --nutui-brand-6: #ff0f23;
  --nutui-brand-7: #e53029;
  --nutui-brand-8: #cc2c21;
  --nutui-brand-9: #992412;
  --nutui-brand-10: #661b08;
  --nutui-brand-11: #330f02;
  --nutui-brand-stop-1: #ff475d;
  --nutui-brand-stop-2: #ff0f23;
  --nutui-golden-1: #fff4e8;
  --nutui-golden-2: rgba(181, 105, 26, 0.02);
  --nutui-golden-3: rgba(181, 105, 26, 0.2);
  --nutui-golden-4: #b5691a;
  --nutui-golden-5: #ffe7cc;
  --nutui-golden-6: #ffd8ad;
  --nutui-golden-7: #664100;
  --nutui-golden-stop-1: #fff9f0;
  --nutui-golden-stop-2: #ffe3c2;
  --nutui-green-1: #ebfbeb;
  --nutui-green-2: #00d900;
  --nutui-green-3: #2aa32a;
  --nutui-red-1: #fff0f4;
  --nutui-red-2: #ffd6e1;
  --nutui-red-3: #ffadbe;
  --nutui-red-4: #ff8595;
  --nutui-red-5: #ff5c67;
  --nutui-red-6: #ff3333;
  --nutui-red-7: #e53029;
  --nutui-red-8: #cc2c21;
  --nutui-red-9: #992412;
  --nutui-red-10: #661b08;
  --nutui-red-11: #330f02;
  --nutui-yellow-1: #fff9e0;
  --nutui-yellow-2: #ffbf00;
  --nutui-yellow-3: #b26b00;
  --nutui-blue-1: #e5f5ff;
  --nutui-blue-2: #0073ff;
  --nutui-secondary-1: #14cc33;
  --nutui-gray-1: #ffffff;
  --nutui-gray-2: #f5f6fa;
  --nutui-gray-3: #f2f3f7;
  --nutui-gray-9: #f5f6fa;
  --nutui-gray-4: #c2c4cc;
  --nutui-gray-5: #828794;
  --nutui-gray-6: #3d414d;
  --nutui-gray-7: #171a26;
  --nutui-gray-8: #dadce0;
  --nutui-black-1: rgba(0, 0, 0, 0);
  --nutui-black-2: rgba(0, 0, 0, 0.02);
  --nutui-black-3: rgba(0, 0, 0, 0.08);
  --nutui-black-4: rgba(0, 0, 0, 0.1);
  --nutui-black-5: rgba(0, 0, 0, 0.2);
  --nutui-black-6: rgba(0, 0, 0, 0.3);
  --nutui-black-7: rgba(0, 0, 0, 0.4);
  --nutui-black-8: rgba(0, 0, 0, 0.5);
  --nutui-black-9: rgba(0, 0, 0, 0.6);
  --nutui-black-10: rgba(0, 0, 0, 0.7);
  --nutui-black-11: rgba(0, 0, 0, 0.8);
  --nutui-black-12: rgba(0, 0, 0, 0.9);
  --nutui-black-13: rgba(0, 0, 0, 1);
  --nutui-white-1: rgba(255, 255, 255, 0);
  --nutui-white-2: rgba(255, 255, 255, 0.02);
  --nutui-white-3: rgba(255, 255, 255, 0.05);
  --nutui-white-4: rgba(255, 255, 255, 0.1);
  --nutui-white-5: rgba(255, 255, 255, 0.2);
  --nutui-white-6: rgba(255, 255, 255, 0.3);
  --nutui-white-7: rgba(255, 255, 255, 0.4);
  --nutui-white-8: rgba(255, 255, 255, 0.5);
  --nutui-white-9: rgba(255, 255, 255, 0.6);
  --nutui-white-10: rgba(255, 255, 255, 0.7);
  --nutui-white-11: rgba(255, 255, 255, 0.8);
  --nutui-white-12: rgba(255, 255, 255, 0.9);
  --nutui-white-13: rgba(255, 255, 255, 1);
  --nutui-color-primary: var(--nutui-brand-6);
  --nutui-color-primary-stop-1: var(--nutui-brand-stop-1);
  --nutui-color-primary-stop-2: var(--nutui-brand-stop-2);
  --nutui-color-primary-text: var(--nutui-color-background-gray-1);
  --nutui-color-primary-pressed: var(--nutui-red-7);
  --nutui-color-primary-disabled: var(--nutui-color-content-gray-1);
  --nutui-color-primary-disabled-special: var(--nutui-red-3);
  --nutui-color-primary-light: var(--nutui-brand-1);
  --nutui-color-primary-light-pressed: var(--nutui-red-2);
  --nutui-color-service: var(--nutui-golden-1);
  --nutui-color-service-border-1: var(--nutui-golden-2);
  --nutui-color-service-border-2: var(--nutui-golden-3);
  --nutui-color-service-pressed: var(--nutui-golden-4);
  --nutui-color-service-text: var(--nutui-golden-4);
  --nutui-color-service-btn-bg: var(--nutui-golden-5);
  --nutui-color-service-btn-bg-pressed: var(--nutui-golden-6);
  --nutui-color-service-btn-text: var(--nutui-golden-7);
  --nutui-color-service-stop-1: var(--nutui-golden-stop-1);
  --nutui-color-service-stop-2: var(--nutui-golden-stop-2);
  --nutui-color-success: var(--nutui-green-2);
  --nutui-color-success-light: var(--nutui-green-1);
  --nutui-color-success-pressed: var(--nutui-green-3);
  --nutui-color-danger: var(--nutui-red-2);
  --nutui-color-danger-light: var(--nutui-red-1);
  --nutui-color-info: var(--nutui-blue-2);
  --nutui-color-info-light: var(--nutui-blue-1);
  --nutui-color-text-link: var(--nutui-blue-2);
  --nutui-color-warning: var(--nutui-yellow-2);
  --nutui-color-warning-light: var(--nutui-yellow-1);
  --nutui-color-warning-pressed: var(--nutui-yellow-3);
  --nutui-color-content-gray-1: var(--nutui-gray-4);
  --nutui-color-content-gray-2: var(--nutui-gray-5);
  --nutui-color-content-gray-3: var(--nutui-gray-6);
  --nutui-color-content-gray-4: var(--nutui-gray-7);
  --nutui-color-title: var(--nutui-color-content-gray-4);
  --nutui-color-text: var(--nutui-color-content-gray-3);
  --nutui-color-text-help: var(--nutui-color-content-gray-2);
  --nutui-color-text-disabled: var(--nutui-color-content-gray-1);
  --nutui-color-background-gray-1: var(--nutui-gray-1);
  --nutui-color-background-gray-2: var(--nutui-gray-2);
  --nutui-color-background-gray-3: var(--nutui-gray-3);
  --nutui-color-background-gray-4: var(--nutui-gray-9);
  --nutui-color-background: var(--nutui-color-background-gray-3);
  --nutui-color-background-overlay: var(--nutui-color-background-gray-1);
  --nutui-color-background-sunken: var(--nutui-color-background-gray-2);
  --nutui-color-background-component: var(--nutui-color-background-gray-4);
  --nutui-color-mask-gray-1: var(--nutui-black-2);
  --nutui-color-mask-gray-2: var(--nutui-black-7);
  --nutui-color-mask-gray-3: var(--nutui-black-10);
  --nutui-color-mask: var(--nutui-color-mask-gray-3);
  --nutui-color-mask-part: var(--nutui-color-mask-gray-2);
  --nutui-color-mask-fault-toleran: var(--nutui-color-mask-gray-1);
  --nutui-color-line-gray-1: var(--nutui-black-3);
  --nutui-color-border: var(--nutui-color-line-gray-1);
  --nutui-color-border-disabled: var(--nutui-color-content-gray-1);
  --nutui-font-size-8: 8rpx;
  --nutui-font-size-9: 9rpx;
  --nutui-font-size-10: 10rpx;
  --nutui-font-size-11: 11rpx;
  --nutui-font-size-12: 12rpx;
  --nutui-font-size-13: 13rpx;
  --nutui-font-size-14: 14rpx;
  --nutui-font-size-15: 15rpx;
  --nutui-font-size-16: 16rpx;
  --nutui-font-size-17: 17rpx;
  --nutui-font-size-18: 18rpx;
  --nutui-font-size-19: 19rpx;
  --nutui-font-size-20: 20rpx;
  --nutui-font-size-21: 21rpx;
  --nutui-font-size-22: 22rpx;
  --nutui-font-size-23: 23rpx;
  --nutui-font-size-24: 24rpx;
  --nutui-font-size-25: 25rpx;
  --nutui-font-size-26: 26rpx;
  --nutui-font-size-xxxs: var(--nutui-font-size-9);
  --nutui-font-size-xxs: var(--nutui-font-size-10);
  --nutui-font-size-xs: var(--nutui-font-size-11);
  --nutui-font-size-s: var(--nutui-font-size-12);
  --nutui-font-size-base: var(--nutui-font-size-14);
  --nutui-font-size-l: var(--nutui-font-size-15);
  --nutui-font-size-icon: var(--nutui-font-size-16);
  --nutui-font-size-xl: var(--nutui-font-size-18);
  --nutui-font-size-xxl: var(--nutui-font-size-24);
  --nutui-font-size-xxxl: var(--nutui-font-size-26);
  --nutui-font-weight-light: 300;
  --nutui-font-weight: 400;
  --nutui-font-weight-medium: 500;
  --nutui-font-weight-bold: 600;
  --nutui-line-height-base: 1.5;
  --nutui-text-align: left;
  --nutui-spacing-1: 1rpx;
  --nutui-spacing-2: 2rpx;
  --nutui-spacing-3: 3rpx;
  --nutui-spacing-4: 4rpx;
  --nutui-spacing-5: 5rpx;
  --nutui-spacing-6: 6rpx;
  --nutui-spacing-7: 7rpx;
  --nutui-spacing-8: 8rpx;
  --nutui-spacing-9: 9rpx;
  --nutui-spacing-10: 10rpx;
  --nutui-spacing-11: 11rpx;
  --nutui-spacing-12: 12rpx;
  --nutui-spacing-13: 13rpx;
  --nutui-spacing-14: 14rpx;
  --nutui-spacing-15: 15rpx;
  --nutui-spacing-16: 16rpx;
  --nutui-spacing-xxxs: var(--nutui-spacing-2);
  --nutui-spacing-xxs: var(--nutui-spacing-4);
  --nutui-spacing-xs: var(--nutui-spacing-6);
  --nutui-spacing-s: var(--nutui-spacing-7);
  --nutui-spacing-base: var(--nutui-spacing-8);
  --nutui-spacing-l: var(--nutui-spacing-9);
  --nutui-spacing-xl: var(--nutui-spacing-12);
  --nutui-spacing-xxl: var(--nutui-spacing-16);
  --nutui-radius-0: 0rpx;
  --nutui-radius-1: 1rpx;
  --nutui-radius-2: 2rpx;
  --nutui-radius-3: 3rpx;
  --nutui-radius-4: 4rpx;
  --nutui-radius-5: 5rpx;
  --nutui-radius-6: 6rpx;
  --nutui-radius-7: 7rpx;
  --nutui-radius-8: 8rpx;
  --nutui-radius-9: 9rpx;
  --nutui-radius-10: 10rpx;
  --nutui-radius-11: 11rpx;
  --nutui-radius-12: 12rpx;
  --nutui-radius-13: 13rpx;
  --nutui-radius-14: 14rpx;
  --nutui-radius-15: 15rpx;
  --nutui-radius-16: 16rpx;
  --nutui-radius-17: 17rpx;
  --nutui-radius-18: 18rpx;
  --nutui-radius-19: 19rpx;
  --nutui-radius-20: 20rpx;
  --nutui-radius-21: 21rpx;
  --nutui-radius-22: 22rpx;
  --nutui-radius-23: 23rpx;
  --nutui-radius-24: 24rpx;
  --nutui-radius-xxxs: var(--nutui-radius-0);
  --nutui-radius-xxs: var(--nutui-radius-2);
  --nutui-radius-xs: var(--nutui-radius-4);
  --nutui-radius-s: var(--nutui-radius-6);
  --nutui-radius-base: var(--nutui-radius-8);
  --nutui-radius-l: var(--nutui-radius-8);
  --nutui-radius-xl: var(--nutui-radius-12);
  --nutui-radius-xxl: var(--nutui-radius-14);
  --nutui-radius-xxxl: var(--nutui-radius-16);
}
@-webkit-keyframes nutFadeIn {
  0% {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@-webkit-keyframes nutFadeOut {
  0% {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
@-webkit-keyframes nutZoomIn {
  0% {
    opacity: 0;
    -webkit-transform: scale3d(0.3, 0.3, 0.3);
    transform: scale3d(0.3, 0.3, 0.3);
  }
  50% {
    opacity: 1;
  }
}
@-webkit-keyframes nutZoomOut {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0;
    -webkit-transform: scale3d(0.3, 0.3, 0.3);
    transform: scale3d(0.3, 0.3, 0.3);
  }
  to {
    opacity: 0;
  }
}
@-webkit-keyframes nutEaseIn {
  0% {
    opacity: 0;
    -webkit-transform: scale(0.9);
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    -webkit-transform: scale(1);
    transform: scale(1);
  }
}
@-webkit-keyframes nutEaseOut {
  0% {
    opacity: 1;
    -webkit-transform: scale(1);
    transform: scale(1);
  }
  to {
    opacity: 0;
    -webkit-transform: scale(0.9);
    transform: scale(0.9);
  }
}
@-webkit-keyframes nutDropIn {
  0% {
    opacity: 0;
    -webkit-transform: scaleY(0.8);
    transform: scaleY(0.8);
  }
  to {
    opacity: 1;
    -webkit-transform: scaleY(1);
    transform: scaleY(1);
  }
}
@-webkit-keyframes nutDropOut {
  0% {
    opacity: 1;
    -webkit-transform: scaleY(1);
    transform: scaleY(1);
  }
  to {
    opacity: 0;
    -webkit-transform: scaleY(0.8);
    transform: scaleY(0.8);
  }
}
@-webkit-keyframes nutJump {
  to {
    -webkit-transform: scale3d(0.8, 1, 0.9) translateY(-10rpx);
    transform: scale3d(0.8, 1, 0.9) translateY(-10rpx);
  }
}
@-webkit-keyframes nutJumpOne {
  50% {
    -webkit-transform: scale3d(0.8, 1, 0.9) translateY(-10rpx);
    transform: scale3d(0.8, 1, 0.9) translateY(-10rpx);
  }
  to {
    -webkit-transform: scaleZ(1) translateY(0);
    transform: scaleZ(1) translateY(0);
  }
}
@-webkit-keyframes nutBlink {
  0% {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@-webkit-keyframes nutBreathe {
  0%,
  to {
    -webkit-transform: scale(1);
    transform: scale(1);
  }
  50% {
    -webkit-transform: scale(1.2);
    transform: scale(1.2);
  }
}
@-webkit-keyframes nutFlash {
  0%,
  50%,
  to {
    opacity: 1;
  }
  25%,
  75% {
    opacity: 0;
  }
}
@-webkit-keyframes nutBounce {
  0%,
  20%,
  53%,
  to {
    -webkit-animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    -webkit-transform: translate3d(0, 0, 0);
    transform: translateZ(0);
  }
  40%,
  43% {
    -webkit-animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    -webkit-transform: translate3d(0, -30rpx, 0) scaleY(1.1);
    transform: translate3d(0, -30rpx, 0) scaleY(1.1);
  }
  70% {
    -webkit-animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    -webkit-transform: translate3d(0, -15rpx, 0) scaleY(1.05);
    transform: translate3d(0, -15rpx, 0) scaleY(1.05);
  }
  80% {
    -webkit-transition-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    transition-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    -webkit-transform: translate3d(0, 0, 0) scaleY(0.95);
    transform: translateZ(0) scaleY(0.95);
  }
  90% {
    -webkit-transform: translate3d(0, -4rpx, 0) scaleY(1.02);
    transform: translate3d(0, -4rpx, 0) scaleY(1.02);
  }
}
@keyframes nutBounce {
  0%,
  20%,
  53%,
  to {
    -webkit-animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    -webkit-transform: translate3d(0, 0, 0);
    transform: translateZ(0);
  }
  40%,
  43% {
    -webkit-animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    -webkit-transform: translate3d(0, -30rpx, 0) scaleY(1.1);
    transform: translate3d(0, -30rpx, 0) scaleY(1.1);
  }
  70% {
    -webkit-animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    -webkit-transform: translate3d(0, -15rpx, 0) scaleY(1.05);
    transform: translate3d(0, -15rpx, 0) scaleY(1.05);
  }
  80% {
    -webkit-transition-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    transition-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    -webkit-transform: translate3d(0, 0, 0) scaleY(0.95);
    transform: translateZ(0) scaleY(0.95);
  }
  90% {
    -webkit-transform: translate3d(0, -4rpx, 0) scaleY(1.02);
    transform: translate3d(0, -4rpx, 0) scaleY(1.02);
  }
}
@-webkit-keyframes nutShake {
  0% {
    -webkit-transform: translateX(0);
    transform: translate(0);
  }
  6.5% {
    -webkit-transform: translateX(-6rpx) rotateY(-9deg);
    transform: translate(-6rpx) rotateY(-9deg);
  }
  18.5% {
    -webkit-transform: translateX(5rpx) rotateY(7deg);
    transform: translate(5rpx) rotateY(7deg);
  }
  31.5% {
    -webkit-transform: translateX(-3rpx) rotateY(-5deg);
    transform: translate(-3rpx) rotateY(-5deg);
  }
  43.5% {
    -webkit-transform: translateX(2rpx) rotateY(3deg);
    transform: translate(2rpx) rotateY(3deg);
  }
  50% {
    -webkit-transform: translateX(0);
    transform: translate(0);
  }
}
@keyframes nutShake {
  0% {
    -webkit-transform: translateX(0);
    transform: translate(0);
  }
  6.5% {
    -webkit-transform: translateX(-6rpx) rotateY(-9deg);
    transform: translate(-6rpx) rotateY(-9deg);
  }
  18.5% {
    -webkit-transform: translateX(5rpx) rotateY(7deg);
    transform: translate(5rpx) rotateY(7deg);
  }
  31.5% {
    -webkit-transform: translateX(-3rpx) rotateY(-5deg);
    transform: translate(-3rpx) rotateY(-5deg);
  }
  43.5% {
    -webkit-transform: translateX(2rpx) rotateY(3deg);
    transform: translate(2rpx) rotateY(3deg);
  }
  50% {
    -webkit-transform: translateX(0);
    transform: translate(0);
  }
}
.nut-uploader-input {
  position: absolute !important;
  top: 0;
  left: 0;
  width: 100% !important;
  height: 100% !important;
  overflow: hidden;
  cursor: pointer;
  opacity: 0;
}
.nut-uploader-preview {
  position: relative;
  margin-right: var(--nutui-uploader-preview-margin-right, 10rpx);
  margin-bottom: var(--nutui-uploader-preview-margin-bottom, 10rpx);
  border-radius: var(--nutui-uploader-image-border-radius, 4rpx);
  -webkit-box-shadow: 0 2rpx 10rpx #0000001a;
  box-shadow: 0 2rpx 10rpx #0000001a;
}
.nut-uploader-preview.list {
  width: 100%;
  margin-right: 0;
  margin-bottom: 0;
  margin-top: 10rpx;
  -webkit-box-shadow: 0 2rpx 10rpx #00000003;
  box-shadow: 0 2rpx 10rpx #00000003;
}
.nut-uploader-preview-img-c {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  height: 100%;
  position: initial;
  border-radius: var(--nutui-uploader-image-border-radius, 4rpx);
}
.nut-tour-content-top {
  display: block;
  text-align: end;
}
@-webkit-keyframes rotation {
  0% {
    -webkit-transform: rotate(0deg);
  }
  to {
    -webkit-transform: rotate(360deg);
  }
}
@keyframes rotation {
  0% {
    -webkit-transform: rotate(0deg);
  }
  to {
    -webkit-transform: rotate(360deg);
  }
}
.nut-timepannel {
  padding: 0 16rpx;
  height: var(--nutui-timeselect-date-height, 40rpx);
  line-height: var(--nutui-timeselect-date-height, 40rpx);
  text-align: start;
  color: var(--nutui-color-text, #505259);
  font-size: var(--nutui-font-size-base, 14rpx);
}
.nut-tabs-titles-item-active .nut-tabs-titles-item-line {
  overflow: unset;
  content: ' ';
  width: var(--nutui-tabs-tab-line-width, 12rpx);
  height: var(--nutui-tabs-tab-line-height, 2rpx);
  background: var(--nutui-tabs-tab-line-color, var(--nutui-color-primary, #ff0f23));
}
.nut-tabs-titles-item-active .nut-tabs-titles-item-smile {
  overflow: unset;
  width: 40rpx;
  height: 20rpx;
}
.nut-tabs-vertical .nut-tabs-horizontal .nut-tabs-titles {
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  height: var(--nutui-tabs-titles-height, 44rpx);
  width: 100%;
  padding: 0 !important;
}
.nut-tabs-vertical .nut-tabs-horizontal .nut-tabs-titles-item-active {
  background-color: initial;
}
.nut-table-main-head-tr-alignleft,
.nut-table-main-head-tr-align,
.nut-table-main-body-tr-alignleft,
.nut-table-main-body-tr-align {
  text-align: start;
}
.nut-table-main-head-tr-alignright,
.nut-table-main-body-tr-alignright {
  text-align: end;
}
.nut-switch-button {
  position: absolute;
  top: 50%;
  -webkit-transform: translateY(-50%);
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  height: calc(var(--nutui-switch-height, 28rpx) - var(--nutui-switch-border-width, 2rpx) * 2);
  width: calc(var(--nutui-switch-height, 28rpx) - var(--nutui-switch-border-width, 2rpx) * 2);
  border-radius: var(--nutui-switch-inside-border-radius, 50%);
  background: #fff;
  -webkit-transition: left 0.3s linear;
  transition: left 0.3s linear;
  -webkit-box-shadow: var(--nutui-switch-inside-box-shadow, 0rpx 2rpx 6rpx 0rpx rgba(0, 0, 0, 0.1));
  box-shadow: var(--nutui-switch-inside-box-shadow, 0rpx 2rpx 6rpx 0rpx rgba(0, 0, 0, 0.1));
}
.nut-switch-button .nut-icon {
  width: calc((var(--nutui-switch-height, 28rpx) - var(--nutui-switch-border-width, 2rpx) * 2) / 2);
  height: calc((var(--nutui-switch-height, 28rpx) - var(--nutui-switch-border-width, 2rpx) * 2) / 2);
  color: var(--nutui-switch-active-disabled-background-color, var(--nutui-color-primary-disabled-special, #ffadbe));
}
.nut-switch-close-line {
  width: calc((var(--nutui-switch-height, 28rpx) - var(--nutui-switch-border-width, 2rpx) * 2) / 2);
  height: 2rpx;
  background: var(--nutui-switch-inactive-line-background-color, #ffffff);
  border-radius: 2rpx;
}
.nut-swipe-wrapper {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  -webkit-justify-content: flex-start;
  -ms-flex-pack: start;
  justify-content: flex-start;
  -webkit-align-self: stretch;
  -ms-flex-item-align: stretch;
  align-self: stretch;
  width: 100%;
  -webkit-transition-timing-function: cubic-bezier(0.18, 0.89, 0.32, 1);
  transition-timing-function: cubic-bezier(0.18, 0.89, 0.32, 1);
  -webkit-transition-property: -webkit-transform;
  transition-property: -webkit-transform;
  transition-property: transform;
  transition-property:
    transform,
    -webkit-transform;
}
.nut-steps-vertical-icon .nut-step-line {
  left: calc(var(--nutui-steps-vertical-item-icon-size, 20rpx) / 2);
}
.nut-steps-vertical-dot .nut-step-line {
  left: calc(var(--nutui-steps-base-head-dot-size, 6rpx) / 2);
}
.nut-steps-vertical-text .nut-step-line {
  left: calc(var(--nutui-steps-base-head-text-size, 12rpx) / 2);
}
.nut-space-horizontal-wrap {
  -webkit-flex-wrap: wrap;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
  margin-bottom: calc(var(--nutui-space-gap, 8rpx) * -1);
}
.nut-skeleton-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  background: -webkit-gradient(linear, left top, right top, from(#0000), color-stop(#00000005), to(#0000));
  background: -webkit-linear-gradient(left, #0000, #00000005, #0000);
  background: linear-gradient(90deg, #0000, #00000005, #0000);
  -webkit-animation-name: nut-skeleton;
  animation-name: nut-skeleton;
  -webkit-animation-delay: 0s;
  animation-delay: 0s;
  -webkit-animation-duration: 0.6s;
  animation-duration: 0.6s;
  -webkit-animation-direction: normal;
  animation-direction: normal;
  -webkit-animation-fill-mode: both;
  animation-fill-mode: both;
  -webkit-animation-play-state: running;
  animation-play-state: running;
  -webkit-animation-iteration-count: 1;
  animation-iteration-count: 1;
  -webkit-animation-timing-function: linear;
  animation-timing-function: linear;
}
@-webkit-keyframes nut-skeleton {
  0% {
    -webkit-transform: translate(-100%);
    transform: translate(-100%);
  }
  to {
    -webkit-transform: translate(100%);
    transform: translate(100%);
  }
}
@-webkit-keyframes nut-skeleton-rtl {
  0% {
    -webkit-transform: translate(100%);
    transform: translate(100%);
  }
  to {
    -webkit-transform: translate(-100%);
    transform: translate(-100%);
  }
}
.nut-safe-area-position-top {
  padding-top: calc(constant(safe-area-inset-top) * var(--nutui-safe-area-multiple, 1));
  padding-top: calc(env(safe-area-inset-top) * var(--nutui-safe-area-multiple, 1));
}
.nut-safe-area-position-bottom {
  padding-bottom: calc(constant(safe-area-inset-bottom) * var(--nutui-safe-area-multiple, 1));
  padding-bottom: calc(env(safe-area-inset-bottom) * var(--nutui-safe-area-multiple, 1));
}
.nut-range::before {
  position: absolute;
  inset-block: -8rpx;
  inset-inline: 0;
  content: '';
}
.nut-range-button {
  position: absolute;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  width: var(--nutui-range-button-width, 24rpx);
  height: var(--nutui-range-button-height, 24rpx);
  background: var(--nutui-range-button-background, #ffffff);
  border-radius: 50%;
  -webkit-box-shadow: 0 1rpx 2rpx #00000026;
  box-shadow: 0 1rpx 2rpx #00000026;
  border: var(--nutui-range-button-border, 1rpx solid var(--nutui-color-primary, #ff0f23));
  outline: none;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  top: 50%;
  left: 50%;
}
.nut-range-vertical-button-wrapper,
.nut-range-vertical-button-wrapper-right {
  position: absolute;
  top: initial;
  right: initial;
  top: 100%;
  left: 50%;
}
.nut-range-vertical-button-wrapper-left {
  top: 0;
  left: 50%;
  right: initial;
}
[dir='rtl'] .nut-range-button-wrapper,
[dir='rtl'] .nut-range-button-wrapper-right,
.rtl-nut-range-button-wrapper,
.rtl-nut-range-button-wrapper-right {
  left: 0;
  right: initial;
}
[dir='rtl'] .nut-range-button-wrapper-left,
.rtl-nut-range-button-wrapper-left,
[dir='rtl'] .nut-range-tick,
.rtl-nut-range-tick {
  right: 0;
  left: initial;
}
[dir='rtl'] .nut-range-vertical-button-wrapper,
[dir='rtl'] .nut-range-vertical-button-wrapper-right,
.rtl-nut-range-vertical-button-wrapper,
.rtl-nut-range-vertical-button-wrapper-right,
[dir='rtl'] .nut-range-vertical-button-wrapper-left,
.rtl-nut-range-vertical-button-wrapper-left {
  right: 50%;
  left: initial;
}
.nut-rate-item-half {
  position: absolute;
  height: 100%;
  width: 50% !important;
  left: 0;
  top: 0;
  overflow: hidden;
}
.nut-rate-item-large {
  margin-left: calc(var(--nutui-rate-item-margin, 4rpx) * 2);
}
.nut-rate-item-small {
  margin-left: calc(var(--nutui-rate-item-margin, 4rpx) / 2);
}
.nut-rate-score-large {
  font-size: calc(var(--nutui-rate-font-size, 12rpx) + 6rpx);
  padding-left: calc(var(--nutui-rate-item-margin, 4rpx) * 2);
}
.nut-rate-score-small {
  font-size: calc(var(--nutui-rate-font-size, 12rpx) - 2rpx);
  padding-left: calc(var(--nutui-rate-item-margin, 4rpx) / 2);
}
[dir='rtl'] .nut-rate-item-large,
.nut-rtl .nut-rate-item-large {
  margin-right: calc(var(--nutui-rate-item-margin, 4rpx) * 2);
}
[dir='rtl'] .nut-rate-score-large,
.nut-rtl .nut-rate-score-large {
  padding-right: calc(var(--nutui-rate-item-margin, 4rpx) * 2);
}
.nut-radio-icon-checked {
  color: var(--nutui-color-primary, #ff0f23);
  background-color: #fff;
  -webkit-box-shadow: 0 2rpx 4rpx #ff0f2333;
  box-shadow: 0 2rpx 4rpx #ff0f2333;
  border-radius: 50%;
}
@-webkit-keyframes progressActive {
  0% {
    background: #ffffff1a;
    width: 0;
  }
  20% {
    background: #ffffff80;
    width: 0;
  }
  to {
    background: #fff0;
    width: 100%;
  }
}
@keyframes progressActive {
  0% {
    background: #ffffff1a;
    width: 0;
  }
  20% {
    background: #ffffff80;
    width: 0;
  }
  to {
    background: #fff0;
    width: 100%;
  }
}
@-webkit-keyframes popup-scale-fade-in {
  0% {
    opacity: 0;
    -webkit-transform: scale(0.8);
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    -webkit-transform: scale(1);
    transform: scale(1);
  }
}
@-webkit-keyframes popup-scale-fade-out {
  0% {
    opacity: 1;
    -webkit-transform: scale(1);
    transform: scale(1);
  }
  to {
    opacity: 0;
    -webkit-transform: scale(0.8);
    transform: scale(0.8);
  }
}
@-webkit-keyframes popup-fade-in {
  0% {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@-webkit-keyframes popup-fade-out {
  0% {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
@-webkit-keyframes popup-slide-top-enter {
  0% {
    -webkit-transform: translate3d(0, -100%, 0);
    transform: translate3d(0, -100%, 0);
  }
  to {
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
  }
}
@-webkit-keyframes popup-slide-top-exit {
  to {
    -webkit-transform: translate3d(0, -100%, 0);
    transform: translate3d(0, -100%, 0);
  }
}
@-webkit-keyframes popup-slide-right-enter {
  0% {
    -webkit-transform: translate3d(100%, 0, 0);
    transform: translate3d(100%, 0, 0);
  }
  to {
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
  }
}
@-webkit-keyframes popup-slide-right-exit {
  to {
    -webkit-transform: translate3d(100%, 0, 0);
    transform: translate3d(100%, 0, 0);
  }
}
@-webkit-keyframes popup-slide-bottom-enter {
  0% {
    -webkit-transform: translate3d(0, 100%, 0);
    transform: translate3d(0, 100%, 0);
  }
  to {
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
  }
}
@-webkit-keyframes slide-bottom-exit {
  to {
    -webkit-transform: translate3d(0, 100%, 0);
    transform: translate3d(0, 100%, 0);
  }
}
@-webkit-keyframes popup-slide-left-enter {
  0% {
    -webkit-transform: translate3d(-100%, 0, 0);
    transform: translate3d(-100%, 0, 0);
  }
  to {
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
  }
}
@-webkit-keyframes popup-slide-left-exit {
  to {
    -webkit-transform: translate3d(-100%, 0, 0);
    transform: translate3d(-100%, 0, 0);
  }
}
.nut-popover .nut-popover-content {
  position: absolute;
  background: var(--nutui-popover-content-background-color, #ffffff);
  border-radius: var(--nutui-popover-border-radius, var(--nutui-radius-xs, 4rpx));
  font-size: var(--nutui-popover-font-size, var(--nutui-font-size-s, 12rpx));
  color: var(--nutui-popover-text-color, var(--nutui-color-mask, rgba(0, 0, 0, 0.7)));
  line-height: 28rpx;
  max-height: initial;
  overflow-y: initial;
}
.nut-pickerview {
  position: relative;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  width: 100%;
  height: calc(var(--nutui-picker-item-height, 36rpx) * 7);
  overflow: hidden;
}
.nut-pickerview-mask {
  top: 0;
  bottom: 0;
  background-image: var(
    --picker-mask-background,
    linear-gradient(180deg, var(--nutui-white-12), var(--nutui-white-7)),
    linear-gradient(0deg, var(--nutui-white-12), var(--nutui-white-7))
  );
  background-position: top, bottom;
  background-size: 100% calc((var(--nutui-picker-item-height, 36rpx) * 7 - var(--nutui-picker-item-height, 36rpx)) / 2);
  background-repeat: no-repeat;
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
}
.nut-pickerview-indicator {
  top: calc((var(--nutui-picker-item-height, 36rpx) * 7 - var(--nutui-picker-item-height, 36rpx)) / 2);
  height: var(--nutui-picker-item-height, 36rpx);
  border: var(--nutui-picker-item-active-line-border, 1rpx solid var(--nutui-color-border, rgba(0, 0, 0, 0.06)));
  border-left: 0;
  border-right: 0;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}
.nut-pickerview-list {
  position: relative;
  -webkit-flex: 1;
  -ms-flex: 1;
  flex: 1;
  height: calc(var(--nutui-picker-item-height, 36rpx) * 7);
  overflow: hidden;
  -ms-touch-action: none;
  touch-action: none;
}
.nut-pickerview-roller {
  position: absolute;
  top: calc((var(--nutui-picker-item-height, 36rpx) * 7 - var(--nutui-picker-item-height, 36rpx)) / 2);
  width: 100%;
  height: var(--nutui-picker-item-height, 36rpx);
  z-index: 1;
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
}
.nut-pickerview-roller-item {
  position: absolute;
  top: 0;
  backface-visibility: hidden;
  -moz-backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
@-webkit-keyframes nut-fade-in {
  0% {
    opacity: 0;
  }
  1% {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@-webkit-keyframes nut-fade-out {
  0% {
    opacity: 1;
  }
  1% {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
.nut-noticebar .nut-noticebar-box-center .nut-noticebar-box-wrap .nut-noticebar-box-wrap-content {
  position: relative;
  display: initial;
}
@-webkit-keyframes nut-notice-bar-play {
  to {
    -webkit-transform: translate3d(-100%, 0, 0);
    transform: translate3d(-100%, 0, 0);
  }
}
@-webkit-keyframes nut-notice-bar-play-infinite {
  to {
    -webkit-transform: translate3d(-100%, 0, 0);
    transform: translate3d(-100%, 0, 0);
  }
}
@-webkit-keyframes nut-notice-bar-play-vertical {
  to {
    -webkit-transform: translateY(var(--nutui-noticebar-height, 36rpx));
    transform: translateY(var(--nutui-noticebar-height, 36rpx));
  }
}
@-webkit-keyframes nut-notice-bar-play-rtl {
  to {
    -webkit-transform: translate3d(100%, 0, 0);
    transform: translate3d(100%, 0, 0);
  }
}
@-webkit-keyframes nut-notice-bar-play-infinite-rtl {
  to {
    -webkit-transform: translate3d(100%, 0, 0);
    transform: translate3d(100%, 0, 0);
  }
}
.nut-menu-placeholder-element {
  position: fixed;
  top: calc(-1 * var(--menu-bar-line-height));
  left: 0;
  right: 0;
  z-index: var(--nutui-menu-bar-opened-z-index, 1000);
  background-color: transparent;
}
.nut-menu-placeholder-element.up {
  bottom: calc(-1 * var(--menu-bar-line-height));
}
@-webkit-keyframes nut-loading-rotation {
  0% {
    -webkit-transform: rotate(0deg);
  }
  to {
    -webkit-transform: rotate(360deg);
  }
}
@keyframes nut-loading-rotation {
  0% {
    -webkit-transform: rotate(0deg);
  }
  to {
    -webkit-transform: rotate(360deg);
  }
}
.nut-inputnumber {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  display: -webkit-inline-flex;
  display: -ms-inline-flexbox;
  display: inline-flex;
  width: calc(2 * var(--nutui-inputnumber-input-margin, 0rpx) + 2 * var(--nutui-inputnumber-button-width, 20rpx) + var(--nutui-inputnumber-input-width, 26rpx));
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  background-color: var(--nutui-color-background, #f2f3f5);
  border-radius: var(--nutui-inputnumber-input-border-radius, 4rpx);
  overflow: hidden;
}
.nut-inputnumber-input::-webkit-outer-spin-button,
.nut-inputnumber-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}
.nut-indicator-line-active {
  -webkit-transition: -webkit-transform 0.3s ease-in-out;
  transition: -webkit-transform 0.3s ease-in-out;
  transition: transform 0.3s ease-in-out;
  transition:
    transform 0.3s ease-in-out,
    -webkit-transform 0.3s ease-in-out;
  background: var(--nutui-indicator-color, var(--nutui-color-primary, #ff0f23));
}
.nut-indicator-white .nut-indicator-dot,
.nut-indicator-white .nut-indicator-line {
  position: relative;
  -webkit-box-sizing: content-box;
  box-sizing: content-box;
  background: #fff6;
  opacity: 1;
}
.nut-indicator-track.nut-indicator-white::after {
  border: 1rpx solid rgba(0, 0, 0, 0.06);
  background: #fff6;
}
.nut-imagepreview-pop {
  width: 100%;
  height: 100%;
  max-width: 100% !important;
  background: transparent !important;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
}
.nut-form-item {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  line-height: unset;
}
.nut-form-item-label {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  font-size: var(--nutui-form-item-label-font-size, var(--nutui-font-size-s, 12rpx));
  font-weight: 400;
  width: var(--nutui-form-item-label-width, 90rpx);
  margin-right: var(--nutui-form-item-label-margin-right, 10rpx);
  -webkit-flex: 0 0 auto;
  -ms-flex: 0 0 auto;
  flex: 0 0 auto;
  word-wrap: break-word;
  text-align: var(--nutui-form-item-label-text-align, left);
  line-height: unset;
}
.nut-fixednav-btn {
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  position: absolute;
  z-index: var(--nutui-fixednav-index, 900);
  width: 70rpx;
  height: 100%;
  background: var(--nutui-fixednav-button-background, var(--nutui-color-primary, #ff0f23));
  -webkit-box-shadow: 0 2rpx 4rpx #0003;
  box-shadow: 0 2rpx 4rpx #0003;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
}
.nut-fixednav-list {
  position: absolute;
  -webkit-transition: all 0.5s;
  transition: all 0.5s;
  z-index: var(--nutui-fixednav-index, 900);
  -webkit-flex-shrink: 0;
  -ms-flex-negative: 0;
  flex-shrink: 0;
  height: 100%;
  background: var(--nutui-fixednav-background-color, #ffffff);
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-justify-content: space-between;
  -ms-flex-pack: justify;
  justify-content: space-between;
  -webkit-box-shadow: 2rpx 2rpx 8rpx #0003;
  box-shadow: 2rpx 2rpx 8rpx #0003;
}
[dir='rtl'] .nut-fixednav-list,
.nut-rtl .nut-fixednav-list {
  right: auto;
  left: 0;
  -webkit-transform: translate(-100%);
  -ms-transform: translate(-100%);
  transform: translate(-100%);
  border-radius: 0 25rpx 25rpx 0;
  -webkit-box-shadow: -2rpx 2rpx 8rpx #0003;
  box-shadow: -2rpx 2rpx 8rpx #0003;
  padding-right: 20rpx;
  padding-left: 80rpx;
}
.nut-drag {
  position: fixed;
  z-index: 9997 !important;
  width: 0;
  height: 0;
  -ms-touch-action: none;
  touch-action: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  font-size: 0;
}
.nut-dialog-outer {
  position: fixed;
  max-height: 100%;
  background-color: var(--nutui-dialog-background, var(--nutui-color-background-overlay, #ffffff));
  transition:
    transform 0.2s,
    -webkit-transform 0.2s;
  -webkit-overflow-scrolling: touch;
  top: 50%;
  left: 50%;
  -webkit-transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
  border-radius: var(--nutui-dialog-border-radius, var(--nutui-radius-xl, 12rpx));
  -webkit-animation-duration: 0.3s;
  animation-duration: 0.3s;
}
.nut-dialog-close {
  position: absolute !important;
  z-index: 1;
  cursor: pointer;
  width: var(--nutui-dialog-close-width, 16rpx);
  height: var(--nutui-dialog-close-height, 16rpx);
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  color: var(--nutui-dialog-close-color, #ffffff);
}
.nut-countup-listitem {
  height: var(--nutui-countup-height, 32rpx);
  overflow: hidden;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.nut-countup-number {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  width: var(--nutui-countup-width, auto);
  -webkit-transition: -webkit-transform 1s ease-in-out;
  transition: -webkit-transform 1s ease-in-out;
  transition: transform 1s ease-in-out;
  transition:
    transform 1s ease-in-out,
    -webkit-transform 1s ease-in-out;
  -webkit-transform: translate(0);
  -ms-transform: translate(0);
  transform: translate(0);
}
.nut-countdown-number::after,
.nut-countdown-number-primary::after {
  content: '';
  position: absolute;
  inset: -50%;
  -webkit-transform: scale(0.5);
  -ms-transform: scale(0.5);
  transform: scale(0.5);
  border-radius: calc(var(--nutui-countdown-number-border-radius, var(--nutui-radius-xxs, 2rpx)) * 2);
}
.nut-collapse-item-icon {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  position: absolute;
  top: 50%;
  left: 5rpx;
  -webkit-transform: translateY(-50%);
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
  -webkit-transform-origin: center;
  -ms-transform-origin: center;
  transform-origin: center;
  -webkit-transition: -webkit-transform 0.3s;
  transition: -webkit-transform 0.3s;
  transition: transform 0.3s;
  transition:
    transform 0.3s,
    -webkit-transform 0.3s;
}
.nut-checkbox-icon-wrap {
  font-size: 0rpx;
  line-height: 0rpx;
  border-radius: 50%;
  -webkit-box-shadow: 0 2rpx 4rpx #ff0f2333;
  box-shadow: 0 2rpx 4rpx #ff0f2333;
}
.nut-checkbox-icon-indeterminate {
  color: var(--nutui-color-primary, #ff0f23);
  background-color: #fff;
  -webkit-box-shadow: 0 2rpx 4rpx #ff0f2333;
  box-shadow: 0 2rpx 4rpx #ff0f2333;
  border-radius: 50%;
}
.nut-calendar-weeks {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: space-around;
  -ms-flex-pack: distribute;
  justify-content: space-around;
  height: 36rpx;
  border-radius: 0 0 12rpx 12rpx;
  -webkit-box-shadow: 0 4rpx 10rpx #0000000f;
  box-shadow: 0 4rpx 10rpx #0000000f;
}
.nut-calendar-day-active {
  background-color: var(--nutui-calendar-active-background-color, var(--nutui-color-primary, #ff0f23));
  color: #fff !important;
  border-radius: var(--nutui-calendar-day-active-border-radius, 4rpx);
}
.nut-calendar-day-choose-disabled {
  background-color: var(--nutui-calendar-choose-disable-background-color, rgba(191, 191, 191, 0.09));
  color: var(--nutui-calendar-disable-color, var(--nutui-color-text-disabled, #c2c4cc)) !important;
}
.nut-button {
  position: relative;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  display: inline-block;
  width: 80rpx;
  width: auto;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-flex-shrink: 0;
  -ms-flex-negative: 0;
  flex-shrink: 0;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  height: var(--nutui-button-default-height, 32rpx);
  font-size: var(--nutui-button-default-font-size, var(--nutui-font-size-base, 14rpx));
  font-weight: var(--nutui-font-weight, 400);
  text-align: center;
  cursor: pointer;
  -webkit-transition: opacity 0.2s;
  transition: opacity 0.2s;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -ms-touch-action: manipulation;
  touch-action: manipulation;
  -webkit-appearance: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  color: var(--nutui-button-default-color, var(--nutui-color-title, #1a1a1a));
  background: var(--nutui-button-default-background-color, transparent);
  border-width: var(--nutui-button-border-width, 0.5rpx);
}
.nut-button-wrap {
  height: 100%;
  width: 100%;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  background: initial;
}
@-webkit-keyframes moving {
  0% {
    -webkit-transform: translateX(100%);
  }
  to {
    -webkit-transform: translateX(var(--move-distance));
  }
}
@-webkit-keyframes moving-rtl {
  0% {
    -webkit-transform: translate(var(--move-distance));
    transform: translate(var(--move-distance));
  }
  to {
    -webkit-transform: translate(100%);
    transform: translate(100%);
  }
}
.nut-avatar-cropper-popup-highlight .highlight {
  position: absolute;
  left: 50%;
  top: 50%;
  -webkit-transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
  background-color: transparent;
  -webkit-box-shadow: 0 0 1000rpx 1000rpx #0009;
  box-shadow: 0 0 1000rpx 1000rpx #0009;
}
@-webkit-keyframes slide-right {
  0% {
    opacity: 0;
    -webkit-transform: translate(100%);
    transform: translate(100%);
  }
  to {
    opacity: 1;
    -webkit-transform: translate(0);
    transform: translate(0);
  }
}
@-webkit-keyframes slide-left {
  0% {
    opacity: 0;
    -webkit-transform: translate(-100%);
    transform: translate(-100%);
  }
  to {
    opacity: 1;
    -webkit-transform: translate(0);
    transform: translate(0);
  }
}
@-webkit-keyframes slide-top {
  0% {
    opacity: 0;
    -webkit-transform: translateY(-100%);
    transform: translateY(-100%);
  }
  to {
    opacity: 1;
    -webkit-transform: translateY(0);
    transform: translateY(0);
  }
}
@-webkit-keyframes slide-bottom {
  0% {
    opacity: 0;
    -webkit-transform: translateY(100%);
    transform: translateY(100%);
  }
  to {
    opacity: 1;
    -webkit-transform: translateY(0);
    transform: translateY(0);
  }
}
@-webkit-keyframes shake {
  0%,
  to {
    -webkit-transform: translate(0);
    transform: translate(0);
  }
  10% {
    -webkit-transform: translate(-9rpx);
    transform: translate(-9rpx);
  }
  20% {
    -webkit-transform: translate(8rpx);
    transform: translate(8rpx);
  }
  30% {
    -webkit-transform: translate(-7rpx);
    transform: translate(-7rpx);
  }
  40% {
    -webkit-transform: translate(6rpx);
    transform: translate(6rpx);
  }
  50% {
    -webkit-transform: translate(-5rpx);
    transform: translate(-5rpx);
  }
  60% {
    -webkit-transform: translate(4rpx);
    transform: translate(4rpx);
  }
  70% {
    -webkit-transform: translate(-3rpx);
    transform: translate(-3rpx);
  }
  80% {
    -webkit-transform: translate(2rpx);
    transform: translate(2rpx);
  }
  90% {
    -webkit-transform: translate(-1rpx);
    transform: translate(-1rpx);
  }
}
@-webkit-keyframes ripple {
  0% {
    -webkit-transform: scale(1);
    transform: scale(1);
  }
  50% {
    -webkit-transform: scale(1.1);
    transform: scale(1.1);
  }
}
@-webkit-keyframes breath {
  0%,
  to {
    -webkit-transform: scale(1);
    transform: scale(1);
  }
  50% {
    -webkit-transform: scale(1.1);
    transform: scale(1.1);
  }
}
@-webkit-keyframes twinkle {
  0% {
    -webkit-transform: scale(0);
    transform: scale(0);
  }
  20% {
    opacity: 1;
  }
  50%,
  to {
    -webkit-transform: scale(1.4);
    transform: scale(1.4);
    opacity: 0;
  }
}
.nut-animate .nut-animate-flicker::after {
  width: 100rpx;
  height: 60rpx;
  position: absolute;
  left: 0;
  top: 0;
  opacity: 0.73;
  content: '';
  background-image: -webkit-linear-gradient(344deg, #e8e0ff00 24%, #e8e0ff 91%);
  background-image: linear-gradient(106deg, #e8e0ff00 24%, #e8e0ff 91%);
  -webkit-animation: flicker 1.5s linear infinite;
  animation: flicker 1.5s linear infinite;
  -webkit-transform: skew(-20deg);
  -ms-transform: skew(-20deg);
  transform: skew(-20deg);
  -webkit-filter: blur(3rpx);
  filter: blur(3rpx);
}
@-webkit-keyframes flicker {
  0% {
    -webkit-transform: translate(-100rpx) skew(-20deg);
    transform: translate(-100rpx) skew(-20deg);
  }
  40%,
  to {
    -webkit-transform: translate(150rpx) skew(-20deg);
    transform: translate(150rpx) skew(-20deg);
  }
}
@-webkit-keyframes jump {
  0% {
    -webkit-transform: rotate(0) translateY(0);
    transform: rotate(0) translateY(0);
  }
  25% {
    -webkit-transform: rotate(10deg) translateY(20rpx);
    transform: rotate(10deg) translateY(20rpx);
  }
  50% {
    -webkit-transform: rotate(0) translateY(-10rpx);
    transform: rotate(0) translateY(-10rpx);
  }
  75% {
    -webkit-transform: rotate(-10deg) translateY(20rpx);
    transform: rotate(-10deg) translateY(20rpx);
  }
  to {
    -webkit-transform: rotate(0) translateY(0);
    transform: rotate(0) translateY(0);
  }
}
@-webkit-keyframes float-pop {
  0% {
    top: 0;
  }
  25% {
    top: 1rpx;
  }
  50% {
    top: 4rpx;
  }
  75% {
    top: 1rpx;
  }
  to {
    top: 0;
  }
}
.nut-actionsheet-cancel-disabled,
.nut-actionsheet-item-disabled {
  color: var(--nutui-color-text-disabled, #c2c4cc) !important;
  cursor: not-allowed;
}
view,
text,
::after,
::before {
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  border: 0 solid;
  --tw-gradient-position: initial;
  --tw-gradient-from: #0000;
  --tw-gradient-to: #0000;
  --tw-gradient-stops: initial;
  --tw-gradient-from-position: 0%;
  --tw-gradient-to-position: 100%;
}
:host,
page,
.tw-root,
wx-root-portal-content {
  --color-slate-100: #f1f5f9;
  --color-zinc-950: #09090b;
  --font-sans:
    ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
    'Noto Color Emoji';
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  --color-slate-900: rgb(15, 23, 43);
  --color-white: #fff;
  --color-purple-300: rgb(216, 180, 255);
  --color-zinc-50: rgb(250, 250, 250);
  --color-zinc-900: rgb(24, 24, 27);
  --spacing: 8rpx;
  --default-font-family: var(--font-sans);
  --default-mono-font-family: var(--font-mono);
  --nutui-brand-1: #ffebf1;
  --nutui-brand-2: #ffd6e1;
  --nutui-brand-3: #ffadbe;
  --nutui-brand-4: #ff8595;
  --nutui-brand-5: #ff5c67;
  --nutui-brand-6: #ff0f23;
  --nutui-brand-7: #e53029;
  --nutui-brand-8: #cc2c21;
  --nutui-brand-9: #992412;
  --nutui-brand-10: #661b08;
  --nutui-brand-11: #330f02;
  --nutui-brand-stop-1: #ff475d;
  --nutui-brand-stop-2: #ff0f23;
  --nutui-golden-1: #fff4e8;
  --nutui-golden-2: rgba(181, 105, 26, 0.02);
  --nutui-golden-3: rgba(181, 105, 26, 0.2);
  --nutui-golden-4: #b5691a;
  --nutui-golden-5: #ffe7cc;
  --nutui-golden-6: #ffd8ad;
  --nutui-golden-7: #664100;
  --nutui-golden-stop-1: #fff9f0;
  --nutui-golden-stop-2: #ffe3c2;
  --nutui-green-1: #ebfbeb;
  --nutui-green-2: #00d900;
  --nutui-green-3: #2aa32a;
  --nutui-red-1: #fff0f4;
  --nutui-red-2: #ffd6e1;
  --nutui-red-3: #ffadbe;
  --nutui-red-4: #ff8595;
  --nutui-red-5: #ff5c67;
  --nutui-red-6: #ff3333;
  --nutui-red-7: #e53029;
  --nutui-red-8: #cc2c21;
  --nutui-red-9: #992412;
  --nutui-red-10: #661b08;
  --nutui-red-11: #330f02;
  --nutui-yellow-1: #fff9e0;
  --nutui-yellow-2: #ffbf00;
  --nutui-yellow-3: #b26b00;
  --nutui-blue-1: #e5f5ff;
  --nutui-blue-2: #0073ff;
  --nutui-secondary-1: #14cc33;
  --nutui-gray-1: #ffffff;
  --nutui-gray-2: #f5f6fa;
  --nutui-gray-3: #f2f3f7;
  --nutui-gray-9: #f5f6fa;
  --nutui-gray-4: #c2c4cc;
  --nutui-gray-5: #828794;
  --nutui-gray-6: #3d414d;
  --nutui-gray-7: #171a26;
  --nutui-gray-8: #dadce0;
  --nutui-black-1: rgba(0, 0, 0, 0);
  --nutui-black-2: rgba(0, 0, 0, 0.02);
  --nutui-black-3: rgba(0, 0, 0, 0.08);
  --nutui-black-4: rgba(0, 0, 0, 0.1);
  --nutui-black-5: rgba(0, 0, 0, 0.2);
  --nutui-black-6: rgba(0, 0, 0, 0.3);
  --nutui-black-7: rgba(0, 0, 0, 0.4);
  --nutui-black-8: rgba(0, 0, 0, 0.5);
  --nutui-black-9: rgba(0, 0, 0, 0.6);
  --nutui-black-10: rgba(0, 0, 0, 0.7);
  --nutui-black-11: rgba(0, 0, 0, 0.8);
  --nutui-black-12: rgba(0, 0, 0, 0.9);
  --nutui-black-13: rgba(0, 0, 0, 1);
  --nutui-white-1: rgba(255, 255, 255, 0);
  --nutui-white-2: rgba(255, 255, 255, 0.02);
  --nutui-white-3: rgba(255, 255, 255, 0.05);
  --nutui-white-4: rgba(255, 255, 255, 0.1);
  --nutui-white-5: rgba(255, 255, 255, 0.2);
  --nutui-white-6: rgba(255, 255, 255, 0.3);
  --nutui-white-7: rgba(255, 255, 255, 0.4);
  --nutui-white-8: rgba(255, 255, 255, 0.5);
  --nutui-white-9: rgba(255, 255, 255, 0.6);
  --nutui-white-10: rgba(255, 255, 255, 0.7);
  --nutui-white-11: rgba(255, 255, 255, 0.8);
  --nutui-white-12: rgba(255, 255, 255, 0.9);
  --nutui-white-13: rgba(255, 255, 255, 1);
  --nutui-color-primary: var(--nutui-brand-6);
  --nutui-color-primary-stop-1: var(--nutui-brand-stop-1);
  --nutui-color-primary-stop-2: var(--nutui-brand-stop-2);
  --nutui-color-primary-text: var(--nutui-color-background-gray-1);
  --nutui-color-primary-pressed: var(--nutui-red-7);
  --nutui-color-primary-disabled: var(--nutui-color-content-gray-1);
  --nutui-color-primary-disabled-special: var(--nutui-red-3);
  --nutui-color-primary-light: var(--nutui-brand-1);
  --nutui-color-primary-light-pressed: var(--nutui-red-2);
  --nutui-color-service: var(--nutui-golden-1);
  --nutui-color-service-border-1: var(--nutui-golden-2);
  --nutui-color-service-border-2: var(--nutui-golden-3);
  --nutui-color-service-pressed: var(--nutui-golden-4);
  --nutui-color-service-text: var(--nutui-golden-4);
  --nutui-color-service-btn-bg: var(--nutui-golden-5);
  --nutui-color-service-btn-bg-pressed: var(--nutui-golden-6);
  --nutui-color-service-btn-text: var(--nutui-golden-7);
  --nutui-color-service-stop-1: var(--nutui-golden-stop-1);
  --nutui-color-service-stop-2: var(--nutui-golden-stop-2);
  --nutui-color-success: var(--nutui-green-2);
  --nutui-color-success-light: var(--nutui-green-1);
  --nutui-color-success-pressed: var(--nutui-green-3);
  --nutui-color-danger: var(--nutui-red-2);
  --nutui-color-danger-light: var(--nutui-red-1);
  --nutui-color-info: var(--nutui-blue-2);
  --nutui-color-info-light: var(--nutui-blue-1);
  --nutui-color-text-link: var(--nutui-blue-2);
  --nutui-color-warning: var(--nutui-yellow-2);
  --nutui-color-warning-light: var(--nutui-yellow-1);
  --nutui-color-warning-pressed: var(--nutui-yellow-3);
  --nutui-color-content-gray-1: var(--nutui-gray-4);
  --nutui-color-content-gray-2: var(--nutui-gray-5);
  --nutui-color-content-gray-3: var(--nutui-gray-6);
  --nutui-color-content-gray-4: var(--nutui-gray-7);
  --nutui-color-title: var(--nutui-color-content-gray-4);
  --nutui-color-text: var(--nutui-color-content-gray-3);
  --nutui-color-text-help: var(--nutui-color-content-gray-2);
  --nutui-color-text-disabled: var(--nutui-color-content-gray-1);
  --nutui-color-background-gray-1: var(--nutui-gray-1);
  --nutui-color-background-gray-2: var(--nutui-gray-2);
  --nutui-color-background-gray-3: var(--nutui-gray-3);
  --nutui-color-background-gray-4: var(--nutui-gray-9);
  --nutui-color-background: var(--nutui-color-background-gray-3);
  --nutui-color-background-overlay: var(--nutui-color-background-gray-1);
  --nutui-color-background-sunken: var(--nutui-color-background-gray-2);
  --nutui-color-background-component: var(--nutui-color-background-gray-4);
  --nutui-color-mask-gray-1: var(--nutui-black-2);
  --nutui-color-mask-gray-2: var(--nutui-black-7);
  --nutui-color-mask-gray-3: var(--nutui-black-10);
  --nutui-color-mask: var(--nutui-color-mask-gray-3);
  --nutui-color-mask-part: var(--nutui-color-mask-gray-2);
  --nutui-color-mask-fault-toleran: var(--nutui-color-mask-gray-1);
  --nutui-color-line-gray-1: var(--nutui-black-3);
  --nutui-color-border: var(--nutui-color-line-gray-1);
  --nutui-color-border-disabled: var(--nutui-color-content-gray-1);
  --nutui-font-size-8: 8rpx;
  --nutui-font-size-9: 9rpx;
  --nutui-font-size-10: 10rpx;
  --nutui-font-size-11: 11rpx;
  --nutui-font-size-12: 12rpx;
  --nutui-font-size-13: 13rpx;
  --nutui-font-size-14: 14rpx;
  --nutui-font-size-15: 15rpx;
  --nutui-font-size-16: 16rpx;
  --nutui-font-size-17: 17rpx;
  --nutui-font-size-18: 18rpx;
  --nutui-font-size-19: 19rpx;
  --nutui-font-size-20: 20rpx;
  --nutui-font-size-21: 21rpx;
  --nutui-font-size-22: 22rpx;
  --nutui-font-size-23: 23rpx;
  --nutui-font-size-24: 24rpx;
  --nutui-font-size-25: 25rpx;
  --nutui-font-size-26: 26rpx;
  --nutui-font-size-xxxs: var(--nutui-font-size-9);
  --nutui-font-size-xxs: var(--nutui-font-size-10);
  --nutui-font-size-xs: var(--nutui-font-size-11);
  --nutui-font-size-s: var(--nutui-font-size-12);
  --nutui-font-size-base: var(--nutui-font-size-14);
  --nutui-font-size-l: var(--nutui-font-size-15);
  --nutui-font-size-icon: var(--nutui-font-size-16);
  --nutui-font-size-xl: var(--nutui-font-size-18);
  --nutui-font-size-xxl: var(--nutui-font-size-24);
  --nutui-font-size-xxxl: var(--nutui-font-size-26);
  --nutui-font-weight-light: 300;
  --nutui-font-weight: 400;
  --nutui-font-weight-medium: 500;
  --nutui-font-weight-bold: 600;
  --nutui-line-height-base: 1.5;
  --nutui-text-align: left;
  --nutui-spacing-1: 1rpx;
  --nutui-spacing-2: 2rpx;
  --nutui-spacing-3: 3rpx;
  --nutui-spacing-4: 4rpx;
  --nutui-spacing-5: 5rpx;
  --nutui-spacing-6: 6rpx;
  --nutui-spacing-7: 7rpx;
  --nutui-spacing-8: 8rpx;
  --nutui-spacing-9: 9rpx;
  --nutui-spacing-10: 10rpx;
  --nutui-spacing-11: 11rpx;
  --nutui-spacing-12: 12rpx;
  --nutui-spacing-13: 13rpx;
  --nutui-spacing-14: 14rpx;
  --nutui-spacing-15: 15rpx;
  --nutui-spacing-16: 16rpx;
  --nutui-spacing-xxxs: var(--nutui-spacing-2);
  --nutui-spacing-xxs: var(--nutui-spacing-4);
  --nutui-spacing-xs: var(--nutui-spacing-6);
  --nutui-spacing-s: var(--nutui-spacing-7);
  --nutui-spacing-base: var(--nutui-spacing-8);
  --nutui-spacing-l: var(--nutui-spacing-9);
  --nutui-spacing-xl: var(--nutui-spacing-12);
  --nutui-spacing-xxl: var(--nutui-spacing-16);
  --nutui-radius-0: 0rpx;
  --nutui-radius-1: 1rpx;
  --nutui-radius-2: 2rpx;
  --nutui-radius-3: 3rpx;
  --nutui-radius-4: 4rpx;
  --nutui-radius-5: 5rpx;
  --nutui-radius-6: 6rpx;
  --nutui-radius-7: 7rpx;
  --nutui-radius-8: 8rpx;
  --nutui-radius-9: 9rpx;
  --nutui-radius-10: 10rpx;
  --nutui-radius-11: 11rpx;
  --nutui-radius-12: 12rpx;
  --nutui-radius-13: 13rpx;
  --nutui-radius-14: 14rpx;
  --nutui-radius-15: 15rpx;
  --nutui-radius-16: 16rpx;
  --nutui-radius-17: 17rpx;
  --nutui-radius-18: 18rpx;
  --nutui-radius-19: 19rpx;
  --nutui-radius-20: 20rpx;
  --nutui-radius-21: 21rpx;
  --nutui-radius-22: 22rpx;
  --nutui-radius-23: 23rpx;
  --nutui-radius-24: 24rpx;
  --nutui-radius-xxxs: var(--nutui-radius-0);
  --nutui-radius-xxs: var(--nutui-radius-2);
  --nutui-radius-xs: var(--nutui-radius-4);
  --nutui-radius-s: var(--nutui-radius-6);
  --nutui-radius-base: var(--nutui-radius-8);
  --nutui-radius-l: var(--nutui-radius-8);
  --nutui-radius-xl: var(--nutui-radius-12);
  --nutui-radius-xxl: var(--nutui-radius-14);
  --nutui-radius-xxxl: var(--nutui-radius-16);
}
.mt-2 {
  margin-top: calc(var(--spacing) * 2);
}
.mt-4 {
  margin-top: calc(var(--spacing) * 4);
}
.h-14 {
  height: calc(var(--spacing) * 14);
}
.h-_b300px_B {
  height: 300rpx;
}
.rounded {
  border-radius: 8rpx;
}
.bg-_b_h123456_B {
  background-color: #123456;
}
.bg-_bred_B {
  background-color: red;
}
.bg-purple-300 {
  background-color: var(--color-purple-300);
}
.bg-white {
  background-color: var(--color-white);
}
.bg-linear-to-r,
.bg-gradient-to-r {
  --tw-gradient-position: to right;
  background-image: -webkit-linear-gradient(var(--tw-gradient-stops));
  background-image: linear-gradient(var(--tw-gradient-stops));
}
.from-cyan-500 {
  --tw-gradient-from: var(--color-cyan-500);
  --tw-gradient-stops:
    var(--tw-gradient-via-stops, var(--tw-gradient-position)), var(--tw-gradient-from) var(--tw-gradient-from-position, ), var(--tw-gradient-to) var(--tw-gradient-to-position, );
}
.to-blue-500 {
  --tw-gradient-to: var(--color-blue-500);
  --tw-gradient-stops:
    var(--tw-gradient-via-stops, var(--tw-gradient-position)), var(--tw-gradient-from) var(--tw-gradient-from-position, ), var(--tw-gradient-to) var(--tw-gradient-to-position, );
}
.px-3 {
  padding-left: calc(var(--spacing) * 3);
  padding-right: calc(var(--spacing) * 3);
}
.px-4 {
  padding-left: calc(var(--spacing) * 4);
  padding-right: calc(var(--spacing) * 4);
}
.py-2 {
  padding-top: calc(var(--spacing) * 2);
  padding-bottom: calc(var(--spacing) * 2);
}
.py-3 {
  padding-top: calc(var(--spacing) * 3);
  padding-bottom: calc(var(--spacing) * 3);
}
.text-_b55rpx_B {
  font-size: 55rpx;
}
.text-_b_hc31d6b_B {
  color: #c31d6b;
}
.text-_b_hfff_B {
  color: #fff;
}
.text-slate-900 {
  color: var(--color-slate-900);
}
.dark_cbg-zinc-900.theme-dark,
.theme-dark .dark_cbg-zinc-900 {
  background-color: var(--color-zinc-900);
}
.dark_cbg-zinc-950.theme-dark,
.theme-dark .dark_cbg-zinc-950 {
  background-color: var(--color-zinc-950);
}
.dark_ctext-zinc-50.theme-dark,
.theme-dark .dark_ctext-zinc-50 {
  color: var(--color-zinc-50);
}
@media (prefers-color-scheme: dark) {
  .system-dark_cbg-slate-900 {
    background-color: var(--color-slate-900);
  }
}
@media (prefers-color-scheme: dark) {
  .system-dark_ctext-slate-100 {
    color: var(--color-slate-100);
  }
}
@font-face {
  font-family: JDZH-Regular;
  src: url(data:font/ttf;charset=utf-8;base64,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FxYXByYnLgInARYzMj4BNxcGBCMiJwcnNyYCAS2YAetNUUaFgGA6y64BOcmJcY62lC4oNS6wHDIDCgoE/hVPUlihkymwVP6/0IV5arRue4cCk/7qmAPJGSRWfsR43wFdwisBGVz+3SUxPWFmRD8DCwkE/DUbN4VjZLbQMNFc22cBPgAAAAEAnv97BNUFkQAWAAABFSEVIRUhESMRITUhNSE1IQEzCQEzAQS0/mcBmf5nwf5nAZn+ZwFP/o7TAUkBStH+jwMSrMis/okBd6zIrAJ//ccCOf2BAAIAtgF5BEID+AADAAcAABMhFSERNSEVtgOM/HQDjAP4tv43tLQAAAAAABsBSgABAAAAAAAAADIAZgABAAAAAAABAAUArQABAAAAAAACAAcAwwABAAAAAAADABsBAwABAAAAAAAEAAQBNQABAAAAAAAFACEBfgABAAAAAAAGABABwgABAAAAAAAJAAAB2QABAAAAAAAQAAUB7gABAAAAAAARAAcCBAADAAEECQAAAGQAAAADAAEECQABABIAmQADAAEECQACAA4AswADAAEECQADADYAywADAAEECQAEABQBHwADAAEECQAFAEIBOgADAAEECQAGACABoAADAAEECQAJAAQB0wADAAEECQAQABIB2gADAAEECQARAA4B9AADAAEIBAAAAGQCDAADAAEIBAABABICcgADAAEIBAACAA4ChgADAAEIBAAEABQClgADAAEIBAAHAE4CrAADAAEIBAAQABIC/AADAAEIBAARAA4DEABDAG8AcAB5AHIAaQBnAGgAdAAoAGMAKQAgACAAQgBFAEkASgBJAE4ARwAgAEoASQBOAEcARABPAE4ARwAgAFQARQBDAEgATgBPAEwATwBHAFkAIABDAE8ALgAsACAATABUAEQAAENvcHlyaWdodChjKSAgQkVJSklORyBKSU5HRE9ORyBURUNITk9MT0dZIENPLiwgTFREAE6sThxrY57RACAAVgAyAC4AMwAAIFYyLjMAAFIAZQBnAHUAbABhAHIAAFJlZ3VsYXIAADIALgAwADAAMAA7AFUASwBXAE4AOwBKAEQAWgBIAFYAMgAuADMAXwBSAGUAZwB1AGwAYQByAAAyLjAwMDtVS1dOO0pEWkhWMi4zX1JlZ3VsYXIATqxOHGtjntEAVgAyAC4AM144icQAAFYyLjMAAFYAZQByAHMAaQBvAG4AIAAyAC4AMAAwADAAOwBHAGwAeQBwAGgAcwAgADMALgAxAC4AMQAgACgAMwAxADMANQApAABWZXJzaW9uIDIuMDAwO0dseXBocyAzLjEuMSAoMzEzNSkAAEoARABaAEgAVgAyAC4AMwBfAFIAZQBnAHUAbABhAHIAAEpEWkhWMi4zX1JlZ3VsYXIAlnZ0PAAAAE6sThxrY57RACAAVgAyAC4AMwAAIFYyLjMAAFIAZQBnAHUAbABhAHIAAFJlZ3VsYXIAAEMAbwBwAHkAcgBpAGcAaAB0ACgAYwApACAAIABCAEUASQBKAEkATgBHACAASgBJAE4ARwBEAE8ATgBHACAAVABFAEMASABOAE8ATABPAEcAWQAgAEMATwAuACwAIABMAFQARAAATqxOHGtjntEAIABWADIALgAzAAAAUgBlAGcAdQBsAGEAcgAATqxOHGtjntEAVgAyAC4AM144icQAAABCAHkAIABCAEUASQBKAEkATgBHACAASgBJAE4ARwBEAE8ATgBHACAAVABFAEMASABOAE8ATABPAEcAWQAgAEMATwAuACwAIABMAFQARAAATqxOHGtjntEAIABWADIALgAzAAAAUgBlAGcAdQBsAGEAcgAAAAAAAgAAAAAAAP8AAGYAAAAAAAAAAAAAAAAAAAAAAAAAAAArAAAAAQACAAMABAAHAAgACwAMAA4ADwAQABEAEgATABQAFQAWABcAGAAZABoAGwAcAB0AHgAgAIQAhQCWALYAtwC0ALUBAgEDAQQBBQEGAQcBCAEJAQoERXVybwd1bmkzMDEwB3VuaTMwMTEHdW5pNTE0Mwd1bmlGRjA0B3VuaUZGRTAHdW5pRkZFNQlzcGFjZS4wMDEJZXF1YWwuMDAxAAAAAAAAAf//AAIAAQAAAAwAAAAWAAAAAgABAAMAKgABAAQAAAACAAAAAAAAAAEAAAAA4p8rRgAAAADksiOUAAAAAOUAJYs=)
    format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: JDZH-Bold;
  src: url(data:font/ttf;charset=utf-8;base64,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NDc2JDMyFxMfAQMWFxYXByYnJicBFjMyNgGNPToBtCRAn2VjYANY6Fj+s9R0cWntbHyGXF0BSNB1bI4W15EWNTsm5hcaBA7+Sjouk8kCk2e+QwNaCElI4/56hbTLI8131WkBO77isLDDHwEUDG3+5BM1R06FMxwNDvykCoQAAAAAAQCm/3sFiwXjABYAAAEhFSEVIREhESE1ITUhNSEBIQkBIQEhBVz+QgG+/kL+9f5CAb7+QgFG/osBMwFAAT0BNf6JAUgCYoX8/poBZvyF/AKF/dkCJ/17AAIA+AFOBIMEIwADAAcAABMhFSERNSEV+AOL/HUDiwQj+v4l/PwAAAAAABsBSgABAAAAAAAAADIAZgABAAAAAAABAAoAtwABAAAAAAACAAcA0gABAAAAAAADABgBDAABAAAAAAAEAAQBOwABAAAAAAAFACEBhAABAAAAAAAGAA0BwgABAAAAAAAJAAAB1gABAAAAAAAQAAUB6wABAAAAAAARAAQB+wADAAEECQAAAGQAAAADAAEECQABABwAmQADAAEECQACAA4AwgADAAEECQADADAA2gADAAEECQAEABQBJQADAAEECQAFAEIBQAADAAEECQAGABoBpgADAAEECQAJAAQB0AADAAEECQAQABIB1wADAAEECQARAAgB8QADAAEIBAAAAGQCAAADAAEIBAABABwCZgADAAEIBAACAA4ChAADAAEIBAAEABQClAADAAEIBAAHAE4CqgADAAEIBAAQABIC+gADAAEIBAARAAgDDgBDAG8AcAB5AHIAaQBnAGgAdAAoAGMAKQAgACAAQgBFAEkASgBJAE4ARwAgAEoASQBOAEcARABPAE4ARwAgAFQARQBDAEgATgBPAEwATwBHAFkAIABDAE8ALgAsACAATABUAEQAAENvcHlyaWdodChjKSAgQkVJSklORyBKSU5HRE9ORyBURUNITk9MT0dZIENPLiwgTFREAE6sThxrY57RACAAVgAyAC4AMwAgAEIAbwBsAGQAACBWMi4zIEJvbGQAAFIAZQBnAHUAbABhAHIAAFJlZ3VsYXIAADIALgAwADAAMAA7AFUASwBXAE4AOwBKAEQAWgBIAFYAMgAuADMAXwBCAG8AbABkAAAyLjAwMDtVS1dOO0pEWkhWMi4zX0JvbGQATqxOHGtjntEAVgAyAC4AM3yXT1MAAFYyLjMAAFYAZQByAHMAaQBvAG4AIAAyAC4AMAAwADAAOwBHAGwAeQBwAGgAcwAgADMALgAxAC4AMQAgACgAMwAxADMANQApAABWZXJzaW9uIDIuMDAwO0dseXBocyAzLjEuMSAoMzEzNSkAAEoARABaAEgAVgAyAC4AMwBfAEIAbwBsAGQAAEpEWkhWMi4zX0JvbGQAlnZ0PAAAAE6sThxrY57RACAAVgAyAC4AMwAAIFYyLjMAAEIAbwBsAGQAAEJvbGQAAEMAbwBwAHkAcgBpAGcAaAB0ACgAYwApACAAIABCAEUASQBKAEkATgBHACAASgBJAE4ARwBEAE8ATgBHACAAVABFAEMASABOAE8ATABPAEcAWQAgAEMATwAuACwAIABMAFQARAAATqxOHGtjntEAIABWADIALgAzACAAQgBvAGwAZAAAAFIAZQBnAHUAbABhAHIAAE6sThxrY57RAFYAMgAuADN8l09TAAAAQgB5ACAAQgBFAEkASgBJAE4ARwAgAEoASQBOAEcARABPAE4ARwAgAFQARQBDAEgATgBPAEwATwBHAFkAIABDAE8ALgAsACAATABUAEQAAE6sThxrY57RACAAVgAyAC4AMwAAAEIAbwBsAGQAAAAAAAIAAAAAAAD/NABmAAAAAAAAAAAAAAAAAAAAAAAAAAAAKwAAAAEAAgADAAQABwAIAAsADAAOAA8AEAARABIAEwAUABUAFgAXABgAGQAaABsAHAAdAB4AIACEAIUAlgC2ALcAtAC1AQIBAwEEAQUBBgEHAQgBCQEKBEV1cm8HdW5pMzAxMAd1bmkzMDExB3VuaTUxNDMHdW5pRkYwNAd1bmlGRkUwB3VuaUZGRTUJc3BhY2UuMDAxCWVxdWFsLjAwMQAAAAAAAAH//wACAAEAAAAMAAAAFgAAAAIAAQADACoAAQAEAAAAAgAAAAAAAAABAAAAAOKfK0YAAAAA5LIkawAAAADlACWL)
    format('truetype');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
@keyframes nutFadeIn {
  0% {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes nutFadeOut {
  0% {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
.nutFade-enter-active,
.nutFadeIn,
.nutFade-leave-active,
.nutFadeOut {
  -webkit-animation-duration: 0.25s;
  animation-duration: 0.25s;
  -webkit-animation-fill-mode: both;
  animation-fill-mode: both;
  -webkit-animation-timing-function: cubic-bezier(0.55, 0.085, 0.68, 0.53);
  animation-timing-function: cubic-bezier(0.55, 0.085, 0.68, 0.53);
}
.nutFade-enter-active,
.nutFadeIn {
  -webkit-animation-name: nutFadeIn;
  animation-name: nutFadeIn;
}
.nutFade-leave-active,
.nutFadeOut {
  -webkit-animation-name: nutFadeOut;
  animation-name: nutFadeOut;
}
@keyframes nutZoomIn {
  0% {
    opacity: 0;
    -webkit-transform: scale3d(0.3, 0.3, 0.3);
    transform: scale3d(0.3, 0.3, 0.3);
  }
  50% {
    opacity: 1;
  }
}
@keyframes nutZoomOut {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0;
    -webkit-transform: scale3d(0.3, 0.3, 0.3);
    transform: scale3d(0.3, 0.3, 0.3);
  }
  to {
    opacity: 0;
  }
}
.nutZoom-enter-active,
.nutZoomIn,
.nutZoom-leave-active,
.nutZoomOut {
  -webkit-animation-duration: 0.25s;
  animation-duration: 0.25s;
  -webkit-animation-fill-mode: both;
  animation-fill-mode: both;
  -webkit-animation-timing-function: cubic-bezier(0.55, 0.085, 0.68, 0.53);
  animation-timing-function: cubic-bezier(0.55, 0.085, 0.68, 0.53);
}
.nutZoom-enter-active,
.nutZoomIn {
  -webkit-animation-name: nutZoomIn;
  animation-name: nutZoomIn;
}
.nutZoom-leave-active,
.nutZoomOut {
  -webkit-animation-name: nutZoomOut;
  animation-name: nutZoomOut;
}
@keyframes nutEaseIn {
  0% {
    opacity: 0;
    -webkit-transform: scale(0.9);
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    -webkit-transform: scale(1);
    transform: scale(1);
  }
}
@keyframes nutEaseOut {
  0% {
    opacity: 1;
    -webkit-transform: scale(1);
    transform: scale(1);
  }
  to {
    opacity: 0;
    -webkit-transform: scale(0.9);
    transform: scale(0.9);
  }
}
.nutEase-enter-active,
.nutEaseIn,
.nutEase-leave-active,
.nutEaseOut {
  -webkit-animation-duration: 0.25s;
  animation-duration: 0.25s;
  -webkit-animation-fill-mode: both;
  animation-fill-mode: both;
  -webkit-animation-timing-function: cubic-bezier(0.55, 0.085, 0.68, 0.53);
  animation-timing-function: cubic-bezier(0.55, 0.085, 0.68, 0.53);
}
.nutEase-enter-active,
.nutEaseIn {
  -webkit-animation-name: nutEaseIn;
  animation-name: nutEaseIn;
}
.nutEase-leave-active,
.nutEaseOut {
  -webkit-animation-name: nutEaseOut;
  animation-name: nutEaseOut;
}
@keyframes nutDropIn {
  0% {
    opacity: 0;
    -webkit-transform: scaleY(0.8);
    transform: scaleY(0.8);
  }
  to {
    opacity: 1;
    -webkit-transform: scaleY(1);
    transform: scaleY(1);
  }
}
@keyframes nutDropOut {
  0% {
    opacity: 1;
    -webkit-transform: scaleY(1);
    transform: scaleY(1);
  }
  to {
    opacity: 0;
    -webkit-transform: scaleY(0.8);
    transform: scaleY(0.8);
  }
}
.nutDrop-enter-active,
.nutDropIn,
.nutDrop-leave-active,
.nutDropOut {
  -webkit-animation-duration: 0.25s;
  animation-duration: 0.25s;
  -webkit-animation-fill-mode: both;
  animation-fill-mode: both;
  -webkit-animation-timing-function: cubic-bezier(0.55, 0.085, 0.68, 0.53);
  animation-timing-function: cubic-bezier(0.55, 0.085, 0.68, 0.53);
}
.nutDrop-enter-active,
.nutDropIn {
  -webkit-animation-name: nutDropIn;
  animation-name: nutDropIn;
}
.nutDrop-leave-active,
.nutDropOut {
  -webkit-animation-name: nutDropOut;
  animation-name: nutDropOut;
}
.nutRotate-enter-active,
.nutRotateIn,
.nutRotate-leave-active,
.nutRotateOut {
  -webkit-animation-duration: 0.25s;
  animation-duration: 0.25s;
  -webkit-animation-fill-mode: both;
  animation-fill-mode: both;
  -webkit-animation-timing-function: cubic-bezier(0.55, 0.085, 0.68, 0.53);
  animation-timing-function: cubic-bezier(0.55, 0.085, 0.68, 0.53);
}
.nutRotate-enter-active,
.nutRotateIn {
  -webkit-animation-name: nutRotateIn;
  animation-name: nutRotateIn;
}
.nutRotate-leave-active,
.nutRotateOut {
  -webkit-animation-name: nutRotateOut;
  animation-name: nutRotateOut;
}
@keyframes nutJump {
  to {
    -webkit-transform: scale3d(0.8, 1, 0.9) translateY(-10rpx);
    transform: scale3d(0.8, 1, 0.9) translateY(-10rpx);
  }
}
@keyframes nutJumpOne {
  50% {
    -webkit-transform: scale3d(0.8, 1, 0.9) translateY(-10rpx);
    transform: scale3d(0.8, 1, 0.9) translateY(-10rpx);
  }
  to {
    -webkit-transform: scaleZ(1) translateY(0);
    transform: scaleZ(1) translateY(0);
  }
}
@keyframes nutBlink {
  0% {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes nutBreathe {
  0%,
  to {
    -webkit-transform: scale(1);
    transform: scale(1);
  }
  50% {
    -webkit-transform: scale(1.2);
    transform: scale(1.2);
  }
}
@keyframes nutFlash {
  0%,
  50%,
  to {
    opacity: 1;
  }
  25%,
  75% {
    opacity: 0;
  }
}
@keyframes nutBounce {
  0%,
  20%,
  53%,
  to {
    -webkit-animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
  }
  40%,
  43% {
    -webkit-animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    -webkit-transform: translate3d(0, -30rpx, 0) scaleY(1.1);
    transform: translate3d(0, -30rpx, 0) scaleY(1.1);
  }
  70% {
    -webkit-animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    -webkit-transform: translate3d(0, -15rpx, 0) scaleY(1.05);
    transform: translate3d(0, -15rpx, 0) scaleY(1.05);
  }
  80% {
    -webkit-transition-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    transition-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    -webkit-transform: translateZ(0) scaleY(0.95);
    transform: translateZ(0) scaleY(0.95);
  }
  90% {
    -webkit-transform: translate3d(0, -4rpx, 0) scaleY(1.02);
    transform: translate3d(0, -4rpx, 0) scaleY(1.02);
  }
}
@keyframes nutShake {
  0% {
    -webkit-transform: translate(0);
    transform: translate(0);
  }
  6.5% {
    -webkit-transform: translate(-6rpx) rotateY(-9deg);
    transform: translate(-6rpx) rotateY(-9deg);
  }
  18.5% {
    -webkit-transform: translate(5rpx) rotateY(7deg);
    transform: translate(5rpx) rotateY(7deg);
  }
  31.5% {
    -webkit-transform: translate(-3rpx) rotateY(-5deg);
    transform: translate(-3rpx) rotateY(-5deg);
  }
  43.5% {
    -webkit-transform: translate(2rpx) rotateY(3deg);
    transform: translate(2rpx) rotateY(3deg);
  }
  50% {
    -webkit-transform: translate(0);
    transform: translate(0);
  }
}
.nut-watermark {
  position: absolute;
  z-index: var(--nutui-watermark-z-index, 1200);
  inset: 0;
  pointer-events: none;
  background-repeat: repeat;
}
.nut-watermark-full-page {
  position: fixed;
}
.nut-horizontal-items {
  float: left;
}
.nut-horizontal-items .h5-li {
  display: block;
  float: left;
  color: var(--nutui-color-title, #1a1a1a);
  background: var(--nutui-color-background-overlay, #ffffff);
  padding: 10rpx;
  margin-right: 20rpx;
}
.nut-horizontal-items::after {
  content: '';
  display: block;
  visibility: hidden;
  clear: both;
}
.nut-vertical-items .h5-li {
  display: block;
  color: var(--nutui-color-title, #1a1a1a);
  background: var(--nutui-color-background-overlay, #ffffff);
  border-radius: 7rpx;
  -webkit-box-shadow: 0 1rpx 6rpx #edeef1;
  box-shadow: 0 1rpx 6rpx #edeef1;
  margin-top: 20rpx;
  padding: 14rpx 15rpx;
  font-size: 13rpx;
  line-height: 18rpx;
  font-family: PingFangSC;
  font-weight: 500;
}
.nut-virtualList-box {
  overflow: auto;
}
.nut-virtuallist {
  width: 100%;
  overflow: scroll;
  position: relative;
  -webkit-overflow-scrolling: touch;
}
.nut-virtuallist-phantom {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  z-index: -1;
}
.nut-virtuallist-container {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
}
.nut-virtuallist-item {
  overflow: hidden;
  margin: var(--nutui-list-item-margin, 0 0 10rpx 0);
}
[dir='rtl'] .nut-horizontal-items,
.nut-rtl .nut-horizontal-items {
  float: right;
}
[dir='rtl'] .nut-horizontal-items .h5-li,
.nut-rtl .nut-horizontal-items .h5-li {
  float: right;
  margin-right: 0;
  margin-left: 20rpx;
}
.nut-uploader {
  position: relative;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-wrap: wrap;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
}
.nut-uploader-slot {
  position: relative;
}
.nut-uploader-upload {
  position: relative;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  background: var(--nutui-uploader-background, var(--nutui-color-background, #f2f3f5));
  width: var(--nutui-uploader-image-width, 100rpx);
  height: var(--nutui-uploader-image-height, 100rpx);
  border: var(--nutui-uploader-image-border, 0rpx);
  border-radius: var(--nutui-uploader-image-border-radius, 4rpx);
}
.nut-uploader-icon {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  color: var(--nutui-uploader-image-color, var(--nutui-color-text-help, #888b94));
}
.nut-uploader-icon .h5-i,
.nut-uploader-icon .nut-icon {
  color: var(--nutui-uploader-image-color, var(--nutui-color-text-help, #888b94));
  margin-bottom: var(--nutui-uploader-image-icon-margin-bottom, 6rpx);
}
.nut-uploader-icon-tip {
  font-size: var(--nutui-uploader-image-icon-tip-font-size, 12rpx);
}
.nut-uploader-input {
  position: absolute !important;
  width: 100% !important;
  height: 100% !important;
}
.nut-uploader-input {
  top: 0;
  left: 0;
  overflow: hidden;
  cursor: pointer;
  opacity: 0;
}
.nut-uploader-input:disabled {
  cursor: not-allowed;
}
.nut-uploader-upload-disabled {
  background: var(--nutui-uploader-background-disabled, var(--nutui-color-background, #f2f3f5));
  color: var(--nutui-uploader-image-disabled, var(--nutui-color-text-disabled, #c2c4cc));
}
.nut-uploader-upload-disabled .nut-uploader-icon .h5-i,
.nut-uploader-upload-disabled .nut-uploader-icon .nut-icon {
  color: var(--nutui-uploader-image-disabled, var(--nutui-color-text-disabled, #c2c4cc));
  margin-bottom: var(--nutui-uploader-image-icon-margin-bottom, 6rpx);
}
.nut-uploader-preview {
  position: relative;
  margin-right: var(--nutui-uploader-preview-margin-right, 10rpx);
  margin-bottom: var(--nutui-uploader-preview-margin-bottom, 10rpx);
  border-radius: var(--nutui-uploader-image-border-radius, 4rpx);
  -webkit-box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  box-shadow: 0 2rpx 10rpx #0000001a;
}
.nut-uploader-preview-progress {
  position: absolute;
  left: 0;
  top: 0;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: var(--nutui-uploader-preview-progress-background, var(--nutui-color-mask, rgba(0, 0, 0, 0.7)));
  border-radius: var(--nutui-uploader-image-border-radius, 4rpx);
  z-index: 10;
}
.nut-uploader-preview-progress .h5-i {
  margin-bottom: var(--nutui-uploader-image-icon-margin-bottom, 6rpx);
}
.nut-uploader-preview-progress-msg {
  color: var(--nutui-color-text-help, #888b94);
  font-size: 12rpx;
}
.nut-uploader-preview.list {
  width: 100%;
  margin-right: 0;
  margin-bottom: 0;
  margin-top: 10rpx;
  -webkit-box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.01176);
  box-shadow: 0 2rpx 10rpx #00000003;
}
.nut-uploader-preview-list {
  width: 100%;
  height: 32rpx;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: space-between;
  -ms-flex-pack: justify;
  justify-content: space-between;
  padding: 0 10rpx;
  background-color: var(--nutui-color-background-sunken, #f7f8fc);
}
.nut-uploader-preview-list .nut-uploader-preview-img-file-name {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-line-clamp: 1;
  padding: 2rpx;
  height: 24rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.nut-uploader-preview-list .nut-progress {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
}
.nut-uploader-preview-list .nut-progress .nut-progress-outer {
  height: 2rpx !important;
}
.nut-uploader-preview .close {
  position: absolute;
  right: var(--nutui-uploader-preview-close-right, 0rpx);
  top: var(--nutui-uploader-preview-close-top, 0rpx);
  -webkit-transform: translate(50%, -50%);
  -ms-transform: translate(50%, -50%);
  transform: translate(50%, -50%);
  z-index: 1;
}
.nut-uploader-preview-img {
  position: relative;
  width: var(--nutui-uploader-image-width, 100rpx);
  height: var(--nutui-uploader-image-height, 100rpx);
  border-radius: var(--nutui-uploader-image-border-radius, 4rpx);
  overflow: hidden;
}
.nut-uploader-preview-img .h5-i {
  color: var(--nutui-color-title, #1a1a1a);
}
.nut-uploader-preview-img .tips {
  position: absolute;
  bottom: 0;
  left: 0;
  font-size: 12rpx;
  color: #fff;
  text-align: center;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  height: var(--nutui-uploader-preview-tips-height, 24rpx);
  line-height: var(--nutui-uploader-preview-tips-height, 24rpx);
  border-radius: var(--nutui-uploader-image-border-radius, 4rpx);
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  padding: var(--nutui-uploader-preview-tips-padding, 0 5rpx);
  background: var(--nutui-uploader-preview-tips-background, var(--nutui-black-7));
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.nut-uploader-preview-img-c {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  height: 100%;
  position: static;
  position: initial;
  border-radius: var(--nutui-uploader-image-border-radius, 4rpx);
}
.nut-uploader-preview-img-file {
  height: 100%;
  width: 100%;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-transition: all 0.3s;
  transition: all 0.3s;
}
.nut-uploader-preview-img-file-name {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  width: 90%;
  font-size: 12rpx;
  color: var(--nutui-color-text, #505259);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  word-break: break-all;
}
.nut-uploader-preview-img-file-name.error {
  color: red !important;
}
.nut-uploader-preview-img-file-name.success {
  color: #1890ff !important;
}
.nut-uploader-preview-img-file-name .nut-icon-Link {
  -webkit-flex-shrink: 0;
  -ms-flex-negative: 0;
  flex-shrink: 0;
}
[dir='rtl'] .nut-uploader-input,
.nut-rtl .nut-uploader-input {
  left: auto;
  right: 0;
}
[dir='rtl'] .nut-uploader-preview,
.nut-rtl .nut-uploader-preview {
  margin-right: 0;
  margin-left: var(--nutui-uploader-preview-margin-right, 10rpx);
}
[dir='rtl'] .nut-uploader-preview-progress,
.nut-rtl .nut-uploader-preview-progress {
  left: auto;
  right: 0;
}
[dir='rtl'] .nut-uploader-preview.list,
.nut-rtl .nut-uploader-preview.list {
  margin-right: 0;
  margin-left: 0;
}
[dir='rtl'] .nut-uploader-preview .close,
.nut-rtl .nut-uploader-preview .close {
  right: auto;
  left: var(--nutui-uploader-preview-close-right, 0rpx);
  -webkit-transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}
[dir='rtl'] .nut-uploader-preview-img .tips,
.nut-rtl .nut-uploader-preview-img .tips {
  left: auto;
  right: 0;
}
.nut-video {
  width: 100%;
  height: 100%;
  position: relative;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
}
.nut-video-player {
  width: 100%;
  background: #000;
}
.nut-video-player:focus {
  outline: none;
}
.nut-video .h5-video {
  width: 100%;
  height: 100%;
  -o-object-fit: fill;
  object-fit: fill;
}
.nut-tour-mask {
  position: fixed;
  -webkit-box-shadow: 0 0 0 150vh var(--nutui-color-mask, rgba(0, 0, 0, 0.7));
  box-shadow: 0 0 0 150vh var(--nutui-color-mask, rgba(0, 0, 0, 0.7));
  border-radius: var(--nutui-tour-mask-border-radius, 10rpx);
  z-index: 999;
}
.nut-tour-mask-none {
  -webkit-box-shadow: none;
  box-shadow: none;
}
.nut-tour-mask-hidden {
  opacity: 0;
}
.nut-tour-content {
  display: block;
  padding: var(--nutui-tour-content-padding, 10rpx 12rpx);
  min-width: var(--nutui-tour-content-min-width, 200rpx);
  -webkit-box-sizing: content-box;
  box-sizing: content-box;
}
.nut-tour-content-top {
  display: block;
  text-align: right;
}
.nut-tour-content-top-close {
  --nut-icon-width: 10rpx;
  --nut-icon-height: 10rpx;
}
.nut-tour-content-inner {
  margin: var(--nutui-tour-content-inner-margin, 10rpx 0rpx);
  font-size: var(--nutui-tour-content-inner-font-size, 14rpx);
  white-space: nowrap;
}
.nut-tour-content-bottom {
  margin-top: var(--nutui-tour-content-bottom-margin-top, 10rpx);
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-justify-content: space-between;
  -ms-flex-pack: justify;
  justify-content: space-between;
}
.nut-tour-content-bottom-operate {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-justify-content: flex-end;
  -ms-flex-pack: end;
  justify-content: flex-end;
}
.nut-tour-content-bottom-operate-btn {
  display: inline-block;
  border: 1rpx solid var(--nutui-color-text-disabled, #c2c4cc);
  margin-left: var(--nutui-tour-content-bottom-btn-margin-left, 4rpx);
  padding: var(--nutui-tour-content-bottom-btn-padding, 2rpx 4rpx);
  font-size: var(--nutui-tour-content-bottom-btn-font-size, 12rpx);
  border-radius: var(--nutui-tour-content-bottom-btn-border-radius, 4rpx);
  color: var(--nutui-color-text, #505259);
  cursor: pointer;
}
.nut-tour-content-bottom-operate-btn.active {
  color: #fff;
  border: 0;
  background: var(--nutui-color-primary, #ff0f23);
}
.nut-tour-content-tile .nut-tour-content-inner {
  margin: 0;
}
.nut-tour-masked {
  position: fixed;
  width: 100vh;
  height: 100vh;
  z-index: 1000;
  top: 0;
  left: 0;
  background: transparent;
}
[dir='rtl'] .nut-tour-content-bottom-operate-btn,
.nut-rtl .nut-tour-content-bottom-operate-btn {
  margin-left: 0;
  margin-right: var(--nutui-tour-content-bottom-btn-margin-left, 4rpx);
}
[dir='rtl'] .nut-tour-masked,
.nut-rtl .nut-tour-masked {
  left: auto;
  right: 0;
}
.nut-trendarrow {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  color: var(--nutui-color-title, #1a1a1a);
  font-size: var(--nutui-trendarrow-font-size, 14rpx);
}
.nut-trendarrow-icon-before {
  margin-right: var(--nutui-trendarrow-icon-margin, 4rpx);
}
.nut-trendarrow-icon-after {
  margin-left: var(--nutui-trendarrow-icon-margin, 4rpx);
}
.nut-trendarrow-rate {
  vertical-align: middle;
  display: inline;
}
.nut-trendarrow .nut-icon {
  vertical-align: middle;
}
[dir='rtl'] .nut-trendarrow-icon-before,
.nut-rtl .nut-trendarrow-icon-before {
  margin-right: 0;
  margin-left: var(--nutui-trendarrow-icon-margin, 4rpx);
}
[dir='rtl'] .nut-trendarrow-icon-after,
.nut-rtl .nut-trendarrow-icon-after {
  margin-left: 0;
  margin-right: var(--nutui-trendarrow-icon-margin, 4rpx);
}
@keyframes rotation {
}
.nut-toast {
  position: fixed;
  left: 0;
  top: 0;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1300;
}
.nut-toast-overlay-default {
  --nutui-overlay-bg-color: rgba(0, 0, 0, 0);
}
.nut-toast-overlay-default-taro {
  background-color: #0000;
  --nutui-overlay-bg-color: rgba(0, 0, 0, 0);
}
.nut-toast-inner {
  position: absolute;
  top: var(--nutui-toast-inner-top, 50%);
  -webkit-transform: translateY(-50%);
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  min-width: 96rpx;
  max-width: 60%;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  font-size: var(--nutui-toast-text-font-size, 14rpx);
  text-align: var(--nutui-toast-inner-text-align, center);
  padding: var(--nutui-toast-inner-padding, 13rpx 16rpx);
  word-break: break-all;
  background: var(--nutui-toast-inner-bg-color, var(--nutui-color-mask, rgba(0, 0, 0, 0.7)));
  border-radius: var(--nutui-toast-inner-border-radius, var(--nutui-radius-xl, 12rpx));
  color: var(--nutui-toast-font-color, #ffffff);
}
.nut-toast-inner-descrption {
  max-width: 68.2%;
}
.nut-toast-inner-normal {
  word-break: normal;
  word-wrap: normal;
}
.nut-toast-inner-break-word {
  word-break: normal;
  word-wrap: break-word;
}
.nut-toast-inner-small {
  font-size: var(--nutui-font-size-s, 12rpx);
}
.nut-toast-inner-large {
  font-size: var(--nutui-font-size-l, 15rpx);
}
.nut-toast-center {
  top: var(--nutui-toast-inner-top, 48%);
}
.nut-toast-bottom {
  top: var(--nutui-toast-inner-top, 80%);
}
.nut-toast-top {
  top: var(--nutui-toast-inner-top, 20%);
}
.nut-toast-text {
  color: #fff;
  text-align: var(--nutui-toast-inner-text-align, center);
  line-height: normal;
  line-height: 20rpx;
  height: auto;
}
.nut-toast-title {
  color: #fff;
  font-size: var(--nutui-toast-title-font-size, 16rpx);
  font-weight: 600;
  text-align: var(--nutui-toast-inner-text-align, center);
  line-height: normal;
  line-height: 22rpx;
}
.nut-toast .nut-icon {
  width: 24rpx;
  height: 24rpx;
  color: #fff;
}
.nut-toast-icon-wrapper {
  width: 100%;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  margin: 3rpx 0 5rpx;
  color: #fff;
}
.nut-toast-icon-wrapper-icon {
  width: 24rpx;
  height: 24rpx;
}
.nut-toast-rtl {
  left: auto;
  right: 0;
}
.nut-toast-rtl-inner {
  left: auto;
  right: 50%;
}
[dir='rtl'] .nut-toast,
.nut-rtl .nut-toast {
  left: auto;
  right: 0;
}
[dir='rtl'] .nut-toast-inner,
.nut-rtl .nut-toast-inner {
  left: auto;
  right: 50%;
}
.toast-fade-enter-active,
.toast-fade-leave-active {
  -webkit-transition: opacity 0.3s;
  transition: opacity 0.3s;
}
.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
}
.nut-timeselect {
  background-color: var(--nutui-color-background-overlay, #ffffff);
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  height: calc(100% - 50rpx);
}
.nut-timeselect-content {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex: 1;
  -ms-flex: 1;
  flex: 1;
}
.nut-timeselect-content-left {
  width: var(--nutui-timeselect-date-width, 140rpx);
  min-width: var(--nutui-timeselect-date-width, 140rpx);
  height: 100%;
  overflow: auto;
  background: var(--nutui-color-background-sunken, #f7f8fc);
}
.nut-timepannel {
  padding: 0 16rpx;
  height: var(--nutui-timeselect-date-height, 40rpx);
  line-height: var(--nutui-timeselect-date-height, 40rpx);
  text-align: left;
  color: var(--nutui-color-text, #505259);
  font-size: var(--nutui-font-size-base, 14rpx);
}
.nut-timepannel.active {
  background: var(--nutui-color-background-overlay, #ffffff);
  color: var(--nutui-timeselect-date-active-color, var(--nutui-color-title, #1a1a1a));
  font-weight: var(--nutui-font-weight-bold, 600);
}
.nut-timedetail {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-content: flex-start;
  -ms-flex-line-pack: start;
  align-content: flex-start;
  -webkit-flex: 1;
  -ms-flex: 1;
  flex: 1;
  min-width: 0;
  -webkit-flex-wrap: wrap;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
  padding: 0 0 50rpx 12rpx;
}
.nut-timedetail-item {
  width: var(--nutui-timeselect-time-width, 100rpx);
  height: var(--nutui-timeselect-time-height, 50rpx);
  line-height: var(--nutui-timeselect-time-height, 50rpx);
  text-align: center;
  margin: var(--nutui-timeselect-time-margin, 0 10rpx 10rpx 0);
  background: var(--nutui-timeselect-time-background, var(--nutui-color-background, #f2f3f5));
  border-radius: 5rpx;
  font-size: var(--nutui-font-size-base, 14rpx);
  border: 1rpx solid transparent;
}
.nut-timedetail-item.active {
  background-color: var(--nutui-color-primary-light-pressed, #ffebf1);
  border: 1rpx solid var(--nutui-color-primary, #ff0f23);
  color: var(--nutui-color-primary, #ff0f23);
  font-weight: var(--nutui-font-weight-bold, 600);
}
[dir='rtl'] .nut-timedetail,
.nut-rtl .nut-timedetail {
  padding: 0 12rpx 50rpx 0;
}
.nut-tag {
  padding: var(--nutui-tag-padding, 0rpx 2rpx);
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  font-size: var(--nutui-tag-font-size, var(--nutui-font-size-xxs, 10rpx));
  border-radius: var(--nutui-tag-border-radius, 2rpx);
  height: var(--nutui-tag-height, 14rpx);
  color: var(--nutui-tag-color, #ffffff);
  border: var(--nutui-tag-border-width, 1rpx) solid transparent;
}
.nut-tag .nut-icon {
  vertical-align: middle;
  margin-left: 4rpx;
  color: var(--nutui-tag-color, #ffffff);
}
.nut-tag-text {
  font-size: var(--nutui-tag-font-size, var(--nutui-font-size-xxs, 10rpx));
  color: var(--nutui-tag-color, #ffffff);
}
.nut-tag-text-plain {
  color: var(--nutui-color-title, #1a1a1a);
}
.nut-tag-default {
  background: var(--nutui-tag-background-color, var(--nutui-color-title, #1a1a1a));
}
.nut-tag-primary {
  background: var(--nutui-tag-primary-background-color, linear-gradient(135deg, var(--nutui-color-primary-stop-1, #ff475d) 0%, var(--nutui-color-primary-stop-2, #ff0f23) 100%));
}
.nut-tag-info {
  background: var(--nutui-tag-info-background-color, var(--nutui-color-info, #0073ff));
}
.nut-tag-success {
  background: var(--nutui-tag-success-background-color, #4fc08d);
}
.nut-tag-danger {
  background: var(--nutui-tag-danger-background-color, var(--nutui-color-danger, #ff0f23));
}
.nut-tag-warning {
  background: var(--nutui-tag-warning-background-color, var(--nutui-color-warning, #ffbf00));
}
.nut-tag-round {
  border-radius: var(--nutui-tag-round-border-radius, 8rpx);
}
.nut-tag-mark {
  border-radius: var(--nutui-tag-mark-border-radius, 0 8rpx 8rpx 0);
}
.nut-tag-close {
  cursor: pointer;
}
.nut-tag-custom-icon {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  display: -webkit-inline-flex;
  display: -ms-inline-flexbox;
  display: inline-flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  font-size: var(--nutui-tag-font-size, var(--nutui-font-size-xxs, 10rpx));
  color: var(--nutui-tag-color, #ffffff);
  margin-left: 4rpx;
}
.nut-tag-plain {
  background-color: #fff;
  border: var(--nutui-tag-border-width, 1rpx) solid var(--nutui-color-title, #1a1a1a);
}
[dir='rtl'] .nut-tag .nut-icon,
.nut-rtl .nut-tag .nut-icon {
  margin-left: 0;
  margin-right: 4rpx;
}
.nut-textarea {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  position: relative;
  width: 100%;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  font-size: var(--nutui-font-size-base, 14rpx);
  border-radius: var(--nutui-radius-s, 6rpx);
}
.nut-textarea-container {
  padding: var(--nutui-textarea-padding, 12rpx);
  background-color: var(--nutui-color-background-overlay, #ffffff);
}
.nut-textarea-error {
  border: 0.5rpx solid var(--nutui-color-danger, #ff0f23);
  background-color: var(--nutui-color-danger-light, #ffebef);
}
.nut-textarea-limit {
  text-align: right;
  font-size: var(--nutui-font-size-base, 14rpx);
  line-height: var(--nutui-font-size-base, 14rpx);
  margin-top: var(--nutui-spacing-base, 8rpx);
  color: var(--nutui-color-text-help, #888b94);
}
.nut-textarea-limit-disabled {
  cursor: not-allowed;
  color: var(--nutui-color-text-disabled, #c2c4cc);
}
.nut-textarea-textarea {
  outline: none;
  display: block;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  width: 100%;
  height: 40rpx;
  min-width: 0;
  margin: 0;
  padding: 0;
  font-size: var(--nutui-font-size-base, 14rpx);
  color: var(--nutui-textarea-text-color, var(--nutui-color-title, #1a1a1a));
  caret-color: var(--nutui-textarea-text-curror-color, var(--nutui-color-primary, #ff0f23));
  text-align: left;
  background-color: transparent;
  border: 0;
  resize: none;
}
.nut-textarea-textarea .taro-textarea {
  color: var(--nutui-textarea-text-color, var(--nutui-color-title, #1a1a1a));
  background-color: transparent;
  resize: none;
}
.nut-textarea-textarea::-webkit-input-placeholder {
  color: var(--nutui-color-text-help, #888b94);
}
.nut-textarea-textarea::-moz-placeholder {
  color: var(--nutui-color-text-help, #888b94);
}
.nut-textarea-textarea:-ms-input-placeholder {
  color: var(--nutui-color-text-help, #888b94);
}
.nut-textarea-textarea::-ms-input-placeholder {
  color: var(--nutui-color-text-help, #888b94);
}
.nut-textarea-textarea::placeholder {
  color: var(--nutui-color-text-help, #888b94);
}
.nut-textarea-textarea-disabled {
  cursor: not-allowed;
  color: var(--nutui-color-text-disabled, #c2c4cc);
}
.nut-textarea-textarea-disabled::-webkit-input-placeholder {
  color: var(--nutui-color-text-disabled, #c2c4cc);
}
.nut-textarea-textarea-disabled::-moz-placeholder {
  color: var(--nutui-color-text-disabled, #c2c4cc);
}
.nut-textarea-textarea-disabled:-ms-input-placeholder {
  color: var(--nutui-color-text-disabled, #c2c4cc);
}
.nut-textarea-textarea-disabled::-ms-input-placeholder {
  color: var(--nutui-color-text-disabled, #c2c4cc);
}
.nut-textarea-textarea-disabled::placeholder {
  color: var(--nutui-color-text-disabled, #c2c4cc);
}
.nut-textarea-textarea-disabled .taro-textarea {
  color: var(--nutui-color-text-disabled, #c2c4cc);
}
.nut-textarea-textarea-disabled .taro-textarea::-webkit-input-placeholder {
  color: var(--nutui-color-text-disabled, #c2c4cc);
}
.nut-textarea-textarea-disabled .taro-textarea::-moz-placeholder {
  color: var(--nutui-color-text-disabled, #c2c4cc);
}
.nut-textarea-textarea-disabled .taro-textarea:-ms-input-placeholder {
  color: var(--nutui-color-text-disabled, #c2c4cc);
}
.nut-textarea-textarea-disabled .taro-textarea::-ms-input-placeholder {
  color: var(--nutui-color-text-disabled, #c2c4cc);
}
.nut-textarea-textarea-disabled .taro-textarea::placeholder {
  color: var(--nutui-color-text-disabled, #c2c4cc);
}
.nut-textarea.nut-textarea-rtl-limit {
  right: auto;
  left: 15rpx;
}
.taro-textarea {
  background-color: transparent;
  resize: none;
}
.nut-tabs {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
}
.nut-tabs-horizontal {
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
}
.nut-tabs-titles {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  height: var(--nutui-tabs-titles-height, 44rpx);
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  overflow-x: auto;
  overflow-y: hidden;
  background: var(--nutui-tabs-titles-background-color, var(--nutui-color-background, #f2f3f5));
  scrollbar-width: none;
}
.nut-tabs-titles::-webkit-scrollbar {
  display: none;
  width: 0;
  background: transparent;
}
.nut-tabs-titles .nut-tabs-list {
  width: 100%;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-shrink: 0;
  -ms-flex-negative: 0;
  flex-shrink: 0;
}
.nut-tabs-titles-left {
  -webkit-justify-content: flex-start;
  -ms-flex-pack: start;
  justify-content: flex-start;
}
.nut-tabs-titles-left .nut-tabs-titles-item {
  padding: 0 22rpx;
}
.nut-tabs-titles-right {
  -webkit-justify-content: flex-end;
  -ms-flex-pack: end;
  justify-content: flex-end;
}
.nut-tabs-titles-right .nut-tabs-titles-item {
  padding: 0 22rpx;
}
.nut-tabs-titles-item {
  position: relative;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-flex: 1 0 auto;
  -ms-flex: 1 0 auto;
  flex: 1 0 auto;
  padding: 0 var(--nutui-tabs-titles-gap, 12rpx);
  height: var(--nutui-tabs-titles-height, 44rpx);
  line-height: var(--nutui-tabs-titles-height, 44rpx);
  min-width: var(--nutui-tabs-titles-item-min-width, 50rpx);
  font-size: var(--nutui-tabs-titles-font-size, var(--nutui-font-size-base, 14rpx));
  color: var(--nutui-tabs-titles-item-color, var(--nutui-color-title, #1a1a1a));
  text-overflow: ellipsis;
  white-space: nowrap;
}
.nut-tabs-titles-item .nut-icon {
  color: var(--nutui-tabs-titles-item-color, var(--nutui-color-title, #1a1a1a));
}
.nut-tabs-titles-item-left,
.nut-tabs-titles-item-right {
  -webkit-flex: none;
  -ms-flex: none;
  flex: none;
}
.nut-tabs-titles-item-text {
  color: var(--nutui-tabs-titles-item-color, var(--nutui-color-title, #1a1a1a));
}
.nut-tabs-titles-item-smile,
.nut-tabs-titles-item-line {
  position: absolute;
  -webkit-transition: width 0.3s ease;
  transition: width 0.3s ease;
  width: 0;
  height: 0;
  content: ' ';
  left: 50%;
  -webkit-transform: translate(-50%);
  -ms-transform: translate(-50%);
  transform: translate(-50%);
  bottom: var(--nutui-tabs-line-bottom, 15%);
  border-radius: var(--nutui-tabs-line-border-radius, 2rpx);
  opacity: var(--nutui-tabs-tab-line-opacity, 1);
  overflow: hidden;
}
.nut-tabs-titles-item-smile {
  bottom: var(--nutui-tabs-titles-item-smile-bottom, -10%);
}
.nut-tabs-titles-item-smile .nut-icon {
  position: absolute;
  font-size: 20rpx;
  width: 100%;
  height: 100%;
}
.nut-tabs-titles-item-active .nut-icon {
  color: var(--nutui-tabs-titles-item-active-color, var(--nutui-color-primary, #ff0f23));
}
.nut-tabs-titles-item-active .nut-tabs-titles-item-text {
  color: var(--nutui-tabs-titles-item-active-color, var(--nutui-color-primary, #ff0f23));
  font-weight: var(--nutui-tabs-titles-item-active-font-weight, var(--nutui-font-weight-bold, 600));
}
.nut-tabs-titles-item-active .nut-tabs-titles-item-line {
  overflow: visible;
  overflow: initial;
  content: ' ';
  width: var(--nutui-tabs-tab-line-width, 12rpx);
  height: var(--nutui-tabs-tab-line-height, 2rpx);
  background: var(--nutui-tabs-tab-line-color, var(--nutui-color-primary, #ff0f23));
}
.nut-tabs-titles-item-active .nut-tabs-titles-item-smile {
  overflow: visible;
  overflow: initial;
  width: 40rpx;
  height: 20rpx;
}
.nut-tabs-titles-item-active .nut-tabs-titles-item-smile .nut-icon {
  color: var(--nutui-tabs-titles-item-active-color, var(--nutui-color-primary, #ff0f23));
}
.nut-tabs-titles-item-disabled,
.nut-tabs-titles-item-disabled .nut-icon,
.nut-tabs-titles-item-disabled .nut-tabs-titles-item-text {
  color: var(--nutui-color-text-disabled, #c2c4cc);
}
.nut-tabs-titles-simple .nut-tabs-titles-item-active .nut-tabs-titles-item-text,
.nut-tabs-titles-simple .nut-tabs-titles-item-active .nut-icon {
  color: var(--nutui-color-title, #1a1a1a);
  font-size: var(--nutui-tabs-titles-item-active-font-size, var(--nutui-font-size-l, 15rpx));
}
.nut-tabs-titles-card .nut-tabs-titles-item-active {
  font-weight: var(--nutui-font-weight-bold, 600);
  background-color: #fff;
  border-radius: var(--nutui-radius-base, 8rpx) var(--nutui-radius-base, 8rpx) 0 0;
}
.nut-tabs-titles-button .nut-tabs-titles-item {
  padding: 0 10rpx;
}
.nut-tabs-titles-button .nut-tabs-titles-item .nut-tabs-titles-item-text {
  -webkit-flex: 1;
  -ms-flex: 1;
  flex: 1;
  height: 28rpx;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  padding: 0 8rpx;
}
.nut-tabs-titles-button .nut-tabs-titles-item-active .nut-tabs-titles-item-text {
  background: var(--nutui-color-default-light);
  color: var(--nutui-tabs-titles-item-active-color, var(--nutui-color-primary, #ff0f23));
  border-radius: var(--nutui-tabs-button-border-radius, 50rpx);
  font-weight: var(--nutui-font-weight-bold, 600);
  background-color: var(--nutui-tabs-button-active-background-color, var(--nutui-color-primary-light-pressed, #ffebf1));
  border: var(--nutui-tabs-button-active-border, 1rpx solid var(--nutui-color-primary, #ff0f23));
}
.nut-tabs-titles-divider {
  border-bottom: 1rpx solid var(--nutui-color-border, rgba(0, 0, 0, 0.06));
}
.nut-tabs-titles-divider .nut-tabs-titles-item {
  position: relative;
}
.nut-tabs-titles-divider .nut-tabs-titles-item::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  height: 50%;
  width: 1rpx;
  background: var(--nutui-color-border, rgba(0, 0, 0, 0.06));
  -webkit-transform: translateY(-50%);
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
}
.nut-tabs-titles-divider .nut-tabs-titles-item:last-child::after {
  display: none;
}
.nut-tabs-vertical .nut-tabs-ellipsis {
  white-space: break-spaces;
  padding-left: 6rpx;
  width: 90rpx;
  line-height: var(--nutui-font-size-base, 14rpx);
}
.nut-tabs-vertical .nut-tabs-titles {
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  height: 100%;
  width: var(--nutui-tabs-vertical-titles-width, 100rpx);
  -webkit-flex-shrink: 0;
  -ms-flex-negative: 0;
  flex-shrink: 0;
}
.nut-tabs-vertical .nut-tabs-titles .nut-tabs-list {
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
}
.nut-tabs-vertical .nut-tabs-titles-item {
  height: var(--nutui-tabs-vertical-titles-item-height, 40rpx);
  -webkit-flex: none;
  -ms-flex: none;
  flex: none;
}
.nut-tabs-vertical .nut-tabs-titles-item-smile {
  overflow: hidden;
  -webkit-transition: width 0.3s ease;
  transition: width 0.3s ease;
}
.nut-tabs-vertical .nut-tabs-titles-item-line {
  -webkit-transform: translateY(-50%);
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
  -webkit-transition: height 0.3s ease;
  transition: height 0.3s ease;
}
.nut-tabs-vertical .nut-tabs-titles-item-line-vertical {
  top: 50%;
}
.nut-tabs-vertical .nut-tabs-titles-item-active {
  background-color: var(--nutui-tabs-titles-item-active-background-color, var(--nutui-color-background-overlay, #ffffff));
}
.nut-tabs-vertical .nut-tabs-titles-item-active .nut-tabs-titles-item-line {
  left: 10rpx;
  width: var(--nutui-tabs-vertical-tab-line-width, 3rpx);
  height: var(--nutui-tabs-vertical-tab-line-height, 12rpx);
  background: var(
    --nutui-tabs-vertical-tab-line-color,
    linear-gradient(180deg, var(--nutui-color-primary-stop-1, #ff475d) 0%, var(--nutui-color-primary-light-pressed, #ffebf1) 100%)
  );
}
.nut-tabs-vertical .nut-tabs-titles-item-active .nut-tabs-titles-item-smile {
  right: -12rpx;
  bottom: -2%;
  left: auto;
  -webkit-transform: rotate(320deg);
  -ms-transform: rotate(320deg);
  transform: rotate(320deg);
}
.nut-tabs-vertical .nut-tabs-horizontal .nut-tabs-titles {
  padding: 0 !important;
}
.nut-tabs-vertical .nut-tabs-horizontal .nut-tabs-titles {
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  height: var(--nutui-tabs-titles-height, 44rpx);
  width: 100%;
}
.nut-tabs-vertical .nut-tabs-horizontal .nut-tabs-titles .nut-tabs-list {
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  height: auto;
}
.nut-tabs-vertical .nut-tabs-horizontal .nut-tabs-content {
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
}
.nut-tabs-vertical .nut-tabs-horizontal .nut-tabs-titles-item-active {
  background-color: transparent;
  background-color: initial;
}
.nut-tabs-vertical .nut-tabs-horizontal .nut-tabs-titles-item-active .nut-tabs-titles-item-line {
  left: 50%;
  -webkit-transform: translate(-50%);
  -ms-transform: translate(-50%);
  transform: translate(-50%);
  width: var(--nutui-tabs-tab-line-width, 12rpx);
  height: var(--nutui-tabs-tab-line-height, 2rpx);
  background: var(--nutui-tabs-tab-line-color, var(--nutui-color-primary, #ff0f23));
}
.nut-tabs-vertical .nut-tabs-horizontal .nut-tabs-titles-item-active .nut-tabs-titles-item-smile {
  left: 50%;
  right: auto;
  bottom: -3rpx;
  -webkit-transform: translate(-50%) rotate(0);
  -ms-transform: translate(-50%) rotate(0);
  transform: translate(-50%) rotate(0);
}
.nut-tabs-vertical .nut-tabs-content {
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  height: 100%;
}
.nut-tabs-vertical .nut-tabs-content-wrap {
  -webkit-flex: 1;
  -ms-flex: 1;
  flex: 1;
}
.nut-tabs-vertical .nut-tabs-content .nut-tabpane {
  height: 100%;
}
.nut-tabs-content {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}
.nut-tabs-content-wrap {
  overflow: hidden;
}
[dir='rtl'] .nut-tabs-titles-item-smile,
[dir='rtl'] .nut-tabs-titles-item-line,
.nut-rtl .nut-tabs-titles-item-smile,
.nut-rtl .nut-tabs-titles-item-line {
  left: auto;
  right: 50%;
  -webkit-transform: translate(50%);
  -ms-transform: translate(50%);
  transform: translate(50%);
}
[dir='rtl'] .nut-tabs-titles-divider .nut-tabs-titles-item::after,
.nut-rtl .nut-tabs-titles-divider .nut-tabs-titles-item::after {
  right: auto;
  left: 0;
}
[dir='rtl'] .nut-tabs-vertical .nut-tabs-titles-line .nut-tabs-titles-item,
.nut-rtl .nut-tabs-vertical .nut-tabs-titles-line .nut-tabs-titles-item {
  padding-left: 0;
  padding-right: 14rpx;
}
[dir='rtl'] .nut-tabs-vertical .nut-tabs-titles-item-active .nut-tabs-titles-item-line,
.nut-rtl .nut-tabs-vertical .nut-tabs-titles-item-active .nut-tabs-titles-item-line {
  left: auto;
  right: 10rpx;
}
[dir='rtl'] .nut-tabs-vertical .nut-tabs-titles-item-active .nut-tabs-titles-item-smile,
.nut-rtl .nut-tabs-vertical .nut-tabs-titles-item-active .nut-tabs-titles-item-smile {
  left: -12rpx;
  right: auto;
  -webkit-transform: rotate(-320deg);
  -ms-transform: rotate(-320deg);
  transform: rotate(-320deg);
}
[dir='rtl'] .nut-tabs-vertical .nut-tabs-horizontal .nut-tabs-titles-item-active .nut-tabs-titles-item-line,
.nut-rtl .nut-tabs-vertical .nut-tabs-horizontal .nut-tabs-titles-item-active .nut-tabs-titles-item-line {
  left: auto;
  right: 50%;
  -webkit-transform: translate(50%);
  -ms-transform: translate(50%);
  transform: translate(50%);
}
[dir='rtl'] .nut-tabs-vertical .nut-tabs-horizontal .nut-tabs-titles-item-active .nut-tabs-titles-item-smile,
.nut-rtl .nut-tabs-vertical .nut-tabs-horizontal .nut-tabs-titles-item-active .nut-tabs-titles-item-smile {
  right: 50%;
  left: auto;
  -webkit-transform: translate(50%) rotate(0);
  -ms-transform: translate(50%) rotate(0);
  transform: translate(50%) rotate(0);
}
.nut-tabpane {
  width: 100%;
  -webkit-flex-shrink: 0;
  -ms-flex-negative: 0;
  flex-shrink: 0;
  display: block;
  background-color: var(--nutui-tabs-tabpane-background-color, #fff);
  color: var(--nutui-color-title, #1a1a1a);
  padding: var(--nutui-tabs-tabpane-padding, 24rpx 20rpx);
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  overflow: auto;
}
.nut-tabpane.inactive {
  overflow: visible;
  height: 0;
}
.nut-table {
  overflow: hidden;
  position: relative;
  word-wrap: break-word;
  word-break: break-all;
}
.nut-table-wrapper {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  width: 100%;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  font-size: var(--nutui-font-size-base, 14rpx);
  color: var(--nutui-color-title, #1a1a1a);
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  border: 1rpx solid var(--nutui-table-border-color, var(--nutui-color-border, rgba(0, 0, 0, 0.06)));
}
.nut-table-wrapper-sticky {
  overflow-x: auto;
}
.nut-table-main {
  display: table;
  width: -webkit-max-content;
  width: -moz-max-content;
  width: max-content;
  overflow-x: auto;
  color: var(--nutui-color-title, #1a1a1a);
  background-color: var(--nutui-color-background-overlay, #ffffff);
  table-layout: fixed;
  min-width: 100%;
  position: relative;
}
.nut-table-main-striped .nut-table-main-head-tr {
  background-color: var(--nutui-table-tr-even-bg-color, var(--nutui-color-background, #f2f3f5));
}
.nut-table-main-striped .nut-table-main-body-tr:nth-child(odd) {
  background-color: var(--nutui-table-tr-odd-bg-color, #ffffff);
}
.nut-table-main-striped .nut-table-main-body-tr:nth-child(2n) {
  background-color: var(--nutui-table-tr-even-bg-color, var(--nutui-color-background, #f2f3f5));
}
.nut-table-main-head,
.nut-table-main-body {
  background: inherit;
}
.nut-table-main-head-tr,
.nut-table-main-body-tr {
  display: table-row;
  background: inherit;
}
.nut-table-main-head-tr:last-child .nut-table-main-body-tr-td,
.nut-table-main-body-tr:last-child .nut-table-main-body-tr-td {
  border-bottom: none;
}
.nut-table-main-head-tr-th,
.nut-table-main-body-tr-th {
  display: table-cell;
  padding: var(--nutui-table-cols-padding, 10rpx);
  table-layout: fixed;
  background: inherit;
  position: -webkit-sticky;
  position: sticky;
  top: 0;
}
.nut-table-main-head-tr-th.nut-table-fixed-left,
.nut-table-main-head-tr-th.nut-table-fixed-right,
.nut-table-main-body-tr-th.nut-table-fixed-left,
.nut-table-main-body-tr-th.nut-table-fixed-right {
  z-index: 4;
}
.nut-table-main-head-tr-th:last-child,
.nut-table-main-body-tr-th:last-child {
  border-right: none;
}
.nut-table-main-head-tr-td,
.nut-table-main-body-tr-td {
  display: table-cell;
  padding: var(--nutui-table-cols-padding, 10rpx);
  table-layout: fixed;
  background: inherit;
}
.nut-table-main-head-tr-td:last-child,
.nut-table-main-body-tr-td:last-child {
  border-right: none;
}
.nut-table-main-head-tr-td-nodata,
.nut-table-main-body-tr-td-nodata {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  height: 50rpx;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
}
.nut-table-main-head-tr-border,
.nut-table-main-body-tr-border {
  border-right: 1rpx solid var(--nutui-table-border-color, var(--nutui-color-border, rgba(0, 0, 0, 0.06)));
  border-bottom: 1rpx solid var(--nutui-table-border-color, var(--nutui-color-border, rgba(0, 0, 0, 0.06)));
}
.nut-table-main-head-tr-alignleft,
.nut-table-main-head-tr-align,
.nut-table-main-body-tr-alignleft,
.nut-table-main-body-tr-align {
  text-align: left;
}
.nut-table-main-head-tr-aligncenter,
.nut-table-main-body-tr-aligncenter {
  text-align: center;
}
.nut-table-main-head-tr-alignright,
.nut-table-main-body-tr-alignright {
  text-align: right;
}
.nut-table-main-head {
  display: table-header-group;
}
.nut-table-main-body {
  display: table-row-group;
}
.nut-table-sticky-left,
.nut-table-sticky-right {
  position: absolute;
  top: 0;
  width: 8rpx;
  bottom: -1rpx;
  overflow-x: hidden;
  overflow-y: hidden;
  -webkit-box-shadow: none;
  box-shadow: none;
  -ms-touch-action: none;
  touch-action: none;
  pointer-events: none;
  z-index: 3;
  background: transparent;
}
.nut-table-sticky-left {
  left: 1rpx;
  -webkit-box-shadow: var(--nutui-table-sticky-left-shadow, 4rpx 0 8rpx 0 rgba(0, 0, 0, 0.1));
  box-shadow: var(--nutui-table-sticky-left-shadow, 4rpx 0 8rpx 0 rgba(0, 0, 0, 0.1));
}
.nut-table-sticky-right {
  right: 1rpx;
  -webkit-box-shadow: var(--nutui-table-sticky-right-shadow, -4rpx 0 8rpx 0 rgba(0, 0, 0, 0.1));
  box-shadow: var(--nutui-table-sticky-right-shadow, -4rpx 0 8rpx 0 rgba(0, 0, 0, 0.1));
}
.nut-table-fixed-left,
.nut-table-fixed-right {
  position: -webkit-sticky;
  position: sticky;
  z-index: 2;
}
.nut-table-fixed-left.h5-div,
.nut-table-fixed-right.h5-div {
  padding: var(--nutui-table-cols-padding, 10rpx) 0;
}
.nut-table-fixed-left-last {
  border-right: none;
}
.nut-table-summary {
  color: var(--nutui-color-title, #1a1a1a);
  background-color: var(--nutui-color-background-overlay, #ffffff);
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  height: 30rpx;
  padding: var(--nutui-table-cols-padding, 10rpx);
  position: relative;
  z-index: 5;
}
[dir='rtl'] .nut-table-main-head-tr-th:last-child,
[dir='rtl'] .nut-table-main-body-tr-th:last-child,
.nut-rtl .nut-table-main-head-tr-th:last-child,
.nut-rtl .nut-table-main-body-tr-th:last-child {
  border-right: none;
  border-left: none;
}
[dir='rtl'] .nut-table-main-head-tr-td:last-child,
[dir='rtl'] .nut-table-main-body-tr-td:last-child,
.nut-rtl .nut-table-main-head-tr-td:last-child,
.nut-rtl .nut-table-main-body-tr-td:last-child {
  border-right: none;
  border-left: none;
}
[dir='rtl'] .nut-table-main-head-tr-border,
[dir='rtl'] .nut-table-main-body-tr-border,
.nut-rtl .nut-table-main-head-tr-border,
.nut-rtl .nut-table-main-body-tr-border {
  border-right: none;
  border-left: 1rpx solid var(--nutui-table-border-color, var(--nutui-color-border, rgba(0, 0, 0, 0.06)));
}
[dir='rtl'] .nut-table-main-head-tr-alignleft,
[dir='rtl'] .nut-table-main-head-tr-align,
[dir='rtl'] .nut-table-main-body-tr-alignleft,
[dir='rtl'] .nut-table-main-body-tr-align,
.nut-rtl .nut-table-main-head-tr-alignleft,
.nut-rtl .nut-table-main-head-tr-align,
.nut-rtl .nut-table-main-body-tr-alignleft,
.nut-rtl .nut-table-main-body-tr-align {
  text-align: right;
}
[dir='rtl'] .nut-table-main-head-tr-alignright,
[dir='rtl'] .nut-table-main-body-tr-alignright,
.nut-rtl .nut-table-main-head-tr-alignright,
.nut-rtl .nut-table-main-body-tr-alignright {
  text-align: left;
}
[dir='rtl'] .nut-table-sticky-left,
.nut-rtl .nut-table-sticky-left {
  left: auto;
  right: 1rpx;
  -webkit-box-shadow: var(--nutui-table-sticky-right-shadow, -4rpx 0 8rpx 0 rgba(0, 0, 0, 0.1));
  box-shadow: var(--nutui-table-sticky-right-shadow, -4rpx 0 8rpx 0 rgba(0, 0, 0, 0.1));
}
[dir='rtl'] .nut-table-sticky-right,
.nut-rtl .nut-table-sticky-right {
  right: auto;
  left: 1rpx;
  -webkit-box-shadow: var(--nutui-table-sticky-left-shadow, 4rpx 0 8rpx 0 rgba(0, 0, 0, 0.1));
  box-shadow: var(--nutui-table-sticky-left-shadow, 4rpx 0 8rpx 0 rgba(0, 0, 0, 0.1));
}
[dir='rtl'] .nut-table-fixed-left-last,
.nut-rtl .nut-table-fixed-left-last {
  border-right: none;
  border-left: none;
}
.nut-tabbar-item {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-flex: 1;
  -ms-flex: 1;
  flex: 1;
  padding: 6rpx 0 2rpx;
  color: var(--nutui-tabbar-inactive-color, var(--nutui-color-title, #1a1a1a));
  height: 100%;
}
.nut-tabbar-item .nut-icon {
  width: 24rpx;
  height: 24rpx;
  font-size: 24rpx;
  color: var(--nutui-tabbar-inactive-color, var(--nutui-color-title, #1a1a1a));
  color: inherit;
}
.nut-tabbar-item-text {
  display: block;
  color: var(--nutui-color-text, #505259);
  font-size: var(--nutui-tabbar-text-font-size, var(--nutui-font-size-xxs, 10rpx));
  line-height: var(--nutui-tabbar-text-font-size, var(--nutui-font-size-xxs, 10rpx));
  margin-top: var(--nutui-tabbar-text-margin-top, 4rpx);
}
.nut-tabbar-item .nut-image-default {
  width: 38rpx;
  height: 38rpx;
  border-radius: 38rpx;
}
.nut-tabbar-item-large {
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  padding: 0;
}
.nut-tabbar-item-large .nut-tabbar-item-text {
  font-size: var(--nutui-tabbar-text-large-font-size, var(--nutui-font-size-l, 15rpx));
  margin-top: 0;
  line-height: var(--nutui-tabbar-text-large-font-size, var(--nutui-font-size-l, 15rpx));
  font-weight: var(--nutui-tabbar-text-large-font-weight, var(--nutui-font-weight, 400));
}
.nut-tabbar-item-active {
  color: var(--nutui-tabbar-active-color, var(--nutui-color-primary, #ff0f23));
}
.nut-tabbar-item-active .nut-tabbar-item-text,
.nut-tabbar-item-active .nut-icon {
  color: var(--nutui-tabbar-active-color, var(--nutui-color-primary, #ff0f23));
  color: inherit;
}
.nut-tabbar {
  border: 0rpx;
  -webkit-box-shadow: var(--nutui-tabbar-box-shadow, none);
  box-shadow: var(--nutui-tabbar-box-shadow, none);
  border-bottom: var(--nutui-tabbar-border-bottom, 0);
  border-top: var(--nutui-tabbar-border-top, 0);
  width: 100%;
  background: var(--nutui-color-background-overlay, #ffffff);
}
.nut-tabbar-wrap {
  height: var(--nutui-tabbar-height, 46rpx);
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
}
.nut-tabbar-wrap-3 {
  padding: 0 16rpx;
}
.nut-tabbar-wrap-2 {
  padding: 0 32rpx;
}
.nut-tabbar-wrap-horizontal {
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
}
.nut-tabbar-wrap-horizontal .nut-tabbar-item {
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
}
.nut-tabbar-wrap-horizontal .nut-tabbar-item .nut-icon {
  width: 20rpx;
  height: 20rpx;
}
.nut-tabbar-wrap-horizontal .nut-tabbar-item .nut-tabbar-item-text {
  margin: 0 4rpx 0 6rpx;
  font-size: 14rpx;
}
.nut-tabbar-wrap-horizontal .nut-tabbar-item .nut-badge-sup::after {
  border: 0;
}
.nut-tabbar-fixed {
  position: fixed;
  bottom: 0;
  left: 0;
}
[dir='rtl'] .nut-tabbar:last-child,
.nut-rtl .nut-tabbar:last-child {
  border-right: none;
  border-left: 0;
}
[dir='rtl'] .nut-tabbar-fixed,
.nut-rtl .nut-tabbar-fixed {
  left: auto;
  right: 0;
}
.nut-switch {
  cursor: pointer;
  position: relative;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  display: -webkit-inline-flex;
  display: -ms-inline-flexbox;
  display: inline-flex;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  min-width: var(--nutui-switch-width, 46rpx);
  height: var(--nutui-switch-height, 28rpx);
  line-height: var(--nutui-switch-line-height, 28rpx);
  background-color: var(--nutui-switch-active-background-color, var(--nutui-color-primary, #ff0f23));
  border-radius: var(--nutui-switch-border-radius, 50rpx);
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: center center;
  -webkit-flex: 0 0 auto;
  -ms-flex: 0 0 auto;
  flex: 0 0 auto;
}
.nut-switch-button {
  position: absolute;
  top: 50%;
  -webkit-transform: translateY(-50%);
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  height: calc(var(--nutui-switch-height, 28rpx) - var(--nutui-switch-border-width, 2rpx) * 2);
  width: calc(var(--nutui-switch-height, 28rpx) - var(--nutui-switch-border-width, 2rpx) * 2);
  border-radius: var(--nutui-switch-inside-border-radius, 50%);
  background: #fff;
  -webkit-transition: left 0.3s linear;
  transition: left 0.3s linear;
  -webkit-box-shadow: var(--nutui-switch-inside-box-shadow, 0rpx 2rpx 6rpx 0rpx rgba(0, 0, 0, 0.1));
  box-shadow: var(--nutui-switch-inside-box-shadow, 0rpx 2rpx 6rpx 0rpx rgba(0, 0, 0, 0.1));
}
.nut-switch-button-open {
  left: calc(100% - var(--nutui-switch-height, 28rpx) + var(--nutui-switch-border-width, 2rpx));
}
.nut-switch-button-open-rtl,
.nut-switch-button-close {
  left: var(--nutui-switch-border-width, 2rpx);
}
.nut-switch-button-close-rtl {
  left: calc(100% - var(--nutui-switch-height, 28rpx) + var(--nutui-switch-border-width, 2rpx));
}
.nut-switch-button .nut-icon {
  width: calc((var(--nutui-switch-height, 28rpx) - var(--nutui-switch-border-width, 2rpx) * 2) / 2);
  height: calc((var(--nutui-switch-height, 28rpx) - var(--nutui-switch-border-width, 2rpx) * 2) / 2);
  color: var(--nutui-switch-active-disabled-background-color, var(--nutui-color-primary-disabled-special, #ffadbe));
}
.nut-switch-close {
  background-color: var(--nutui-switch-inactive-background-color, var(--nutui-color-text-disabled, #c2c4cc));
}
.nut-switch-close-line {
  width: calc((var(--nutui-switch-height, 28rpx) - var(--nutui-switch-border-width, 2rpx) * 2) / 2);
  height: 2rpx;
  background: var(--nutui-switch-inactive-line-background-color, #ffffff);
  border-radius: 2rpx;
}
.nut-switch-label {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  display: -webkit-inline-flex;
  display: -ms-inline-flexbox;
  display: inline-flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  height: 100%;
  white-space: nowrap;
  color: var(--nutui-switch-label-text-color, #ffffff);
  font-size: var(--nutui-switch-label-font-size, var(--nutui-font-size-s, 12rpx));
}
.nut-switch-label .nut-icon {
  color: var(--nutui-switch-label-text-color, #ffffff);
}
.nut-switch-label-open {
  margin: 0 calc(var(--nutui-switch-height, 28rpx) - var(--nutui-switch-border-width, 2rpx) + 3rpx) 0 7rpx;
}
.nut-switch-label-open-rtl,
.nut-switch-label-close {
  margin: 0 7rpx 0 calc(var(--nutui-switch-height, 28rpx) - var(--nutui-switch-border-width, 2rpx) + 3rpx);
}
.nut-switch-label-close-rtl {
  margin: 0 calc(var(--nutui-switch-height, 28rpx) - var(--nutui-switch-border-width, 2rpx) + 3rpx) 0 7rpx;
}
.nut-switch-label-close-disabled,
.nut-switch-label-close-disabled .nut-icon {
  color: var(--nutui-switch-inactive-disabled-label-text-color, var(--nutui-color-text-disabled, #c2c4cc));
}
.nut-switch-disabled {
  background-color: var(--nutui-switch-active-disabled-background-color, var(--nutui-color-primary-disabled-special, #ffadbe));
}
.nut-switch-disabled-close {
  background-color: var(--nutui-switch-inactive-disabled-background-color, var(--nutui-color-background, #f2f3f5));
}
.nut-swiper-item {
  height: 100%;
}
.nut-swiper {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}
.nut-swiper-canmove-horizontal {
  -ms-touch-action: pan-y;
  touch-action: pan-y;
}
.nut-swiper-canmove-vertical {
  -ms-touch-action: pan-x;
  touch-action: pan-x;
}
.nut-swiper-indicator {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  position: absolute;
  height: 4rpx;
  width: 100%;
  top: 89.33%;
  z-index: 10;
}
.nut-swiper-indicator-vertical {
  width: 8rpx;
  height: 100%;
  top: 0;
  left: 12rpx;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  z-index: 1;
}
.nut-swiper-inner {
  width: 100%;
  height: 100%;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  position: relative;
}
.nut-swiper-inner-vertical {
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
}
.nut-swiper-slide {
  width: 100%;
  height: 100%;
  position: relative;
  -webkit-flex-shrink: 0;
  -ms-flex-negative: 0;
  flex-shrink: 0;
}
.nut-swiper-item {
  width: 100%;
  height: 100%;
}
[dir='rtl'] .nut-swiper-indicator,
.nut-rtl .nut-swiper-indicator {
  left: auto;
  right: 50%;
}
[dir='rtl'] .nut-swiper-indicator-vertical,
.nut-rtl .nut-swiper-indicator-vertical {
  left: auto;
  right: 12rpx;
}
.nut-swipe {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  position: relative;
  overflow: hidden;
  cursor: -webkit-grab;
  cursor: grab;
  background-color: #fff;
}
.nut-swipe-wrapper {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  -webkit-justify-content: flex-start;
  -ms-flex-pack: start;
  justify-content: flex-start;
  -webkit-align-self: stretch;
  -ms-flex-item-align: stretch;
  align-self: stretch;
  width: 100%;
  -webkit-transition-timing-function: cubic-bezier(0.18, 0.89, 0.32, 1);
  transition-timing-function: cubic-bezier(0.18, 0.89, 0.32, 1);
  -webkit-transition-property: -webkit-transform;
  transition-property: -webkit-transform;
  transition-property:
    transform,
    -webkit-transform;
  transition-property: transform;
}
.nut-swipe-left,
.nut-swipe-right {
  position: absolute;
  top: 0;
}
.nut-swipe-left {
  left: 0;
  -webkit-transform: translate(-100%);
  -ms-transform: translate(-100%);
  transform: translate(-100%);
}
.nut-swipe-right {
  right: 0;
  -webkit-transform: translate(100%);
  -ms-transform: translate(100%);
  transform: translate(100%);
}
.nut-sticky-fixed {
  position: fixed;
}
.nut-steps {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
}
.nut-steps-horizontal {
  -webkit-flex-flow: row;
  -ms-flex-flow: row;
  flex-flow: row;
}
.nut-steps-horizontal .nut-step-head {
  background-color: var(--nutui-steps-background-color, #ffffff);
}
.nut-steps-horizontal .nut-step-head-icon .nut-icon {
  height: 10rpx;
  width: 10rpx;
}
.nut-steps-horizontal .nut-step-head-icon .nut-image {
  width: 100%;
  height: 100%;
  background-color: var(--nutui-steps-background-color, #ffffff);
}
.nut-steps-horizontal .nut-step-head-icon .nut-image .h5-img {
  vertical-align: top;
}
.nut-steps-horizontal .nut-step.nut-step-process .nut-step-title {
  color: var(--nutui-steps-process-title-color, var(--nutui-color-primary, #ff0f23));
}
.nut-steps-horizontal .nut-step.nut-step-process .nut-step-description {
  color: var(--nutui-steps-process-description-color, var(--nutui-color-primary, #ff0f23));
}
.nut-steps-horizontal .nut-step.nut-step-wait .nut-step-title {
  color: var(--nutui-steps-wait-title-color, var(--nutui-color-title, #1a1a1a));
}
.nut-steps-horizontal .nut-step.nut-step-wait .nut-step-description {
  color: var(--nutui-steps-wait-description-color, var(--nutui-color-text, #505259));
}
.nut-steps-horizontal-single .nut-step {
  padding-right: var(--nutui-steps-horizontal-item-padding-right, 28rpx);
}
.nut-steps-horizontal-single .nut-step-last {
  padding-right: 0 !important;
}
.nut-steps-horizontal-single .nut-step-line {
  top: 0;
  right: 0;
  height: var(--nutui-steps-base-head-height, 14rpx);
  width: var(--nutui-steps-horizontal-item-padding-right, 28rpx);
  padding: var(--nutui-steps-horizontal-item-line-padding, 0 8rpx);
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}
.nut-steps-horizontal-single .nut-step-title,
.nut-steps-horizontal-single .nut-step-description {
  padding-left: 4rpx;
}
.nut-steps-horizontal-single .nut-step-special {
  padding-right: var(--nutui-steps-horizontal-item-special-padding-right, 22rpx);
}
.nut-steps-horizontal-single .nut-step-special .nut-step-line {
  width: 100%;
}
.nut-steps-horizontal-single .nut-step-special .nut-step-title {
  padding-right: 8rpx;
  width: -webkit-fit-content;
  width: -moz-fit-content;
  width: fit-content;
}
.nut-steps-horizontal-single.nut-steps-horizontal-count-3 .nut-step-special {
  padding-right: var(--nutui-steps-horizontal-item-special-3-padding-right, 9rpx);
}
.nut-steps-horizontal-double {
  width: 100%;
  -webkit-justify-content: space-between;
  -ms-flex-pack: justify;
  justify-content: space-between;
}
.nut-steps-horizontal-double .nut-step {
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-flex: 1;
  -ms-flex: 1;
  flex: 1;
}
.nut-steps-horizontal-double .nut-step-line {
  top: 0;
  right: -50%;
  height: var(--nutui-steps-base-head-height, 14rpx);
  width: 100%;
}
.nut-steps-horizontal-double .nut-step-line-inner {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  display: -webkit-inline-flex;
  display: -ms-inline-flexbox;
  display: inline-flex;
  height: var(--nutui-steps-base-line-height, 1rpx);
  width: 100%;
  background: var(--nutui-steps-base-line-background, var(--nutui-color-border, rgba(0, 0, 0, 0.06)));
}
.nut-steps-horizontal-double .nut-step-head {
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  margin-bottom: 6rpx;
}
.nut-steps-horizontal-double .nut-step-head-dot-wrap,
.nut-steps-horizontal-double .nut-step-head-icon-wrap,
.nut-steps-horizontal-double .nut-step-head-text-wrap {
  background-color: var(--nutui-steps-background-color, #ffffff);
  padding: var(--nutui-steps-horizontal-item-line-padding, 0 8rpx);
}
.nut-steps-horizontal-double .nut-step-head-icon {
  height: var(--nutui-steps-base-head-icon-size-right, 20rpx);
  width: var(--nutui-steps-base-head-icon-size-right, 20rpx);
}
.nut-steps-horizontal-double .nut-step-head-icon .nut-icon {
  height: 12rpx;
  width: 12rpx;
}
.nut-steps-horizontal-double .nut-step-main {
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  margin-left: 0;
  margin-top: 2rpx;
}
.nut-steps-horizontal-double.nut-steps-horizontal-icon .nut-step-head,
.nut-steps-horizontal-double.nut-steps-horizontal-icon .nut-step-line {
  height: var(--nutui-steps-base-head-icon-size-right, 20rpx);
}
.nut-steps-horizontal-double.nut-steps-horizontal-dot .nut-step-head,
.nut-steps-horizontal-double.nut-steps-horizontal-dot .nut-step-line {
  height: var(--nutui-steps-base-head-dot-size, 6rpx);
}
.nut-steps-horizontal-double.nut-steps-horizontal-text .nut-step-head,
.nut-steps-horizontal-double.nut-steps-horizontal-text .nut-step-line {
  height: var(--nutui-steps-base-head-text-size, 12rpx);
}
.nut-steps-vertical {
  -webkit-flex: 1;
  -ms-flex: 1;
  flex: 1;
  min-width: 0;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
}
.nut-steps-vertical .nut-step {
  padding-bottom: var(--nutui-steps-vertical-item-padding-bottom, 13rpx);
}
.nut-steps-vertical .nut-step-last {
  padding-bottom: 0 !important;
}
.nut-steps-vertical .nut-step-line {
  height: calc(100% - 4rpx);
  width: 1rpx;
  bottom: 0;
}
.nut-steps-vertical .nut-step-line-inner {
  height: 100%;
}
.nut-steps-vertical .nut-step-head {
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  height: 18rpx;
}
.nut-steps-vertical .nut-step-head-icon {
  width: var(--nutui-steps-vertical-item-icon-size, 20rpx);
  height: var(--nutui-steps-vertical-item-icon-size, 20rpx);
}
.nut-steps-vertical .nut-step-head-icon .nut-icon {
  height: 12rpx;
  width: 12rpx;
}
.nut-steps-vertical .nut-step-main {
  -webkit-flex: 1;
  -ms-flex: 1;
  flex: 1;
  min-width: 0;
  height: auto;
  margin-left: 8rpx;
}
.nut-steps-vertical .nut-step-title {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  height: var(--nutui-steps-vertical-line-height, 18rpx);
  font-size: var(--nutui-steps-vertical-title-font-size, var(--nutui-font-size-l, 15rpx));
  overflow: auto;
  font-weight: 500;
  margin-bottom: var(--nutui-steps-vertical-title-margin-bottom, 4rpx);
}
.nut-steps-vertical .nut-step-description {
  margin: var(--nutui-steps-vertical-description-margin, 0 0 1rpx);
  height: auto;
  line-height: var(--nutui-steps-vertical-line-height, 18rpx);
  color: var(--nutui-color-title, #1a1a1a);
  font-size: var(--nutui-steps-vertical-description-font-size, var(--nutui-font-size-base, 14rpx));
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}
.nut-steps-vertical .nut-step-head-dot-wrap,
.nut-steps-vertical .nut-step-head-icon-wrap,
.nut-steps-vertical .nut-step-head-text-wrap {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  width: 100%;
  background-color: #fff;
  position: relative;
  z-index: 1;
}
.nut-steps-vertical .nut-step-head-dot-wrap {
  height: calc(var(--nutui-steps-base-head-dot-size, 6rpx) + 8rpx);
}
.nut-steps-vertical .nut-step-head-icon-wrap {
  height: calc(var(--nutui-steps-vertical-item-icon-size, 20rpx) + 8rpx);
}
.nut-steps-vertical .nut-step-head-text-wrap {
  height: calc(var(--nutui-steps-base-head-text-size, 12rpx) + 8rpx);
}
.nut-steps-vertical-icon .nut-step-head {
  width: calc(var(--nutui-steps-vertical-item-icon-size, 20rpx) + 1rpx);
  min-width: calc(var(--nutui-steps-vertical-item-icon-size, 20rpx) + 1rpx);
}
.nut-steps-vertical-icon .nut-step-line {
  left: calc(var(--nutui-steps-vertical-item-icon-size, 20rpx) / 2);
}
.nut-steps-vertical-dot .nut-step-head {
  width: calc(var(--nutui-steps-base-head-dot-size, 6rpx) + 1rpx);
}
.nut-steps-vertical-dot .nut-step-line {
  left: calc(var(--nutui-steps-base-head-dot-size, 6rpx) / 2);
}
.nut-steps-vertical-text .nut-step-head {
  width: calc(var(--nutui-steps-base-head-text-size, 12rpx) + 1rpx);
  min-width: calc(var(--nutui-steps-base-head-text-size, 12rpx) + 1rpx);
}
.nut-steps-vertical-text .nut-step-line {
  left: calc(var(--nutui-steps-base-head-text-size, 12rpx) / 2);
}
.nut-steps-horizontal-enhanced .nut-step-finish .nut-step-head-icon,
.nut-steps-horizontal-enhanced .nut-step-finish .nut-step-head-text,
.nut-steps-vertical-enhanced .nut-step-finish .nut-step-head-icon,
.nut-steps-vertical-enhanced .nut-step-finish .nut-step-head-text {
  background-color: var(--nutui-steps-enhanced-finish-head-background-color, var(--nutui-color-primary-light-pressed, #ffebf1));
}
.nut-steps-horizontal-enhanced .nut-step-finish .nut-step-head-icon .nut-icon,
.nut-steps-horizontal-enhanced .nut-step-finish .nut-step-head-text .nut-icon,
.nut-steps-vertical-enhanced .nut-step-finish .nut-step-head-icon .nut-icon,
.nut-steps-vertical-enhanced .nut-step-finish .nut-step-head-text .nut-icon {
  color: var(--nutui-steps-enhanced-finish-head-icon-color, var(--nutui-color-primary-stop-1, #ff475d));
}
.nut-steps-horizontal-enhanced .nut-step-finish .nut-step-head-text,
.nut-steps-vertical-enhanced .nut-step-finish .nut-step-head-text {
  color: var(--nutui-steps-enhanced-finish-head-text-color, var(--nutui-color-primary-stop-1, #ff475d));
}
.nut-steps-horizontal-enhanced .nut-step-finish .nut-step-head-dot,
.nut-steps-vertical-enhanced .nut-step-finish .nut-step-head-dot {
  background-color: var(--nutui-steps-enhanced-finish-head-dot-background-color, var(--nutui-color-primary-disabled-special, #ffadbe));
}
.nut-step {
  position: relative;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
}
.nut-step-last .nut-step-line {
  display: none;
}
.nut-step-head {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  height: var(--nutui-steps-base-head-height, 14rpx);
  position: relative;
  z-index: 1;
}
.nut-step-head-text {
  height: var(--nutui-steps-base-head-text-size, 12rpx);
  width: var(--nutui-steps-base-head-text-size, 12rpx);
  background-color: var(--nutui-steps-base-head-background-color, var(--nutui-color-background, #f2f3f5));
  color: var(--nutui-steps-base-head-color, var(--nutui-color-text, #505259));
  font-size: var(--nutui-steps-base-icon-size, var(--nutui-font-size-xxs, 10rpx));
}
.nut-step-head-icon {
  height: var(--nutui-steps-base-head-icon-size, 16rpx);
  width: var(--nutui-steps-base-head-icon-size, 16rpx);
  background-color: var(--nutui-steps-base-head-background-color, var(--nutui-color-background, #f2f3f5));
}
.nut-step-head-icon .nut-icon {
  color: #fff;
}
.nut-step-head-dot {
  height: var(--nutui-steps-base-head-dot-size, 6rpx);
  width: var(--nutui-steps-base-head-dot-size, 6rpx);
  background-color: var(--nutui-steps-base-head-dot-background-color, var(--nutui-color-text-disabled, #c2c4cc));
}
.nut-step-head-dot,
.nut-step-head-icon,
.nut-step-head-text {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  border-radius: 50%;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  border: var(--nutui-steps-base-head-border, none);
}
.nut-step-line {
  position: absolute;
  z-index: 0;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
}
.nut-step-line-inner {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex: 1;
  -ms-flex: 1;
  flex: 1;
  height: var(--nutui-steps-base-line-height, 1rpx);
  background: var(--nutui-steps-base-line-background, var(--nutui-color-border, rgba(0, 0, 0, 0.06)));
}
.nut-step-main {
  position: relative;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  min-height: var(--nutui-steps-base-head-height, 14rpx);
}
.nut-step-line,
.nut-step-title {
  background-color: #fff;
}
.nut-step-title {
  position: relative;
  z-index: 1;
}
.nut-step-title {
  height: 14rpx;
  line-height: 14rpx;
  font-size: var(--nutui-steps-base-title-font-size, var(--nutui-font-size-s, 12rpx));
  color: var(--nutui-steps-base-title-color, var(--nutui-color-title, #1a1a1a));
  overflow: hidden;
  white-space: nowrap;
}
.nut-step-description {
  height: 16rpx;
  line-height: 16rpx;
  margin-top: var(--nutui-steps-base-title-margin-bottom, 2rpx);
  font-size: var(--nutui-steps-base-description-font-size, var(--nutui-font-size-xxs, 10rpx));
  color: var(--nutui-steps-base-description-color, var(--nutui-color-text-help, #888b94));
  overflow: hidden;
}
.nut-step.nut-step-process .nut-step-head-icon,
.nut-step.nut-step-process .nut-step-head-text,
.nut-step.nut-step-process .nut-step-head-dot {
  background-color: var(--nutui-steps-process-head-background-color, var(--nutui-color-primary, #ff0f23));
}
.nut-step.nut-step-process .nut-step-head-text {
  color: var(--nutui-steps-process-color, #ffffff);
}
.nut-step.nut-step-wait .nut-step-head-icon .nut-icon {
  color: var(--nutui-steps-wait-icon-color, var(--nutui-color-text-help, #888b94));
}
.nut-step.nut-step-finish .nut-step-head-icon .nut-icon {
  color: var(--nutui-steps-finish-icon-color, var(--nutui-color-text-help, #888b94));
}
.nut-step.nut-step-business .nut-step-head-text {
  color: var(--nutui-steps-business-head-text-color, var(--nutui-color-service-pressed));
}
.nut-step.nut-step-business .nut-step-title {
  color: var(--nutui-steps-business-title-color, var(--nutui-color-service-pressed));
}
.nut-step.nut-step-business .nut-step-description {
  color: var(--nutui-steps-business-description-color, var(--nutui-color-service-pressed));
}
.nut-step.nut-step-business .nut-step-head-dot {
  background-color: var(--nutui-steps-business-head-dot-background-color, var(--nutui-color-service-pressed));
}
.nut-step.nut-step-business .nut-step-head-icon,
.nut-step.nut-step-business .nut-step-head-text {
  background-color: var(--nutui-steps-business-head-background-color, var(--nutui-color-service));
}
.nut-step.nut-step-business .nut-step-head-icon .nut-icon {
  color: var(--nutui-steps-business-head-icon-color, var(--nutui-color-service-pressed));
}
.nut-space {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
}
.nut-space-item {
  -webkit-flex: none;
  -ms-flex: none;
  flex: none;
}
.nut-space-vertical {
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
}
.nut-space-vertical-item {
  margin-bottom: var(--nutui-space-gap, 8rpx);
}
.nut-space-vertical-item-last {
  margin-bottom: 0;
}
.nut-space-horizontal {
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
}
.nut-space-horizontal-item {
  margin-right: var(--nutui-space-gap, 8rpx);
}
.nut-space-horizontal-item-last {
  margin-right: 0;
}
.nut-space-horizontal-wrap {
  -webkit-flex-wrap: wrap;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
  margin-bottom: calc(var(--nutui-space-gap, 8rpx) * -1);
}
.nut-space-horizontal-wrap-item {
  padding-bottom: var(--nutui-space-gap, 8rpx);
}
.nut-space-align-center {
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
}
.nut-space-align-start {
  -webkit-align-items: flex-start;
  -ms-flex-align: start;
  align-items: flex-start;
}
.nut-space-align-end {
  -webkit-align-items: flex-end;
  -ms-flex-align: end;
  align-items: flex-end;
}
.nut-space-align-baseline {
  -webkit-align-items: baseline;
  -ms-flex-align: baseline;
  align-items: baseline;
}
.nut-space-justify-center {
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
}
.nut-space-justify-start {
  -webkit-justify-content: flex-start;
  -ms-flex-pack: start;
  justify-content: flex-start;
}
.nut-space-justify-end {
  -webkit-justify-content: flex-end;
  -ms-flex-pack: end;
  justify-content: flex-end;
}
.nut-space-justify-between {
  -webkit-justify-content: space-between;
  -ms-flex-pack: justify;
  justify-content: space-between;
}
.nut-space-justify-around {
  -webkit-justify-content: space-around;
  -ms-flex-pack: distribute;
  justify-content: space-around;
}
.nut-space-justify-evenly {
  -webkit-justify-content: space-evenly;
  -ms-flex-pack: space-evenly;
  justify-content: space-evenly;
}
.nut-space-justify-stretch {
  -webkit-justify-content: stretch;
  -ms-flex-pack: stretch;
  justify-content: stretch;
}
[dir='rtl'] .nut-space-horizontal > .nut-space-item,
.nut-rtl .nut-space-horizontal > .nut-space-item {
  margin-right: 0;
  margin-left: var(--nutui-space-gap, 8rpx);
}
[dir='rtl'] .nut-space-horizontal > .nut-space-item:last-child,
.nut-rtl .nut-space-horizontal > .nut-space-item:last-child {
  margin-right: 0;
  margin-left: 0;
}
.nut-skeleton {
  line-height: 0rpx;
  font-size: 0rpx;
}
.nut-skeleton-content {
  position: relative;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  display: -webkit-inline-flex;
  display: -ms-inline-flexbox;
  display: inline-flex;
  width: var(--nutui-skeleton-line-width, 100%);
  background: var(--nutui-skeleton-background, var(--nutui-color-background-sunken, #f7f8fc));
  border-radius: var(--nutui-skeleton-line-border-radius, var(--nutui-radius-xs, 4rpx));
  overflow: hidden;
}
.nut-skeleton-content-normal {
  height: var(--nutui-skeleton-line-normal-height, 24rpx);
}
.nut-skeleton-content-large {
  height: var(--nutui-skeleton-line-large-height, 32rpx);
}
.nut-skeleton-content-small {
  height: var(--nutui-skeleton-line-small-height, 16rpx);
  margin-top: 8rpx;
}
.nut-skeleton-content-small-0 {
  margin-top: 0;
}
.nut-skeleton-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  background: -webkit-gradient(linear, left top, right top, from(rgba(0, 0, 0, 0)), color-stop(rgba(0, 0, 0, 0.01961)), to(rgba(0, 0, 0, 0)));
  background: -webkit-linear-gradient(left, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.01961), rgba(0, 0, 0, 0));
  background: linear-gradient(90deg, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.01961), rgba(0, 0, 0, 0));
  -webkit-animation-name: nut-skeleton;
  animation-name: nut-skeleton;
  -webkit-animation-delay: 0s;
  animation-delay: 0s;
  -webkit-animation-duration: 0.6s;
  animation-duration: 0.6s;
  -webkit-animation-direction: normal;
  animation-direction: normal;
  -webkit-animation-fill-mode: both;
  animation-fill-mode: both;
  -webkit-animation-play-state: running;
  animation-play-state: running;
  -webkit-animation-iteration-count: 1;
  animation-iteration-count: 1;
  -webkit-animation-timing-function: linear;
  animation-timing-function: linear;
}
@keyframes nut-skeleton {
  0% {
    -webkit-transform: translate(-100%);
    transform: translate(-100%);
  }
  to {
    -webkit-transform: translate(100%);
    transform: translate(100%);
  }
}
[dir='rtl'] .nut-skeleton-animation,
.nut-rtl .nut-skeleton-animation {
  left: auto;
  right: 0;
  -webkit-animation: nut-skeleton-rtl 2s linear 0s infinite;
  animation: nut-skeleton-rtl 2s linear 0s infinite;
}
@keyframes nut-skeleton-rtl {
  0% {
    -webkit-transform: translate(100%);
    transform: translate(100%);
  }
  to {
    -webkit-transform: translate(-100%);
    transform: translate(-100%);
  }
}
.nut-signature .spcanvas_WEAPP {
  width: 100%;
  height: 100%;
}
.nut-signature .spcanvas_WEAPP Canvas {
  width: 100%;
}
.nut-signature-inner {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  height: var(--nutui-signature-height, 10rem);
  border: var(--nutui-signature-border-width, 1rpx) solid var(--nutui-signature-border-color, var(--nutui-color-border, rgba(0, 0, 0, 0.06)));
  background-color: var(--nutui-signature-background-color, var(--nutui-color-background-overlay, #ffffff));
}
.nut-signature-unsupport {
  font-size: var(--nutui-signature-font-size, var(--nutui-font-size-base, 14rpx));
}
.nut-sidebaritem {
  width: 100%;
  height: 100%;
  -webkit-flex-shrink: 0;
  -ms-flex-negative: 0;
  flex-shrink: 0;
  display: block;
  background-color: var(--nutui-sidebar-item-background, #ffffff);
  color: var(--nutui-color-title, #1a1a1a);
  padding: var(--nutui-sidebar-item-padding, 24rpx 20rpx);
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  overflow: auto;
}
.nut-sidebaritem.inactive {
  overflow: visible;
  height: 0;
}
.nut-sidebar {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
}
.nut-sidebar-content {
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  height: 100%;
}
.nut-sidebar-content-wrap {
  -webkit-flex: 1;
  -ms-flex: 1;
  flex: 1;
  overflow: hidden;
}
.nut-sidebar-titles {
  background: var(--nutui-sidebar-background-color, var(--nutui-color-background, #f2f3f5));
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  border-radius: var(--nutui-sidebar-border-radius, 0);
  height: 100%;
  width: var(--nutui-sidebar-width, 104rpx);
  max-width: var(--nutui-sidebar-max-width, 128rpx);
  -webkit-flex-shrink: 0;
  -ms-flex-negative: 0;
  flex-shrink: 0;
}
.nut-sidebar-titles::-webkit-scrollbar {
  display: none;
  width: 0;
  background: transparent;
}
.nut-sidebar-titles .nut-sidebar-list {
  width: 100%;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  -webkit-flex-shrink: 0;
  -ms-flex-negative: 0;
  flex-shrink: 0;
}
.nut-sidebar-titles-scrollable {
  overflow-x: hidden;
  overflow-y: auto;
}
.nut-sidebar-titles-item {
  cursor: pointer;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  height: var(--nutui-sidebar-title-height, 52rpx);
  font-size: var(--nutui-sidebar-inactive-font-size, var(--nutui-font-size-base, 14rpx));
  color: var(--nutui-color-text, #505259);
}
.nut-sidebar-titles-item-text {
  text-align: center;
  white-space: normal;
  width: var(--nutui-sidebar-width, 104rpx);
}
.nut-sidebar-titles-item-active .nut-sidebar-titles-item-text {
  font-family: PingFangSC-Semibold;
  color: var(--nutui-sidebar-active-color, var(--nutui-color-primary, #ff0f23));
  font-weight: var(--nutui-sidebar-active-font-weight, var(--nutui-font-weight-bold, 600));
  font-size: var(--nutui-sidebar-active-font-size, var(--nutui-font-size-l, 15rpx));
}
.nut-sidebar-titles-item-disabled {
  color: var(--nutui-color-text-disabled, #c2c4cc);
  cursor: not-allowed;
}
.nut-shortpassword-popup {
  padding: 32rpx 24rpx 28rpx;
  border-radius: 12rpx;
  text-align: center;
}
.nut-shortpassword-title {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  line-height: 1;
  font-size: var(--nutui-font-size-l, 15rpx);
  color: var(--nutui-color-title, #1a1a1a);
}
.nut-shortpassword-description {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  margin-top: 12rpx;
  margin-bottom: 24rpx;
  line-height: 1;
  font-size: var(--nutui-font-size-s, 12rpx);
  color: var(--nutui-color-text, #505259);
}
.nut-shortpassword-input {
  padding: 0 0 10rpx;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.nut-shortpassword-input-real {
  position: absolute;
  right: 0;
  width: 247rpx;
  height: 41rpx;
  outline: 0 none;
  border: 0;
  text-decoration: none;
  z-index: -99;
}
.nut-shortpassword-input-site {
  width: 247rpx;
  height: 41rpx;
  border-radius: 4rpx;
}
.nut-shortpassword-input-fake {
  top: 5%;
  width: 100%;
  height: 41rpx;
  margin: 0 auto;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  background: var(--nutui-shortpassword-background-color, var(--nutui-color-background, #f2f3f5));
  border-radius: 4rpx;
  border: 1rpx solid var(--nutui-shortpassword-border-color, var(--nutui-color-background, #f2f3f5));
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  position: absolute;
  left: 0;
}
.nut-shortpassword-input-fake-li {
  -webkit-flex: 1;
  -ms-flex: 1;
  flex: 1;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
}
.nut-shortpassword-input-fake-li-icon {
  height: 6rpx;
  width: 6rpx;
  border-radius: 50%;
  background: #000;
  display: inline-block;
}
.nut-shortpassword-message {
  margin-top: 9rpx;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-justify-content: space-between;
  -ms-flex-pack: justify;
  justify-content: space-between;
  width: 247rpx;
}
.nut-shortpassword-message-error {
  line-height: 1;
  font-size: var(--nutui-font-size-xs, 11rpx);
  color: var(--nutui-shortpassword-error, var(--nutui-color-primary, #ff0f23));
}
.nut-shortpassword-message-forget {
  line-height: 1;
  font-size: var(--nutui-font-size-s, 12rpx);
  color: var(--nutui-shortpassword-forget, var(--nutui-color-text-help, #888b94));
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
}
.nut-shortpassword-message-forget .nut-icon {
  margin-right: 3rpx;
}
.nut-shortpassword-footer {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-justify-content: space-between;
  -ms-flex-pack: justify;
  justify-content: space-between;
  margin-top: 20rpx;
}
.nut-shortpassword-footer-cancel {
  background: #fff;
  border: 1rpx solid var(--nutui-color-primary, #ff0f23);
  border-radius: 15rpx;
  padding: 8rpx 38rpx;
  line-height: 1;
  font-size: var(--nutui-font-size-base, 14rpx);
  color: var(--nutui-color-primary, #ff0f23);
}
.nut-shortpassword-footer-sure {
  background: -webkit-linear-gradient(315deg, var(--nutui-color-primary, #ff0f23) 0%, var(--nutui-color-primary-stop-2, #ff0f23) 100%);
  background: linear-gradient(135deg, var(--nutui-color-primary, #ff0f23) 0%, var(--nutui-color-primary-stop-2, #ff0f23) 100%);
  border-radius: 15rpx;
  padding: 8rpx 38rpx;
  line-height: 1;
  font-size: var(--nutui-font-size-base, 14rpx);
  color: #fff;
}
[dir='rtl'] .nut-shortpassword-input-real,
.nut-rtl .nut-shortpassword-input-real {
  right: auto;
  left: 0;
}
[dir='rtl'] .nut-shortpassword-input-fake,
.nut-rtl .nut-shortpassword-input-fake {
  left: auto;
  right: 0;
}
[dir='rtl'] .nut-shortpassword-footer-sure,
.nut-rtl .nut-shortpassword-footer-sure {
  background: -webkit-linear-gradient(225deg, var(--nutui-color-primary, #ff0f23) 0%, var(--nutui-color-primary-stop-2, #ff0f23) 100%);
  background: linear-gradient(-135deg, var(--nutui-color-primary, #ff0f23) 0%, var(--nutui-color-primary-stop-2, #ff0f23) 100%);
}
.nut-segmented {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  display: -webkit-inline-flex;
  display: -ms-inline-flexbox;
  display: inline-flex;
  height: var(--nutui-segmented-height, 24rpx);
  min-width: 24rpx;
  padding: var(--nutui-segmented-padding, var(--nutui-spacing-xxxs, 2rpx));
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  border-radius: var(--nutui-segmented-radius, var(--nutui-radius-xs, 4rpx));
  background: var(--nutui-color-mask-part, rgba(0, 0, 0, 0.4));
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}
.nut-segmented-item {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  height: var(--nutui-segmented-height, 20rpx);
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  padding: var(--nutui-segmented-item-padding, 0 var(--nutui-spacing-xs, 6rpx));
  border-radius: var(--nutui-segmented-item-radius, var(--nutui-radius-xs, 4rpx));
  color: var(--nutui-segmented-item-color, #ffffff);
  font-size: var(--nutui-segmented-item-fontsize, var(--nutui-font-size-s, 12rpx));
  line-height: 1;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}
.nut-segmented-item-active {
  background: var(--nutui-segmented-active-background, var(--nutui-color-mask-part, rgba(0, 0, 0, 0.4)));
}
.nut-segmented-icon {
  height: 10rpx;
  width: 10rpx;
  margin-right: var(--nutui-segmented-icon-margin-right, var(--nutui-spacing-xxxs, 2rpx));
}
.nut-segmented-icon .nut-icon {
  height: 10rpx;
  width: 10rpx;
  font-size: 10rpx;
}
.nut-searchbar {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  width: var(--nutui-searchbar-width, 100%);
  padding: var(--nutui-searchbar-padding, 1rpx 8rpx);
  background: var(--nutui-searchbar-background, var(--nutui-color-background-sunken, #f7f8fc));
  color: var(--nutui-searchbar-color, var(--nutui-color-title, #1a1a1a));
  font-size: var(--nutui-searchbar-font-size, var(--nutui-font-size-base, 14rpx));
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
}
.nut-searchbar .nut-icon {
  width: var(--nutui-searchbar-icon-size, 20rpx);
  height: var(--nutui-searchbar-icon-size, 20rpx);
  font-size: var(--nutui-searchbar-icon-size, 20rpx);
}
.nut-searchbar-content {
  position: relative;
  -webkit-flex: 1;
  -ms-flex: 1;
  flex: 1;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  padding: 0 var(--nutui-searchbar-gap, 12rpx);
  height: var(--nutui-searchbar-input-height, 38rpx);
  background: var(--nutui-searchbar-content-background, var(--nutui-color-background-overlay, #ffffff));
  border-radius: var(--nutui-searchbar-content-border-radius, 8rpx);
  border: 1rpx solid var(--nutui-color-primary, #ff0f23);
}
.nut-searchbar-icon {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  color: var(--nutui-color-primary, #ff0f23);
}
.nut-searchbar-leftin {
  margin-right: var(--nutui-searchbar-inner-gap, 8rpx);
}
.nut-searchbar-rightin {
  font-size: 15rpx;
  font-weight: 500;
  color: var(--nutui-color-primary, #ff0f23);
}
.nut-searchbar-rightin.nut-searchbar-icon {
  color: var(--nutui-black-5);
}
.nut-searchbar-input-box,
.nut-searchbar-input {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-flex: 1;
  -ms-flex: 1;
  flex: 1;
}
.nut-searchbar-input {
  border: 0;
  outline: 0;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  width: 100%;
  padding: 0;
  margin: 0;
  font-size: var(--nutui-searchbar-font-size, var(--nutui-font-size-base, 14rpx));
  color: var(--nutui-searchbar-input-text-color, var(--nutui-color-title, #1a1a1a));
  caret-color: var(--nutui-searchbar-input-curror-color, var(--nutui-color-primary, #ff0f23));
  background: transparent;
  text-align: var(--nutui-searchbar-input-text-align, left);
}
.nut-searchbar-clear.nut-searchbar-icon {
  position: relative;
}
.nut-searchbar-clear.nut-searchbar-icon .nut-icon {
  width: 12rpx;
  height: 12rpx;
  color: var(--nutui-black-5);
  margin-right: var(--nutui-searchbar-inner-gap, 8rpx);
}
.nut-searchbar-clear.nut-searchbar-icon::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 200%;
  left: -20%;
}
.nut-searchbar-values {
  position: absolute;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  z-index: 2;
  background-color: #fff;
  top: 9rpx;
  left: 6rpx;
  font-size: 12rpx;
  line-height: 12rpx;
}
.nut-searchbar-values .nut-searchbar-value {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  padding: 4rpx 8rpx;
  background-color: #f7f8fc;
  border-radius: 4rpx;
  margin-right: 2rpx;
}
.nut-searchbar-values .nut-icon {
  width: 6rpx;
  height: 6rpx;
  font-size: 6rpx;
  color: #c2c4cc;
  margin-left: 4rpx;
}
.nut-searchbar-left,
.nut-searchbar-right {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  display: -webkit-inline-flex;
  display: -ms-inline-flexbox;
  display: inline-flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
}
.nut-searchbar-left.nut-icon,
.nut-searchbar-right.nut-icon {
  width: 20rpx;
  height: 20rpx;
}
.nut-searchbar-left {
  margin-right: var(--nutui-searchbar-gap, 12rpx);
}
.nut-searchbar-left > .h5-div,
.nut-searchbar-left > .h5-span,
.nut-searchbar-left > .h5-i,
.nut-searchbar-left > .h5-svg,
.nut-searchbar-left .nut-icon {
  margin-right: var(--nutui-searchbar-gap, 12rpx);
}
.nut-searchbar-left > .h5-div:last-child,
.nut-searchbar-left > .h5-span:last-child,
.nut-searchbar-left > .h5-i:last-child,
.nut-searchbar-left > .h5-svg:last-child,
.nut-searchbar-left .nut-icon:last-child {
  margin-right: 0;
}
.nut-searchbar-right {
  margin-left: var(--nutui-searchbar-gap, 12rpx);
}
.nut-searchbar-right > .h5-div,
.nut-searchbar-right > .h5-span,
.nut-searchbar-right > .h5-i,
.nut-searchbar-right > .h5-svg,
.nut-searchbar-right .nut-icon {
  margin-left: var(--nutui-searchbar-gap, 12rpx);
}
.nut-searchbar-right > .h5-div:first-child,
.nut-searchbar-right > .h5-span:first-child,
.nut-searchbar-right > .h5-i:first-child,
.nut-searchbar-right > .h5-svg:first-child,
.nut-searchbar-right .nut-icon:first-child {
  margin-left: 0;
}
.nut-searchbar-left > text,
.nut-searchbar-left > view {
  margin-right: var(--nutui-searchbar-gap, 12rpx);
}
.nut-searchbar-left > text:last-child,
.nut-searchbar-left > view:last-child {
  margin-right: 0;
}
.nut-searchbar-right > text,
.nut-searchbar-right > view {
  margin-left: var(--nutui-searchbar-gap, 12rpx);
}
.nut-searchbar-right > text:first-child,
.nut-searchbar-right > view:first-child {
  margin-left: 0;
}
.nut-searchbar-round {
  border-radius: var(--nutui-searchbar-content-round-border-radius, 19rpx);
}
.nut-searchbar-disabled {
  cursor: not-allowed;
}
.nut-searchbar-focus {
  padding: 5rpx var(--nutui-searchbar-gap, 12rpx);
}
.nut-searchbar-focus .nut-searchbar-content {
  border: 0.5rpx solid #ff5c67;
}
[dir='rtl'] .nut-searchbar-left,
.nut-rtl .nut-searchbar-left {
  margin-right: 0;
  margin-left: var(--nutui-searchbar-gap, 12rpx);
}
[dir='rtl'] .nut-searchbar-left > .h5-div,
[dir='rtl'] .nut-searchbar-left > .h5-span,
[dir='rtl'] .nut-searchbar-left > .h5-svg,
.nut-rtl .nut-searchbar-left > .h5-div,
.nut-rtl .nut-searchbar-left > .h5-span,
.nut-rtl .nut-searchbar-left > .h5-svg {
  margin-right: 0;
  margin-left: var(--nutui-searchbar-gap, 12rpx);
}
[dir='rtl'] .nut-searchbar-left > .h5-div.nut-icon,
[dir='rtl'] .nut-searchbar-left > .h5-span.nut-icon,
[dir='rtl'] .nut-searchbar-left > .h5-svg.nut-icon,
.nut-rtl .nut-searchbar-left > .h5-div.nut-icon,
.nut-rtl .nut-searchbar-left > .h5-span.nut-icon,
.nut-rtl .nut-searchbar-left > .h5-svg.nut-icon {
  -webkit-transform: rotate(180deg);
  -ms-transform: rotate(180deg);
  transform: rotate(180deg);
}
[dir='rtl'] .nut-searchbar-left > .h5-div:last-child,
[dir='rtl'] .nut-searchbar-left > .h5-span:last-child,
[dir='rtl'] .nut-searchbar-left > .h5-svg:last-child,
.nut-rtl .nut-searchbar-left > .h5-div:last-child,
.nut-rtl .nut-searchbar-left > .h5-span:last-child,
.nut-rtl .nut-searchbar-left > .h5-svg:last-child {
  margin-right: 0;
  margin-left: 0;
}
[dir='rtl'] .nut-searchbar-right,
.nut-rtl .nut-searchbar-right {
  margin-left: 0;
  margin-right: var(--nutui-searchbar-gap, 12rpx);
}
[dir='rtl'] .nut-searchbar-right > .h5-div,
[dir='rtl'] .nut-searchbar-right > .h5-span,
[dir='rtl'] .nut-searchbar-right > .h5-svg,
.nut-rtl .nut-searchbar-right > .h5-div,
.nut-rtl .nut-searchbar-right > .h5-span,
.nut-rtl .nut-searchbar-right > .h5-svg {
  margin-left: 0;
  margin-right: var(--nutui-searchbar-gap, 12rpx);
}
[dir='rtl'] .nut-searchbar-right > .h5-div:first-child,
[dir='rtl'] .nut-searchbar-right > .h5-span:first-child,
[dir='rtl'] .nut-searchbar-right > .h5-svg:first-child,
.nut-rtl .nut-searchbar-right > .h5-div:first-child,
.nut-rtl .nut-searchbar-right > .h5-span:first-child,
.nut-rtl .nut-searchbar-right > .h5-svg:first-child {
  margin-left: 0;
  margin-right: 0;
}
[dir='rtl'] .nut-searchbar-left > text,
[dir='rtl'] .nut-searchbar-left > view,
.nut-rtl .nut-searchbar-left > text,
.nut-rtl .nut-searchbar-left > view {
  margin-right: 0;
  margin-left: var(--nutui-searchbar-gap, 12rpx);
}
[dir='rtl'] .nut-searchbar-left > text:last-child,
[dir='rtl'] .nut-searchbar-left > view:last-child,
.nut-rtl .nut-searchbar-left > text:last-child,
.nut-rtl .nut-searchbar-left > view:last-child {
  margin-right: 0;
  margin-left: 0;
}
[dir='rtl'] .nut-searchbar-right > text,
[dir='rtl'] .nut-searchbar-right > view,
.nut-rtl .nut-searchbar-right > text,
.nut-rtl .nut-searchbar-right > view {
  margin-left: 0;
  margin-right: var(--nutui-searchbar-gap, 12rpx);
}
[dir='rtl'] .nut-searchbar-right > text:first-child,
[dir='rtl'] .nut-searchbar-right > view:first-child,
.nut-rtl .nut-searchbar-right > text:first-child,
.nut-rtl .nut-searchbar-right > view:first-child {
  margin-left: 0;
  margin-right: 0;
}
[dir='rtl'] .nut-searchbar-input,
.nut-rtl .nut-searchbar-input {
  text-align: var(--nutui-searchbar-input-text-align, right);
}
.nut-safe-area {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  width: 100%;
}
.nut-safe-area-position-top {
  padding-top: calc(constant(safe-area-inset-top) * var(--nutui-safe-area-multiple, 1));
  padding-top: calc(env(safe-area-inset-top) * var(--nutui-safe-area-multiple, 1));
}
.nut-safe-area-position-bottom {
  padding-bottom: calc(constant(safe-area-inset-bottom) * var(--nutui-safe-area-multiple, 1));
  padding-bottom: calc(env(safe-area-inset-bottom) * var(--nutui-safe-area-multiple, 1));
}
.nut-resultpage {
  width: 100%;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  margin: 0 auto;
}
.nut-resultpage-icon {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  display: -webkit-inline-flex;
  display: -ms-inline-flexbox;
  display: inline-flex;
  margin-bottom: var(--nutui-resultpage-icon-margin-bottom, 12rpx);
}
.nut-resultpage-icon .nut-icon {
  height: var(--nutui-resultpage-icon-size, 36rpx);
  width: var(--nutui-resultpage-icon-size, 36rpx);
}
.nut-resultpage-title {
  width: var(--nutui-resultpage-width, 240rpx);
  margin-bottom: var(--nutui-resultpage-title-margin-bottom, 12rpx);
  font-size: var(--nutui-resultpage-title-font-size, var(--nutui-font-size-xl, 18rpx));
  color: var(--nutui-resultpage-title-color, var(--nutui-color-title, #1a1a1a));
  font-weight: var(--nutui-font-weight-bold, 600);
  text-align: center;
}
.nut-resultpage-description {
  width: var(--nutui-resultpage-width, 240rpx);
  line-height: var(--nutui-resultpage-description-line-height, 20rpx);
  font-size: var(--nutui-resultpage-description-font-size, var(--nutui-font-size-base, 14rpx));
  color: var(--nutui-resultpage-description-color, var(--nutui-color-text, #505259));
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  word-break: break-all;
}
.nut-resultpage-actions {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  margin-top: var(--nutui-resultpage-actions-margin-top, 16rpx);
}
.nut-resultpage-actions .nut-button-children {
  white-space: nowrap;
}
.nut-resultpage-action {
  margin-left: 6rpx;
  margin-right: 6rpx;
}
.nut-row {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  width: 100%;
  overflow: hidden;
}
.nut-row::after {
  display: block;
  height: 0;
  clear: both;
  visibility: hidden;
  content: '';
}
.nut-row-flex {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
}
.nut-row-flex::after {
  display: none;
}
.nut-row-justify-center {
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
}
.nut-row-justify-end {
  -webkit-justify-content: flex-end;
  -ms-flex-pack: end;
  justify-content: flex-end;
}
.nut-row-justify-space-between {
  -webkit-justify-content: space-between;
  -ms-flex-pack: justify;
  justify-content: space-between;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
}
.nut-row-justify-space-around {
  -webkit-justify-content: space-around;
  -ms-flex-pack: distribute;
  justify-content: space-around;
}
.nut-row-align-flex-start {
  -webkit-align-items: flex-start;
  -ms-flex-align: start;
  align-items: flex-start;
}
.nut-row-align-center {
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
}
.nut-row-align-flex-end {
  -webkit-align-items: flex-end;
  -ms-flex-align: end;
  align-items: flex-end;
}
.nut-row-flex-wrap {
  -webkit-flex-wrap: wrap;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
}
.nut-row-flex-nowrap {
  -webkit-flex-wrap: nowrap;
  -ms-flex-wrap: nowrap;
  flex-wrap: nowrap;
}
.nut-row-flex-reverse {
  -webkit-flex-wrap: wrap-reverse;
  -ms-flex-wrap: wrap-reverse;
  flex-wrap: wrap-reverse;
}
.nut-range-container {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  position: relative;
  width: 100%;
  height: var(--nutui-range-height, 4rpx);
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: space-between;
  -ms-flex-pack: justify;
  justify-content: space-between;
}
.nut-range-container-native {
  height: auto;
}
.nut-range {
  display: block;
  position: relative;
  height: var(--nutui-range-height, 4rpx);
  margin: 0 var(--nutui-range-margin, 15rpx);
  background-color: var(--nutui-range-inactive-color, var(--nutui-color-primary-light-pressed, #ffebf1));
  border-radius: 2rpx;
  -webkit-flex: 1;
  -ms-flex: 1;
  flex: 1;
  cursor: pointer;
}
.nut-range::before {
  position: absolute;
  top: -8rpx;
  bottom: -8rpx;
  left: 0;
  right: 0;
  content: '';
}
.nut-range-min,
.nut-range-max {
  font-size: var(--nutui-font-size-s, 12rpx);
  color: var(--nutui-range-color, var(--nutui-color-title, #1a1a1a));
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.nut-range-bar {
  display: block;
  position: relative;
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  background: var(--nutui-range-active-color, var(--nutui-color-primary, #ff0f23));
  border-radius: 2rpx;
}
.nut-range-bar-animate {
  -webkit-transition: all 0.2s;
  transition: all 0.2s;
}
.nut-range-button {
  position: absolute;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  width: var(--nutui-range-button-width, 24rpx);
  height: var(--nutui-range-button-height, 24rpx);
  background: var(--nutui-range-button-background, #ffffff);
  border-radius: 50%;
  -webkit-box-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.14902);
  box-shadow: 0 1rpx 2rpx #00000026;
  border: var(--nutui-range-button-border, 1rpx solid var(--nutui-color-primary, #ff0f23));
  outline: none;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  top: 50%;
  left: 50%;
}
.nut-range-button-wrapper,
.nut-range-button-wrapper-right,
.nut-range-button-wrapper-left {
  width: var(--nutui-range-button-width, 24rpx);
  height: var(--nutui-range-button-height, 24rpx);
}
.nut-range-button-wrapper,
.nut-range-button-wrapper-right {
  -ms-touch-action: none;
  touch-action: none;
  position: absolute;
  top: 50%;
  left: 100%;
  cursor: -webkit-grab;
  cursor: grab;
  outline: none;
}
.nut-range-button-wrapper-left {
  position: absolute;
  top: 50%;
  left: 0;
  cursor: -webkit-grab;
  cursor: grab;
  outline: none;
  -ms-touch-action: none;
  touch-action: none;
}
.nut-range-button-number {
  position: relative;
  width: 200%;
  height: 24rpx;
  line-height: 14rpx;
  padding: 5rpx 0;
  left: 50%;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  font-size: var(--nutui-font-size-s, 12rpx);
  color: var(--nutui-range-color, var(--nutui-color-title, #1a1a1a));
  text-align: center;
  vertical-align: center;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}
.nut-range-disabled {
  cursor: not-allowed;
  opacity: 0.54;
}
.nut-range-disabled .nut-range-button-wrapper,
.nut-range-disabled .nut-range-button-wrapper-left,
.nut-range-disabled .nut-range-button-wrapper-right {
  cursor: not-allowed;
}
.nut-range-mark {
  position: absolute;
  width: 100%;
  height: 14rpx;
  overflow: visible;
  top: 50%;
}
.nut-range-mark-text-wrapper {
  position: absolute;
  height: 100%;
  top: 14rpx;
  display: inline-block;
  -webkit-transform: translate(-10rpx);
  -ms-transform: translate(-10rpx);
  transform: translate(-10rpx);
}
.nut-range-mark-text {
  position: absolute;
  line-height: 16rpx;
  font-size: 12rpx;
  color: #999;
  text-align: center;
  word-break: keep-all;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.nut-range-tick {
  position: absolute;
  top: -20rpx;
  width: 11rpx;
  height: 11rpx;
  left: 0;
  border-radius: 6rpx;
  background: var(--nutui-range-inactive-color, var(--nutui-color-primary-light-pressed, #ffebf1));
}
.nut-range-tick-active {
  background: var(--nutui-range-active-color, var(--nutui-color-primary, #ff0f23));
}
.nut-range-vertical-container {
  height: 100%;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  padding: 0 15rpx;
}
.nut-range-vertical {
  width: var(--nutui-range-height, 4rpx);
  margin: var(--nutui-range-margin, 15rpx) 0rpx;
}
.nut-range-vertical-button-wrapper,
.nut-range-vertical-button-wrapper-right {
  position: absolute;
  top: auto;
  top: initial;
  right: auto;
  right: initial;
  top: 100%;
  left: 50%;
}
.nut-range-vertical-button-wrapper-left {
  top: 0;
  left: 50%;
  right: auto;
  right: initial;
}
.nut-range-vertical-button-number {
  left: 0;
  top: 50%;
}
.nut-range-vertical-mark {
  position: absolute;
  width: 36rpx;
  height: 100%;
  top: 0;
  right: 50%;
  overflow: visible;
  font-size: 12rpx;
  padding: 0;
}
.nut-range-vertical-mark-hm {
  left: -34rpx;
}
.nut-range-vertical-mark-text-wrapper {
  height: 16rpx;
  position: absolute;
  display: inline-block;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-transform: translateY(-11rpx);
  -ms-transform: translateY(-11rpx);
  transform: translateY(-11rpx);
}
.nut-range-vertical-mark-text {
  height: 100%;
  line-height: 16rpx;
  color: #999;
  text-align: center;
  word-break: keep-all;
}
.nut-range-vertical-tick {
  position: absolute;
  top: 2rpx;
  left: 31rpx;
  width: 10rpx;
  height: 10rpx;
  border-radius: 5rpx;
  background: var(--nutui-range-inactive-color, var(--nutui-color-primary-light-pressed, #ffebf1));
}
.nut-range-vertical-tick-active {
  background: var(--nutui-range-active-color, var(--nutui-color-primary, #ff0f23));
}
[dir='rtl'] .nut-range-button-wrapper,
[dir='rtl'] .nut-range-button-wrapper-right,
.rtl-nut-range-button-wrapper,
.rtl-nut-range-button-wrapper-right {
  left: 0;
  right: auto;
  right: initial;
}
[dir='rtl'] .nut-range-button-wrapper-left,
.rtl-nut-range-button-wrapper-left,
[dir='rtl'] .nut-range-tick,
.rtl-nut-range-tick {
  right: 0;
  left: auto;
  left: initial;
}
[dir='rtl'] .nut-range-mark-text,
.rtl-nut-range-mark-text {
  -webkit-transform: translate(10rpx);
  -ms-transform: translate(10rpx);
  transform: translate(10rpx);
}
[dir='rtl'] .nut-range-vertical-button-wrapper,
[dir='rtl'] .nut-range-vertical-button-wrapper-right,
.rtl-nut-range-vertical-button-wrapper,
.rtl-nut-range-vertical-button-wrapper-right,
[dir='rtl'] .nut-range-vertical-button-wrapper-left,
.rtl-nut-range-vertical-button-wrapper-left {
  right: 50%;
  left: auto;
  left: initial;
}
[dir='rtl'] .nut-range-vertical-mark,
.rtl-nut-range-vertical-mark {
  right: auto;
  left: 50%;
}
[dir='rtl'] .nut-range-vertical-tick,
.rtl-nut-range-vertical-tick {
  left: auto;
  right: 30rpx;
  margin-left: 0;
  margin-right: 0;
}
[dir='rtl'] .nut-range-vertical-mark-text-wrapper,
.rtl-nut-range-vertical-mark-text-wrapper {
  -webkit-transform: translateY(-11rpx);
  -ms-transform: translateY(-11rpx);
  transform: translateY(-11rpx);
}
.nut-rate {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -ms-touch-action: pan-x;
  touch-action: pan-x;
}
.nut-rate.disabled .nut-rate-item-icon {
  cursor: not-allowed;
}
.nut-rate.readonly .nut-rate-item-icon {
  cursor: default;
}
.nut-rate-item {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-flex-shrink: 0;
  -ms-flex-negative: 0;
  flex-shrink: 0;
  position: relative;
}
.nut-rate-item-half {
  width: 50% !important;
}
.nut-rate-item-half {
  position: absolute;
  height: 100%;
  left: 0;
  top: 0;
  overflow: hidden;
}
.nut-rate-item-half .nut-icon {
  -webkit-flex-shrink: 0;
  -ms-flex-negative: 0;
  flex-shrink: 0;
}
.nut-rate-item-normal {
  margin-left: var(--nutui-rate-item-margin, 4rpx);
}
.nut-rate-item-normal .nut-icon {
  height: var(--nutui-rate-icon-size, 12rpx);
  width: var(--nutui-rate-icon-size, 12rpx);
}
.nut-rate-item-large {
  margin-left: calc(var(--nutui-rate-item-margin, 4rpx) * 2);
}
.nut-rate-item-large .nut-icon {
  height: calc(var(--nutui-rate-icon-size, 12rpx) + 8rpx);
  width: calc(var(--nutui-rate-icon-size, 12rpx) + 8rpx);
}
.nut-rate-item-small {
  margin-left: calc(var(--nutui-rate-item-margin, 4rpx) / 2);
}
.nut-rate-item-small .nut-icon {
  height: calc(var(--nutui-rate-icon-size, 12rpx) - 4rpx);
  width: calc(var(--nutui-rate-icon-size, 12rpx) - 4rpx);
}
.nut-rate-item-normal:first-child,
.nut-rate-item-large:first-child,
.nut-rate-item-small:first-child {
  margin-left: 0;
}
.nut-rate-item-icon {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  cursor: pointer;
}
.nut-rate-item-icon .nut-icon {
  color: var(--nutui-rate-icon-color, var(--nutui-color-primary-icon, #ff3333));
}
.nut-rate-item-icon-disabled .nut-icon {
  color: var(--nutui-rate-icon-inactive-color, var(--nutui-color-primary-icon-disabled, #dadce0));
}
.nut-rate-item-icon.nut-rate-item-icon.nut-rate-item-icon-half {
  position: absolute;
  left: 0;
  top: 0;
  overflow: hidden;
}
.nut-rate-item-icon.nut-rate-item-icon::before {
  position: relative;
  top: auto;
  left: auto;
  -webkit-transform: none;
  -ms-transform: none;
  transform: none;
}
.nut-rate-score {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  display: -webkit-inline-flex;
  display: -ms-inline-flexbox;
  display: inline-flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  color: var(--nutui-rate-font-color, var(--nutui-color-primary-icon, #ff3333));
  font-family: JDZH-Regular;
  line-height: 1;
}
.nut-rate-score-normal {
  padding-left: var(--nutui-rate-item-margin, 4rpx);
  font-size: var(--nutui-rate-font-size, 12rpx);
}
.nut-rate-score-large {
  font-size: calc(var(--nutui-rate-font-size, 12rpx) + 6rpx);
  padding-left: calc(var(--nutui-rate-item-margin, 4rpx) * 2);
}
.nut-rate-score-small {
  font-size: calc(var(--nutui-rate-font-size, 12rpx) - 2rpx);
  padding-left: calc(var(--nutui-rate-item-margin, 4rpx) / 2);
}
.nut-rate-score-disabled {
  color: var(--nutui-rate-icon-inactive-color, var(--nutui-color-primary-icon-disabled, #dadce0));
}
[dir='rtl'] .nut-rate-item,
.nut-rtl .nut-rate-item {
  margin-left: 0;
}
[dir='rtl'] .nut-rate-item:first-child,
.nut-rtl .nut-rate-item:first-child {
  margin-right: 0;
}
[dir='rtl'] .nut-rate-item-normal,
.nut-rtl .nut-rate-item-normal {
  margin-right: var(--nutui-rate-item-margin, 4rpx);
}
[dir='rtl'] .nut-rate-item-large,
.nut-rtl .nut-rate-item-large {
  margin-right: calc(var(--nutui-rate-item-margin, 4rpx) * 2);
}
[dir='rtl'] .nut-rate-item-small,
.nut-rtl .nut-rate-item-small {
  margin-right: calc(var(--nutui-rate-item-margin, 4rpx) - 2rpx);
}
[dir='rtl'] .nut-rate-item:last-child,
.nut-rtl .nut-rate-item:last-child {
  margin-left: 0;
}
[dir='rtl'] .nut-rate-item-half,
.nut-rtl .nut-rate-item-half,
[dir='rtl'] .nut-rate-item-icon.nut-rate-item-icon.nut-rate-item-icon-half,
.nut-rtl .nut-rate-item-icon.nut-rate-item-icon.nut-rate-item-icon-half {
  left: auto;
  right: 0;
}
[dir='rtl'] .nut-rate-item-icon.nut-rate-item-icon::before,
.nut-rtl .nut-rate-item-icon.nut-rate-item-icon::before {
  left: auto;
  right: auto;
}
[dir='rtl'] .nut-rate-score,
.nut-rtl .nut-rate-score {
  padding-left: 0;
}
[dir='rtl'] .nut-rate-score-large,
.nut-rtl .nut-rate-score-large {
  padding-right: calc(var(--nutui-rate-item-margin, 4rpx) * 2);
}
[dir='rtl'] .nut-rate-score-normal,
.nut-rtl .nut-rate-score-normal {
  padding-right: var(--nutui-rate-item-margin, 4rpx);
}
[dir='rtl'] .nut-rate-score-small,
.nut-rtl .nut-rate-score-small {
  padding-right: calc(var(--nutui-rate-item-margin, 4rpx) - 2rpx);
}
.nut-radiogroup .nut-radio {
  margin: 0 var(--nutui-radiogroup-radio-margin, 20rpx) var(--nutui-radiogroup-radio-margin-bottom, 5rpx) 0;
}
.nut-radiogroup .nut-radio-label {
  margin: var(--nutui-radiogroup-radio-label-margin, 0 5rpx);
}
.nut-radiogroup .nut-radio-button {
  background-color: var(--nutui-radio-button-background, rgba(250, 44, 25, 0.05));
}
.nut-radiogroup .nut-radio:last-child {
  margin: 0;
}
.nut-radiogroup-vertical .nut-radio.nut-radio-reverse {
  width: 100%;
  -webkit-justify-content: space-between;
  -ms-flex-pack: justify;
  justify-content: space-between;
}
.nut-radiogroup-vertical .nut-radio-button {
  border: 1rpx solid var(--nutui-radio-button-background, rgba(250, 44, 25, 0.05));
}
.nut-radiogroup-vertical .nut-radio-button-active {
  border: var(--nutui-radio-button-active-border, 1rpx solid var(--nutui-color-primary, #ff0f23));
  background-color: var(--nutui-color-primary-light-pressed, #ffebf1);
}
.nut-radiogroup-horizontal {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
}
.nut-radiogroup-horizontal .nut-radio-button {
  border: 1rpx solid #ffffff;
}
.nut-radiogroup-horizontal .nut-radio-button-active {
  border: var(--nutui-radio-button-active-border, 1rpx solid var(--nutui-color-primary, #ff0f23));
  background-color: var(--nutui-color-primary-light-pressed, #ffebf1);
}
.nut-radiogroup-horizontal .nut-radio:last-child {
  margin: 0 var(--nutui-radiogroup-radio-margin, 20rpx) var(--nutui-radiogroup-radio-margin-bottom, 5rpx) 0;
}
.nut-radiogroup .nut-radio-button-active.nut-radio-button-disabled {
  background: var(--nutui-color-text-disabled, #c2c4cc);
  color: #fff;
  border: 1rpx solid var(--nutui-color-text-disabled, #c2c4cc);
}
[dir='rtl'] .nut-radiogroup .nut-radio,
.nut-rtl .nut-radiogroup .nut-radio {
  margin-left: var(--nutui-radiogroup-radio-margin, 20rpx);
  margin-right: 0;
}
.nut-radio {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-flex-shrink: 0;
  -ms-flex-negative: 0;
  flex-shrink: 0;
}
.nut-radio.nut-radio-reverse {
  -webkit-flex-direction: row-reverse;
  -ms-flex-direction: row-reverse;
  flex-direction: row-reverse;
}
.nut-radio.nut-radio-reverse .nut-radio-label {
  margin-right: var(--nutui-radio-label-margin-left, 4rpx);
  margin-left: 0;
}
.nut-radio-label {
  margin-left: var(--nutui-radio-label-margin-left, 4rpx);
  font-size: var(--nutui-radio-label-font-size, var(--nutui-font-size-s, 12rpx));
  color: var(--nutui-radio-label-color, var(--nutui-color-title, #1a1a1a));
}
.nut-radio-label-disabled {
  color: var(--nutui-radio-label-disable-color, var(--nutui-color-text-disabled, #c2c4cc));
}
.nut-radio-icon {
  color: var(--nutui-color-text-disabled, #c2c4cc);
  background-color: #fff;
  -webkit-transition-duration: 0.3s;
  transition-duration: 0.3s;
  -webkit-transition-property: color, border-color, background-color;
  transition-property: color, border-color, background-color;
  font-size: var(--nutui-radio-icon-font-size, var(--nutui-font-size-icon, 16rpx));
  border-radius: 50%;
}
.nut-radio-icon-checked {
  color: var(--nutui-color-primary, #ff0f23);
  background-color: #fff;
  -webkit-box-shadow: 0 2rpx 4rpx rgba(255, 15, 35, 0.2);
  box-shadow: 0 2rpx 4rpx #ff0f2333;
  border-radius: 50%;
}
.nut-radio-icon-checked.nut-radio-icon-disabled {
  color: var(--nutui-color-primary-disabled-special, #ffadbe);
  background-color: #fff;
  -webkit-box-shadow: none;
  box-shadow: none;
  border-radius: 50%;
}
.nut-radio-icon-disabled {
  color: var(--nutui-color-text-disabled, #c2c4cc);
}
.nut-radio-button {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  display: -webkit-inline-flex;
  display: -ms-inline-flexbox;
  display: inline-flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  min-height: 30rpx;
  padding: var(--nutui-radio-button-padding, 5rpx 18rpx);
  font-size: var(--nutui-radio-button-font-size, var(--nutui-font-size-s, 12rpx));
  background: var(--nutui-radio-button-background, rgba(250, 44, 25, 0.05));
  border-radius: var(--nutui-radio-button-border-radius, 15rpx);
  color: var(--nutui-radio-label-color, var(--nutui-color-title, #1a1a1a));
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  border: 1rpx solid var(--nutui-radio-button-background, rgba(250, 44, 25, 0.05));
}
.nut-radio-button-active {
  background: var(--nutui-color-primary-light-pressed, #ffebf1);
  color: var(--nutui-color-primary, #ff0f23);
  border: var(--nutui-radio-button-active-border, 1rpx solid var(--nutui-color-primary, #ff0f23));
}
.nut-radio-button-disabled {
  color: var(--nutui-color-text-disabled, #c2c4cc);
  border: 1rpx solid var(--nutui-radio-button-background, rgba(250, 44, 25, 0.05));
}
.nut-radio .nut-radio-button-active.nut-radio-button-disabled {
  background: var(--nutui-color-text-disabled, #c2c4cc);
  color: #fff;
  border: 1rpx solid var(--nutui-color-text-disabled, #c2c4cc);
}
[dir='rtl'] .nut-radio:last-child,
.nut-rtl .nut-radio:last-child {
  margin-right: 0 !important;
  margin-left: 0 !important;
}
[dir='rtl'] .nut-radio.nut-radio-reverse .nut-radio-label,
.nut-rtl .nut-radio.nut-radio-reverse .nut-radio-label {
  margin-left: var(--nutui-radio-label-margin-left, 4rpx);
  margin-right: 0;
}
[dir='rtl'] .nut-radio-label,
.nut-rtl .nut-radio-label {
  margin-left: 0;
  margin-right: var(--nutui-radio-label-margin-left, 4rpx);
}
.nut-pulltorefresh-head {
  overflow: hidden;
  position: relative;
  font-size: 12rpx;
}
.nut-pulltorefresh-head-content {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  color: var(--nutui-color-text-help, #888b94);
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
}
.nut-pulltorefresh-head-content-icons {
  width: var(--nutui-pulltorefresh-icon-width, 36rpx);
  height: var(--nutui-pulltorefresh-icon-height, 26rpx);
  margin-bottom: 4rpx;
}
.nut-pulltorefresh-primary {
  background: var(--nutui-pulltorefresh-color-primary, var(--nutui-color-primary, #ff0f23));
}
.nut-pulltorefresh-primary-content,
.nut-pulltorefresh-primary-head-content {
  color: var(--nutui-color-text-dark, rgba(255, 255, 255, 0.9));
}
.nut-pulltorefresh-primary-status-text {
  color: #fff;
}
[dir='rtl'] .nut-pulltorefresh-head-content,
.nut-rtl .nut-pulltorefresh-head-content {
  left: auto;
  right: 0;
}
.nut-progress {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  position: relative;
  width: 100%;
}
.nut-progress-outer {
  -webkit-flex: 1;
  -ms-flex: 1;
  flex: 1;
  border-radius: var(--nutui-progress-border-radius, 12rpx);
  height: var(--nutui-progress-height, 10rpx);
  background: var(--nutui-progress-background, var(--nutui-color-background, #f2f3f5));
}
.nut-progress-outer .nut-progress-active::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: var(--nutui-progress-border-radius, 12rpx);
  -webkit-animation: progressActive 2s ease-in-out infinite;
  animation: progressActive 2s ease-in-out infinite;
}
.nut-progress-inner {
  height: 100%;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-transition: all 0.4s;
  transition: all 0.4s;
  border-radius: var(--nutui-progress-border-radius, 12rpx);
  background: var(--nutui-progress-color, linear-gradient(135deg, var(--nutui-color-primary-stop-1, #ff475d) 0%, var(--nutui-color-primary-stop-2, #ff0f23) 100%));
}
.nut-progress-text {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-transition: all 0.4s;
  transition: all 0.4s;
  margin-left: 12rpx;
  color: var(--nutui-color-text-help, #888b94);
  font-family: PingFang SC;
  font-size: var(--nutui-progress-text-font-size, 13rpx);
}
@keyframes progressActive {
  0% {
    background: rgba(255, 255, 255, 0.10196);
    width: 0;
  }
  20% {
    background: rgba(255, 255, 255, 0.50196);
    width: 0;
  }
  to {
    background: rgba(255, 255, 255, 0);
    width: 100%;
  }
}
[dir='rtl'] .nut-progress-text,
.nut-rtl .nut-progress-text {
  -webkit-transform: translate(50%);
  -ms-transform: translate(50%);
  transform: translate(50%);
}
.nut-price {
  direction: ltr;
  font-size: var(--nutui-font-size-l, 15rpx);
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  -webkit-align-items: baseline;
  -ms-flex-align: baseline;
  align-items: baseline;
}
.nut-price-symbol,
.nut-price-integer,
.nut-price-decimal {
  color: var(--nutui-price-color, var(--nutui-color-text-help));
  font-family: JDZH-Bold;
  line-height: 1;
}
.nut-price-darkgray .nut-price-symbol,
.nut-price-darkgray .nut-price-integer,
.nut-price-darkgray .nut-price-decimal {
  font-family: JDZH-Bold;
  color: var(--nutui-price-darkgray-color, var(--nutui-gray-7));
}
.nut-price-primary .nut-price-symbol,
.nut-price-primary .nut-price-integer,
.nut-price-primary .nut-price-decimal {
  font-family: JDZH-Bold;
  color: var(--nutui-price-color, var(--nutui-color-primary, #ff0f23));
}
.nut-price-symbol {
  padding-right: var(--nutui-price-symbol-padding-right, 0rpx);
}
.nut-price-symbol-xlarge {
  font-size: var(--nutui-price-symbol-xlarge-size, 12rpx);
}
.nut-price-symbol-large {
  font-size: var(--nutui-price-symbol-large-size, 12rpx);
}
.nut-price-symbol-normal {
  font-size: var(--nutui-price-symbol-normal-size, 12rpx);
}
.nut-price-symbol-small {
  font-size: var(--nutui-price-symbol-small-size, 12rpx);
}
.nut-price-symbol-rtl {
  padding-right: 0;
  padding-left: var(--nutui-price-symbol-padding-right, 0rpx);
}
.nut-price-integer-xlarge {
  font-size: var(--nutui-price-integer-xlarge-size, 24rpx);
  line-height: var(--nutui-price-integer-xlarge-size, 24rpx);
}
.nut-price-integer-large {
  font-size: var(--nutui-price-integer-large-size, 18rpx);
  line-height: var(--nutui-price-integer-large-size, 18rpx);
}
.nut-price-integer-normal {
  font-size: var(--nutui-price-integer-normal-size, 16rpx);
  line-height: var(--nutui-price-integer-normal-size, 16rpx);
}
.nut-price-integer-small {
  font-size: var(--nutui-price-integer-small-size, 12rpx);
}
.nut-price-decimal-xlarge {
  font-size: var(--nutui-price-decimal-xlarge-size, 12rpx);
}
.nut-price-decimal-large {
  font-size: var(--nutui-price-decimal-large-size, 12rpx);
}
.nut-price-decimal-normal {
  font-size: var(--nutui-price-decimal-normal-size, 12rpx);
}
.nut-price-decimal-small {
  font-size: var(--nutui-price-decimal-small-size, 12rpx);
}
.nut-price-line {
  -webkit-text-decoration: line-through var(--nutui-price-line-color, var(--nutui-color-text-help));
  text-decoration: line-through var(--nutui-price-line-color, var(--nutui-color-text-help));
}
.nut-popup {
  position: fixed;
  min-height: 26%;
  max-height: 100%;
  background-color: var(--nutui-overlay-content-bg-color, var(--nutui-color-background-overlay, #ffffff));
  -webkit-overflow-scrolling: touch;
  font-size: var(--nutui-font-size-base, 14rpx);
}
.nut-popup-title {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  border-bottom: var(--nutui-popup-title-border-bottom, 0);
  padding: var(--nutui-popup-title-padding, 16rpx);
  position: relative;
}
.nut-popup-title-wrapper {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
}
.nut-popup-title-title {
  color: var(--nutui-color-title, #1a1a1a);
  font-weight: var(--nutui-font-weight-bold, 600);
  font-size: var(--nutui-popup-title-font-size, var(--nutui-font-size-xl, 18rpx));
  line-height: var(--nutui-popup-title-font-size, var(--nutui-font-size-xl, 18rpx));
}
.nut-popup-title-description {
  color: var(--nutui-color-text, #505259);
  font-size: var(--nutui-popup-description-font-size, var(--nutui-font-size-base, 14rpx));
  font-weight: var(--nutui-font-weight, 400);
}
.nut-popup-title-description-gap {
  margin-top: var(--nutui-popup-description-spacing, var(--nutui-spacing-base, 8rpx));
}
.nut-popup-title-left {
  position: absolute;
  top: var(--nutui-popup-title-padding, 16rpx);
  left: var(--nutui-popup-title-padding, 16rpx);
}
.nut-popup-title-right {
  position: absolute;
  top: var(--nutui-popup-title-padding, 16rpx);
  right: var(--nutui-popup-title-padding, 16rpx);
  z-index: 1;
  width: var(--nutui-popup-icon-size, 20rpx);
  height: var(--nutui-popup-icon-size, 20rpx);
  color: var(--nutui-color-title, #1a1a1a);
  cursor: pointer;
}
.nut-popup-title-right:active {
  opacity: 0.7;
}
.nut-popup-title-right-top-left {
  top: var(--nutui-popup-title-padding, 16rpx);
  left: var(--nutui-popup-title-padding, 16rpx);
}
.nut-popup-title-right-bottom-left {
  bottom: var(--nutui-popup-title-padding, 16rpx);
  left: var(--nutui-popup-title-padding, 16rpx);
}
.nut-popup-title-right-bottom-right {
  right: var(--nutui-popup-title-padding, 16rpx);
  bottom: var(--nutui-popup-title-padding, 16rpx);
}
.nut-popup-center {
  top: 50%;
  left: 50%;
  min-height: 10%;
  max-width: 295rpx;
  -webkit-transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}
.nut-popup-center.nut-popup-round {
  border-radius: var(--nutui-popup-border-radius, var(--nutui-radius-xl, 12rpx));
}
.nut-popup-bottom {
  bottom: 0;
  left: 0;
  width: 100%;
}
.nut-popup-bottom.nut-popup-round {
  border-radius: var(--nutui-popup-border-radius, var(--nutui-radius-xl, 12rpx)) var(--nutui-popup-border-radius, var(--nutui-radius-xl, 12rpx)) 0 0;
}
.nut-popup-bottom-top {
  position: absolute;
}
.nut-popup-right {
  top: 0;
  right: 0;
  width: 100rpx;
  height: 100%;
}
.nut-popup-right.nut-popup-round {
  border-radius: var(--nutui-popup-border-radius, var(--nutui-radius-xl, 12rpx)) 0 0 var(--nutui-popup-border-radius, var(--nutui-radius-xl, 12rpx));
}
.nut-popup-left {
  top: 0;
  left: 0;
  width: 100rpx;
  height: 100%;
}
.nut-popup-left.nut-popup-round {
  border-radius: 0 var(--nutui-popup-border-radius, var(--nutui-radius-xl, 12rpx)) var(--nutui-popup-border-radius, var(--nutui-radius-xl, 12rpx)) 0;
}
.nut-popup-top {
  top: 0;
  left: 0;
  width: 100%;
}
.nut-popup-top.nut-popup-round {
  border-radius: 0 0 var(--nutui-popup-border-radius, var(--nutui-radius-xl, 12rpx)) var(--nutui-popup-border-radius, var(--nutui-radius-xl, 12rpx));
}
@keyframes popup-scale-fade-in {
  0% {
    opacity: 0;
    -webkit-transform: scale(0.8);
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    -webkit-transform: scale(1);
    transform: scale(1);
  }
}
@keyframes popup-scale-fade-out {
  0% {
    opacity: 1;
    -webkit-transform: scale(1);
    transform: scale(1);
  }
  to {
    opacity: 0;
    -webkit-transform: scale(0.8);
    transform: scale(0.8);
  }
}
.nut-popup-slide-none-enter-active {
  -webkit-animation-fill-mode: both;
  animation-fill-mode: both;
  -webkit-animation-name: popup-scale-fade-in;
  animation-name: popup-scale-fade-in;
  -webkit-animation-duration: var(--nutui-popup-animation-duration, 0.3s);
  animation-duration: var(--nutui-popup-animation-duration, 0.3s);
}
.nut-popup-slide-none-exit-active {
  -webkit-animation-fill-mode: both;
  animation-fill-mode: both;
  -webkit-animation-name: popup-scale-fade-out;
  animation-name: popup-scale-fade-out;
  -webkit-animation-duration: var(--nutui-popup-animation-duration, 0.3s);
  animation-duration: var(--nutui-popup-animation-duration, 0.3s);
}
@keyframes popup-fade-in {
  0% {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes popup-fade-out {
  0% {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
.nut-popup-slide-center-enter-active {
  -webkit-animation-fill-mode: both;
  animation-fill-mode: both;
  -webkit-animation-name: popup-fade-in;
  animation-name: popup-fade-in;
  -webkit-animation-duration: var(--nutui-popup-animation-duration, 0.3s);
  animation-duration: var(--nutui-popup-animation-duration, 0.3s);
}
.nut-popup-slide-center-exit-active {
  -webkit-animation-fill-mode: both;
  animation-fill-mode: both;
  -webkit-animation-name: popup-fade-out;
  animation-name: popup-fade-out;
  -webkit-animation-duration: var(--nutui-popup-animation-duration, 0.3s);
  animation-duration: var(--nutui-popup-animation-duration, 0.3s);
}
@keyframes popup-slide-top-enter {
  0% {
    -webkit-transform: translate3d(0, -100%, 0);
    transform: translate3d(0, -100%, 0);
  }
  to {
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
  }
}
@keyframes popup-slide-top-exit {
  to {
    -webkit-transform: translate3d(0, -100%, 0);
    transform: translate3d(0, -100%, 0);
  }
}
.nut-popup-slide-top-enter-active,
.nut-popup-slide-top-appear-active {
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-animation-fill-mode: both;
  animation-fill-mode: both;
  -webkit-animation-name: popup-slide-top-enter;
  animation-name: popup-slide-top-enter;
  -webkit-animation-duration: var(--nutui-popup-animation-duration, 0.3s);
  animation-duration: var(--nutui-popup-animation-duration, 0.3s);
}
.nut-popup-slide-top-exit-active {
  -webkit-animation-fill-mode: both;
  animation-fill-mode: both;
  -webkit-animation-name: popup-slide-top-exit;
  animation-name: popup-slide-top-exit;
  -webkit-animation-duration: var(--nutui-popup-animation-duration, 0.3s);
  animation-duration: var(--nutui-popup-animation-duration, 0.3s);
}
@keyframes popup-slide-right-enter {
  0% {
    -webkit-transform: translate3d(100%, 0, 0);
    transform: translate3d(100%, 0, 0);
  }
  to {
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
  }
}
@keyframes popup-slide-right-exit {
  to {
    -webkit-transform: translate3d(100%, 0, 0);
    transform: translate3d(100%, 0, 0);
  }
}
.nut-popup-slide-right-enter-active,
.nut-popup-slide-right-appear-active {
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-animation-fill-mode: both;
  animation-fill-mode: both;
  -webkit-animation-name: popup-slide-right-enter;
  animation-name: popup-slide-right-enter;
  -webkit-animation-duration: var(--nutui-popup-animation-duration, 0.3s);
  animation-duration: var(--nutui-popup-animation-duration, 0.3s);
}
.nut-popup-slide-right-exit {
  -webkit-animation-fill-mode: both;
  animation-fill-mode: both;
  -webkit-animation-name: popup-slide-right-exit;
  animation-name: popup-slide-right-exit;
  -webkit-animation-duration: var(--nutui-popup-animation-duration, 0.3s);
  animation-duration: var(--nutui-popup-animation-duration, 0.3s);
}
@keyframes popup-slide-bottom-enter {
  0% {
    -webkit-transform: translate3d(0, 100%, 0);
    transform: translate3d(0, 100%, 0);
  }
  to {
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
  }
}
@keyframes slide-bottom-exit {
  to {
    -webkit-transform: translate3d(0, 100%, 0);
    transform: translate3d(0, 100%, 0);
  }
}
.nut-popup-slide-bottom-enter-active,
.nut-popup-slide-bottom-appear-active {
  -webkit-transform: translate(0);
  -ms-transform: translate(0);
  transform: translate(0);
  -webkit-animation-fill-mode: both;
  animation-fill-mode: both;
  -webkit-animation-name: popup-slide-bottom-enter;
  animation-name: popup-slide-bottom-enter;
  -webkit-animation-duration: var(--nutui-popup-animation-duration, 0.3s);
  animation-duration: var(--nutui-popup-animation-duration, 0.3s);
}
.nut-popup-slide-bottom-exit {
  -webkit-animation-fill-mode: both;
  animation-fill-mode: both;
  -webkit-animation-name: slide-bottom-exit;
  animation-name: slide-bottom-exit;
  -webkit-animation-duration: var(--nutui-popup-animation-duration, 0.3s);
  animation-duration: var(--nutui-popup-animation-duration, 0.3s);
}
@keyframes popup-slide-left-enter {
  0% {
    -webkit-transform: translate3d(-100%, 0, 0);
    transform: translate3d(-100%, 0, 0);
  }
  to {
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
  }
}
@keyframes popup-slide-left-exit {
  to {
    -webkit-transform: translate3d(-100%, 0, 0);
    transform: translate3d(-100%, 0, 0);
  }
}
.nut-popup-slide-left-enter-active,
.nut-popup-slide-left-appear-active {
  -webkit-transform: translate(0);
  -ms-transform: translate(0);
  transform: translate(0);
  -webkit-animation-fill-mode: both;
  animation-fill-mode: both;
  -webkit-animation-name: popup-slide-left-enter;
  animation-name: popup-slide-left-enter;
  -webkit-animation-duration: var(--nutui-popup-animation-duration, 0.3s);
  animation-duration: var(--nutui-popup-animation-duration, 0.3s);
}
.nut-popup-slide-left-exit-active,
.nut-popup-slide-left-exit-done {
  -webkit-animation-fill-mode: both;
  animation-fill-mode: both;
  -webkit-animation-name: popup-slide-left-exit;
  animation-name: popup-slide-left-exit;
  -webkit-animation-duration: var(--nutui-popup-animation-duration, 0.3s);
  animation-duration: var(--nutui-popup-animation-duration, 0.3s);
}
.nut-popup-slide-none-exit-done.nut-popup,
.nut-popup-slide-center-exit-done.nut-popup,
.nut-popup-slide-left-exit-done.nut-popup,
.nut-popup-slide-right-exit-done.nut-popup,
.nut-popup-slide-top-exit-done.nut-popup,
.nut-popup-slide-bottom-exit-done.nut-popup {
  display: none;
}
.nut-popup .nut-overflow-hidden {
  overflow: hidden;
}
[dir='rtl'] .nut-popup-title-left,
.nut-rtl .nut-popup-title-left {
  left: auto;
  right: var(--nutui-popup-title-padding, 16rpx);
}
[dir='rtl'] .nut-popup-title-right,
.nut-rtl .nut-popup-title-right {
  right: auto;
  left: var(--nutui-popup-title-padding, 16rpx);
}
[dir='rtl'] .nut-popup-title-right-top-left,
.nut-rtl .nut-popup-title-right-top-left,
[dir='rtl'] .nut-popup-title-right-bottom-left,
.nut-rtl .nut-popup-title-right-bottom-left {
  left: auto;
  right: var(--nutui-popup-title-padding, 16rpx);
}
[dir='rtl'] .nut-popup-title-right-bottom-right,
.nut-rtl .nut-popup-title-right-bottom-right {
  right: auto;
  left: var(--nutui-popup-title-padding, 16rpx);
}
[dir='rtl'] .nut-popup-title .nut-icon-ArrowLeft,
.nut-rtl .nut-popup-title .nut-icon-ArrowLeft {
  -webkit-transform: rotate(180deg);
  -ms-transform: rotate(180deg);
  transform: rotate(180deg);
}
[dir='rtl'] .nut-popup-center,
.nut-rtl .nut-popup-center {
  left: auto;
  right: 50%;
  -webkit-transform: translate(50%, -50%);
  -ms-transform: translate(50%, -50%);
  transform: translate(50%, -50%);
}
[dir='rtl'] .nut-popup-bottom,
.nut-rtl .nut-popup-bottom,
[dir='rtl'] .nut-popup-top,
.nut-rtl .nut-popup-top {
  left: auto;
  right: 0;
}
.nut-popover {
  position: absolute;
  display: inline-block;
  word-break: normal;
}
.nut-popover-arrow {
  position: absolute;
  width: 8rpx;
  height: 4rpx;
}
.nut-popover-arrow .nut-icon-ArrowRadius {
  position: absolute;
  color: var(--nutui-popover-content-background-color, #ffffff);
}
.nut-popover-arrow-top {
  bottom: -4rpx;
}
.nut-popover-arrow-bottom {
  top: -4rpx;
}
.nut-popover-arrow-left {
  right: -6rpx;
  -webkit-transform-origin: center top;
  -ms-transform-origin: center top;
  transform-origin: center top;
}
.nut-popover-arrow-left.nut-popover-arrow-left {
  top: 50%;
  -webkit-transform: rotate(90deg) translateY(-50%);
  -ms-transform: rotate(90deg) translateY(-50%);
  transform: rotate(90deg) translateY(-50%);
}
.nut-popover-arrow-left.nut-popover-arrow-left-top {
  top: 16rpx;
  right: -8rpx;
  -webkit-transform: rotate(90deg) translateY(0);
  -ms-transform: rotate(90deg) translateY(0);
  transform: rotate(90deg) translateY(0);
}
.nut-popover-arrow-left.nut-popover-arrow-left-bottom {
  top: auto;
  bottom: 16rpx;
  right: -8rpx;
  -webkit-transform: rotate(90deg) translateY(0);
  -ms-transform: rotate(90deg) translateY(0);
  transform: rotate(90deg) translateY(0);
}
.nut-popover-arrow-right {
  -webkit-transform-origin: center top;
  -ms-transform-origin: center top;
  transform-origin: center top;
}
.nut-popover-arrow-right.nut-popover-arrow-right {
  top: 50%;
  left: -6rpx;
  -webkit-transform: rotate(-90deg) translateY(-50%);
  -ms-transform: rotate(-90deg) translateY(-50%);
  transform: rotate(-90deg) translateY(-50%);
}
.nut-popover-arrow-right.nut-popover-arrow-right-top {
  top: 16rpx;
  left: -8rpx;
  -webkit-transform: rotate(-90deg) translateY(0);
  -ms-transform: rotate(-90deg) translateY(0);
  transform: rotate(-90deg) translateY(0);
}
.nut-popover-arrow-right.nut-popover-arrow-right-bottom {
  bottom: 16rpx;
  left: -8rpx;
  -webkit-transform: rotate(-90deg) translateY(0);
  -ms-transform: rotate(-90deg) translateY(0);
  transform: rotate(-90deg) translateY(0);
}
.nut-popover .nut-popover-content {
  position: absolute;
  background: var(--nutui-popover-content-background-color, #ffffff);
  border-radius: var(--nutui-popover-border-radius, var(--nutui-radius-xs, 4rpx));
  font-size: var(--nutui-popover-font-size, var(--nutui-font-size-s, 12rpx));
  color: var(--nutui-popover-text-color, var(--nutui-color-mask, rgba(0, 0, 0, 0.7)));
  line-height: 28rpx;
  max-height: none;
  max-height: initial;
  overflow-y: visible;
  overflow-y: initial;
}
.nut-popover .nut-popover-content-group {
  padding: 0 var(--nutui-popover-padding, 8rpx);
}
.nut-popover .nut-popover-content .nut-popover-item {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  border-bottom: 1rpx solid var(--nutui-popover-divider-color, var(--nutui-color-border, rgba(0, 0, 0, 0.06)));
  max-width: var(--nutui-popover-item-width, 160rpx);
  word-wrap: break-word;
}
.nut-popover .nut-popover-content .nut-popover-item:last-child {
  margin-bottom: 0;
  border-bottom: none;
}
.nut-popover .nut-popover-content .nut-popover-item-icon,
.nut-popover .nut-popover-content .nut-popover-item-action-icon {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  width: var(--nutui-font-size-s, 12rpx);
  height: var(--nutui-font-size-s, 12rpx);
  font-size: var(--nutui-font-size-s, 12rpx);
}
.nut-popover .nut-popover-content .nut-popover-item-icon .nut-icon,
.nut-popover .nut-popover-content .nut-popover-item-action-icon .nut-icon {
  width: var(--nutui-font-size-s, 12rpx);
  height: var(--nutui-font-size-s, 12rpx);
  font-size: var(--nutui-font-size-s, 12rpx);
}
.nut-popover .nut-popover-content .nut-popover-item-icon {
  margin-right: var(--nutui-spacing-xxs, 4rpx);
}
.nut-popover .nut-popover-content .nut-popover-item-name {
  width: calc(100% - 34rpx);
  word-break: keep-all;
  -webkit-flex: 1;
  -ms-flex: 1;
  flex: 1;
}
.nut-popover .nut-popover-content .nut-popover-item-action-icon {
  color: var(--nutui-color-text, #505259);
  margin-left: var(--nutui-spacing-base, 8rpx);
}
.nut-popover .nut-popover-content .nut-popover-item.nut-popover-item-disabled {
  color: var(--nutui-popover-disable-color, var(--nutui-color-text-disabled, #c2c4cc));
  cursor: not-allowed;
}
.nut-popover .nut-popover-content .nut-popover-item.nut-popover-taroitem {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
}
.nut-popover .nut-popover-content-top .nut-popover-arrow-top {
  left: 50%;
  -webkit-transform-origin: center left;
  -ms-transform-origin: center left;
  transform-origin: center left;
  -webkit-transform: rotate(180deg) translate(-50%);
  -ms-transform: rotate(180deg) translate(-50%);
  transform: rotate(180deg) translate(-50%);
}
.nut-popover .nut-popover-content-top-right {
  right: 0;
}
.nut-popover .nut-popover-content-top-right .nut-popover-arrow-top-right {
  right: 16rpx;
  bottom: -3.5rpx;
  -webkit-transform: rotate(180deg) translate(0);
  -ms-transform: rotate(180deg) translate(0);
  transform: rotate(180deg) translate(0);
}
.nut-popover .nut-popover-content-top-left {
  left: 0;
}
.nut-popover .nut-popover-content-top-left .nut-popover-arrow-top-left {
  left: 16rpx;
  bottom: -3.5rpx;
  -webkit-transform: rotate(180deg) translate(0);
  -ms-transform: rotate(180deg) translate(0);
  transform: rotate(180deg) translate(0);
}
.nut-popover .nut-popover-content-bottom .nut-popover-arrow-bottom {
  left: 50%;
  -webkit-transform: translate(-50%);
  -ms-transform: translate(-50%);
  transform: translate(-50%);
}
.nut-popover .nut-popover-content-bottom-right {
  right: 0;
}
.nut-popover .nut-popover-content-bottom-right .nut-popover-arrow-bottom-right {
  right: 16rpx;
  -webkit-transform: translate(0);
  -ms-transform: translate(0);
  transform: translate(0);
}
.nut-popover .nut-popover-content-bottom-left {
  left: 0;
}
.nut-popover .nut-popover-content-bottom-left .nut-popover-arrow-bottom-left {
  left: 16rpx;
  -webkit-transform: translate(0);
  -ms-transform: translate(0);
  transform: translate(0);
}
.nut-popover .nut-popover-content-left-bottom {
  bottom: 0;
}
.nut-popover .nut-popover-content-left-top {
  top: 0;
}
.nut-popover .nut-popover-content-right-bottom {
  bottom: 0;
}
.nut-popover .nut-popover-content-right-top {
  top: 0;
}
.nut-popover-dark {
  background: var(--nutui-popover-text-color, var(--nutui-color-mask, rgba(0, 0, 0, 0.7)));
  color: var(--nutui-popover-content-background-color, #ffffff);
}
.nut-popover-dark .nut-popover-arrow .nut-icon-ArrowRadius {
  color: var(--nutui-popover-text-color, var(--nutui-color-mask, rgba(0, 0, 0, 0.7)));
}
.nut-popover-dark .nut-popover-content {
  background: var(--nutui-popover-text-color, var(--nutui-color-mask, rgba(0, 0, 0, 0.7))) !important;
  color: var(--nutui-popover-content-background-color, #ffffff) !important;
}
.nut-popover-dark .nut-popover-content .nut-popover-item-action-icon {
  color: #fffc;
}
[dir='rtl'] .nut-popover .nut-popover-content .nut-popover-item-name,
.nut-rtl .nut-popover .nut-popover-content .nut-popover-item-name {
  margin-left: 0;
  margin-right: 4rpx;
}
[dir='rtl'] .nut-popover .nut-popover-content .nut-popover-item-action-icon,
.nut-rtl .nut-popover .nut-popover-content .nut-popover-item-action-icon {
  right: auto;
}
[dir='rtl'] .nut-popover .nut-popover-content-top .nut-popover-arrow-top,
.nut-rtl .nut-popover .nut-popover-content-top .nut-popover-arrow-top {
  left: auto;
  right: 50%;
  -webkit-transform: translate(50%);
  -ms-transform: translate(50%);
  transform: translate(50%);
}
[dir='rtl'] .nut-popover .nut-popover-content-top-right,
.nut-rtl .nut-popover .nut-popover-content-top-right {
  right: auto;
  left: 0;
}
[dir='rtl'] .nut-popover .nut-popover-content-top-right .nut-popover-arrow-top-right,
.nut-rtl .nut-popover .nut-popover-content-top-right .nut-popover-arrow-top-right {
  right: auto;
  left: 16rpx;
}
[dir='rtl'] .nut-popover .nut-popover-content-top-left,
.nut-rtl .nut-popover .nut-popover-content-top-left {
  left: auto;
  right: 0;
}
[dir='rtl'] .nut-popover .nut-popover-content-top-left .nut-popover-arrow-top-left,
.nut-rtl .nut-popover .nut-popover-content-top-left .nut-popover-arrow-top-left {
  left: auto;
  right: 16rpx;
}
[dir='rtl'] .nut-popover .nut-popover-content-bottom .nut-popover-arrow-bottom,
.nut-rtl .nut-popover .nut-popover-content-bottom .nut-popover-arrow-bottom {
  left: auto;
  right: 50%;
  -webkit-transform: translate(50%);
  -ms-transform: translate(50%);
  transform: translate(50%);
}
[dir='rtl'] .nut-popover .nut-popover-content-bottom-right,
.nut-rtl .nut-popover .nut-popover-content-bottom-right {
  right: auto;
  left: 0;
}
[dir='rtl'] .nut-popover .nut-popover-content-bottom-right .nut-popover-arrow-bottom-right,
.nut-rtl .nut-popover .nut-popover-content-bottom-right .nut-popover-arrow-bottom-right {
  right: auto;
  left: 16rpx;
}
[dir='rtl'] .nut-popover .nut-popover-content-bottom-left,
.nut-rtl .nut-popover .nut-popover-content-bottom-left {
  left: auto;
  right: 0;
}
[dir='rtl'] .nut-popover .nut-popover-content-bottom-left .nut-popover-arrow-bottom-left,
.nut-rtl .nut-popover .nut-popover-content-bottom-left .nut-popover-arrow-bottom-left {
  left: auto;
  right: 16rpx;
}
.nut-popover-enter-from,
.nut-popover-leave-active {
  -webkit-transform: scale(0.8);
  -ms-transform: scale(0.8);
  transform: scale(0.8);
  opacity: 0;
}
.nut-popover-enter-active {
  -webkit-transition-timing-function: ease-out;
  transition-timing-function: ease-out;
}
.nut-popover-leave-active {
  -webkit-transition-timing-function: ease-in;
  transition-timing-function: ease-in;
}
.nut-popover-content-bg {
  position: fixed;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  background: transparent;
  z-index: 999;
}
[dir='rtl'] .nut-popover-content-bg,
.nut-rtl .nut-popover-content-bg {
  left: auto;
  right: 0;
}
.nut-popover-wrapper {
  display: inline-block;
}
.nut-popover-content-copy {
  position: absolute;
  top: -99999rpx;
}
.nut-pickerview {
  position: relative;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  width: 100%;
  height: calc(var(--nutui-picker-item-height, 36rpx) * 7);
  overflow: hidden;
}
.nut-pickerview-mask,
.nut-pickerview-indicator {
  position: absolute;
  left: 0;
  right: 0;
  z-index: 3;
  pointer-events: none;
}
.nut-pickerview-mask {
  top: 0;
  bottom: 0;
  background-image: var(
    --picker-mask-background,
    linear-gradient(180deg, var(--nutui-white-12), var(--nutui-white-7)),
    linear-gradient(0deg, var(--nutui-white-12), var(--nutui-white-7))
  );
  background-position: top, bottom;
  background-size: 100% calc((var(--nutui-picker-item-height, 36rpx) * 7 - var(--nutui-picker-item-height, 36rpx)) / 2);
  background-repeat: no-repeat;
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
}
.nut-pickerview-indicator {
  top: calc((var(--nutui-picker-item-height, 36rpx) * 7 - var(--nutui-picker-item-height, 36rpx)) / 2);
  height: var(--nutui-picker-item-height, 36rpx);
  border: var(--nutui-picker-item-active-line-border, 1rpx solid var(--nutui-color-border, rgba(0, 0, 0, 0.06)));
  border-left: 0;
  border-right: 0;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}
.nut-pickerview-list {
  position: relative;
  -webkit-flex: 1;
  -ms-flex: 1;
  flex: 1;
  height: calc(var(--nutui-picker-item-height, 36rpx) * 7);
  overflow: hidden;
  -ms-touch-action: none;
  touch-action: none;
}
.nut-pickerview-roller {
  position: absolute;
  top: calc((var(--nutui-picker-item-height, 36rpx) * 7 - var(--nutui-picker-item-height, 36rpx)) / 2);
  width: 100%;
  height: var(--nutui-picker-item-height, 36rpx);
  z-index: 1;
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
}
.nut-pickerview-roller-placeholder {
  height: var(--nutui-picker-item-height, 36rpx);
}
.nut-pickerview-roller-item {
  position: absolute;
  top: 0;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  -moz-backface-visibility: hidden;
}
.nut-pickerview-roller-item-hidden {
  visibility: hidden;
  opacity: 0;
}
.nut-pickerview-roller-item,
.nut-pickerview-roller-item-tiled {
  width: 100%;
  height: var(--nutui-picker-item-height, 36rpx);
  line-height: var(--nutui-picker-item-height, 36rpx);
  color: var(--nutui-picker-item-text-color, var(--nutui-color-title, #1a1a1a));
  font-size: var(--nutui-picker-item-text-font-size, var(--nutui-font-size-base, 14rpx));
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.nut-picker {
  width: 100%;
}
.nut-picker-control {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: space-between;
  -ms-flex-pack: justify;
  justify-content: space-between;
  height: var(--nutui-popup-title-height, 50rpx);
  padding: var(--nutui-popup-title-padding, 16rpx);
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  font-size: var(--nutui-popup-title-font-size, var(--nutui-font-size-xl, 18rpx));
}
.nut-picker-cancel-btn {
  color: var(--nutui-picker-title-cancel-color, var(--nutui-color-text, #505259));
  font-size: var(--nutui-picker-title-cancel-font-size, var(--nutui-font-size-base, 14rpx));
}
.nut-picker-confirm-btn {
  color: var(--nutui-picker-title-ok-color, var(--nutui-color-primary, #ff0f23));
  font-size: var(--nutui-picker-title-ok-font-size, var(--nutui-font-size-base, 14rpx));
}
.nut-picker-title {
  -webkit-flex: 1;
  -ms-flex: 1;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
  color: var(--nutui-color-title, #1a1a1a);
  font-size: var(--nutui-popup-title-font-size, var(--nutui-font-size-xl, 18rpx));
  font-weight: var(--nutui-popup-title-font-weight, var(--nutui-font-weight-bold, 600));
}
.nut-picker-panel {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
}
.nut-pagination {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  font-size: var(--nutui-pagination-font-size, var(--nutui-font-size-base, 14rpx));
  color: var(--nutui-pagination-color, var(--nutui-color-primary, #ff0f23));
}
.nut-pagination-prev,
.nut-pagination-item,
.nut-pagination-next {
  height: 39rpx;
  min-width: 39rpx;
  -webkit-flex-shrink: 0;
  -ms-flex-negative: 0;
  flex-shrink: 0;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  font-size: var(--nutui-pagination-font-size, var(--nutui-font-size-base, 14rpx));
  color: var(--nutui-pagination-color, var(--nutui-color-primary, #ff0f23));
  background: #fff;
  border-radius: var(--nutui-pagination-item-border-radius, 2rpx);
  border: var(--nutui-pagination-item-border-width, 1rpx) solid var(--nutui-pagination-item-border-color, var(--nutui-color-border, rgba(0, 0, 0, 0.06)));
  cursor: pointer;
}
.nut-pagination-prev,
.nut-pagination-item {
  border-right-width: 0;
}
.nut-pagination-prev,
.nut-pagination-next {
  padding: var(--nutui-pagination-prev-next-padding, 0 12rpx);
}
.nut-pagination-contain {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
}
.nut-pagination-item-active {
  color: #fff;
  border-width: 0;
  background-color: var(--nutui-color-primary, #ff0f23);
}
.nut-pagination-item-disabled,
.nut-pagination-next-disabled,
.nut-pagination-prev-disabled {
  color: var(--nutui-pagination-disable-color, var(--nutui-color-text-disabled, #c2c4cc));
  background-color: var(--nutui-pagination-disable-background-color, #f7f8fa);
  cursor: not-allowed;
}
.nut-pagination-simple {
  height: 39rpx;
  width: 124rpx;
  line-height: 39rpx;
  text-align: center;
  font-size: var(--nutui-pagination-font-size, var(--nutui-font-size-base, 14rpx));
  color: var(--nutui-pagination-color, var(--nutui-color-primary, #ff0f23));
}
.nut-pagination-simple-border {
  border-right: var(--nutui-pagination-item-border-width, 1rpx) solid var(--nutui-pagination-item-border-color, var(--nutui-color-border, rgba(0, 0, 0, 0.06)));
}
.nut-pagination-lite {
  height: var(--nutui-pagination-lite-height, 20rpx);
  padding: 0 var(--nutui-spacing-xs, 6rpx);
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  color: #fff;
  background-color: var(--nutui-pagination-lite-background-color, rgba(0, 0, 0, 0.45));
  border-radius: var(--nutui-pagination-lite-radius, var(--nutui-radius-xs, 4rpx));
}
.nut-pagination-lite-active,
.nut-pagination-lite-default,
.nut-pagination-lite-spliterator {
  font-size: var(--nutui-font-size-xs, 11rpx);
  color: var(--nutui-pagination-lite-color, #ffffff);
}
.nut-overlay {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  background-color: var(--nutui-overlay-bg-color, var(--nutui-color-mask, rgba(0, 0, 0, 0.7)));
}
.nut-overflow-hidden {
  overflow: hidden !important;
}
@keyframes nut-fade-in {
  0% {
    opacity: 0;
  }
  1% {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes nut-fade-out {
  0% {
    opacity: 1;
  }
  1% {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
.nut-overlay-slide-enter-active,
.nut-overlay-slide-appear-active {
  -webkit-animation-fill-mode: both;
  animation-fill-mode: both;
  -webkit-animation-name: nut-fade-in;
  animation-name: nut-fade-in;
  -webkit-animation-duration: var(--nutui-overlay-animation-duration, 0.3s);
  animation-duration: var(--nutui-overlay-animation-duration, 0.3s);
}
.nut-overlay-slide-exit-active {
  -webkit-animation-fill-mode: both;
  animation-fill-mode: both;
  -webkit-animation-name: nut-fade-out;
  animation-name: nut-fade-out;
  -webkit-animation-duration: var(--nutui-overlay-animation-duration, 0.3s);
  animation-duration: var(--nutui-overlay-animation-duration, 0.3s);
}
[dir='rtl'] .nut-overlay,
.nut-rtl .nut-overlay {
  left: auto;
  right: 0;
}
.nut-numberkeyboard {
  width: 100%;
  padding: var(--nutui-numberkeyboard-padding, 0 0 22rpx 0);
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  background-color: var(--nutui-numberkeyboard-background-color, var(--nutui-color-background, #f2f3f5));
}
.nut-numberkeyboard-header {
  position: relative;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-box-sizing: content-box;
  box-sizing: content-box;
  padding: var(--nutui-popup-title-padding, 16rpx);
  color: var(--nutui-color-title, #1a1a1a);
  font-size: var(--nutui-popup-title-font-size, var(--nutui-font-size-xl, 18rpx));
}
.nut-numberkeyboard-header-title {
  color: var(--nutui-color-title, #1a1a1a);
  display: inline-block;
  font-size: var(--nutui-popup-title-font-size, var(--nutui-font-size-xl, 18rpx));
}
.nut-numberkeyboard-header-close {
  position: absolute;
  display: block;
  right: 0;
  top: 50%;
  -webkit-transform: translateY(-50%);
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
  padding: var(--nutui-numberkeyboard-header-close-padding, 0 16rpx);
  color: var(--nutui-numberkeyboard-header-close-color, var(--nutui-color-text, #505259));
  font-size: var(--nutui-numberkeyboard-header-close-font-size, 14rpx);
  background-color: var(--nutui-numberkeyboard-header-close-background-color, transparent);
  border: none;
  cursor: pointer;
}
.nut-numberkeyboard-body {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  padding: 6rpx 0 0 6rpx;
}
.nut-numberkeyboard-body-keys {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex: 3;
  -ms-flex: 3;
  flex: 3;
  -webkit-flex-wrap: wrap;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
}
.nut-numberkeyboard-body-wrapper {
  position: relative;
  -webkit-flex: 1;
  -ms-flex: 1;
  flex: 1;
  width: 33%;
  -webkit-flex-basis: 33%;
  -ms-flex-preferred-size: 33%;
  flex-basis: 33%;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  padding: 0 6rpx 6rpx 0;
  background-color: var(--nutui-numberkeyboard-wrapper-background-color, var(--nutui-color-background-sunken, #f7f8fc));
}
.nut-numberkeyboard-body-wrapper .key {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  height: var(--nutui-numberkeyboard-key-height, 48rpx);
  font-size: var(--nutui-numberkeyboard-key-font-size, var(--nutui-font-size-xl, 18rpx));
  line-height: var(--nutui-numberkeyboard-key-line-height, 1.5);
  background-color: var(--nutui-numberkeyboard-key-background-color, var(--nutui-color-background-overlay, #ffffff));
  color: var(--nutui-numberkeyboard-key-color, var(--nutui-color-text, #505259));
  border-radius: var(--nutui-numberkeyboard-key-border-radius, 8rpx);
  border: var(--nutui-numberkeyboard-key-border, none);
  font-weight: var(--nutui-font-weight-bold, 600);
  cursor: pointer;
}
.nut-numberkeyboard-body-wrapper .key.active {
  background-color: var(--nutui-numberkeyboard-key-active-background-color, #ebedf0);
}
.nut-numberkeyboard-sidebar {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex: 1;
  -ms-flex: 1;
  flex: 1;
  -webkit-flex-basis: 33%;
  -ms-flex-preferred-size: 33%;
  flex-basis: 33%;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
}
.nut-numberkeyboard-sidebar .nut-numberkeyboard-body-wrapper {
  width: 100%;
}
.nut-numberkeyboard-sidebar .nut-numberkeyboard-body-wrapper .key {
  position: absolute;
  top: 0;
  right: 6rpx;
  bottom: 6rpx;
  left: 0;
  height: auto;
}
.nut-numberkeyboard-sidebar .nut-numberkeyboard-body-wrapper .confirm {
  font-size: var(--nutui-numberkeyboard-key-confirm-font-size, var(--nutui-font-size-l, 15rpx));
  color: var(--nutui-numberkeyboard-key-confirm-color, #fff);
  background-color: var(--nutui-numberkeyboard-key-confirm-background-color, var(--nutui-color-primary, #ff0f23));
}
.nut-numberkeyboard-sidebar .nut-numberkeyboard-body-wrapper .confirm.active {
  background-color: #ff0000b3;
}
[dir='rtl'] .nut-popup .nut-numberkeyboard-header-close,
.nut-rtl .nut-popup .nut-numberkeyboard-header-close {
  right: auto;
  left: 0;
}
[dir='rtl'] .nut-popup .nut-numberkeyboard-body,
.nut-rtl .nut-popup .nut-numberkeyboard-body {
  padding: 6rpx 6rpx 0 0;
}
[dir='rtl'] .nut-popup .nut-numberkeyboard-body-wrapper,
.nut-rtl .nut-popup .nut-numberkeyboard-body-wrapper {
  padding: 0 0 6rpx 6rpx;
}
[dir='rtl'] .nut-popup .nut-numberkeyboard-body-wrapper .delete,
.nut-rtl .nut-popup .nut-numberkeyboard-body-wrapper .delete {
  -webkit-transform: rotate(-180deg);
  -ms-transform: rotate(-180deg);
  transform: rotate(-180deg);
}
[dir='rtl'] .nut-popup .nut-numberkeyboard-sidebar .nut-numberkeyboard-body-wrapper .key,
.nut-rtl .nut-popup .nut-numberkeyboard-sidebar .nut-numberkeyboard-body-wrapper .key {
  left: 6rpx;
  right: 0;
}
[dir='rtl'] .nut-popup .nut-numberkeyboard-sidebar .nut-numberkeyboard-body-wrapper .key.delete,
.nut-rtl .nut-popup .nut-numberkeyboard-sidebar .nut-numberkeyboard-body-wrapper .key.delete {
  -webkit-transform: rotate(-180deg);
  -ms-transform: rotate(-180deg);
  transform: rotate(-180deg);
}
.fade-enter {
  opacity: 0;
}
.fade-enter-active {
  opacity: 1;
  -webkit-transition: opacity 0.3s ease-in;
  transition: opacity 0.3s ease-in;
}
.fade-enter-done,
.fade-exit {
  opacity: 1;
}
.fade-exit-active {
  opacity: 0;
  -webkit-transition: opacity 0.3s ease-out;
  transition: opacity 0.3s ease-out;
}
.fade-exit-done,
.fade-appear {
  opacity: 0;
}
.fade-appear-active {
  opacity: 1;
  -webkit-transition: opacity 0.3s;
  transition: opacity 0.3s;
}
.nut-notify {
  position: fixed;
  left: 8rpx;
  right: 8rpx;
  z-index: var(--nutui-notify-z-index, 1000);
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  height: var(--nutui-notify-height, 40rpx);
  padding: var(--nutui-notify-padding, 0rpx 12rpx);
  border-radius: var(--nutui-notify-border-radius, 8rpx);
  -webkit-box-shadow: var(--nutui-notify-box-shadow, 0rpx 4rpx 12rpx 0rpx rgba(0, 0, 0, 0.06));
  box-shadow: var(--nutui-notify-box-shadow, 0rpx 4rpx 12rpx 0rpx rgba(0, 0, 0, 0.06));
  background-color: var(--nutui-notify-background-color, #ffffff);
}
.nut-notify-content {
  -webkit-flex: 1;
  -ms-flex: 1;
  flex: 1;
  text-align: center;
  min-width: 0;
  font-size: var(--nutui-notify-font-size, var(--nutui-font-size-base, 14rpx));
  color: var(--nutui-notify-text-color, var(--nutui-color-title, #1a1a1a));
  white-space: nowrap;
  overflow: hidden;
}
.nut-notify-ellipsis {
  text-overflow: ellipsis;
}
.nut-notify-layout-left {
  text-align: left;
}
.nut-notify-left-icon,
.nut-notify-right-icon {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  display: -webkit-inline-flex;
  display: -ms-inline-flexbox;
  display: inline-flex;
}
.nut-notify-left-icon {
  margin-right: 6rpx;
}
.nut-notify-left-icon .nut-icon {
  height: 16rpx;
  width: 16rpx;
}
.nut-notify-right-icon {
  margin-left: 6rpx;
}
.nut-notify-right-icon .nut-icon {
  height: 12rpx;
  width: 12rpx;
}
.nut-noticebar {
  width: 100%;
}
.nut-noticebar .nut-noticebar-box {
  position: relative;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  height: var(--nutui-noticebar-height, 36rpx);
  padding: var(--nutui-noticebar-box-padding, 0 16rpx);
  font-size: var(--nutui-noticebar-font-size, var(--nutui-font-size-s, 12rpx));
  background: var(--nutui-noticebar-background, rgb(251, 248, 220));
  color: var(--nutui-noticebar-color, #d9500b);
  border-radius: var(--nutui-noticebar-border-radius, 0);
}
.nut-noticebar .nut-noticebar-box-wrapable,
.nut-noticebar .nut-noticebar-box-center {
  height: auto;
  padding: var(--nutui-noticebar-wrapable-padding, 8rpx 16rpx);
}
.nut-noticebar .nut-noticebar-box-wrapable .nut-noticebar-box-wrap,
.nut-noticebar .nut-noticebar-box-center .nut-noticebar-box-wrap {
  height: auto;
}
.nut-noticebar .nut-noticebar-box-wrapable .nut-noticebar-box-wrap .nut-noticebar-box-wrap-content {
  position: relative;
  white-space: normal;
  word-wrap: break-word;
}
.nut-noticebar .nut-noticebar-box-center {
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
}
.nut-noticebar .nut-noticebar-box-center .nut-noticebar-box-wrap {
  -webkit-flex: initial;
  -ms-flex: initial;
  flex: initial;
}
.nut-noticebar .nut-noticebar-box-center .nut-noticebar-box-wrap .nut-noticebar-box-wrap-content {
  position: relative;
  display: inline;
  display: initial;
}
.nut-noticebar .nut-noticebar-box-left-icon {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  height: var(--nutui-noticebar-left-icon-width, 16rpx);
  min-width: var(--nutui-noticebar-left-icon-width, 16rpx);
  margin-right: var(--nutui-noticebar-icon-gap, 4rpx);
  background-size: 100% 100%;
}
.nut-noticebar .nut-noticebar-box-left-icon .nut-icon {
  color: var(--nutui-noticebar-color, #d9500b);
}
.nut-noticebar .nut-noticebar-box-right-icon {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  width: var(--nutui-noticebar-right-icon-width, 16rpx);
  margin-left: var(--nutui-noticebar-icon-gap, 4rpx);
}
.nut-noticebar .nut-noticebar-box-right-icon .nut-icon {
  width: 12rpx;
  height: 12rpx;
  color: var(--nutui-noticebar-color, #d9500b);
}
.nut-noticebar .nut-noticebar-box-wrap {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex: 1;
  -ms-flex: 1;
  flex: 1;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  height: var(--nutui-noticebar-line-height, 24rpx);
  line-height: var(--nutui-noticebar-line-height, 24rpx);
  overflow: hidden;
  position: relative;
}
.nut-noticebar .nut-noticebar-box-wrap .nut-noticebar-box-wrap-content {
  position: absolute;
  white-space: nowrap;
  color: var(--nutui-noticebar-color, #d9500b);
}
.nut-noticebar .nut-noticebar-box-wrap .nut-noticebar-box-wrap-content.nut-ellipsis {
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.nut-noticebar .nut-noticebar-box .play {
  -webkit-animation: nut-notice-bar-play linear both running;
  animation: nut-notice-bar-play linear both running;
}
.nut-noticebar .nut-noticebar-box .play-infinite {
  -webkit-animation: nut-notice-bar-play-infinite linear infinite both running;
  animation: nut-notice-bar-play-infinite linear infinite both running;
}
.nut-noticebar .nut-noticebar-box .play-vertical {
  -webkit-animation: nut-notice-bar-play-vertical linear infinite both running;
  animation: nut-notice-bar-play-vertical linear infinite both running;
}
.nut-noticebar .nut-noticebar-vertical {
  position: relative;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-justify-content: space-between;
  -ms-flex-pack: justify;
  justify-content: space-between;
  height: var(--nutui-noticebar-height, 36rpx);
  font-size: var(--nutui-noticebar-font-size, var(--nutui-font-size-s, 12rpx));
  overflow: hidden;
  padding: var(--nutui-noticebar-box-padding, 0 16rpx);
  background: var(--nutui-noticebar-background, rgb(251, 248, 220));
  color: var(--nutui-noticebar-color, #d9500b);
}
.nut-noticebar .nut-noticebar-vertical .nut-noticebar-box-left-icon {
  height: var(--nutui-noticebar-left-icon-width, 16rpx);
  min-width: var(--nutui-noticebar-left-icon-width, 16rpx);
  margin: var(--nutui-noticebar-icon-gap, 4rpx);
  background-size: 100% 100%;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-self: center;
  -ms-flex-item-align: center;
  align-self: center;
}
.nut-noticebar .nut-noticebar-vertical .nut-noticebar-box-horseLamp-list {
  margin: 0;
  padding: 0;
  display: block;
  -webkit-flex: 1;
  -ms-flex: 1;
  flex: 1;
}
.nut-noticebar .nut-noticebar-vertical .nut-noticebar-box-horseLamp-list-item {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  height: var(--nutui-noticebar-height, 36rpx);
  width: 100%;
}
.nut-noticebar .nut-noticebar-vertical .nut-noticebar-box-wrap {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  height: 100%;
  width: 100%;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
}
.nut-noticebar .nut-noticebar-vertical .nut-noticebar-box-right-icon {
  -webkit-align-self: center;
  -ms-flex-item-align: center;
  align-self: center;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  width: var(--nutui-noticebar-right-icon-width, 16rpx);
  margin-left: var(--nutui-noticebar-icon-gap, 4rpx);
}
@keyframes nut-notice-bar-play {
  to {
    -webkit-transform: translate3d(-100%, 0, 0);
    transform: translate3d(-100%, 0, 0);
  }
}
@keyframes nut-notice-bar-play-infinite {
  to {
    -webkit-transform: translate3d(-100%, 0, 0);
    transform: translate3d(-100%, 0, 0);
  }
}
@keyframes nut-notice-bar-play-vertical {
  to {
    -webkit-transform: translateY(var(--nutui-noticebar-height, 36rpx));
    transform: translateY(var(--nutui-noticebar-height, 36rpx));
  }
}
[dir='rtl'] .nut-noticebar .nut-noticebar-box-left-icon,
.nut-rtl .nut-noticebar .nut-noticebar-box-left-icon {
  margin-right: 0;
  margin-left: var(--nutui-noticebar-icon-gap, 4rpx);
}
[dir='rtl'] .nut-noticebar .nut-noticebar-box-right-icon,
.nut-rtl .nut-noticebar .nut-noticebar-box-right-icon {
  margin-left: 0;
  margin-right: var(--nutui-noticebar-icon-gap, 4rpx);
}
[dir='rtl'] .nut-noticebar .nut-noticebar-box .play,
.nut-rtl .nut-noticebar .nut-noticebar-box .play {
  -webkit-animation: nut-notice-bar-play-rtl linear both running;
  animation: nut-notice-bar-play-rtl linear both running;
}
[dir='rtl'] .nut-noticebar .nut-noticebar-box .play-infinite,
.nut-rtl .nut-noticebar .nut-noticebar-box .play-infinite {
  -webkit-animation: nut-notice-bar-play-infinite-rtl linear infinite both running;
  animation: nut-notice-bar-play-infinite-rtl linear infinite both running;
}
@keyframes nut-notice-bar-play-rtl {
  to {
    -webkit-transform: translate3d(100%, 0, 0);
    transform: translate3d(100%, 0, 0);
  }
}
@keyframes nut-notice-bar-play-infinite-rtl {
  to {
    -webkit-transform: translate3d(100%, 0, 0);
    transform: translate3d(100%, 0, 0);
  }
}
[dir='rtl'] .nut-noticebar .nut-noticebar-vertical .nut-noticebar-box-right-icon,
.nut-rtl .nut-noticebar .nut-noticebar-vertical .nut-noticebar-box-right-icon {
  margin-left: 0;
  margin-right: var(--nutui-noticebar-icon-gap, 4rpx);
}
.nut-navbar {
  width: var(--nutui-navbar-width, 100%);
  position: relative;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  -webkit-justify-content: space-between;
  -ms-flex-pack: justify;
  justify-content: space-between;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  height: var(--nutui-navbar-height, 44rpx);
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  background: var(--nutui-navbar-background, #ffffff);
  -webkit-box-shadow: var(--nutui-navbar-box-shadow, none);
  box-shadow: var(--nutui-navbar-box-shadow, none);
  font-size: var(--nutui-navbar-font-size, var(--nutui-font-size-base, 14rpx));
  color: var(--nutui-navbar-color, var(--nutui-color-title, #1a1a1a));
  overflow: hidden;
  padding: 0 16rpx;
}
.nut-navbar-fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
}
.nut-navbar-placeholder {
  display: inline-block;
  width: 100%;
}
.nut-navbar-safe-area-inset-top {
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
}
.nut-navbar-title-wrapper {
  -webkit-justify-content: space-between;
  -ms-flex-pack: justify;
  justify-content: space-between;
}
.nut-navbar-title {
  height: 100%;
  text-align: center;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex: 1;
  -ms-flex: 1;
  flex: 1;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  font-size: var(--nutui-navbar-title-font-size, var(--nutui-font-size-xl, 18rpx));
  font-weight: var(--nutui-navbar-title-font-weight, var(--nutui-font-weight-bold, 600));
  color: var(--nutui-navbar-title-font-color, var(--nutui-color-title, #1a1a1a));
}
.nut-navbar-title-center {
  max-width: 129rpx;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
}
.nut-navbar-title ::-webkit-scrollbar {
  display: none;
}
.nut-navbar-left,
.nut-navbar-right {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  max-width: 124rpx;
  height: 100%;
  cursor: pointer;
}
.nut-navbar-left .nut-icon,
.nut-navbar-left .nutui-iconfont,
.nut-navbar-right .nut-icon,
.nut-navbar-right .nutui-iconfont {
  width: 20rpx;
  height: 20rpx;
  font-size: 20rpx;
}
.nut-navbar-left-maxwidth,
.nut-navbar-right-maxwidth {
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  width: 108rpx;
}
.nut-navbar-left {
  padding-right: 16rpx;
  gap: 16rpx;
}
.nut-navbar-left-rtl {
  padding-right: 0;
  padding-left: 16rpx;
}
.nut-navbar-left-back {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  gap: 16rpx;
}
.nut-navbar-left-hidden {
  padding-left: 0;
  padding-right: 0;
}
.nut-navbar-right {
  padding-left: 16rpx;
  -webkit-justify-content: flex-end;
  -ms-flex-pack: end;
  justify-content: flex-end;
  gap: 16rpx;
}
.nut-navbar-right-rtl {
  padding-right: 16rpx;
  padding-left: 0;
}
.nut-navbar-rtl .nut-icon-ArrowLeft {
  -webkit-transform: rotateY(180deg);
  transform: rotateY(180deg);
}
.nut-menu-container-content {
  padding: var(--nutui-menu-content-padding, 12rpx 24rpx);
  max-height: var(--nutui-menu-content-max-height, 214rpx);
  overflow-y: auto;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-wrap: wrap;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
  background: var(--nutui-menu-content-background-color, var(--nutui-color-background-overlay, #ffffff));
}
.nut-menu-container-content_fixed {
  width: 100%;
  opacity: 0;
  position: fixed;
}
.nut-menu-container-item {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  color: var(--nutui-color-title, #1a1a1a);
  font-size: var(--nutui-font-size-base, 14rpx);
  padding: var(--nutui-menu-item-padding, 12rpx 0);
}
.nut-menu-container-item.active {
  font-weight: var(--nutui-menu-item-active-font-weight, var(--nutui-font-weight-bold, 600));
  color: var(--nutui-menu-item-active-color, var(--nutui-color-primary, #ff0f23));
}
.nut-menu-container-item .nut-icon {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  display: -webkit-inline-flex;
  display: -ms-inline-flexbox;
  display: inline-flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  margin-right: var(--nutui-menu-item-icon-margin, 8rpx);
  -webkit-flex-shrink: 0;
  -ms-flex-negative: 0;
  flex-shrink: 0;
}
.nut-menu-container-wrap,
.nut-menu-container-wrap-up {
  position: absolute;
  width: 100%;
  z-index: var(--nutui-menu-container-z-index, 1000);
  overflow: hidden;
}
.nut-menu-container-wrap-up {
  bottom: var(--nutui-menu-bar-line-height, 48rpx);
}
.overlay-fade-enter-active.nut-menu-container-overlay {
  top: auto;
  z-index: var(--nutui-menu-container-z-index, 1000);
}
.nut-menu-placeholder-element {
  position: fixed;
  top: calc(var(--menu-bar-line-height) * -1);
  left: 0;
  right: 0;
  z-index: var(--nutui-menu-bar-opened-z-index, 1000);
  background-color: transparent;
}
.nut-menu-placeholder-element.up {
  bottom: calc(var(--menu-bar-line-height) * -1);
}
.nut-menu-container-down-enter {
  opacity: 0;
  -webkit-transform: translateY(-30rpx);
  -ms-transform: translateY(-30rpx);
  transform: translateY(-30rpx);
}
.nut-menu-container-down-enter-done {
  opacity: 1;
  -webkit-transform: translate(0);
  -ms-transform: translate(0);
  transform: translate(0);
  -webkit-transition: all 0.1s;
  transition: all 0.1s;
}
.nut-menu-container-down-exit {
  opacity: 1;
  -webkit-transition: all 0.1s;
  transition: all 0.1s;
}
.nut-menu-container-down-exit-done {
  opacity: 0;
  -webkit-transition: all 0.1s;
  transition: all 0.1s;
}
.nut-menu-container-up-enter {
  opacity: 0;
  -webkit-transform: translateY(30rpx);
  -ms-transform: translateY(30rpx);
  transform: translateY(30rpx);
}
.nut-menu-container-up-enter-done {
  opacity: 1;
  -webkit-transform: translate(0);
  -ms-transform: translate(0);
  transform: translate(0);
  -webkit-transition: all 0.1s;
  transition: all 0.1s;
}
.nut-menu-container-up-exit {
  opacity: 1;
  -webkit-transition: all 0.1s;
  transition: all 0.1s;
}
.nut-menu-container-up-exit-done {
  opacity: 0;
  -webkit-transition: all 0.1s;
  transition: all 0.1s;
}
[dir='rtl'] .nut-menu-container-item .nut-icon,
.nut-rtl .nut-menu-container-item .nut-icon {
  margin-right: 0;
  margin-left: var(--nutui-menu-item-icon-margin, 8rpx);
}
[dir='rtl'] .nut-menu-container .nut-icon,
.nut-rtl .nut-menu-container .nut-icon {
  -webkit-transform: rotateY(180deg);
  transform: rotateY(180deg);
}
.nut-menu {
  position: relative;
}
.nut-menu.scroll-fixed {
  position: fixed;
  top: var(--nutui-menu-scroll-fixed-top, 0);
  z-index: var(--nutui-menu-scroll-fixed-z-index, 1000);
  width: 100%;
}
.nut-menu-bar {
  position: relative;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  line-height: var(--nutui-menu-bar-line-height, 48rpx);
  background-color: var(--nutui-color-background-overlay, #ffffff);
  -webkit-box-shadow: var(--nutui-menu-bar-box-shadow, 0 2rpx 12rpx rgba(89, 89, 89, 0.12));
  box-shadow: var(--nutui-menu-bar-box-shadow, 0 2rpx 12rpx rgba(89, 89, 89, 0.12));
}
.nut-menu-bar.opened {
  z-index: var(--nutui-menu-bar-opened-z-index, 1000);
}
.nut-menu-title {
  -webkit-flex: 1;
  -ms-flex: 1;
  flex: 1;
  text-align: center;
  font-size: var(--nutui-menu-title-font-size, var(--nutui-font-size-base, 14rpx));
  color: var(--nutui-menu-title-color, var(--nutui-color-title, #1a1a1a));
  min-width: 0;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  max-width: 100%;
}
.nut-menu-title-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  padding: var(--nutui-menu-title-padding, 0 8rpx);
}
.nut-menu-title-icon {
  -webkit-flex-shrink: 0;
  -ms-flex-negative: 0;
  flex-shrink: 0;
  -webkit-transition: all 0.2s linear;
  transition: all 0.2s linear;
}
.nut-menu-title.active {
  color: var(--nutui-menu-item-active-color, var(--nutui-color-primary, #ff0f23));
}
.nut-menu-title.disabled {
  color: var(--nutui-menu-item-disabled-color, var(--nutui-color-text-disabled, #c2c4cc));
}
.nut-menu-title.active .nut-menu-title-icon {
  -webkit-transform: rotate(180deg);
  -ms-transform: rotate(180deg);
  transform: rotate(180deg);
}
.nut-loading {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  display: -webkit-inline-flex;
  display: -ms-inline-flexbox;
  display: inline-flex;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
}
.nut-loading-vertical {
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
}
.nut-loading .nut-loading-icon-box {
  display: inline-block;
  font-size: 0;
  line-height: 0;
  -webkit-animation: nut-loading-rotation 1s infinite linear;
  animation: nut-loading-rotation 1s infinite linear;
}
.nut-loading .nut-loading-icon-box .nut-loading-icon {
  color: var(--nutui-loading-icon-color, var(--nutui-color-text-help, #888b94));
  width: var(--nutui-loading-icon-size, var(--nutui-font-size-s, 12rpx));
  height: var(--nutui-loading-icon-size, var(--nutui-font-size-s, 12rpx));
  font-size: var(--nutui-loading-icon-size, var(--nutui-font-size-s, 12rpx));
}
.nut-loading .nut-loading-text {
  color: var(--nutui-loading-color, var(--nutui-color-text-help, #888b94));
  font-size: var(--nutui-loading-font-size, var(--nutui-font-size-s, 12rpx));
}
.nut-loading-vertical .nut-loading-text {
  padding-top: var(--nutui-spacing-base, 8rpx);
}
@keyframes nut-loading-rotation {
}
.nut-inputnumber {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  display: -webkit-inline-flex;
  display: -ms-inline-flexbox;
  display: inline-flex;
  width: calc(var(--nutui-inputnumber-input-margin, 0rpx) * 2 + var(--nutui-inputnumber-button-width, 20rpx) * 2 + var(--nutui-inputnumber-input-width, 26rpx));
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  background-color: var(--nutui-color-background, #f2f3f5);
  border-radius: var(--nutui-inputnumber-input-border-radius, 4rpx);
  overflow: hidden;
}
.nut-inputnumber-minus,
.nut-inputnumber-add {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  width: var(--nutui-inputnumber-button-width, 20rpx);
  height: var(--nutui-inputnumber-button-height, 20rpx);
  background-color: var(--nutui-inputnumber-button-background-color, transparent);
}
.nut-inputnumber-minus .nut-icon,
.nut-inputnumber-add .nut-icon {
  --nut-icon-width: 10rpx;
  --nut-icon-height: 10rpx;
}
.nut-inputnumber-icon {
  color: var(--nutui-color-text, #505259);
  cursor: pointer;
}
.nut-inputnumber-icon-disabled {
  color: var(--nutui-color-text-disabled, #c2c4cc);
  cursor: not-allowed;
}
.nut-inputnumber-input {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  width: var(--nutui-inputnumber-input-width, 26rpx);
  font-size: var(--nutui-inputnumber-input-font-size, var(--nutui-font-size-s, 12rpx));
  height: var(--nutui-inputnumber-input-height, 20rpx);
  text-align: center;
  outline: none;
  border: var(--nutui-inputnumber-input-border, 0);
  margin-left: var(--nutui-inputnumber-input-margin, 0rpx);
  margin-right: var(--nutui-inputnumber-input-margin, 0rpx);
  color: var(--nutui-color-text, #505259);
  background-color: var(--nutui-inputnumber-input-background-color, var(--nutui-color-background, #f2f3f5));
}
.nut-inputnumber-input::-webkit-outer-spin-button,
.nut-inputnumber-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  appearance: none;
}
.nut-inputnumber-input-disabled {
  color: var(--nutui-color-text-disabled, #c2c4cc);
}
.nut-inputnumber-icon-minus,
.nut-inputnumber-icon-plus {
  --nut-icon-width: 16rpx;
  --nut-icon-height: 16rpx;
}
.nut-infiniteloading {
  display: block;
  width: 100%;
}
.nut-infiniteloading .nut-infinite-top {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  width: 100%;
  overflow: hidden;
  font-size: var(--nutui-font-size-s, 12rpx);
  color: var(--nutui-infiniteloading-color, var(--nutui-color-text-help, #888b94));
}
.nut-infiniteloading .nut-infinite-top-tips {
  width: 100%;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
}
.nut-infiniteloading .nut-infinite-top-tips-icons {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  margin-bottom: 4rpx;
}
.nut-infiniteloading .nut-infinite-bottom {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  width: 100%;
  padding-top: 6rpx;
  color: var(--nutui-infiniteloading-color, var(--nutui-color-text-help, #888b94));
  text-align: center;
}
.nut-infiniteloading .nut-infinite-bottom-tips {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  font-size: var(--nutui-font-size-xxs, 10rpx);
}
.nut-infiniteloading .nut-infinite-bottom-tips-icons {
  margin-right: 8rpx;
}
.nut-infiniteloading-primary {
  background-color: var(--nutui-color-primary, #ff0f23);
}
.nut-infiniteloading-primary .nut-infinite-bottom,
.nut-infiniteloading-primary .nut-infinite-top {
  color: var(--nutui-color-text-dark, rgba(255, 255, 255, 0.9));
}
[dir='rtl'] .nut-infiniteloading .nut-infinite-bottom-tips-icons,
.nut-rtl .nut-infiniteloading .nut-infinite-bottom-tips-icons {
  margin-right: 0;
  margin-left: 8rpx;
}
.nut-input {
  position: relative;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  -webkit-flex-wrap: nowrap;
  -ms-flex-wrap: nowrap;
  flex-wrap: nowrap;
  -webkit-flex: 1;
  -ms-flex: 1;
  flex: 1;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  font-size: var(--nutui-input-font-size, var(--nutui-font-size-base, 14rpx));
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}
.nut-input .nut-input-native .weui-input::-webkit-input-placeholder {
  color: #757575;
  font-size: var(--nutui-input-font-size, var(--nutui-font-size-base, 14rpx));
}
.nut-input .nut-input-native .weui-input::-moz-placeholder {
  color: #757575;
  font-size: var(--nutui-input-font-size, var(--nutui-font-size-base, 14rpx));
}
.nut-input .nut-input-native .weui-input:-ms-input-placeholder {
  color: #757575;
  font-size: var(--nutui-input-font-size, var(--nutui-font-size-base, 14rpx));
}
.nut-input .nut-input-native .weui-input::-ms-input-placeholder {
  color: #757575;
  font-size: var(--nutui-input-font-size, var(--nutui-font-size-base, 14rpx));
}
.nut-input .nut-input-native .weui-input::placeholder,
.nut-input-placeholder {
  color: #757575;
  font-size: var(--nutui-input-font-size, var(--nutui-font-size-base, 14rpx));
}
.nut-input .nut-icon {
  color: var(--nutui-color-text-disabled, #c2c4cc);
  width: 14rpx;
  height: 14rpx;
  font-size: 14rpx;
}
.nut-input-container {
  height: 38rpx;
  padding: var(--nutui-input-padding, 12rpx);
  background-color: var(--nutui-input-background-color, var(--nutui-color-background-overlay, #ffffff));
  border-radius: var(--nutui-input-border-radius, var(--nutui-radius-s, 6rpx));
  border-bottom: var(--nutui-input-border-bottom-width, 0rpx) solid var(--nutui-input-border-bottom, var(--nutui-color-border, rgba(0, 0, 0, 0.06)));
}
.nut-input-native {
  -webkit-flex: 1;
  -ms-flex: 1;
  flex: 1;
  color: var(--nutui-input-color, var(--nutui-color-title, #1a1a1a));
  font-size: var(--nutui-input-font-size, var(--nutui-font-size-base, 14rpx));
  padding: 0;
  border: 0;
  outline: 0 none;
  text-decoration: none;
  background-color: transparent;
}
.nut-input-readonly .nut-input-native {
  color: var(--nutui-color-text-help, #888b94);
}
.nut-input-disabled {
  color: var(--nutui-color-text-disabled, #c2c4cc) !important;
}
.nut-input-disabled .h5-input:disabled {
  color: var(--nutui-color-text-disabled, #c2c4cc);
  cursor: not-allowed;
  background: none;
  opacity: 1;
  -webkit-text-fill-color: var(--nutui-color-text-disabled, #c2c4cc);
}
.nut-indicator {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  width: auto;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  -webkit-flex-wrap: nowrap;
  -ms-flex-wrap: nowrap;
  flex-wrap: nowrap;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
}
.nut-indicator-fixed-width {
  width: 21rpx;
}
.nut-indicator-dot,
.nut-indicator-line {
  display: inline-block;
  vertical-align: middle;
  width: var(--nutui-indicator-dot-size, 3rpx);
  height: var(--nutui-indicator-dot-size, 3rpx);
  border-radius: 50%;
  background-color: var(--nutui-color-border-disabled, #c2c4cc);
  margin-left: var(--nutui-indicator-dot-margin, var(--nutui-spacing-xxs, 4rpx));
  opacity: 0.4;
}
.nut-indicator-dot-0,
.nut-indicator-line-0 {
  margin-left: 0;
}
.nut-indicator-dot-active,
.nut-indicator-line-active {
  width: var(--nutui-indicator-dot-active-size, 6rpx);
  border-radius: var(--nutui-indicator-border-radius, var(--nutui-radius-xxs, 2rpx));
  background: var(--nutui-indicator-color, var(--nutui-color-primary, #ff0f23));
  opacity: 1;
}
.nut-indicator-fixed-width .nut-indicator-dot {
  width: 12rpx;
  border-radius: var(--nutui-indicator-border-radius, var(--nutui-radius-xxs, 2rpx));
}
.nut-indicator-fixed-width .nut-indicator-dot-active {
  width: 6rpx;
}
.nut-indicator-vertical.nut-indicator-fixed-width {
  -webkit-justify-content: flex-start;
  -ms-flex-pack: start;
  justify-content: flex-start;
  height: 21rpx;
  width: auto;
}
.nut-indicator-vertical.nut-indicator-fixed-width .nut-indicator-dot {
  width: 3rpx;
  height: 12rpx;
  border-radius: var(--nutui-indicator-border-radius, var(--nutui-radius-xxs, 2rpx));
}
.nut-indicator-vertical.nut-indicator-fixed-width .nut-indicator-dot-active,
.nut-indicator-vertical.nut-indicator-fixed-width.nut-indicator-fixed-width.nut-indicator-white .nut-indicator-dot-active {
  height: 6rpx;
}
.nut-indicator-line {
  width: var(--nutui-indicator-dot-active-size, 6rpx);
  margin: 0;
  border-radius: var(--nutui-indicator-border-radius, var(--nutui-radius-xxs, 2rpx));
  background-color: transparent;
}
.nut-indicator-line-active {
  -webkit-transition: -webkit-transform 0.3s ease-in-out;
  transition: -webkit-transform 0.3s ease-in-out;
  transition:
    transform 0.3s ease-in-out,
    -webkit-transform 0.3s ease-in-out;
  transition: transform 0.3s ease-in-out;
  background: var(--nutui-indicator-color, var(--nutui-color-primary, #ff0f23));
}
.nut-indicator-track {
  position: relative;
}
.nut-indicator-track::after {
  display: block;
  content: ' ';
  position: absolute;
  width: 100%;
  height: 100%;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  border-radius: var(--nutui-indicator-border-radius, var(--nutui-radius-xxs, 2rpx));
  background-color: var(--nutui-color-border-disabled, #c2c4cc);
  opacity: 0.4;
}
.nut-indicator-white .nut-indicator-dot,
.nut-indicator-white .nut-indicator-line {
  position: relative;
  -webkit-box-sizing: content-box;
  box-sizing: content-box;
  background: rgba(255, 255, 255, 0.4);
  opacity: 1;
}
.nut-indicator-white .nut-indicator-line {
  opacity: 0;
}
.nut-indicator-white .nut-indicator-line-active {
  opacity: 1;
  background: #fff;
}
.nut-indicator-white .nut-indicator-dot-active {
  background: #fff;
}
.nut-indicator-track.nut-indicator-white::after {
  border: 1rpx solid rgba(0, 0, 0, 0.06);
  background: rgba(255, 255, 255, 0.4);
}
.nut-indicator-vertical {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
}
.nut-indicator-vertical .nut-indicator-dot {
  margin: 0;
  margin-top: var(--nutui-indicator-dot-margin, var(--nutui-spacing-xxs, 4rpx));
}
.nut-indicator-vertical .nut-indicator-dot-0 {
  margin-top: 0;
}
.nut-indicator-vertical .nut-indicator-dot-active,
.nut-indicator-vertical.nut-indicator-track .nut-indicator-line {
  width: var(--nutui-indicator-dot-size, 3rpx);
  height: var(--nutui-indicator-dot-active-size, 6rpx);
}
[dir='rtl'] .nut-indicator-dot-0,
.nut-rtl .nut-indicator-dot-0 {
  margin-right: var(--nutui-indicator-dot-margin, var(--nutui-spacing-xxs, 4rpx));
  margin-left: 0;
}
.nut-imagepreview {
  width: 100%;
  height: 100%;
}
.nut-imagepreview-swiper {
  height: 100%;
  width: 100vw;
  background-color: transparent;
}
.nut-imagepreview-index {
  position: fixed;
  z-index: 2002;
  top: 50rpx;
  text-align: center;
  left: 0;
  right: 0;
  background: transparent;
  color: #fff;
}
.nut-imagepreview-index .arrow {
  position: absolute;
  left: 15rpx;
  -webkit-transform: rotate(180deg);
  -ms-transform: rotate(180deg);
  transform: rotate(180deg);
}
.nut-imagepreview-close {
  position: fixed;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  z-index: 2002;
  background: transparent;
  color: #fff;
}
.nut-imagepreview-close .nut-icon {
  color: #fff;
}
.nut-imagepreview-close.top-right {
  top: 50rpx;
  right: 20rpx;
}
.nut-imagepreview-close.top-left {
  top: 50rpx;
  left: 20rpx;
}
.nut-imagepreview-close.bottom {
  bottom: 50rpx;
  left: 0;
  right: 0;
  text-align: center;
}
.nut-imagepreview-pop {
  max-width: 100% !important;
  background: transparent !important;
}
.nut-imagepreview-pop {
  width: 100%;
  height: 100%;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
}
.nut-imagepreview-swiper .nut-imagepreview-swiper-item,
.nut-imagepreview-swiper .nut-swiper-item {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  height: 100%;
}
.nut-imagepreview-swiper .nut-imagepreview-swiper-item .nut-image,
.nut-imagepreview-swiper .nut-imagepreview-swiper-item .nut-video,
.nut-imagepreview-swiper .nut-swiper-item .nut-image,
.nut-imagepreview-swiper .nut-swiper-item .nut-video {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
}
.nut-imagepreview-swiper .nut-imagepreview-swiper-item .nut-image-preview-box,
.nut-imagepreview-swiper .nut-swiper-item .nut-image-preview-box {
  width: 100%;
}
.nut-imagepreview-swiper .nut-imagepreview-swiper-item .nut-video .h5-video,
.nut-imagepreview-swiper .nut-swiper-item .nut-video .h5-video {
  -o-object-fit: contain;
  object-fit: contain;
}
[dir='rtl'] .nut-imagepreview-index .arrow,
.nut-rtl .nut-imagepreview-index .arrow {
  left: auto;
  right: 15rpx;
  -webkit-transform: rotate(-180deg);
  -ms-transform: rotate(-180deg);
  transform: rotate(-180deg);
}
[dir='rtl'] .nut-imagepreview-close.top-right,
.nut-rtl .nut-imagepreview-close.top-right {
  right: auto;
  left: 20rpx;
}
[dir='rtl'] .nut-imagepreview-close.top-left,
.nut-rtl .nut-imagepreview-close.top-left {
  left: auto;
  right: 20rpx;
}
.nut-hoverbutton-item-container {
  width: var(--nutui-hoverbutton-item-size, 40rpx);
  height: var(--nutui-hoverbutton-item-size, 40rpx);
  border-radius: var(--nutui-hoverbutton-item-size, 40rpx);
  border: 1rpx solid var(--nutui-hoverbutton-item-border-color, rgba(0, 0, 0, 0.12));
  background-color: var(--nutui-hoverbutton-item-background, var(--nutui-white-12));
}
.nut-hoverbutton-item-container:active,
.nut-hoverbutton-item-container-active {
  background-color: var(--nutui-hoverbutton-item-background-active, rgba(247, 248, 252, 0.9));
}
.nut-hoverbutton-item-container-harmony {
  margin-bottom: var(--nutui-hoverbutton-spacing, var(--nutui-spacing-base, 8rpx));
}
.nut-hoverbutton-item-container-harmony:last-child {
  margin-bottom: 0;
}
.nut-hoverbutton-item-container-icontext {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
}
.nut-hoverbutton-item-container-icontext .nut-icon {
  display: block;
  width: 14rpx;
  height: 14rpx;
  font-size: 14rpx;
}
.nut-hoverbutton-item-icon {
  width: 20rpx;
  height: 20rpx;
  margin: 9rpx;
  color: var(--nutui-hoverbutton-item-icon-color, var(--nutui-color-title, #1a1a1a));
  fill: var(--nutui-hoverbutton-item-icon-color, var(--nutui-color-title, #1a1a1a));
}
.nut-hoverbutton-item-icon .nut-icon {
  display: block;
  width: 20rpx;
  height: 20rpx;
  font-size: 20rpx;
}
.nut-hoverbutton-item-container:active .nut-hoverbutton-item-icon {
  color: var(--nutui-hoverbutton-item-icon-color-active, var(--nutui-color-title, #1a1a1a));
  fill: var(--nutui-hoverbutton-item-icon-color-active, var(--nutui-color-title, #1a1a1a));
}
.nut-hoverbutton-item-text-icon {
  width: 14rpx;
  height: 5rpx;
}
.nut-hoverbutton-item-text {
  font-size: 10rpx;
  margin-top: 5rpx;
  line-height: 9rpx;
}
.nut-hoverbutton {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  gap: var(--nutui-hoverbutton-spacing, var(--nutui-spacing-base, 8rpx));
}
.nut-hoverbutton-container {
  position: fixed;
  right: var(--nutui-hoverbutton-position-right, var(--nutui-spacing-base, 8rpx));
  bottom: var(--nutui-hoverbutton-position-bottom, 60rpx);
  z-index: 10;
}
[dir='rtl'] .nut-hoverbutton-container,
.nut-hoverbutton-container-rtl {
  right: auto;
  left: var(--nutui-hoverbutton-position-right, var(--nutui-spacing-base, 8rpx));
}
.nut-image {
  display: block;
  position: relative;
}
.nut-image-default {
  display: block;
  width: 100%;
  height: 100%;
}
.nut-image.nut-image-round {
  border-radius: 50%;
  overflow: hidden;
}
.nut-image-basic {
  width: 100%;
  height: 100%;
}
.nut-image-loading,
.nut-image-error {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  background: var(--nutui-color-background, #f2f3f5);
  background-size: 100% 100%;
}
[dir='rtl'] .nut-image .nut-img-loading,
.nut-rtl .nut-image .nut-img-loading,
[dir='rtl'] .nut-image .nut-img-error,
.nut-rtl .nut-image .nut-img-error {
  left: auto;
  right: 0;
}
.nut-grid-item {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  position: relative;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  color: var(--nutui-grid-item-text-color, var(--nutui-color-title, #1a1a1a));
  overflow: hidden;
}
.nut-grid-item-text {
  color: var(--nutui-grid-item-text-color, var(--nutui-color-title, #1a1a1a));
  font-size: var(--nutui-grid-item-text-font-size, var(--nutui-font-size-s, 12rpx));
  word-break: break-all;
  margin: var(--nutui-grid-item-text-margin, 8rpx) 0 0 0;
}
.nut-grid-item-text-reverse {
  margin: 0 0 var(--nutui-grid-item-text-margin, 8rpx) 0;
}
.nut-grid-item-text-horizontal {
  margin: 0 0 0 var(--nutui-grid-item-text-margin, 8rpx);
}
.nut-grid-item-text-horizontal-reverse {
  margin: 0 var(--nutui-grid-item-text-margin, 8rpx) 0 0;
}
.nut-grid-item-content {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  -webkit-flex: 1;
  -ms-flex: 1;
  flex: 1;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  width: 100%;
  padding: var(--nutui-grid-item-content-padding, 16rpx 8rpx);
  background: var(--nutui-grid-item-content-bg-color, var(--nutui-gray-1));
  border: 0 solid var(--nutui-grid-border-color, var(--nutui-color-border, rgba(0, 0, 0, 0.06)));
}
.nut-grid-item-content-border {
  border-right-width: var(--nutui-grid-border-width, 0rpx);
  border-bottom-width: var(--nutui-grid-border-width, 0rpx);
}
.nut-grid-item-content-surround {
  border-top-width: var(--nutui-grid-border-width, 0rpx);
  border-left-width: var(--nutui-grid-border-width, 0rpx);
  border-radius: var(--nutui-grid-item-border-radius, var(--nutui-radius-l, 8rpx));
}
.nut-grid-item-content-center {
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
}
.nut-grid-item-content-square {
  margin-top: -100%;
}
.nut-grid-item-content-reverse {
  -webkit-flex-direction: column-reverse;
  -ms-flex-direction: column-reverse;
  flex-direction: column-reverse;
}
.nut-grid-item-content-horizontal {
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
}
.nut-grid-item-content-horizontal-reverse {
  -webkit-flex-direction: row-reverse;
  -ms-flex-direction: row-reverse;
  flex-direction: row-reverse;
}
.nut-grid-item-content-clickable {
  cursor: pointer;
}
.nut-grid-item-content-clickable::before {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  background-color: var(--nutui-color-mask, rgba(0, 0, 0, 0.7));
  border: inherit;
  border-color: var(--nutui-color-mask, rgba(0, 0, 0, 0.7));
  border-radius: inherit;
  -webkit-transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
  opacity: 0;
  content: ' ';
}
.nut-grid-item-content-clickable:active::before {
  opacity: 0.1;
}
[dir='rtl'] .nut-grid-item-content-border,
.nut-rtl .nut-grid-item-content-border {
  border-right-width: 0;
  border-left-width: 1rpx;
}
[dir='rtl'] .nut-grid-item-content-surround,
.nut-rtl .nut-grid-item-content-surround {
  border-left-width: 0;
  border-right-width: 1rpx;
}
[dir='rtl'] .nut-grid-item-content-horizontal .nut-grid-item-text,
.nut-rtl .nut-grid-item-content-horizontal .nut-grid-item-text {
  margin: 0 var(--nutui-grid-item-text-margin, 8rpx) 0 0;
}
[dir='rtl'] .nut-grid-item-content-horizontal.nut-grid-item-content-reverse .nut-grid-item-text,
.nut-rtl .nut-grid-item-content-horizontal.nut-grid-item-content-reverse .nut-grid-item-text {
  margin: 0 0 0 var(--nutui-grid-item-text-margin, 8rpx);
}
[dir='rtl'] .nut-grid-item-content-clickable::before,
.nut-rtl .nut-grid-item-content-clickable::before {
  left: auto;
  right: 50%;
  -webkit-transform: translate(50%, -50%);
  -ms-transform: translate(50%, -50%);
  transform: translate(50%, -50%);
}
.nut-grid {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  -webkit-align-items: stretch;
  -ms-flex-align: stretch;
  align-items: stretch;
  -webkit-flex-wrap: wrap;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
  border: 0 solid var(--nutui-grid-border-color, var(--nutui-color-border, rgba(0, 0, 0, 0.06)));
}
.nut-grid-border {
  border-top-width: var(--nutui-grid-border-width, 0rpx);
  border-left-width: var(--nutui-grid-border-width, 0rpx);
}
[dir='rtl'] .nut-grid-border,
.nut-rtl .nut-grid-border {
  border-left-width: 0;
  border-right-width: 1rpx;
}
.nut-form-item {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  line-height: inherit;
}
.nut-form-item-disabled {
  opacity: 0.4;
  pointer-events: none;
}
.nut-form-item-label {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  font-size: var(--nutui-form-item-label-font-size, var(--nutui-font-size-s, 12rpx));
  font-weight: 400;
  width: var(--nutui-form-item-label-width, 90rpx);
  margin-right: var(--nutui-form-item-label-margin-right, 10rpx);
  -webkit-flex: 0 0 auto;
  -ms-flex: 0 0 auto;
  flex: 0 0 auto;
  word-wrap: break-word;
  text-align: var(--nutui-form-item-label-text-align, left);
  line-height: inherit;
}
.nut-form-item-label-left-required {
  color: var(--nutui-form-item-required-color, var(--nutui-color-primary, #ff0f23));
  margin-right: var(--nutui-form-item-required-margin-right, 4rpx);
  position: absolute;
  left: -10rpx;
}
.nut-form-item-label-right-required {
  color: var(--nutui-form-item-required-color, var(--nutui-color-primary, #ff0f23));
  margin-left: var(--nutui-form-item-required-margin-right, 4rpx);
  position: absolute;
  right: -10rpx;
}
.nut-form-item .nut-form-item-labeltxt {
  position: relative;
  font-size: var(--nutui-form-item-label-font-size, var(--nutui-font-size-s, 12rpx));
}
.nut-form-item-body {
  -webkit-flex: 1;
  -ms-flex: 1;
  flex: 1;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
}
.nut-form-item-body-slots {
  text-align: var(--nutui-form-item-body-slots-text-align, left);
}
.nut-form-item-body-slots .nut-input {
  padding: 0;
  border: 0;
}
.nut-form-item-body-slots .nut-input-container {
  height: auto;
}
.nut-form-item-body-slots .nut-input-text {
  font-size: var(--nutui-form-item-body-font-size, var(--nutui-font-size-base, 14rpx));
  text-align: var(--nutui-form-item-body-input-text-align, left);
  color: var(--nutui-color-title, #1a1a1a);
  width: 100%;
  outline: 0 none;
  border: 0;
  text-decoration: none;
  background: transparent;
}
.nut-form-item-body-slots .nut-range-container {
  min-height: 24rpx;
}
.nut-form-item-body-slots .nut-textarea {
  padding: 0;
}
.nut-form-item-body-slots .nut-textarea .nut-textarea-textarea {
  font: inherit;
  text-align: var(--nutui-form-item-body-input-text-align, left);
}
.nut-form-item-body-tips {
  text-align: var(--nutui-form-item-tip-text-align, left);
  font-size: var(--nutui-form-item-tip-font-size, var(--nutui-font-size-xs, 11rpx));
  color: var(--nutui-form-item-error-message-color, var(--nutui-color-primary, #ff0f23));
}
[dir='rtl'] .nut-form-item-label,
.nut-rtl .nut-form-item-label {
  text-align: right;
  margin-right: 0;
  margin-left: var(--nutui-form-item-label-margin-right, 10rpx);
}
[dir='rtl'] .nut-form-item-label .required::before,
.nut-rtl .nut-form-item-label .required::before {
  margin-right: 0;
  margin-left: var(--nutui-form-item-required-margin-right, 4rpx);
}
[dir='rtl'] .nut-form-item-body-slots,
.nut-rtl .nut-form-item-body-slots {
  text-align: right;
}
[dir='rtl'] .nut-form-item-body-slots .nut-icon-ArrowRight,
[dir='rtl'] .nut-form-item-body-slots .nut-icon-ArrowLeft,
.nut-rtl .nut-form-item-body-slots .nut-icon-ArrowRight,
.nut-rtl .nut-form-item-body-slots .nut-icon-ArrowLeft {
  -webkit-transform: rotateY(180deg);
  transform: rotateY(180deg);
}
[dir='rtl'] .nut-form-item-body-slots .nut-input-text,
.nut-rtl .nut-form-item-body-slots .nut-input-text,
[dir='rtl'] .nut-form-item-body-slots .nut-textarea-textarea,
.nut-rtl .nut-form-item-body-slots .nut-textarea-textarea,
[dir='rtl'] .nut-form-item-tips,
.nut-rtl .nut-form-item-tips {
  text-align: right;
}
.nut-form-item-label-right {
  -webkit-justify-content: flex-end;
  -ms-flex-pack: end;
  justify-content: flex-end;
  padding-right: 24rpx;
  white-space: nowrap;
}
.nut-form-item-label-left {
  position: relative;
  padding-left: 12rpx;
  white-space: nowrap;
}
.nut-form-item-top {
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  -webkit-align-items: flex-start;
  -ms-flex-align: start;
  align-items: flex-start;
  white-space: nowrap;
}
.nut-form-item-label-top {
  display: block;
  padding-bottom: 4rpx;
  padding-right: 24rpx;
}
.nut-form-item-body-top {
  margin-left: 0;
  width: 100%;
}
[dir='rtl'] .form-layout-right .nut-form-item-label,
.nut-rtl .form-layout-right .nut-form-item-label {
  text-align: left;
  padding-right: 0;
  padding-left: 24rpx;
}
[dir='rtl'] .form-layout-left .nut-form-item-label,
.nut-rtl .form-layout-left .nut-form-item-label {
  text-align: right;
  padding-left: 0;
  padding-right: 12rpx;
}
[dir='rtl'] .form-layout-left .nut-form-item-label .required,
.nut-rtl .form-layout-left .nut-form-item-label .required {
  left: auto;
  right: 0.1em;
}
[dir='rtl'] .form-layout-top .nut-form-item-label,
.nut-rtl .form-layout-top .nut-form-item-label {
  padding-right: 0;
  padding-left: 24rpx;
}
[dir='rtl'] .form-layout-top .nut-form-item-body,
.nut-rtl .form-layout-top .nut-form-item-body {
  margin-left: 0;
  margin-right: 0;
}
.nut-fixednav {
  position: fixed;
  z-index: var(--nutui-fixednav-index, 900);
  display: inline-block;
  height: 50rpx;
}
.nut-fixednav.active .nut-fixednav-btn .nut-icon {
  -webkit-transform: rotate(180deg);
  -ms-transform: rotate(180deg);
  transform: rotate(180deg);
}
.nut-fixednav.active .nut-fixednav-list {
  -webkit-transform: translate(0) !important;
  -ms-transform: translate(0) !important;
  transform: translate(0) !important;
}
.nut-fixednav.active.nut-fixednav-left .nut-icon {
  -webkit-transform: rotate(0);
  -ms-transform: rotate(0);
  transform: rotate(0);
}
.nut-fixednav-btn {
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  position: absolute;
  z-index: var(--nutui-fixednav-index, 900);
  width: 70rpx;
  height: 100%;
  background: var(--nutui-fixednav-button-background, var(--nutui-color-primary, #ff0f23));
  -webkit-box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
  box-shadow: 0 2rpx 4rpx #0003;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
}
.nut-fixednav-btn .text {
  width: 24rpx;
  line-height: 13rpx;
  font-size: var(--nutui-font-size-s, 12rpx);
  color: #fff;
  -webkit-flex-shrink: 0;
  -ms-flex-negative: 0;
  flex-shrink: 0;
}
.nut-fixednav-btn .nut-icon {
  -webkit-transition: all 0.3s;
  transition: all 0.3s;
}
.nut-fixednav-list {
  position: absolute;
  -webkit-transition: all 0.5s;
  transition: all 0.5s;
  z-index: var(--nutui-fixednav-index, 900);
  -webkit-flex-shrink: 0;
  -ms-flex-negative: 0;
  flex-shrink: 0;
  height: 100%;
  background: var(--nutui-fixednav-background-color, #ffffff);
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-justify-content: space-between;
  -ms-flex-pack: justify;
  justify-content: space-between;
  -webkit-box-shadow: 2rpx 2rpx 8rpx rgba(0, 0, 0, 0.2);
  box-shadow: 2rpx 2rpx 8rpx #0003;
}
.nut-fixednav-list-item {
  position: relative;
  -webkit-flex: 1;
  -ms-flex: 1;
  flex: 1;
  height: 100%;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  min-width: 50rpx;
  -webkit-flex-shrink: 0;
  -ms-flex-negative: 0;
  flex-shrink: 0;
  color: var(--nutui-fixednav-color, #1a1a1a);
}
.nut-fixednav-list-item .nut-fixednav-list-text {
  font-size: 10rpx;
}
.nut-fixednav-list-image {
  width: 20rpx;
  height: 20rpx;
  margin-bottom: 2rpx;
}
.nut-fixednav-right {
  right: 0;
}
.nut-fixednav-right .nut-fixednav-btn {
  right: 0;
  border-radius: 45rpx 0 0 45rpx;
}
.nut-fixednav-right .nut-fixednav-btn .nut-icon {
  margin-right: 5rpx;
  -webkit-transform: rotate(0);
  -ms-transform: rotate(0);
  transform: rotate(0);
}
.nut-fixednav-right .nut-fixednav-list {
  right: 0;
  -webkit-transform: translate(100%);
  -ms-transform: translate(100%);
  transform: translate(100%);
  border-radius: 25rpx 0 0 25rpx;
  padding-left: 20rpx;
  padding-right: 80rpx;
}
.nut-fixednav-left {
  left: 0;
}
.nut-fixednav-left .nut-fixednav-btn {
  -webkit-flex-direction: row-reverse;
  -ms-flex-direction: row-reverse;
  flex-direction: row-reverse;
  left: 0;
  border-radius: 0 45rpx 45rpx 0;
}
.nut-fixednav-left .nut-fixednav-btn .nut-icon {
  margin-left: 5rpx;
  -webkit-transform: rotate(180deg);
  -ms-transform: rotate(180deg);
  transform: rotate(180deg);
}
.nut-fixednav-left .nut-fixednav-list {
  -webkit-transform: translate(-100%);
  -ms-transform: translate(-100%);
  transform: translate(-100%);
  left: 0;
  border-radius: 0 25rpx 25rpx 0;
  padding-left: 80rpx;
  padding-right: 20rpx;
}
[dir='rtl'] .nut-fixednav-right,
.nut-rtl .nut-fixednav-right {
  right: auto;
  left: 0;
}
[dir='rtl'] .nut-fixednav.active .nut-icon,
.nut-rtl .nut-fixednav.active .nut-icon {
  -webkit-transform: rotate(0);
  -ms-transform: rotate(0);
  transform: rotate(0);
}
[dir='rtl'] .nut-fixednav.active.nut-fixednav-left .nut-icon,
.nut-rtl .nut-fixednav.active.nut-fixednav-left .nut-icon {
  -webkit-transform: rotate(-180deg);
  -ms-transform: rotate(-180deg);
  transform: rotate(-180deg);
}
[dir='rtl'] .nut-fixednav-btn,
.nut-rtl .nut-fixednav-btn {
  right: auto;
  left: 0;
  border-radius: 0 45rpx 45rpx 0;
}
[dir='rtl'] .nut-fixednav-btn .nut-icon,
.nut-rtl .nut-fixednav-btn .nut-icon {
  margin-right: 0;
  margin-left: 5rpx;
  -webkit-transform: rotate(180deg);
  -ms-transform: rotate(180deg);
  transform: rotate(180deg);
}
[dir='rtl'] .nut-fixednav-list,
.nut-rtl .nut-fixednav-list {
  right: auto;
  left: 0;
  -webkit-transform: translate(-100%);
  -ms-transform: translate(-100%);
  transform: translate(-100%);
  border-radius: 0 25rpx 25rpx 0;
  -webkit-box-shadow: -2rpx 2rpx 8rpx rgba(0, 0, 0, 0.2);
  box-shadow: -2rpx 2rpx 8rpx #0003;
  padding-right: 20rpx;
  padding-left: 80rpx;
}
[dir='rtl'] .nut-fixednav-list-item .b,
.nut-rtl .nut-fixednav-list-item .b {
  right: auto;
  left: 0;
}
[dir='rtl'] .nut-fixednav-left,
.nut-rtl .nut-fixednav-left {
  left: auto;
  right: 0;
}
[dir='rtl'] .nut-fixednav-left .nut-fixednav-btn,
.nut-rtl .nut-fixednav-left .nut-fixednav-btn {
  left: auto;
  right: 0;
  border-radius: 45rpx 0 0 45rpx;
}
[dir='rtl'] .nut-fixednav-left .nut-fixednav-btn .nut-icon,
.nut-rtl .nut-fixednav-left .nut-fixednav-btn .nut-icon {
  -webkit-transform: rotate(0);
  -ms-transform: rotate(0);
  transform: rotate(0);
  margin-right: 5rpx;
  margin-left: 0;
}
[dir='rtl'] .nut-fixednav-left .nut-fixednav-list,
.nut-rtl .nut-fixednav-left .nut-fixednav-list {
  -webkit-transform: translate(100%);
  -ms-transform: translate(100%);
  transform: translate(100%);
  right: auto;
  left: auto;
  border-radius: 25rpx 0 0 25rpx;
  padding-right: 80rpx;
  padding-left: 20rpx;
}
.nut-drag .nut-fixednav {
  position: relative;
}
.nut-ellipsis {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
}
.nut-ellipsis .nut-ellipsis-text {
  cursor: pointer;
  color: var(--nutui-ellipsis-expand-collapse-color, var(--nutui-color-info, #0073ff));
  display: inline-block;
}
.nut-ellipsis .nut-ellipsis-wordbreak {
  word-break: break-all;
}
.nut-ellipsis-copy {
  position: absolute;
  top: -999999rpx;
}
.nut-ellipsis-width {
  width: -webkit-fit-content;
  width: -moz-fit-content;
  width: fit-content;
}
.nut-elevator {
  position: relative;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  width: 100%;
}
.nut-elevator-list {
  position: relative;
  top: 0;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  width: 100%;
  overflow: hidden;
}
.nut-elevator-list-inner {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  min-height: 100%;
  width: 100%;
  background-color: var(--nutui-elevator-list-bg-color, #ffffff);
  overflow: auto;
}
.nut-elevator-list-item {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
}
.nut-elevator-list-item-sublist {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
}
.nut-elevator-list-item-code {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  height: var(--nutui-elevator-list-item-code-height, 34rpx);
  font-size: var(--nutui-elevator-list-item-code-font-size, var(--nutui-font-size-base, 14rpx));
  color: var(--nutui-elevator-list-item-code-color, var(--nutui-color-text-help, #888b94));
  font-weight: var(--nutui-elevator-list-item-code-font-weight, var(--nutui-font-weight-bold, 600));
}
.nut-elevator-list-item-name {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  height: var(--nutui-elevator-list-item-name-height, 34rpx);
  font-size: var(--nutui-elevator-list-font-size, var(--nutui-font-size-base, 14rpx));
  color: var(--nutui-elevator-list-color, var(--nutui-color-title, #1a1a1a));
}
.nut-elevator-list-item-name-highcolor {
  color: var(--nutui-color-primary, #ff0f23);
  font-weight: 600;
}
.nut-elevator-list-fixed {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  width: 100%;
  padding: var(--nutui-elevator-list-item-padding, 0 36rpx 0 20rpx);
  height: var(--nutui-elevator-list-item-code-height, 34rpx);
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  -webkit-box-shadow: var(--nutui-elevator-list-fixed-box-shadow, 0 0 10rpx #eee);
  box-shadow: var(--nutui-elevator-list-fixed-box-shadow, 0 0 10rpx #eee);
  background-color: var(--nutui-elevator-list-fixed-bg-color, #ffffff);
}
.nut-elevator-list-fixed-title {
  font-size: var(--nutui-elevator-list-item-code-font-size, var(--nutui-font-size-base, 14rpx));
  color: var(--nutui-elevator-list-fixed-color, var(--nutui-color-primary, #ff0f23));
  font-weight: var(--nutui-elevator-list-item-code-font-weight, var(--nutui-font-weight-bold, 600));
}
.nut-elevator-code-current {
  position: absolute;
  right: var(--nutui-elevator-list-item-code-current-right, 60rpx);
  top: var(--nutui-elevator-list-item-code-current-top, 50%);
  -webkit-transform: var(--nutui-elevator-bars-transform, translateY(-50%));
  -ms-transform: var(--nutui-elevator-bars-transform, translateY(-50%));
  transform: var(--nutui-elevator-bars-transform, translateY(-50%));
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  width: var(--nutui-elevator-list-item-code-current-width, 45rpx);
  height: var(--nutui-elevator-list-item-code-current-height, 45rpx);
  border-radius: var(--nutui-elevator-list-item-code-current-border-radius, 50%);
  background: var(--nutui-elevator-list-item-code-current-bg-color, var(--nutui-color-text-disabled, #c2c4cc));
  -webkit-box-shadow: 0 3rpx 3rpx 1rpx #f0f0f0;
  box-shadow: 0 3rpx 3rpx 1rpx #f0f0f0;
  color: var(--nutui-elevator-list-item-code-current-color, #ffffff);
}
.nut-elevator-bars {
  position: absolute;
  right: var(--nutui-elevator-bars-right, 16rpx);
  top: var(--nutui-elevator-bars-top, 50%);
  -webkit-transform: var(--nutui-elevator-bars-transform, translateY(-50%));
  -ms-transform: var(--nutui-elevator-bars-transform, translateY(-50%));
  transform: var(--nutui-elevator-bars-transform, translateY(-50%));
  z-index: var(--nutui-elevator-bars-z-index, 1);
}
.nut-elevator-bars-inner {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
}
.nut-elevator-bars-inner-item {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  display: -webkit-inline-flex;
  display: -ms-inline-flexbox;
  display: inline-flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  height: 16rpx;
  width: 16rpx;
  border-radius: 50%;
  margin: 1rpx 0;
  color: var(--nutui-elevator-bars-color, var(--nutui-color-text-help, #888b94));
  font-size: var(--nutui-elevator-bars-font-size, var(--nutui-font-size-xxs, 10rpx));
  cursor: pointer;
}
.nut-elevator-bars-inner-item-active {
  font-weight: var(--nutui-font-weight-bold, 600);
  color: var(--nutui-elevator-bars-active-color, #ffffff);
  background: -webkit-gradient(linear, left top, right top, from(#ff475d), to(#ff0f23));
  background: -webkit-linear-gradient(left, #ff475d, #ff0f23);
  background: linear-gradient(to right, #ff475d, #ff0f23);
  background: #ff0f23;
}
.nut-elevator-horizontal .nut-elevator-list-item-code {
  width: var(--nutui-elevator-list-item-code-width, 34rpx);
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
}
.nut-elevator-vertical .nut-elevator-list-item {
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
}
.nut-elevator-vertical .nut-elevator-list-item-code {
  border-bottom: var(--nutui-elevator-list-item-code-border-bottom, 1rpx solid var(--nutui-color-border, rgba(0, 0, 0, 0.06)));
}
.nut-elevator-vertical .nut-elevator-list-item-name,
.nut-elevator-vertical .nut-elevator-list-item-code {
  padding: var(--nutui-elevator-list-item-padding, 0 36rpx 0 20rpx);
}
[dir='rtl'] .nut-elevator-list-fixed,
.nut-rtl .nut-elevator-list-fixed {
  left: auto;
  right: 0;
}
[dir='rtl'] .nut-elevator-code-current,
.nut-rtl .nut-elevator-code-current {
  right: auto;
  left: var(--nutui-elevator-list-item-code-current-right, 60rpx);
}
[dir='rtl'] .nut-elevator-bars,
.nut-rtl .nut-elevator-bars {
  right: auto;
  left: var(--nutui-elevator-bars-right, 16rpx);
}
.nut-drag {
  z-index: 9997 !important;
}
.nut-drag {
  position: fixed;
  width: 0;
  height: 0;
  -ms-touch-action: none;
  touch-action: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  font-size: 0;
}
.nut-drag-inner {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  display: -webkit-inline-flex;
  display: -ms-inline-flexbox;
  display: inline-flex;
  width: -webkit-fit-content;
  width: -moz-fit-content;
  width: fit-content;
  height: -webkit-fit-content;
  height: -moz-fit-content;
  height: fit-content;
  -ms-touch-action: none;
  touch-action: none;
}
.nut-empty {
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  width: 100%;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  padding: var(--nutui-empty-padding, 32rpx 40rpx);
  background-color: var(--nutui-empty-background-color, var(--nutui-color-background-overlay, #ffffff));
}
.nut-empty-base {
  width: var(--nutui-empty-image-size, 160rpx);
  height: var(--nutui-empty-image-size, 160rpx);
}
.nut-empty-base .h5-img,
.nut-empty-base image {
  width: 100%;
  height: 100%;
}
.nut-empty-small {
  width: var(--nutui-empty-image-small-size, 120rpx);
  height: var(--nutui-empty-image-small-size, 120rpx);
}
.nut-empty-small .h5-img,
.nut-empty-small image {
  width: 100%;
  height: 100%;
}
.nut-empty-title {
  margin-top: var(--nutui-empty-title-margin-top, 0rpx);
  font-weight: var(--nutui-font-weight-bold, 600);
  margin-bottom: var(--nutui-empty-title-margin-bottom, 12rpx);
  color: var(--nutui-color-title, #1a1a1a);
  font-size: var(--nutui-font-size-l, 15rpx);
  line-height: var(--nutui-empty-title-line-height, var(--nutui-font-size-l, 15rpx));
}
.nut-empty-description {
  color: var(--nutui-color-text, #505259);
  font-size: var(--nutui-font-size-s, 12rpx);
  line-height: var(--nutui-empty-description-line-height, 1);
}
.nut-empty-actions-base {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  margin-top: 24rpx;
}
.nut-empty-actions-small {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  margin-top: 16rpx;
}
.nut-empty-action {
  margin-right: 6rpx;
  margin-left: 6rpx;
}
.nut-divider {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  font-size: var(--nutui-divider-text-font-size, var(--nutui-font-size-base, 14rpx));
  color: var(--nutui-divider-text-color, var(--nutui-color-text, #505259));
  margin: var(--nutui-divider-margin, 16rpx 0);
  width: 100%;
  border: 0 solid var(--nutui-divider-border-color, var(--nutui-color-border, rgba(0, 0, 0, 0.06)));
}
.nut-divider-before,
.nut-divider-after {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  border-style: solid;
  border-color: var(--nutui-divider-border-color, var(--nutui-color-border, rgba(0, 0, 0, 0.06)));
  border-width: var(--nutui-divider-line-height, 1rpx) 0 0;
  height: var(--nutui-divider-line-height, 1rpx);
  -webkit-flex: 1;
  -ms-flex: 1;
  flex: 1;
}
.nut-divider-center-before,
.nut-divider-left-before,
.nut-divider-right-before {
  margin-right: var(--nutui-divider-spacing, 8rpx);
}
.nut-divider-center-after,
.nut-divider-left-after,
.nut-divider-right-after {
  margin-left: var(--nutui-divider-spacing, 8rpx);
}
.nut-divider-left-before,
.nut-divider-right-after {
  width: var(--nutui-divider-side-width, 10%);
  -webkit-flex: none;
  -ms-flex: none;
  flex: none;
}
.nut-divider-vertical {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  display: -webkit-inline-flex;
  display: -ms-inline-flexbox;
  display: inline-flex;
  width: 0rpx;
  height: var(--nutui-divider-vertical-height, 12rpx);
  border-left: 1rpx solid var(--nutui-divider-border-color, var(--nutui-color-border, rgba(0, 0, 0, 0.06)));
  margin: var(--nutui-divider-vertical-margin, 0 8rpx);
  vertical-align: middle;
}
.nut-divider-rtl-before {
  margin-right: 0;
  margin-left: var(--nutui-divider-spacing, 8rpx);
}
.nut-divider-rtl-after {
  margin-left: 0;
  margin-right: var(--nutui-divider-spacing, 8rpx);
}
.nut-datepickerview {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  width: 100%;
}
.nut-dialog {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  width: var(--nutui-dialog-width, 295rpx);
  min-width: var(--nutui-dialog-min-width, 240rpx);
  max-height: 67%;
  min-height: var(--nutui-dialog-min-height, 124rpx);
  padding: var(--nutui-dialog-padding, 24rpx);
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}
.nut-dialog-outer {
  position: fixed;
  max-height: 100%;
  background-color: var(--nutui-dialog-background, var(--nutui-color-background-overlay, #ffffff));
  -webkit-transition: -webkit-transform 0.2s;
  transition: -webkit-transform 0.2s;
  transition: transform 0.2s;
  transition:
    transform 0.2s,
    -webkit-transform 0.2s;
  -webkit-overflow-scrolling: touch;
  top: 50%;
  left: 50%;
  -webkit-transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
  border-radius: var(--nutui-dialog-border-radius, var(--nutui-radius-xl, 12rpx));
  -webkit-animation-duration: 0.3s;
  animation-duration: 0.3s;
}
.nut-dialog-close {
  position: absolute !important;
}
.nut-dialog-close {
  z-index: 1;
  cursor: pointer;
  width: var(--nutui-dialog-close-width, 16rpx);
  height: var(--nutui-dialog-close-height, 16rpx);
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  color: var(--nutui-dialog-close-color, #ffffff);
}
.nut-dialog-close .nut-icon {
  font-size: var(--nutui-dialog-close-width, 16rpx);
  width: var(--nutui-dialog-close-width, 16rpx);
  height: var(--nutui-dialog-close-height, 16rpx);
}
.nut-dialog-close-top-right {
  top: var(--nutui-dialog-close-top, 16rpx);
  right: var(--nutui-dialog-close-right, 16rpx);
}
.nut-dialog-close-top-left {
  top: var(--nutui-dialog-close-top, 16rpx);
  left: var(--nutui-dialog-close-left, 16rpx);
}
.nut-dialog-close-bottom {
  bottom: -64rpx;
  width: var(--nutui-dialog-bottom-close-icon-size, 24rpx);
  height: var(--nutui-dialog-bottom-close-icon-size, 24rpx);
  left: 50%;
  -webkit-transform: translate(-50%);
  -ms-transform: translate(-50%);
  transform: translate(-50%);
}
.nut-dialog-close-bottom .nut-icon {
  color: var(--nutui-color-text-disabled, #c2c4cc);
  background-color: var(--nutui-color-mask-part, rgba(0, 0, 0, 0.4));
  border-radius: 50%;
  width: var(--nutui-dialog-bottom-close-icon-size, 24rpx);
  height: var(--nutui-dialog-bottom-close-icon-size, 24rpx);
}
.nut-dialog-close:active {
  opacity: 0.7;
}
.nut-dialog-header {
  display: block;
  text-align: center;
  font-size: var(--nutui-dialog-header-font-size, var(--nutui-font-size-xl, 18rpx));
  font-weight: var(--nutui-dialog-header-font-weight, var(--nutui-font-weight-bold, 600));
  color: var(--nutui-color-title, #1a1a1a);
  margin-bottom: var(--nutui-dialog-title-margin-bottom, 8rpx);
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.nut-dialog-content {
  width: 100%;
  margin: var(--nutui-dialog-content-margin, 0 0 20rpx 0);
  max-height: var(--nutui-dialog-content-max-height, 268rpx);
  line-height: var(--nutui-dialog-content-line-height, 20rpx);
  font-size: var(--nutui-font-size-base, 14rpx);
  color: var(--nutui-color-title, #1a1a1a);
  word-wrap: break-word;
  word-break: break-all;
  white-space: pre-wrap;
  text-align: var(--nutui-dialog-content-text-align, left);
  overflow-y: auto;
}
.nut-dialog-footer {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  width: 100%;
  -webkit-justify-content: space-around;
  -ms-flex-pack: distribute;
  justify-content: space-around;
}
.nut-dialog-footer.vertical {
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
}
.nut-dialog-footer.vertical .nut-button {
  min-width: 100%;
}
.nut-dialog-footer.vertical .nut-dialog-footer-cancel {
  margin: 0;
  color: var(--nutui-color-text, #505259);
  font-size: var(--nutui-font-size-base, 14rpx);
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  margin-top: var(--nutui-dialog-vertical-footer-ok-margin-top, 16rpx);
  background: transparent;
}
.nut-dialog-footer .nut-button {
  min-width: var(--nutui-dialog-footer-button-min-width, 117rpx);
  border-radius: var(--nutui-dialog-footer-button-border, 6rpx);
  padding: var(--nutui-button-large-padding, 0 12rpx);
}
.nut-dialog-footer-cancel.nut-dialog-footer-cancel {
  margin-right: var(--nutui-dialog-footer-cancel-margin-right, 12rpx);
  background: var(--nutui-dialog-footer-cancel-bg, var(--nutui-color-background-sunken, #f7f8fc));
  color: var(--nutui-button-default-color, var(--nutui-color-title, #1a1a1a));
  border-color: var(--nutui-button-default-border-color, transparent);
}
.nut-dialog-footer-cancel.nut-dialog-footer-cancel .nut-button-children {
  color: var(--nutui-button-default-color, var(--nutui-color-title, #1a1a1a));
}
.nut-dialog-footer-ok-container {
  position: relative;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  width: 100%;
  -webkit-justify-content: space-around;
  -ms-flex-pack: distribute;
  justify-content: space-around;
}
.nut-dialog-footer-ok-container .nut-dialog-footer-ok-badge {
  position: absolute;
  right: 0;
  top: var(--nutui-dialog-footer-badge-top, -8rpx);
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  height: var(--nutui-dialog-footer-badge-height, 14rpx);
  padding: var(--nutui-dialog-footer-badge-padding, 0 3rpx);
  background: var(--nutui-dialog-footer-badge-bg-ok, var(--nutui-color-danger-light, #ffebef));
  border-radius: var(--nutui-dialog-footer-badge-border-radius, 2rpx 2rpx 0rpx 2rpx);
  font-size: var(--nutui-dialog-footer-badge-fontsize, 10rpx);
  color: var(--nutui-dialog-footer-badge-color-ok, var(--nutui-color-primary, #ff0f23));
}
.nut-dialog-footer-ok {
  max-width: var(--nutui-dialog-footer-ok-max-width, 128rpx);
  font-weight: var(--nutui-font-weight-medium, 500);
}
.nut-dialog-footer-ok .nut-button-children {
  font-weight: var(--nutui-font-weight-medium, 500);
}
.nut-dialog-footer-block.nut-button {
  min-width: 100%;
}
.nut-dialog-footer-cancel-container {
  position: relative;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  width: 100%;
  -webkit-justify-content: space-around;
  -ms-flex-pack: distribute;
  justify-content: space-around;
}
.nut-dialog-footer-cancel-container .nut-dialog-footer-cancel-badge {
  position: absolute;
  right: var(--nutui-dialog-footer-cancel-margin-right, 12rpx);
  top: var(--nutui-dialog-footer-badge-top, -8rpx);
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  height: var(--nutui-dialog-footer-badge-height, 14rpx);
  padding: var(--nutui-dialog-footer-badge-padding, 0 3rpx);
  background: var(--nutui-dialog-footer-badge-bg-cancel, var(--nutui-color-danger-light, #ffebef));
  border-radius: var(--nutui-dialog-footer-badge-border-radius, 2rpx 2rpx 0rpx 2rpx);
  font-size: var(--nutui-dialog-footer-badge-fontsize, 10rpx);
  color: var(--nutui-dialog-footer-badge-color-cancel, var(--nutui-color-primary, #ff0f23));
}
[dir='rtl'] .nut-dialog-outer,
.nut-rtl .nut-dialog-outer {
  left: auto;
  right: 50%;
  -webkit-transform: translate(50%, -50%);
  -ms-transform: translate(50%, -50%);
  transform: translate(50%, -50%);
}
[dir='rtl'] .nut-dialog-close-top-right,
.nut-rtl .nut-dialog-close-top-right {
  right: auto;
  left: var(--nutui-dialog-close-right, 16rpx);
}
[dir='rtl'] .nut-dialog-close-top-left,
.nut-rtl .nut-dialog-close-top-left {
  left: auto;
  right: var(--nutui-dialog-close-left, 16rpx);
}
[dir='rtl'] .nut-dialog-footer-cancel.nut-dialog-footer-cancel,
.nut-rtl .nut-dialog-footer-cancel.nut-dialog-footer-cancel {
  margin-right: 0;
  margin-left: var(--nutui-dialog-footer-cancel-margin-right, 12rpx);
}
[dir='rtl'] .nut-dialog-content,
.nut-rtl .nut-dialog-content {
  text-align: var(--nutui-dialog-content-text-align, right);
}
.nut-countup-list {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  display: -webkit-inline-flex;
  display: -ms-inline-flexbox;
  display: inline-flex;
  height: var(--nutui-countup-height, 32rpx);
  overflow: hidden;
  direction: ltr;
}
.nut-countup-listitem {
  height: var(--nutui-countup-height, 32rpx);
  overflow: hidden;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.nut-countup-listitem-number {
  margin: 0 var(--nutui-countup-lr-margin, 0);
  border-radius: var(--nutui-countup-border-radius, 4rpx);
  color: var(--nutui-countup-color, var(--nutui-color-title, #1a1a1a));
  background-color: var(--nutui-countup-bg-color, inherit);
}
.nut-countup-separator {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  height: 80%;
  -webkit-align-items: flex-end;
  -ms-flex-align: end;
  align-items: flex-end;
  color: var(--nutui-countup-separator-color, var(--nutui-color-title, #1a1a1a));
  font-size: var(--nutui-countup-base-size, 18rpx);
  font-weight: var(--nutui-font-weight-bold, 600);
}
.nut-countup-number {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  width: var(--nutui-countup-width, auto);
  -webkit-transition: -webkit-transform 1s ease-in-out;
  transition: -webkit-transform 1s ease-in-out;
  transition:
    transform 1s ease-in-out,
    -webkit-transform 1s ease-in-out;
  transition: transform 1s ease-in-out;
  -webkit-transform: translate(0);
  -ms-transform: translate(0);
  transform: translate(0);
}
.nut-countup-number-text {
  height: var(--nutui-countup-height, 32rpx);
  line-height: var(--nutui-countup-height, 32rpx);
  color: var(--nutui-countup-color, var(--nutui-color-title, #1a1a1a));
  font-size: var(--nutui-countup-base-size, 18rpx);
  font-weight: var(--nutui-font-weight-bold, 600);
}
.nut-countdown {
  display: var(--nutui-countdown-display, flex);
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  color: var(--nutui-countdown-color, var(--nutui-color-primary, #ff0f23));
  font-size: var(--nutui-countdown-font-size, var(--nutui-font-size-xs, 11rpx));
}
.nut-countdown-number-primary,
.nut-countdown-number,
.nut-countdown-number-text,
.nut-countdown-unit {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  height: var(--nutui-countdown-height, 16rpx);
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  font-weight: var(--nutui-countdown-font-weight, var(--nutui-font-weight, 400));
  font-size: var(--nutui-countdown-font-size, var(--nutui-font-size-xs, 11rpx));
  line-height: calc(var(--nutui-countdown-font-size, var(--nutui-font-size-xs, 11rpx)) + 2rpx);
  font-family: JDZH-Regular;
}
.nut-countdown-number,
.nut-countdown-number-primary {
  position: relative;
  min-width: var(--nutui-countdown-width, 16rpx);
  padding: var(--nutui-countdown-number-padding, 0 0);
  border-radius: var(--nutui-countdown-number-border-radius, var(--nutui-radius-xxs, 2rpx));
  margin: var(--nutui-countdown-number-margin, 0 1rpx);
  text-align: center;
}
.nut-countdown-number::after,
.nut-countdown-number-primary::after {
  content: '';
  position: absolute;
  inset: -50%;
  -webkit-transform: scale(0.5);
  -ms-transform: scale(0.5);
  transform: scale(0.5);
  border-radius: calc(var(--nutui-countdown-number-border-radius, var(--nutui-radius-xxs, 2rpx)) * 2);
}
.nut-countdown-number {
  background-color: var(--nutui-countdown-number-background-color, var(--nutui-color-background-overlay, #ffffff));
  color: var(--nutui-countdown-number-color, var(--nutui-color-primary, #ff0f23));
}
.nut-countdown-number::after {
  border: 1rpx solid var(--nutui-countdown-number-border-color, var(--nutui-color-primary-specialdisabled, #ffadbe));
}
.nut-countdown-number-primary {
  background-color: var(--nutui-countdown-number-primary-background-color, var(--nutui-color-primary, #ff0f23));
  color: var(--nutui-countdown-number-primary-color, #ffffff);
}
.nut-countdown-number-primary::after {
  border: 1rpx solid var(--nutui-countdown-number-primary-border-color, var(--nutui-color-primary, #ff0f23));
}
.nut-countdown-number-text {
  border: 0;
  background-color: transparent;
  color: var(--nutui-countdown-number-color, var(--nutui-color-primary, #ff0f23));
}
.nut-countdown-unit {
  color: var(--nutui-countdown-color, var(--nutui-color-primary, #ff0f23));
}
.nut-col {
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  word-break: break-all;
  margin-bottom: var(--nutui-col-default-margin-bottom, 15rpx);
}
[dir='rtl'] .nut-col,
.nut-rtl .nut-col {
  float: right;
}
[dir='rtl'] .nut-col.nut-col-gutter:last-child,
.nut-rtl .nut-col.nut-col-gutter:last-child {
  padding-right: 0 !important;
  padding-left: 0 !important;
}
[dir='rtl'] .nut-col.nut-col-gutter:first-child,
.nut-rtl .nut-col.nut-col-gutter:first-child {
  padding-left: 0 !important;
  padding-right: 0 !important;
}
.nut-col-offset-1 {
  margin-left: 4.166666666%;
}
[dir='rtl'] .nut-col-offset-1,
.nut-rtl .nut-col-offset-1 {
  margin-left: 0;
  margin-right: 4.166666666%;
}
.nut-col-1 {
  width: 4.166666666%;
}
.nut-col-offset-2 {
  margin-left: 8.333333332%;
}
[dir='rtl'] .nut-col-offset-2,
.nut-rtl .nut-col-offset-2 {
  margin-left: 0;
  margin-right: 8.333333332%;
}
.nut-col-2 {
  width: 8.333333332%;
}
.nut-col-offset-3 {
  margin-left: 12.499999998%;
}
[dir='rtl'] .nut-col-offset-3,
.nut-rtl .nut-col-offset-3 {
  margin-left: 0;
  margin-right: 12.499999998%;
}
.nut-col-3 {
  width: 12.499999998%;
}
.nut-col-offset-4 {
  margin-left: 16.666666664%;
}
[dir='rtl'] .nut-col-offset-4,
.nut-rtl .nut-col-offset-4 {
  margin-left: 0;
  margin-right: 16.666666664%;
}
.nut-col-4 {
  width: 16.666666664%;
}
.nut-col-offset-5 {
  margin-left: 20.83333333%;
}
[dir='rtl'] .nut-col-offset-5,
.nut-rtl .nut-col-offset-5 {
  margin-left: 0;
  margin-right: 20.83333333%;
}
.nut-col-5 {
  width: 20.83333333%;
}
.nut-col-offset-6 {
  margin-left: 24.999999996%;
}
[dir='rtl'] .nut-col-offset-6,
.nut-rtl .nut-col-offset-6 {
  margin-left: 0;
  margin-right: 24.999999996%;
}
.nut-col-6 {
  width: 24.999999996%;
}
.nut-col-offset-7 {
  margin-left: 29.166666662%;
}
[dir='rtl'] .nut-col-offset-7,
.nut-rtl .nut-col-offset-7 {
  margin-left: 0;
  margin-right: 29.166666662%;
}
.nut-col-7 {
  width: 29.166666662%;
}
.nut-col-offset-8 {
  margin-left: 33.333333328%;
}
[dir='rtl'] .nut-col-offset-8,
.nut-rtl .nut-col-offset-8 {
  margin-left: 0;
  margin-right: 33.333333328%;
}
.nut-col-8 {
  width: 33.333333328%;
}
.nut-col-offset-9 {
  margin-left: 37.499999994%;
}
[dir='rtl'] .nut-col-offset-9,
.nut-rtl .nut-col-offset-9 {
  margin-left: 0;
  margin-right: 37.499999994%;
}
.nut-col-9 {
  width: 37.499999994%;
}
.nut-col-offset-10 {
  margin-left: 41.66666666%;
}
[dir='rtl'] .nut-col-offset-10,
.nut-rtl .nut-col-offset-10 {
  margin-left: 0;
  margin-right: 41.66666666%;
}
.nut-col-10 {
  width: 41.66666666%;
}
.nut-col-offset-11 {
  margin-left: 45.833333326%;
}
[dir='rtl'] .nut-col-offset-11,
.nut-rtl .nut-col-offset-11 {
  margin-left: 0;
  margin-right: 45.833333326%;
}
.nut-col-11 {
  width: 45.833333326%;
}
.nut-col-offset-12 {
  margin-left: 49.999999992%;
}
[dir='rtl'] .nut-col-offset-12,
.nut-rtl .nut-col-offset-12 {
  margin-left: 0;
  margin-right: 49.999999992%;
}
.nut-col-12 {
  width: 49.999999992%;
}
.nut-col-offset-13 {
  margin-left: 54.166666658%;
}
[dir='rtl'] .nut-col-offset-13,
.nut-rtl .nut-col-offset-13 {
  margin-left: 0;
  margin-right: 54.166666658%;
}
.nut-col-13 {
  width: 54.166666658%;
}
.nut-col-offset-14 {
  margin-left: 58.333333324%;
}
[dir='rtl'] .nut-col-offset-14,
.nut-rtl .nut-col-offset-14 {
  margin-left: 0;
  margin-right: 58.333333324%;
}
.nut-col-14 {
  width: 58.333333324%;
}
.nut-col-offset-15 {
  margin-left: 62.49999999%;
}
[dir='rtl'] .nut-col-offset-15,
.nut-rtl .nut-col-offset-15 {
  margin-left: 0;
  margin-right: 62.49999999%;
}
.nut-col-15 {
  width: 62.49999999%;
}
.nut-col-offset-16 {
  margin-left: 66.666666656%;
}
[dir='rtl'] .nut-col-offset-16,
.nut-rtl .nut-col-offset-16 {
  margin-left: 0;
  margin-right: 66.666666656%;
}
.nut-col-16 {
  width: 66.666666656%;
}
.nut-col-offset-17 {
  margin-left: 70.833333322%;
}
[dir='rtl'] .nut-col-offset-17,
.nut-rtl .nut-col-offset-17 {
  margin-left: 0;
  margin-right: 70.833333322%;
}
.nut-col-17 {
  width: 70.833333322%;
}
.nut-col-offset-18 {
  margin-left: 74.999999988%;
}
[dir='rtl'] .nut-col-offset-18,
.nut-rtl .nut-col-offset-18 {
  margin-left: 0;
  margin-right: 74.999999988%;
}
.nut-col-18 {
  width: 74.999999988%;
}
.nut-col-offset-19 {
  margin-left: 79.166666654%;
}
[dir='rtl'] .nut-col-offset-19,
.nut-rtl .nut-col-offset-19 {
  margin-left: 0;
  margin-right: 79.166666654%;
}
.nut-col-19 {
  width: 79.166666654%;
}
.nut-col-offset-20 {
  margin-left: 83.33333332%;
}
[dir='rtl'] .nut-col-offset-20,
.nut-rtl .nut-col-offset-20 {
  margin-left: 0;
  margin-right: 83.33333332%;
}
.nut-col-20 {
  width: 83.33333332%;
}
.nut-col-offset-21 {
  margin-left: 87.499999986%;
}
[dir='rtl'] .nut-col-offset-21,
.nut-rtl .nut-col-offset-21 {
  margin-left: 0;
  margin-right: 87.499999986%;
}
.nut-col-21 {
  width: 87.499999986%;
}
.nut-col-offset-22 {
  margin-left: 91.666666652%;
}
[dir='rtl'] .nut-col-offset-22,
.nut-rtl .nut-col-offset-22 {
  margin-left: 0;
  margin-right: 91.666666652%;
}
.nut-col-22 {
  width: 91.666666652%;
}
.nut-col-offset-23 {
  margin-left: 95.833333318%;
}
[dir='rtl'] .nut-col-offset-23,
.nut-rtl .nut-col-offset-23 {
  margin-left: 0;
  margin-right: 95.833333318%;
}
.nut-col-23 {
  width: 95.833333318%;
}
.nut-col-offset-24 {
  margin-left: 99.999999984%;
}
[dir='rtl'] .nut-col-offset-24,
.nut-rtl .nut-col-offset-24 {
  margin-left: 0;
  margin-right: 99.999999984%;
}
.nut-col-24 {
  width: 99.999999984%;
}
.nut-circleprogress {
  position: relative;
}
.nut-circleprogress-hover {
  stroke: var(--nutui-circleprogress-primary-color, var(--nutui-color-primary, #ff0f23));
  -webkit-transition:
    stroke-dasharray 0.2s ease-in-out 0s,
    stroke 0.2s ease 0s;
  transition:
    stroke-dasharray 0.2s ease-in-out 0s,
    stroke 0.2s ease 0s;
}
.nut-circleprogress-path {
  stroke: var(--nutui-circleprogress-path-color, var(--nutui-color-background, #f2f3f5));
}
.nut-circleprogress-text {
  position: absolute;
  top: 50%;
  left: 0;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  width: 100%;
  -webkit-transform: translateY(-50%);
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
  text-align: center;
  color: var(--nutui-circleprogress-text-color, var(--nutui-color-title, #1a1a1a));
  font-size: var(--nutui-circleprogress-text-size, var(--nutui-font-size-l, 15rpx));
}
[dir='rtl'] .nut-circleprogress-text,
.nut-rtl .nut-circleprogress-text {
  left: auto;
  right: 0;
}
.nut-collapse-item {
  position: relative;
}
.nut-collapse-item::after {
  position: absolute;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  content: ' ';
  pointer-events: none;
  right: 16rpx;
  left: 16rpx;
  bottom: 0;
  border-bottom: var(--nutui-collapse-item-border-bottom, none);
  -webkit-transform: scaleY(0.5);
  -ms-transform: scaleY(0.5);
  transform: scaleY(0.5);
}
.nut-collapse-item:last-child::after {
  display: none;
}
.nut-collapse-item-header {
  position: relative;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  width: 100%;
  overflow: hidden;
  padding: var(--nutui-collapse-item-padding, 13rpx 26rpx);
  font-size: var(--nutui-collapse-item-font-size, var(--nutui-font-size-base, 14rpx));
  line-height: var(--nutui-collapse-item-line-height, 24rpx);
  background-color: var(--nutui-color-background-overlay, #ffffff);
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}
.nut-collapse-item-header::after {
  position: absolute;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  content: ' ';
  pointer-events: none;
  right: 16rpx;
  left: 16rpx;
  bottom: 0;
  border-bottom: var(--nutui-collapse-item-header-border-bottom, 1rpx solid var(--nutui-color-border, rgba(0, 0, 0, 0.06)));
  -webkit-transform: scale(1);
  -ms-transform: scale(1);
  transform: scale(1);
  -webkit-transform: scaleY(0.5);
  -ms-transform: scaleY(0.5);
  transform: scaleY(0.5);
}
.nut-collapse-item-title {
  color: var(--nutui-collapse-item-color, var(--nutui-color-title, #1a1a1a));
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
}
.nut-collapse-item-extra {
  -webkit-flex: 1;
  -ms-flex: 1;
  flex: 1;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-justify-content: flex-end;
  -ms-flex-pack: end;
  justify-content: flex-end;
  padding: 0 20rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--nutui-collapse-item-extra-color, var(--nutui-color-text, #505259));
}
.nut-collapse-item-icon-box {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  width: 24rpx;
  position: relative;
  color: var(--nutui-color-text, #505259);
}
.nut-collapse-item-icon {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  position: absolute;
  top: 50%;
  left: 5rpx;
  -webkit-transform: translateY(-50%);
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
  -webkit-transform-origin: center;
  -ms-transform-origin: center;
  transform-origin: center;
  -webkit-transition: -webkit-transform 0.3s;
  transition: -webkit-transform 0.3s;
  transition:
    transform 0.3s,
    -webkit-transform 0.3s;
  transition: transform 0.3s;
}
.nut-collapse-item-header-disabled,
.nut-collapse-item-header-disabled .nut-collapse-item-title,
.nut-collapse-item-header-disabled .nut-collapse-item-icon {
  color: var(--nutui-collapse-item-disabled-color, var(--nutui-color-text-disabled, #c2c4cc));
}
.nut-collapse-item-content-wrapper {
  width: 100%;
  position: relative;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  overflow: hidden;
}
.nut-collapse-item-content-wrapper-tran {
  -webkit-transition: all 0.3s linear;
  transition: all 0.3s linear;
}
.nut-collapse-item-content {
  display: block;
  position: absolute;
  height: auto;
  width: 100%;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  color: var(--nutui-collapse-wrapper-content-color, var(--nutui-color-text, #505259));
  font-size: var(--nutui-collapse-wrapper-content-font-size, var(--nutui-font-size-base, 14rpx));
  line-height: var(--nutui-collapse-wrapper-content-line-height, 1.5);
  background-color: var(--nutui-collapse-wrapper-content-background-color, var(--nutui-color-background-overlay, #ffffff));
}
.nut-collapse-item-content-text {
  color: var(--nutui-collapse-wrapper-content-color, var(--nutui-color-text, #505259));
  padding: var(--nutui-collapse-wrapper-content-padding, 12rpx 26rpx);
}
[dir='rtl'] .nut-collapse-item-icon,
.nut-rtl .nut-collapse-item-icon {
  left: auto;
  right: 5rpx;
}
.nut-checkboxgroup .nut-checkbox-button {
  background-color: var(--nutui-color-background, #f2f3f5);
}
.nut-checkboxgroup-vertical {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
}
.nut-checkboxgroup-vertical .nut-checkbox {
  margin-bottom: 5rpx;
}
.nut-checkboxgroup-vertical .nut-checkbox.nut-checkbox-reverse {
  width: 100%;
  -webkit-justify-content: space-between;
  -ms-flex-pack: justify;
  justify-content: space-between;
}
.nut-checkboxgroup-vertical .nut-checkbox-button-active {
  border: var(--nutui-radio-button-active-border, 1rpx solid var(--nutui-color-primary, #ff0f23));
  background-color: var(--nutui-color-primary-light-pressed, #ffebf1);
}
.nut-checkboxgroup-horizontal {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  -webkit-flex-wrap: wrap;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
}
.nut-checkboxgroup-horizontal .nut-checkbox {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  display: -webkit-inline-flex;
  display: -ms-inline-flexbox;
  display: inline-flex;
  -webkit-flex: 1;
  -ms-flex: 1;
  flex: 1;
  margin-right: 20rpx;
}
.nut-checkboxgroup-horizontal .nut-checkbox-button-active {
  border: var(--nutui-radio-button-active-border, 1rpx solid var(--nutui-color-primary, #ff0f23));
  background-color: var(--nutui-color-primary-light-pressed, #ffebf1);
}
.nut-checkboxgroup-list {
  -webkit-flex-grow: 1;
  -ms-flex-positive: 1;
  flex-grow: 1;
  border-bottom: var(--nutui-checkbox-list-item-border, 1rpx solid var(--nutui-color-border, rgba(0, 0, 0, 0.06)));
  border-top: var(--nutui-checkbox-list-item-border, 1rpx solid var(--nutui-color-border, rgba(0, 0, 0, 0.06)));
  padding: var(--nutui-checkbox-list-padding, 0 0 0 12rpx);
  background: var(--nutui-checkbox-list-background-color, #ffffff);
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}
.nut-checkboxgroup-list .nut-checkbox {
  margin-bottom: 5rpx;
}
.nut-checkboxgroup-list .nut-checkbox.nut-checkbox-reverse {
  width: auto;
  -webkit-flex-grow: 1;
  -ms-flex-positive: 1;
  flex-grow: 1;
  -webkit-justify-content: space-between;
  -ms-flex-pack: justify;
  justify-content: space-between;
}
.nut-checkboxgroup-list .nut-checkbox-list-item:first-child {
  border-top: none;
}
[dir='rtl'] .nut-checkboxgroup .nut-checkbox-label,
.nut-rtl .nut-checkboxgroup .nut-checkbox-label,
[dir='rtl'] .nut-checkboxgroup-vertical .nut-checkbox-label,
.nut-rtl .nut-checkboxgroup-vertical .nut-checkbox-label {
  margin-right: 5rpx;
}
[dir='rtl'] .nut-checkboxgroup-horizontal .nut-checkbox,
.nut-rtl .nut-checkboxgroup-horizontal .nut-checkbox {
  margin-right: 0;
  margin-left: 20rpx;
}
.nut-checkbox {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
}
.nut-checkbox-icon {
  color: var(--nutui-color-text-disabled, #c2c4cc);
  font-size: var(--nutui-checkbox-icon-font-size, var(--nutui-font-size-icon, 16rpx));
  -webkit-flex-shrink: 0;
  -ms-flex-negative: 0;
  flex-shrink: 0;
}
.nut-checkbox-icon-wrap {
  font-size: 0rpx;
  line-height: 0rpx;
  border-radius: 50%;
  -webkit-box-shadow: 0 2rpx 4rpx rgba(255, 15, 35, 0.2);
  box-shadow: 0 2rpx 4rpx #ff0f2333;
}
.nut-checkbox-icon-checked {
  color: var(--nutui-color-primary, #ff0f23);
  background-color: #fff;
  -webkit-transition-duration: 0.3s;
  transition-duration: 0.3s;
  -webkit-transition-property: color, border-color, background-color;
  transition-property: color, border-color, background-color;
  border-radius: 50%;
}
.nut-checkbox-icon-checked.nut-checkbox-icon-disabled {
  color: var(--nutui-color-primary-disabled-special, #ffadbe);
}
.nut-checkbox-label {
  margin-left: var(--nutui-checkbox-label-margin-left, var(--nutui-spacing-xxs, 4rpx));
  font-size: var(--nutui-checkbox-label-font-size, var(--nutui-font-size-s, 12rpx));
  color: var(--nutui-checkbox-label-color, var(--nutui-color-title, #1a1a1a));
  -webkit-flex-shrink: 0;
  -ms-flex-negative: 0;
  flex-shrink: 0;
}
.nut-checkbox-label-disabled {
  color: var(--nutui-color-text-disabled, #c2c4cc);
}
.nut-checkbox-icon-indeterminate {
  color: var(--nutui-color-primary, #ff0f23);
  background-color: #fff;
  -webkit-box-shadow: 0 2rpx 4rpx rgba(255, 15, 35, 0.2);
  box-shadow: 0 2rpx 4rpx #ff0f2333;
  border-radius: 50%;
}
.nut-checkbox-icon-indeterminate.nut-checkbox-icon-disabled {
  color: var(--nutui-color-primary-disabled-special, #ffadbe);
}
.nut-checkbox-icon-disabled {
  color: var(--nutui-color-text-disabled, #c2c4cc);
  background-color: #fff;
  border-radius: 50%;
  -webkit-box-shadow: none;
  box-shadow: none;
}
.nut-checkbox-reverse {
  -webkit-flex-direction: row-reverse;
  -ms-flex-direction: row-reverse;
  flex-direction: row-reverse;
}
.nut-checkbox-reverse .nut-checkbox-label {
  margin-right: var(--nutui-checkbox-label-margin-left, var(--nutui-spacing-xxs, 4rpx));
  margin-left: 0;
}
.nut-checkbox-button {
  position: relative;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  display: -webkit-inline-flex;
  display: -ms-inline-flexbox;
  display: inline-flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  min-height: 32rpx;
  padding: var(--nutui-checkbox-button-padding, 5rpx 18rpx);
  font-size: var(--nutui-checkbox-button-font-size, var(--nutui-font-size-s, 12rpx));
  background: var(--nutui-color-background, #f2f3f5);
  border-radius: var(--nutui-checkbox-button-border-radius, 15rpx);
  color: var(--nutui-checkbox-label-color, var(--nutui-color-title, #1a1a1a));
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  border: 1rpx solid var(--nutui-color-background, #f2f3f5);
  overflow: hidden;
}
.nut-checkbox-button-active {
  background: var(--nutui-color-primary-light-pressed, #ffebf1);
  color: var(--nutui-color-primary, #ff0f23);
  border: var(--nutui-checkbox-button-active-border, 1rpx solid var(--nutui-color-primary, #ff0f23));
}
.nut-checkbox-button-disabled {
  color: var(--nutui-color-text-disabled, #c2c4cc);
  border: 1rpx solid var(--nutui-color-background, #f2f3f5);
}
.nut-checkbox-button-icon {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 0;
  height: 0;
  border-top: 10rpx solid transparent;
  border-left: 10rpx solid transparent;
  border-bottom: 10rpx solid var(--nutui-color-primary, #ff0f23);
  border-right: 10rpx solid var(--nutui-color-primary, #ff0f23);
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: flex-end;
  -ms-flex-align: end;
  align-items: flex-end;
  -webkit-justify-content: flex-end;
  -ms-flex-pack: end;
  justify-content: flex-end;
}
.nut-checkbox-button .nut-checkbox-button-icon-checked {
  width: 12rpx;
  height: 12rpx;
  position: absolute;
  color: #fff;
  right: 0;
  bottom: 0;
  -webkit-transform: translate(-1rpx, -2rpx);
  -ms-transform: translate(-1rpx, -2rpx);
  transform: translate(-1rpx, -2rpx);
}
.nut-checkbox-button .nut-icon {
  position: absolute;
  font-size: 12rpx;
  width: 12rpx;
  height: 12rpx;
}
.nut-checkbox-button .nut-icon::before {
  top: auto;
  bottom: -22rpx;
  margin-left: 6rpx;
}
.nut-checkbox .nut-checkbox-button-active.nut-checkbox-button-disabled {
  background: var(--nutui-color-text-disabled, #c2c4cc);
  color: #fff;
  border: 1rpx solid var(--nutui-color-text-disabled, #c2c4cc);
}
.nut-checkbox-list-item {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-justify-content: space-between;
  -ms-flex-pack: justify;
  justify-content: space-between;
  padding: var(--nutui-checkbox-list-item-padding, 12rpx 12rpx 12rpx 0);
  border-top: var(--nutui-checkbox-list-item-border, 1rpx solid var(--nutui-color-border, rgba(0, 0, 0, 0.06)));
}
.nut-checkbox-list-item .nut-checkbox-label,
.nut-checkbox-list-item .nut-icon {
  -webkit-flex: none;
  -ms-flex: none;
  flex: none;
}
[dir='rtl'] .nut-checkbox-label,
.nut-rtl .nut-checkbox-label {
  margin-left: 0;
  margin-right: var(--nutui-checkbox-label-margin-left, var(--nutui-spacing-xxs, 4rpx));
}
[dir='rtl'] .nut-checkbox-reverse .nut-checkbox-label,
.nut-rtl .nut-checkbox-reverse .nut-checkbox-label {
  margin-left: var(--nutui-checkbox-label-margin-left, var(--nutui-spacing-xxs, 4rpx));
  margin-right: 0;
}
[dir='rtl'] .nut-checkbox-button-icon,
.nut-rtl .nut-checkbox-button-icon {
  right: auto;
  left: 0;
  border-right: 10rpx solid transparent;
  border-left: 10rpx solid var(--nutui-color-primary, #ff0f23);
}
[dir='rtl'] .nut-checkbox-button-icon-checked,
.nut-rtl .nut-checkbox-button-icon-checked {
  left: auto;
  right: 50%;
  -webkit-transform: translate(3rpx, -3rpx);
  -ms-transform: translate(3rpx, -3rpx);
  transform: translate(3rpx, -3rpx);
}
[dir='rtl'] .nut-checkbox-button-icon .nut-icon::before,
.nut-rtl .nut-checkbox-button-icon .nut-icon::before {
  margin-left: 0;
  margin-right: 6rpx;
}
.nut-cell-group {
  display: block;
}
.nut-cell-group-title {
  display: inherit;
  padding: var(--nutui-cell-group-title-padding, 0 10rpx);
  color: var(--nutui-cell-group-title-color, var(--nutui-color-title, #1a1a1a));
  font-size: var(--nutui-cell-group-title-font-size, var(--nutui-font-size-base, 14rpx));
  line-height: var(--nutui-cell-group-title-line-height, 20rpx);
  margin-top: 30rpx;
  margin-bottom: 10rpx;
}
.nut-cell-group-description {
  display: inherit;
  padding: var(--nutui-cell-group-description-padding, 0 10rpx);
  color: var(--nutui-cell-group-description-color, var(--nutui-color-text, #505259));
  font-size: var(--nutui-cell-group-description-font-size, var(--nutui-font-size-s, 12rpx));
  line-height: var(--nutui-cell-group-description-line-height, 16rpx);
  margin-top: 10rpx;
  margin-bottom: 10rpx;
}
.nut-cell-group-wrap {
  border-radius: var(--nutui-cell-border-radius, 6rpx);
  overflow: hidden;
  background-color: var(--nutui-cell-group-background-color, var(--nutui-color-background-overlay, #ffffff));
  margin-bottom: var(--nutui-cell-group-wrap-margin, 10rpx);
}
.nut-cell {
  position: relative;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  width: 100%;
  line-height: var(--nutui-cell-line-height, 20rpx);
  padding: var(--nutui-cell-padding, 13rpx 16rpx);
  background-color: var(--nutui-cell-background-color, var(--nutui-color-background-overlay, #ffffff));
  border-radius: var(--nutui-cell-border-radius, 6rpx);
  -webkit-box-shadow: var(--nutui-cell-box-shadow, 0rpx 1rpx 7rpx 0rpx rgb(237, 238, 241));
  box-shadow: var(--nutui-cell-box-shadow, 0rpx 1rpx 7rpx 0rpx rgb(237, 238, 241));
  font-size: var(--nutui-cell-title-font-size, var(--nutui-font-size-base, 14rpx));
  color: var(--nutui-cell-title-color, var(--nutui-color-title, #1a1a1a));
  margin-bottom: 10rpx;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}
.nut-cell-group-item {
  border-radius: 0;
  -webkit-box-shadow: 0 0 transparent;
  box-shadow: 0 0 transparent;
  margin: 0;
}
.nut-cell-left {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  -webkit-align-items: flex-start;
  -ms-flex-align: start;
  align-items: flex-start;
  -webkit-flex: 1;
  -ms-flex: 1;
  flex: 1;
}
.nut-cell-title,
.nut-cell-description,
.nut-cell-extra {
  line-height: var(--nutui-cell-line-height, 20rpx);
}
.nut-cell-description {
  font-size: var(--nutui-cell-description-font-size, var(--nutui-font-size-s, 12rpx));
  color: var(--nutui-cell-description-color, var(--nutui-color-text, #505259));
}
.nut-cell-extra {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  -webkit-justify-content: flex-end;
  -ms-flex-pack: end;
  justify-content: flex-end;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-flex: 1;
  -ms-flex: 1;
  flex: 1;
  -webkit-flex-shrink: 0;
  -ms-flex-negative: 0;
  flex-shrink: 0;
  min-width: 0;
  word-break: break-all;
  font-size: var(--nutui-cell-extra-font-size, var(--nutui-font-size-base, 14rpx));
  color: var(--nutui-cell-extra-color, var(--nutui-color-text, #505259));
}
.nut-cell:active::before {
  opacity: 0.1;
}
.nut-cell-clickable {
  cursor: pointer;
}
.nut-cell-clickable::before {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  background-color: #000;
  border: inherit;
  border-color: #000;
  border-radius: inherit;
  -webkit-transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
  opacity: 0;
  content: ' ';
}
.nut-cell-divider {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  min-height: 1rpx;
  padding-left: var(--nutui-cell-divider-left, 16rpx);
  padding-right: var(--nutui-cell-divider-right, 16rpx);
}
.nut-cell-divider-inner {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  height: 1rpx;
  width: 100%;
  border-top: var(--nutui-cell-divider-border-bottom, 1rpx solid var(--nutui-color-border, rgba(0, 0, 0, 0.06)));
}
.nut-cell-divider-rtl {
  padding-left: var(--nutui-cell-divider-right, 16rpx);
  padding-right: var(--nutui-cell-divider-left, 16rpx);
}
.nut-cascader {
  width: 100%;
  font-size: var(--nutui-cascader-font-size, var(--nutui-font-size-base, 14rpx));
}
.nut-cascader .nut-tabs-titles {
  padding: var(--nutui-cascader-tabs-item-padding, 0 10rpx);
  background: var(--nutui-color-background-overlay, #ffffff);
}
.nut-cascader .nut-tabs-titles-item {
  -webkit-flex: initial;
  -ms-flex: initial;
  flex: initial;
  min-width: auto;
  width: auto;
  padding: var(--nutui-cascader-tabs-item-padding, 0 10rpx);
  white-space: nowrap;
}
.nut-cascader .nut-tabpane {
  padding: 0;
  background: var(--nutui-color-background-overlay, #ffffff);
}
.nut-cascader-pane {
  display: block;
  width: 100%;
  padding-top: var(--nutui-cascader-pane-paddingTop, 10rpx);
  height: var(--nutui-cascader-pane-height, 342rpx);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
.nut-cascader-item {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  padding: var(--nutui-cascader-item-padding, 10rpx 20rpx);
  margin: var(--nutui-cascader-item-margin, 0rpx);
  border-bottom: var(--nutui-cascader-item-border-bottom, 0rpx solid var(--nutui-color-border, rgba(0, 0, 0, 0.06)));
  font-size: var(--nutui-cascader-item-font-size, var(--nutui-font-size-base, 14rpx));
  color: var(--nutui-cascader-item-color, var(--nutui-color-title, #1a1a1a));
  cursor: pointer;
}
.nut-cascader-item.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.nut-cascader-item.active:not(.disabled) {
  color: var(--nutui-cascader-item-active-color, var(--nutui-color-primary, #ff0f23));
}
.nut-cascader-item.active .nut-cascader-item-icon-check {
  visibility: visible;
  color: inherit;
}
.nut-cascader-item-title {
  -webkit-flex: 1;
  -ms-flex: 1;
  flex: 1;
}
.nut-cascader .nut-icon-checklist {
  margin-left: var(--nutui-cascader-icon-checklist-marginLeft, 10rpx);
  visibility: hidden;
}
[dir='rtl'] .nut-cascader .nut-icon-checklist,
.nut-rtl .nut-cascader .nut-icon-checklist {
  margin-left: 0;
  margin-right: var(--nutui-cascader-icon-checklist-marginLeft, 10rpx);
}
.nut-card {
  width: 100%;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  background-color: inherit;
  border-radius: var(--nutui-card-border-radius, 4rpx);
}
.nut-card-left {
  width: 120rpx;
  height: 120rpx;
  -webkit-flex-shrink: 0;
  -ms-flex-negative: 0;
  flex-shrink: 0;
}
.nut-card-left > .h5-img {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: var(--nutui-card-border-radius, 4rpx);
}
.nut-card-right {
  -webkit-flex: 1;
  -ms-flex: 1;
  flex: 1;
  padding: 0 10rpx 8rpx;
}
.nut-card-right-title {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  word-break: break-all;
  line-height: 1.5;
  font-size: 14rpx;
  color: var(--nutui-color-title, #1a1a1a);
}
.nut-card-right-price {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  height: 18rpx;
  line-height: 18rpx;
  margin-top: 9rpx;
}
.nut-card-right-price-origin.nut-price {
  margin-left: 2rpx;
}
.nut-card-right-price-origin.nut-price .nut-price-symbol,
.nut-card-right-price-origin.nut-price .nut-price-integer,
.nut-card-right-price-origin.nut-price .nut-price-decimal {
  color: #d2a448;
}
.nut-card-right-other {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  padding: 5rpx 0 2rpx;
}
.nut-card-right-other .nut-tag {
  padding: 0 2rpx;
  margin-right: 5rpx;
  font-size: var(--nutui-font-size-xs, 11rpx);
}
.nut-card-right-shop {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-justify-content: space-between;
  -ms-flex-pack: justify;
  justify-content: space-between;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
}
.nut-card-right-shop-name {
  line-height: 1.5;
  color: var(--nutui-color-text, #505259);
  font-size: 12rpx;
  padding-top: 4rpx;
}
[dir='rtl'] .nut-card-right-price-origin.nut-price,
.nut-rtl .nut-card-right-price-origin.nut-price {
  margin-left: 0;
  margin-right: 2rpx;
}
[dir='rtl'] .nut-card-right-other .nut-tag,
.nut-rtl .nut-card-right-other .nut-tag {
  margin-right: 0;
  margin-left: 5rpx;
}
.nut-calendarcard {
  background: var(--nutui-color-background-overlay, #ffffff);
  border-radius: 12rpx;
  overflow: hidden;
  font-size: var(--nutui-calendar-base-font-size, var(--nutui-font-size-l, 15rpx));
  color: var(--nutui-color-title, #1a1a1a);
}
.nut-calendarcard-header {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: space-between;
  -ms-flex-pack: justify;
  justify-content: space-between;
  font-weight: 400;
}
.nut-calendarcard-header-left,
.nut-calendarcard-header-right {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  cursor: pointer;
  margin: 16rpx;
  line-height: 1;
}
.nut-calendarcard-header-left .left,
.nut-calendarcard-header-right .left {
  margin-left: 8rpx;
}
.nut-calendarcard-header-left .right,
.nut-calendarcard-header-right .right {
  margin-right: 8rpx;
}
.nut-calendarcard-days {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  -webkit-flex-wrap: wrap;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
}
.nut-calendarcard-day {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  position: relative;
  width: var(--nutui-calendar-day-width, 14.28%);
  height: 48rpx;
  cursor: pointer;
  margin-bottom: 4rpx;
  text-align: center;
}
.nut-calendarcard-day.header {
  cursor: auto;
}
.nut-calendarcard-day-top,
.nut-calendarcard-day-bottom {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  width: 100%;
  height: 12rpx;
  font-size: 12rpx;
  line-height: 12rpx;
}
.nut-calendarcard-day.weekend {
  color: var(--nutui-calendar-choose-color, var(--nutui-color-primary, #ff0f23));
}
.nut-calendarcard-day.active {
  background-color: var(--nutui-calendar-active-background-color, var(--nutui-color-primary, #ff0f23));
  border-radius: var(--nutui-calendar-day-active-border-radius, 4rpx);
}
.nut-calendarcard-day.active .nut-calendarcard-day-top,
.nut-calendarcard-day.active .nut-calendarcard-day-inner,
.nut-calendarcard-day.active .nut-calendarcard-day-bottom {
  color: #fff;
}
.nut-calendarcard-day.start,
.nut-calendarcard-day.end {
  background-color: var(--nutui-calendar-active-background-color, var(--nutui-color-primary, #ff0f23));
}
.nut-calendarcard-day.start .nut-calendarcard-day-top,
.nut-calendarcard-day.start .nut-calendarcard-day-inner,
.nut-calendarcard-day.start .nut-calendarcard-day-bottom,
.nut-calendarcard-day.end .nut-calendarcard-day-top,
.nut-calendarcard-day.end .nut-calendarcard-day-inner,
.nut-calendarcard-day.end .nut-calendarcard-day-bottom {
  color: #fff;
}
.nut-calendarcard-day.start {
  border-top-left-radius: var(--nutui-calendar-day-active-border-radius, 4rpx);
  border-bottom-left-radius: var(--nutui-calendar-day-active-border-radius, 4rpx);
}
.nut-calendarcard-day.end {
  border-top-right-radius: var(--nutui-calendar-day-active-border-radius, 4rpx);
  border-bottom-right-radius: var(--nutui-calendar-day-active-border-radius, 4rpx);
}
.nut-calendarcard-day.mid {
  background-color: var(--nutui-calendar-choose-background-color, var(--nutui-color-primary-light-pressed, #ffebf1));
}
.nut-calendarcard-day.mid .nut-calendarcard-day-top,
.nut-calendarcard-day.mid .nut-calendarcard-day-inner,
.nut-calendarcard-day.mid .nut-calendarcard-day-bottom {
  color: var(--nutui-calendar-choose-color, var(--nutui-color-primary, #ff0f23));
}
.nut-calendarcard-day .nut-calendar-day-info {
  color: #fff;
}
.nut-calendarcard-day.prev,
.nut-calendarcard-day.next,
.nut-calendarcard-day.disabled {
  cursor: not-allowed;
}
.nut-calendarcard-day.prev .nut-calendarcard-day-top,
.nut-calendarcard-day.prev .nut-calendarcard-day-inner,
.nut-calendarcard-day.prev .nut-calendarcard-day-bottom,
.nut-calendarcard-day.next .nut-calendarcard-day-top,
.nut-calendarcard-day.next .nut-calendarcard-day-inner,
.nut-calendarcard-day.next .nut-calendarcard-day-bottom,
.nut-calendarcard-day.disabled .nut-calendarcard-day-top,
.nut-calendarcard-day.disabled .nut-calendarcard-day-inner,
.nut-calendarcard-day.disabled .nut-calendarcard-day-bottom {
  color: var(--nutui-calendar-disable-color, var(--nutui-color-text-disabled, #c2c4cc));
}
[dir='rtl'] .nut-calendarcard-header-left .left,
[dir='rtl'] .nut-calendarcard-header-right .left,
.nut-rtl .nut-calendarcard-header-left .left,
.nut-rtl .nut-calendarcard-header-right .left {
  margin-left: 0;
  margin-right: 8rpx;
}
[dir='rtl'] .nut-calendarcard-header-left .right,
[dir='rtl'] .nut-calendarcard-header-right .right,
.nut-rtl .nut-calendarcard-header-left .right,
.nut-rtl .nut-calendarcard-header-right .right {
  margin-right: 0;
  margin-left: 8rpx;
}
[dir='rtl'] .nut-calendarcard-header-left .nut-icon-ArrowLeft,
[dir='rtl'] .nut-calendarcard-header-left .nut-icon-ArrowRight,
[dir='rtl'] .nut-calendarcard-header-left .h5-svg,
[dir='rtl'] .nut-calendarcard-header-right .nut-icon-ArrowLeft,
[dir='rtl'] .nut-calendarcard-header-right .nut-icon-ArrowRight,
[dir='rtl'] .nut-calendarcard-header-right .h5-svg,
.nut-rtl .nut-calendarcard-header-left .nut-icon-ArrowLeft,
.nut-rtl .nut-calendarcard-header-left .nut-icon-ArrowRight,
.nut-rtl .nut-calendarcard-header-left .h5-svg,
.nut-rtl .nut-calendarcard-header-right .nut-icon-ArrowLeft,
.nut-rtl .nut-calendarcard-header-right .nut-icon-ArrowRight,
.nut-rtl .nut-calendarcard-header-right .h5-svg {
  -webkit-transform: rotate(180deg);
  -ms-transform: rotate(180deg);
  transform: rotate(180deg);
}
[dir='rtl'] .nut-calendarcard-day.start,
[dir='rtl'] .nut-calendarcard-day.end,
.nut-rtl .nut-calendarcard-day.start,
.nut-rtl .nut-calendarcard-day.end {
  border-radius: 0;
}
[dir='rtl'] .nut-calendarcard-day.start,
.nut-rtl .nut-calendarcard-day.start {
  border-top-right-radius: var(--nutui-calendar-day-active-border-radius, 4rpx);
  border-bottom-right-radius: var(--nutui-calendar-day-active-border-radius, 4rpx);
}
[dir='rtl'] .nut-calendarcard-day.end,
.nut-rtl .nut-calendarcard-day.end {
  border-top-left-radius: var(--nutui-calendar-day-active-border-radius, 4rpx);
  border-bottom-left-radius: var(--nutui-calendar-day-active-border-radius, 4rpx);
}
.nut-calendar {
  position: relative;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  -webkit-flex: 1;
  -ms-flex: 1;
  flex: 1;
  font-size: var(--nutui-calendar-base-font-size, var(--nutui-font-size-l, 15rpx));
  background-color: var(--nutui-color-background-overlay, #ffffff);
  color: var(--nutui-color-title, #1a1a1a);
  overflow: hidden;
  height: 100%;
}
.nut-calendar.nut-calendar-title .nut-calendar-header .calendar-title {
  font-size: var(--nutui-calendar-base-font-size, var(--nutui-font-size-l, 15rpx));
}
.nut-calendar .nut-calendar-taro {
  height: 60vh;
}
.nut-calendar .popup-box {
  height: 100%;
}
.nut-calendar ::-webkit-scrollbar {
  display: none;
}
.nut-calendar-header {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  text-align: center;
}
.nut-calendar-header-buttons {
  height: var(--nutui-calendar-header-height, 24rpx);
}
.nut-calendar-title {
  color: var(--nutui-color-title, #1a1a1a);
  font-size: var(--nutui-calendar-title-font-size, var(--nutui-font-size-xl, 18rpx));
  font-weight: var(--nutui-calendar-title-font-weight, var(--nutui-font-weight-bold, 600));
  line-height: 50rpx;
}
.nut-calendar-sub-title {
  padding: 7rpx 0;
  line-height: 22rpx;
  font-size: var(--nutui-calendar-sub-title-font-size, var(--nutui-font-size-base, 14rpx));
}
.nut-calendar-weeks {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: space-around;
  -ms-flex-pack: distribute;
  justify-content: space-around;
  height: 36rpx;
  border-radius: 0 0 12rpx 12rpx;
  -webkit-box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.05882);
  box-shadow: 0 4rpx 10rpx #0000000f;
}
.nut-calendar-week-item:first-of-type,
.nut-calendar-week-item:last-of-type {
  color: var(--nutui-color-primary, #ff0f23);
}
.nut-calendar-content {
  -webkit-flex: 1;
  -ms-flex: 1;
  flex: 1;
  width: 100%;
  display: block;
  overflow-y: auto;
}
.nut-calendar-pannel {
  position: relative;
  width: 100%;
  height: auto;
  display: block;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}
.nut-calendar-pannel .calendar-loading-tip {
  height: 50rpx;
  line-height: 50rpx;
  text-align: center;
  position: absolute;
  top: -50rpx;
  left: 0;
  right: 0;
  font-size: var(--nutui-font-size-s, 12rpx);
  color: var(--nutui-color-text, #505259);
}
.nut-calendar-month {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  text-align: center;
}
.nut-calendar-month-title {
  height: 23rpx;
  line-height: 23rpx;
  margin: 8rpx 0;
}
.nut-calendar-days {
  overflow: hidden;
}
.nut-calendar-day {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  position: relative;
  float: left;
  width: var(--nutui-calendar-day-width, 14.28%);
  height: var(--nutui-calendar-day-height, 60rpx);
  font-weight: var(--nutui-calendar-day-font-weight, var(--nutui-font-weight-bold, 600));
  margin-bottom: 4rpx;
}
.nut-calendar-day:nth-child(7n),
.nut-calendar-day:nth-child(7n + 1) {
  color: var(--nutui-color-primary, #ff0f23);
}
.nut-calendar-day-info,
.nut-calendar-day-info-curr {
  position: absolute;
  bottom: 5rpx;
  width: 100%;
  font-size: 12rpx;
  line-height: 14rpx;
}
.nut-calendar-day-info-top {
  position: absolute;
  width: 100%;
  top: 5rpx;
}
.nut-calendar-day-info-bottom {
  position: absolute;
  width: 100%;
  bottom: 5rpx;
}
.nut-calendar-day-active {
  color: #fff !important;
}
.nut-calendar-day-active {
  background-color: var(--nutui-calendar-active-background-color, var(--nutui-color-primary, #ff0f23));
  border-radius: var(--nutui-calendar-day-active-border-radius, 4rpx);
}
.nut-calendar-day-active.active-start {
  border-radius: 0;
  border-top-left-radius: var(--nutui-calendar-day-active-border-radius, 4rpx);
  border-bottom-left-radius: var(--nutui-calendar-day-active-border-radius, 4rpx);
}
.nut-calendar-day-active.active-end {
  border-radius: 0;
  border-top-right-radius: var(--nutui-calendar-day-active-border-radius, 4rpx);
  border-bottom-right-radius: var(--nutui-calendar-day-active-border-radius, 4rpx);
}
.nut-calendar-day-active .nut-calendar-day-info {
  color: #fff;
}
.nut-calendar-day-disabled {
  color: var(--nutui-calendar-disable-color, var(--nutui-color-text-disabled, #c2c4cc)) !important;
}
.nut-calendar-day-disabled .nut-calendar-day-info-curr {
  display: none;
}
.nut-calendar-day-choose {
  background-color: var(--nutui-calendar-choose-background-color, var(--nutui-color-primary-light-pressed, #ffebf1));
  color: var(--nutui-calendar-choose-color, var(--nutui-color-primary, #ff0f23));
}
.nut-calendar-day-choose-disabled {
  color: var(--nutui-calendar-disable-color, var(--nutui-color-text-disabled, #c2c4cc)) !important;
}
.nut-calendar-day-choose-disabled {
  background-color: var(--nutui-calendar-choose-disable-background-color, rgba(191, 191, 191, 0.09));
}
.nut-calendar-day-choose-disabled .nut-calendar-day-info-curr {
  display: none;
}
.nut-calendar-footer {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  width: 100%;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  background-color: #fff;
}
.nut-calendar-footer .calendar-confirm-btn {
  height: 40rpx;
  line-height: 40rpx;
  margin: 6rpx 16rpx;
  text-align: center;
  border-radius: var(--nutui-radius-base, 8rpx);
  background: -webkit-linear-gradient(left, var(--nutui-color-primary-stop-1, #ff475d) 0%, var(--nutui-color-primary-stop-2, #ff0f23) 100%);
  background: linear-gradient(90deg, var(--nutui-color-primary-stop-1, #ff475d) 0%, var(--nutui-color-primary-stop-2, #ff0f23) 100%);
  color: #fff;
  font-weight: var(--nutui-font-weight-bold, 600);
}
.nut-calendar-popup .nut-popup-title-right {
  top: 7rpx !important;
}
[dir='rtl'] .nut-calendar-day,
.nut-rtl .nut-calendar-day {
  float: right;
}
[dir='rtl'] .nut-calendar-day-active.active-start,
.nut-rtl .nut-calendar-day-active.active-start {
  border-top-left-radius: 0;
  border-top-right-radius: var(--nutui-calendar-day-active-border-radius, 4rpx);
  border-bottom-left-radius: 0;
  border-bottom-right-radius: var(--nutui-calendar-day-active-border-radius, 4rpx);
}
[dir='rtl'] .nut-calendar-day-active.active-end,
.nut-rtl .nut-calendar-day-active.active-end {
  border-top-right-radius: 0;
  border-top-left-radius: var(--nutui-calendar-day-active-border-radius, 4rpx);
  border-bottom-right-radius: 0;
  border-bottom-left-radius: var(--nutui-calendar-day-active-border-radius, 4rpx);
}
.nut-button {
  position: relative;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  display: inline-block;
  width: 80rpx;
  width: auto;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-flex-shrink: 0;
  -ms-flex-negative: 0;
  flex-shrink: 0;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  height: var(--nutui-button-default-height, 32rpx);
  font-size: var(--nutui-button-default-font-size, var(--nutui-font-size-base, 14rpx));
  font-weight: var(--nutui-font-weight, 400);
  text-align: center;
  cursor: pointer;
  -webkit-transition: opacity 0.2s;
  transition: opacity 0.2s;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -ms-touch-action: manipulation;
  touch-action: manipulation;
  color: var(--nutui-button-default-color, var(--nutui-color-title, #1a1a1a));
  background: var(--nutui-button-default-background-color, transparent);
  border-width: var(--nutui-button-border-width, 0.5rpx);
}
.nut-button-text {
  margin-left: var(--nutui-button-text-icon-margin, 4rpx);
}
.nut-button-text-right {
  margin-right: var(--nutui-button-text-icon-margin, 4rpx);
}
.nut-button-children {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  background: transparent;
}
.nut-button::before {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  background-color: var(--nutui-color-mask, rgba(0, 0, 0, 0.7));
  border: inherit;
  border-color: var(--nutui-color-mask, rgba(0, 0, 0, 0.7));
  border-radius: inherit;
  -webkit-transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
  opacity: 0;
  content: ' ';
  pointer-events: none;
  pointer-events: auto;
}
.nut-button::after {
  border: none;
}
.nut-button:active::before {
  opacity: 0.1;
}
.nut-button-wrap {
  height: 100%;
  width: 100%;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  background: transparent none repeat 0 0 / auto auto padding-box border-box scroll;
  background: initial;
}
.nut-button-wrap .nut-icon {
  font-size: var(--nutui-button-default-font-size, var(--nutui-font-size-base, 14rpx));
  width: var(--nutui-button-default-font-size, var(--nutui-font-size-base, 14rpx));
  height: var(--nutui-button-default-font-size, var(--nutui-font-size-base, 14rpx));
}
.nut-button-loading::before,
.nut-button-disabled::before {
  display: none;
}
.nut-button-disabled {
  cursor: not-allowed;
  color: #fff;
}
.nut-button.nut-button-icononly {
  width: var(--nutui-button-default-height, 32rpx);
  padding: 0;
}
.nut-button-round {
  border-radius: var(--nutui-button-border-radius, var(--nutui-radius-s, 6rpx));
}
.nut-button-default {
  padding: var(--nutui-button-default-padding, 0rpx 12rpx);
  border-style: solid;
  border-color: var(--nutui-button-default-border-color, var(--nutui-color-text-disabled, #c2c4cc));
}
.nut-button-default-disabled,
.nut-button-default-solid-disabled {
  color: var(--nutui-button-primary-color, #ffffff);
  background: var(--nutui-button-default-disabled, var(--nutui-color-text-disabled, #c2c4cc));
  border-color: var(--nutui-button-default-disabled, var(--nutui-color-text-disabled, #c2c4cc));
}
.nut-button-default-none-disabled {
  color: var(--nutui-button-default-disabled-color, var(--nutui-color-text-help, #888b94));
}
.nut-button-default-outline-disabled,
.nut-button-default-dashed-disabled {
  background: transparent;
  color: var(--nutui-button-default-disabled, var(--nutui-color-text-disabled, #c2c4cc));
  border-color: var(--nutui-button-default-disabled, var(--nutui-color-text-disabled, #c2c4cc));
}
.nut-button-normal {
  padding: var(--nutui-button-normal-padding, 0rpx 12rpx);
}
.nut-button-xlarge {
  height: var(--nutui-button-xlarge-height, 48rpx);
  padding: var(--nutui-button-xlarge-padding, 0rpx 24rpx);
  font-size: var(--nutui-button-xlarge-font-size, var(--nutui-font-size-xl, 18rpx));
  border-radius: var(--nutui-button-xlarge-border-radius, var(--nutui-radius-base, 8rpx));
}
.nut-button-xlarge .nut-button-text {
  margin-left: var(--nutui-button-xlarge-text-icon-margin, 6rpx);
}
.nut-button-xlarge .nut-button-text-right {
  margin-right: var(--nutui-button-xlarge-text-icon-margin, 6rpx);
}
.nut-button-xlarge .nut-icon {
  font-size: var(--nutui-button-xlarge-font-size, var(--nutui-font-size-xl, 18rpx));
  width: var(--nutui-button-xlarge-font-size, var(--nutui-font-size-xl, 18rpx));
  height: var(--nutui-button-xlarge-font-size, var(--nutui-font-size-xl, 18rpx));
}
.nut-button-xlarge-children {
  font-size: var(--nutui-button-xlarge-font-size, var(--nutui-font-size-xl, 18rpx));
}
.nut-button-large {
  height: var(--nutui-button-large-height, 40rpx);
  padding: var(--nutui-button-large-padding, 0rpx 16rpx);
  font-size: var(--nutui-button-large-font-size, var(--nutui-font-size-l, 15rpx));
  border-radius: var(--nutui-button-large-border-radius, var(--nutui-radius-base, 8rpx));
}
.nut-button-large .nut-button-text {
  margin-left: var(--nutui-button-xlarge-text-icon-margin, 6rpx);
}
.nut-button-large .nut-button-text-right {
  margin-right: var(--nutui-button-xlarge-text-icon-margin, 6rpx);
}
.nut-button-large .nut-icon {
  font-size: var(--nutui-button-large-font-size, var(--nutui-font-size-l, 15rpx));
  width: var(--nutui-button-large-font-size, var(--nutui-font-size-l, 15rpx));
  height: var(--nutui-button-large-font-size, var(--nutui-font-size-l, 15rpx));
}
.nut-button-large-children {
  font-size: var(--nutui-button-large-font-size, var(--nutui-font-size-l, 15rpx));
}
.nut-button-small {
  height: var(--nutui-button-small-height, 28rpx);
  padding: var(--nutui-button-small-padding, 0rpx 8rpx);
  font-size: var(--nutui-button-small-font-size, var(--nutui-font-size-s, 12rpx));
  border-radius: var(--nutui-button-small-border-radius, var(--nutui-radius-s, 6rpx));
}
.nut-button-small .nut-icon {
  font-size: var(--nutui-button-small-font-size, var(--nutui-font-size-s, 12rpx));
  width: var(--nutui-button-small-font-size, var(--nutui-font-size-s, 12rpx));
  height: var(--nutui-button-small-font-size, var(--nutui-font-size-s, 12rpx));
}
.nut-button-small-children {
  font-size: var(--nutui-button-small-font-size, var(--nutui-font-size-s, 12rpx));
}
.nut-button-mini {
  height: var(--nutui-button-mini-height, 24rpx);
  padding: var(--nutui-button-mini-padding, 0rpx 8rpx);
  font-size: var(--nutui-button-mini-font-size, var(--nutui-font-size-xs, 11rpx));
  border-radius: var(--nutui-button-mini-border-radius, var(--nutui-radius-xs, 4rpx));
}
.nut-button-mini .nut-icon {
  font-size: var(--nutui-button-mini-font-size, var(--nutui-font-size-xs, 11rpx));
  width: var(--nutui-button-mini-font-size, var(--nutui-font-size-xs, 11rpx));
  height: var(--nutui-button-mini-font-size, var(--nutui-font-size-xs, 11rpx));
}
.nut-button-mini-children {
  font-size: var(--nutui-button-mini-font-size, var(--nutui-font-size-xs, 11rpx));
}
.nut-button-primary {
  color: var(--nutui-button-primary-color, #ffffff);
  background-origin: border-box;
  border-color: transparent;
}
.nut-button-primary-children {
  color: var(--nutui-button-primary-color, #ffffff);
}
.nut-button-primary-solid {
  background: -webkit-linear-gradient(left, var(--nutui-color-primary-stop-1, #ff475d) 0%, var(--nutui-color-primary-stop-2, #ff0f23) 100%);
  background: linear-gradient(90deg, var(--nutui-color-primary-stop-1, #ff475d) 0%, var(--nutui-color-primary-stop-2, #ff0f23) 100%);
  color: var(--nutui-button-primary-color, #ffffff);
  border-color: transparent;
  font-weight: var(--nutui-font-weight-bold, 600);
}
.nut-button-primary-solid.nut-button-small,
.nut-button-primary-solid.nut-button-mini {
  font-weight: var(--nutui-font-weight, 400);
}
.nut-button-primary-disabled,
.nut-button-primary-disabled.nut-button-icononly,
.nut-button-primary-solid-disabled {
  color: var(--nutui-button-primary-color, #ffffff);
  background: var(--nutui-button-primary-disabled, var(--nutui-color-primary-disabled-special, #ffadbe));
  border-color: var(--nutui-button-primary-disabled, var(--nutui-color-primary-disabled-special, #ffadbe));
}
.nut-button-primary-none {
  color: var(--nutui-button-primary-border-color, var(--nutui-color-primary, #ff0f23));
}
.nut-button-primary-none-disabled {
  color: var(--nutui-button-primary-disabled, var(--nutui-color-primary-disabled-special, #ffadbe));
}
.nut-button-primary-outline {
  color: var(--nutui-button-primary-border-color, var(--nutui-color-primary, #ff0f23));
  border-color: var(--nutui-button-primary-border-color, var(--nutui-color-primary, #ff0f23));
}
.nut-button-primary-outline-disabled {
  color: var(--nutui-button-primary-disabled, var(--nutui-color-primary-disabled-special, #ffadbe));
  border-color: var(--nutui-button-primary-disabled, var(--nutui-color-primary-disabled-special, #ffadbe));
}
.nut-button-primary-dashed {
  color: var(--nutui-button-primary-border-color, var(--nutui-color-primary, #ff0f23));
  border-color: var(--nutui-button-primary-border-color, var(--nutui-color-primary, #ff0f23));
}
.nut-button-primary-dashed-disabled {
  color: var(--nutui-button-primary-disabled, var(--nutui-color-primary-disabled-special, #ffadbe));
  border-color: var(--nutui-button-primary-disabled, var(--nutui-color-primary-disabled-special, #ffadbe));
}
.nut-button-primary.nut-button-solid.nut-button-normal {
  font-weight: var(--nutui-font-weight-bold, 600);
}
.nut-button-success {
  color: var(--nutui-button-success-color, #ffffff);
  background: var(--nutui-button-success-background-color, var(--nutui-color-success, #00d900));
  background-origin: border-box;
  border-color: transparent;
}
.nut-button-success-children {
  color: var(--nutui-button-success-color, #ffffff);
}
.nut-button-success-disabled,
.nut-button-success-solid-disabled {
  background: var(--nutui-button-success-disabled, var(--nutui-color-success-disabled, #b2f0ae));
  border-color: var(--nutui-button-success-disabled, var(--nutui-color-success-disabled, #b2f0ae));
}
.nut-button-success-outline,
.nut-button-success-dashed {
  color: var(--nutui-button-success-border-color, var(--nutui-color-success, #00d900));
  border-color: var(--nutui-button-success-border-color, var(--nutui-color-success, #00d900));
}
.nut-button-success-outline-disabled,
.nut-button-success-dashed-disabled {
  color: var(--nutui-button-primary-disabled, var(--nutui-color-primary-disabled-special, #ffadbe));
  border-color: var(--nutui-button-primary-disabled, var(--nutui-color-primary-disabled-special, #ffadbe));
}
.nut-button-success-none {
  color: var(--nutui-button-success-border-color, var(--nutui-color-success, #00d900));
}
.nut-button-success-none-disabled {
  color: var(--nutui-button-success-disabled, var(--nutui-color-success-disabled, #b2f0ae));
}
.nut-button-info {
  color: var(--nutui-button-info-color, #ffffff);
  background: var(--nutui-button-info-background-color, var(--nutui-color-info-background, #0073ff));
  background-origin: border-box;
  border-color: transparent;
}
.nut-button-info-children {
  color: var(--nutui-button-info-color, #ffffff);
}
.nut-button-info-disabled,
.nut-button-info-solid-disabled {
  background: var(--nutui-button-info-disabled, var(--nutui-color-info-disabled, #89a6f8));
  border-color: var(--nutui-button-info-disabled, var(--nutui-color-info-disabled, #89a6f8));
}
.nut-button-info-outline,
.nut-button-info-dashed {
  color: var(--nutui-button-info-border-color, var(--nutui-color-info, #0073ff));
  border-color: var(--nutui-button-info-border-color, var(--nutui-color-info, #0073ff));
}
.nut-button-info-outline-disabled,
.nut-button-info-dashed-disabled {
  color: var(--nutui-button-info-disabled, var(--nutui-color-info-disabled, #89a6f8));
  border-color: var(--nutui-button-info-disabled, var(--nutui-color-info-disabled, #89a6f8));
}
.nut-button-info-none {
  color: var(--nutui-button-info-border-color, var(--nutui-color-info, #0073ff));
}
.nut-button-info-none-disabled {
  color: var(--nutui-button-info-disabled, var(--nutui-color-info-disabled, #89a6f8));
}
.nut-button-danger {
  color: var(--nutui-button-danger-color, #ffffff);
  background: var(--nutui-button-danger-background-color, var(--nutui-color-danger, #ff0f23));
  background-origin: border-box;
  border-color: transparent;
}
.nut-button-danger-children {
  color: var(--nutui-button-danger-color, #ffffff);
}
.nut-button-danger-disabled,
.nut-button-danger-solid-disabled {
  background: var(--nutui-button-danger-disabled, var(--nutui-color-danger-disabled, var(--nutui-color-primary-disabled-special, #ffadbe)));
  border-color: var(--nutui-button-danger-disabled, var(--nutui-color-danger-disabled, var(--nutui-color-primary-disabled-special, #ffadbe)));
}
.nut-button-danger-outline,
.nut-button-danger-dashed {
  color: var(--nutui-button-danger-border-color, var(--nutui-color-danger, #ff0f23));
  border-color: var(--nutui-button-danger-border-color, var(--nutui-color-danger, #ff0f23));
}
.nut-button-danger-outline-disabled,
.nut-button-danger-dashed-disabled {
  color: var(--nutui-button-danger-disabled, var(--nutui-color-danger-disabled, var(--nutui-color-primary-disabled-special, #ffadbe)));
  border-color: var(--nutui-button-danger-disabled, var(--nutui-color-danger-disabled, var(--nutui-color-primary-disabled-special, #ffadbe)));
}
.nut-button-danger-none {
  color: var(--nutui-button-danger-border-color, var(--nutui-color-danger, #ff0f23));
}
.nut-button-danger-none-disabled {
  color: var(--nutui-button-danger-disabled, var(--nutui-color-danger-disabled, var(--nutui-color-primary-disabled-special, #ffadbe)));
}
.nut-button-warning {
  color: var(--nutui-button-warning-color, #ffffff);
  background: var(--nutui-button-warning-background-color, var(--nutui-color-warning, #ffbf00));
  background-origin: border-box;
  border-color: transparent;
}
.nut-button-warning-children {
  color: var(--nutui-button-warning-color, #ffffff);
}
.nut-button-warning-disabled,
.nut-button-warning-solid-disabled {
  color: var(--nutui-button-warning-color, #ffffff);
  background: var(--nutui-button-warning-disabled, var(--nutui-color-warning-disabled, #fdd3b9));
  border-color: var(--nutui-button-warning-disabled, var(--nutui-color-warning-disabled, #fdd3b9));
}
.nut-button-warning-outline,
.nut-button-warning-dashed {
  color: var(--nutui-button-warning-border-color, var(--nutui-color-warning, #ffbf00));
  border-color: var(--nutui-button-warning-border-color, var(--nutui-color-warning, #ffbf00));
}
.nut-button-warning-outline-disabled,
.nut-button-warning-dashed-disabled {
  color: var(--nutui-button-warning-disabled, var(--nutui-color-warning-disabled, #fdd3b9));
  border-color: var(--nutui-button-warning-disabled, var(--nutui-color-warning-disabled, #fdd3b9));
}
.nut-button-warning-none {
  color: var(--nutui-button-warning-border-color, var(--nutui-color-warning, #ffbf00));
}
.nut-button-warning-none-disabled {
  color: var(--nutui-button-warning-disabled, var(--nutui-color-warning-disabled, #fdd3b9));
}
.nut-button-block {
  display: block;
  width: 100%;
}
.nut-button-outline {
  background: transparent;
  border-style: solid;
}
.nut-button-dashed {
  background: transparent;
  border-style: dashed;
}
.nut-button-none {
  background: transparent;
  border-color: transparent;
}
.nut-button-loading {
  cursor: default;
  opacity: 0.9;
}
.nut-button-square {
  border-radius: var(--nutui-button-square-border-radius, 0);
}
[dir='rtl'] .nut-button-text,
.nut-rtl .nut-button-text {
  margin-left: 0;
  margin-right: var(--nutui-button-text-icon-margin, 4rpx);
}
[dir='rtl'] .nut-button-text.right,
.nut-rtl .nut-button-text.right {
  margin-left: var(--nutui-button-text-icon-margin, 4rpx);
}
[dir='rtl'] .nut-button::before,
.nut-rtl .nut-button::before {
  left: auto;
  right: 50%;
  -webkit-transform: translate(50%, -50%);
  -ms-transform: translate(50%, -50%);
  transform: translate(50%, -50%);
}
.nut-barrage {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  background-color: var(--nutui-color-background, #f2f3f5);
  color: var(--nutui-color-title, #1a1a1a);
}
.nut-barrage .barrage-item {
  display: block;
  position: absolute;
  right: 0;
  padding: 4rpx 16rpx;
  border-radius: 16rpx;
  font-size: var(--nutui-font-size-s, 12rpx);
  text-align: center;
  white-space: pre;
  -webkit-transform: translate(100%);
  -ms-transform: translate(100%);
  transform: translate(100%);
  background: -webkit-linear-gradient(left, var(--nutui-black-3), var(--nutui-black-1));
  background: linear-gradient(to right, var(--nutui-black-3), var(--nutui-black-1));
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}
.nut-barrage .barrage-item.move {
  will-change: transform;
  -webkit-animation-name: moving;
  animation-name: moving;
  -webkit-animation-timing-function: linear;
  animation-timing-function: linear;
  -webkit-animation-play-state: running;
  animation-play-state: running;
}
@keyframes moving {
  0% {
    -webkit-transform: translate(100%);
    transform: translate(100%);
  }
  to {
    -webkit-transform: translate(var(--move-distance));
    transform: translate(var(--move-distance));
  }
}
[dir='rtl'] .nut-barrage,
.nut-rtl .nut-barrage {
  left: auto;
  right: 0;
}
[dir='rtl'] .nut-barrage .barrage-item,
.nut-rtl .nut-barrage .barrage-item {
  -webkit-transform: translate(-100%);
  -ms-transform: translate(-100%);
  transform: translate(-100%);
  background: -webkit-linear-gradient(right, var(--nutui-black-3), var(--nutui-black-1));
  background: linear-gradient(to left, var(--nutui-black-3), var(--nutui-black-1));
}
[dir='rtl'] .nut-barrage .barrage-item.move,
.nut-rtl .nut-barrage .barrage-item.move {
  -webkit-animation-name: moving-rtl;
  animation-name: moving-rtl;
}
@keyframes moving-rtl {
  0% {
    -webkit-transform: translate(var(--move-distance));
    transform: translate(var(--move-distance));
  }
  to {
    -webkit-transform: translate(100%);
    transform: translate(100%);
  }
}
.nut-badge {
  position: relative;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  display: -webkit-inline-flex;
  display: -ms-inline-flexbox;
  display: inline-flex;
  -webkit-box-sizing: content-box;
  box-sizing: content-box;
  vertical-align: middle;
  width: auto;
}
.nut-badge-icon {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  background: var(--nutui-badge-background-color, var(--nutui-color-primary, #ff0f23));
  padding: var(--nutui-badge-icon-padding, 2rpx);
  text-align: center;
  z-index: var(--nutui-badge-z-index, 1);
}
.nut-badge-icon .nut-icon {
  width: var(--nutui-badge-icon-size, 10rpx);
  height: var(--nutui-badge-icon-size, 10rpx);
  font-size: var(--nutui-badge-icon-size, 10rpx);
}
.nut-badge-sup,
.nut-badge-icon {
  border-radius: var(--nutui-badge-border-radius, var(--nutui-badge-height, 14rpx));
}
.nut-badge-sup::after,
.nut-badge-icon::after {
  content: '';
  position: absolute;
  inset: -50%;
  -webkit-transform: scale(0.5);
  -ms-transform: scale(0.5);
  transform: scale(0.5);
  border: var(--nutui-badge-border, 1rpx solid #ffffff);
  border-radius: var(--nutui-badge-border-radius, var(--nutui-badge-height, 14rpx));
}
.nut-badge-sup {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  display: -webkit-inline-flex;
  display: -ms-inline-flexbox;
  display: inline-flex;
  text-align: center;
  min-width: var(--nutui-badge-min-width, 6rpx);
  padding: var(--nutui-badge-padding, 1rpx 4rpx);
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  color: var(--nutui-badge-color, #ffffff);
  font-size: var(--nutui-badge-font-size, var(--nutui-font-size-xxxs, 9rpx));
  line-height: 12rpx;
  white-space: nowrap;
  font-weight: 400;
  vertical-align: middle;
  background: var(--nutui-badge-background-color, var(--nutui-color-primary, #ff0f23));
  z-index: 1;
}
.nut-badge-disabled {
  background: var(--nutui-badge-background-disabled-color, var(--nutui-color-text-disabled, #c2c4cc));
}
.nut-badge-number {
  font-family: JDZH-Regular;
}
.nut-badge-one {
  height: var(--nutui-badge-height, 14rpx);
  width: var(--nutui-badge-height, 14rpx);
}
.nut-badge-content {
  position: absolute;
  -webkit-transform: var(--nutui-badge-content-transform, translate(50%, -50%));
  -ms-transform: var(--nutui-badge-content-transform, translate(50%, -50%));
  transform: var(--nutui-badge-content-transform, translate(50%, -50%));
}
.nut-badge-dot {
  padding: 0;
  border-radius: 50%;
}
.nut-badge-dot::after {
  border: var(--nutui-badge-dot-border, 1rpx solid #ffffff);
  border-radius: 50%;
}
.nut-badge-dot-normal {
  min-width: var(--nutui-badge-dot-width, 6rpx);
  width: var(--nutui-badge-dot-width, 6rpx);
  height: var(--nutui-badge-dot-width, 6rpx);
}
.nut-badge-dot-small {
  min-width: var(--nutui-badge-dot-small-width, 4rpx);
  width: var(--nutui-badge-dot-small-width, 4rpx);
  height: var(--nutui-badge-dot-small-width, 4rpx);
}
.nut-badge-dot-large {
  min-width: var(--nutui-badge-dot-large-width, 8rpx);
  width: var(--nutui-badge-dot-large-width, 8rpx);
  height: var(--nutui-badge-dot-large-width, 8rpx);
}
.nut-badge-outline {
  background: #fff;
  color: var(--nutui-badge-outline-color, var(--nutui-color-primary, #ff0f23));
}
.nut-badge-outline::after {
  border: var(--nutui-badge-outline-border, 1rpx solid var(--nutui-color-primary, #ff0f23));
}
.nut-backtop {
  display: none;
}
.nut-backtop-show {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  width: var(--nutui-hoverbutton-item-size, 40rpx);
  height: var(--nutui-hoverbutton-item-size, 40rpx);
  -webkit-transition: all 0.2s ease-in-out;
  transition: all 0.2s ease-in-out;
}
.nut-backtop-show .nut-hoverbutton-item-container {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
}
.nut-avatar-cropper {
  position: relative;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
}
.nut-avatar-cropper-edit-text {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #0000004d;
  z-index: 1;
  color: #fff;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
}
.nut-avatar-cropper-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 2;
}
.nut-avatar-cropper-popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--nut-overlay-bg-color, rgba(0, 0, 0, 0.7));
  z-index: 1000;
}
.nut-avatar-cropper-popup-canvas,
.nut-avatar-cropper-popup-cut-canvas {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}
.nut-avatar-cropper-popup-cut-canvas {
  z-index: 0;
}
.nut-avatar-cropper-popup-toolbar {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 2;
}
.nut-avatar-cropper-popup-toolbar.top {
  top: 0;
  bottom: inherit;
}
.nut-avatar-cropper-popup-toolbar-flex {
  width: 100%;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-justify-content: space-between;
  -ms-flex-pack: justify;
  justify-content: space-between;
}
.nut-avatar-cropper-popup-toolbar-item {
  color: #fff;
  padding: 15rpx;
  cursor: pointer;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
}
.nut-avatar-cropper-popup-toolbar-item .nut-button {
  color: #fff;
}
.nut-avatar-cropper-popup-highlight {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  background-color: transparent;
}
.nut-avatar-cropper-popup-highlight .highlight {
  position: absolute;
  left: 50%;
  top: 50%;
  -webkit-transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
  background-color: transparent;
  -webkit-box-shadow: 0 0 1000rpx 1000rpx rgba(0, 0, 0, 0.6);
  box-shadow: 0 0 1000rpx 1000rpx #0009;
}
.nut-avatar-cropper.round .nut-avatar-cropper-edit-text {
  border-radius: 50%;
}
[dir='rtl'] .nut-avatar-cropper-edit-text,
.nut-rtl .nut-avatar-cropper-edit-text,
[dir='rtl'] .nut-avatar-cropper-input,
.nut-rtl .nut-avatar-cropper-input,
[dir='rtl'] .nut-avatar-cropper-popup,
.nut-rtl .nut-avatar-cropper-popup,
[dir='rtl'] .nut-avatar-cropper-popup-canvas,
[dir='rtl'] .nut-avatar-cropper-popup-cut-canvas,
.nut-rtl .nut-avatar-cropper-popup-canvas,
.nut-rtl .nut-avatar-cropper-popup-cut-canvas,
[dir='rtl'] .nut-avatar-cropper-popup-toolbar,
.nut-rtl .nut-avatar-cropper-popup-toolbar,
[dir='rtl'] .nut-avatar-cropper-popup-highlight,
.nut-rtl .nut-avatar-cropper-popup-highlight {
  left: auto;
  right: 0;
}
[dir='rtl'] .nut-avatar-cropper-popup-highlight .highlight,
.nut-rtl .nut-avatar-cropper-popup-highlight .highlight {
  left: auto;
  right: 50%;
  -webkit-transform: translate(50%, -50%);
  -ms-transform: translate(50%, -50%);
  transform: translate(50%, -50%);
}
.nut-avatar-group {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  -webkit-flex: 0 0 auto;
  -ms-flex: 0 0 auto;
  flex: 0 0 auto;
}
.nut-avatar-group-avatar,
.nut-avatar-group .nut-avatar {
  border: 1rpx solid #fff;
  margin-left: -8rpx;
}
.nut-avatar-group-avatar:not(:first-of-type),
.nut-avatar-group .nut-avatar:not(:first-of-type) {
  margin-left: -8rpx;
}
[dir='rtl'] .nut-avatar-group .nut-avatar:not(:first-of-type),
.nut-rtl .nut-avatar-group .nut-avatar:not(:first-of-type) {
  margin-left: 0;
  margin-right: -8rpx;
}
.nut-avatar {
  position: relative;
  -webkit-flex: 0 0 auto;
  -ms-flex: 0 0 auto;
  flex: 0 0 auto;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  width: var(--nutui-avatar-normal-width, 40rpx);
  height: var(--nutui-avatar-normal-height, 40rpx);
}
.nut-avatar-round {
  border-radius: 999rpx;
  overflow: hidden;
}
.nut-avatar-square {
  border-radius: var(--nutui-avatar-square, 5rpx);
}
.nut-avatar-first-child {
  margin-left: 0;
  margin-right: 0;
}
.nut-avatar-img {
  width: 100%;
  height: 100%;
  -webkit-flex-shrink: 0;
  -ms-flex-negative: 0;
  flex-shrink: 0;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: center center;
}
.nut-avatar-icon {
  background-size: 100% 100%;
}
.nut-avatar-text {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
}
.nut-avatar-large,
.nut-avatar-large-img,
.nut-avatar-large-icon,
.nut-avatar-large-text {
  width: var(--nutui-avatar-large-width, 60rpx);
  height: var(--nutui-avatar-large-height, 60rpx);
}
.nut-avatar-small,
.nut-avatar-small-text {
  width: var(--nutui-avatar-small-width, 32rpx);
  height: var(--nutui-avatar-small-height, 32rpx);
}
.nut-audio-icon {
  position: relative;
  display: inline-block;
}
.nut-audio-icon-box {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  width: 30rpx;
  height: 30rpx;
  background: #fff;
  border-radius: 50%;
  -webkit-box-shadow: 0 0 8rpx var(--nutui-color-text-disabled, #c2c4cc);
  box-shadow: 0 0 8rpx var(--nutui-color-text-disabled, #c2c4cc);
}
.nut-audio-icon .nut-audio-icon-stop {
  position: relative;
}
.nut-audio-icon .nut-audio-icon-stop::after {
  position: absolute;
  left: 50%;
  top: 50%;
  -webkit-transform: translate(-50%);
  -ms-transform: translate(-50%);
  transform: translate(-50%);
  content: '';
  height: 2rpx;
  width: 30rpx;
  background: var(--nutui-color-text-disabled, #c2c4cc);
  -webkit-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  transform: rotate(45deg);
  -webkit-transform-origin: 8rpx -18rpx;
  -ms-transform-origin: 8rpx -18rpx;
  transform-origin: 8rpx -18rpx;
}
.nut-audio-progress {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  width: 100%;
  margin: 0 auto;
  padding: 10rpx 0;
}
.nut-audio-progress-bar-wrapper {
  -webkit-flex: 1;
  -ms-flex: 1;
  flex: 1;
  margin: 0 10rpx;
}
.nut-audio-progress .time {
  min-width: 50rpx;
  font-size: 12rpx;
  text-align: center;
}
.nut-audio-progress .nut-range-button {
  width: 8rpx;
  height: 8rpx;
}
.nut-audio .custom-button-group .nut-button-primary {
  margin: 0 5rpx;
}
.nut-audio .custom-button-group-disable .nut-button-primary {
  margin: 0 5rpx;
  pointer-events: none;
}
.nut-audio .disable {
  color: #00f;
}
.nut-audio .nut-audio-none-container .nut-voice {
  border: 1rpx solid var(--nutui-color-title, #1a1a1a);
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
}
[dir='rtl'] .nut-audio-icon .nut-audio-icon-stop::after,
.nut-rtl .nut-audio-icon .nut-audio-icon-stop::after {
  left: auto;
  right: 50%;
  -webkit-transform: rotate(-45deg);
  -ms-transform: rotate(-45deg);
  transform: rotate(-45deg);
  -webkit-transform-origin: 20rpx -18rpx;
  -ms-transform-origin: 20rpx -18rpx;
  transform-origin: 20rpx -18rpx;
}
.nut-animate [class*='nut-animate-'] {
  -webkit-animation-duration: 0.5s;
  animation-duration: 0.5s;
  -webkit-animation-timing-function: ease-out;
  animation-timing-function: ease-out;
  -webkit-animation-fill-mode: both;
  animation-fill-mode: both;
}
@keyframes slide-right {
  0% {
    opacity: 0;
    -webkit-transform: translate(100%);
    transform: translate(100%);
  }
  to {
    opacity: 1;
    -webkit-transform: translate(0);
    transform: translate(0);
  }
}
@keyframes slide-left {
  0% {
    opacity: 0;
    -webkit-transform: translate(-100%);
    transform: translate(-100%);
  }
  to {
    opacity: 1;
    -webkit-transform: translate(0);
    transform: translate(0);
  }
}
@keyframes slide-top {
  0% {
    opacity: 0;
    -webkit-transform: translateY(-100%);
    transform: translateY(-100%);
  }
  to {
    opacity: 1;
    -webkit-transform: translateY(0);
    transform: translateY(0);
  }
}
@keyframes slide-bottom {
  0% {
    opacity: 0;
    -webkit-transform: translateY(100%);
    transform: translateY(100%);
  }
  to {
    opacity: 1;
    -webkit-transform: translateY(0);
    transform: translateY(0);
  }
}
.nut-animate .nut-animate-slide-right {
  -webkit-animation-name: slide-right;
  animation-name: slide-right;
}
.nut-animate .nut-animate-slide-left {
  -webkit-animation-name: slide-left;
  animation-name: slide-left;
}
.nut-animate .nut-animate-slide-top {
  -webkit-animation-name: slide-top;
  animation-name: slide-top;
}
.nut-animate .nut-animate-slide-bottom {
  -webkit-animation-name: slide-bottom;
  animation-name: slide-bottom;
}
@keyframes shake {
  0%,
  to {
    -webkit-transform: translate(0);
    transform: translate(0);
  }
  10% {
    -webkit-transform: translate(-9rpx);
    transform: translate(-9rpx);
  }
  20% {
    -webkit-transform: translate(8rpx);
    transform: translate(8rpx);
  }
  30% {
    -webkit-transform: translate(-7rpx);
    transform: translate(-7rpx);
  }
  40% {
    -webkit-transform: translate(6rpx);
    transform: translate(6rpx);
  }
  50% {
    -webkit-transform: translate(-5rpx);
    transform: translate(-5rpx);
  }
  60% {
    -webkit-transform: translate(4rpx);
    transform: translate(4rpx);
  }
  70% {
    -webkit-transform: translate(-3rpx);
    transform: translate(-3rpx);
  }
  80% {
    -webkit-transform: translate(2rpx);
    transform: translate(2rpx);
  }
  90% {
    -webkit-transform: translate(-1rpx);
    transform: translate(-1rpx);
  }
}
.nut-animate .nut-animate-shake {
  -webkit-animation-name: shake;
  animation-name: shake;
}
@keyframes ripple {
  0% {
    -webkit-transform: scale(1);
    transform: scale(1);
  }
  50% {
    -webkit-transform: scale(1.1);
    transform: scale(1.1);
  }
}
.nut-animate .nut-animate-ripple {
  -webkit-animation-name: ripple;
  animation-name: ripple;
}
@keyframes breath {
  0%,
  to {
    -webkit-transform: scale(1);
    transform: scale(1);
  }
  50% {
    -webkit-transform: scale(1.1);
    transform: scale(1.1);
  }
}
.nut-animate .nut-animate-breath {
  -webkit-animation-name: breath;
  animation-name: breath;
  -webkit-animation-duration: 2.7s;
  animation-duration: 2.7s;
  -webkit-animation-timing-function: ease-in-out;
  animation-timing-function: ease-in-out;
  -webkit-animation-direction: alternate;
  animation-direction: alternate;
}
.nut-animate .nut-animate-twinkle {
  position: relative;
}
.nut-animate .nut-animate-twinkle::after,
.nut-animate .nut-animate-twinkle::before {
  width: 60rpx;
  height: 60rpx;
  content: '';
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  border: 4rpx solid rgba(255, 255, 255, 0.6);
  position: absolute;
  border-radius: 30rpx;
  right: 50%;
  margin-top: -30rpx;
  margin-right: -30rpx;
  z-index: 1;
  -webkit-transform: scale(0);
  -ms-transform: scale(0);
  transform: scale(0);
  -webkit-animation: twinkle 2s ease-out infinite;
  animation: twinkle 2s ease-out infinite;
}
.nut-animate .nut-animate-twinkle::after {
  -webkit-animation-delay: 0.4s;
  animation-delay: 0.4s;
}
@keyframes twinkle {
  0% {
    -webkit-transform: scale(0);
    transform: scale(0);
  }
  20% {
    opacity: 1;
  }
  50%,
  to {
    -webkit-transform: scale(1.4);
    transform: scale(1.4);
    opacity: 0;
  }
}
.nut-animate .nut-animate-flicker {
  position: relative;
  overflow: hidden;
}
.nut-animate .nut-animate-flicker::after {
  width: 100rpx;
  height: 60rpx;
  position: absolute;
  left: 0;
  top: 0;
  opacity: 0.73;
  content: '';
  background-image: -webkit-linear-gradient(344deg, rgba(232, 224, 255, 0) 24%, #e8e0ff 91%);
  background-image: linear-gradient(106deg, rgba(232, 224, 255, 0) 24%, #e8e0ff 91%);
  -webkit-animation: flicker 1.5s linear infinite;
  animation: flicker 1.5s linear infinite;
  -webkit-transform: skew(-20deg);
  -ms-transform: skew(-20deg);
  transform: skew(-20deg);
  -webkit-filter: blur(3rpx);
  filter: blur(3rpx);
}
@keyframes flicker {
  0% {
    -webkit-transform: translate(-100rpx) skew(-20deg);
    transform: translate(-100rpx) skew(-20deg);
  }
  40%,
  to {
    -webkit-transform: translate(150rpx) skew(-20deg);
    transform: translate(150rpx) skew(-20deg);
  }
}
@keyframes jump {
  0% {
    -webkit-transform: rotate(0) translateY(0);
    transform: rotate(0) translateY(0);
  }
  25% {
    -webkit-transform: rotate(10deg) translateY(20rpx);
    transform: rotate(10deg) translateY(20rpx);
  }
  50% {
    -webkit-transform: rotate(0) translateY(-10rpx);
    transform: rotate(0) translateY(-10rpx);
  }
  75% {
    -webkit-transform: rotate(-10deg) translateY(20rpx);
    transform: rotate(-10deg) translateY(20rpx);
  }
  to {
    -webkit-transform: rotate(0) translateY(0);
    transform: rotate(0) translateY(0);
  }
}
.nut-animate .nut-animate-jump {
  -webkit-transform-origin: center center;
  -ms-transform-origin: center center;
  transform-origin: center center;
  -webkit-animation: jump 0.7s linear;
  animation: jump 0.7s linear;
}
@keyframes float-pop {
  0% {
    top: 0;
  }
  25% {
    top: 1rpx;
  }
  50% {
    top: 4rpx;
  }
  75% {
    top: 1rpx;
  }
  to {
    top: 0;
  }
}
.nut-animate .nut-animate-float {
  position: relative;
  -webkit-animation-name: float-pop;
  animation-name: float-pop;
}
.nut-animate .loop {
  -webkit-animation-iteration-count: infinite;
  animation-iteration-count: infinite;
}
.nut-actionsheet {
  text-align: center;
}
.nut-actionsheet.nut-popup {
  min-height: 10%;
  background-color: var(--nutui-actionsheet-background-color, var(--nutui-color-background-overlay, #ffffff));
}
.nut-actionsheet .nut-popup-title {
  border-bottom: 1rpx solid var(--nutui-actionsheet-border-color, var(--nutui-color-border, rgba(0, 0, 0, 0.06)));
}
.nut-actionsheet-list {
  display: block;
  list-style: none;
  padding: 0;
  margin: 0;
  border-radius: var(--nutui-actionsheet-border-radius, 0);
}
.nut-actionsheet-cancel,
.nut-actionsheet-item {
  display: block;
  padding: 10rpx;
  text-align: var(--nutui-actionsheet-item-text-align, center);
  line-height: var(--nutui-actionsheet-item-line-height, 24rpx);
  font-size: var(--nutui-font-size-base, 14rpx);
  color: var(--nutui-actionsheet-item-color, var(--nutui-color-title, #1a1a1a));
  cursor: pointer;
}
.nut-actionsheet-cancel-name,
.nut-actionsheet-item-name {
  text-align: var(--nutui-actionsheet-item-text-align, center);
  line-height: var(--nutui-actionsheet-item-line-height, 24rpx);
  font-size: var(--nutui-font-size-base, 14rpx);
  color: var(--nutui-actionsheet-item-color, var(--nutui-color-title, #1a1a1a));
}
.nut-actionsheet-cancel-description,
.nut-actionsheet-item-description {
  display: block;
  font-size: var(--nutui-font-size-s, 12rpx);
  color: var(--nutui-color-text, #505259);
  text-align: var(--nutui-actionsheet-item-text-align, center);
  line-height: var(--nutui-actionsheet-item-line-height, 24rpx);
}
.nut-actionsheet-cancel-danger,
.nut-actionsheet-item-danger {
  color: var(--nutui-actionsheet-item-danger, var(--nutui-color-danger, #ff0f23));
}
.nut-actionsheet-cancel-disabled,
.nut-actionsheet-item-disabled {
  color: var(--nutui-color-text-disabled, #c2c4cc) !important;
}
.nut-actionsheet-cancel-disabled,
.nut-actionsheet-item-disabled {
  cursor: not-allowed;
}
.nut-actionsheet-cancel {
  margin-top: 5rpx;
  border-top: 1rpx solid var(--nutui-actionsheet-border-color, var(--nutui-color-border, rgba(0, 0, 0, 0.06)));
  border-radius: var(--nutui-actionsheet-border-radius, 0);
}
.nut-actionsheet-safe-area {
  display: block;
  width: 100%;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}
.nut-address-exist {
  display: block;
  padding: 15rpx 20rpx 0;
  height: 279rpx;
  overflow-y: auto;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}
.nut-address-exist-item {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  margin-bottom: 20rpx;
  font-size: var(--nutui-font-size-s, 12rpx);
  line-height: var(--nutui-font-size-base, 14rpx);
  color: var(--nutui-color-title, #1a1a1a);
}
.nut-address-exist-item.active {
  font-weight: var(--nutui-font-weight-bold, 600);
}
.nut-address-exist-item-info {
  margin-left: 9rpx;
}
.nut-address-footer {
  width: 100%;
  height: 54rpx;
  padding: 6rpx 0 0;
  border-top: 1rpx solid var(--nutui-color-border, rgba(0, 0, 0, 0.06));
}
.nut-address-footer-btn {
  width: 90%;
  height: 42rpx;
  line-height: 42rpx;
  margin: auto;
  text-align: center;
  background: -webkit-linear-gradient(left, var(--nutui-color-primary-stop-1, #ff475d) 0%, var(--nutui-color-primary-stop-2, #ff0f23) 100%);
  background: linear-gradient(90deg, var(--nutui-color-primary-stop-1, #ff475d) 0%, var(--nutui-color-primary-stop-2, #ff0f23) 100%);
  border-radius: 21rpx;
  font-size: 15rpx;
  color: #fff;
}
.nut-address-title {
  font-size: 14rpx;
  font-weight: 500;
  padding: 16rpx 16rpx 12rpx;
}
.nut-address-hotlist {
  padding: 0 16rpx;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-wrap: wrap;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
  -webkit-align-items: flex-start;
  -ms-flex-align: start;
  align-items: flex-start;
}
.nut-address-hotlist-item {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  width: 63rpx;
  height: 28rpx;
  font-size: 12rpx;
  border-radius: 4rpx;
  margin-bottom: 7rpx;
  margin-right: 7rpx;
  background-color: var(--nutui-color-background-sunken, #f7f8fc);
  color: var(--nutui-color-title, #1a1a1a);
}
.nut-address-hotlist-item:nth-child(5n) {
  margin-right: 0;
}
.nut-address-hotlist.hotlist-more .nut-address-hotlist-item {
  width: auto;
  padding: 0 16rpx;
  margin-right: 7rpx;
}
.nut-address-selected {
  width: 100%;
  height: 60rpx;
  padding: 0 16rpx;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  border-bottom: 1rpx solid var(--nutui-color-border, rgba(0, 0, 0, 0.06));
}
.nut-address-selected-item {
  font-size: 12rpx;
  display: inline-block;
  height: 28rpx;
  line-height: 28rpx;
  padding: 0 12rpx;
  border-radius: 4rpx;
  background-color: var(--nutui-color-background-sunken, #f7f8fc);
}
.nut-address-selected-item.active {
  border: 1rpx solid var(--nutui-color-primary, #ff0f23);
  background-color: var(--nutui-color-primary-light-pressed, #ffebf1);
  color: var(--nutui-color-primary, #ff0f23);
}
.nut-address-selected-border {
  margin: 0 2rpx;
  color: var(--nutui-color-text-disabled, #c2c4cc);
}
.nut-address-elevator {
  margin-top: 0;
}
.nut-address-elevator .nut-elevator-list-item {
  position: relative;
  padding-left: 20rpx;
}
.nut-address-elevator .nut-elevator-list-item-code {
  display: inline;
  position: absolute;
  left: 0;
  top: 0;
  height: 30rpx;
  line-height: 30rpx;
  border-bottom: 0;
  color: var(--nutui-color-text-help, #888b94);
  font-weight: 500;
}
.nut-address-elevator .nut-elevator-bars {
  top: 40%;
  padding: 0;
  background: none;
}
.nut-address-elevator .nut-elevator-bars-inner-item {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  width: 16rpx;
  height: 16rpx;
  font-size: 10rpx;
  border-radius: 16rpx;
  margin-bottom: 2rpx;
  color: var(--nutui-color-text-help, #888b94);
}
.nut-address-elevator .nut-elevator-bars-inner-item-active {
  background-color: var(--nutui-color-primary, #ff0f23);
  color: var(--nutui-color-background-overlay, #ffffff);
  font-weight: 400;
}
[dir='rtl'] .nut-address-exist-item-info,
.nut-rtl .nut-address-exist-item-info {
  margin-left: 0;
  margin-right: 9rpx;
}
.weapp-tw-user-ui-card {
  display: -webkit-inline-flex;
  display: -ms-inline-flexbox;
  display: inline-flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  gap: 8rpx;
  color: var(--weapp-tw-user-ui-color, #175e75);
  -webkit-animation: weappTwUserUiBreathe 1.2s ease-in-out infinite;
  animation: weappTwUserUiBreathe 1.2s ease-in-out infinite;
}
.weapp-tw-user-ui-loading {
  display: inline-block;
  width: 32rpx;
  height: 32rpx;
  -webkit-animation: weappTwUserUiRotation 1s linear infinite;
  animation: weappTwUserUiRotation 1s linear infinite;
}
@-webkit-keyframes weappTwUserUiRotation {
  to {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
@keyframes weappTwUserUiRotation {
  to {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
@-webkit-keyframes weappTwUserUiBreathe {
  50% {
    opacity: 0.65;
    -webkit-transform: scale(0.96);
    transform: scale(0.96);
  }
}
@keyframes weappTwUserUiBreathe {
  50% {
    opacity: 0.65;
    -webkit-transform: scale(0.96);
    transform: scale(0.96);
  }
}
```

### vendors.wxss

```css
page,
.tw-root,
wx-root-portal-content {
  --nut-icon-height: 16rpx;
  --nut-icon-width: 16rpx;
  --nut-icon-line-height: 16rpx;
  --nut-icon-color: #171a26;
  --animate-duration: 1s;
  --animate-delay: 0s;
}
page {
  --nut-icon-height: 16rpx;
  --nut-icon-width: 16rpx;
  --nut-icon-line-height: 16rpx;
  --nut-icon-color: #171a26;
  --animate-duration: 1s;
  --animate-delay: 0s;
}
.nut-icon {
  display: inline-block;
  position: relative;
  width: var(--nut-icon-width, 16rpx);
  height: var(--nut-icon-height, 16rpx);
  font-size: var(--nut-icon-width, 16rpx);
  line-height: var(--nut-icon-line-height, 16rpx);
  text-align: right;
  color: var(--nut-icon-color, #171a26);
}
.nut-icon-img {
  width: var(--nut-icon-width);
  height: var(--nut-icon-height);
  object-fit: contain;
}
.nut-icon-loading,
.nut-icon-loading1,
.nut-icon-Loading,
.nut-icon-Loading1 {
  display: inline-block;
  -webkit-animation: rotation 1s infinite linear;
  animation: rotation 1s infinite linear;
}
.nut-icon-am-infinite {
  -webkit-animation-iteration-count: infinite;
  -webkit-animation-direction: alternate;
  animation-iteration-count: infinite;
  animation-direction: alternate;
}
.nut-icon-am-jump {
  -webkit-animation-name: nutJumpOne;
  -webkit-animation-duration: var(--animate-duration);
  -webkit-animation-timing-function: ease;
  -webkit-animation-delay: var(--animate-delay);
  animation-name: nutJumpOne;
  animation-duration: var(--animate-duration);
  animation-timing-function: ease;
  animation-delay: var(--animate-delay);
}
.nut-icon-am-jump.nut-icon-am-infinite {
  -webkit-animation-name: nutJump;
  animation-name: nutJump;
}
.nut-icon-am-rotate {
  -webkit-animation-name: rotation;
  -webkit-animation-duration: var(--animate-duration);
  -webkit-animation-timing-function: linear;
  -webkit-animation-delay: var(--animate-delay);
  animation-name: rotation;
  animation-duration: var(--animate-duration);
  animation-timing-function: linear;
  animation-delay: var(--animate-delay);
}
.nut-icon-am-rotate.nut-icon-am-infinite {
  -webkit-animation-direction: normal;
  animation-direction: normal;
}
.nut-icon-am-blink {
  -webkit-animation-name: nutBlink;
  -webkit-animation-duration: var(--animate-duration);
  -webkit-animation-timing-function: ease-in-out;
  -webkit-animation-delay: var(--animate-delay);
  animation-name: nutBlink;
  animation-duration: var(--animate-duration);
  -webkit-animation-timing-function: linear;
  animation-timing-function: linear;
  animation-delay: var(--animate-delay);
}
.nut-icon-am-breathe {
  -webkit-animation-name: nutBreathe;
  -webkit-animation-duration: var(--animate-duration);
  -webkit-animation-timing-function: ease-in-out;
  -webkit-animation-delay: var(--animate-delay);
  animation-name: nutBreathe;
  animation-duration: var(--animate-duration);
  animation-timing-function: ease-in-out;
  animation-delay: var(--animate-delay);
}
.nut-icon-am-flash {
  -webkit-animation-name: nutFlash;
  -webkit-animation-duration: var(--animate-duration);
  -webkit-animation-timing-function: ease-in-out;
  -webkit-animation-delay: var(--animate-delay);
  animation-name: nutFlash;
  animation-duration: var(--animate-duration);
  animation-timing-function: ease-in-out;
  animation-delay: var(--animate-delay);
}
.nut-icon-am-bounce {
  -webkit-animation-name: nutBounce;
  -webkit-animation-duration: var(--animate-duration);
  -webkit-animation-timing-function: ease-in-out;
  -webkit-animation-delay: var(--animate-delay);
  animation-name: nutBounce;
  animation-duration: var(--animate-duration);
  animation-timing-function: ease-in-out;
  animation-delay: var(--animate-delay);
}
.nut-icon-am-bounce.nut-icon-am-infinite {
  -webkit-animation-direction: normal;
  animation-direction: normal;
}
.nut-icon-am-shake {
  -webkit-animation-name: nutShake;
  -webkit-animation-duration: var(--animate-duration);
  -webkit-animation-timing-function: ease-in-out;
  -webkit-animation-delay: var(--animate-delay);
  animation-name: nutShake;
  animation-duration: var(--animate-duration);
  animation-timing-function: ease-in-out;
  animation-delay: var(--animate-delay);
}
@-webkit-keyframes rotation {
  0% {
    -webkit-transform: rotate(0deg);
  }
  to {
    -webkit-transform: rotate(360deg);
  }
}
@keyframes rotation {
  0% {
    -webkit-transform: rotate(0deg);
  }
  to {
    -webkit-transform: rotate(360deg);
  }
}
@-webkit-keyframes nutJump {
  to {
    -webkit-transform: scale3d(0.8, 1, 0.9) translateY(-10rpx);
    transform: scale3d(0.8, 1, 0.9) translateY(-10rpx);
  }
}
@keyframes nutJump {
  to {
    -webkit-transform: scale3d(0.8, 1, 0.9) translateY(-10rpx);
    transform: scale3d(0.8, 1, 0.9) translateY(-10rpx);
  }
}
@-webkit-keyframes nutJumpOne {
  50% {
    -webkit-transform: scale3d(0.8, 1, 0.9) translateY(-10rpx);
    transform: scale3d(0.8, 1, 0.9) translateY(-10rpx);
  }
  to {
    -webkit-transform: scaleZ(1) translateY(0);
    transform: scaleZ(1) translateY(0);
  }
}
@keyframes nutJumpOne {
  50% {
    -webkit-transform: scale3d(0.8, 1, 0.9) translateY(-10rpx);
    transform: scale3d(0.8, 1, 0.9) translateY(-10rpx);
  }
  to {
    -webkit-transform: scaleZ(1) translateY(0);
    transform: scaleZ(1) translateY(0);
  }
}
@-webkit-keyframes nutBlink {
  0% {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes nutBlink {
  0% {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@-webkit-keyframes nutBreathe {
  0%,
  to {
    -webkit-transform: scale(1);
    transform: scale(1);
  }
  50% {
    -webkit-transform: scale(1.2);
    transform: scale(1.2);
  }
}
@keyframes nutBreathe {
  0%,
  to {
    -webkit-transform: scale(1);
    transform: scale(1);
  }
  50% {
    -webkit-transform: scale(1.2);
    transform: scale(1.2);
  }
}
@-webkit-keyframes nutFlash {
  0%,
  50%,
  to {
    opacity: 1;
  }
  25%,
  75% {
    opacity: 0;
  }
}
@keyframes nutFlash {
  0%,
  50%,
  to {
    opacity: 1;
  }
  25%,
  75% {
    opacity: 0;
  }
}
@-webkit-keyframes nutBounce {
  0%,
  20%,
  53%,
  to {
    -webkit-animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
  }
  40%,
  43% {
    -webkit-animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    -webkit-transform: translate3d(0, -30rpx, 0) scaleY(1.1);
    transform: translate3d(0, -30rpx, 0) scaleY(1.1);
  }
  70% {
    -webkit-animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    -webkit-transform: translate3d(0, -15rpx, 0) scaleY(1.05);
    transform: translate3d(0, -15rpx, 0) scaleY(1.05);
  }
  80% {
    transition-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    -webkit-transform: translateZ(0) scaleY(0.95);
    transform: translateZ(0) scaleY(0.95);
  }
  90% {
    -webkit-transform: translate3d(0, -4rpx, 0) scaleY(1.02);
    transform: translate3d(0, -4rpx, 0) scaleY(1.02);
  }
}
@keyframes nutBounce {
  0%,
  20%,
  53%,
  to {
    -webkit-animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
  }
  40%,
  43% {
    -webkit-animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    -webkit-transform: translate3d(0, -30rpx, 0) scaleY(1.1);
    transform: translate3d(0, -30rpx, 0) scaleY(1.1);
  }
  70% {
    -webkit-animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    -webkit-transform: translate3d(0, -15rpx, 0) scaleY(1.05);
    transform: translate3d(0, -15rpx, 0) scaleY(1.05);
  }
  80% {
    transition-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    -webkit-transform: translateZ(0) scaleY(0.95);
    transform: translateZ(0) scaleY(0.95);
  }
  90% {
    -webkit-transform: translate3d(0, -4rpx, 0) scaleY(1.02);
    transform: translate3d(0, -4rpx, 0) scaleY(1.02);
  }
}
@-webkit-keyframes nutShake {
  0% {
    -webkit-transform: translate(0);
    transform: translate(0);
  }
  6.5% {
    -webkit-transform: translate(-6rpx) rotateY(-9deg);
    transform: translate(-6rpx) rotateY(-9deg);
  }
  18.5% {
    -webkit-transform: translate(5rpx) rotateY(7deg);
    transform: translate(5rpx) rotateY(7deg);
  }
  31.5% {
    -webkit-transform: translate(-3rpx) rotateY(-5deg);
    transform: translate(-3rpx) rotateY(-5deg);
  }
  43.5% {
    -webkit-transform: translate(2rpx) rotateY(3deg);
    transform: translate(2rpx) rotateY(3deg);
  }
  50% {
    -webkit-transform: translate(0);
    transform: translate(0);
  }
}
@keyframes nutShake {
  0% {
    -webkit-transform: translate(0);
    transform: translate(0);
  }
  6.5% {
    -webkit-transform: translate(-6rpx) rotateY(-9deg);
    transform: translate(-6rpx) rotateY(-9deg);
  }
  18.5% {
    -webkit-transform: translate(5rpx) rotateY(7deg);
    transform: translate(5rpx) rotateY(7deg);
  }
  31.5% {
    -webkit-transform: translate(-3rpx) rotateY(-5deg);
    transform: translate(-3rpx) rotateY(-5deg);
  }
  43.5% {
    -webkit-transform: translate(2rpx) rotateY(3deg);
    transform: translate(2rpx) rotateY(3deg);
  }
  50% {
    -webkit-transform: translate(0);
    transform: translate(0);
  }
}
```

### pages/index/index.wxss

```css
.tw-page-style-watch-anchor {
  color: inherit;
}
```

### sub-independent/pages/index.wxss

```css
view,
text,
::after,
::before {
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  border: 0 solid;
  --tw-content: '';
}
:host,
page,
.tw-root,
wx-root-portal-content {
  --color-gray-200: #e5e7eb;
  --color-gray-400: #9ca3af;
  --font-sans:
    ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
    'Noto Color Emoji';
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  --default-font-family: var(--font-sans);
  --default-mono-font-family: var(--font-mono);
}
.before_ccontent-_b_aindependent_subpackage_taro-vite-react-tailwindcss-v4_a_B::before {
  --tw-content: 'independent subpackage taro-vite-react-tailwindcss-v4';
  content: var(--tw-content);
}
.bg-independent-subpackage-marker {
  background-color: #dc2626;
}
```

### sub-normal/pages/index.wxss

```css
view,
text,
::after,
::before {
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  border: 0 solid;
  --tw-content: '';
}
:host,
page,
.tw-root,
wx-root-portal-content {
  --color-gray-200: #e5e7eb;
  --color-gray-400: #9ca3af;
  --font-sans:
    ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
    'Noto Color Emoji';
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  --default-font-family: var(--font-sans);
  --default-mono-font-family: var(--font-mono);
}
.before_ccontent-_b_anormal_subpackage_taro-vite-react-tailwindcss-v4_a_B::before {
  --tw-content: 'normal subpackage taro-vite-react-tailwindcss-v4';
  content: var(--tw-content);
}
.bg-normal-subpackage-marker {
  background-color: #2563eb;
}
```
