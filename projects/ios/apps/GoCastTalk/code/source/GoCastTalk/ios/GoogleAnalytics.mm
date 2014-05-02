#include "Base/package.h"
#include "GoogleAnalytics.h"

#import "GAITracker.h"
#import "GAI.h"
#import "GAIFields.h"
#import "GAIDictionaryBuilder.h"

#if ADHOC
#define kUACode @"UA-50594978-2"
#elif DEBUG
#define kUACode @"UA-50594978-3"
#else
#define kUACode @"UA-50594978-1"
#endif

GoogleAnalytics::GoogleAnalytics()
{
    [[[GAI sharedInstance] logger] setLogLevel:kGAILogLevelWarning];
    [GAI sharedInstance].trackUncaughtExceptions = YES;
    [GAI sharedInstance].dispatchInterval = 30;

    id<GAITracker> tracker = [[GAI sharedInstance] trackerWithTrackingId:kUACode];

    NSString *version = [[NSBundle mainBundle] objectForInfoDictionaryKey:(NSString *)kCFBundleVersionKey];
    [tracker set:kGAIAppVersion value:version];
    [tracker set:kGAISampleRate value:@"100.0"]; // sampling rate of 100%

    [[GAI sharedInstance] setOptOut:NO];
}

void GoogleAnalytics::trackScreenEntry(const std::string& screenName)
{
    id<GAITracker> tracker = [[GAI sharedInstance] defaultTracker];
    [tracker set:kGAIScreenName value:[NSString stringWithUTF8String:screenName.c_str()]];
    [tracker send:[[GAIDictionaryBuilder createAppView] build]];
}

void GoogleAnalytics::trackAction(const std::string& screenName, const std::string& category, const std::string& action, const std::string& label)
{
    id<GAITracker> tracker = [[GAI sharedInstance] defaultTracker];

    [tracker set:kGAIScreenName value:[NSString stringWithUTF8String:screenName.c_str()]];
    [tracker send:[[GAIDictionaryBuilder createEventWithCategory:[NSString stringWithUTF8String:category.c_str()]
                                                          action:[NSString stringWithUTF8String:action.c_str()]
                                                           label:[NSString stringWithUTF8String:label.c_str()]
                                                           value:nil] build]];
    [tracker set:kGAIScreenName value:nil];
}

void GoogleAnalytics::trackEvent(const std::string& screenName, const std::string& label)
{
    trackAction(screenName, "Event", "Trigger", label);
}

void GoogleAnalytics::trackButton(const std::string& screenName, const std::string& label)
{
    trackAction(screenName, "Button", "Press", label);
}

void GoogleAnalytics::trackAlert(const std::string& screenName, const std::string& label)
{
    trackAction(screenName, "Alert", "Show", label);
}

void GoogleAnalytics::trackAlertOkay(const std::string& screenName, const std::string& label)
{
    trackAction(screenName, "Alert", "Pressed-OK", label);
}

void GoogleAnalytics::trackConfirm(const std::string& screenName, const std::string& label)
{
    trackAction(screenName, "Confirm", "Show", label);
}

void GoogleAnalytics::trackConfirmYes(const std::string& screenName, const std::string& label)
{
    trackAction(screenName, "Confirm", "Pressed-YES", label);
}

void GoogleAnalytics::trackConfirmNo(const std::string& screenName, const std::string& label)
{
    trackAction(screenName, "Confirm", "Pressed-NO", label);
}
