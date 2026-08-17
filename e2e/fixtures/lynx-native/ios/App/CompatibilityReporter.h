#import <Foundation/Foundation.h>
#import <Lynx/LynxModule.h>

@class LynxView;

@interface CompatibilityReporter : NSObject <LynxModule>
+ (void)setLynxView:(LynxView *)lynxView;
@end
