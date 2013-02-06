#include "Base/package.h"
#include "Math/package.h"

#include "CallcastEvent.h"
#include "CallcastManager.h"

#include "CarouselApp.h"

#include "AppDelegate.h"

CarouselApp gCarouselApp;
extern AppDelegate* gAppDelegateInstance;
extern UIWebView*   gWebViewInstance;

CarouselApp::CarouselApp()
:   mNickname("nick"),
    mRoomname("room")
{
    ConstructMachine();
}
CarouselApp::~CarouselApp()
{
    DestructMachine();
}

void CarouselApp::startEntry()
{
    CallcastManager::getInstance()->attach(this);
}

void CarouselApp::startExit() { }

void CarouselApp::endEntry() { }
void CarouselApp::endExit() { }

void CarouselApp::showWebLoadingViewEntry()
{
    [gAppDelegateInstance showWebLoadingView];
}
void CarouselApp::showWebLoadingViewExit()
{
    [gAppDelegateInstance hideWebLoadingView];
}

void CarouselApp::showLoginViewEntry()
{
    [gAppDelegateInstance showLoginView];
}

void CarouselApp::showLoginViewExit()
{
    [gAppDelegateInstance hideLoginView];

    [gWebViewInstance stringByEvaluatingJavaScriptFromString: [NSString stringWithFormat:@"startCallcast('%s','%s')", mNickname.c_str(), mRoomname.c_str()]];
}

void CarouselApp::showBlankSpotEntry()
{
    [gAppDelegateInstance showBlankSpot];
}

void CarouselApp::showBlankSpotExit()
{
    [gAppDelegateInstance hideBlankSpot];
}

void CarouselApp::showChatSpotEntry()
{
    [gAppDelegateInstance showChatSpot];
}

void CarouselApp::showChatSpotExit()
{
    [gAppDelegateInstance hideChatSpot];
}

void CarouselApp::showNicknameInUseEntry()
{
    [gAppDelegateInstance showNicknameInUse];
}

void CarouselApp::showNicknameInUseExit()
{
    [gAppDelegateInstance hideNicknameInUse];
}

void CarouselApp::showLoggingInViewEntry()
{
    [gAppDelegateInstance showLoggingInView];
}

void CarouselApp::showLoggingInViewExit()
{
    [gAppDelegateInstance hideLoggingInView];
}

void CarouselApp::showWhiteboardSpotEntry()
{
    [gAppDelegateInstance showWhiteboardSpot];
}

void CarouselApp::showWhiteboardSpotExit()
{
    [gAppDelegateInstance hideWhiteboardSpot];
}

void CarouselApp::update(const CarouselAppMessage& msg)
{
    process(msg.event);
}

void CarouselApp::update(const CallcastEvent& msg)
{
    switch (msg.mEvent)
    {
        case CallcastEvent::kWebViewLoaded:     process(CarouselApp::kWebViewLoaded); break;
        case CallcastEvent::kSubmitLogin:
            mNickname = msg.mNickname;
            mRoomname = msg.mRoomname;
            process(CarouselApp::kLoginPressed);
            break;
        case CallcastEvent::kLoggedIn:          process(CarouselApp::kLoginSuccess); break;
        case CallcastEvent::kOnNicknameInUse:   process(CarouselApp::kNickInUse); break;
        case CallcastEvent::kOkayButton:        process(CarouselApp::kOkay); break;
        default: break;
    }
}
