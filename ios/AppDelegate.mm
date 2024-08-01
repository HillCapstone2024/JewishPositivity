#import <UIKit/UIKit.h>
#import <React/RCTBridge.h>
#import <React/RCTRootView.h>
#import <React/RCTBundleURLProvider.h>

@interface AppDelegate : UIResponder <UIApplicationDelegate>
@property (strong, nonatomic) UIWindow *window;
@end

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
    RCTBridge *bridge = [[RCTBridge alloc] initWithBundleURL:[self jsBundleURL]
                                              moduleProvider:nil
                                               launchOptions:launchOptions];
    RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                     moduleName:@"JewishPositivity"
                                              initialProperties:nil];
    self.window.rootViewController = [[UIViewController alloc] init];
    self.window.rootViewController.view = rootView;
    [self.window makeKeyAndVisible];
    return YES;
}

- (NSURL *)jsBundleURL {
    #ifdef DEBUG
        return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
    #else
        return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
    #endif
}

@end#import <UIKit/UIKit.h>
#import <React/RCTBridge.h>
#import <React/RCTRootView.h>
#import <React/RCTBundleURLProvider.h>

@interface AppDelegate : UIResponder <UIApplicationDelegate>
@property (strong, nonatomic) UIWindow *window;
@end

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
    RCTBridge *bridge = [[RCTBridge alloc] initWithBundleURL:[self jsBundleURL]
                                              moduleProvider:nil
                                               launchOptions:launchOptions];
    RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                     moduleName:@"YourProjectName"
                                              initialProperties:nil];
    self.window.rootViewController = [[UIViewController alloc] init];
    self.window.rootViewController.view = rootView;
    [self.window makeKeyAndVisible];
    return YES;
}

- (NSURL *)jsBundleURL {
    #ifdef DEBUG
        return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
    #else
        return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
    #endif
}

@end