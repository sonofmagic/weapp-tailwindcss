#import "ViewController.h"
#import "CompatibilityReporter.h"
#import <Lynx/LynxConfig.h>
#import <Lynx/LynxEnv.h>
#import <Lynx/LynxView.h>

@implementation ViewController
- (void)viewDidLoad {
  [super viewDidLoad];
  LynxConfig *config = [[LynxConfig alloc] initWithProvider:nil];
  [config registerModule:CompatibilityReporter.class];
  [[LynxEnv sharedInstance] prepareConfig:config];
  LynxView *lynxView = [[LynxView alloc] initWithBuilderBlock:^(LynxViewBuilder *builder) {
    builder.config = config;
    builder.screenSize = UIScreen.mainScreen.bounds.size;
  }];
  [CompatibilityReporter setLynxView:lynxView];
  lynxView.frame = self.view.bounds;
  lynxView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
  lynxView.preferredLayoutWidth = self.view.bounds.size.width;
  lynxView.preferredLayoutHeight = self.view.bounds.size.height;
  lynxView.layoutWidthMode = LynxViewSizeModeExact;
  lynxView.layoutHeightMode = LynxViewSizeModeExact;
  [self.view addSubview:lynxView];
  NSString *path = [NSBundle.mainBundle pathForResource:@"main.lynx" ofType:@"bundle"];
  NSData *data = [NSData dataWithContentsOfFile:path];
  [lynxView loadTemplate:data withURL:@"assets://main.lynx.bundle" initData:nil];
  [lynxView triggerLayout];
}
@end
