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
    mRoomname("room"),
    mSpotFinger(0)
{
    ConstructMachine();
}
CarouselApp::~CarouselApp()
{
    DestructMachine();
}

#pragma mark -

void CarouselApp::onAddSpot(const std::string& newType, const int32_t& newID)
{
    if (newType.compare("whiteBoard") == 0)
    {
        bool wasEmpty = mSpots.empty();

        mSpots.push_back(newID);

        if (wasEmpty)
        {
            process(kShowWhiteboard);
        }
    }
}

void CarouselApp::onRemoveSpot(const int32_t& newID)
{
    std::list<int32_t>::iterator iter = mSpots.begin();
    uint32_t count = 0;

    while(iter != mSpots.end())
    {
        if (*iter == newID) break;
        count++;
        iter++;
    }

    if (iter != mSpots.end())
    {
        mSpots.erase(iter);
    }

    if (mSpots.empty())
    {
        process(kShowBlank);
    }
    else if (mSpotFinger == count)
    {
        process(kShowWhiteboard);
    }
}

void onPrevButton();
void onNextButton();

#pragma mark -

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
        case CallcastEvent::kAddSpot: onAddSpot(msg.mSpotType, msg.mSpotID); break;
        case CallcastEvent::kRemoveSpot: onRemoveSpot(msg.mSpotID); break;

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
