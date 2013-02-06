#include "Base/package.h"
#include "Math/package.h"

#include "CallcastEvent.h"
#include "CallcastManager.h"

#include "AppFlow.h"

#include "AppDelegate.h"

AppFlow gAppFlow;
extern AppDelegate* gAppDelegateInstance;
extern UIWebView*   gWebViewInstance;

AppFlow::AppFlow()
:   mNickname("nick"),
    mRoomname("room")
{
    ConstructMachine();
}
AppFlow::~AppFlow()
{
    DestructMachine();
}

void AppFlow::startEntry()
{
    CallcastManager::getInstance()->attach(this);
}

void AppFlow::startExit() { }

void AppFlow::endEntry() { }
void AppFlow::endExit() { }

void AppFlow::showWebLoadingViewEntry()
{
    [gAppDelegateInstance showWebLoadingView];
}
void AppFlow::showWebLoadingViewExit()
{
    [gAppDelegateInstance hideWebLoadingView];
}

void AppFlow::showLoginViewEntry()
{
    [gAppDelegateInstance showLoginView];
}

void AppFlow::showLoginViewExit()
{
    [gAppDelegateInstance hideLoginView];

    [gWebViewInstance stringByEvaluatingJavaScriptFromString: [NSString stringWithFormat:@"startCallcast('%s','%s')", mNickname.c_str(), mRoomname.c_str()]];
}

void AppFlow::showBlankSpotEntry()
{
    [gAppDelegateInstance showBlankSpot];
}

void AppFlow::showBlankSpotExit()
{
    [gAppDelegateInstance hideBlankSpot];
}

void AppFlow::showChatSpotEntry()
{
    [gAppDelegateInstance showChatSpot];
}

void AppFlow::showChatSpotExit()
{
    [gAppDelegateInstance hideChatSpot];
}

void AppFlow::showNicknameInUseEntry()
{
    [gAppDelegateInstance showNicknameInUse];
}

void AppFlow::showNicknameInUseExit()
{
    [gAppDelegateInstance hideNicknameInUse];
}

void AppFlow::showLoggingInViewEntry()
{
    [gAppDelegateInstance showLoggingInView];
}

void AppFlow::showLoggingInViewExit()
{
    [gAppDelegateInstance hideLoggingInView];
}

void AppFlow::showWhiteboardSpotEntry()
{
    [gAppDelegateInstance showWhiteboardSpot];
}

void AppFlow::showWhiteboardSpotExit()
{
    [gAppDelegateInstance hideWhiteboardSpot];
}

void AppFlow::update(const AppFlowMessage& msg)
{
    process(msg.event);
}

void AppFlow::update(const CallcastEvent& msg)
{
    switch (msg.mEvent)
    {
        case CallcastEvent::kWebViewLoaded:     process(AppFlow::kWebViewLoaded); break;
        case CallcastEvent::kSubmitLogin:
            mNickname = msg.mNickname;
            mRoomname = msg.mRoomname;
            process(AppFlow::kLoginPressed);
            break;
        case CallcastEvent::kLoggedIn:          process(AppFlow::kLoginSuccess); break;
        case CallcastEvent::kOnNicknameInUse:   process(AppFlow::kNickInUse); break;
        case CallcastEvent::kOkayButton:        process(AppFlow::kOkay); break;
        default: break;
    }
}
